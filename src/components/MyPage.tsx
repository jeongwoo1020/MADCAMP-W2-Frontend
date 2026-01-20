import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Settings, Edit, Award, TrendingUp, Calendar, Users, LogOut, Trophy, ChevronLeft, ChevronRight, Loader2, Snowflake, Flame, X } from 'lucide-react';
import BottomNav from './BottomNav';
import { toast } from 'sonner';

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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    // 초기 로딩 시 로컬스토리지 캐시 사용 (버퍼링 제거)
    const cachedName = localStorage.getItem('userName');
    if (cachedName) {
      return {
        user_id: localStorage.getItem('userId') || '',
        user_name: cachedName,
        score: Number(localStorage.getItem('userScore')) || 50,
        interests: [],
        profile_img_url: localStorage.getItem('userProfile') || null,
        created_at: new Date().toISOString()
      };
    }
    return null;
  });
  const [loading, setLoading] = useState(!userProfile);
  const [error, setError] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    console.log("마이페이지가 렌더링되었습니다. 문구 색상: 회색(#6b7280)");
    const fetchUserProfile = async () => {
      try {
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
          navigate('/login');
          return;
        }
        setError('로그인이 필요합니다.');
        toast.error('로그인이 필요합니다.');
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
        toast.error(err instanceof Error ? err.message : '오류가 발생했습니다.');
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // 가입일로부터 며칠 지났는지 계산 (D-Day)
  const calculateDaysSince = (dateString: string) => {
    const createdDate = new Date(dateString);
    const today = new Date();
    createdDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - createdDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

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
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
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
            onClick={() => navigate('/login')}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl py-3 font-semibold"
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  const passionScore = Math.round(userProfile.score);

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
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userScore');
    toast.success('로그아웃 되었습니다.');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-20">
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">마이페이지</h1>
          <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6">
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
                  <p className="text-sm font-medium" style={{ color: '#6b7280' }}>운동메이트와 함께한 지 {calculateDaysSince(userProfile.created_at)}일</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/edit-profile')}
                className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 hover:bg-indigo-200 transition-colors"
              >
                <Edit className="w-5 h-5" />
              </button>
            </div>

            {userProfile.interests && userProfile.interests.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {userProfile.interests.map((interest, index) => (
                  <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                    {interest}
                  </span>
                ))}
              </div>
            )}

            <div
              className="rounded-2xl p-4 border transition-all duration-500"
              style={{
                backgroundColor: passionScore < 35 ? 'var(--color-indigo-50)' : passionScore < 65 ? 'var(--color-purple-50)' : 'var(--color-orange-50)',
                borderColor: passionScore < 35 ? 'var(--color-blue-100)' : passionScore < 65 ? 'var(--color-purple-200)' : 'var(--color-orange-100)'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {passionScore < 35 ? <Snowflake className="w-5 h-5" style={{ color: 'var(--color-blue-500)' }} /> :
                    passionScore < 65 ? <Award className="w-5 h-5" style={{ color: 'var(--color-purple-600)' }} /> :
                      <Flame className="w-5 h-5" style={{ color: 'var(--color-orange-500)' }} />}
                  <span className="font-semibold text-gray-900">열정 점수</span>
                </div>
                <span className="text-2xl font-bold" style={{ color: passionScore < 35 ? 'var(--color-blue-500)' : passionScore < 65 ? 'var(--color-purple-600)' : 'var(--color-orange-500)' }}>
                  {passionScore}
                </span>
              </div>
              <div className="w-full rounded-full h-2 overflow-hidden bg-white">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${passionScore}%`,
                    backgroundColor: passionScore < 35 ? 'var(--color-blue-500)' : passionScore < 65 ? 'var(--color-purple-600)' : 'var(--color-orange-500)'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 text-center">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 mx-auto"
                  style={{
                    backgroundColor: stat.color === 'indigo' ? '#e0e7ff' : stat.color === 'purple' ? '#f5f3ff' : '#fdf2f8',
                    color: stat.color === 'indigo' ? '#4f46e5' : stat.color === 'purple' ? '#9333ea' : '#db2777'
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-md mb-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            나의 업적
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {achievements.map((achievement, index) => (
              <div key={index} className={`text-center p-3 rounded-xl border-2 ${achievement.earned ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-transparent opacity-40'}`}>
                <div className="text-3xl mb-1">{achievement.emoji}</div>
                <p className="text-xs text-gray-700 font-medium">{achievement.title}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-md mb-6">
          <Calendar className="w-8 h-8 text-indigo-600 mb-2" />
          <h3 className="font-bold text-gray-900 mb-4">활동 캘린더</h3>
          <div className="flex items-center justify-between mb-4">
            <button onClick={previousMonth} className="p-1 hover:bg-gray-100 rounded-full"><ChevronLeft /></button>
            <span className="font-bold">{currentMonth.getFullYear()}년 {monthNames[currentMonth.getMonth()]}</span>
            <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full"><ChevronRight /></button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {['일', '월', '화', '수', '목', '금', '토'].map(d => <div key={d} className="text-center text-xs text-gray-400 py-2">{d}</div>)}
            {[...Array(startingDayOfWeek)].map((_, i) => <div key={i} />)}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const workouts = getWorkoutsForDate(day);
              return (
                <div
                  key={day}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs ${workouts.length ? 'font-bold' : 'text-gray-400'}`}
                  style={workouts.length ? { backgroundColor: '#fefce8', color: '#ca8a04' } : {}}
                >
                  {day}
                  <div className="flex gap-0.5 mt-0.5">
                    {workouts.slice(0, 2).map((w, idx) => <span key={idx} className="scale-75">{w}</span>)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full bg-red-50 text-red-600 rounded-2xl py-4 font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <LogOut className="w-5 h-5" />
          로그아웃하기
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          onClick={() => setShowLogoutConfirm(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'white', borderRadius: '1.5rem', width: '100%', maxWidth: '24rem', padding: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #f3f4f6' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ width: '3rem', height: '3rem', backgroundColor: '#f5f3ff', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
                <LogOut className="w-6 h-6" />
              </div>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{ padding: '0.5rem', cursor: 'pointer', border: 'none', backgroundColor: 'transparent' }}
              >
                <X className="w-5 h-5" style={{ color: '#9ca3af' }} />
              </button>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem', lineHeight: 1.25 }}>로그아웃 하시겠습니까?</h3>
            <p style={{ color: '#4b5563', marginBottom: '2rem', fontWeight: 500, lineHeight: 1.625 }}>
              정말로 로그아웃 하시겠나요?<br />다음에 또 만나요!
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1,
                  padding: '1rem',
                  borderRadius: '1rem',
                  fontWeight: 700,
                  color: '#374151',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                onClick={handleLogout}
                style={{
                  flex: 1,
                  padding: '1rem',
                  borderRadius: '1rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  backgroundColor: '#7c3aed',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 10px 15px -3px rgba(124, 58, 237, 0.2)'
                }}
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav currentPage="mypage" />
    </div>
  );
}