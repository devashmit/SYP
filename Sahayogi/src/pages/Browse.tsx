import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  LayoutGrid, SlidersHorizontal,
  CheckCircle2,
  PlusCircle,
  Package,
  TrendingUp,
  Heart,
  Lock,
  UserPlus,
  LogIn,
  Shield,
  ArrowRight,
  Users,
  BookOpen,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PostCard from '@/components/PostCard';
import { useAuth } from '@/contexts/AuthContext';

interface Post {
  id: string;
  title: string;
  description: string;
  location: string | null;
  status: string;
  created_at: string;
  is_anonymous: boolean;
  images: string[];
  help_type: string;
  categories: { name: string } | null;
  profiles: { username: string } | null;
}

const API_URL = 'http://localhost:3000/api';

const Browse = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const mountedRef = useRef(true);

  useEffect(() => {
    fetchCategories();
    fetchPosts();
    return () => { mountedRef.current = false; };
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      if (res.ok) {
        const data = await res.json();
        if (mountedRef.current) setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/posts?category=${selectedCategory}`);
      if (res.ok) {
        const data = await res.json();
        if (mountedRef.current) setPosts(data || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
      <Navbar />

      {/* Hero Header */}
      <div className="w-full relative h-44 overflow-hidden mandala-bg grain-overlay">
        <div className="vignette-top" />
        <img
          src="/images/hero/boudhanath-stupa-in-kathmandu-nepal.webp"
          alt="Nepal Community"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/98 via-background/85 to-background/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-5 max-w-5xl">
            <span className="text-[10px] font-semibold text-primary/80 uppercase tracking-wider mb-1 block">Community feed</span>
            <h1 className="text-2xl font-bold text-foreground tracking-tight leading-tight mb-1">Browse Causes</h1>
            <p className="text-xs text-muted-foreground max-w-xs">
              Verified donations and requests from communities across Nepal.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="grid lg:grid-cols-[1fr_260px] gap-6">

          {/* Main Feed Column */}
          <div>
            {/* Category chips row */}
            <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
              {['All', 'Clothes', 'Food', 'Medical', 'Books', 'Money', 'Furniture', 'Utensils', 'Other'].map((cat) => (
                <span
                  key={cat}
                  className={`chip ${selectedCategory === cat || (cat === 'All' && selectedCategory === 'all') ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat === 'All' ? 'all' : cat)}
                >
                  {cat}
                </span>
              ))}
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-border shadow-none mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/8 text-primary flex items-center justify-center">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Filter</p>
                  {posts.length > 0 && (
                    <p className="text-[10px] text-muted-foreground">{posts.length} listing{posts.length !== 1 ? 's' : ''}</p>
                  )}
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-44 h-8 rounded-lg bg-muted/40 border-border/50 text-xs font-medium focus:ring-primary/10 text-foreground">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border bg-white text-foreground shadow-lg">
                  <SelectItem value="all" className="text-xs">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name} className="text-xs">{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Auth Gate */}
            {!user ? (
              <div className="relative rounded-2xl overflow-hidden">
                <div className="absolute inset-0 z-20 backdrop-blur-md bg-white/60 flex items-center justify-center p-8 text-center animate-in fade-in duration-500">
                  <div className="max-w-sm">
                    <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground mb-2">Sign in to browse</h2>
                    <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                      For the safety and dignity of our community, you need a verified Sahayogi identity to view posts.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                      <Link to="/auth">
                        <Button size="sm" className="rounded-xl px-5 text-xs font-semibold bg-primary">
                          <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                          Create account
                        </Button>
                      </Link>
                      <Link to="/auth">
                        <Button variant="outline" size="sm" className="rounded-xl px-5 text-xs font-semibold border-primary/20 text-primary">
                          <LogIn className="w-3.5 h-3.5 mr-1.5" />
                          Sign in
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 opacity-25 select-none pointer-events-none filter blur-sm">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 w-full rounded-2xl bg-muted/40 animate-pulse border border-border/50" />
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {loading ? (
                  <>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-32 w-full rounded-2xl bg-muted/30 animate-pulse border border-border/40" />
                    ))}
                  </>
                ) : posts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-border grain-overlay">
                    <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center mb-4">
                      <Package className="w-8 h-8 text-primary/30" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground mb-1">No community listings yet</h3>
                    <p className="text-[11px] text-muted-foreground mb-6 max-w-[200px]">
                      We couldn't find any posts in this category. Be the first to start a ripple.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md px-6">
                      <Link to="/create">
                        <div className="p-3 bg-primary rounded-xl text-white text-[10px] font-bold shadow-sm hover:translate-y-px transition-all flex items-center justify-center gap-2">
                          <PlusCircle className="w-3.5 h-3.5" />
                          List something
                        </div>
                      </Link>
                      <div
                        className="p-3 bg-white border border-border rounded-xl text-foreground text-[10px] font-bold shadow-sm hover:bg-muted/30 cursor-pointer flex items-center justify-center gap-2"
                        onClick={() => setSelectedCategory('all')}
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        View all tags
                      </div>
                    </div>
                  </div>
                ) : (
                  posts.map((post, index) => (
                    <div
                      key={post.id}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      <PostCard post={post} />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block space-y-3">
            {/* Impact Card */}
            <div className="bg-primary rounded-2xl p-4 text-white overflow-hidden relative">
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
              <div className="relative">
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp className="w-3.5 h-3.5 opacity-70" />
                  <span className="text-[10px] font-semibold opacity-70 uppercase tracking-wider">Impact</span>
                </div>
                <div className="text-2xl font-bold tracking-tight mb-0.5">12.4L+</div>
                <div className="text-[10px] opacity-50 mb-3">Rs circulated in community</div>
                <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                  <div className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center">
                    <Heart className="w-3 h-3 fill-white text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">5,600+</div>
                    <div className="text-[10px] opacity-50">Verified donors</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Verified this week */}
            <div className="bg-white rounded-2xl border border-border p-4">
              <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Verified this week
              </h3>
              <div className="space-y-2.5">
                {[
                  { label: 'Clothes drive — Bhaktapur', count: 12, icon: Users },
                  { label: 'School books — Pokhara', count: 8, icon: BookOpen },
                  { label: 'Winter aid — Sindhupalchok', count: 34, icon: Heart },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                      <item.icon className="w-3 h-3 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-foreground truncate">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground">{item.count} connections</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending */}
            <div className="bg-white rounded-2xl border border-border p-4">
              <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5 text-primary" />
                Trending
              </h3>
              <div className="space-y-1.5">
                {[
                  { tag: '#WinterRelief', count: '1.2k' },
                  { tag: '#EducationFirst', count: '890' },
                  { tag: '#RuralHealth', count: '640' },
                ].map((trend, i) => (
                  <div key={i} className="flex items-center justify-between py-1 cursor-pointer hover:text-primary transition-colors group">
                    <span className="text-[11px] font-medium text-muted-foreground group-hover:text-primary">{trend.tag}</span>
                    <span className="text-[10px] text-muted-foreground/60 tabular-nums">{trend.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety tip */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-amber-800 mb-1">Safety tip</p>
                  <p className="text-[10px] text-amber-700 leading-relaxed">Always meet in public places and verify identity before transferring items or money.</p>
                </div>
              </div>
            </div>

            {/* Post CTA */}
            <Link to="/create">
              <Button className="w-full rounded-xl text-xs font-semibold h-9 bg-primary hover:bg-primary/90">
                <ArrowRight className="w-3.5 h-3.5 mr-1.5" />
                Post a listing
              </Button>
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Browse;