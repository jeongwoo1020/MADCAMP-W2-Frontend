import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Trophy, TrendingUp, Calendar, Award, Loader2 } from 'lucide-react';

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
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRankInfo, setMyRankInfo] = useState<LeaderboardEntry | null>(null);

  const myUserId = localStorage.getItem('userId') || localStorage.getItem('user_id');

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`/api/communities/${id}/rankings/`, { headers });
        if (response.ok) {
          const data = await response.json();
          // data is MemberSerializer[]
          const mapped: LeaderboardEntry[] = data.map((member: any, index: number) => {
            // 닉네임 우선, 없으면 유저 이름(fetch 필요할 수도 있지만 일단 있는 정보 활용)
            const name = member.nick_name || '알 수 없음';
            const avatar = member.profile_img_url || '👤';

            return {
              rank: index + 1,
              userId: member.user_id, // Member model has user_id FK, serializer returns uuid usually
              userName: name,
              userAvatar: avatar,
              count: member.cert_cnt,
              streak: 0 // 백엔드에 streak 필드가 없어서 0 처리
            };
          });

          setLeaderboardData(mapped);

          // 내 순위 찾기
          if (myUserId) {
            const myEntry = mapped.find(entry => String(entry.userId) === String(myUserId));
            if (myEntry) setMyRankInfo(myEntry);
          }
        }
      } catch (error) {
        console.error('Failed to fetch rankings:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRankings();
  }, [id, myUserId]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

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
          <h1 className="font-semibold">순위</h1>
          <div className="w-10 h-10"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6">

        {/* 상위 3명 포디움 */}
        <div className="mb-6">
          <div className="flex items-end justify-center gap-2 mb-4">
            {/* 2등 */}
            {leaderboardData[1] && (
              <div className="flex-1 text-center">
                <div className="bg-gradient-to-br from-gray-300 to-gray-400 rounded-2xl p-4 mb-2 shadow-lg">
                  <div className="text-4xl mb-2 flex justify-center">
                    {leaderboardData[1].userAvatar.startsWith('http') ? (
                      <img src={leaderboardData[1].userAvatar} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <span>{leaderboardData[1].userAvatar}</span>
                    )}
                  </div>
                  <p className="text-white font-semibold text-sm mb-1">{leaderboardData[1].userName}</p>
                  <div className="text-3xl mb-1">🥈</div>
                  <p className="text-white font-bold text-lg">{leaderboardData[1].count}회</p>
                </div>
              </div>
            )}

            {/* 1등 */}
            {leaderboardData[0] && (
              <div className="flex-1 text-center -mt-4">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-5 mb-2 shadow-xl border-2 border-yellow-300">
                  <div className="text-5xl mb-2 flex justify-center">
                    {leaderboardData[0].userAvatar.startsWith('http') ? (
                      <img src={leaderboardData[0].userAvatar} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <span>{leaderboardData[0].userAvatar}</span>
                    )}
                  </div>
                  <p className="text-white font-bold mb-1">{leaderboardData[0].userName}</p>
                  <div className="text-4xl mb-1">🥇</div>
                  <p className="text-white font-bold text-xl">{leaderboardData[0].count}회</p>
                </div>
              </div>
            )}

            {/* 3등 */}
            {leaderboardData[2] && (
              <div className="flex-1 text-center">
                <div className="bg-gradient-to-br from-orange-300 to-orange-400 rounded-2xl p-4 mb-2 shadow-lg">
                  <div className="text-4xl mb-2 flex justify-center">
                    {leaderboardData[2].userAvatar.startsWith('http') ? (
                      <img src={leaderboardData[2].userAvatar} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <span>{leaderboardData[2].userAvatar}</span>
                    )}
                  </div>
                  <p className="text-white font-semibold text-sm mb-1">{leaderboardData[2].userName}</p>
                  <div className="text-3xl mb-1">🥉</div>
                  <p className="text-white font-bold text-lg">{leaderboardData[2].count}회</p>
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
            {leaderboardData.length === 0 ? (
              <div className="p-8 text-center text-gray-500">아직 랭킹 정보가 없습니다.</div>
            ) : (
              leaderboardData.map((entry) => {
                const isMe = String(entry.userId) === String(myUserId);
                return (
                  <div
                    key={entry.userId}
                    className={`px-5 py-4 flex items-center justify-between ${isMe ? 'bg-indigo-50' : 'bg-white'
                      }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-8 text-center">
                        {getRankIcon(entry.rank) || (
                          <span className="font-bold text-gray-600">{entry.rank}</span>
                        )}
                      </div>
                      <div className="text-3xl w-10 h-10 flex items-center justify-center">
                        {entry.userAvatar.startsWith('http') ? (
                          <img src={entry.userAvatar} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span>{entry.userAvatar}</span>
                        )}
                      </div>
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
                        </div>
                      </div>
                    </div>
                    {entry.rank <= 3 && (
                      <Award className="w-6 h-6 text-yellow-500" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 내 순위 요약 */}
        {myRankInfo && (
          <div className="mt-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">내 순위</h3>
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{myRankInfo.rank}위</p>
                <p className="text-xs text-white/80 mt-1">현재 순위</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{myRankInfo.count}회</p>
                <p className="text-xs text-white/80 mt-1">총 인증 횟수</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}