import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Send, Image as ImageIcon } from 'lucide-react';

interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  timestamp: string;
  isMe: boolean;
}

interface CommunityInfo {
  com_name: string;
  icon_url: string;
  member_count: number;
}

export default function ChatRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [communityInfo, setCommunityInfo] = useState<CommunityInfo | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 웹소켓 객체 유지를 위한 Ref
  const socketRef = useRef<WebSocket | null>(null);

  // localStorage에서 userId & accessToken 값 가져오기 (채팅 사용자 인증)
  const myUserId = localStorage.getItem('userId');
  const accessToken = localStorage.getItem('accessToken');

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
    }
  };

  // 커뮤니티 정보 가져오기
  useEffect(() => {
    const fetchCommunityInfo = async () => {
      if (!id || !accessToken) return;
      try {
        const response = await fetch(`/api/communities/${id}/`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setCommunityInfo({
            com_name: data.com_name || '채팅방',
            icon_url: data.icon_url || '💬',
            member_count: data.member_count || 0,
          });
        }
      } catch (error) {
        console.error('Failed to fetch community info:', error);
      }
    };
    fetchCommunityInfo();
  }, [id, accessToken]);

  useEffect(() => {
    if (!id || !accessToken) return;

    // 1. 웹소켓 연결 주소 설정 (id=com_uuid)
    const socketUrl = `ws://localhost:8000/ws/chat/${id}/?token=${accessToken}`;
    socketRef.current = new WebSocket(socketUrl);

    // 2. 웹소켓 이벤트 핸들러 설정
    socketRef.current.onopen = () => {
      console.log("채팅방 연결 성공!");
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data); // 서버에서 보낸 데이터 수신

      // 수신한 데이터를 Message 인터페이스 형식으로 변환
      const newMessage: Message = {
        id: Date.now().toString(), // 임시 ID
        userId: data.user_id,
        userName: data.nickname,
        userAvatar: '👤', // 기본 아바타
        message: data.message,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        isMe: data.user_id === myUserId // 내 ID와 비교하여 판별
      };

      setMessages((prev) => [...prev, newMessage]);
    };

    socketRef.current.onclose = () => {
      console.log("채팅방 연결 종료");
    };

    return () => {
      socketRef.current?.close();
    };
  }, [id, accessToken, myUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !socketRef.current) return;

    // 3. 서버로 메시지 전송
    const sendData = {
      message: messageInput
    };

    socketRef.current.send(JSON.stringify(sendData));
    setMessageInput('');
    // 메시지 전송 후 즉시 스크롤
    setTimeout(() => scrollToBottom(false), 50);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col">
      {/* 헤더 */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center flex items-center justify-center gap-2">
            {communityInfo ? (
              <>
                {(communityInfo.icon_url?.startsWith('http') || communityInfo.icon_url?.startsWith('/') || communityInfo.icon_url?.startsWith('data:')) ? (
                  <img src={communityInfo.icon_url} alt="icon" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <span className="text-xl">{communityInfo.icon_url || '💬'}</span>
                )}
                <h1 className="font-semibold">{communityInfo.com_name}</h1>
              </>
            ) : (
              <h1 className="font-semibold">채팅방 로딩중...</h1>
            )}
          </div>
          <p className="text-xs text-gray-500 text-center">
            {communityInfo ? `멤버 ${communityInfo.member_count}명` : ''}
          </p>
          <div className="w-10 h-10"></div>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto max-w-md mx-auto w-full px-4 py-6">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-2 max-w-[75%] ${msg.isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* 아바타 및 내용 출력 로직 (동일) */}
                <div className={`rounded-2xl px-4 py-2 ${msg.isMe ? 'bg-indigo-600 text-white' : 'bg-white'}`}>
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 입력 영역 */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-end gap-2">
            <button
              onClick={() => alert('이미지 전송 기능')}
              className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="메시지를 입력하세요..."
                className="w-full bg-transparent resize-none focus:outline-none text-sm max-h-24"
                rows={1}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${messageInput.trim()
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                : 'bg-gray-200 text-gray-400'
                }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
