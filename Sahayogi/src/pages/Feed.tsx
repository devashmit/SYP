import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    CheckCircle2, MapPin, Clock, Flame, Heart, BookOpen,
    Stethoscope, Utensils, Package, PlusCircle, SlidersHorizontal,
    TrendingUp, Users, ArrowRight, Shield, LayoutGrid, Rss
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PostCard from '@/components/PostCard';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { Badge } from '@/components/ui/badge';
import BackButton from '@/components/BackButton';
import { API_URL } from '@/config';

/* ─── Tab config ──────────────────────────────────────────────────────── */
const TABS = [
    { id: 'all', label: 'All Posts', icon: LayoutGrid, color: 'text-primary' },
    { id: 'verified', label: 'Verified', icon: CheckCircle2, color: 'text-emerald-600' },
    { id: 'urgent', label: 'Urgent', icon: Flame, color: 'text-rose-500' },
    { id: 'medical', label: 'Medical', icon: Stethoscope, color: 'text-violet-500' },
    { id: 'education', label: 'Education', icon: BookOpen, color: 'text-amber-600' },
    { id: 'food', label: 'Food', icon: Utensils, color: 'text-orange-500' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest first' },
    { value: 'urgent', label: 'Urgent needs' },
];

const EMPTY_STATES: Record<TabId, { icon: React.ElementType; title: string; body: string }> = {
    all: { icon: LayoutGrid, title: 'No posts yet', body: 'Be the first to share a cause with your community.' },
    verified: { icon: CheckCircle2, title: 'No verified posts', body: 'Verified posts show up after NGO or admin review.' },
    urgent: { icon: Flame, title: 'No urgent requests', body: "No high-priority crisis posts at the moment." },
    medical: { icon: Stethoscope, title: 'No medical posts', body: 'No active medical requests found.' },
    education: { icon: BookOpen, title: 'No education posts', body: 'No education-related listings found.' },
    food: { icon: Utensils, title: 'No food posts', body: 'No food requests at the moment.' },
};

import FeedHero from '@/components/FeedHero';

const Feed = () => {
    const { user } = useAuth();
    // ... rest of state
    const { socket } = useSocket();
    const [activeTab, setActiveTab] = useState<TabId>('all');
    const [sort, setSort] = useState('newest');
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const mountedRef = useRef(true);

    useEffect(() => {
        fetchPosts();
        return () => { mountedRef.current = false; };
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handlePostCreated = (newPost: any) => {
            // Only show approved posts in the feed
            if (newPost.post_type !== 'user_post' || newPost.status !== 'available') return;
            setPosts(prev => {
                if (prev.some(p => p.id === newPost.id)) return prev;
                return [newPost, ...prev];
            });
        };

        const handlePostUpdated = (updated: any) => {
            if (updated.post_type !== 'user_post') return;
            setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
        };

        const handlePostDeleted = (deletedId: string) => {
            setPosts(prev => prev.filter(p => p.id !== deletedId));
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
            const res = await fetch(`${API_URL}/posts?type=user_post`);
            if (res.ok && mountedRef.current) {
                const data = await res.json();
                setPosts(Array.isArray(data) ? data : []);
            }
        } catch { /* silent */ } finally {
            if (mountedRef.current) setLoading(false);
        }
    };

    const filteredPosts = posts.filter(p => {
        if (activeTab === 'all') return true;
        if (activeTab === 'verified') return p.is_verified;
        if (activeTab === 'urgent') return p.urgent;
        return p.categories?.name?.toLowerCase() === activeTab || p.category?.toLowerCase() === activeTab;
    });

    const sortedPosts = [...filteredPosts].sort((a, b) => {
        if (sort === 'urgent') return (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0);
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const emptyState = EMPTY_STATES[activeTab];
    const EmptyIcon = emptyState.icon;

    return (
        <div className="min-h-screen bg-[#fcfcfd]">
            <Navbar />

            <FeedHero username={user?.username} />

            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="grid lg:grid-cols-[1fr_280px] gap-8">

                    <main className="space-y-6 min-w-0">
                        {/* Back Button */}
                        <BackButton />
                        {/* Nav & Filters */}
                        <div className="space-y-4 w-full max-w-full overflow-hidden">
                            <div className="flex gap-2 p-1.5 bg-muted/40 rounded-2xl overflow-x-auto scrollbar-hide max-w-full">
                                {TABS.map(({ id, label, icon: Icon, color }) => (
                                    <button
                                        key={id}
                                        onClick={() => setActiveTab(id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${activeTab === id
                                            ? 'bg-white text-foreground shadow-sm border-opacity-10 ring-1 ring-border'
                                            : 'text-muted-foreground hover:bg-white/50 hover:text-foreground'
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 ${activeTab === id ? color : 'opacity-60'}`} />
                                        {label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 py-1">
                                <div className="flex items-center gap-2 px-1">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-xs font-medium text-muted-foreground">
                                        Live Updates
                                    </span>
                                    <div className="h-4 w-px bg-border mx-2" />
                                    <span className="text-xs font-semibold text-foreground">
                                        {loading ? '...' : `${sortedPosts.length} Results`}
                                    </span>
                                </div>

                                <Select value={sort} onValueChange={setSort}>
                                    <SelectTrigger className="w-full sm:w-44 h-10 rounded-2xl bg-white border-border shadow-sm border-opacity-10 text-sm">
                                        <SlidersHorizontal className="w-4 h-4 mr-2 opacity-50" />
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl">
                                        {SORT_OPTIONS.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value} className="text-sm">
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* List */}
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-40 rounded-3xl bg-white border border-border/60 animate-pulse shadow-sm border-opacity-10" />
                                ))}
                            </div>
                        ) : sortedPosts.length === 0 ? (
                            <div className="py-24 text-center bg-white rounded-3xl border border-dashed border-border/80">
                                <div className="w-20 h-20 mx-auto rounded-full bg-muted/30 flex items-center justify-center mb-4">
                                    <EmptyIcon className="w-10 h-10 text-muted-foreground/30" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">{emptyState.title}</h3>
                                <p className="text-muted-foreground text-sm max-w-[240px] mx-auto mb-6">{emptyState.body}</p>
                                <Link to="/create">
                                    <Button className="rounded-2xl h-11 px-8 font-bold shadow-xl shadow-primary/10 transition-transform active:scale-95">
                                        <PlusCircle className="w-4 h-4 mr-2" />
                                        Share Your Story
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {sortedPosts.map((post, i) => (
                                    <div
                                        key={post.id}
                                        className="animate-staggered-fade-in"
                                        style={{ animationDelay: `${i * 100}ms` }}
                                    >
                                        <PostCard post={post} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </main>

                    {/* Sidebar */}
                    <aside className="hidden lg:block space-y-6">
                        <div className="sticky top-28 space-y-6">
                            {/* Stats Card */}
                            <div className="bg-foreground rounded-3xl p-6 text-white relative overflow-hidden group">
                                <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl transition-transform duration-500 group-hover:scale-110" />
                                <div className="relative">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-2xl bg-white/10 flex items-center justify-center">
                                            <TrendingUp className="w-4 h-4 text-primary" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Impact</span>
                                    </div>
                                    <div className="text-3xl font-bold mb-1 tabular-nums">1.2M+</div>
                                    <p className="text-[11px] text-white/40 mb-6">Lives touched this year</p>
                                    <Button className="w-full rounded-2xl bg-white text-foreground hover:bg-white/90 font-bold h-11 transition-all active:scale-[0.98]">
                                        Support More
                                    </Button>
                                </div>
                            </div>

                            {/* Tips Card */}
                            <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100">
                                <div className="flex gap-6">
                                    <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm border-opacity-10 shadow-amber-200/50">
                                        <Shield className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-amber-900 mb-1">Safety First</h4>
                                        <p className="text-[11px] text-amber-700 leading-relaxed">
                                            Verify identity and only meet in busy public spaces for physical help.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Community Link */}
                            <Link to="/community-needs" className="block group">
                                <div className="bg-white rounded-3xl p-6 border border-border/80 transition-all hover:bg-muted/10 hover:border-primary/20 hover:shadow-lg">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                                            <span className="text-xs font-bold text-rose-600">Critical Needs</span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Check out verified urgent needs tracked by Sahayogi.
                                    </p>
                                </div>
                            </Link>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default Feed;

