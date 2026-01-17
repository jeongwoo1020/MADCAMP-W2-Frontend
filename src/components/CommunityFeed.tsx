import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Camera, MessageCircle, Trophy, Info, Flame, ChevronRight, Send } from 'lucide-react';

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
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

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

  // localStorage에서 오늘 인증 여부 확인
  useEffect(() => {
    const checkHasPostedToday = () => {
      const today = new Date().toDateString();
      const savedDate = localStorage.getItem(`hasPostedToday_${id}`);
      setHasPostedToday(savedDate === today);
    };

    // 컴포넌트 마운트 시 확인
    checkHasPostedToday();

    // 페이지 포커스 시 확인 (뒤로가기로 돌아왔을 때)
    const handleFocus = () => {
      checkHasPostedToday();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [id]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setSwipeDirection(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 75;
    const isRightSwipe = distance < -75;

    if (isLeftSwipe) {
      // 왼쪽 스와이프: 다음 사진
      setSwipeDirection('left');
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % posts.length);
        setSwipeDirection(null);
      }, 300);
    }

    if (isRightSwipe) {
      // 오른쪽 스와이프: 인증 후에는 채팅방에 공유, 인증 전에는 다음 사진
      setSwipeDirection('right');
      setTimeout(() => {
        if (hasPostedToday) {
          alert(`${posts[currentIndex].userName}의 사진을 채팅방에 공유했습니다! 📤`);
        }
        setSwipeDirection(null);
        setCurrentIndex((prev) => (prev + 1) % posts.length);
      }, 300);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  // 현재 보이는 카드들 (최대 3장)
  const getVisibleCards = (): (Post & { stackIndex: number })[] => {
    const cards: (Post & { stackIndex: number })[] = [];
    for (let i = 0; i < Math.min(3, posts.length); i++) {
      const index = (currentIndex + i) % posts.length;
      cards.push({ ...posts[index], stackIndex: i });
    }
    return cards;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-20">
      {/* 헤더 */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{community.emoji}</span>
            <span className="font-bold text-gray-900">{community.name}</span>
          </div>
          <button
            onClick={() => navigate(`/community/${id}/profile`)}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6">
        {/* 인증 버튼 */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 text-white shadow-lg mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-bold text-lg">
                {hasPostedToday ? '운동 인증 완료!' : '오늘의 운동 인증'}
              </p>
              <p className="text-sm text-white/90">
                {hasPostedToday ? '오늘도 멋진 운동 하셨네요! 👏' : '친구들의 사진을 보려면 인증하세요!'}
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

        {/* 카드 스택 UI */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">오늘의 인증</h3>
            <div className="text-sm text-gray-500">
              {currentIndex + 1} / {posts.length}
            </div>
          </div>
          
          <div className="relative h-[500px]">
            {getVisibleCards().map((post, idx) => {
              const isTop = idx === 0;
              const stackOffset = idx * 8;
              const scale = 1 - idx * 0.05;

              return (
                <div
                  key={`${post.id}-${idx}`}
                  className={`absolute inset-0 transition-all duration-300 ${
                    isTop ? 'z-30' : idx === 1 ? 'z-20' : 'z-10'
                  } ${
                    swipeDirection === 'left' && isTop
                      ? '-translate-x-full rotate-[-20deg] opacity-0'
                      : swipeDirection === 'right' && isTop
                      ? 'translate-x-full rotate-[20deg] opacity-0'
                      : ''
                  }`}
                  style={{
                    top: `${stackOffset}px`,
                    transform: swipeDirection && isTop ? '' : `scale(${scale})`,
                  }}
                  onTouchStart={isTop ? handleTouchStart : undefined}
                  onTouchMove={isTop ? handleTouchMove : undefined}
                  onTouchEnd={isTop ? handleTouchEnd : undefined}
                >
                  <div className="bg-white rounded-3xl overflow-hidden shadow-2xl h-full flex flex-col">
                    {/* 이미지 */}
                    <div className="flex-1 relative">
                      <img
                        src={post.imageUrl}
                        alt={post.userName}
                        className={`w-full h-full object-cover ${
                          !hasPostedToday ? 'blur-lg' : ''
                        }`}
                      />
                      
                      {/* 인증 전 오버레이 */}
                      {!hasPostedToday && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="text-center text-white">
                            <Camera className="w-8 h-8 mx-auto mb-1 opacity-80" />
                            <p className="text-xs font-medium">인증 후 확인</p>
                          </div>
                        </div>
                      )}
                      
                      {/* 사용자 정보 오버레이 (인증 후에만, 왼쪽 상단) */}
                      {hasPostedToday && (
                        <div className="absolute top-4 left-4 bg-black/60 rounded-2xl px-3 py-2">
                          <div className="flex items-center gap-2 text-white">
                            <span className="text-2xl">{post.userAvatar}</span>
                            <div>
                              <p className="font-bold text-sm">{post.userName}</p>
                              <p className="text-xs text-white/80">{post.timestamp}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 스와이프 힌트 아이콘 (최상단 카드만, 인증 후에만) */}
                      {isTop && hasPostedToday && (
                        <>
                          {/* 왼쪽 하단: 왼쪽 화살표 */}
                          <div className="absolute bottom-4 left-4 bg-black/60 rounded-full p-3">
                            <ArrowLeft className="w-6 h-6 text-white" />
                          </div>
                          
                          {/* 오른쪽 하단: 공유하기 아이콘 */}
                          <button
                            onClick={() => {
                              if (hasPostedToday) {
                                alert(`${post.userName}의 사진을 채팅방에 공유했습니다! 📤`);
                              }
                            }}
                            className="absolute bottom-4 right-4 bg-black/60 rounded-full p-3 active:scale-95 transition-transform"
                          >
                            <Send className="w-6 h-6 text-white" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>



        {/* 하단 액션 버튼 */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => navigate(`/community/${id}/chat`)}
            className="bg-white rounded-2xl py-4 shadow-md border border-gray-100 font-semibold flex flex-col items-center gap-1 active:scale-95 transition-transform"
          >
            <MessageCircle className="w-6 h-6 text-indigo-600" />
            <span className="text-xs text-gray-700">채팅</span>
          </button>
          <button
            onClick={() => navigate(`/community/${id}/leaderboard`)}
            className="bg-white rounded-2xl py-4 shadow-md border border-gray-100 font-semibold flex flex-col items-center gap-1 active:scale-95 transition-transform"
          >
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span className="text-xs text-gray-700">순위</span>
          </button>
          <button
            onClick={() => navigate(`/community/${id}/shame`)}
            className="bg-white rounded-2xl py-4 shadow-md border border-gray-100 font-semibold flex flex-col items-center gap-1 active:scale-95 transition-transform"
          >
            <Flame className="w-6 h-6 text-red-500" />
            <span className="text-xs text-gray-700">수치</span>
          </button>
        </div>
      </div>

      
        {/* 이번 주 1등 정보 */}
        <div className="bg-white rounded-2xl p-5 shadow-md mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-gray-900">이번 주 1등</span>
            </div>
            <button
              onClick={() => navigate(`/community/${id}/leaderboard`)}
              className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              전체보기
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-3xl">🥇</div>
            <div>
              <p className="font-bold text-gray-900">{community.topUser}</p>
              <p className="text-sm text-gray-500">{community.topCount}회 인증</p>
            </div>
          </div>
        </div>

    </div>
  );
}
