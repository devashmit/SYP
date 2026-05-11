import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Send, ArrowLeft, MessageCircle, Inbox, CheckCheck } from 'lucide-react';
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

function avatarGradient(letter: string) {
  const colors = [
    'from-primary to-primary-dark',
    'from-amber-400 to-amber-600',
    'from-orange-400 to-orange-600',
    'from-rose-400 to-rose-600',
    'from-primary/80 to-primary',
    'from-amber-500 to-amber-700',
  ];
  const idx = (letter.charCodeAt(0) - 65) % colors.length;
  return colors[Math.max(0, idx)];
}

export default function Messages() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const selectedUserIdRef = useRef<string | null>(null);
  const [selectedUsername, setSelectedUsername] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  // Mobile: show chat panel when a conversation is selected
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    selectedUserIdRef.current = selectedUserId;
  }, [selectedUserId]);

  const fetchConversations = async () => {
    try {
      const token = sessionStorage.getItem('sahayogi_token');
      const res = await fetch(`${API_URL}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setConversations(await res.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (otherUserId: string) => {
    try {
      const token = sessionStorage.getItem('sahayogi_token');
      const res = await fetch(`${API_URL}/messages/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setMessages(await res.json());
    } catch {
      // silent
    }
  };

  const markMessagesAsRead = async (otherUserId: string) => {
    try {
      const token = sessionStorage.getItem('sahayogi_token');
      await fetch(`${API_URL}/messages/read/${otherUserId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchConversations();
    } catch {
      // silent
    }
  };

  useEffect(() => {
    if (!user) return;
    const userParam = searchParams.get('user');
    if (userParam) {
      setSelectedUserId(userParam);
      setShowChat(true);
    }
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
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((profile) => { if (profile) setSelectedUsername(profile.username); });
    }
  }, [selectedUserId]);

  useEffect(() => {
    if (!socket || !user) return;
    const handleReceiveMessage = (message: Message) => {
      fetchConversations();
      const currentSelectedID = selectedUserIdRef.current;
      if (
        currentSelectedID &&
        (message.sender_id === currentSelectedID || message.receiver_id === currentSelectedID)
      ) {
        setMessages((prev) => [...prev, message]);
        if (message.sender_id === currentSelectedID) markMessagesAsRead(currentSelectedID);
      }
    };
    socket.on('receive_message', handleReceiveMessage);
    return () => { socket.off('receive_message', handleReceiveMessage); };
  }, [socket, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUserId) return;
    try {
      const token = sessionStorage.getItem('sahayogi_token');
      const res = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiver_id: selectedUserId, content: newMessage }),
      });
      if (res.ok) {
        setNewMessage('');
      } else {
        toast.error('Failed to send message');
      }
    } catch {
      toast.error('Failed to send message');
    }
  };

  const handleSelectConversation = (userId: string) => {
    setSelectedUserId(userId);
    setShowChat(true);
  };

  const selectedConversation = conversations.find((c) => c.user_id === selectedUserId);
  const displayUsername = selectedConversation?.username || selectedUsername;
  const displayLetter = displayUsername?.[0]?.toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-6">
        <Button
          variant="ghost"
          onClick={() => (showChat ? setShowChat(false) : navigate('/'))}
          className="mb-4 hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {showChat ? 'Back to conversations' : 'Back to Home'}
        </Button>

        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-180px)] max-h-[800px]">

          {/* Conversations list - hidden on mobile when chat is open */}
          <div className={`rounded-2xl border border-border bg-white overflow-hidden flex flex-col shadow-sm ${showChat ? 'hidden lg:flex' : 'flex'}`}>
            <div className="px-5 py-5 border-b border-border flex items-center justify-between bg-white relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/5 opacity-50" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-foreground text-lg tracking-tighter">Messages</h2>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full border border-border/50 relative z-10 uppercase tracking-wider">
                {conversations.length} Active
              </span>
            </div>

            <ScrollArea className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-5 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full skeleton-shimmer shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 skeleton-shimmer rounded w-3/4" />
                        <div className="h-3 skeleton-shimmer rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No conversations yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Start by messaging someone from a post
                  </p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const letter = conv.username[0]?.toUpperCase() || '?';
                  const isSelected = selectedUserId === conv.user_id;
                  return (
                    <button
                      key={conv.user_id}
                      onClick={() => handleSelectConversation(conv.user_id)}
                      className={`w-full p-4 text-left border-b border-border/40 transition-all duration-300 relative group overflow-hidden ${
                        isSelected ? 'bg-primary/[0.03] pl-3' : 'hover:bg-muted/30'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary animate-fade-in" />
                      )}
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-full bg-gradient-to-br ${avatarGradient(letter)} flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0`}
                        >
                          {letter}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span
                              className={`font-semibold text-sm truncate pr-2 ${
                                isSelected ? 'text-primary' : 'text-foreground'
                              }`}
                            >
                              {conv.username}
                            </span>
                            {conv.unread_count > 0 && (
                              <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 font-bold shrink-0">
                                {conv.unread_count}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {conv.last_message || 'No messages yet'}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                            {conv.last_message_time
                              ? formatDistanceToNow(new Date(conv.last_message_time), { addSuffix: true })
                              : ''}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </ScrollArea>
          </div>

          {/* Chat panel - full width on mobile when open */}
          <div
            className={`lg:col-span-2 rounded-3xl border border-border bg-card overflow-hidden flex flex-col shadow-sm relative ${
              showChat ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {selectedUserId ? (
              <>
                <div
                  className="px-5 py-4 border-b border-border flex items-center gap-3"
                  style={{
                    background:
                      'linear-gradient(135deg, hsl(var(--muted) / 0.05), hsl(var(--muted) / 0.02))',
                  }}
                >
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarGradient(displayLetter)} flex items-center justify-center text-white font-bold text-xl shadow-sm border-2 border-white ring-2 ring-primary/10`}
                  >
                    {displayLetter}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg tracking-tight">{displayUsername}</h3>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                      Active Connection
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 compassionate-bg">
                  <div className="space-y-4 relative z-10">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <MessageCircle className="w-16 h-16 text-muted-foreground/20 mb-4" />
                        <p className="text-muted-foreground">
                          Start a conversation with{' '}
                          <span className="font-semibold text-foreground">{displayUsername}</span>
                        </p>
                      </div>
                    ) : (
                      messages.map((message, idx) => {
                        const isMine = message.sender_id === user?.id;
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                            style={{ animationDelay: `${Math.min(idx, 5) * 30}ms` }}
                          >
                            <div
                              className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${
                                isMine
                                  ? 'rounded-br-sm text-white bg-primary shadow-primary/20'
                                  : 'rounded-bl-sm bg-white border border-border/60 text-foreground'
                              }`}
                            >
                              <p
                                className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${
                                  isMine ? 'text-white' : 'text-foreground'
                                }`}
                              >
                                {message.content}
                              </p>
                              <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : ''}`}>
                                <p className={`text-[10px] ${isMine ? 'text-white/60' : 'text-muted-foreground'}`}>
                                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                                </p>
                                {isMine && message.is_read && (
                                  <CheckCheck className="w-3 h-3 text-white/60" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                <div className="p-4 border-t border-border bg-white">
                  <div className="flex gap-2 items-center">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 rounded-full px-5 h-12 border-border focus:border-primary focus:ring-primary/20 bg-muted/10"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="w-12 h-12 rounded-2xl p-0 shrink-0 bg-primary text-white shadow-xl shadow-primary/20 disabled:opacity-50 transition-all hover:scale-105 active:scale-95 group"
                    >
                      <Send className="h-5 w-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mb-6">
                  <Inbox className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-bold text-foreground">Your Messages</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Select a conversation to start chatting
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
