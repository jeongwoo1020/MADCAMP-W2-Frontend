import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Upload, X, Camera } from 'lucide-react';

export default function JoinCommunity() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [normalImage, setNormalImage] = useState<string | null>(null);
  const [shameImage, setShameImage] = useState<string | null>(null);

  const normalImageRef = useRef<HTMLInputElement>(null);
  const shameImageRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'normal' | 'shame'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'normal') {
          setNormalImage(reader.result as string);
        } else {
          setShameImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleJoin = () => {
    if (!nickname.trim()) {
      alert('닉네임을 입력해주세요!');
      return;
    }
    if (!normalImage) {
      alert('정상 이미지를 업로드해주세요!');
      return;
    }
    if (!shameImage) {
      alert('수치 이미지를 업로드해주세요!');
      return;
    }

    // 커뮤니티 가입 로직
    alert('커뮤니티 가입 완료!');
    navigate(`/community/${id}`);
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
          <h1 className="text-xl font-bold">커뮤니티 가입</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6">
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
          {/* 닉네임 */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              닉네임
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="커뮤니티에서 사용할 닉네임"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
              maxLength={20}
            />
          </div>

          {/* 자기소개 */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              한줄 소개
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="간단한 자기소개를 입력해주세요"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none"
              rows={3}
              maxLength={100}
            />
          </div>
        </div>

        {/* 정상 이미지 업로드 */}
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">정상 이미지 ✨</h3>
              <p className="text-xs text-gray-500 mt-1">운동 완료 시 보여질 사진</p>
            </div>
          </div>
          
          <div
            onClick={() => normalImageRef.current?.click()}
            className="relative aspect-square bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-dashed border-green-300 flex flex-col items-center justify-center cursor-pointer hover:bg-green-100 transition-all overflow-hidden"
          >
            {normalImage ? (
              <>
                <img
                  src={normalImage}
                  alt="정상 이미지"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNormalImage(null);
                  }}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Camera className="w-12 h-12 text-green-400 mb-2" />
                <p className="text-sm font-medium text-green-600">사진 업로드</p>
              </>
            )}
          </div>
          <input
            ref={normalImageRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, 'normal')}
            className="hidden"
          />
        </div>

        {/* 수치 이미지 업로드 */}
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">수치 이미지 💀</h3>
              <p className="text-xs text-gray-500 mt-1">운동 미완료 시 공개될 사진</p>
            </div>
          </div>
          
          <div
            onClick={() => shameImageRef.current?.click()}
            className="relative aspect-square bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border-2 border-dashed border-red-300 flex flex-col items-center justify-center cursor-pointer hover:bg-red-100 transition-all overflow-hidden"
          >
            {shameImage ? (
              <>
                <img
                  src={shameImage}
                  alt="수치 이미지"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShameImage(null);
                  }}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Camera className="w-12 h-12 text-red-400 mb-2" />
                <p className="text-sm font-medium text-red-600">사진 업로드</p>
              </>
            )}
          </div>
          <input
            ref={shameImageRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, 'shame')}
            className="hidden"
          />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
          <p className="text-sm text-yellow-800">
            💡 <strong>Tip:</strong> 수치 이미지는 인증을 하지 않았을 때 다른 멤버들에게 공개됩니다. 
            동기부여가 될만한 재미있는 사진을 올려보세요!
          </p>
        </div>

        {/* 가입 버튼 */}
        <button
          onClick={handleJoin}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl py-4 font-semibold shadow-lg active:scale-[0.98] transition-transform"
        >
          가입하기
        </button>
      </div>
    </div>
  );
}
