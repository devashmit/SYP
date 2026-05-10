import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, FileText, CheckCheck, MessageSquare, Share2, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '@/contexts/SocketContext';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { API_URL } from '@/config';
import { apiFetch } from '@/lib/api-client';

interface Notification {
  id: string;
  type: 'MESSAGE' | 'POST_CREATED' | 'POST_SHARED' | 'ADMIN_APPROVAL' | 'SYSTEM';
  message: string;
  relatedEntityId?: string;
  isRead: boolean;
  createdAt: string;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'MESSAGE': return <MessageSquare size={14} className="text-blue-500" />;
    case 'POST_CREATED': return <FileText size={14} className="text-emerald-500" />;
    case 'POST_SHARED': return <Share2 size={14} className="text-purple-500" />;
    case 'ADMIN_APPROVAL': return <ShieldCheck size={14} className="text-amber-500" />;
    case 'SYSTEM': return <Zap size={14} className="text-rose-500" />;
    default: return <Bell size={14} className="text-gray-500" />;
  }
};

const formatTimeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  
  const { socket } = useSocket();
  const navigate = useNavigate();
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
    try {
      const data = await apiFetch(`${API_URL}/notifications?page=${pageNum}&limit=20`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('sahayogi_token')}` }
      });
      
      const { notifications: fetchedNotes, unreadCount: count } = data;
      
      if (append) {
        setNotifications(prev => {
           // Prevent duplicates if pulling new pages
           const existingIds = new Set(prev.map(n => n.id));
           const newNotes = fetchedNotes.filter((n: Notification) => !existingIds.has(n.id));
           return [...prev, ...newNotes];
        });
      } else {
        setNotifications(fetchedNotes);
      }
      
      setUnreadCount(count);
      setHasMore(fetchedNotes.length === 20); // If we got 20, there might be more
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  }, []);

  // 1. Initial fetch & Setup Transports
  useEffect(() => {
    fetchNotifications(1, false);

    if (socket) {
      const onConnect = () => {
        setIsConnected(true);
        // Fetch to sync missed notifications while disconnected
        fetchNotifications(1, false);
      };
      const onDisconnect = () => setIsConnected(false);
      
      // Initial state
      if (socket.connected) setIsConnected(true);

      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      
      // Listen for new notifications
      socket.on('notification_received', (newNotification) => {
        // Reset to page 1 to ensure UI consistency, or just fetch to resync
        fetchNotifications(1, false);
      });

      // Cross-device sync
      socket.on('notification_read', (payload) => {
         if (payload.all) {
             setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
             setUnreadCount(0);
         } else if (payload.id) {
             setNotifications(prev => prev.map(n => n.id === payload.id ? { ...n, isRead: true } : n));
             setUnreadCount(prev => Math.max(0, prev - 1));
         }
      });

      return () => {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
        socket.off('notification_received');
        socket.off('notification_read');
      };
    }
  }, [socket, fetchNotifications]);

  // 2. Fallback Polling
  useEffect(() => {
    if (!isConnected) {
      // Start polling every 15 seconds if disconnected
      pollingInterval.current = setInterval(() => fetchNotifications(1, false), 15000);
    } else if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }

    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, [isConnected, fetchNotifications]);

  const handleRead = async (notification: Notification) => {
    setOpen(false);
    if (!notification.isRead) {
      // Optimistic UI update
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      try {
        await apiFetch(`${API_URL}/notifications/${notification.id}/read`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${sessionStorage.getItem('sahayogi_token')}` }
        });
      } catch (err) {
        console.error('Failed to mark read', err);
      }
    }
    
    // Attempt graceful navigation if entity is provided
    if (notification.relatedEntityId) {
       if (notification.type === 'MESSAGE') {
           navigate('/messages');
       } else if (notification.type === 'POST_CREATED' || notification.type === 'POST_SHARED' || notification.type === 'ADMIN_APPROVAL') {
           navigate(`/post/${notification.relatedEntityId}`);
       } else if (notification.type === 'SYSTEM' && window.location.pathname !== '/admin') {
           // Basic routing assuming SYSTEM denotes admin alerts or system wide
           navigate('/admin');
       }
    }
  };

  const handleMarkAllRead = async () => {
    // Optimistic UI
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    
    try {
      await apiFetch(`${API_URL}/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${sessionStorage.getItem('sahayogi_token')}` }
      });
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };
  
  const loadMore = () => {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage, true);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-xl hover:bg-muted/60 transition-colors"
        >
          <Bell className="h-[18px] w-[18px] text-muted-foreground" />
          {unreadCount > 0 && (
            <span
              className="absolute top-1 right-1 flex items-center justify-center rounded-full text-white font-black animate-in zoom-in"
              style={{
                minWidth: 16, height: 16, fontSize: 9, background: '#b22826', padding: '0 3px', lineHeight: 1,
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="p-0 rounded-2xl overflow-hidden border-border/60 shadow-xl" style={{ width: 340 }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40" style={{ background: 'rgba(250,247,244,0.9)' }}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground tracking-tight">Notifications</span>
            
            {/* Connection Indicator */}
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400 animate-pulse'}`} title={isConnected ? 'Live matching active' : 'Polling for updates...'} />
            
            {unreadCount > 0 && (
              <span className="text-white font-black rounded-full" style={{ fontSize: 9, background: '#b22826', padding: '2px 7px' }}>
                {unreadCount} new
              </span>
            )}
          </div>
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className={`flex items-center gap-1 text-xs font-semibold transition-colors focus:outline-none ${unreadCount > 0 ? 'hover:opacity-80' : 'opacity-30 cursor-not-allowed'}`}
            style={{ color: '#b22826' }}
          >
            <CheckCheck size={13} />
            Mark All Read
          </button>
        </div>

        {/* List */}
        <div style={{ maxHeight: 380, overflowY: 'auto' }} className="scrollbar-hide">
          {notifications.length === 0 ? (
            <div className="py-10 text-center flex flex-col items-center gap-2">
              <Bell style={{ width: 28, height: 28, opacity: 0.18 }} />
              <span className="text-sm text-muted-foreground">You're all caught up!</span>
            </div>
          ) : (
            <div className="divide-y divide-border/20">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleRead(n)}
                  className="flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors hover:bg-muted/30"
                  style={{ background: !n.isRead ? 'rgba(178,40,38,0.04)' : 'transparent' }}
                >
                  <div className="shrink-0 flex items-center justify-center rounded-xl mt-0.5" style={{ width: 30, height: 30, background: 'rgba(178,40,38,0.07)' }}>
                    {getNotificationIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] leading-snug break-words" style={{ color: !n.isRead ? '#1a1210' : '#7a6a65', fontWeight: !n.isRead ? 600 : 400 }}>
                      {n.message}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#b9a89e' }}>
                      {formatTimeAgo(n.createdAt)}
                    </p>
                  </div>
                  {!n.isRead && (
                    <div className="shrink-0 w-2 h-2 rounded-full mt-1.5" style={{ background: '#b22826' }} />
                  )}
                </div>
              ))}
              
              {/* Pagination Footer */}
              {hasMore && (
                  <div className="py-3 flex justify-center border-t border-border/10">
                      <Button variant="ghost" size="sm" onClick={loadMore} className="text-xs h-7 text-muted-foreground hover:text-foreground">
                          Load More
                      </Button>
                  </div>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
