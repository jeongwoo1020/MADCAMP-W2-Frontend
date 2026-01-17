import { useNavigate } from 'react-router';
import { Home, User } from 'lucide-react';

interface BottomNavProps {
  currentPage: 'home' | 'mypage';
}

export default function BottomNav({ currentPage }: BottomNavProps) {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto px-6 py-3">
        <div className="flex items-center justify-around">
          <button
            onClick={() => navigate('/')}
            className={`flex flex-col items-center gap-1 py-2 px-6 rounded-xl transition-all ${
              currentPage === 'home'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                : 'text-gray-600'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">홈</span>
          </button>

          <button
            onClick={() => navigate('/mypage')}
            className={`flex flex-col items-center gap-1 py-2 px-6 rounded-xl transition-all ${
              currentPage === 'mypage'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                : 'text-gray-600'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">마이</span>
          </button>
        </div>
      </div>
    </div>
  );
}