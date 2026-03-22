import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, X, LayoutGrid, PlusCircle, MessageCircle,
  LogOut, LogIn, UserPlus, User, LayoutDashboard,
  ShieldCheck, Rss, Heart
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationsDropdown } from '@/components/NotificationsDropdown';
import { useState, useEffect } from 'react';
import sahayogiLogo from '@/assets/Logo.svg';
import { useSocket } from '@/contexts/SocketContext';

const guestLinks: { to: string, label: string, icon: any }[] = [];

const userLinks = [
  { to: '/feed', label: 'Feed', icon: Rss },
  { to: '/community-needs', label: 'Community Needs', icon: Heart },
  { to: '/create', label: 'Create Post', icon: PlusCircle },
  { to: '/messages', label: 'Messages', icon: MessageCircle },
  { to: '/profile', label: 'Profile', icon: User },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/posts', label: 'Moderation', icon: ShieldCheck },
];

/* ─── Component ───────────────────────────────────────────────────────── */
const Navbar = () => {
  const { user, authStatus, isAdmin, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useSocket();

  // Must call all hooks BEFORE any early return (React rule)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Hide navbar on all /auth/* pages */
  if (location.pathname.startsWith('/auth')) return null;

  const isAuthenticated = authStatus === 'authenticated';

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    const fetchUnread = async () => {
      try {
        const token = sessionStorage.getItem('sahayogi_token');
        const res = await fetch('http://localhost:3000/api/messages/conversations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const convos = await res.json();
          const total = convos.reduce((sum: number, c: any) => sum + c.unread_count, 0);
          setUnreadMessageCount(total);
        }
      } catch (e) {}
    };
    
    fetchUnread();
    
    if (socket) {
      socket.on('receive_message', fetchUnread);
      return () => { socket.off('receive_message', fetchUnread); };
    }
  }, [isAuthenticated, user, socket]);

  /* Pick the correct link set - NEVER mix user + admin */
  const links = isAuthenticated ? (isAdmin ? adminLinks : userLinks) : guestLinks;

  const handleSignOut = async () => {
    setMobileOpen(false);
    await signOut();
  };

  return (
    <nav
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-[94%] max-w-[1280px] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${scrolled
        ? 'bg-white/92 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] border-border/50'
        : 'bg-white/75 backdrop-blur-xl border-border/30'
        } border rounded-2xl px-5 py-3 flex items-center justify-between`}
    >
      {/* ── Branding ────────────────────────────────────────────────── */}
      <Link
        to={isAuthenticated ? (isAdmin ? '/admin/dashboard' : '/feed') : '/'}
        className="flex items-center gap-2.5 group"
      >
        <img
          src={sahayogiLogo}
          alt="Sahayogi"
          className="h-8 w-auto object-contain group-hover:scale-105 transition-transform duration-500"
        />
        <span className="font-semibold text-base text-foreground tracking-tight">
          Sahayogi
        </span>
      </Link>

      {/* ── Desktop nav links ────────────────────────────────────────── */}
      <div className="hidden md:flex items-center gap-0.5 bg-muted/40 p-1 rounded-xl border border-border/30">
        {links.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to || location.pathname.startsWith(to + '/');
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${active
                ? 'bg-white text-foreground shadow-sm border border-border/40'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/60'
                }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-primary' : ''}`} />
              {label}
              {to === '/messages' && unreadMessageCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white animate-in zoom-in">
                  {unreadMessageCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* ── Action area ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <NotificationsDropdown />
            {/* Avatar + username */}
            <div className="hidden lg:flex items-center gap-2 pr-3 border-r border-border/50">
              <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold uppercase">
                {user?.username?.[0] || user?.email?.[0] || 'U'}
              </div>
              <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
                {user?.username || 'User'}
              </span>
              {isAdmin && (
                <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                  ADMIN
                </span>
              )}
            </div>

            <button
              onClick={handleSignOut}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2">
            <Link to="/auth/login">
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted/60 transition-all border border-border/50">
                <LogIn className="w-4 h-4" />
                Sign in
              </button>
            </Link>
            <Link to="/auth/signup">
              <button className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all">
                <UserPlus className="w-4 h-4" />
                Sign up
              </button>
            </Link>
          </div>
        )}

        {/* Mobile burger */}
        <button
          className="md:hidden w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center hover:bg-muted transition-all text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Mobile dropdown ──────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="absolute top-[calc(100%+0.5rem)] left-0 w-full md:hidden py-4 px-3 space-y-1 rounded-2xl bg-white border border-border shadow-xl animate-in slide-in-from-top-4 duration-200 z-[101]">
          {links.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to || location.pathname.startsWith(to + '/');
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${active
                  ? 'bg-primary/8 text-primary border border-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="w-4 h-4" />
                {label}
                {to === '/messages' && unreadMessageCount > 0 && (
                  <span className="ml-auto flex h-5 px-2 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm">
                    {unreadMessageCount} new
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-2 mt-2 border-t border-border">
            {isAuthenticated ? (
              <>
                {/* Mobile user info */}
                <div className="flex items-center gap-2.5 px-4 py-2 mb-1">
                  <img
                    src={sahayogiLogo}
                    alt="Logo"
                    className="w-8 h-8 rounded-full object-contain"
                  />
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-none">
                      {user?.username || 'User'}
                    </p>
                    {isAdmin && (
                      <p className="text-[10px] text-primary font-bold uppercase mt-0.5">
                        Admin
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/5 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <Link to="/auth/login" onClick={() => setMobileOpen(false)}>
                  <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted/40 transition-all">
                    <LogIn className="w-4 h-4" />
                    Sign in
                  </button>
                </Link>
                <Link to="/auth/signup" onClick={() => setMobileOpen(false)}>
                  <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold">
                    <UserPlus className="w-4 h-4" />
                    Sign up
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
