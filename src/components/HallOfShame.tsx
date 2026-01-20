import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Flame, X, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

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
  const [shameUsers, setShameUsers] = useState<ShameUser[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const token = localStorage.getItem('accessToken');
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;



        // 2. 수치의 전당 리스트
        const shameRes = await fetch(`/api/communities/${id}/hall_of_shame/`, { headers });
        if (shameRes.ok) {
          const shameData = await shameRes.json();
          // shameData is MemberSerializer[]
          const mapped: ShameUser[] = shameData.map((m: any) => ({
            id: m.mem_idx,
            name: m.nick_name || '알 수 없음',
            avatar: m.profile_img_url || '👤',
            shameImage: m.shame_img_url, // 백엔드에서 null일 수도 있으니 처리 필요할 수 있음
            missedDays: m.is_late_cnt || 1, // API 필드에 따라 조정 (현재는 is_late_cnt 사용)
            lastActive: '최근' // API에 last_active가 없어서 임시 텍스트
          }));

          // shame_img_url이 있는 유저만 필터링 (이미지가 없으면 박제 의미가 적으므로)
          // 혹은 이미지가 없으면 기본 이미지를 보여줄 수도 있음. 기획에 따라 다름.
          // 여기선 있는 경우만 보여주거나, 없으면 기본 이미지
          const filtered = mapped.filter(u => u.shameImage);
          setShameUsers(filtered);
        }

      } catch (error) {
        console.error('Failed to fetch hall of shame:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* 헤더 */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(`/community/${id}`)}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold">수치의 전당</h1>
          <div className="w-10 h-10"></div>
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

        {/*   수치 리스트 */}
        {shameUsers.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">완벽해요!</h3>
            <p className="text-gray-600">
              어제 모든 멤버가 인증을 완료했어요! 💪
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
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${index === 0 ? 'bg-gradient-to-br from-red-600 to-red-500' :
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
                        <div className="text-3xl flex items-center justify-center w-8 h-8">
                          {(user.avatar?.startsWith('http') || user.avatar?.startsWith('/')) ? (
                            <img src={user.avatar} className="w-full h-full rounded-full object-cover" />
                          ) : user.avatar}
                        </div>
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
                      총 {user.missedDays}회 지각/미인증
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
    </div >
  );
}
