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
  const [communityInfo, setCommunityInfo] = useState({ name: '커뮤니티', emoji: '🏆' });

  useEffect(() => {
    const fetchShameData = async () => {
      if (!id) return;

      try {
        const token = localStorage.getItem('accessToken');
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // 1. 커뮤니티 정보 가져오기 (이름, 이모지)
        const comRes = await fetch(`/api/communities/${id}/`, { headers });
        if (comRes.ok) {
          const comData = await comRes.json();
          setCommunityInfo({
            name: comData.com_name,
            emoji: comData.icon_url || '🏆'
          });
        }

        // 2. 수치의 전당 데이터 가져오기
        const shameRes = await fetch(`/api/communities/${id}/hall_of_shame/`, { headers });
        if (shameRes.ok) {
          const shameData = await shameRes.json();
          // API 응답 구조에 맞춰 매핑
          const mappedUsers = shameData.map((user: any) => ({
            id: user.user_id || Math.random().toString(),
            name: user.nick_name || user.user_name || '익명',
            avatar: (user.profile_img_url || '👤').trim().replace(/['"]/g, ''),
            shameImage: (user.shame_img_url || 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800').trim().replace(/['"]/g, ''),
            missedDays: user.continuous_missed_days || 1, // 백엔드에서 주면 사용, 안주면 1일
            lastActive: user.last_active_date ? new Date(user.last_active_date).toLocaleDateString() : '최근'
          }));
          setShameUsers(mappedUsers);
        }
      } catch (error) {
        console.error("Failed to fetch hall of shame data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShameData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const renderIcon = (icon: string) => {
    if (!icon) return '👤';
    const cleanIcon = icon.trim();
    if (cleanIcon.startsWith('http') || cleanIcon.startsWith('/') || cleanIcon.includes('data:')) {
      return <img src={cleanIcon} alt="icon" className="w-full h-full rounded-full object-cover" />;
    }
    // 길이가 긴 텍스트(Base64 등)는 화면에 출력하지 않고 기본 아이콘 대체
    return cleanIcon.length > 50 ? '👤' : icon;
  };

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
            <span className="text-2xl w-8 h-8 flex items-center justify-center overflow-hidden rounded-full">
              {renderIcon(communityInfo.emoji)}
            </span>
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
                      onError={(e) => {
                        console.error('Image load failed for:', user.name);
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800';
                      }}
                    />
                    {/* 오버레이 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                    {/* 사용자 정보 */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 flex items-center justify-center text-3xl">
                          {renderIcon(user.avatar)}
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
