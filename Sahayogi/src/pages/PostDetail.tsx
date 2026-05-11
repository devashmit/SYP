import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  MapPin, MessageCircle, Send, Clock, User, Tag,
  Heart, Search, MessageSquare, LogIn,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Navbar from '@/components/Navbar';
import BackButton from '@/components/BackButton';
import { API_URL } from '@/config';

interface Post {
  id: string;
  title: string;
  description: string;
  location?: string;
  status: string;
  created_at: string;
  help_type: string;
  is_anonymous: boolean;
  user_id: string;
  images: string[];
  categories: { name: string } | null;
  profiles: { username: string } | null;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: { username: string } | null;
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

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPost();
      fetchComments();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      const res = await fetch(`${API_URL}/posts/${id}`);
      if (!res.ok) throw new Error('Post not found');
      setPost(await res.json());
    } catch {
      toast.error('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`${API_URL}/posts/${id}/comments`);
      if (res.ok) setComments((await res.json()) || []);
    } catch {
      // silent
    }
  };

  const handleSubmitComment = async () => {
    if (!user) { toast.error('You must be logged in to comment'); return; }
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const token = sessionStorage.getItem('sahayogi_token');
      const res = await fetch(`${API_URL}/posts/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: newComment }),
      });
      if (res.ok) {
        toast.success('Comment posted!');
        setNewComment('');
        fetchComments();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to post comment');
      }
    } catch {
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleContactPoster = () => {
    if (!user) { toast.error('You must be logged in to send messages'); return; }
    if (post?.user_id === user.id) { toast.error('You cannot message yourself'); return; }
    navigate(`/messages?user=${post?.user_id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-28 pb-8">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="h-8 skeleton-shimmer rounded-xl w-1/3" />
            <div className="aspect-video skeleton-shimmer rounded-2xl" />
            <div className="h-10 skeleton-shimmer rounded-xl w-2/3" />
            <div className="h-32 skeleton-shimmer rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-28 pb-8 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-muted/30 flex items-center justify-center mb-6">
            <Search className="w-10 h-10 text-muted-foreground/30" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Post not found</h2>
          <p className="text-muted-foreground mb-6">This post may have been removed or does not exist.</p>
          <Button onClick={() => navigate('/browse')} className="rounded-full px-8">
            Browse Posts
          </Button>
        </div>
      </div>
    );
  }

  const posterName = post.is_anonymous ? 'Anonymous' : post.profiles?.username || 'Unknown';
  const posterLetter = posterName[0]?.toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-8">
        <BackButton className="mb-6" />

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Main post card */}
          <div className="rounded-[2.5rem] overflow-hidden border border-border bg-white shadow-2xl shadow-primary/5 animate-slide-up">
            <div className={`h-2.5 w-full ${post.help_type === 'offering' ? 'bg-primary' : 'bg-amber-500'}`} />

            {/* Images */}
            {post.images && post.images.length > 0 && (
              <div className="p-5 pb-0">
                <div className={`gap-3 ${post.images.length === 1 ? '' : 'grid grid-cols-2 md:grid-cols-3'}`}>
                  {post.images.map((imageUrl, index) => (
                    <div
                      key={index}
                      className="overflow-hidden rounded-xl group cursor-pointer"
                      onClick={() => window.open(imageUrl, '_blank')}
                    >
                      <img
                        src={imageUrl}
                        alt={`Post image ${index + 1}`}
                        className={`w-full object-contain transition-transform duration-500 group-hover:scale-105 ${
                          post.images.length === 1 ? 'max-h-80' : 'h-40'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-6">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {post.categories && (
                  <Badge variant="secondary" className="rounded-full flex items-center gap-1 px-3">
                    <Tag className="w-3 h-3" />
                    {post.categories.name}
                  </Badge>
                )}
                <span
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-1.5 ${
                    post.help_type === 'offering' ? 'bg-primary' : 'bg-amber-500'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" />
                  {post.help_type === 'offering' ? 'Offering Help' : 'Seeking Help'}
                </span>
                <Badge variant="outline" className="rounded-full capitalize ml-auto">
                  {post.status}
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tighter leading-none">
                  {post.title}
                </h1>
                {user && post.user_id !== user.id && (
                  <Button
                    onClick={handleContactPoster}
                    className="shrink-0 h-12 px-6 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                )}
              </div>

              <p className="text-foreground/80 leading-relaxed mb-5 text-[15px]">{post.description}</p>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-4 border-t border-border">
                {post.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" />
                    {post.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {posterName}
                </span>
              </div>
            </div>
          </div>

          {/* Comments card */}
          <div className="rounded-2xl border border-border bg-card shadow-sm animate-fade-in-up">
            <div className="px-6 py-4 border-b border-border flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-foreground text-lg">Comments ({comments.length})</h2>
            </div>

            <div className="p-6 space-y-5">
              {user ? (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Write a thoughtful comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="rounded-xl border-border/70 focus:border-primary focus:ring-primary/20 resize-none transition-all duration-200"
                  />
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || submitting}
                    className="rounded-xl flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? 'Posting...' : 'Post Comment'}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 px-6 rounded-2xl flex items-center gap-4 bg-muted/30 border border-border">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-6 h-6 text-primary/40" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-foreground uppercase tracking-tight">
                      Join the conversation
                    </p>
                    <p className="text-xs text-foreground/40 font-medium mt-1">
                      <Link
                        to="/auth"
                        className="text-primary font-black hover:underline inline-flex items-center gap-1 uppercase tracking-tighter"
                      >
                        <LogIn className="w-3 h-3" /> Log in
                      </Link>{' '}
                      to leave a comment
                    </p>
                  </div>
                </div>
              )}

              <div className="border-t border-border" />

              {comments.length === 0 ? (
                <div className="text-center py-10">
                  <MessageSquare className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment, idx) => {
                    const cmtName = comment.profiles?.username || 'Anonymous';
                    const cmtLetter = cmtName[0]?.toUpperCase() || '?';
                    return (
                      <div
                        key={comment.id}
                        className="flex gap-3 p-4 rounded-xl animate-fade-in-up"
                        style={{ background: 'hsl(38 80% 97%)', animationDelay: `${idx * 60}ms` }}
                      >
                        <div
                          className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarGradient(cmtLetter)} flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0 mt-0.5`}
                        >
                          {cmtLetter}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-semibold text-sm text-foreground">{cmtName}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/80 leading-relaxed">{comment.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
