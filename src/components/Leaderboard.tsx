import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Trophy, TrendingUp, Calendar, Award } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userAvatar: string;
  count: number;
  streak: number;
}

export default function Leaderboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<'week' | 'month' | 'all'>('week');

  const weeklyLeaderboard: LeaderboardEntry[] = [
    { rank: 1, userId: '1', userName: '이민수', userAvatar: '🧑', count: 31, streak: 15 },
    { rank: 2, userId: '2', userName: '김철수', userAvatar: '👨', count: 24, streak: 12 },
    { rank: 3, userId: '3', userName: '최지은', userAvatar: '👧', count: 22, streak: 8 },
    { rank: 4, userId: '4', userName: '박영희', userAvatar: '👩', count: 18, streak: 7 },
    { rank: 5, userId: '5', userName: '정민호', userAvatar: '👦', count: 15, streak: 5 },
    { rank: 6, userId: '6', userName: '강수진', userAvatar: '👱‍♀️', count: 14, streak: 6 },
    { rank: 7, userId: '7', userName: '윤태영', userAvatar: '👨‍🦱', count: 12, streak: 4 },
    { rank: 8, userId: 'me', userName: '나', userAvatar: '😊', count: 11, streak: 8 }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-orange-500';
      case 2:
        return 'from-gray-300 to-gray-400';
      case 3:
        return 'from-orange-300 to-orange-400';
      default:
        return 'from-indigo-100 to-purple-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* 헤더 */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold">순위 / 수치의 전당</h1>
          <div className="w-10 h-10"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6">
        {/* 탭 */}
        <div className="bg-white rounded-2xl p-2 shadow-md mb-6 flex gap-2">
          <button
            onClick={() => setSelectedTab('week')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              selectedTab === 'week'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            주간
          </button>
          <button
            onClick={() => setSelectedTab('month')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              selectedTab === 'month'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            월간
          </button>
          <button
            onClick={() => setSelectedTab('all')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              selectedTab === 'all'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            전체
          </button>
        </div>

        {/* 상위 3명 포디움 */}
        <div className="mb-6">
          <div className="flex items-end justify-center gap-2 mb-4">
            {/* 2등 */}
            {weeklyLeaderboard[1] && (
              <div className="flex-1 text-center">
                <div className="bg-gradient-to-br from-gray-300 to-gray-400 rounded-2xl p-4 mb-2 shadow-lg">
                  <div className="text-4xl mb-2">{weeklyLeaderboard[1].userAvatar}</div>
                  <p className="text-white font-semibold text-sm mb-1">{weeklyLeaderboard[1].userName}</p>
                  <div className="text-3xl mb-1">🥈</div>
                  <p className="text-white font-bold text-lg">{weeklyLeaderboard[1].count}회</p>
                </div>
              </div>
            )}

            {/* 1등 */}
            {weeklyLeaderboard[0] && (
              <div className="flex-1 text-center -mt-4">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-5 mb-2 shadow-xl border-2 border-yellow-300">
                  <div className="text-5xl mb-2">{weeklyLeaderboard[0].userAvatar}</div>
                  <p className="text-white font-bold mb-1">{weeklyLeaderboard[0].userName}</p>
                  <div className="text-4xl mb-1">🥇</div>
                  <p className="text-white font-bold text-xl">{weeklyLeaderboard[0].count}회</p>
                  <div className="mt-2 bg-white/30 backdrop-blur-sm rounded-full px-2 py-1">
                    <p className="text-xs text-white">🔥 {weeklyLeaderboard[0].streak}일 연속</p>
                  </div>
                </div>
              </div>
            )}

            {/* 3등 */}
            {weeklyLeaderboard[2] && (
              <div className="flex-1 text-center">
                <div className="bg-gradient-to-br from-orange-300 to-orange-400 rounded-2xl p-4 mb-2 shadow-lg">
                  <div className="text-4xl mb-2">{weeklyLeaderboard[2].userAvatar}</div>
                  <p className="text-white font-semibold text-sm mb-1">{weeklyLeaderboard[2].userName}</p>
                  <div className="text-3xl mb-1">🥉</div>
                  <p className="text-white font-bold text-lg">{weeklyLeaderboard[2].count}회</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 전체 순위 */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              전체 순위
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {weeklyLeaderboard.map((entry) => {
              const isMe = entry.userId === 'me';
              return (
                <div
                  key={entry.userId}
                  className={`px-5 py-4 flex items-center justify-between ${
                    isMe ? 'bg-indigo-50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-8 text-center">
                      {getRankIcon(entry.rank) || (
                        <span className="font-bold text-gray-600">{entry.rank}</span>
                      )}
                    </div>
                    <div className="text-3xl">{entry.userAvatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold ${isMe ? 'text-indigo-600' : 'text-gray-900'}`}>
                          {entry.userName}
                        </p>
                        {isMe && (
                          <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                            나
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {entry.count}회 인증
                        </p>
                        {entry.streak > 0 && (
                          <p className="text-xs text-orange-600 flex items-center gap-1">
                            🔥 {entry.streak}일
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {entry.rank <= 3 && (
                    <Award className="w-6 h-6 text-yellow-500" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 내 순위 요약 */}
        <div className="mt-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">내 순위</h3>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">8위</p>
              <p className="text-xs text-white/80 mt-1">현재 순위</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">11회</p>
              <p className="text-xs text-white/80 mt-1">이번 주</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">8일</p>
              <p className="text-xs text-white/80 mt-1">연속 인증</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}