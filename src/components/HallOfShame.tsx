import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Flame, X } from 'lucide-react';
import { useState } from 'react';

interface ShameUser {
  id: string;
  name: string;
  avatar: string;
  shameImage: string;
  missedDays: number;
  lastActive: string;
}

export default function HallOfShame() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [shameUsers] = useState<ShameUser[]>([
    {
      id: '1',
      name: '김태만',
      avatar: '😭',
      shameImage: 'https://images.unsplash.com/photo-1604480133435-4b54f96b9a2f?w=800',
      missedDays: 3,
      lastActive: '3일 전'
    },
    {
      id: '2',
      name: '이나태',
      avatar: '😰',
      shameImage: 'https://images.unsplash.com/photo-1577923281135-d6c05294019f?w=800',
      missedDays: 2,
      lastActive: '2일 전'
    },
    {
      id: '3',
      name: '박게으름',
      avatar: '🥱',
      shameImage: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=800',
      missedDays: 5,
      lastActive: '5일 전'
    }
  ]);

  const communityData = {
    '1': { name: '농구', emoji: '🏀' },
    '2': { name: '수영', emoji: '🏊' },
    '3': { name: '러닝크루', emoji: '🏃' },
    '4': { name: '헬스', emoji: '💪' }
  };

  const community = communityData[id as keyof typeof communityData] || communityData['1'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* 헤더 */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(`/community/${id}`)}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{community.emoji}</span>
            <h1 className="text-xl font-bold">수치의 전당</h1>
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6">
        {/* 설명 카드 */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl p-6 text-white shadow-xl mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">수치의 전당 💀</h2>
              <p className="text-sm text-white/80">24시간마다 갱신</p>
            </div>
          </div>
          <p className="text-sm text-white/90 leading-relaxed">
            어제 인증을 하지 않은 멤버들의 수치 사진이 공개됩니다. 
            모두가 인증하면 아무도 등장하지 않아요!
          </p>
        </div>

        {/* 수치 리스트 */}
        {shameUsers.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">완벽해요!</h3>
            <p className="text-gray-600">
              어제 모든 멤버가 인증을 완료했어요!<br />
              오늘도 함께 화이팅! 💪
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {shameUsers.map((user, index) => (
              <div
                key={user.id}
                className="bg-white rounded-3xl overflow-hidden shadow-lg"
              >
                <div className="relative">
                  {/* 순위 배지 */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                      index === 0 ? 'bg-gradient-to-br from-red-600 to-red-500' :
                      index === 1 ? 'bg-gradient-to-br from-orange-600 to-orange-500' :
                      'bg-gradient-to-br from-yellow-600 to-yellow-500'
                    }`}>
                      {index + 1}위
                    </div>
                  </div>

                  {/* 수치 이미지 */}
                  <div className="relative aspect-[4/3]">
                    <img
                      src={user.shameImage}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                    {/* 오버레이 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    
                    {/* 사용자 정보 */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-3xl">{user.avatar}</div>
                        <div>
                          <p className="font-bold text-lg">{user.name}</p>
                          <p className="text-sm text-white/80">마지막 활동: {user.lastActive}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 통계 */}
                <div className="p-4 bg-red-50 border-t-2 border-red-100">
                  <div className="flex items-center justify-center gap-2">
                    <X className="w-5 h-5 text-red-600" />
                    <p className="text-sm font-semibold text-red-700">
                      연속 {user.missedDays}일 미인증
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 하단 안내 */}
        <div className="mt-6 bg-gray-100 rounded-2xl p-4">
          <p className="text-xs text-gray-600 text-center leading-relaxed">
            💡 수치의 전당은 동기부여를 위한 재미있는 기능이에요.<br />
            서로를 응원하며 함께 성장해요!
          </p>
        </div>
      </div>
    </div>
  );
}
