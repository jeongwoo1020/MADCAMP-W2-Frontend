import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Send, Smile, Image as ImageIcon } from 'lucide-react';

interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  timestamp: string;
  isMe: boolean;
}

export default function ChatRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      userId: '1',
      userName: '김철수',
      userAvatar: '👨',
      message: '오늘 농구 너무 재밌었어요! 다들 고생하셨습니다 💪',
      timestamp: '09:15',
      isMe: false
    },
    {
      id: '2',
      userId: '2',
      userName: '박영희',
      userAvatar: '👩',
      message: '저도요! 내일도 같이 해요~',
      timestamp: '09:18',
      isMe: false
    },
    {
      id: '3',
      userId: 'me',
      userName: '나',
      userAvatar: '😊',
      message: '좋아요! 내일도 파이팅!',
      timestamp: '09:20',
      isMe: true
    },
    {
      id: '4',
      userId: '3',
      userName: '이민수',
      userAvatar: '🧑',
      message: '날씨가 좋아서 컨디션 최고였어요 🏀',
      timestamp: '09:25',
      isMe: false
    },
    {
      id: '5',
      userId: 'me',
      userName: '나',
      userAvatar: '😊',
      message: '맞아요! 오늘 같은 날 운동하니까 너무 좋았어요',
      timestamp: '09:27',
      isMe: true
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      userId: 'me',
      userName: '나',
      userAvatar: '😊',
      message: messageInput,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');
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
          <div className="text-center">
            <h1 className="font-semibold">농구 채팅방 🏀</h1>
            <p className="text-xs text-gray-500">멤버 12명</p>
          </div>
          <div className="w-10 h-10"></div>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto max-w-md mx-auto w-full px-4 py-6">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2 max-w-[75%] ${msg.isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {!msg.isMe && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-lg">
                      {msg.userAvatar}
                    </div>
                  </div>
                )}
                <div>
                  {!msg.isMe && (
                    <p className="text-xs text-gray-600 mb-1 px-1">{msg.userName}</p>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      msg.isMe
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                        : 'bg-white text-gray-900 shadow-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                  </div>
                  <p className={`text-xs text-gray-400 mt-1 px-1 ${msg.isMe ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </p>
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
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                messageInput.trim()
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