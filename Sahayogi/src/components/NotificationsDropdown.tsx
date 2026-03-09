import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, AlertCircle, ThumbsUp, ThumbsDown, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '@/contexts/SocketContext';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Notification {
    id: string;
    type: string;
    message: string;
    post_id?: string;
    is_read: boolean;
    created_at: string;
}

const API_URL = 'http://localhost:3000/api';

const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'post_approved': return <ThumbsUp size={14} style={{ color: '#22c55e' }} />;
        case 'post_rejected': return <ThumbsDown size={14} style={{ color: '#ef4444' }} />;
        case 'pending_post': return <AlertCircle size={14} style={{ color: '#f59e0b' }} />;
        default: return <FileText size={14} style={{ color: '#b22826' }} />;
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
    const { socket } = useSocket();
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const token = sessionStorage.getItem('sahayogi_token');
            const res = await fetch(`${API_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
                setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
            }
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        if (socket) {
            socket.on('notification_received', fetchNotifications);
        }
        return () => { if (socket) socket.off('notification_received', fetchNotifications); };
    }, [socket]);

    const handleRead = async (notification: Notification) => {
        setOpen(false);
        if (!notification.is_read) {
            try {
                const token = sessionStorage.getItem('sahayogi_token');
                await fetch(`${API_URL}/notifications/${notification.id}/read`, {
                    method: 'PUT',
                    headers: { Authorization: `Bearer ${token}` }
                });
                setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (err) {
                console.error('Failed to mark read', err);
            }
        }
        if (notification.post_id) navigate(`/post/${notification.post_id}`);
    };

    const handleMarkAllRead = async () => {
        try {
            const token = sessionStorage.getItem('sahayogi_token');
            await fetch(`${API_URL}/notifications/read-all`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all read', err);
        }
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
                            className="absolute top-1 right-1 flex items-center justify-center rounded-full text-white font-black"
                            style={{
                                minWidth: 16,
                                height: 16,
                                fontSize: 9,
                                background: '#b22826',
                                padding: '0 3px',
                                lineHeight: 1,
                            }}
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent align="end" className="p-0 rounded-2xl overflow-hidden border-border/60 shadow-xl" style={{ width: 340 }}>
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/40" style={{ background: 'rgba(250,247,244,0.9)' }}>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground tracking-tight">Notifications</span>
                        {unreadCount > 0 && (
                            <span
                                className="text-white font-black rounded-full"
                                style={{ fontSize: 9, background: '#b22826', padding: '2px 7px' }}
                            >
                                {unreadCount} new
                            </span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-1 text-xs font-semibold transition-colors"
                            style={{ color: '#b22826' }}
                        >
                            <CheckCheck size={13} />
                            Mark all read
                        </button>
                    )}
                </div>

                {/* List */}
                <div style={{ maxHeight: 360, overflowY: 'auto' }}>
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
                                    style={{ background: !n.is_read ? 'rgba(178,40,38,0.04)' : 'transparent' }}
                                >
                                    {/* Type icon */}
                                    <div
                                        className="shrink-0 flex items-center justify-center rounded-xl mt-0.5"
                                        style={{ width: 30, height: 30, background: 'rgba(178,40,38,0.07)' }}
                                    >
                                        {getNotificationIcon(n.type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p
                                            className="text-[13px] leading-snug"
                                            style={{ color: !n.is_read ? '#1a1210' : '#7a6a65', fontWeight: !n.is_read ? 600 : 400 }}
                                        >
                                            {n.message}
                                        </p>
                                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#b9a89e' }}>
                                            {formatTimeAgo(n.created_at)}
                                        </p>
                                    </div>

                                    {!n.is_read && (
                                        <div
                                            className="shrink-0 w-2 h-2 rounded-full mt-1.5"
                                            style={{ background: '#b22826' }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="border-t border-border/30 px-4 py-2.5 text-center" style={{ background: 'rgba(250,247,244,0.6)' }}>
                        <button
                            onClick={() => setOpen(false)}
                            className="text-xs font-semibold transition-colors"
                            style={{ color: '#b22826' }}
                        >
                            Close
                        </button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
