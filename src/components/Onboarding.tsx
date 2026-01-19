import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight, Camera, Users, Trophy, Zap } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: '운동메이트에 오신 것을 환영합니다! 🎉',
      description: '친구들과 함께 운동을 인증하고, 서로 응원하며 건강한 습관을 만들어보세요.',
      icon: Zap,
      color: 'from-indigo-600 to-purple-600'
    },
    {
      title: '매일 운동을 인증하세요 📸',
      description: '정해진 시간에 운동 사진을 찍어 올리고, 친구들의 인증도 확인해보세요.',
      icon: Camera,
      color: 'from-purple-600 to-pink-600'
    },
    {
      title: '커뮤니티를 만들고 참여하세요 👥',
      description: '관심사가 같은 사람들과 함께 운동 커뮤니티를 만들어 동기부여를 받으세요.',
      icon: Users,
      color: 'from-pink-600 to-red-600'
    },
    {
      title: '순위를 확인하고 경쟁하세요 🏆',
      description: '주간/월간 순위를 확인하고, 열정 점수를 올려 1등을 달성해보세요!',
      icon: Trophy,
      color: 'from-orange-600 to-yellow-600'
    }
  ];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // 마지막 단계에서 바로 온보딩 완료
      onComplete();
      navigate('/');
    }
  };

  const handleSkip = () => {
    // 건너뛰기 시 바로 온보딩 완료
    onComplete();
    navigate('/');
  };

  // 튜토리얼 단계
  const step = tutorialSteps[currentStep];
  const Icon = step.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl p-8 shadow-xl">
          {/* 진행 표시 */}
          <div className="flex gap-2 mb-8">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-all ${index <= currentStep
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600'
                    : 'bg-gray-200'
                  }`}
              />
            ))}
          </div>

          {/* 아이콘 */}
          <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
            <Icon className="w-10 h-10 text-white" />
          </div>

          {/* 콘텐츠 */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h2>
            <p className="text-gray-600 leading-relaxed">{step.description}</p>
          </div>

          {/* 버튼 */}
          <div className="space-y-3">
            <button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl py-4 font-semibold shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              {currentStep === tutorialSteps.length - 1 ? '프로필 설정하기' : '다음'}
              <ChevronRight className="w-5 h-5" />
            </button>

            {currentStep < tutorialSteps.length - 1 && (
              <button
                onClick={handleSkip}
                className="w-full text-gray-600 py-3 font-medium"
              >
                건너뛰기
              </button>
            )}
          </div>

          {/* 단계 표시 */}
          <p className="text-center text-sm text-gray-400 mt-6">
            {currentStep + 1} / {tutorialSteps.length}
          </p>
        </div>
      </div>
    </div>
  );
}