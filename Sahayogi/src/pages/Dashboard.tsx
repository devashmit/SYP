import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    History,
    LayoutGrid,
    MessageSquare,
    Heart,
    Clock,
    CheckCircle2,
    PlusCircle,
    Package,
    TrendingUp,
    Shield,
    Sparkles,
    Users,
    Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PostCard from '@/components/PostCard';
import { UpcomingDrives } from '@/components/UpcomingDrives';

const API_URL = 'http://localhost:3000/api';

const Dashboard = () => {
    const { user } = useAuth();
    const [myPosts, setMyPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchMyPosts();
    }, [user]);

    const fetchMyPosts = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('sahayogi_token');
            const res = await fetch(`${API_URL}/my-posts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMyPosts(data || []);
            }
        } catch (error) {
            console.error('Error fetching my posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            label: 'Contributions',
            value: myPosts.filter(p => p.help_type === 'offering').length,
            sub: 'Items offered to community',
            icon: Heart,
            color: 'text-rose-500',
            bg: 'bg-rose-50',
        },
        {
            label: 'Active Listings',
            value: myPosts.filter(p => p.status === 'available').length,
            sub: 'Currently visible',
            icon: Clock,
            color: 'text-amber-500',
            bg: 'bg-amber-50',
        },
        {
            label: 'Impact',
            value: 12,
            sub: 'Successful connections',
            icon: CheckCircle2,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50',
        },
    ];

    return (
        <div className="min-h-screen bg-background pb-16">
            <Navbar />

            <div className="container mx-auto px-4 pt-24 pb-8 max-w-5xl">
                {/* Page Header */}
                <div className="mb-6 pt-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Dashboard</span>
                        {user?.role === 'admin' && (
                            <Badge variant="secondary" className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border-none font-bold">ADMIN</Badge>
                        )}
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground tracking-tight">
                                Namaste, <span className="text-primary">{user?.username || user?.email?.split('@')[0]}</span>
                            </h1>
                            <p className="text-sm text-muted-foreground mt-0.5">Manage your contributions and track your community impact.</p>
                        </div>
                        <Link to="/create">
                            <Button size="sm" className="rounded-xl h-9 px-4 text-xs font-semibold shadow-sm">
                                <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                                Post a listing
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Micro Stats Row (Chips) */}
                <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
                    {[
                        { label: 'Active', count: myPosts.filter(p => p.status === 'available').length, icon: Clock },
                        { label: 'Fulfilled', count: 12, icon: CheckCircle2 },
                        { label: 'Impact Score', count: 850, icon: TrendingUp },
                        { label: 'Verified Status', count: 'Lv. 2', icon: Shield },
                    ].map((stat) => (
                        <div key={stat.label} className="chip group cursor-default">
                            <stat.icon className="w-3 h-3 text-primary/70" />
                            <span>{stat.label}:</span>
                            <span className="font-bold text-foreground">{stat.count}</span>
                        </div>
                    ))}
                </div>

                {/* Stat Cards - Secondary (Optional, keeping them but tighter) */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={stat.label} className="rounded-2xl border border-border/60 bg-white shadow-none hover:shadow-sm transition-all">
                                <CardContent className="p-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-8 h-8 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                                            <Icon className={`w-4 h-4 ${stat.color}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-lg font-bold text-foreground leading-none mb-0.5">{stat.value}</div>
                                            <div className="text-[10px] text-muted-foreground font-medium truncate uppercase tracking-wider">{stat.label}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Tabs */}
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList className="bg-muted/40 p-0.5 rounded-xl flex w-full sm:w-auto overflow-x-auto border border-border/40 h-auto">
                        {[
                            { value: 'overview', label: 'Overview' },
                            { value: 'my-posts', label: 'My Posts' },
                            { value: 'history', label: 'History' },
                            { value: 'messages', label: 'Messages' },
                        ].map(tab => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className="rounded-lg px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs font-medium text-muted-foreground data-[state=active]:text-foreground"
                            >
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="animate-fade-in-up">
                        <div className="grid lg:grid-cols-[1fr_280px] gap-6">
                            {/* Main Content Area */}
                            <div className="space-y-6">
                                {/* Quick Actions */}
                                <div>
                                    <h2 className="text-xs font-bold text-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5 opacity-60">
                                        <LayoutGrid className="w-3.5 h-3.5 text-primary" />
                                        Quick Actions
                                    </h2>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Link to="/create">
                                            <div className="group p-4 rounded-2xl bg-white border border-border hover:border-primary/20 hover:shadow-light transition-all cursor-pointer flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <PlusCircle className="w-4 h-4 text-primary" />
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="text-xs font-bold text-foreground block">New Post</span>
                                                    <span className="text-[10px] text-muted-foreground truncate">List help or offer</span>
                                                </div>
                                            </div>
                                        </Link>
                                        <Link to="/browse">
                                            <div className="group p-4 rounded-2xl bg-white border border-border hover:border-primary/20 hover:shadow-light transition-all cursor-pointer flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <LayoutGrid className="w-4 h-4 text-amber-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="text-xs font-bold text-foreground block">Browse</span>
                                                    <span className="text-[10px] text-muted-foreground truncate">Explore causes</span>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div>
                                    <h2 className="text-xs font-bold text-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5 opacity-60">
                                        <History className="w-3.5 h-3.5 text-primary" />
                                        Recent Activity
                                    </h2>
                                    <div className="bg-white rounded-2xl border border-border divide-y divide-border/60 overflow-hidden shadow-none">
                                        {myPosts.length > 0 ? (
                                            myPosts.slice(0, 5).map((post) => (
                                                <Link key={post.id} to={`/post/${post.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                                                    <div className="w-10 h-10 rounded-xl bg-muted overflow-hidden shrink-0 border border-border/40">
                                                        {post.images?.[0] ? (
                                                            <img src={post.images[0]} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-primary/5">
                                                                <Package className="w-4 h-4 text-primary/30" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-foreground truncate">{post.title}</p>
                                                        <p className="text-[10px] text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="verified-dot scale-90">
                                                        {post.status}
                                                    </div>
                                                </Link>
                                            ))
                                        ) : (
                                            <div className="py-12 text-center">
                                                <Package className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                                                <p className="text-xs text-muted-foreground">No recent activity found.</p>
                                                <Link to="/create" className="text-primary text-[10px] font-bold mt-2 inline-block">Start your first post →</Link>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Your Impact Banner (Denser) */}
                                <div className="bg-primary rounded-2xl p-5 text-white overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-xl" />
                                    <div className="relative flex items-center justify-between">
                                        <div className="max-w-[70%]">
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <TrendingUp className="w-3.5 h-3.5 text-white/70" />
                                                <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Global Impact Score</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-white leading-tight mb-2">You've reached <span className="text-amber-300">Level 4</span> Kindness Mentor status</h3>
                                            <p className="text-[11px] text-white/70 leading-relaxed">Your contributions have helped 12+ verified families this month. Amazing progress!</p>
                                        </div>
                                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                                            <Heart className="w-8 h-8 fill-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Rail Sidebar */}
                            <aside className="space-y-4">
                                {/* Dashboard Right Card 1: Community Spotlight / User Score */}
                                <div className="bg-white rounded-2xl border border-border p-4">
                                    <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest mb-3 opacity-60">Reputation</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="text-muted-foreground">Verification status</span>
                                            <span className="verified-dot py-0.5"><CheckCircle2 className="w-2.5 h-2.5" />Full</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="text-muted-foreground">Community trust</span>
                                            <span className="font-bold text-foreground">98.2%</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="text-muted-foreground">Badge earned</span>
                                            <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-600 font-bold border border-amber-100 flex items-center gap-1">
                                                <Sparkles className="w-2.5 h-2.5" /> Mentor
                                            </span>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full mt-4 rounded-xl h-8 text-[10px] font-bold border-primary/20 text-primary">View certificates</Button>
                                </div>

                                {/* Suggested Actions */}
                                <div className="bg-muted/30 border border-border/40 rounded-2xl p-4">
                                    <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest mb-3 opacity-60">Suggested next</h3>
                                    <div className="space-y-2">
                                        {[
                                            { title: 'Update profile info', icon: Users, cta: 'Complete 80%' },
                                            { title: 'Verify mobile number', icon: Shield, cta: 'Boost trust' },
                                            { title: 'Share 2024 impact', icon: TrendingUp, cta: 'Public wall' },
                                        ].map((action, i) => (
                                            <div key={i} className="flex items-center justify-between group cursor-pointer">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-lg bg-white border border-border/40 flex items-center justify-center shrink-0">
                                                        <action.icon className="w-3 h-3 text-muted-foreground" />
                                                    </div>
                                                    <span className="text-[11px] font-medium text-foreground truncate">{action.title}</span>
                                                </div>
                                                <span className="text-[9px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">Go</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Safety Reminder */}
                                <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4">
                                    <div className="flex items-start gap-2.5">
                                        <div className="p-1 rounded-lg bg-white border border-rose-100 shrink-0">
                                            <Lock className="w-3 h-3 text-rose-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-bold text-rose-900 mb-0.5">Privacy First</p>
                                            <p className="text-[10px] text-rose-800/70 leading-relaxed">Never share sensitive bank details in public comments. Use private chat for address exchanges.</p>
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        </div>

                        {/* Upcoming Drives Section in Dashboard */}
                        <div className="mt-8 pt-8 border-t border-border/60">
                            <UpcomingDrives />
                        </div>
                    </TabsContent>

                    {/* My Posts Tab */}
                    <TabsContent value="my-posts" className="animate-fade-in-up">
                        <div className="max-w-2xl space-y-4">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                </div>
                            ) : myPosts.length > 0 ? (
                                myPosts.map(post => <PostCard key={post.id} post={post} />)
                            ) : (
                                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-border grain-overlay flex flex-col items-center">
                                    <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center mb-4">
                                        <Package className="w-8 h-8 text-primary/30" />
                                    </div>
                                    <h3 className="text-sm font-bold text-foreground mb-1">Your listing wall is empty</h3>
                                    <p className="text-[11px] text-muted-foreground mb-6 max-w-[220px] leading-relaxed">
                                        You haven't posted any help requests or offerings yet. Start your journey today.
                                    </p>
                                    <Link to="/create">
                                        <Button size="sm" className="rounded-xl h-9 px-6 text-xs font-bold shadow-sm">
                                            <PlusCircle className="w-3.5 h-3.5 mr-2" />
                                            Post your first listing
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* History Tab */}
                    <TabsContent value="history" className="animate-fade-in-up">
                        <Card className="rounded-2xl border-border shadow-none">
                            <CardHeader className="pb-3 border-b border-border/60">
                                <CardTitle className="text-sm font-semibold">Donation History</CardTitle>
                                <CardDescription className="text-xs">A record of your completed contributions and exchanges.</CardDescription>
                            </CardHeader>
                            <CardContent className="py-20 text-center flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                                    <History className="w-8 h-8 text-muted-foreground/20" />
                                </div>
                                <h3 className="text-sm font-bold text-foreground mb-1">No past exchanges</h3>
                                <p className="text-[11px] text-muted-foreground max-w-[200px] mb-6">
                                    Once you complete a donation or receive items, your history will be archived here.
                                </p>
                                <Link to="/browse">
                                    <Button variant="secondary" size="sm" className="rounded-xl px-5 text-[10px] font-bold">Discover causes</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Messages Tab */}
                    <TabsContent value="messages" className="animate-fade-in-up">
                        <div className="grid lg:grid-cols-3 gap-4 h-[520px]">
                            <div className="lg:col-span-1 bg-white rounded-2xl border border-border overflow-hidden flex flex-col">
                                <div className="px-4 py-3 border-b border-border/60 flex items-center gap-2">
                                    <MessageSquare className="w-3.5 h-3.5 text-primary" />
                                    <span className="text-xs font-semibold text-foreground">Conversations</span>
                                </div>
                                <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center px-4">
                                    <MessageSquare className="w-8 h-8 text-muted-foreground/20" />
                                    <p className="text-xs text-muted-foreground">No messages yet.</p>
                                    <Link to="/browse">
                                        <Button variant="outline" size="sm" className="rounded-xl text-xs mt-1">Browse Posts</Button>
                                    </Link>
                                </div>
                            </div>
                            <div className="hidden lg:flex lg:col-span-2 bg-white rounded-2xl border border-border items-center justify-center text-center p-10">
                                <div>
                                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 border border-border/40 shadow-inner">
                                        <MessageSquare className="w-7 h-7 text-muted-foreground/30" />
                                    </div>
                                    <h3 className="text-sm font-bold text-foreground mb-1">Direct community chat</h3>
                                    <p className="text-[11px] text-muted-foreground max-w-xs mx-auto mb-6">
                                        Messaging is the fastest way to coordinate drop-offs and verify needs.
                                    </p>
                                    <div className="flex items-center justify-center gap-2">
                                        <Link to="/browse">
                                            <Button variant="outline" size="sm" className="rounded-xl text-[10px] font-bold border-border h-8">Start a conversation</Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default Dashboard;
