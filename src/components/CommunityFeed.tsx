import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { createPortal } from 'react-dom';
import { ArrowLeft, Camera, MessageCircle, Trophy, Info, Flame, Send, X, Loader2 } from 'lucide-react';

interface Post {
  id: string;
  userId: string; // 추가
  userName: string;
  userAvatar: string;
  imageUrl: string;
  timestamp: string;
}

export default function CommunityFeed() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hasPostedToday, setHasPostedToday] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartRef = useRef(0);
  const touchEndRef = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'bounce-right' | null>(null);

  // 공유 모달 상태
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [shareTargetPost, setShareTargetPost] = useState<Post | null>(null);

  // 토스트 메시지 상태
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const [posts, setPosts] = useState<Post[]>([]);
  const [communityInfo, setCommunityInfo] = useState({ name: '', emoji: '', certDays: [] as string[] });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const myUserId = localStorage.getItem('userId') || localStorage.getItem('user_id'); // 내 ID 가져오기
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // 커뮤니티 정보 가져오기
        const communityRes = await fetch(`/api/communities/${id}/`, { headers });
        if (communityRes.ok) {
          const data = await communityRes.json();
          let parsedDays: string[] = [];
          if (Array.isArray(data.cert_days)) {
            parsedDays = data.cert_days;
          } else if (typeof data.cert_days === 'string') {
            parsedDays = data.cert_days.replace(/[\[\]"']/g, '').split(',').map((s: string) => s.trim());
          }

          setCommunityInfo(prev => ({
            ...prev,
            name: data.com_name,
            emoji: data.icon_url || '💪',
            certDays: parsedDays,
          }));
        }

        // 2. 멤버 목록 가져오기 (닉네임 매핑 & 전체 멤버 수 확인용)
        // 삭제되었던 로직 복구
        let memberMap: Record<string, { name: string, avatar: string }> = {};
        const membersRes = await fetch(`/api/members/get_members/?com_uuid=${id}`, { headers });

        if (membersRes.ok) {
          const membersData = await membersRes.json();
          console.log('--- Fetched Members Data ---', membersData); // [디버깅] API 응답 전체 확인

          setCommunityInfo(prev => ({ ...prev, totalMembers: membersData.length }));

          membersData.forEach((m: any) => {
            // 백엔드 필드명이 불확실하므로 가능한 모든 필드 체크
            const displayName = m.nick_name || m.nickname || m.user_name || m.userName || m.user_details?.user_name || m.user_details?.username || '알 수 없음';
            const displayAvatar = m.profile_img_url || m.user_profile_img_url || m.profile_url || m.user_details?.profile_img_url || '👤';

            console.log(`Member ${m.user_id}: Name=${displayName}, Avatar=${displayAvatar}`); // [디버깅] 매핑 결과 확인

            memberMap[m.user_id] = {
              name: displayName,
              avatar: displayAvatar
            };
          });
        }

        // 오늘의 포스트 가져오기
        const postsRes = await fetch(`/api/posts/?com_uuid=${id}`, { headers });
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          const mappedPosts: Post[] = postsData.map((post: any) => {
            const createdAt = new Date(post.created_at);
            const now = new Date();
            const diffMs = now.getTime() - createdAt.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            let timestamp = '';
            if (diffMins < 60) {
              timestamp = `${diffMins}분 전`;
            } else {
              const diffHours = Math.floor(diffMins / 60);
              timestamp = `${diffHours}시간 전`;
            }

            const memberInfo = memberMap[post.user_id] || { name: '알 수 없음', avatar: '👤' };

            return {
              id: post.post_id,
              userId: post.user_id, // API에서 user_id 매핑
              userName: memberInfo.name,
              userAvatar: memberInfo.avatar,
              imageUrl: post.image_url,
              timestamp
            };
          });
          setPosts(mappedPosts);

          // [핵심 수정] 서버 데이터를 기준으로 인증 여부 판단 (로컬 스토리지 무시)
          // 내 ID로 작성된 포스트가 목록에 있는지 확인
          if (myUserId) {
            const myPost = mappedPosts.find(p => p.userId === myUserId);
            if (myPost) {
              setHasPostedToday(true);
            } else {
              setHasPostedToday(false);
              // 로컬 스토리지의 잘못된 데이터 삭제 (선택 사항)
              localStorage.removeItem(`hasPostedToday_${id}`);
            }
          } else {
            // 비로그인 상태면 false
            setHasPostedToday(false);
          }
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // 페이지 진입 시 스크롤 잠금 (주소창 고정 효과)
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none'; // iOS 바운스 방지

    return () => {
      document.body.style.overflow = 'auto';
      document.body.style.overscrollBehavior = 'auto';
    };
  }, []);

  // 기존 로컬스토리지 체크 로직(useEfect) 제거됨 -> API 데이터 기반으로 통합됨

  const [isDragging, setIsDragging] = useState(false);

  // Initialize both start and end to prevent "Tap = Swipe" bug
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.targetTouches[0].clientX : (e as React.MouseEvent).clientX;
    touchStartRef.current = clientX;
    touchEndRef.current = clientX; // Initialize end as start
    setSwipeDirection(null);
    if (!('touches' in e)) setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!('touches' in e) && !isDragging) return;
    const clientX = 'touches' in e ? e.targetTouches[0].clientX : (e as React.MouseEvent).clientX;
    touchEndRef.current = clientX;
    setDragOffset(clientX - touchStartRef.current);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    // Safety check: if drag never happened (start == end), it's a tap
    // Note: Use refs to check distance directly
    const start = touchStartRef.current;
    const end = touchEndRef.current;

    if (Math.abs(start - end) < 5) {
      setDragOffset(0);
      return;
    }

    const distance = start - end;
    const isLeftSwipe = distance > 50; // Threshold
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setSwipeDirection('left');
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % posts.length);
        setSwipeDirection(null);
      }, 300);
    } else if (isRightSwipe) {
      if (hasPostedToday) {
        setShareTargetPost(posts[currentIndex]);
        setIsShareModalOpen(true);
      } else {
        setSwipeDirection('right');
        setTimeout(() => {
          setSwipeDirection(null);
          setCurrentIndex((prev) => (prev + 1) % posts.length);
        }, 300);
      }
    }

    setDragOffset(0);
    // Reset refs
    touchStartRef.current = 0;
    touchEndRef.current = 0;
  };

  const getVisibleCards = () => {
    const cards = [];
    for (let i = 0; i < Math.min(3, posts.length); i++) {
      const index = (currentIndex + i) % posts.length;
      cards.push({ ...posts[index], stackIndex: i });
    }
    return cards;
  };



  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    // fixed inset-0으로 화면을 꽉 채우고, touch-action-none으로 브라우저 제스처 최소화
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col overflow-hidden touch-none">

      {/* 헤더 */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-100 flex-none z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            {/* Image rendering fix */}
            {(() => {
              const icon = communityInfo.emoji;
              const cleanIcon = icon?.trim() || '';
              const isImage = cleanIcon.startsWith('http') || cleanIcon.startsWith('/') || cleanIcon.includes('data:');

              if (isImage) {
                return <img src={cleanIcon} alt="icon" className="w-8 h-8 rounded-full object-cover" />;
              }
              // 텍스트가 너무 길면(Base64 깨짐 등) 이모지 대신 기본값 출력
              return <span className="text-2xl">{(!icon || icon.length > 20) ? '💪' : icon}</span>;
            })()}
            <span className="font-bold text-gray-900">{communityInfo.name || '커뮤니티'}</span>
          </div>
          <button onClick={() => navigate(`/community/${id}/profile`)} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 py-3 min-h-0 gap-3">

        {/* 인증 버튼 */}
        {(() => {
          const weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
          const todayStr = weekdays[new Date().getDay()];
          const isCertDay = communityInfo.certDays.map(d => d.toLowerCase().trim()).includes(todayStr);

          return (
            <div
              className="flex-none rounded-2xl p-4 text-white shadow-lg"
              style={{ background: isCertDay ? 'linear-gradient(to right, #f97316, #ef4444)' : 'linear-gradient(to right, #3b82f6, #6366f1)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-bold text-lg">
                    {hasPostedToday ? '운동 인증 완료!' : isCertDay ? '오늘의 운동 인증' : '오늘은 인증 요일이 아니에요'}
                  </p>
                  <p className="text-sm text-white/90">
                    {hasPostedToday ? '오늘도 완료! 👏' : isCertDay ? '친구들 사진 보기' : '다음 인증일을 기다려 주세요'}
                  </p>
                </div>
                <Camera className="w-8 h-8" />
              </div>
              {!hasPostedToday && isCertDay && (
                <button
                  onClick={() => navigate(`/community/${id}/upload`)}
                  className="w-full bg-white text-orange-600 rounded-xl py-3 font-bold active:scale-95 transition-transform"
                >
                  지금 인증하기
                </button>
              )}
            </div>
          );
        })()}

        {/* 카드 스택 영역 */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          <div className="flex-none flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">오늘의 인증</h3>
            <div className="text-sm text-gray-500">
              {posts.length > 0 ? `${currentIndex + 1} / ${posts.length}` : '0개'}
            </div>
          </div>

          <div className="flex-1 relative w-full">
            {posts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center bg-gray-100 rounded-3xl">
                <Camera className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">오늘 올라온 인증이 없습니다</p>
                <p className="text-gray-400 text-sm mt-1">첫 번째 인증을 올려보세요!</p>
              </div>
            ) : (
              getVisibleCards().map((post, idx) => {
                const isTop = idx === 0;

                return (
                  <div
                    key={`${post.id}-${idx}`}
                    className={`absolute inset-0 w-full h-full transition-all duration-300 ${isTop ? 'z-30' : idx === 1 ? 'z-20' : 'z-10'
                      } ${swipeDirection === 'left' && isTop
                        ? '-translate-x-full rotate-[-20deg] opacity-0'
                        : swipeDirection === 'right' && isTop
                          ? 'translate-x-full rotate-[20deg] opacity-0'
                          : ''
                      }`}
                    style={{
                      width: '100%',
                      height: '100%',
                      // 최상단 카드는 드래그/스와이프에 따라 움직임
                      transform: isTop
                        ? (swipeDirection
                          ? '' // 스와이프 애니메이션 중일 때는 클래스(animate)가 제어
                          : `translateX(${dragOffset}px) rotate(${dragOffset * 0.1}deg)` // 드래그 중일 때는 실시간 좌표
                        )
                        : 'none', // 나머지 카드는 변형 없음
                      transformOrigin: 'bottom center',
                      transition: dragOffset !== 0 ? 'none' : 'all 0.3s ease-out' // 드래그 중에는 딜레이 없음, 놓으면 부드럽게 복귀
                    }}
                    onTouchStart={isTop ? handleTouchStart : undefined}
                    onTouchMove={isTop ? handleTouchMove : undefined}
                    onTouchEnd={isTop ? handleTouchEnd : undefined}
                    onMouseDown={isTop ? handleTouchStart : undefined}
                    onMouseMove={isTop ? handleTouchMove : undefined}
                    onMouseUp={isTop ? handleTouchEnd : undefined}
                    onMouseLeave={isTop ? handleTouchEnd : undefined}
                  >
                    {/* [수정됨] 배경을 검은색으로, 이미지를 contain으로 변경 */}
                    <div className={`rounded-3xl overflow-hidden shadow-xl h-full flex flex-col border border-gray-100 relative ${!hasPostedToday ? 'bg-gray-200' : 'bg-black'}`}>
                      <img
                        // src={`${post.imageUrl}?t=${new Date(post.timestamp).getTime() || idx}`}
                        src={`${post.imageUrl}?t=${post.id}`}
                        alt={post.userName}
                        className={`w-full h-full ${!hasPostedToday ? 'object-cover blur-xl opacity-80' : 'object-contain'}`}
                        onError={(e) => {
                          console.error('Image load failed:', post.imageUrl);
                          e.currentTarget.src = 'https://via.placeholder.com/300?text=No+Image';
                        }}
                      />

                      {!hasPostedToday && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                          <div className="text-center text-white">
                            <Camera className="w-8 h-8 mx-auto mb-1 opacity-80" />
                            <p className="text-xs font-medium">인증 후 확인</p>
                          </div>
                        </div>
                      )}

                      {hasPostedToday && (
                        <>
                          <div className="absolute top-4 left-4 bg-black/60 rounded-2xl px-3 py-2 z-20">
                            <div className="flex items-center gap-2 text-white">
                              {post.userAvatar.startsWith('http') || post.userAvatar.startsWith('/') ? (
                                <img
                                  src={post.userAvatar}
                                  alt="Profile"
                                  className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                                />
                              ) : (
                                <span className="text-2xl">{post.userAvatar}</span>
                              )}
                              <div>
                                <p className="font-bold text-sm">{post.userName}</p>
                                <p className="text-xs text-white/80">{post.timestamp}</p>
                              </div>
                            </div>
                          </div>

                          {isTop && (
                            <>
                              <div className="absolute bottom-4 left-4 bg-black/60 rounded-full p-3 z-20">
                                <ArrowLeft className="w-5 h-5 text-white" />
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowToast(true);
                                }}
                                className="absolute bottom-4 right-4 bg-purple-600 text-white rounded-full p-3 active:scale-95 transition-transform z-20 shadow-lg"
                              >
                                <Send className="w-5 h-5 text-white" />
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              }))}
          </div>
        </div>

        {/* 공유 모달 */}
        {isShareModalOpen && shareTargetPost && (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsShareModalOpen(false)}
          >
            <div
              className="bg-white rounded-3xl w-full max-w-[320px] overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >

              {/* [수정됨] 모달 이미지도 잘리지 않게 bg-black & object-contain 적용 */}
              <div className="relative aspect-square w-full bg-black">
                <img
                  src={shareTargetPost.imageUrl}
                  alt="thumbnail"
                  className="w-full h-full object-contain"
                />

                {/* 닫기 버튼 */}
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* 좌상단 유저 정보 오버레이 */}
                <div className="absolute top-4 left-4 bg-black/60 rounded-2xl px-3 py-2 flex items-center gap-2">
                  <span className="text-xl">{shareTargetPost.userAvatar}</span>
                  <span className="font-bold text-sm text-white">{shareTargetPost.userName}</span>
                </div>


              </div>

              {/* 텍스트 입력 영역 & 전송 버튼 */}
              <div className="p-3 bg-white border-t border-gray-100">
                <div className="flex items-end gap-2">
                  <textarea
                    value={shareMessage}
                    onChange={(e) => setShareMessage(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                    className="flex-1 bg-gray-50 rounded-2xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-medium max-h-24 min-h-[44px]"
                    style={{ height: '44px' }}
                  />
                  <button
                    onClick={() => {
                      setIsShareModalOpen(false);
                      setShareMessage('');
                      setShowToast(true);
                    }}
                    className="bg-purple-600 text-white rounded-full p-3 shadow-md active:scale-95 transition-transform flex-shrink-0 mb-0.5"
                    style={{ backgroundColor: '#7c3aed' }}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="flex-none grid grid-cols-3 gap-3 pt-2">
          <button onClick={() => navigate(`/community/${id}/chat`)} className="bg-white rounded-2xl py-3 shadow-md border border-gray-100 flex flex-col items-center gap-1 active:scale-95 transition-transform">
            <MessageCircle className="w-5 h-5 text-indigo-600" />
            <span className="text-xs font-semibold text-gray-700">채팅</span>
          </button>
          <button onClick={() => navigate(`/community/${id}/leaderboard`)} className="bg-white rounded-2xl py-3 shadow-md border border-gray-100 flex flex-col items-center gap-1 active:scale-95 transition-transform">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-xs font-semibold text-gray-700">순위</span>
          </button>
          <button onClick={() => navigate(`/community/${id}/shame`)} className="bg-white rounded-2xl py-3 shadow-md border border-gray-100 flex flex-col items-center gap-1 active:scale-95 transition-transform">
            <Flame className="w-5 h-5 text-red-500" />
            <span className="text-xs font-semibold text-gray-700">수치</span>
          </button>
        </div>
        {/* 토스트 메시지 */}
        {showToast && createPortal(
          <div className="fixed inset-0 flex items-start justify-center z-[9999] pointer-events-none pt-20">
            <div
              className="px-6 py-3 rounded-full shadow-xl font-bold text-sm flex items-center gap-2 text-white animate-in zoom-in-95 fade-in duration-300"
              style={{ backgroundColor: '#7c3aed' }} // Force Purple-600
            >
              <span className="text-lg">✅</span>
              공유 완료!
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}