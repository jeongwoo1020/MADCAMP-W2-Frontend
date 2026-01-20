import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import Home from './components/Home';
import CommunityFeed from './components/CommunityFeed';
import CommunityProfile from './components/CommunityProfile';
import PostUpload from './components/PostUpload';
import ChatRoom from './components/ChatRoom';
import Leaderboard from './components/Leaderboard';
import MyPage from './components/MyPage';
import Onboarding from './components/Onboarding';
import Login from './components/Login';
import Register from './components/Register';
import CreateCommunity from './components/CreateCommunity';
import JoinCommunity from './components/JoinCommunity';
import HallOfShame from './components/HallOfShame';
import CommunitySearchResult from './components/CommunitySearchResult';
import EditProfile from './components/EditProfile';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');

  useEffect(() => {
    // 테마 또는 로그인 상태 변경 감지 필요시 (옵션)
    const loginStatus = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== (loginStatus === 'true')) {
      setIsLoggedIn(loginStatus === 'true');
    }
  }, [isLoggedIn]);

  return (
    <Router>
      <Toaster position="top-center" richColors />
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route
            path="/"
            element={isLoggedIn ? <Home /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={<Login />}
          />
          <Route
            path="/register"
            element={<Register />}
          />
          <Route
            path="/onboarding"
            element={<Onboarding onComplete={() => setIsLoggedIn(true)} />}
          />
          <Route path="/create-community" element={<CreateCommunity />} />
          <Route path="/search-community" element={<CommunitySearchResult />} />
          <Route path="/join-community/:id" element={<JoinCommunity />} />
          <Route path="/community/:id" element={<CommunityFeed />} />
          <Route path="/community/:id/profile" element={<CommunityProfile />} />
          <Route path="/community/:id/upload" element={<PostUpload />} />
          <Route path="/community/:id/chat" element={<ChatRoom />} />
          <Route path="/community/:id/leaderboard" element={<Leaderboard />} />
          <Route path="/community/:id/shame" element={<HallOfShame />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/mypage" element={<MyPage />} />
        </Routes>
      </div>
    </Router>
  );
}