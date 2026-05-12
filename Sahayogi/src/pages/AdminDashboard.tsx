import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Users, FileText, AlertTriangle, BarChart3,
    Search, Check, X, Trash2, EyeOff, UserX,
    Clock, CheckCircle, XCircle, Bell, Image as ImageIcon
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useSocket } from '@/contexts/SocketContext';
import { API_URL } from '@/config';

const AdminDashboard = () => {
    const [allPosts, setAllPosts] = useState<any[]>([]);
    const [pendingPosts, setPendingPosts] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Image Upload State for Broadcasts
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    const [postSearch, setPostSearch] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [postPage, setPostPage] = useState(1);
    const [userPage, setUserPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const { socket } = useSocket();

    useEffect(() => {
        fetchAdminData();
    }, []);

    useEffect(() => {
        if (!socket) return;
        
        const handleNewPendingPost = () => {
            fetchAdminData();
            toast.info('New post received for review', {
                description: 'A user has submitted a new post that requires approval.',
                duration: 5000
            });
        };

        socket.on('post_pending', handleNewPendingPost);
        return () => {
            socket.off('post_pending', handleNewPendingPost);
        };
    }, [socket]);

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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + selectedImages.length > 5) {
            toast.error('You can only upload up to 5 images');
            return;
        }
        const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
        setSelectedImages(prev => [...prev, ...validFiles]);
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
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

    // Filtering & Pagination Logic
    const filteredPosts = allPosts.filter(p => p.title?.toLowerCase().includes(postSearch.toLowerCase()) || p.profiles?.username?.toLowerCase().includes(postSearch.toLowerCase()));
    const paginatedPosts = filteredPosts.slice((postPage - 1) * ITEMS_PER_PAGE, postPage * ITEMS_PER_PAGE);

    const filteredUsers = users.filter(u => u.username?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase()) || u.full_name?.toLowerCase().includes(userSearch.toLowerCase()));
    const paginatedUsers = filteredUsers.slice((userPage - 1) * ITEMS_PER_PAGE, userPage * ITEMS_PER_PAGE);

    return (
        <AdminLayout>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                    <TabsTrigger value="community_needs" className="rounded-xl px-8 py-3 font-black text-[10px] uppercase tracking-widest text-foreground/40 data-[state=active]:bg-white data-[state=active]:text-primary shadow-sm transition-all">
                        Post Need
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
                                <Input value={postSearch} onChange={e => { setPostSearch(e.target.value); setPostPage(1); }} placeholder="Search posts..." className="pl-12 py-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 font-bold" />
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
                                        ) : paginatedPosts.length > 0 ? (
                                            paginatedPosts.map((post) => (
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
                            {/* Pagination Controls */}
                            {filteredPosts.length > ITEMS_PER_PAGE && (
                                <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50">
                                    <span className="text-xs text-slate-500 font-bold">Showing {((postPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(postPage * ITEMS_PER_PAGE, filteredPosts.length)} of {filteredPosts.length}</span>
                                    <div className="space-x-2">
                                        <Button disabled={postPage === 1} onClick={() => setPostPage(p => p - 1)} variant="outline" size="sm" className="rounded-xl">Previous</Button>
                                        <Button disabled={postPage * ITEMS_PER_PAGE >= filteredPosts.length} onClick={() => setPostPage(p => p + 1)} variant="outline" size="sm" className="rounded-xl">Next</Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* === USERS === */}
                <TabsContent value="users" className="animate-fade-in-up">
                    <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden bg-white dark:bg-slate-900/50">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-primary" />
                                <div>
                                    <h3 className="font-black text-sm uppercase tracking-widest text-slate-800 dark:text-white">All Users</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
                                </div>
                            </div>
                            <div className="relative w-full max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input value={userSearch} onChange={e => { setUserSearch(e.target.value); setUserPage(1); }} placeholder="Search users..." className="pl-10 h-10 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 font-medium text-sm" />
                            </div>
                        </div>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800">
                                        <tr>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">User</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Email</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Role</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {loading ? (
                                            <tr><td colSpan={4} className="p-20 text-center font-bold text-slate-400">Loading...</td></tr>
                                        ) : paginatedUsers.length > 0 ? (
                                            paginatedUsers.map((u) => (
                                                <tr key={u.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all duration-300">
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-sm shrink-0 border border-primary/20">
                                                                {(u.full_name || u.username)?.[0]?.toUpperCase() || '?'}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{u.full_name || u.username}</p>
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">@{u.username}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{u.email}</span>
                                                    </td>
                                                    <td className="p-6">
                                                        <Badge className={`font-bold text-[9px] uppercase tracking-widest ${
                                                            u.role === 'admin'
                                                                ? 'bg-primary/10 text-primary border-primary/20'
                                                                : u.role === 'recipient'
                                                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        }`}>
                                                            {u.role}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-6">
                                                        <span className="text-xs text-slate-400">{new Date(u.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan={4} className="p-20 text-center text-muted-foreground">No users found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {/* Pagination Controls */}
                            {filteredUsers.length > ITEMS_PER_PAGE && (
                                <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50">
                                    <span className="text-xs text-slate-500 font-bold">Showing {((userPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(userPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length}</span>
                                    <div className="space-x-2">
                                        <Button disabled={userPage === 1} onClick={() => setUserPage(p => p - 1)} variant="outline" size="sm" className="rounded-xl">Previous</Button>
                                        <Button disabled={userPage * ITEMS_PER_PAGE >= filteredUsers.length} onClick={() => setUserPage(p => p + 1)} variant="outline" size="sm" className="rounded-xl">Next</Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* === POST COMMUNITY NEED === */}
                <TabsContent value="community_needs" className="animate-fade-in-up">
                    <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden bg-white dark:bg-slate-900/50 p-6">
                        <div className="max-w-xl mx-auto py-8">
                            <div className="mb-8 text-center">
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Broadcast Official Need</h3>
                                <p className="text-sm text-slate-500 mt-2">These posts will appear exclusively in the Community Needs feed and notify all users.</p>
                            </div>
                            <form className="space-y-5" onSubmit={async (e) => {
                                e.preventDefault();
                                const form = e.currentTarget;
                                const formData = new FormData(form);
                                const token = sessionStorage.getItem('sahayogi_token');
                                const payload = {
                                    title: formData.get('title'),
                                    description: formData.get('description'),
                                    category_id: 1, 
                                    location: formData.get('location') || '',
                                    images: imagePreviews
                                };
                                const res = await fetch('http://localhost:3000/api/posts/community-needs', {
                                    method: 'POST',
                                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                    body: JSON.stringify(payload)
                                });
                                if (res.ok) {
                                    form.reset();
                                    setImagePreviews([]);
                                    setSelectedImages([]);
                                    fetchAdminData();
                                    toast.success('Successfully broadcasted Community Need');
                                } else {
                                    const data = await res.json();
                                    alert('Error: ' + data.error);
                                }
                            }}>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Urgent Headline</label>
                                    <Input name="title" className="h-12 bg-slate-50 border-slate-200 font-bold" required placeholder="e.g. Blankets needed for winter shelter" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Location</label>
                                    <Input name="location" className="h-12 bg-slate-50 border-slate-200 font-medium" placeholder="E.g. Kathmandu Valley" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Situation Details</label>
                                    <textarea name="description" className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-medium min-h-[140px]" required placeholder="Provide details about the emergency or required support..." />
                                </div>
                                
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Attachments (Optional)</label>
                                    <div className="flex flex-wrap gap-3">
                                        <div 
                                            onClick={() => document.getElementById('admin-image-input')?.click()}
                                            className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-rose-300 hover:bg-rose-50 transition-all text-slate-400 hover:text-rose-500"
                                        >
                                            <ImageIcon className="w-6 h-6 mb-1" />
                                            <span className="text-[8px] font-bold uppercase">Add</span>
                                        </div>
                                        <input
                                            id="admin-image-input"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                        {imagePreviews.map((preview, idx) => (
                                            <div key={idx} className="relative w-20 h-20 group">
                                                <img src={preview} className="w-full h-full object-cover rounded-2xl border border-slate-100 shadow-sm" />
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeImage(idx)}
                                                    className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[9px] text-slate-400 font-medium">JPG, PNG or WebP. Max 5MB each. {selectedImages.length}/5 images.</p>
                                </div>
                                <Button type="submit" className="w-full h-12 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest shadow-lg shadow-rose-200 transition-all">
                                    Broadcast Need
                                </Button>
                            </form>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </AdminLayout>
    );
};

export default AdminDashboard;
