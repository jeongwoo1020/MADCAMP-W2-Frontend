import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { createPortal } from 'react-dom';
import { ArrowLeft, Camera, MessageCircle, Trophy, Info, Flame, Send, X } from 'lucide-react';

interface Post {
  id: string;
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
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [dragOffset, setDragOffset] = useState(0); // 드래그 거리 상태 추가
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'bounce-right' | null>(null);

  // 공유 모달 상태
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [shareTargetPost, setShareTargetPost] = useState<Post | null>(null);

  // 토스트 메시지 상태
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const [posts] = useState<Post[]>([
    {
      id: '1',
      userName: '김철수',
      userAvatar: '👨',
      imageUrl: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=800',
      timestamp: '5분 전'
    },
    {
      id: '2',
      userName: '박영희',
      userAvatar: '👩',
      imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
      timestamp: '12분 전'
    },
    {
      id: '3',
      userName: '이민수',
      userAvatar: '🧑',
      imageUrl: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
      timestamp: '23분 전'
    },
    {
      id: '4',
      userName: '최지은',
      userAvatar: '👧',
      imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
      timestamp: '35분 전'
    }
  ]);

  const communityData = {
    '1': { name: '농구', emoji: '🏀', topUser: '김철수', topCount: 24 },
    '2': { name: '수영', emoji: '🏊', topUser: '박영희', topCount: 18 },
    '3': { name: '러닝크루', emoji: '🏃', topUser: '이민수', topCount: 31 },
    '4': { name: '헬스', emoji: '💪', topUser: '최지은', topCount: 22 }
  };

  const community = communityData[id as keyof typeof communityData] || communityData['1'];

  // 페이지 진입 시 스크롤 잠금 (주소창 고정 효과)
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none'; // iOS 바운스 방지

    return () => {
      document.body.style.overflow = 'auto';
      document.body.style.overscrollBehavior = 'auto';
    };
  }, []);

  // 오늘 인증 여부 확인
  useEffect(() => {
    const checkHasPostedToday = () => {
      const today = new Date().toDateString();
      const savedDate = localStorage.getItem(`hasPostedToday_${id}`);
      setHasPostedToday(savedDate === today);
    };
    checkHasPostedToday();
    const handleFocus = () => checkHasPostedToday();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [id]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setSwipeDirection(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    // 드래그 거리 실시간 업데이트
    setDragOffset(currentTouch - touchStart);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 75;
    const isRightSwipe = distance < -75;

    if (isLeftSwipe) {
      setSwipeDirection('left');
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % posts.length);
        setSwipeDirection(null);
      }, 300);
    }
    if (isRightSwipe) {
      if (hasPostedToday) {
        // 공유 모달 띄우기
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
    // 드래그 상태 초기화
    setDragOffset(0);
    setTouchStart(0);
    setTouchEnd(0);
  };

  const getVisibleCards = () => {
    const cards = [];
    for (let i = 0; i < Math.min(3, posts.length); i++) {
      const index = (currentIndex + i) % posts.length;
      cards.push({ ...posts[index], stackIndex: i });
    }
    return cards;
  };

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
            <span className="text-2xl">{community.emoji}</span>
            <span className="font-bold text-gray-900">{community.name}</span>
          </div>
          <button onClick={() => navigate(`/community/${id}/profile`)} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 py-3 min-h-0 gap-3">

        {/* 인증 버튼 */}
        <div className="flex-none bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-bold text-lg">
                {hasPostedToday ? '운동 인증 완료!' : '오늘의 운동 인증'}
              </p>
              <p className="text-sm text-white/90">
                {hasPostedToday ? '오늘도 완료! 👏' : '친구들 사진 보기'}
              </p>
            </div>
            <Camera className="w-8 h-8" />
          </div>
          {!hasPostedToday && (
            <button
              onClick={() => navigate(`/community/${id}/upload`)}
              className="w-full bg-white text-orange-600 rounded-xl py-3 font-bold active:scale-95 transition-transform"
            >
              지금 인증하기
            </button>
          )}
        </div>

        {/* 카드 스택 영역 */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          <div className="flex-none flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">오늘의 인증</h3>
            <div className="text-sm text-gray-500">
              {currentIndex + 1} / {posts.length}
            </div>
          </div>

          <div className="flex-1 relative w-full">
            {getVisibleCards().map((post, idx) => {
              const isTop = idx === 0;
              const stackOffset = 0; // 스택 오프셋 제거 (모두 같은 위치)
              const scale = 1; // 스케일 효과 제거 (항상 1)

              return (
                <div
                  key={`${post.id}-${idx}`}
                  className={`absolute inset-x-0 top-0 bottom-0 transition-all duration-300 ${isTop ? 'z-30' : idx === 1 ? 'z-20' : 'z-10'
                    } ${swipeDirection === 'left' && isTop
                      ? '-translate-x-full rotate-[-20deg] opacity-0'
                      : swipeDirection === 'right' && isTop
                        ? 'translate-x-full rotate-[20deg] opacity-0'
                        : ''
                    }`}
                  style={{
                    top: `${stackOffset}px`,
                    bottom: `${stackOffset * 2}px`,
                    // 최상단 카드는 드래그/스와이프에 따라 움직임
                    transform: isTop
                      ? (swipeDirection
                        ? '' // 스와이프 애니메이션 중일 때는 클래스(animate)가 제어
                        : `translateX(${dragOffset}px) rotate(${dragOffset * 0.1}deg) scale(${scale})` // 드래그 중일 때는 실시간 좌표
                      )
                      : `scale(${scale})`, // 나머지 카드는 스케일만
                    transformOrigin: 'bottom center',
                    transition: dragOffset !== 0 ? 'none' : 'all 0.3s ease-out' // 드래그 중에는 딜레이 없음, 놓으면 부드럽게 복귀
                  }}
                  onTouchStart={isTop ? handleTouchStart : undefined}
                  onTouchMove={isTop ? handleTouchMove : undefined}
                  onTouchEnd={isTop ? handleTouchEnd : undefined}
                >
                  {/* [수정됨] 배경을 검은색으로, 이미지를 contain으로 변경 */}
                  <div className="bg-black rounded-3xl overflow-hidden shadow-xl h-full flex flex-col border border-gray-100 relative">
                    <img
                      src={post.imageUrl}
                      alt={post.userName}
                      className={`w-full h-full object-contain ${!hasPostedToday ? 'blur-lg' : ''}`}
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
                            <span className="text-2xl">{post.userAvatar}</span>
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
            })}
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