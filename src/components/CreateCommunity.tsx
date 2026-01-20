import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Camera } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateCommunity() {
  const navigate = useNavigate();
  const [communityName, setCommunityName] = useState('');
  const [communityId, setCommunityId] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [certificationTime, setCertificationTime] = useState('19:00');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const days = [
    { id: 'mon', label: '월' },
    { id: 'tue', label: '화' },
    { id: 'wed', label: '수' },
    { id: 'thu', label: '목' },
    { id: 'fri', label: '금' },
    { id: 'sat', label: '토' },
    { id: 'sun', label: '일' }
  ];

  const toggleDay = (dayId: string) => {
    setSelectedDays(prev =>
      prev.includes(dayId)
        ? prev.filter(id => id !== dayId)
        : [...prev, dayId]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedIcon(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async () => {
    // 1. 입력값 검증
    if (!communityName.trim()) {
      toast.error('커뮤니티 이름을 입력해주세요!');
      return;
    }
    if (!communityId.trim()) {
      toast.error('커뮤니티 ID를 입력해주세요!');
      return;
    }
    if (selectedDays.length === 0) {
      toast.error('인증 요일을 최소 1개 선택해주세요!');
      return;
    }

    // 2. 실제 백엔드 서버(8000번)로 데이터 전송
    try {
      const response = await fetch('/api/communities/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          com_name: communityName,
          com_id: communityId,
          description: description,
          icon_url: selectedIcon || '', // 이미지 없으면 빈 문자열
          cert_days: selectedDays,
          cert_time: certificationTime,
        }),
      });

      // 3. 응답 결과 처리
      if (response.ok) {
        toast.success(`커뮤니티 "${communityName}" 생성 완료!`);
        navigate('/'); // 성공 시 메인 페이지로 이동
      } else {
        const errorData = await response.json();
        console.error("서버 에러 상세:", errorData);
        toast.error(`생성 실패: ${errorData.detail || JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error("네트워크 에러:", error);
      toast.error("서버에 연결할 수 없습니다.");
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
          <h1 className="text-xl font-bold">커뮤니티 만들기</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6">
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
          {/* 아이콘 선택 (이미지 업로드) */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              커뮤니티 대표 사진
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative aspect-video w-full bg-gray-100 rounded-2xl overflow-hidden cursor-pointer hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-300 flex flex-col items-center justify-center group"
            >
              {selectedIcon ? (
                <>
                  <img src={selectedIcon} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-gray-400 group-hover:text-gray-600 transition-colors">
                  <Camera className="w-12 h-12 mb-2" />
                  <span className="text-sm font-medium">사진 업로드하기</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          {/* 커뮤니티 이름 */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              커뮤니티 이름
            </label>
            <input
              type="text"
              value={communityName}
              onChange={(e) => setCommunityName(e.target.value)}
              placeholder="예: 아침 러닝 크루"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
              maxLength={30}
            />
          </div>

          {/* 커뮤니티 ID */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              커뮤니티 ID
            </label>
            <input
              type="text"
              value={communityId}
              onChange={(e) => setCommunityId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="예: morning_running"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono"
              maxLength={20}
            />
            <p className="text-xs text-gray-500 mt-1">영문 소문자, 숫자, 언더스코어(_)만 사용 가능</p>
          </div>

          {/* 한줄 소개 */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              한줄 소개
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="커뮤니티를 소개해주세요"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none"
              rows={3}
              maxLength={100}
            />
          </div>
        </div>

        {/* 인증 방식 */}
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">인증 방식</h3>

          {/* 요일 선택 */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              인증 요일
            </label>
            <div className="flex gap-2">
              {days.map((day) => (
                <button
                  key={day.id}
                  onClick={() => toggleDay(day.id)}
                  className={`flex-1 aspect-square rounded-xl font-semibold transition-all ${selectedDays.includes(day.id)
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {/* 시간 선택 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              인증 시간
            </label>
            <input
              type="time"
              value={certificationTime}
              onChange={(e) => setCertificationTime(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <p className="text-xs text-gray-500 mt-1">이 시간까지 인증을 완료해야 합니다</p>
          </div>
        </div>

        {/* 생성 버튼 */}
        <button
          onClick={handleCreate}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl py-4 font-semibold shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          커뮤니티 만들기
        </button>
      </div>
    </div>
  );
}
