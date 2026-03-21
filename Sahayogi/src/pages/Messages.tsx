import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { Send, ArrowLeft, MessageCircle, Inbox, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Navbar from '@/components/Navbar';
import { useSocket } from '@/contexts/SocketContext';

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

const API_URL = 'http://localhost:3000/api';

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
  const selectedUserIdRef = useRef<string | null>(null); // Ref so socket closure sees latest
  const [selectedUsername, setSelectedUsername] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Keep ref up to date for the socket listener
  useEffect(() => {
    selectedUserIdRef.current = selectedUserId;
  }, [selectedUserId]);

  const fetchConversations = async () => {
    try {
      const token = sessionStorage.getItem('sahayogi_token');
      const res = await fetch(`${API_URL}/messages/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setConversations(await res.json());
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (otherUserId: string) => {
    try {
      const token = sessionStorage.getItem('sahayogi_token');
      const res = await fetch(`${API_URL}/messages/${otherUserId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markMessagesAsRead = async (otherUserId: string) => {
    try {
      const token = sessionStorage.getItem('sahayogi_token');
      await fetch(`${API_URL}/messages/read/${otherUserId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchConversations();
    } catch (error) {
      console.error('Error marking messages read:', error);
    }
  };

  // 1. On mount, load conversations (and handle URL param)
  useEffect(() => {
    if (!user) return;
    const userParam = searchParams.get('user');
    if (userParam) setSelectedUserId(userParam);
    fetchConversations();
  }, [user]);

  // 2. On selecting a user, fetch their messages
  useEffect(() => {
    if (selectedUserId) {
      fetchMessages(selectedUserId);
      markMessagesAsRead(selectedUserId);
      
      // Attempt to get name from conversations list first
      const existing = conversations.find((c) => c.user_id === selectedUserId);
      if (existing) {
        setSelectedUsername(existing.username);
      } else {
        // Fallback fetch if they aren't in the list
        fetch(`${API_URL}/users/profiles/${selectedUserId}`, {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('sahayogi_token')}` }
        })
        .then(r => r.ok ? r.json() : null)
        .then(profile => {
          if (profile) setSelectedUsername(profile.username);
        });
      }
    }
  }, [selectedUserId]);

  // 3. Register socket listener exactly ONCE
  useEffect(() => {
    if (!socket || !user) return;

    const handleReceiveMessage = (message: Message) => {
      // 1. Update the sidebar instantly
      fetchConversations();

      // 2. Append to current open thread if it belongs here
      const currentSelectedID = selectedUserIdRef.current;
      if (
        currentSelectedID && 
        (message.sender_id === currentSelectedID || message.receiver_id === currentSelectedID)
      ) {
        setMessages(prev => [...prev, message]);
        
        // If they sent it to us and we have chat open, mark it read
        if (message.sender_id === currentSelectedID) {
          markMessagesAsRead(currentSelectedID);
        }
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 4. Send message - DO NOT call fetchMessages after
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUserId) return;
    try {
      const token = sessionStorage.getItem('sahayogi_token');
      const res = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiver_id: selectedUserId,
          content: newMessage
        })
      });

      if (res.ok) {
        setNewMessage(''); // Let the socket event update the thread!
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
    }
  };

  const selectedConversation = conversations.find((c) => c.user_id === selectedUserId);
  const displayUsername = selectedConversation?.username || selectedUsername;
  const displayLetter = displayUsername?.[0]?.toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4 hover:text-primary transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-140px)] max-h-[800px]">

          {/* Conversations list */}
          <div className="rounded-2xl border border-border bg-white overflow-hidden flex flex-col shadow-sm">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/10">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-foreground text-lg tracking-tight">Signal Intelligence</h2>
              </div>
              <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-md">
                {conversations.length} {conversations.length === 1 ? 'chat' : 'chats'}
              </span>
            </div>

            <ScrollArea className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-5 space-y-3">
                  {[1, 2, 3].map(i => (
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
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden opacity-60">
                    <img
                      src="https://images.unsplash.com/photo-1544254254-8e434f0f0894?w=100&h=100&fit=crop&auto=format"
                      alt="No conversations"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-muted-foreground text-sm">No conversations yet</p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const letter = conv.username[0]?.toUpperCase() || '?';
                  const isSelected = selectedUserId === conv.user_id;
                  return (
                    <button
                      key={conv.user_id}
                      onClick={() => setSelectedUserId(conv.user_id)}
                      className={`w-full p-4 text-left border-b border-border/50 transition-all duration-200 ${isSelected
                        ? 'bg-primary/6 border-l-4 border-l-primary pl-3'
                        : 'hover:bg-muted/50 border-l-4 border-l-transparent'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${avatarGradient(letter)} flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0`}>
                          {letter}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5 whitespace-nowrap overflow-hidden">
                            <span className={`font-semibold text-sm truncate pr-2 ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                              {conv.username}
                            </span>
                            {conv.unread_count > 0 && (
                              <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 font-bold animate-warm-pulse">
                                {conv.unread_count}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate max-w-[150px] sm:max-w-[200px]">
                            {conv.last_message || 'No messages yet'}
                          </p>
                          <p className="text-xs text-muted-foreground/60 mt-0.5 shrink-0 whitespace-nowrap">
                            {conv.last_message_time ? formatDistanceToNow(new Date(conv.last_message_time), { addSuffix: true }) : ''}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </ScrollArea>
          </div>

          <div className="lg:col-span-2 rounded-3xl border border-border bg-card overflow-hidden flex flex-col shadow-sm relative">
            {selectedUserId ? (
              <>
                <div
                  className="px-5 py-4 border-b border-border flex items-center gap-3"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--muted) / 0.05), hsl(var(--muted) / 0.02))' }}
                >
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarGradient(displayLetter)} flex items-center justify-center text-white font-bold text-xl shadow-sm border-2 border-white ring-2 ring-primary/10`}>
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

                <div className="flex-1 overflow-y-auto p-5 bg-muted/5">
                  <div className="space-y-3">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-20 h-20 rounded-full overflow-hidden mb-4 shadow-md animate-float">
                          <img
                            src="https://images.unsplash.com/photo-1518712391031-6b80f83d09f7?w=100&h=100&fit=crop&auto=format"
                            alt="Start conversation"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="text-muted-foreground">Start a conversation with <span className="font-semibold text-foreground">{displayUsername}</span></p>
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
                              className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm ${isMine
                                ? 'rounded-br-sm text-white bg-primary'
                                : 'rounded-bl-sm bg-muted text-foreground'
                                }`}
                            >
                              <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${isMine ? 'text-white' : 'text-foreground'}`}>
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
                      className="flex-1 rounded-full px-5 h-14 border-border focus:border-primary focus:ring-primary/20 bg-muted/10 shadow-inner"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="w-12 h-12 rounded-2xl p-0 shrink-0 bg-primary text-white shadow-lg shadow-primary/20 disabled:opacity-50 transition-all hover:scale-110 active:scale-95"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-24 h-24 rounded-full overflow-hidden mb-6 shadow-lg animate-float">
                  <img
                    src="https://images.unsplash.com/photo-1526404423292-15db8c2334e5?w=200&h=200&fit=crop&auto=format"
                    alt="Messages"
                    className="w-full h-full object-contain opacity-80"
                  />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Inbox className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-bold text-foreground">Your Messages</h3>
                </div>
                <p className="text-muted-foreground">Select a conversation from the left to start chatting</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
