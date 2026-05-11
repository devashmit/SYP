import { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, MessageCircle, Share2, Send, X, Search, HeartHandshake, Frown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { useSocket } from '@/contexts/SocketContext';
import { API_URL } from '@/config';

type ReactionType = 'heart' | 'care' | 'sad';

interface ReactionData {
    counts: { heart: number; care: number; sad: number };
    total: number;
    userReaction: ReactionType | null;
    users?: { heart: string[], care: string[], sad: string[] };
}

interface CommentData {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    profiles: { username: string } | null;
}

interface UserResult {
    id: string;
    username: string;
    avatar_url: string | null;
}

const REACTIONS: { type: ReactionType; emoji: string; label: string; color: string; icon: React.ElementType }[] = [
    { type: 'heart', emoji: '❤️', label: 'Love', color: '#e74c3c', icon: Heart },
    { type: 'care', emoji: '🤗', label: 'Care', color: '#f39c12', icon: HeartHandshake },
    { type: 'sad', emoji: '😢', label: 'Sad', color: '#3498db', icon: Frown },
];

function avatarGradient(letter: string) {
    const colors = [
        'from-primary to-primary-dark',
        'from-amber-400 to-amber-600',
        'from-orange-400 to-orange-600',
        'from-rose-400 to-rose-600',
        'from-primary/80 to-primary',
    ];
    const idx = (letter.charCodeAt(0) - 65) % colors.length;
    return colors[Math.max(0, idx)];
}

export default function PostInteractions({ postId }: { postId: string }) {
    const { user } = useAuth();
    const { socket } = useSocket();

    // --- Reaction state ---
    const [reactionData, setReactionData] = useState<ReactionData>({ counts: { heart: 0, care: 0, sad: 0 }, total: 0, userReaction: null });
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [reactionAnimating, setReactionAnimating] = useState<ReactionType | null>(null);
    const [commentCount, setCommentCount] = useState(0);
    const reactionTimeout = useRef<NodeJS.Timeout | null>(null);
    const reactionRef = useRef<HTMLDivElement>(null);

    // --- Comment state ---
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<CommentData[]>([]);
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [loadingComments, setLoadingComments] = useState(false);

    // --- Share state ---
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareQuery, setShareQuery] = useState('');
    const [shareResults, setShareResults] = useState<UserResult[]>([]);
    const [searchingUsers, setSearchingUsers] = useState(false);
    const [sharingTo, setSharingTo] = useState<string | null>(null);
    const shareRef = useRef<HTMLDivElement>(null);

    const token = typeof window !== 'undefined' ? sessionStorage.getItem('sahayogi_token') : null;

    // --- Fetch reactions on mount ---
    useEffect(() => {
        fetchReactions();
    }, [postId]);

    useEffect(() => {
        if (!socket) return;

        const handleReactionUpdated = (data: any) => {
            if (data.postId === postId) {
                setReactionData(prev => ({
                    ...prev,
                    counts: data.counts,
                    users: data.users,
                    total: data.total
                }));
            }
        };

        const handleCommentCreated = (data: { postId: string, comment: any }) => {
            if (data.postId === postId) {
                setComments(prev => {
                    if (prev.some(c => c.id === data.comment.id)) return prev;
                    return [data.comment, ...prev];
                });
                setCommentCount(prev => prev + 1);
            }
        };

        socket.on('reaction_updated', handleReactionUpdated);
        socket.on('comment_created', handleCommentCreated);

        return () => {
            socket.off('reaction_updated', handleReactionUpdated);
            socket.off('comment_created', handleCommentCreated);
        };
    }, [socket, postId]);

    const fetchReactions = async () => {
        try {
            const headers: Record<string, string> = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(`${API_URL}/posts/${postId}/reactions`, { headers });
            if (res.ok) {
                const data = await res.json();
                setReactionData(data);
                if (data.commentCount !== undefined) setCommentCount(data.commentCount);
            }
        } catch { /* silent */ }
    };

    // --- Reaction handlers ---
    const handleReaction = async (type: ReactionType) => {
        if (!user) {
            toast.error('Please sign in to react');
            return;
        }
        setReactionAnimating(type);
        setTimeout(() => setReactionAnimating(null), 600);

        // Optimistic update
        setReactionData(prev => {
            const newCounts = { ...prev.counts };
            if (prev.userReaction === type) {
                newCounts[type] = Math.max(0, newCounts[type] - 1);
                return { counts: newCounts, total: prev.total - 1, userReaction: null };
            }
            if (prev.userReaction) {
                newCounts[prev.userReaction] = Math.max(0, newCounts[prev.userReaction] - 1);
                newCounts[type] = newCounts[type] + 1;
                return { counts: newCounts, total: prev.total, userReaction: type };
            }
            newCounts[type] = newCounts[type] + 1;
            return { counts: newCounts, total: prev.total + 1, userReaction: type };
        });

        setShowReactionPicker(false);

        try {
            const res = await fetch(`${API_URL}/posts/${postId}/reactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ type })
            });
            if (res.ok) {
                const data = await res.json();
                setReactionData(data);
            }
        } catch { /* silent - optimistic stays */ }
    };

    const handleReactionHover = () => {
        if (reactionTimeout.current) clearTimeout(reactionTimeout.current);
        setShowReactionPicker(true);
    };

    const handleReactionLeave = () => {
        reactionTimeout.current = setTimeout(() => setShowReactionPicker(false), 400);
    };

    // --- Comment handlers ---
    const fetchComments = useCallback(async () => {
        setLoadingComments(true);
        try {
            const res = await fetch(`${API_URL}/posts/${postId}/comments`);
            if (res.ok) {
                const data = await res.json();
                setComments(data || []);
            }
        } catch { /* silent */ }
        setLoadingComments(false);
    }, [postId]);

    useEffect(() => {
        if (showComments) fetchComments();
    }, [showComments, fetchComments]);

    const handleSubmitComment = async () => {
        if (!user) { toast.error('Please sign in to comment'); return; }
        if (!newComment.trim()) return;
        setSubmittingComment(true);
        try {
            const res = await fetch(`${API_URL}/posts/${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ content: newComment })
            });
            if (res.ok) {
                setNewComment('');
                fetchComments();
                toast.success('Comment posted!');
            }
        } catch { toast.error('Failed to post comment'); }
        setSubmittingComment(false);
    };

    // --- Share handlers ---
    useEffect(() => {
        if (!shareQuery.trim()) { setShareResults([]); return; }
        const timeout = setTimeout(async () => {
            setSearchingUsers(true);
            try {
                const res = await fetch(`${API_URL}/users/search?q=${encodeURIComponent(shareQuery)}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setShareResults(await res.json());
            } catch { /* silent */ }
            setSearchingUsers(false);
        }, 300);
        return () => clearTimeout(timeout);
    }, [shareQuery]);

    const handleShare = async (targetUserId: string) => {
        setSharingTo(targetUserId);
        try {
            const res = await fetch(`${API_URL}/posts/${postId}/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ user_id: targetUserId })
            });
            if (res.ok) {
                toast.success('Post shared!');
                setShowShareModal(false);
                setShareQuery('');
            } else {
                toast.error('Failed to share');
            }
        } catch { toast.error('Failed to share'); }
        setSharingTo(null);
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (reactionRef.current && !reactionRef.current.contains(e.target as Node)) setShowReactionPicker(false);
            if (shareRef.current && !shareRef.current.contains(e.target as Node)) setShowShareModal(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const activeReaction = reactionData.userReaction;
    const activeReactionConfig = REACTIONS.find(r => r.type === activeReaction);

    return (
        <div className="post-interactions" onClick={(e) => e.preventDefault()}>
            {/* Reaction summary (shows small emoji icons if any reactions exist) */}
            {reactionData.total > 0 && (
                <div className="pi-summary">
                    <div className="pi-summary-emojis">
                        {reactionData.counts.heart > 0 && <span className="pi-mini-emoji" title={reactionData.users?.heart?.length ? `${reactionData.counts.heart} Love (${reactionData.users.heart.join(', ')})` : `${reactionData.counts.heart} Love`}>❤️</span>}
                        {reactionData.counts.care > 0 && <span className="pi-mini-emoji" title={reactionData.users?.care?.length ? `${reactionData.counts.care} Care (${reactionData.users.care.join(', ')})` : `${reactionData.counts.care} Care`}>🤗</span>}
                        {reactionData.counts.sad > 0 && <span className="pi-mini-emoji" title={reactionData.users?.sad?.length ? `${reactionData.counts.sad} Sad (${reactionData.users.sad.join(', ')})` : `${reactionData.counts.sad} Sad`}>😢</span>}
                    </div>
                    <span className="pi-summary-count">{reactionData.total}</span>
                </div>
            )}

            {/* Action bar */}
            <div className="pi-actions">
                {/* React button */}
                <div className="pi-action-wrap" ref={reactionRef}
                    onMouseEnter={handleReactionHover}
                    onMouseLeave={handleReactionLeave}
                >
                    <button
                        className={`pi-action-btn ${activeReaction ? 'pi-active' : ''}`}
                        onClick={() => {
                            if (activeReaction) handleReaction(activeReaction);
                            else handleReaction('heart');
                        }}
                        style={activeReaction && activeReactionConfig ? { color: activeReactionConfig.color } : undefined}
                    >
                        {activeReaction ? (
                            <span className={`pi-emoji-label ${reactionAnimating ? 'pi-bounce' : ''}`}>
                                {activeReactionConfig?.emoji} {activeReactionConfig?.label}
                            </span>
                        ) : (
                            <>
                                <Heart className="pi-icon" />
                                <span>React</span>
                            </>
                        )}
                    </button>

                    {/* Reaction picker popup */}
                    {showReactionPicker && (
                        <div className="pi-reaction-picker"
                            onMouseEnter={handleReactionHover}
                            onMouseLeave={handleReactionLeave}
                        >
                            {REACTIONS.map((r, i) => (
                                <button
                                    key={r.type}
                                    className={`pi-reaction-option ${reactionAnimating === r.type ? 'pi-bounce' : ''} ${activeReaction === r.type ? 'pi-picked' : ''}`}
                                    onClick={(e) => { e.stopPropagation(); handleReaction(r.type); }}
                                    title={r.label}
                                    style={{ animationDelay: `${i * 50}ms` }}
                                >
                                    <span className="pi-reaction-emoji">{r.emoji}</span>
                                    <span className="pi-reaction-label">{r.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Comment button */}
                <button
                    className={`pi-action-btn ${showComments ? 'pi-active' : ''}`}
                    onClick={() => setShowComments(!showComments)}
                >
                    <MessageCircle className="pi-icon" />
                    <span>Comment</span>
                    {commentCount > 0 && <span className="pi-badge">{commentCount}</span>}
                </button>

                {/* Share button */}
                <div className="pi-action-wrap" ref={shareRef}>
                    <button
                        className={`pi-action-btn ${showShareModal ? 'pi-active' : ''}`}
                        onClick={() => {
                            if (!user) { toast.error('Please sign in to share'); return; }
                            setShowShareModal(!showShareModal);
                        }}
                    >
                        <Share2 className="pi-icon" />
                        <span>Share</span>
                    </button>

                    {/* Share modal */}
                    {showShareModal && (
                        <div className="pi-share-modal">
                            <div className="pi-share-header">
                                <span className="pi-share-title">Share with</span>
                                <button className="pi-share-close" onClick={() => setShowShareModal(false)}>
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="pi-share-search">
                                <Search className="w-3.5 h-3.5 text-muted-foreground/50" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={shareQuery}
                                    onChange={e => setShareQuery(e.target.value)}
                                    className="pi-share-input"
                                    autoFocus
                                />
                            </div>
                            <div className="pi-share-results">
                                {searchingUsers ? (
                                    <div className="pi-share-empty">Searching…</div>
                                ) : shareResults.length === 0 && shareQuery.trim() ? (
                                    <div className="pi-share-empty">No users found</div>
                                ) : (
                                    shareResults.map(u => (
                                        <button
                                            key={u.id}
                                            className="pi-share-user"
                                            onClick={(e) => { e.stopPropagation(); handleShare(u.id); }}
                                            disabled={sharingTo === u.id}
                                        >
                                            <div className={`pi-share-avatar bg-gradient-to-br ${avatarGradient(u.username[0]?.toUpperCase() || 'A')}`}>
                                                {u.avatar_url
                                                    ? <img src={u.avatar_url} alt={u.username} className="w-full h-full object-contain rounded-full" />
                                                    : u.username[0]?.toUpperCase()
                                                }
                                            </div>
                                            <span className="pi-share-username">@{u.username}</span>
                                            {sharingTo === u.id ? (
                                                <span className="pi-share-sending">Sending…</span>
                                            ) : (
                                                <Send className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Inline comment section */}
            {showComments && (
                <div className="pi-comments">
                    {/* Comment input */}
                    {user ? (
                        <div className="pi-comment-input-wrap">
                            <div className={`pi-comment-avatar bg-gradient-to-br ${avatarGradient(user.username?.[0]?.toUpperCase() || 'U')}`}>
                                {user.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="pi-comment-field">
                                <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitComment(); } }}
                                    className="pi-comment-input"
                                />
                                <button
                                    className="pi-comment-send"
                                    onClick={handleSubmitComment}
                                    disabled={!newComment.trim() || submittingComment}
                                >
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="pi-login-prompt">
                            <Link to="/auth" className="text-primary font-semibold hover:underline">Sign in</Link> to comment
                        </p>
                    )}

                    {/* Comment list */}
                    {loadingComments ? (
                        <div className="pi-comments-loading">
                            <div className="pi-comment-skeleton" />
                            <div className="pi-comment-skeleton" />
                        </div>
                    ) : comments.length === 0 ? (
                        <p className="pi-no-comments">No comments yet - be the first!</p>
                    ) : (
                        <div className="pi-comment-list">
                            {comments.slice(0, 3).map(c => {
                                const name = c.profiles?.username || 'Anonymous';
                                const letter = name[0]?.toUpperCase() || '?';
                                return (
                                    <div key={c.id} className="pi-comment">
                                        <div className={`pi-comment-avatar bg-gradient-to-br ${avatarGradient(letter)}`}>{letter}</div>
                                        <div className="pi-comment-body">
                                            <div className="pi-comment-meta">
                                                <span className="pi-comment-name">{name}</span>
                                                <span className="pi-comment-time">
                                                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <p className="pi-comment-text">{c.content}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            {comments.length > 3 && (
                                <Link to={`/post/${postId}`} className="pi-view-all">
                                    View all {comments.length} comments →
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
