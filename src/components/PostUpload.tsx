import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Camera, X, Check } from 'lucide-react';

export default function PostUpload() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 컴포넌트 마운트 시 자동으로 카메라 열기
  useEffect(() => {
    if (!capturedImage) {
      fileInputRef.current?.click();
    }
  }, []);

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // 카메라 취소 시 뒤로 가기
      navigate(`/community/${id}`);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  // DataURL을 Blob으로 변환하는 헬퍼 함수
  const dataURLtoBlob = (dataurl: string) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const handleUpload = async () => {
    if (!capturedImage || !id) return;

    try {
      const blob = dataURLtoBlob(capturedImage);
      const formData = new FormData();
      formData.append('com_uuid', id);
      formData.append('image_url', blob, 'upload.jpg');
      formData.append('latitude', '0.0');
      formData.append('longitude', '0.0');

      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/posts/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        // 오늘 날짜를 키로 인증 완료 저장
        const today = new Date().toDateString();
        localStorage.setItem(`hasPostedToday_${id}`, today);
        alert('인증 완료! 🎉');
        navigate(`/community/${id}`);
      } else {
        const errorData = await response.json();
        alert(`업로드 실패: ${errorData.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('업로드 중 오류가 발생했습니다.');
    }
  };

  const handleCancel = () => {
    navigate(`/community/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col">
      {/* 헤더 */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleCancel}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">운동 인증</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* 숨겨진 파일 입력 (카메라) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageCapture}
        className="hidden"
      />

      <div className="flex-1 flex items-center justify-center p-6">
        {capturedImage ? (
          <div className="max-w-md w-full">
            {/* 촬영된 이미지 미리보기 */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl mb-6">
              <img
                src={capturedImage}
                alt="촬영된 사진"
                className="w-full aspect-[3/4] object-cover"
              />
            </div>

            {/* 액션 버튼 */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleRetake}
                className="bg-white text-gray-700 rounded-2xl py-4 font-semibold shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2 border border-gray-200"
              >
                <Camera className="w-5 h-5" />
                다시 찍기
              </button>
              <button
                onClick={handleUpload}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl py-4 font-semibold shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                인증하기
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Camera className="w-10 h-10 text-white" />
            </div>
            <p className="text-gray-600 mb-2">카메라를 열고 있습니다...</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-indigo-600 font-medium text-sm"
            >
              카메라가 열리지 않나요? 클릭하세요
            </button>
          </div>
        )}
      </div>
    </div>
  );
}