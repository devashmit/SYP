import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Users, FileText, AlertTriangle, BarChart3,
    Search, Check, X, Trash2, EyeOff, UserX,
    Clock, CheckCircle, XCircle, Bell
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const API_URL = 'http://localhost:3000/api';

const AdminDashboard = () => {
    const [allPosts, setAllPosts] = useState<any[]>([]);
    const [pendingPosts, setPendingPosts] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('sahayogi_token');
            const [postsRes, profilesRes] = await Promise.all([
                fetch(`${API_URL}/admin/posts`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/admin/profiles`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            if (postsRes.ok) {
                const posts = await postsRes.json();
                setAllPosts(posts);
                setPendingPosts(posts.filter((p: any) => p.status === 'pending'));
            }
            if (profilesRes.ok) setUsers(await profilesRes.json());
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const approvePost = async (post: any) => {
        try {
            const token = sessionStorage.getItem('sahayogi_token');
            const res = await fetch(`${API_URL}/admin/posts/${post.id}/approve`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success(`"${post.title}" approved and is now live!`);
                fetchAdminData();
            } else {
                const data = await res.json();
                toast.error(`Approval failed: ${data.error}`);
            }
        } catch (err: any) {
            toast.error(`Error: ${err.message}`);
        }
    };

    const rejectPost = async (post: any) => {
        try {
            const token = sessionStorage.getItem('sahayogi_token');
            const res = await fetch(`${API_URL}/admin/posts/${post.id}/reject`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: 'Does not meet community guidelines.' })
            });
            if (res.ok) {
                toast.success(`"${post.title}" rejected.`);
                fetchAdminData();
            } else {
                const data = await res.json();
                toast.error(`Rejection failed: ${data.error}`);
            }
        } catch (err: any) {
            toast.error(`Error: ${err.message}`);
        }
    };

    const deletePost = async (post: any) => {
        try {
            const token = sessionStorage.getItem('sahayogi_token');
            const res = await fetch(`${API_URL}/posts/${post.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success(`Post "${post.title}" deleted`);
                fetchAdminData();
            } else {
                const data = await res.json();
                toast.error(`Delete failed: ${data.error}`);
            }
        } catch (err: any) {
            toast.error(`Error: ${err.message}`);
        }
    };

    const statusColor = (status: string) => {
        if (status === 'available') return 'bg-emerald-500';
        if (status === 'pending') return 'bg-amber-400 animate-pulse';
        if (status === 'rejected') return 'bg-rose-500';
        return 'bg-slate-400';
    };

    const statusBadge = (status: string) => {
        if (status === 'available') return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[9px] uppercase tracking-widest">Approved</Badge>;
        if (status === 'pending') return <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-bold text-[9px] uppercase tracking-widest">Pending</Badge>;
        if (status === 'rejected') return <Badge className="bg-rose-50 text-rose-700 border-rose-200 font-bold text-[9px] uppercase tracking-widest">Rejected</Badge>;
        return <Badge variant="outline" className="font-bold text-[9px] uppercase tracking-widest">{status}</Badge>;
    };

    return (
        <AdminLayout>
            {/* Header */}
            <div className="flex items-center justify-between mb-12">
                <div className="animate-fade-in">
                    <h1 className="text-5xl font-black text-foreground tracking-tighter uppercase">
                        System Overview
                    </h1>
                    <p className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mt-3">
                        Platform Intelligence & Health
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="h-12 px-8 rounded-2xl border-border font-black text-[10px] uppercase tracking-widest text-foreground/60 hover:bg-muted/50">
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-10">
                {[
                    { label: 'Total Users', value: users.length, icon: Users, color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/10' },
                    { label: 'Live Posts', value: allPosts.filter(p => p.status === 'available').length, icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50/50', border: 'border-emerald-100' },
                    { label: 'Pending Review', value: pendingPosts.length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50/50', border: 'border-amber-100' },
                    { label: 'Rejected Posts', value: allPosts.filter(p => p.status === 'rejected').length, icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50/50', border: 'border-rose-100' },
                ].map((stat, i) => (
                    <Card key={i} className={`rounded-[2rem] border ${stat.border} shadow-sm overflow-hidden animate-fade-in-up bg-white`} style={{ animationDelay: `${i * 100}ms` }}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{stat.label}</p>
                                    <p className="text-3xl font-black text-slate-800 dark:text-white leading-none">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs defaultValue="pending" className="space-y-6">
                <TabsList className="bg-muted/30 p-1.5 rounded-2xl flex w-fit border border-border shadow-sm">
                    <TabsTrigger value="pending" className="rounded-xl px-8 py-3 font-black text-[10px] uppercase tracking-widest text-foreground/40 data-[state=active]:bg-white data-[state=active]:text-amber-600 shadow-sm transition-all">
                        Pending Queue
                        {pendingPosts.length > 0 && (
                            <span className="ml-2 bg-amber-500 text-white text-[9px] font-black rounded-full px-1.5 py-0.5">
                                {pendingPosts.length}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="moderation" className="rounded-xl px-8 py-3 font-black text-[10px] uppercase tracking-widest text-foreground/40 data-[state=active]:bg-white data-[state=active]:text-primary shadow-sm transition-all">
                        All Posts
                    </TabsTrigger>
                    <TabsTrigger value="users" className="rounded-xl px-8 py-3 font-black text-[10px] uppercase tracking-widest text-foreground/40 data-[state=active]:bg-white data-[state=active]:text-primary shadow-sm transition-all">
                        Users
                    </TabsTrigger>
                </TabsList>

                {/* === PENDING QUEUE === */}
                <TabsContent value="pending" className="animate-fade-in-up">
                    <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden bg-white dark:bg-slate-900/50">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                            <Bell className="w-5 h-5 text-amber-500" />
                            <div>
                                <h3 className="font-black text-sm uppercase tracking-widest text-slate-800 dark:text-white">Pending Approval</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{pendingPosts.length} post{pendingPosts.length !== 1 ? 's' : ''} awaiting review</p>
                            </div>
                        </div>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="p-16 text-center font-bold text-slate-400">Loading...</div>
                            ) : pendingPosts.length === 0 ? (
                                <div className="p-20 text-center">
                                    <CheckCircle className="w-14 h-14 text-emerald-200 mx-auto mb-4" />
                                    <p className="font-black uppercase tracking-widest text-slate-400 text-sm">All caught up!</p>
                                    <p className="text-xs text-slate-300 mt-1">No posts pending review.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {pendingPosts.map((post) => (
                                        <div key={post.id} className="p-6 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
                                            {/* Thumbnail */}
                                            <div className="h-14 w-14 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                                {post.images?.[0]
                                                    ? <img src={post.images[0]} className="w-full h-full object-cover" />
                                                    : <div className="w-full h-full flex items-center justify-center"><FileText className="w-5 h-5 text-slate-300" /></div>}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-slate-800 dark:text-white truncate uppercase tracking-tight">{post.title}</p>
                                                <p className="text-xs text-slate-400 mt-0.5 truncate font-medium leading-relaxed">{post.description?.slice(0, 90)}{post.description?.length > 90 ? '...' : ''}</p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                        {post.is_anonymous ? 'Anonymous' : post.profiles?.username}
                                                    </span>
                                                    <span className="text-[10px] text-slate-300">·</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{post.categories?.name}</span>
                                                    <span className="text-[10px] text-slate-300">·</span>
                                                    <span className="text-[10px] text-slate-400">{new Date(post.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Button
                                                    onClick={() => approvePost(post)}
                                                    className="h-9 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest shadow-sm shadow-emerald-200 transition-all active:scale-95"
                                                >
                                                    <Check className="w-3.5 h-3.5 mr-1" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    onClick={() => rejectPost(post)}
                                                    variant="ghost"
                                                    className="h-9 px-4 rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
                                                >
                                                    <X className="w-3.5 h-3.5 mr-1" />
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* === ALL POSTS === */}
                <TabsContent value="moderation" className="animate-fade-in-up">
                    <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden bg-white dark:bg-slate-900/50">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                            <div className="relative w-full max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input placeholder="Search posts..." className="pl-12 py-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 font-bold" />
                            </div>
                        </div>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800">
                                        <tr>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Post</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Author</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Category</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {loading ? (
                                            <tr><td colSpan={5} className="p-20 text-center font-bold text-slate-400">Loading...</td></tr>
                                        ) : allPosts.length > 0 ? (
                                            allPosts.map((post) => (
                                                <tr key={post.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all duration-300">
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                                                                {post.images?.[0] && <img src={post.images[0]} className="w-full h-full object-cover transition-transform group-hover:scale-110" />}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-black text-slate-800 dark:text-white truncate uppercase tracking-tight">{post.title}</p>
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{post.id.split('-')[0]}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase">{post.is_anonymous ? 'ANONYMOUS' : post.profiles?.username}</span>
                                                    </td>
                                                    <td className="p-6">
                                                        <Badge variant="outline" className="rounded-lg font-black text-[9px] uppercase tracking-widest border-slate-200 dark:border-slate-700">{post.categories?.name}</Badge>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${statusColor(post.status)}`} />
                                                            {statusBadge(post.status)}
                                                        </div>
                                                    </td>
                                                    <td className="p-6 text-right">
                                                        <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {post.status === 'pending' && (
                                                                <>
                                                                    <Button onClick={() => approvePost(post)} title="Approve" variant="ghost" size="icon" className="h-9 w-9 text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-500/10 rounded-xl">
                                                                        <Check className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button onClick={() => rejectPost(post)} title="Reject" variant="ghost" size="icon" className="h-9 w-9 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/10 rounded-xl">
                                                                        <X className="w-4 h-4" />
                                                                    </Button>
                                                                </>
                                                            )}
                                                            <Button onClick={() => deletePost(post)} title="Delete" variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-rose-500 rounded-xl">
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan={5} className="p-20 text-center text-muted-foreground">No posts found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* === USERS === */}
                <TabsContent value="users">
                    <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 p-20 text-center animate-fade-in-up bg-white dark:bg-slate-900/50">
                        <Users className="w-20 h-20 mx-auto mb-6 text-slate-200 dark:text-slate-800" />
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 uppercase tracking-tight">Identity Management</h3>
                        <p className="text-slate-500 dark:text-slate-400 font-bold max-w-sm mx-auto">Absolute control over user identities, roles, and platform access rights.</p>
                        <div className="mt-8 grid grid-cols-2 gap-4 max-w-xs mx-auto text-left">
                            {users.slice(0, 6).map((u) => (
                                <div key={u.id} className="bg-slate-50 rounded-2xl p-3 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-sm shrink-0">
                                        {u.username?.[0]?.toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-700 truncate">{u.username}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{u.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </AdminLayout>
    );
};

export default AdminDashboard;
