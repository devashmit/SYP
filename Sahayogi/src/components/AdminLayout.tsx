import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    ShieldCheck,
    LayoutDashboard,
    FileText,
    Users,
    AlertTriangle,
    LogOut,
    Menu,
    X,
    Settings,
    Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const { signOut } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: FileText, label: 'Moderation', path: '/admin/posts' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: AlertTriangle, label: 'Reports', path: '/admin/reports' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-primary/95 text-white shadow-2xl ${sidebarOpen ? 'w-64' : 'w-20'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
                        {sidebarOpen ? (
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-6 h-6 text-white shrink-0" />
                                <span className="font-extrabold text-lg tracking-tight">ADMIN PANEL</span>
                            </div>
                        ) : (
                            <ShieldCheck className="w-6 h-6 text-white mx-auto" />
                        )}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="hidden lg:block p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            <Menu className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 py-6 px-3 space-y-2">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                                        ? 'bg-white/20 text-white border border-white/20 shadow-lg'
                                        : 'text-white/60 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <item.icon className={`w-5 h-5 shrink-0 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                                    {sidebarOpen && <span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span>}
                                    {isActive && !sidebarOpen && (
                                        <div className="absolute left-0 w-1.5 h-6 bg-white rounded-r-full shadow-lg" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="p-4 border-t border-slate-800/50">
                        <Button
                            variant="ghost"
                            onClick={signOut}
                            className={`w-full flex items-center gap-3 text-slate-400 hover:text-white hover:bg-rose-500/10 hover:text-rose-400 rounded-xl transition-all ${!sidebarOpen ? 'justify-center px-0' : 'justify-start'
                                }`}
                        >
                            <LogOut className="w-5 h-5" />
                            {sidebarOpen && <span className="font-bold text-sm">Sign Out</span>}
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'pl-64' : 'pl-20'}`}>
                {/* Top Header */}
                <header className="h-16 bg-white dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 flex items-center justify-between px-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                            Platform Status: <span className="text-primary">Online</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="relative text-slate-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900" />
                        </Button>
                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2" />
                        <div className="flex items-center gap-3 pl-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-black text-foreground uppercase tracking-tight">Super Admin</p>
                                <p className="text-[9px] text-foreground/40 font-black uppercase tracking-widest">Authority Unit</p>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Render */}
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
