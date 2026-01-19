import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Settings, Edit, Award, TrendingUp, Calendar, Users, LogOut, Trophy, ChevronLeft, ChevronRight, Loader2, Snowflake, Flame } from 'lucide-react';
import BottomNav from './BottomNav';

interface UserProfile {
  user_id: string;
  user_name: string;
  score: number;
  interests: string[];
  profile_img_url: string | null;
  created_at: string;
}

export default function MyPage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    // 초기 로딩 시 로컬스토리지 캐시 사용 (버퍼링 제거)
    const cachedName = localStorage.getItem('userName');
    if (cachedName) {
      return {
        user_id: localStorage.getItem('userId') || '',
        user_name: cachedName,
        score: Number(localStorage.getItem('userScore')) || 50,
        interests: [], // API 로드 전까지는 빈 배열
        profile_img_url: localStorage.getItem('userProfile') || null,
        created_at: new Date().toISOString() // 임시 날짜
      };
    }
    return null;
  });
  const [loading, setLoading] = useState(!userProfile); // 캐시가 있으면 로딩 안 함
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // 이미 데이터가 있으면 로딩 표시 안 함 (Background Fetch)
        if (!userProfile) setLoading(true);
        setError(null);

        const token = localStorage.getItem('accessToken');

        if (token) {
          try {
            const response = await fetch('/api/users/me/', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              const data: UserProfile = await response.json();
              setUserProfile(data);
              setLoading(false);
              return;
            } else if (response.status === 401) {
              // 토큰 만료 등
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('isLoggedIn');
              navigate('/login');
              return;
            }
          } catch (apiError) {
            console.error('API 호출 실패:', apiError);
          }
        } else {
          // 토큰이 없으면 로그인 페이지로
          navigate('/login');
          return;
        }

        // 백엔드 API가 없거나 실패 시 로컬스토리지 데이터 사용 (임시) - 이제 필요 없으므로 제거하거나 주석 처리
        /*
        const userName = localStorage.getItem('userName');
        // ...
        */
        setError('로그인이 필요합니다.');


      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  // 아바타 이모지 생성 (이름의 첫 글자 기반)
  const getAvatar = (name: string) => {
    const emojiMap: { [key: string]: string } = {
      '정': '😊', '김': '👨', '이': '👩', '박': '🧑', '최': '👧',
      '홍': '😎', '강': '🤗', '윤': '😄', '장': '😃', '임': '🙂'
    };
    return emojiMap[name.charAt(0)] || '😊';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          <p className="text-gray-600">프로필을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <div className="text-6xl mb-4">😕</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">프로필을 불러올 수 없습니다</h3>
          <p className="text-gray-600 mb-6">{error || '사용자 정보를 찾을 수 없습니다.'}</p>
          <button
            onClick={() => navigate('/onboarding')}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl py-3 font-semibold"
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  const passionScore = Math.round(userProfile.score);

  // 캘린더 데이터 (운동한 날짜)
  const workoutDates = [
    { date: 5, workouts: ['🏀', '🏃'] },
    { date: 6, workouts: ['💪'] },
    { date: 7, workouts: ['🏀'] },
    { date: 9, workouts: ['🏊', '🏃'] },
    { date: 12, workouts: ['🏀', '💪'] },
    { date: 13, workouts: ['🏃'] },
    { date: 14, workouts: ['🏀', '🏊'] },
    { date: 16, workouts: ['💪'] },
    { date: 19, workouts: ['🏀', '🏃', '💪'] },
    { date: 20, workouts: ['🏊'] },
    { date: 21, workouts: ['🏀'] }
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const getWorkoutsForDate = (day: number) => {
    const workout = workoutDates.find(w => w.date === day);
    return workout?.workouts || [];
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  // 통계는 나중에 Member 데이터에서 가져올 수 있지만, 일단 기본값 사용
  const stats = [
    { label: '총 인증', value: 0, icon: Calendar, color: 'indigo' },
    { label: '활동일', value: '0일', icon: TrendingUp, color: 'purple' },
    { label: '커뮤니티', value: userProfile.interests?.length || 0, icon: Users, color: 'pink' }
  ];

  const achievements = [
    { emoji: '🔥', title: '7일 연속 인증', earned: true },
    { emoji: '💪', title: '100회 인증 달성', earned: true },
    { emoji: '🏆', title: '월간 1등', earned: true },
    { emoji: '⭐', title: '30일 연속 인증', earned: false },
    { emoji: '👑', title: '전체 1등', earned: false },
    { emoji: '💎', title: '1년 활동', earned: false }
  ];

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('token');
      navigate('/onboarding');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-20">
      {/* 헤더 */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">마이페이지</h1>
          <button
            onClick={() => alert('설정')}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6">
        {/* 프로필 카드 */}
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full blur-3xl opacity-50"></div>

          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                {userProfile.profile_img_url && (userProfile.profile_img_url.startsWith('http') || userProfile.profile_img_url.startsWith('/') || userProfile.profile_img_url.startsWith('data:')) ? (
                  <img
                    src={userProfile.profile_img_url}
                    alt={userProfile.user_name}
                    className="w-12 h-12 rounded-full object-cover border border-gray-100 shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-xl border border-indigo-100 shadow-sm">
                    {userProfile.profile_img_url || getAvatar(userProfile.user_name)}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{userProfile.user_name}</h2>
                  <p className="text-sm text-gray-500">가입일: {formatDate(userProfile.created_at)}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600"
              >
                <Edit className="w-5 h-5" />
              </button>
            </div>

            {userProfile.interests && userProfile.interests.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {userProfile.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}

            {/* 열정 점수 - 인라인 스타일로 직접 색상 적용하므로 무조건 보임 */}
            <div
              className="rounded-2xl p-4 border transition-all duration-500"
              style={{
                backgroundColor: passionScore < 35 ? 'var(--color-indigo-50)' : passionScore < 65 ? 'var(--color-purple-50)' : 'var(--color-orange-50)',
                borderColor: passionScore < 35 ? 'var(--color-blue-100)' : passionScore < 65 ? 'var(--color-purple-200)' : 'var(--color-orange-100)'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {passionScore < 35 ? (
                    <Snowflake
                      className="w-5 h-5 transition-colors duration-500"
                      style={{ color: 'var(--color-blue-500)' }}
                    />
                  ) : passionScore < 65 ? (
                    <Award
                      className="w-5 h-5 transition-colors duration-500"
                      style={{ color: 'var(--color-purple-600)' }}
                    />
                  ) : (
                    <Flame
                      className="w-5 h-5 transition-colors duration-500"
                      style={{ color: 'var(--color-orange-500)' }}
                    />
                  )}
                  <span className="font-semibold text-gray-900">열정 점수</span>
                </div>
                <span
                  className="text-2xl font-bold transition-colors duration-500"
                  style={{ color: passionScore < 35 ? 'var(--color-blue-500)' : passionScore < 65 ? 'var(--color-purple-600)' : 'var(--color-orange-500)' }}
                >
                  {passionScore}
                </span>
              </div>
              <div
                className="w-full rounded-full h-2 overflow-hidden transition-colors duration-500"
                style={{ backgroundColor: passionScore < 35 ? 'var(--color-blue-100)' : passionScore < 65 ? 'var(--color-purple-200)' : 'var(--color-orange-200)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${passionScore}%`,
                    backgroundColor: passionScore < 35 ? 'var(--color-blue-500)' : passionScore < 65 ? 'var(--color-purple-600)' : 'var(--color-orange-500)'
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-2 font-medium">
                {passionScore < 35 ? '조금 더 힘내보아요! 화이팅 💪' :
                  passionScore < 65 ? '잘 하고 있어요! 이대로 쭉 가봐요 🏃‍♂️' :
                    '정말 멋져요! 최고의 열정입니다 🔥'}
              </p>
            </div>
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-4 shadow-md border border-gray-100"
              >
                <div className={`w-10 h-10 bg-${stat.color}-100 rounded-xl flex items-center justify-center mb-2`}>
                  <Icon className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-600 mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* 업적 */}
        <div className="bg-white rounded-2xl p-5 shadow-md mb-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            나의 업적
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`text-center p-3 rounded-xl border-2 ${achievement.earned
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'
                  : 'bg-gray-50 border-gray-200 opacity-50'
                  }`}
              >
                <div className="text-3xl mb-1">{achievement.emoji}</div>
                <p className="text-xs text-gray-700 font-medium leading-tight">
                  {achievement.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 활동 요약 */}
        <div className="bg-white rounded-2xl p-5 shadow-md mb-6">
          <h3 className="font-bold text-gray-900 mb-4">이번 주 활동</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">월요일</span>
              <div className="flex gap-1">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm">🏀</span>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm">🏃</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">화요일</span>
              <div className="flex gap-1">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm">💪</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">수요일</span>
              <div className="flex gap-1">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm">🏀</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">목요일</span>
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-sm text-gray-400">-</span>
              </div>
            </div>
          </div>
        </div>

        {/* 캘린더 */}
        <div className="bg-white rounded-2xl p-5 shadow-md mb-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            월간 활동
          </h3>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={previousMonth}
              className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h4 className="font-semibold text-gray-900">
              {currentMonth.getFullYear()}년 {monthNames[currentMonth.getMonth()]}
            </h4>
            <button
              onClick={nextMonth}
              className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
              <div key={day} className={`text-xs font-semibold text-center py-2 ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'
                }`}>
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {[...Array(startingDayOfWeek)].map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square"></div>
            ))}
            {[...Array(daysInMonth)].map((_, index) => {
              const day = index + 1;
              const workouts = getWorkoutsForDate(day);
              const hasWorkout = workouts.length > 0;

              return (
                <div
                  key={day}
                  className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all ${hasWorkout
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                    : 'border-gray-100 bg-gray-50/50'
                    }`}
                >
                  <div className={`text-xs mb-0.5 ${hasWorkout ? 'font-semibold text-gray-900' : 'text-gray-400'}`}>
                    {day}
                  </div>
                  {workouts.length > 0 && (
                    <div className="flex gap-0.5">
                      {workouts.slice(0, 2).map((workout, i) => (
                        <span key={i} className="text-xs">
                          {workout}
                        </span>
                      ))}
                      {workouts.length > 2 && (
                        <span className="text-xs text-gray-600">+</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 로그아웃 */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-50 text-red-600 rounded-2xl py-4 font-semibold flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          로그아웃
        </button>
      </div>

      <BottomNav currentPage="mypage" />
    </div>
  );
}