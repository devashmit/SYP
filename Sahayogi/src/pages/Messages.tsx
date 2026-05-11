import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Send, ArrowLeft, MessageCircle, Inbox, CheckCheck,
  Search, SlidersHorizontal, Phone, Info, Mic, Plus,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Navbar from '@/components/Navbar';
import { useSocket } from '@/contexts/SocketContext';
import { API_URL } from '@/config';

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  is_read: boolean;
}

interface Conversation {
  user_id: string;
  username: string;
  avatar_url?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

/* Deterministic avatar color from username initial */
const AVATAR_COLORS = [
  '#C96B72', '#E8956D', '#7B9E87', '#6B8CAE', '#9B7BB8',
  '#C4956A', '#7AADAD', '#B87B8E', '#8B9E6B', '#AE8B6B',
];
function avatarColor(letter: string) {
  return AVATAR_COLORS[(letter.charCodeAt(0) - 65) % AVATAR_COLORS.length];
}

type TabId = 'all' | 'unread' | 'active';

export default function Messages() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const selectedUserIdRef = useRef<string | null>(null);
  const [selectedUsername, setSelectedUsername] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { selectedUserIdRef.current = selectedUserId; }, [selectedUserId]);

  const fetchConversations = async () => {
    try {
      const token = sessionStorage.getItem('sahayogi_token');
      const res = await fetch(`${API_URL}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setConversations(await res.json());
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const fetchMessages = async (otherUserId: string) => {
    try {
      const token = sessionStorage.getItem('sahayogi_token');
      const res = await fetch(`${API_URL}/messages/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setMessages(await res.json());
    } catch { /* silent */ }
  };

  const markMessagesAsRead = async (otherUserId: string) => {
    try {
      const token = sessionStorage.getItem('sahayogi_token');
      await fetch(`${API_URL}/messages/read/${otherUserId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchConversations();
    } catch { /* silent */ }
  };

  useEffect(() => {
    if (!user) return;
    const userParam = searchParams.get('user');
    if (userParam) { setSelectedUserId(userParam); setShowChat(true); }
    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (!selectedUserId) return;
    fetchMessages(selectedUserId);
    markMessagesAsRead(selectedUserId);
    const existing = conversations.find((c) => c.user_id === selectedUserId);
    if (existing) {
      setSelectedUsername(existing.username);
    } else {
      fetch(`${API_URL}/users/profiles/${selectedUserId}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('sahayogi_token')}` },
      }).then((r) => (r.ok ? r.json() : null)).then((p) => { if (p) setSelectedUsername(p.username); });
    }
  }, [selectedUserId]);

  useEffect(() => {
    if (!socket || !user) return;
    const handler = (message: Message) => {
      fetchConversations();
      const cur = selectedUserIdRef.current;
      if (cur && (message.sender_id === cur || message.receiver_id === cur)) {
        setMessages((prev) => [...prev, message]);
        if (message.sender_id === cur) markMessagesAsRead(cur);
      }
    };
    socket.on('receive_message', handler);
    return () => { socket.off('receive_message', handler); };
  }, [socket, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUserId) return;
    const optimisticContent = newMessage;
    setNewMessage('');
    try {
      const token = sessionStorage.getItem('sahayogi_token');
      const res = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ receiver_id: selectedUserId, content: optimisticContent }),
      });
      if (!res.ok) { toast.error('Failed to send'); setNewMessage(optimisticContent); }
    } catch { toast.error('Failed to send'); setNewMessage(optimisticContent); }
  };

  const handleSelectConversation = (userId: string) => {
    setSelectedUserId(userId);
    setShowChat(true);
  };

  const selectedConversation = conversations.find((c) => c.user_id === selectedUserId);
  const displayUsername = selectedConversation?.username || selectedUsername;
  const displayLetter = displayUsername?.[0]?.toUpperCase() || '?';
  const displayColor = avatarColor(displayLetter);

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch = c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.last_message?.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'unread') return matchesSearch && c.unread_count > 0;
    if (activeTab === 'active') return matchesSearch;
    return matchesSearch;
  });

  const totalUnread = conversations.reduce((s, c) => s + c.unread_count, 0);

  return (
    <div className="min-h-screen" style={{ background: '#F7F5F4' }}>
      <Navbar />

      <div className="pt-24 pb-6 px-0 sm:px-4 max-w-5xl mx-auto">

        {/* ── Page header (hidden when chat open on mobile) ── */}
        <div className={`px-4 sm:px-0 mb-4 ${showChat ? 'hidden lg:block' : 'block'}`}>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm font-medium mb-4 transition-colors"
            style={{ color: '#7A6F6F' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: '#C96B7215' }}>
                <MessageCircle className="w-5 h-5" style={{ color: '#C96B72' }} />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: '#1E1B1B', letterSpacing: '-0.02em' }}>Messages</h1>
                {totalUnread > 0 && (
                  <p className="text-xs font-medium" style={{ color: '#C96B72' }}>{totalUnread} unread</p>
                )}
              </div>
            </div>
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ background: '#C96B7215', color: '#C96B72', border: '1px solid #C96B7230' }}
            >
              {conversations.length} Active
            </span>
          </div>
        </div>

        {/* ── Main layout ── */}
        <div className="flex gap-0 sm:gap-4 h-[calc(100vh-200px)] max-h-[780px]">

          {/* ════ CONVERSATIONS PANEL ════ */}
          <div
            className={`flex flex-col w-full sm:w-[340px] lg:w-[360px] shrink-0 overflow-hidden ${showChat ? 'hidden lg:flex' : 'flex'}`}
            style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E8E1E1', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
          >
            {/* Search bar */}
            <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid #F0EBEB' }}>
              <div
                className="flex items-center gap-2 px-3 h-10 rounded-xl"
                style={{ background: '#F7F5F4', border: '1px solid #E8E1E1' }}
              >
                <Search className="w-4 h-4 shrink-0" style={{ color: '#7A6F6F' }} />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none min-h-0"
                  style={{ color: '#1E1B1B', fontSize: '13px' }}
                />
                <button className="shrink-0 p-1 rounded-lg transition-colors hover:bg-white" style={{ color: '#7A6F6F' }}>
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mt-3">
                {(['all', 'unread', 'active'] as TabId[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
                    style={
                      activeTab === tab
                        ? { background: '#C96B72', color: '#fff', border: '1px solid #C96B72' }
                        : { background: 'transparent', color: '#7A6F6F', border: '1px solid #E8E1E1' }
                    }
                  >
                    {tab}
                    {tab === 'unread' && totalUnread > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                        style={{ background: activeTab === 'unread' ? 'rgba(255,255,255,0.3)' : '#C96B72', color: '#fff' }}>
                        {totalUnread}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-2">
                      <div className="w-11 h-11 rounded-full skeleton-shimmer shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 skeleton-shimmer rounded-full w-2/3" />
                        <div className="h-3 skeleton-shimmer rounded-full w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#F7F5F4' }}>
                    <MessageCircle className="w-7 h-7" style={{ color: '#C96B7240' }} />
                  </div>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#1E1B1B' }}>No conversations yet</p>
                  <p className="text-xs" style={{ color: '#7A6F6F' }}>Message someone from a post to get started</p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const letter = conv.username[0]?.toUpperCase() || '?';
                  const color = avatarColor(letter);
                  const isSelected = selectedUserId === conv.user_id;
                  const hasUnread = conv.unread_count > 0;
                  return (
                    <button
                      key={conv.user_id}
                      onClick={() => handleSelectConversation(conv.user_id)}
                      className="w-full text-left transition-all relative"
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #F7F5F4',
                        background: isSelected ? '#FDF0F1' : 'transparent',
                        borderLeft: isSelected ? '3px solid #C96B72' : '3px solid transparent',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar with online dot */}
                        <div className="relative shrink-0">
                          <div
                            className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base"
                            style={{ background: color }}
                          >
                            {letter}
                          </div>
                          {/* Simulated online indicator for active conversations */}
                          {conv.unread_count > 0 && (
                            <span
                              className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white"
                              style={{ background: '#22C55E' }}
                            />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span
                              className="text-sm truncate pr-2"
                              style={{
                                color: '#1E1B1B',
                                fontWeight: hasUnread ? 700 : 500,
                              }}
                            >
                              {conv.username}
                            </span>
                            <span className="text-[10px] shrink-0" style={{ color: '#7A6F6F' }}>
                              {conv.last_message_time
                                ? formatDistanceToNow(new Date(conv.last_message_time), { addSuffix: false })
                                : ''}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className="text-xs truncate flex-1"
                              style={{
                                color: hasUnread ? '#1E1B1B' : '#7A6F6F',
                                fontWeight: hasUnread ? 500 : 400,
                              }}
                            >
                              {conv.last_message || 'No messages yet'}
                            </p>
                            {hasUnread && (
                              <span
                                className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                                style={{ background: '#C96B72' }}
                              >
                                {conv.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ════ CHAT PANEL ════ */}
          <div
            className={`flex-1 flex flex-col overflow-hidden ${showChat ? 'flex' : 'hidden lg:flex'}`}
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E8E1E1',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}
          >
            {selectedUserId ? (
              <>
                {/* Chat header */}
                <div
                  className="flex items-center gap-3 px-4 py-3 shrink-0"
                  style={{ borderBottom: '1px solid #F0EBEB', background: '#FFFFFF' }}
                >
                  {/* Back button on mobile */}
                  <button
                    onClick={() => setShowChat(false)}
                    className="lg:hidden p-2 -ml-1 rounded-xl transition-colors hover:bg-gray-50"
                    style={{ color: '#7A6F6F' }}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="relative shrink-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base"
                      style={{ background: displayColor }}
                    >
                      {displayLetter}
                    </div>
                    <span
                      className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white"
                      style={{ background: '#22C55E' }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold truncate" style={{ color: '#1E1B1B' }}>{displayUsername}</h3>
                    <p className="text-xs flex items-center gap-1" style={{ color: '#22C55E' }}>
                      <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ background: '#22C55E' }} />
                      Online
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-gray-50" style={{ color: '#7A6F6F' }}>
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-gray-50" style={{ color: '#7A6F6F' }}>
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Messages area */}
                <div
                  className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-3"
                  style={{ background: '#FDFCFB' }}
                >
                  {/* Date separator */}
                  <div className="flex items-center gap-3 my-2">
                    <div className="flex-1 h-px" style={{ background: '#E8E1E1' }} />
                    <span className="text-[10px] font-semibold px-2" style={{ color: '#7A6F6F' }}>Today</span>
                    <div className="flex-1 h-px" style={{ background: '#E8E1E1' }} />
                  </div>

                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                        style={{ background: '#F7F5F4' }}
                      >
                        <MessageCircle className="w-8 h-8" style={{ color: '#C96B7240' }} />
                      </div>
                      <p className="text-sm font-medium" style={{ color: '#1E1B1B' }}>
                        Start a conversation with <span style={{ color: '#C96B72' }}>{displayUsername}</span>
                      </p>
                      <p className="text-xs mt-1" style={{ color: '#7A6F6F' }}>Messages are private and secure</p>
                    </div>
                  ) : (
                    messages.map((message, idx) => {
                      const isMine = message.sender_id === user?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-message-pop`}
                          style={{ animationDelay: `${Math.min(idx, 5) * 20}ms` }}
                        >
                          {/* Other person avatar */}
                          {!isMine && (
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mr-2 mt-auto"
                              style={{ background: displayColor }}
                            >
                              {displayLetter}
                            </div>
                          )}

                          <div className={`max-w-[72%] sm:max-w-[60%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                            <div
                              className="px-4 py-2.5 text-sm leading-relaxed break-words"
                              style={{
                                borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                background: isMine ? '#C96B72' : '#FFFFFF',
                                color: isMine ? '#FFFFFF' : '#1E1B1B',
                                border: isMine ? 'none' : '1px solid #E8E1E1',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                              }}
                            >
                              {message.content}
                            </div>
                            <div className={`flex items-center gap-1 mt-1 px-1 ${isMine ? 'flex-row-reverse' : ''}`}>
                              <span className="text-[10px]" style={{ color: '#7A6F6F' }}>
                                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isMine && (
                                <CheckCheck
                                  className="w-3 h-3"
                                  style={{ color: message.is_read ? '#C96B72' : '#7A6F6F' }}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message input */}
                <div
                  className="px-4 py-3 shrink-0"
                  style={{ borderTop: '1px solid #F0EBEB', background: '#FFFFFF' }}
                >
                  <div
                    className="flex items-center gap-2 px-3 rounded-2xl"
                    style={{ background: '#F7F5F4', border: '1px solid #E8E1E1', minHeight: '48px' }}
                  >
                    <button className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-white" style={{ color: '#7A6F6F' }}>
                      <Plus className="w-4 h-4" />
                    </button>

                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent text-sm outline-none py-2"
                      style={{ color: '#1E1B1B', fontSize: '14px' }}
                    />

                    {newMessage.trim() ? (
                      <button
                        onClick={handleSendMessage}
                        className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
                        style={{ background: '#C96B72', color: '#fff' }}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    ) : (
                      <button className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-white" style={{ color: '#7A6F6F' }}>
                        <Mic className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
                  style={{ background: '#F7F5F4' }}
                >
                  <Inbox className="w-10 h-10" style={{ color: '#C96B7240' }} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#1E1B1B' }}>Your Messages</h3>
                <p className="text-sm max-w-[220px]" style={{ color: '#7A6F6F' }}>
                  Select a conversation from the left to start chatting
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
