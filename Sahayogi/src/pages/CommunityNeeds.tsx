import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Clock, CheckCircle2, ArrowRight, PlusCircle, Flame, Shield, TrendingUp, Sparkles } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { Badge } from '@/components/ui/badge';
import BackButton from '@/components/BackButton';
import { useAuth } from '@/contexts/AuthContext';
import childrenImg from '@/assets/Children-sponsorship-program-Picsart-AiImageEnhancer.webp';

const API_URL = 'http://localhost:3000/api';

const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 3_600_000);
    const d = Math.floor(diff / 86_400_000);
    if (h < 1) return 'Just now';
    if (h < 24) return `${h}h ago`;
    return `${d}d ago`;
};

const NeedCard = ({ post, index }: { post: any; index: number }) => {
    const [imgLoaded, setImgLoaded] = useState(false);

    return (
        <div
            className="animate-staggered-fade-in group"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <div className="bg-white rounded-[2rem] border border-border/60 hover:border-rose-200/60 hover:shadow-2xl hover:shadow-rose-500/5 transition-all duration-500 overflow-hidden flex flex-col h-full spotlight-card">
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden bg-muted">
                    {post.images?.[0] ? (
                        <>
                            {!imgLoaded && <div className="absolute inset-0 skeleton-shimmer" />}
                            <img
                                src={post.images[0]}
                                alt={post.title}
                                onLoad={() => setImgLoaded(true)}
                                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                            />
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-rose-50/50">
                            <Heart className="w-10 h-10 text-rose-100" />
                        </div>
                    )}
                    <div className="absolute top-4 left-4">
                        <Badge className="bg-rose-500 text-white border-none shadow-lg px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                            Critical Need
                        </Badge>
                    </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Urgent Help</span>
                        </div>
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                            <Clock className="w-3 h-3 opacity-50" />
                            {timeAgo(post.created_at)}
                        </span>
                    </div>

                    <h3 className="text-lg font-bold text-foreground leading-tight mb-2 group-hover:text-rose-600 transition-colors">
                        {post.title}
                    </h3>

                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-6">
                        {post.description}
                    </p>

                    <div className="mt-auto space-y-4">
                        {post.location && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-xl border border-border/40">
                                <MapPin className="w-3.5 h-3.5 text-rose-500/60" />
                                {post.location}
                            </div>
                        )}

                        <Link to={`/post/${post.id}`}>
                            <Button className="w-full rounded-2xl h-12 bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-lg shadow-rose-500/20 transition-all active:scale-[0.98] group/btn">
                                Support this cause
                                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CommunityNeeds = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();
    const { user } = useAuth();
    const mountedRef = useRef(true);

    useEffect(() => {
        fetchPosts();
        return () => { mountedRef.current = false; };
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handlePostCreated = (newPost: any) => {
            if (newPost.post_type !== 'community_need') return;
            setPosts(prev => {
                if (prev.some(p => p.id === newPost.id)) return prev;
                return [newPost, ...prev];
            });
        };
        const handlePostUpdated = (updated: any) => {
            if (updated.post_type !== 'community_need') return;
            setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
        };
        const handlePostDeleted = (id: string) => {
            setPosts(prev => prev.filter(p => p.id !== id));
        };

        socket.on('post_created', handlePostCreated);
        socket.on('post_updated', handlePostUpdated);
        socket.on('post_deleted', handlePostDeleted);
        return () => {
            socket.off('post_created', handlePostCreated);
            socket.off('post_updated', handlePostUpdated);
            socket.off('post_deleted', handlePostDeleted);
        };
    }, [socket]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/posts?type=community_need`);
            if (res.ok && mountedRef.current) {
                const data = await res.json();
                setPosts(Array.isArray(data) ? data : []);
            }
        } catch { /* silent */ }
        finally { if (mountedRef.current) setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#fcfcfd]">
            <Navbar />

            {/* Back Button */}
            <div className="container mx-auto px-5 pt-5 max-w-5xl">
                <BackButton />
            </div>

            {/* Hero Section */}
            <div className="w-full relative py-16 sm:py-24 overflow-hidden bg-white border-b border-border/40">
                {/* Children background image */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden bg-rose-50/30">
                    <img
                        src={childrenImg}
                        alt=""
                        className="w-full h-full object-cover object-center opacity-30 mix-blend-multiply animate-[slow-zoom_35s_infinite_alternate]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-[#fcfcfd]" />
                </div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.03),transparent)]" />
                <div className="container mx-auto px-5 max-w-5xl relative">
                    <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 mb-6 animate-fade-in">
                            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Sahayogi Direct Impact</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4 animate-slide-up">
                            Community <span className="text-rose-500">Needs</span>
                        </h1>
                        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed animate-slide-up animation-delay-100">
                            Verified, high-impact requests from families and groups in need across Nepal. Every contribution here makes a direct difference.
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-5 py-12 max-w-5xl">
                {loading ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-80 rounded-[2rem] bg-white border border-border/40 animate-pulse shadow-sm" />
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="py-24 text-center bg-white rounded-[2rem] border border-dashed border-border/80">
                        <div className="w-20 h-20 mx-auto rounded-full bg-rose-50 flex items-center justify-center mb-6">
                            <Heart className="w-10 h-10 text-rose-200" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">No active needs found</h3>
                        <p className="text-muted-foreground text-sm max-w-[280px] mx-auto mb-8">
                            This is actually great news! It means all current needs are being addressed.
                        </p>
                        <Link to="/">
                            <Button variant="outline" className="rounded-2xl h-11 px-8 font-bold">
                                Browse main feed
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-rose-50 rounded-2xl">
                                    <Flame className="w-5 h-5 text-rose-500" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-foreground">Active Interventions</h2>
                                    <p className="text-[11px] text-muted-foreground">{posts.length} critical causes require support</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="rounded-xl px-4 py-1.5 border-emerald-100 bg-emerald-50 text-emerald-600 font-bold text-[10px] flex gap-2 items-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Live Feed Enabled
                            </Badge>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.map((post, i) => (
                                <NeedCard key={post.id} post={post} index={i} />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Support Strip */}
            <div className="bg-foreground text-white mt-12 mb-20 rounded-[2.5rem] mx-5 p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-125" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-md">
                        <h4 className="text-2xl font-bold mb-2">Want to report a help request?</h4>
                        <p className="text-white/60 text-sm leading-relaxed">
                            Sahayogi works with local volunteers to verify community needs. Reach out if you know a group that needs urgent support.
                        </p>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <Button className="w-full md:w-auto h-12 px-8 rounded-2xl bg-white text-foreground hover:bg-white/90 font-bold shadow-xl">
                            Contact Support
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityNeeds;
