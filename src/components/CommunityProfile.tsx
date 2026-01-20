import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Users, Calendar, Target, TrendingUp, Settings, Loader2 } from 'lucide-react';

interface Community {
  id: string;
  name: string;
  emoji: string;
  description: string;
  certDays: string;
  certTime: string;
  createdDate: string;
  participants: number; // Renamed from members to match API or logic
  totalPosts: number;
  weeklyGoal: number;
}

interface Member {
  mem_idx: string;
  nick_name: string;
  description?: string;
  cert_cnt: number;
  is_late_cnt: number;
  profile_img_url?: string;
  user_profile_img_url?: string; // User의 프로필 이미지
  user_id: string;
}

export default function CommunityProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommunityDetail = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        if (!token) {
          navigate('/login');
          return;
        }

        // 커뮤니티 정보 가져오기
        const response = await fetch(`/api/communities/${id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // 멤버 목록 가져오기
        const membersRes = await fetch(`/api/members/get_members/?com_uuid=${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        let memberList: Member[] = [];
        if (membersRes.ok) {
          const membersData = await membersRes.json();

          // 멤버 정보 보완 (닉네임/아바타 누락 시 유저 정보 조회)
          const enrichedMembers = await Promise.all(membersData.map(async (m: any) => {
            let name = m.nick_name || m.nickname || m.user_name || m.user_details?.user_name;
            let avatar = m.profile_img_url || m.user_profile_img_url || m.user_details?.profile_img_url;

            if ((!name || !avatar) && m.user_id) {
              try {
                const uRes = await fetch(`/api/users/${m.user_id}/`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (uRes.ok) {
                  const uData = await uRes.json();
                  if (!name) name = uData.user_name;
                  if (!avatar) avatar = uData.profile_img_url;
                }
              } catch (e) { console.error(e); }
            }

            return {
              ...m,
              nick_name: name || '익명',
              profile_img_url: avatar
            };
          }));

          setMembers(enrichedMembers);
        }

        if (response.ok) {
          const data = await response.json();

          // Parse cert_days safely
          let parsedDays: string[] = [];
          const rawDays = data.cert_days;
          if (Array.isArray(rawDays)) {
            parsedDays = rawDays;
          } else if (typeof rawDays === 'string') {
            try {
              const jsonString = rawDays.replace(/'/g, '"');
              parsedDays = JSON.parse(jsonString);
            } catch (e) {
              const cleanString = rawDays.replace(/[\[\]"']/g, '');
              parsedDays = cleanString.split(',').map((s: string) => s.trim());
            }
          }

          // Convert English day abbreviations to Korean
          const dayOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
          const dayMap: Record<string, string> = {
            'sun': '일', 'mon': '월', 'tue': '화', 'wed': '수',
            'thu': '목', 'fri': '금', 'sat': '토'
          };
          // Sort by dayOrder then convert to Korean
          const sortedDays = parsedDays
            .map(d => d.toLowerCase().trim())
            .sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
          const koreanDays = sortedDays.map(d => dayMap[d] || d);

          setCommunity({
            id: data.com_id,
            name: data.com_name,
            emoji: data.icon_url || '💪',
            description: data.description,
            certDays: koreanDays.join(', '),
            certTime: data.cert_time,
            createdDate: new Date(data.created_at).toLocaleDateString(),
            participants: memberList.length, // 실제 멤버 수
            totalPosts: data.post_count || data.posts_count || 0,
            weeklyGoal: parsedDays.length || 0,
          });
        } else {
          console.warn('API call failed');
          setError("정보를 불러올 수 없습니다.");
        }
      } catch (err) {
        console.error('Failed to fetch community:', err);
        setError("정보를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCommunityDetail();
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>커뮤니티를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const renderCommunityIcon = (icon: string) => {
    // URL 체크 로직 강화
    const isUrl = icon?.startsWith('http') || icon?.startsWith('/') || icon?.startsWith('data:');
    if (isUrl) {
      return <img src={icon} alt="icon" className="w-20 h-20 rounded-full object-cover mx-auto mb-4" />;
    }
    return <div className="text-6xl mb-4">{icon}</div>;
  };

  const stats = [
    { label: '총 멤버', value: community.participants, icon: Users },
    { label: '총 인증', value: community.totalPosts, icon: Calendar },
    { label: '주간 목표', value: `${community.weeklyGoal}회`, icon: Target },
    { label: '참여율', value: '0%', icon: TrendingUp } // Placeholder as per backend limits
  ];



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
          <h1 className="font-semibold">커뮤니티 프로필</h1>
          <button
            onClick={() => alert('설정')}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6">
        {/* 커뮤니티 정보 카드 */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-xl mb-6">
          <div className="text-center">
            {renderCommunityIcon(community.emoji)}
            <h2 className="text-2xl font-bold mb-2">{community.name}</h2>
            <p className="text-white/90 mb-4">{community.description}</p>
            <div className="flex flex-col gap-2 items-center">
              <div className="inline-block bg-white/20 backdrop-blur-md rounded-full px-4 py-1 text-sm">
                📅 {community.certDays}
              </div>
              <div className="inline-block bg-white/20 backdrop-blur-md rounded-full px-4 py-1 text-sm">
                ⏰ {community.certTime}
              </div>
              <div className="inline-block bg-white/20 backdrop-blur-md rounded-full px-4 py-1 text-sm">
                {community.createdDate} 시작
              </div>
            </div>
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-4 shadow-md border border-gray-100"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* 멤버 목록 */}
        <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">활동 멤버 ({members.length}명)</h3>
          <div className="space-y-3">
            {members.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">아직 멤버가 없습니다</p>
            ) : (
              members
                .slice()
                .sort((a, b) => b.cert_cnt - a.cert_cnt)
                .map((member, index) => {
                  const getLevel = (certCnt: number) => {
                    if (certCnt >= 30) return '🔥';
                    if (certCnt >= 20) return '⭐';
                    if (certCnt >= 10) return '💫';
                    return '🌱';
                  };
                  const avatar = member.profile_img_url || member.user_profile_img_url || '👤';
                  const isUrl = avatar.startsWith('http') || avatar.startsWith('/') || avatar.startsWith('data:');

                  return (
                    <div
                      key={member.mem_idx}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        {isUrl ? (
                          <img src={avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="text-2xl">{avatar}</div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{member.nick_name || '익명'}</p>
                            <span>{getLevel(member.cert_cnt)}</span>
                          </div>
                          <p className="text-sm text-gray-500">{member.cert_cnt}회 인증</p>
                        </div>
                      </div>
                      {index < 3 && (
                        <div className="text-lg">
                          {index === 0 && '🥇'}
                          {index === 1 && '🥈'}
                          {index === 2 && '🥉'}
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* 커뮤니티 규칙 */}
        <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 mt-4">
          <h3 className="font-bold text-gray-900 mb-3">커뮤니티 규칙</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              <span>매일 정해진 시간에 운동 인증하기</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              <span>주 5회 이상 인증 목표 달성하기</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              <span>서로 응원하고 격려하는 분위기 만들기</span>
            </li>
          </ul>
        </div>

        <button
          onClick={() => alert('커뮤니티 나가기')}
          className="w-full mt-6 bg-red-50 text-red-600 rounded-2xl py-4 font-semibold"
        >
          커뮤니티 나가기
        </button>
      </div>
    </div>
  );
}