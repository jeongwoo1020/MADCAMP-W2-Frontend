import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, Search, Users, Calendar, Loader2, Clock } from 'lucide-react';

interface Community {
  com_id: string;
  com_name: string;
  description?: string;
  cert_days?: string[];
  cert_time?: string;
  icon_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export default function CommunitySearchResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchId = searchParams.get('id');

  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommunity = async () => {
      if (!searchId) {
        setError('검색 ID가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 전체 커뮤니티 목록 가져오기
        const response = await fetch('/api/communities/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });

        if (!response.ok) {
          throw new Error('커뮤니티 목록을 가져오는데 실패했습니다.');
        }

        const communities: Community[] = await response.json();
        console.log("전체 커뮤니티 목록:", communities);

        // ID 또는 이름에 검색어가 포함되어 있으면 찾음 (유연한 검색)
        const foundCommunity = communities.find(
          (c) => c.com_id.toLowerCase().includes(searchId.toLowerCase()) ||
            c.com_name.toLowerCase().includes(searchId.toLowerCase())
        );

        if (foundCommunity) {
          setCommunity(foundCommunity);
        } else {
          setError(`"${searchId}" 검색 결과가 없습니다.`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchCommunity();
  }, [searchId]);

  const handleJoin = () => {
    if (community) {
      navigate(`/join-community/${community.com_id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* 헤더 */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">검색 결과</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-600">커뮤니티를 찾는 중...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl p-6 shadow-md text-center">
            <div className="text-6xl mb-4">😕</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">커뮤니티를 찾을 수 없습니다</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl py-3 font-semibold"
            >
              홈으로 돌아가기
            </button>
          </div>
        ) : community ? (
          <>
            {/* 커뮤니티 정보 카드 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 border border-gray-100">
              <div className="flex items-start gap-3">
                {/* 아이콘 - 좌상단에 작게 */}
                {community.icon_url ? (
                  <img
                    src={community.icon_url}
                    alt={community.com_name}
                    className="w-12 h-12 rounded-xl object-cover shadow-sm flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-lg shadow-sm flex-shrink-0">
                    {community.com_name.charAt(0)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {community.com_name}
                  </h2>
                  {community.description && (
                    <p className="text-gray-600 text-sm mb-3">
                      {community.description}
                    </p>
                  )}

                  {/* 인증 요일 */}
                  {community.cert_days && community.cert_days.length > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm text-gray-700">
                        인증 요일: {community.cert_days.map(day => {
                          const dayMap: { [key: string]: string } = {
                            'Mon': '월',
                            'Tue': '화',
                            'Wed': '수',
                            'Thu': '목',
                            'Fri': '금',
                            'Sat': '토',
                            'Sun': '일'
                          };
                          return dayMap[day] || day;
                        }).join(', ')}
                      </span>
                    </div>
                  )}

                  {/* 인증 시간 */}
                  {community.cert_time && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      <span>인증 시간: {community.cert_time}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 가입 버튼 */}
            <button
              onClick={handleJoin}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl py-4 font-semibold shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" />
              가입하기
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
