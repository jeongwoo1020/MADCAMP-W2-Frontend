import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Send, Image as ImageIcon, Loader2 } from 'lucide-react';

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

interface MemberInfo {
  user_id: string;
  nick_name: string;
  profile_img_url: string;
  is_me?: boolean;
}

export default function ChatRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [communityInfo, setCommunityInfo] = useState<CommunityInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 멤버 정보를 담을 맵 (userId -> {name, avatar})
  const [memberMap, setMemberMap] = useState<Record<string, { name: string, avatar: string }>>({});

  // localStorage에서 userId & accessToken 값 가져오기
  const myUserId = localStorage.getItem('userId') || localStorage.getItem('user_id');
  const accessToken = localStorage.getItem('accessToken');

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
    }
  };

  // 1. 커뮤니티 정보 및 멤버 목록 가져오기 (최초 1회)
  useEffect(() => {
    const fetchInfo = async () => {
      if (!id || !accessToken) return;
      try {
        const headers: Record<string, string> = {
          'Authorization': `Bearer ${accessToken}`,
        };

        // 커뮤니티 상세 정보
        const comRes = await fetch(`/api/communities/${id}/`, { headers });
        if (comRes.ok) {
          const data = await comRes.json();
          setCommunityInfo({
            com_name: data.com_name || '채팅방',
            icon_url: data.icon_url || '💬',
            member_count: 0 // 멤버 API에서 다시 업데이트
          });
        }

        // 멤버 목록 (닉네임/프사 매핑용)
        const memRes = await fetch(`/api/members/get_members/?com_uuid=${id}`, { headers });
        if (memRes.ok) {
          const membersData = await memRes.json();
          setCommunityInfo(prev => prev ? ({ ...prev, member_count: membersData.length }) : null);

          const memberPromises = membersData.map(async (m: any) => {
            let name = m.nick_name || m.nickname || m.user_name;
            let avatar = m.profile_img_url || m.shame_img_url;

            // 닉네임이나 아바타가 없으면 유저 정보 직접 조회
            if ((!name || !avatar) && m.user_id) {
              try {
                const userRes = await fetch(`/api/users/${m.user_id}/`, { headers });
                if (userRes.ok) {
                  const userData = await userRes.json();
                  if (!name) name = userData.user_name;
                  if (!avatar) avatar = userData.profile_img_url;
                }
              } catch (err) {
                console.error(`Failed to fetch user ${m.user_id}`, err);
              }
            }

            return {
              id: m.user_id,
              name: name || '알 수 없음',
              avatar: avatar || '👤'
            };
          });

          const resolvedMembers = await Promise.all(memberPromises);
          const newMap: Record<string, { name: string, avatar: string }> = {};
          resolvedMembers.forEach(rm => {
            newMap[rm.id] = { name: rm.name, avatar: rm.avatar };
          });

          setMemberMap(newMap);
        }

      } catch (error) {
        console.error('Failed to fetch info:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, [id, accessToken]);

  // 2. 메시지 목록 폴링 (1초마다 갱신)
  useEffect(() => {
    if (!id || !accessToken) return;

    let isMounted = true;

    const fetchMessages = async () => {
      try {
        // 백엔드에서 제공하는 필터링 된 채팅 내역 API 사용
        const response = await fetch(`/api/chats/chat_history/?com_uuid=${id}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (response.ok && isMounted) {
          const data = await response.json();
          // API에서 이미 com_uuid로 필터링 및 정렬(created_at)되어 반환됨

          const mappedMessages: Message[] = data.map((msg: any) => {
            const sender = memberMap[msg.user_id] || { name: '알 수 없음', avatar: '👤' };
            const timeStr = new Date(msg.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

            return {
              id: msg.comment_id || msg.id,
              userId: msg.user_id,
              userName: sender.name,
              userAvatar: sender.avatar,
              message: msg.content,
              timestamp: timeStr,
              isMe: String(msg.user_id) === String(myUserId)
            };
          });

          setMessages(prev => {
            // 새로운 메시지가 있을 때만 상태 업데이트 (불필요한 렌더링 방지)
            const hasLengthChanged = prev.length !== mappedMessages.length;
            const hasContentChanged = prev.some((p, i) =>
              p.userName !== mappedMessages[i].userName ||
              p.userAvatar !== mappedMessages[i].userAvatar
            );

            if (hasLengthChanged || hasContentChanged) {
              if (hasLengthChanged) {
                setTimeout(() => scrollToBottom(true), 100);
              }
              return mappedMessages;
            }
            return prev; // 변경 없음
          });
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    // 초기 실행
    fetchMessages();

    // 1초 간격 폴링
    const interval = setInterval(fetchMessages, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [id, accessToken, myUserId, memberMap]); // memberMap이 업데이트되면 메시지 정보도 갱신

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !id || !myUserId) return;

    try {
      const payload = {
        com_uuid: id,
        user_id: myUserId,
        content: messageInput
      };

      const response = await fetch(`/api/chats/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setMessageInput('');
        // 전송 성공 시 즉시 리스트 갱신은 폴링에 맡기거나, 
        // 사용자 경험을 위해 로컬에 임시 추가할 수도 있음. 여기선 폴링에 맡김.
        // 하지만 빠른 반응을 위해 fetch 한번 더 실행해주면 좋음
        // (폴링 로직과 겹치므로 생략 가능하나 즉각 반응을 원하면 추가)
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Send error:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col">
      {/* 헤더 */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(`/community/${id}`)}
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
              <h1 className="font-semibold">채팅방</h1>
            )}
          </div>
          <p className="text-xs text-gray-500 text-center w-10">
            {/* {communityInfo ? communityInfo.member_count : 0} */}
          </p>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto max-w-md mx-auto w-full px-4 py-4 scrollbar-hide">
        <div className="space-y-2">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 py-10">
              <p>첫 메시지를 남겨보세요! 👋</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              // 연속된 메시지인지 확인
              const isSequence = idx > 0 && messages[idx - 1].userId === msg.userId;
              const nextIsSequence = idx < messages.length - 1 && messages[idx + 1].userId === msg.userId;

              const nextMsg = messages[idx + 1];
              const showTimestamp = !nextMsg || nextMsg.userId !== msg.userId || nextMsg.timestamp !== msg.timestamp;

              return (
                <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-1 duration-75 ${!nextIsSequence ? 'mb-4' : ''}`}>
                  <div className={`flex gap-2 max-w-[85%] items-end ${msg.isMe ? 'flex-row-reverse' : 'flex-row'}`}>

                    {/* 아바타: 상대방이면서 그룹의 마지막 메시지일 때만 표시 */}
                    {!msg.isMe && (
                      <div className="flex-shrink-0 w-8 h-8">
                        {!nextIsSequence && (
                          (msg.userAvatar.startsWith('http') || msg.userAvatar.startsWith('/') || msg.userAvatar.startsWith('data:'))
                            ? <img src={msg.userAvatar} className="w-8 h-8 rounded-full object-cover border border-gray-100" />
                            : <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">{msg.userAvatar}</div>
                        )}
                      </div>
                    )}

                    <div className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                      {/* 이름: 상대방이면서 첫 메시지일 때 표시 */}
                      {!msg.isMe && !isSequence && (
                        <p className="text-xs text-gray-500 mb-1 ml-1">{msg.userName}</p>
                      )}

                      <div className="flex items-end gap-1">
                        {/* 내 메시지일 때: 시간 왼쪽 배치 */}
                        {msg.isMe && showTimestamp && (
                          <span className="text-[9px] text-gray-400 whitespace-nowrap mb-0.5" style={{ transform: 'scale(0.8)', transformOrigin: 'bottom right' }}>
                            {msg.timestamp}
                          </span>
                        )}

                        <div className={`
                                rounded-2xl px-3 py-2 text-sm shadow-sm break-words relative
                                ${msg.isMe
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none'
                            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                          }
                            `}>
                          {msg.message}
                        </div>

                        {/* 상대 메시지일 때: 시간 오른쪽 배치 */}
                        {!msg.isMe && showTimestamp && (
                          <span className="text-[9px] text-gray-400 whitespace-nowrap mb-0.5" style={{ transform: 'scale(0.8)', transformOrigin: 'bottom left' }}>
                            {msg.timestamp}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 입력 영역 */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0 z-10 pb-safe">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-end gap-2">
            <button
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="메시지 보내기..."
                className="w-full bg-transparent resize-none focus:outline-none text-sm max-h-24 pt-1"
                rows={1}
                style={{ minHeight: '24px' }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transform transition-all active:scale-95 ${messageInput.trim()
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
