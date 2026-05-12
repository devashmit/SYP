import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PostCard from '@/components/PostCard';
import { API_URL } from '@/config';
import {
  Heart, Clock, CheckCircle2, PlusCircle, Package,
  TrendingUp, LayoutGrid, History, MessageSquare,
  Home, Search, Activity, User, Edit2, CheckCircle,
  Users, HandHeart, Leaf, ArrowRight, Bell, Menu,
  Zap, Shield
} from 'lucide-react';
import sahayogiLogo from '@/assets/Logo.svg';
import { NotificationsDropdown } from '@/components/NotificationsDropdown';

/* ── palette ── */
const P = {
  red: '#C0392B',
  redLight: '#E8534A',
  redBg: '#FFF0EF',
  redMid: '#FDDBD9',
  beige: '#FDF8F5',
  card: '#FFFFFF',
  border: '#F0E8E6',
  text: '#1C1412',
  muted: '#8A7370',
  green: '#27AE60',
  amber: '#E67E22',
  blue: '#2980B9',
  teal: '#16A085',
};

/* ── community banner SVG illustration ── */
const CommunityIllustration = () => (
  <svg viewBox="0 0 400 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Sky gradient */}
    <rect width="400" height="160" fill="url(#sky)" />
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="400" y2="160" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDDBD9" />
        <stop offset="1" stopColor="#FFF0EF" />
      </linearGradient>
    </defs>
    {/* Hearts floating */}
    <circle cx="320" cy="30" r="12" fill="#E8534A" opacity="0.15" />
    <circle cx="340" cy="18" r="8" fill="#E8534A" opacity="0.2" />
    <circle cx="360" cy="35" r="6" fill="#E8534A" opacity="0.12" />
    <text x="316" y="35" fontSize="14" fill="#C0392B" opacity="0.5">♥</text>
    <text x="336" y="23" fontSize="10" fill="#C0392B" opacity="0.4">♥</text>
    {/* Ground */}
    <ellipse cx="200" cy="155" rx="200" ry="20" fill="#E8534A" opacity="0.08" />
    {/* People silhouettes - group of 5 */}
    {/* Person 1 - left */}
    <ellipse cx="100" cy="100" rx="16" ry="16" fill="#C0392B" opacity="0.7" />
    <rect x="88" y="112" width="24" height="36" rx="8" fill="#C0392B" opacity="0.6" />
    {/* Person 2 */}
    <ellipse cx="140" cy="95" rx="18" ry="18" fill="#E8534A" opacity="0.8" />
    <rect x="126" y="109" width="28" height="40" rx="9" fill="#E8534A" opacity="0.7" />
    {/* Person 3 - center, taller */}
    <ellipse cx="185" cy="88" rx="20" ry="20" fill="#C0392B" opacity="0.9" />
    <rect x="169" y="104" width="32" height="44" rx="10" fill="#C0392B" opacity="0.8" />
    {/* Person 4 */}
    <ellipse cx="232" cy="93" rx="18" ry="18" fill="#E67E22" opacity="0.8" />
    <rect x="218" y="107" width="28" height="42" rx="9" fill="#E67E22" opacity="0.7" />
    {/* Person 5 - right */}
    <ellipse cx="272" cy="98" rx="16" ry="16" fill="#C0392B" opacity="0.7" />
    <rect x="260" y="110" width="24" height="38" rx="8" fill="#C0392B" opacity="0.6" />
    {/* Arms connecting - hugging gesture */}
    <path d="M116 118 Q128 108 140 112" stroke="#C0392B" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
    <path d="M158 112 Q172 102 185 106" stroke="#E8534A" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
    <path d="M205 106 Q218 100 232 108" stroke="#C0392B" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
    <path d="M250 110 Q261 104 272 112" stroke="#E67E22" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
  </svg>
);

/* ── bottom nav item ── */
const NavItem = ({ icon: Icon, label, to, active }: { icon: any; label: string; to: string; active?: boolean }) => (
  <Link to={to} className="flex flex-col items-center gap-0.5 min-w-0">
    <Icon className="w-5 h-5" style={{ color: active ? P.red : P.muted }} />
    <span className="text-[10px] font-semibold" style={{ color: active ? P.red : P.muted }}>{label}</span>
  </Link>
);

type TabId = 'overview' | 'my-posts' | 'history' | 'messages';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [historyPosts, setHistoryPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  useEffect(() => {
    if (user) { fetchMyPosts(); fetchHistoryPosts(); }
  }, [user]);

  const fetchMyPosts = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('sahayogi_token');
      const res = await fetch(`${API_URL}/my-posts`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setMyPosts((await res.json()) || []);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const fetchHistoryPosts = async () => {
    try {
      const token = sessionStorage.getItem('sahayogi_token');
      const res = await fetch(`${API_URL}/history`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setHistoryPosts((await res.json()) || []);
    } catch { /* silent */ }
  };

  const contributions = myPosts.filter(p => p.intent === 'OFFER_HELP' || p.help_type === 'offering').length;
  const activeListings = myPosts.filter(p => p.status === 'available').length;
  const impacts = 12;
  const livesImpacted = 320;

  const statCards = [
    { label: 'Contributions', value: contributions, icon: Heart, color: P.red, bg: P.redBg },
    { label: 'Active Listings', value: activeListings, icon: Clock, color: P.amber, bg: '#FFF8EE' },
    { label: 'Impacts', value: impacts, icon: Zap, color: P.teal, bg: '#EDFAF6' },
    { label: 'Lives Impacted', value: `${livesImpacted}+`, icon: Users, color: P.blue, bg: '#EEF4FF' },
  ];

  const quickActions = [
    { label: 'New Post', desc: 'Share a need or opportunity', icon: PlusCircle, color: P.red, bg: P.redBg, to: '/create' },
    { label: 'Browse', desc: 'Explore needs and causes', icon: LayoutGrid, color: P.amber, bg: '#FFF8EE', to: '/browse' },
    { label: 'Donate', desc: 'Support a cause you care about', icon: Heart, color: P.teal, bg: '#EDFAF6', to: '/browse' },
    { label: 'Volunteer', desc: 'Offer your time and skills', icon: HandHeart, color: P.blue, bg: '#EEF4FF', to: '/community-needs' },
  ];

  const recentActivity = myPosts.slice(0, 3).map((post, i) => ({
    id: post.id,
    title: post.title,
    desc: post.status === 'available' ? 'Your post is live' : post.status === 'pending' ? 'Awaiting approval' : `Status: ${post.status}`,
    time: new Date(post.created_at).toLocaleDateString('en-NP', { month: 'short', day: 'numeric' }),
    impact: `+${(i + 1) * 5} Impact`,
    impactColor: [P.red, P.teal, P.blue][i % 3],
    img: post.images?.[0] || null,
  }));

  const avatarLetter = user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen pb-24" style={{ background: P.beige }}>

      {/* ── Top Nav ── */}
      <div
        className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-lg flex items-center justify-between px-4 py-2.5 rounded-2xl"
        style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', border: `1px solid ${P.border}`, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
      >
        <img src={sahayogiLogo} alt="Sahayogi" className="h-8 w-auto object-contain" />
        <div className="flex items-center gap-2">
          <NotificationsDropdown />
          <button className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: P.beige }}>
            <Menu className="w-4 h-4" style={{ color: P.muted }} />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-16">

        {/* ── Hero / Profile Banner ── */}
        <div className="rounded-3xl overflow-hidden mb-4 relative" style={{ background: P.redBg, border: `1px solid ${P.redMid}` }}>
          {/* Banner illustration */}
          <div className="h-36 relative overflow-hidden">
            <CommunityIllustration />
          </div>

          {/* Profile info */}
          <div className="px-5 pb-5">
            {/* Avatar overlapping banner */}
            <div className="flex items-end justify-between -mt-8 mb-3">
              <div className="relative">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black border-4 border-white shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${P.red}, ${P.redLight})` }}
                >
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : avatarLetter}
                </div>
                {/* Edit icon */}
                <button
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center shadow-sm border-2 border-white"
                  style={{ background: P.red }}
                >
                  <Edit2 className="w-3 h-3 text-white" />
                </button>
              </div>

              {/* CTA button */}
              <button
                onClick={() => navigate('/browse')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white text-xs font-bold shadow-lg active:scale-95 transition-transform"
                style={{ background: `linear-gradient(135deg, ${P.red}, ${P.redLight})`, boxShadow: `0 4px 16px ${P.red}40` }}
              >
                <Heart className="w-3.5 h-3.5 fill-white" />
                Make a Donation
              </button>
            </div>

            {/* Verified badge */}
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle className="w-3.5 h-3.5" style={{ color: P.green }} />
              <span className="text-xs font-bold" style={{ color: P.green }}>Verified</span>
            </div>

            {/* Name */}
            <h1 className="text-xl font-black mb-1" style={{ color: P.text, letterSpacing: '-0.02em' }}>
              Namaste,{' '}
              <span style={{ color: P.red }}>{user?.username || user?.email?.split('@')[0] || 'friend'}</span>
            </h1>
            <p className="text-xs leading-relaxed" style={{ color: P.muted, maxWidth: '260px' }}>
              Together, we can build a stronger, kinder community.
            </p>
          </div>
        </div>

        {/* ── Status Pills ── */}
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-0.5">
          {[
            { label: 'Active', dot: P.green },
            { label: 'Faithful Member', icon: Shield },
            { label: `Impact Score ${impacts * 7}`, icon: TrendingUp },
            { label: 'Verified', icon: CheckCircle2 },
          ].map((pill, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0 text-[11px] font-semibold"
              style={{ background: P.card, border: `1px solid ${P.border}`, color: P.text, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            >
              {pill.dot && <span className="w-2 h-2 rounded-full" style={{ background: pill.dot }} />}
              {pill.icon && <pill.icon className="w-3 h-3" style={{ color: P.red }} />}
              {pill.label}
            </div>
          ))}
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {statCards.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-3 flex flex-col items-center text-center"
              style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ background: s.bg }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <span className="text-base font-black leading-none mb-0.5" style={{ color: P.text }}>{s.value}</span>
              <span className="text-[9px] font-bold uppercase tracking-wide leading-tight" style={{ color: P.muted }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div
          className="flex gap-1 p-1 rounded-2xl mb-4"
          style={{ background: P.card, border: `1px solid ${P.border}` }}
        >
          {(['overview', 'my-posts', 'history', 'messages'] as TabId[]).map((tab) => {
            const labels: Record<TabId, string> = { overview: 'Overview', 'my-posts': 'My Posts', history: 'History', messages: 'Messages' };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                style={
                  activeTab === tab
                    ? { background: P.red, color: '#fff', boxShadow: `0 2px 8px ${P.red}30` }
                    : { color: P.muted }
                }
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* ── Tab Content ── */}
        {activeTab === 'overview' && (
          <div className="space-y-4">

            {/* Quick Actions */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <LayoutGrid className="w-3.5 h-3.5" style={{ color: P.red }} />
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: P.text }}>Quick Actions</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {quickActions.map((a) => (
                  <Link key={a.label} to={a.to}>
                    <div
                      className="rounded-2xl p-3 flex flex-col items-center text-center gap-1.5 active:scale-95 transition-transform"
                      style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: a.bg }}>
                        <a.icon className="w-5 h-5" style={{ color: a.color }} />
                      </div>
                      <span className="text-[11px] font-bold leading-tight" style={{ color: P.text }}>{a.label}</span>
                      <span className="text-[9px] leading-tight" style={{ color: P.muted }}>{a.desc}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" style={{ color: P.red }} />
                  <span className="text-xs font-black uppercase tracking-widest" style={{ color: P.text }}>Recent Activity</span>
                </div>
                <Link to="/profile" className="text-xs font-bold" style={{ color: P.red }}>View All</Link>
              </div>

              <div className="space-y-2">
                {recentActivity.length > 0 ? recentActivity.map((item) => (
                  <Link key={item.id} to={`/post/${item.id}`}>
                    <div
                      className="flex items-center gap-3 p-3 rounded-2xl active:scale-[0.99] transition-transform"
                      style={{ background: P.card, border: `1px solid ${P.border}`, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
                    >
                      <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0" style={{ background: P.redBg }}>
                        {item.img ? (
                          <img src={item.img} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-5 h-5" style={{ color: P.red }} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate" style={{ color: P.text }}>{item.title}</p>
                        <p className="text-[10px]" style={{ color: P.muted }}>{item.desc}</p>
                        <p className="text-[10px]" style={{ color: P.muted }}>{item.time}</p>
                      </div>
                      <span
                        className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black text-white"
                        style={{ background: item.impactColor }}
                      >
                        {item.impact}
                      </span>
                    </div>
                  </Link>
                )) : (
                  <div
                    className="py-10 text-center rounded-2xl"
                    style={{ background: P.card, border: `1px dashed ${P.border}` }}
                  >
                    <Package className="w-8 h-8 mx-auto mb-2" style={{ color: `${P.red}40` }} />
                    <p className="text-xs font-semibold mb-1" style={{ color: P.text }}>No activity yet</p>
                    <p className="text-[11px] mb-3" style={{ color: P.muted }}>Start by creating your first post</p>
                    <Link to="/create">
                      <button
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white"
                        style={{ background: P.red }}
                      >
                        Create Post
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom donation banner */}
            <div
              className="rounded-3xl p-5 relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${P.red}, ${P.redLight})` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-32 opacity-20">
                <svg viewBox="0 0 120 120" fill="none" className="w-full h-full">
                  <circle cx="80" cy="40" r="50" fill="white" />
                  <path d="M40 80 Q60 50 80 80 Q60 110 40 80Z" fill="white" opacity="0.5" />
                </svg>
              </div>
              {/* Heart illustration */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-20 h-20 opacity-30">
                <svg viewBox="0 0 80 80" fill="none">
                  <path d="M40 68 C40 68 8 48 8 26 C8 16 16 8 26 8 C32 8 38 12 40 18 C42 12 48 8 54 8 C64 8 72 16 72 26 C72 48 40 68 40 68Z" fill="white" />
                </svg>
              </div>
              <div className="relative z-10">
                <p className="text-base font-black text-white mb-0.5">Small act, big impact.</p>
                <p className="text-xs text-white/80 mb-4">Your kindness today can change someone's tomorrow.</p>
                <button
                  onClick={() => navigate('/browse')}
                  className="px-5 py-2 rounded-xl text-xs font-black active:scale-95 transition-transform"
                  style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}
                >
                  Donate Now →
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'my-posts' && (
          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: `${P.red}30`, borderTopColor: P.red }} />
              </div>
            ) : myPosts.length > 0 ? (
              myPosts.map(post => <PostCard key={post.id} post={post} />)
            ) : (
              <div className="py-16 text-center rounded-3xl" style={{ background: P.card, border: `1px dashed ${P.border}` }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: P.redBg }}>
                  <Package className="w-7 h-7" style={{ color: `${P.red}60` }} />
                </div>
                <p className="text-sm font-bold mb-1" style={{ color: P.text }}>No posts yet</p>
                <p className="text-xs mb-4" style={{ color: P.muted }}>Share your first story with the community</p>
                <Link to="/create">
                  <button className="px-5 py-2 rounded-xl text-xs font-bold text-white" style={{ background: P.red }}>
                    <PlusCircle className="w-3.5 h-3.5 inline mr-1.5" />
                    Create Post
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: `${P.red}30`, borderTopColor: P.red }} />
              </div>
            ) : historyPosts.length > 0 ? (
              historyPosts.map(post => <PostCard key={post.id} post={post} />)
            ) : (
              <div className="py-16 text-center rounded-3xl" style={{ background: P.card, border: `1px dashed ${P.border}` }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: '#EDFAF6' }}>
                  <History className="w-7 h-7" style={{ color: `${P.teal}80` }} />
                </div>
                <p className="text-sm font-bold mb-1" style={{ color: P.text }}>No interactions yet</p>
                <p className="text-xs mb-4" style={{ color: P.muted }}>React or comment on posts to build your history</p>
                <Link to="/browse">
                  <button className="px-5 py-2 rounded-xl text-xs font-bold text-white" style={{ background: P.teal }}>
                    Discover Causes
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div
            className="py-16 text-center rounded-3xl"
            style={{ background: P.card, border: `1px solid ${P.border}` }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: '#EEF4FF' }}>
              <MessageSquare className="w-7 h-7" style={{ color: `${P.blue}80` }} />
            </div>
            <p className="text-sm font-bold mb-1" style={{ color: P.text }}>Your messages</p>
            <p className="text-xs mb-4" style={{ color: P.muted }}>Connect with community members directly</p>
            <Link to="/messages">
              <button className="px-5 py-2 rounded-xl text-xs font-bold text-white" style={{ background: P.blue }}>
                Open Messages
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* ── Bottom Navigation ── */}
      <div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg"
        style={{ filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.10))' }}
      >
        <div
          className="flex items-center justify-around px-4 py-3 rounded-3xl relative"
          style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)', border: `1px solid ${P.border}` }}
        >
          <NavItem icon={Home} label="Home" to="/feed" />
          <NavItem icon={Search} label="Explore" to="/browse" />

          {/* Center FAB */}
          <div className="relative -mt-6">
            <Link to="/create">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl active:scale-95 transition-transform"
                style={{ background: `linear-gradient(135deg, ${P.red}, ${P.redLight})`, boxShadow: `0 6px 20px ${P.red}50` }}
              >
                <PlusCircle className="w-6 h-6 text-white" />
              </div>
            </Link>
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-semibold" style={{ color: P.muted }}>Post</span>
          </div>

          <NavItem icon={Activity} label="Activity" to="/feed" />
          <NavItem icon={User} label="Profile" to="/profile" active />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
