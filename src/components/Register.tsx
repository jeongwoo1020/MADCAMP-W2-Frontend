import { useState } from 'react';
import { useNavigate } from 'react-router';
import { UserPlus, ArrowLeft, Eye, EyeOff, Check, User, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    confirmPassword: '',
    avatar: '😊'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Suggested emojis for avatar
  const avatars = ['😊', '😎', '🤗', '😁', '🥳', '💪', '🔥', '⭐', '🏆', '👑', '🚀', '🐱', '🐶', '🦊', '🦁'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic Validation (UI only mainly, but good to have)
    if (!formData.userId.trim()) {
      toast.warning('아이디를 입력해주세요.');
      return;
    }
    if (!formData.password) {
      toast.warning('비밀번호를 입력해주세요.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.warning('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login_id: formData.userId,
          password: formData.password,
          user_name: formData.userId, // Using userId as default name, can be updated later
          profile_img_url: formData.avatar,
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
      }

      const data = await response.json();

      if (!response.ok) {
        // 백엔드 에러 메시지 처리 (문자열 혹은 객체)
        const errorMsg = data.error || (typeof data === 'object' ? JSON.stringify(data) : '회원가입 실패');
        throw new Error(errorMsg);
      }

      // Automatically login or navigate to login
      localStorage.setItem('accessToken', data.token.access);
      localStorage.setItem('refreshToken', data.token.refresh);
      localStorage.setItem('isLoggedIn', 'true');

      // 유저 정보 저장
      if (data.user) {
        localStorage.setItem('userName', data.user.user_name);
        localStorage.setItem('userId', data.user.user_id);
        localStorage.setItem('userProfile', data.user.profile_img_url || '');
        localStorage.setItem('userScore', String(data.user.score || 0));
      }

      toast.success('회원가입이 완료되었습니다! 환영합니다.');
      navigate('/onboarding');
    } catch (error: any) {
      console.error('회원가입 오류:', error);
      toast.error(error.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4 sm:p-6 transition-all duration-300">
      <div className="max-w-md w-full [perspective:1000px]">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 transform transition-all duration-300 hover:shadow-purple-200/50">

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/login')}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 text-gray-600 hover:text-indigo-600 shadow-sm border border-gray-100 transition-all active:scale-95 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="flex-1">
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                회원가입
              </h2>
              <p className="text-gray-500 mt-1 font-medium">새로운 여정을 시작해보세요</p>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            {/* Avatar Selection */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                <span>나만의 아이콘 선택</span>
                <span className="text-indigo-500 text-xs font-normal bg-indigo-50 px-2 py-0.5 rounded-full">필수</span>
              </label>
              <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 shadow-inner">
                <div className="grid grid-cols-5 gap-3">
                  {avatars.map((avatar) => (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, avatar }))}
                      className={`
                        aspect-square rounded-xl text-2xl flex items-center justify-center transition-all duration-150 relative
                        ${formData.avatar === avatar
                          ? 'bg-white shadow-lg scale-110 z-10'
                          : 'bg-transparent hover:bg-white/60 hover:scale-105 text-gray-400 grayscale hover:grayscale-0'
                        }
                      `}
                    >
                      <span className="transform transition-transform duration-150">
                        {avatar}
                      </span>
                      {formData.avatar === avatar && (
                        <div
                          className="absolute inset-0 rounded-xl pointer-events-none"
                          style={{ border: '2px solid rgb(147, 51, 234)' }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Input Fields Container */}
            <div className="space-y-4">
              {/* ID Input */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">아이디</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors" style={{ color: 'inherit' }}>
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    name="userId"
                    value={formData.userId}
                    onChange={handleChange}
                    style={{ height: '55px' }}
                    placeholder="아이디를 입력하세요"
                    className="w-full pl-12 pr-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none transition-all font-medium text-gray-700 placeholder:text-gray-400"
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgb(196, 181, 253)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(196, 181, 253, 0.3)';
                      const icon = e.target.previousElementSibling?.querySelector('svg');
                      if (icon) (icon as SVGElement).style.color = 'rgb(147, 51, 234)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgb(229, 231, 235)';
                      e.target.style.boxShadow = 'none';
                      const icon = e.target.previousElementSibling?.querySelector('svg');
                      if (icon) (icon as SVGElement).style.color = 'rgb(156, 163, 175)';
                    }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">비밀번호</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    style={{ height: '55px' }}
                    placeholder="비밀번호 입력"
                    className="w-full pl-12 pr-12 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none transition-all font-medium text-gray-700 placeholder:text-gray-400"
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgb(196, 181, 253)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(196, 181, 253, 0.3)';
                      const icon = e.target.previousElementSibling?.querySelector('svg');
                      if (icon) (icon as SVGElement).style.color = 'rgb(147, 51, 234)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgb(229, 231, 235)';
                      e.target.style.boxShadow = 'none';
                      const icon = e.target.previousElementSibling?.querySelector('svg');
                      if (icon) (icon as SVGElement).style.color = 'rgb(156, 163, 175)';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">비밀번호 확인</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors">
                    <Check className={`w-5 h-5 ${formData.confirmPassword && formData.password === formData.confirmPassword ? 'text-green-500' : ''}`} />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    style={{ height: '55px' }}
                    placeholder="비밀번호 확인"
                    className={`w-full pl-12 pr-12 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none transition-all font-medium text-gray-700 placeholder:text-gray-400
                      ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-300' : ''}
                      ${formData.confirmPassword && formData.password === formData.confirmPassword ? 'border-green-300' : ''}
                    `}
                    onFocus={(e) => {
                      if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
                        e.target.style.borderColor = 'rgb(252, 165, 165)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(252, 165, 165, 0.3)';
                      } else if (formData.confirmPassword && formData.password === formData.confirmPassword) {
                        e.target.style.borderColor = 'rgb(134, 239, 172)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(134, 239, 172, 0.3)';
                      } else {
                        e.target.style.borderColor = 'rgb(196, 181, 253)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(196, 181, 253, 0.3)';
                      }
                      const icon = e.target.previousElementSibling?.querySelector('svg');
                      if (icon && !(formData.confirmPassword && formData.password === formData.confirmPassword)) {
                        (icon as SVGElement).style.color = 'rgb(147, 51, 234)';
                      }
                    }}
                    onBlur={(e) => {
                      if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
                        e.target.style.borderColor = 'rgb(252, 165, 165)';
                      } else if (formData.confirmPassword && formData.password === formData.confirmPassword) {
                        e.target.style.borderColor = 'rgb(134, 239, 172)';
                      } else {
                        e.target.style.borderColor = 'rgb(229, 231, 235)';
                      }
                      e.target.style.boxShadow = 'none';
                      const icon = e.target.previousElementSibling?.querySelector('svg');
                      if (icon && !(formData.confirmPassword && formData.password === formData.confirmPassword)) {
                        (icon as SVGElement).style.color = 'rgb(156, 163, 175)';
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-red-500 text-xs ml-1 mt-1 font-medium animate-pulse">비밀번호가 일치하지 않습니다</p>
                )}
              </div>
            </div>

            <div style={{ marginTop: '20px' }} />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl py-4 font-bold text-lg shadow-lg hover:shadow-indigo-500/30 hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
              {loading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="relative z-10">가입 중입니다...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-6 h-6 relative z-10 group-hover:rotate-12 transition-transform" />
                  <span className="relative z-10">회원가입 완료</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
