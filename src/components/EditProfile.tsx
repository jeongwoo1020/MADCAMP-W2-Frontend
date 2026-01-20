import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Camera, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
    user_id: string;
    user_name: string;
    score: number;
    interests: string[];
    profile_img_url: string | null;
    created_at: string;
}

export default function EditProfile() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userName, setUserName] = useState('');
    const [profileImg, setProfileImg] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await fetch('/api/users/me/', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data: UserProfile = await response.json();
                    setUserName(data.user_name);
                    setProfileImg(data.profile_img_url);
                } else {
                    toast.error('프로필 정보를 불러오는데 실패했습니다.');
                }
            } catch (err) {
                console.error('Fetch profile error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImg(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!userName.trim()) {
            toast.error('이름을 입력해주세요.');
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/users/me/', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_name: userName,
                    profile_img_url: profileImg,
                }),
            });

            if (response.ok) {
                const updatedUser: UserProfile = await response.json();
                // 로컬 스토리지 동기화
                localStorage.setItem('userName', updatedUser.user_name);
                if (updatedUser.profile_img_url) {
                    localStorage.setItem('userProfile', updatedUser.profile_img_url);
                }

                toast.success('프로필이 수정되었습니다! ✨');
                navigate('/mypage');
            } else {
                toast.error('수정에 실패했습니다.');
            }
        } catch (err) {
            console.error('Update profile error:', err);
            toast.error('오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            {/* 헤더 */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/mypage')}
                        className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="text-lg font-bold">프로필 수정</h1>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="text-indigo-600 font-bold hover:text-indigo-700 disabled:opacity-50"
                    >
                        {saving ? '저장 중...' : '완료'}
                    </button>
                </div>
            </div>

            <div className="max-w-md mx-auto px-6 py-10">
                <div className="flex flex-col items-center mb-10">
                    <div className="relative group">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-28 h-28 rounded-full bg-indigo-50 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl cursor-pointer group-hover:opacity-90 transition-all"
                        >
                            {profileImg ? (
                                <img src={profileImg} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-4xl">😊</div>
                            )}
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">프로필 사진 클릭하여 변경</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                    />
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                            닉네임
                        </label>
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="이름을 입력하세요"
                            className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                        />
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 opacity-50 cursor-not-allowed">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                            관심 종목 (준비 중)
                        </label>
                        <div className="flex flex-wrap gap-2 text-gray-400 text-sm">
                            내 관심 있는 운동 종목들을 수정할 수 있습니다.
                        </div>
                    </div>
                </div>

                <div className="mt-10">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-indigo-600 text-white rounded-2xl py-4 font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                        변경사항 저장하기
                    </button>
                </div>
            </div>
        </div>
    );
}
