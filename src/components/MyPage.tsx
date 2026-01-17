import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Settings, Edit, Award, TrendingUp, Calendar, Users, LogOut, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import BottomNav from './BottomNav';

export default function MyPage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const userProfile = {
    name: '홍길동',
    avatar: '😊',
    bio: '매일 운동하는 건강한 삶을 추구합니다!',
    joinDate: '2024.01.15',
    totalWorkouts: 142,
    activeDays: 89,
    communities: 4
  };

  const passionScore = 87;

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

  const stats = [
    { label: '총 인증', value: userProfile.totalWorkouts, icon: Calendar, color: 'indigo' },
    { label: '활동일', value: `${userProfile.activeDays}일`, icon: TrendingUp, color: 'purple' },
    { label: '커뮤니티', value: userProfile.communities, icon: Users, color: 'pink' }
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
                <div className="text-6xl">{userProfile.avatar}</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{userProfile.name}</h2>
                  <p className="text-sm text-gray-500">가입일: {userProfile.joinDate}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600"
              >
                <Edit className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">{userProfile.bio}</p>

            {/* 열정 점수 */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-orange-600" />
                  <span className="font-semibold text-gray-900">열정 점수</span>
                </div>
                <span className="text-2xl font-bold text-orange-600">{passionScore}</span>
              </div>
              <div className="w-full bg-orange-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-full transition-all duration-500"
                  style={{ width: `${passionScore}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                🔥 13점만 더 얻으면 다음 레벨업!
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
                className={`text-center p-3 rounded-xl border-2 ${
                  achievement.earned
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
              <div key={day} className={`text-xs font-semibold text-center py-2 ${
                index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'
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
                  className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                    hasWorkout
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