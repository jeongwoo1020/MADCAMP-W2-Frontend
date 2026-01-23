import { Plus, Clock, Calendar, ChevronRight, Search, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
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
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('/api/members/my_communities/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            navigate('/login');
            return;
          }
          throw new Error('데이터를 가져오는데 실패했습니다.');
        }

        const data = await response.json();

        // 각 커뮤니티에 대해 멤버 수와 오늘 인증 수를 가져옴
        const mappedCommunities: Community[] = await Promise.all(
          data.map(async (item: any) => {
            const { timeLeft, nextPostTime } = calculateCertificationStatus(item.cert_days || [], item.cert_time || '00:00:00');

            // 멤버 수 가져오기
            let memberCount = 0;
            try {
              const membersRes = await fetch(`/api/members/get_members/?com_uuid=${item.com_uuid}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (membersRes.ok) {
                const membersData = await membersRes.json();
                memberCount = Array.isArray(membersData) ? membersData.length : 0;
              }
            } catch (e) {
              console.error('멤버 수 조회 실패:', e);
            }

            // 오늘 인증 수 가져오기
            let postsCount = 0;
            try {
              const postsRes = await fetch(`/api/posts/?com_uuid=${item.com_uuid}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (postsRes.ok) {
                const postsData = await postsRes.json();
                postsCount = Array.isArray(postsData) ? postsData.length : 0;
              }
            } catch (e) {
              console.error('포스트 수 조회 실패:', e);
            }

            return {
              id: item.com_uuid,
              name: item.com_name,
              emoji: item.icon_url || '💪',
              timeLeft,
              nextPostTime,
              participants: memberCount,
              postsToday: postsCount
            };
          })
        );

        setCommunities(mappedCommunities);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, [navigate]);

  const calculateCertificationStatus = (certDays: string[] | string, certTime: string) => {
    const now = new Date();
    const weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

    // 1. Data Parsing & Safety check
    let parsedDays: string[] = [];
    if (Array.isArray(certDays)) {
      parsedDays = certDays;
    } else if (typeof certDays === 'string') {
      try {
        const jsonString = (certDays as string).replace(/'/g, '"');
        parsedDays = JSON.parse(jsonString);
      } catch (e) {
        const cleanString = (certDays as string).replace(/[\[\]"']/g, '');
        parsedDays = cleanString.split(',').map(s => s.trim());
      }
    }

    // Normalize to lowercase
    const cleanCertDays = parsedDays.map(d => String(d).trim().toLowerCase());

    const [h, m] = (certTime || '00:00').split(':').map(Number);
    const deadline = new Date();
    deadline.setHours(h || 0, m || 0, 0, 0);

    let timeLeft: string | null = null;
    let nextPostTime: string | null = null;

    // 2. Check Today
    const todayStr = weekdays[now.getDay()];
    if (cleanCertDays.includes(todayStr)) {
      if (now < deadline) {
        const diffMs = deadline.getTime() - now.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 60) {
          timeLeft = `${diffMins}분`;
        } else {
          const diffHours = Math.floor(diffMins / 60);
          timeLeft = `${diffHours}시간 ${diffMins % 60}분`;
        }
      }
    }

    // 3. Check Future
    if (!timeLeft) {
      for (let i = 1; i <= 7; i++) {
        const nextDate = new Date();
        nextDate.setDate(now.getDate() + i);
        const nextDayStr = weekdays[nextDate.getDay()];

        if (cleanCertDays.includes(nextDayStr)) {
          const month = nextDate.getMonth() + 1;
          const date = nextDate.getDate();
          const dayPrefix = i === 1 ? '내일' : `${month}월 ${date}일`;

          const displayHours = h > 12 ? h - 12 : h;
          const ampm = h >= 12 ? '오후' : '오전';
          nextPostTime = `${dayPrefix} ${ampm} ${displayHours}시`;
          break;
        }
      }
    }

    return { timeLeft, nextPostTime };
  };

  const renderCommunityIcon = (icon: string, sizeClass: string) => {
    const isUrl = icon.startsWith('http') || icon.startsWith('/') || icon.startsWith('data:');
    if (isUrl) {
      // Convert text size to fixed dimensions for images to prevent large size
      const dimension = sizeClass === 'text-3xl' ? 'w-8 h-8' : 'w-10 h-10';
      return <img src={icon} alt="icon" className={`${dimension} rounded-full object-cover`} />;
    }
    return <div className={sizeClass}>{icon}</div>;
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search-community?id=${encodeURIComponent(searchQuery.trim())}`);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-20">
      {/* 헤더 */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            ProoFit
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
                    {renderCommunityIcon(community.emoji, 'text-3xl')}
                    <div>
                      <p className="font-semibold">{community.name} 커뮤니티</p>
                      <p className="text-sm text-white/90">{community.timeLeft} 남았습니다!</p>
                    </div>
                  </div>
                  <Clock className="w-6 h-6" />
                </div>
              </div>
            ))}

          {communities
            .filter(c => !c.timeLeft && c.nextPostTime)
            .sort((a, b) => {
              // Prioritize "Today"("오늘") over "Tomorrow"("내일")
              const isTodayA = a.nextPostTime?.startsWith('오늘') ? 1 : 0;
              const isTodayB = b.nextPostTime?.startsWith('오늘') ? 1 : 0;
              return isTodayB - isTodayA; // Descending order
            })
            .slice(0, 1)
            .map(community => (
              <div
                key={community.id}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-4 text-white shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {renderCommunityIcon(community.emoji, 'text-3xl')}
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
                  {renderCommunityIcon(community.emoji, 'text-4xl')}
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