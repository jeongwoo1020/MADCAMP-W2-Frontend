import { Plus, Clock, Calendar, ChevronRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import BottomNav from './BottomNav';

interface Community {
  id: string;
  name: string;
  emoji: string;
  timeLeft: string | null;
  nextPostTime: string | null;
  participants: number;
  postsToday: number;
}

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [communities] = useState<Community[]>([
    {
      id: '1',
      name: '농구',
      emoji: '🏀',
      timeLeft: '3분',
      nextPostTime: null,
      participants: 12,
      postsToday: 8
    },
    {
      id: '2',
      name: '수영',
      emoji: '🏊',
      timeLeft: null,
      nextPostTime: '내일 오전 7시',
      participants: 8,
      postsToday: 0
    },
    {
      id: '3',
      name: '러닝크루',
      emoji: '🏃',
      timeLeft: '45분',
      nextPostTime: null,
      participants: 24,
      postsToday: 18
    },
    {
      id: '4',
      name: '헬스',
      emoji: '💪',
      timeLeft: null,
      nextPostTime: '오늘 오후 6시',
      participants: 15,
      postsToday: 0
    }
  ]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      alert(`"${searchQuery}" 검색 결과를 찾는 중...`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-20">
      {/* 헤더 */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            운동메이트
          </h1>
          <p className="text-sm text-gray-600 mt-1">오늘도 함께 운동해요! 💪</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6">
        {/* 검색창 */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="커뮤니티 ID로 검색"
              className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-600 border border-gray-100"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            {searchQuery && (
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1.5 rounded-xl text-sm font-medium"
              >
                검색
              </button>
            )}
          </div>
        </div>

        {/* 긴급 알림 섹션 */}
        <div className="space-y-3 mb-6">
          {communities
            .filter(c => c.timeLeft)
            .map(community => (
              <div
                key={community.id}
                onClick={() => navigate(`/community/${community.id}`)}
                className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 text-white shadow-lg animate-pulse cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{community.emoji}</div>
                    <div>
                      <p className="font-semibold">{community.name} 커뮤니티</p>
                      <p className="text-sm text-white/90">인증 {community.timeLeft} 남았습니다!</p>
                    </div>
                  </div>
                  <Clock className="w-6 h-6" />
                </div>
              </div>
            ))}
          
          {communities
            .filter(c => !c.timeLeft && c.nextPostTime)
            .slice(0, 1)
            .map(community => (
              <div
                key={community.id}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-4 text-white shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{community.emoji}</div>
                    <div>
                      <p className="font-semibold">{community.name}</p>
                      <p className="text-sm text-white/90">{community.nextPostTime}</p>
                    </div>
                  </div>
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
            ))}
        </div>

        {/* 커뮤니티 목록 */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">내 커뮤니티</h2>
        </div>

        <div className="grid gap-4 mb-6">
          {communities.map(community => (
            <div
              key={community.id}
              onClick={() => navigate(`/community/${community.id}`)}
              className="bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all cursor-pointer active:scale-[0.98] border border-gray-100"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{community.emoji}</div>
                  <div>
                    <h3 className="font-bold text-gray-900">{community.name}</h3>
                    <p className="text-sm text-gray-500">멤버 {community.participants}명</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="text-sm">
                  <span className="text-gray-600">오늘 인증:</span>
                  <span className="ml-2 font-semibold text-indigo-600">
                    {community.postsToday}/{community.participants}
                  </span>
                </div>
                {community.timeLeft && (
                  <div className="flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    {community.timeLeft}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 커뮤니티 생성 버튼 */}
        <button
          onClick={() => navigate('/create-community')}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-4 font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          새 커뮤니티 만들기
        </button>
      </div>

      <BottomNav currentPage="home" />
    </div>
  );
}