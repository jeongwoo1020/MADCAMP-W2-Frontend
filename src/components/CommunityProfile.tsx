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
  members: number;
  totalPosts: number;
  weeklyGoal: number;
}

export default function CommunityProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommunityDetail = async () => {
      try {
        setLoading(true);
        // 실제 API 호출
        const response = await fetch(`http://localhost:8000/api/communities/${id}`); // 백엔드 주소로 변경 필요

        if (response.ok) {
          const data = await response.json();
          setCommunity(data);
        } else {
          // API 실패 시 (또는 개발 중) 더미 데이터 사용
          console.warn('API call failed, using dummy data');
          // 더미 데이터 fallback
          const dummyData = {
            id: '1',
            name: '농구',
            emoji: '🏀',
            description: '매일 농구 실력을 향상시키는 커뮤니티',
            certDays: '월, 수, 금',
            certTime: '오후 8:00 ~ 오후 10:00',
            createdDate: '2024.01.15',
            members: 12,
            totalPosts: 342,
            weeklyGoal: 5,
          };
          setCommunity(dummyData);
        }
      } catch (err) {
        console.error('Failed to fetch community:', err);
        // 에러 발생 시에도 더미 데이터 보여주기 (개발 편의성)
        const dummyData = {
          id: '1',
          name: '농구',
          emoji: '🏀',
          description: '매일 농구 실력을 향상시키는 커뮤니티',
          certDays: '월, 수, 금',
          certTime: '오후 8:00 ~ 오후 10:00',
          createdDate: '2024.01.15',
          members: 12,
          totalPosts: 342,
          weeklyGoal: 5,
        };
        setCommunity(dummyData);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCommunityDetail();
    }
  }, [id]);

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

  const stats = [
    { label: '총 멤버', value: community.members, icon: Users },
    { label: '총 인증', value: community.totalPosts, icon: Calendar },
    { label: '주간 목표', value: `${community.weeklyGoal}회`, icon: Target },
    { label: '참여율', value: '87%', icon: TrendingUp }
  ];

  const recentMembers = [
    { name: '김철수', avatar: '👨', posts: 24, level: '🔥' },
    { name: '박영희', avatar: '👩', posts: 18, level: '⭐' },
    { name: '이민수', avatar: '🧑', posts: 31, level: '🔥' },
    { name: '최지은', avatar: '👧', posts: 22, level: '⭐' },
    { name: '정민호', avatar: '👦', posts: 15, level: '💫' }
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
            <div className="text-6xl mb-4">{community.emoji}</div>
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
          <h3 className="font-bold text-gray-900 mb-4">활동 멤버</h3>
          <div className="space-y-3">
            {recentMembers.map((member, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{member.avatar}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{member.name}</p>
                      <span>{member.level}</span>
                    </div>
                    <p className="text-sm text-gray-500">{member.posts}회 인증</p>
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
            ))}
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