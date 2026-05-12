import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserRoundPlus, PenLine, Handshake, Sparkles, CheckCircle2, ArrowRight, TrendingUp, Heart, Package, Shield, MapPin, Clock } from 'lucide-react';
import HeroSlider from '@/components/HeroSlider';
import { UpcomingDrives } from '@/components/UpcomingDrives';
import { useEffect, useRef, useState } from 'react';
import TestimonialSection from '@/components/TestimonialSection';
import startRippleImg from '@/assets/start a ripple.png';

import sahayogiLogoImg from '@/assets/Logo.svg';
import moneyImg from '@/assets/money.jpeg';
import clothesImg from '@/assets/clothes.jpg';
import foodImg from '@/assets/food.jpg';
import furnitureImg from '@/assets/furniture.jpeg';
import utensilsImg from '@/assets/utensils.jpeg';
import booksImg from '@/assets/books.jpeg';
import medicalImg from '@/assets/mdeical.jpeg';
import othersImg from '@/assets/others.jpeg';

const categories = [
  { label: 'Money', color: 'from-amber-600/60 to-amber-800/60', img: moneyImg },
  { label: 'Clothes', color: 'from-red-900/60 to-red-700/60', img: clothesImg },
  { label: 'Food', color: 'from-orange-700/60 to-orange-500/60', img: foodImg },
  { label: 'Furniture', color: 'from-slate-800/60 to-slate-600/60', img: furnitureImg },
  { label: 'Utensils', color: 'from-amber-800/60 to-amber-600/60', img: utensilsImg },
  { label: 'Books', color: 'from-red-900/60 to-amber-900/60', img: booksImg },
  { label: 'Medical', color: 'from-teal-800/60 to-teal-600/60', img: medicalImg },
  { label: 'Other', color: 'from-slate-700/60 to-slate-500/60', img: othersImg },
];

const steps = [
  { icon: <UserRoundPlus className="w-7 h-7" />, title: 'Join', desc: 'Quick signup to start giving.', num: '01' },
  { icon: <PenLine className="w-7 h-7" />, title: 'Post', desc: 'Share what you have or need.', num: '02' },
  { icon: <Handshake className="w-7 h-7" />, title: 'Connect', desc: 'Meet local hearts, make impact.', num: '03' },
];

// Simulated featured urgent causes
const featuredCauses = [
  {
    id: '1', title: 'Winter blankets for Sindhupalchok families',
    desc: 'Cold wave hits 120+ families in remote areas.',
    category: 'Clothes', location: 'Sindhupalchok', daysLeft: 3, progress: 72,
    img: '/images/hero/Human-touch-and-social-work-1024x1024.jpg',
  },
  {
    id: '2', title: 'School books for Grade 8–10 students',
    desc: 'Donated textbooks needed before Falgun exams.',
    category: 'Books', location: 'Dolakha', daysLeft: 7, progress: 45,
    img: '/images/hero/boudhanath-stupa-in-kathmandu-nepal.webp',
  },
  {
    id: '3', title: 'Wheelchair for elderly resident in Lalitpur',
    desc: 'Needs mobility aid after hip fracture surgery.',
    category: 'Medical', location: 'Lalitpur', daysLeft: 5, progress: 88,
    img: '/images/hero/VyzziCJ0Q5j5dIy7AvHMlrVQ6sg4FBVmPnfCl2YF.jpg',
  },
];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

const Counter = ({ target, label, suffix }: { target: number; label: string; suffix: string }) => {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView(0.5);
  useEffect(() => {
    if (inView) {
      let startTime: number;
      const duration = 2000;
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        setCount(Math.floor(progress * target));
        if (progress < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    }
  }, [inView, target]);
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-1 group">
      <div className="text-2xl md:text-3xl font-bold tabular-nums tracking-tight">{count.toLocaleString()}{suffix}</div>
      <div className="text-[10px] font-medium uppercase tracking-widest opacity-60">{label}</div>
    </div>
  );
};

const Home = () => {
  const catSection = useInView();
  const stepsSection = useInView();
  const causesSection = useInView();

  return (
    <div className="bg-background selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      {/* HERO */}
      <div className="mandala-bg">
        <HeroSlider />
      </div>

      {/* ─── LIVE IMPACT STRIP ─────────────────────────────────── */}
      <div className="bg-foreground text-background border-b border-foreground/10">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide divide-x divide-background/10 min-w-0">
            {/* Live indicator */}
            <div className="flex items-center gap-2 px-4 py-3 shrink-0">
              <span className="live-dot w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-background/60">Live</span>
            </div>
            {[
              { label: 'Rs raised today', value: '₨ 12,400' },
              { label: 'Active donors', value: '47' },
              { label: 'Verified requests', value: '23' },
              { label: 'Fulfilled this week', value: '89' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 px-4 py-3 shrink-0">
                <span className="text-sm font-bold text-background">{item.value}</span>
                <span className="text-[10px] text-background/50">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── FEATURED URGENT CAUSES ───────────────────────────── */}
      <section
        ref={causesSection.ref as React.RefObject<HTMLElement>}
        className="py-10 md:py-16 band-light grain-overlay"
      >
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Section header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="live-dot w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                <span className="text-[10px] font-semibold text-primary uppercase tracking-widest">Urgent near you</span>
              </div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">Featured Causes</h2>
            </div>
            <Link to="/browse" className="flex items-center gap-1 text-xs font-medium text-primary hover:gap-2 transition-all">
              See all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Category chips */}
          <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1">
            {['All', 'Clothes', 'Food', 'Medical', 'Books', 'Money', 'Furniture'].map((cat) => (
              <span key={cat} className={`chip ${cat === 'All' ? 'active' : ''}`}>{cat}</span>
            ))}
          </div>

          {/* Cause cards */}
          <div className="space-y-3">
            {featuredCauses.map((cause, i) => (
              <Link to={`/post/${cause.id}`} key={cause.id}>
                <div
                  className={`spotlight-card flex gap-0 overflow-hidden ${causesSection.inView ? 'animate-fade-in-up' : 'opacity-0'}`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {/* Image */}
                  <div className="w-24 sm:w-32 shrink-0 relative overflow-hidden">
                    <img src={cause.img} alt={cause.title} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between min-w-0">
                    {/* Top meta */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="chip">{cause.category}</span>
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <MapPin className="w-2.5 h-2.5" />{cause.location}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-medium text-rose-500 shrink-0">
                        <Clock className="w-2.5 h-2.5" />{cause.daysLeft}d left
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-semibold text-foreground leading-snug mb-1 line-clamp-1">{cause.title}</h3>
                    <p className="text-[11px] text-muted-foreground line-clamp-1 mb-2">{cause.desc}</p>

                    {/* Progress bar */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="verified-dot"><CheckCircle2 className="w-2.5 h-2.5" />Verified</span>
                        <span className="text-[10px] font-medium text-muted-foreground">{cause.progress}% fulfilled</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-bar-fill" style={{ width: `${cause.progress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="band-divider" />

      {/* ─── CATEGORY SHOWCASE ────────────────────────────────── */}
      <section
        ref={catSection.ref as React.RefObject<HTMLElement>}
        className="py-10 md:py-16 bg-background grain-overlay"
      >
        <div className="container mx-auto px-4 max-w-5xl">
          <div className={`mb-6 transition-all duration-700 ${catSection.inView ? 'animate-slide-up' : 'opacity-0 translate-y-8'}`}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/6 text-primary text-[10px] font-semibold uppercase tracking-widest mb-3 border border-primary/10">
              <Sparkles className="w-3 h-3" />
              Categories
            </span>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Forms of Kindness</h2>
            <p className="text-sm text-muted-foreground mt-1">Explore verified contributions and needs across Nepal.</p>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-4 lg:grid-cols-8">
            {categories.map((cat, i) => (
              <Link to="/browse" key={cat.label}
                className={`shrink-0 w-[130px] sm:w-[150px] md:w-auto rounded-2xl overflow-hidden cursor-pointer group shadow-sm border-opacity-10 hover:shadow-md hover:-translate-y-1 transition-all duration-300 ${catSection.inView ? 'animate-scale-in' : 'opacity-0'}`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: '4/5' }}>
                  <img src={cat.img} alt={cat.label} className="w-full h-full object-cover object-center transition-transform duration-[3000ms] group-hover:scale-110" loading="lazy" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-30 group-hover:opacity-15 transition-opacity duration-500`} />
                  <div className="absolute inset-x-0 bottom-0 py-3 px-2 text-center bg-gradient-to-t from-black/60 via-black/30 to-transparent">
                    <span className="text-xs font-bold text-white drop-shadow-lg">{cat.label}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="band-divider" />

      {/* ─── IMPACT COUNTERS ──────────────────────────────────── */}
      <section className="py-10 md:py-16 bg-primary text-white relative overflow-hidden grain-overlay">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: 'Impacted lives', value: 4200, suffix: '+' },
              { label: 'Total raised', value: 12, suffix: 'L+' },
              { label: 'Active causes', value: 890, suffix: '' },
              { label: 'Verified donors', value: 5600, suffix: '+' }
            ].map((stat, i) => (
              <Counter key={i} label={stat.label} target={stat.value} suffix={stat.suffix} />
            ))}
          </div>
        </div>
      </section>

      <div className="band-divider" />

      {/* ─── HOW IT WORKS ─────────────────────────────────────── */}
      <section
        id="how-it-works"
        ref={stepsSection.ref as React.RefObject<HTMLElement>}
        className="py-10 md:py-16 band-muted relative grain-overlay"
      >
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className={`mb-8 text-center transition-all duration-700 ${stepsSection.inView ? 'animate-slide-up' : 'opacity-0 translate-y-8'}`}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/6 text-primary text-[10px] font-semibold uppercase tracking-widest mb-3 border border-primary/10">
              How it works
            </span>
            <h2 className="text-2xl font-bold text-foreground tracking-tight mb-2">सरल । मानवीय । प्रत्यक्ष ।</h2>
            <p className="text-sm text-muted-foreground">Three steps to connect givers with those who need.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 max-w-3xl mx-auto px-1">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`flex flex-col items-center text-center group ${stepsSection.inView ? 'animate-slide-up' : 'opacity-0 translate-y-6'}`}
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-2xl bg-white border border-border flex items-center justify-center mb-3 sm:mb-4 relative shadow-sm border-opacity-10 transition-all duration-300 group-hover:-translate-y-2 group-hover:border-primary/20 group-hover:shadow-md">
                  <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-secondary flex items-center justify-center text-primary transition-transform duration-300 group-hover:scale-110">
                    <div className="scale-75 sm:scale-100">
                      {step.icon}
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 sm:-top-2.5 sm:-right-2.5 w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-primary text-white font-bold flex items-center justify-center text-[8px] sm:text-[10px] shadow-md">
                    {step.num}
                  </div>
                </div>
                <h3 className="text-[11px] sm:text-sm font-semibold mb-0.5 sm:mb-1 text-foreground leading-tight">{step.title}</h3>
                <p className="text-[9px] sm:text-xs text-muted-foreground leading-relaxed max-w-[100px] sm:max-w-[180px] line-clamp-2 sm:line-clamp-none">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Suggested actions row (density filler) */}
          <div className="mt-6 pt-6 border-t border-border/60">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-4 text-center">Get involved today</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { icon: Package, title: 'List something to give', desc: 'Clothes, food, furniture or money.', to: '/create', cta: 'Post a cause' },
                { icon: Heart, title: 'Browse active needs', desc: 'Find verified requests near you.', to: '/browse', cta: 'Explore feed' },
                { icon: Shield, title: 'Verify your profile', desc: 'Earn trust within the community.', to: '/auth', cta: 'Get verified' },
              ].map((action) => (
                <Link to={action.to} key={action.title}>
                  <div className="bg-white border border-border rounded-2xl p-4 hover:border-primary/20 hover:shadow-sm border-opacity-10 transition-all group">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                        <action.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground mb-0.5">{action.title}</p>
                        <p className="text-[11px] text-muted-foreground">{action.desc}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-primary group-hover:gap-2 transition-all">
                      {action.cta} <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="band-divider" />

      {/* ─── TESTIMONIALS ─────────────────────────────────────── */}
      <TestimonialSection />

      <div className="band-divider" />

      {/* ─── UPCOMING LOCAL DRIVES ────────────────────────────── */}
      <section className="py-10 band-light">
        <UpcomingDrives compact />
      </section>

      <div className="band-divider" />

      {/* ─── FINAL CTA ────────────────────────────────────────── */}
      <section className="py-10 relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Outer: Red Gradient */}
          <div className="relative rounded-[2rem] overflow-hidden bg-primary p-2 group shadow-2xl shadow-primary/20">
            <div className="absolute inset-0 bg-slate-950">
              <img
                src={startRippleImg}
                alt=""
                className="w-full h-full object-cover opacity-[0.85] scale-110 animate-[slow-zoom_25s_infinite_alternate]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              {/* Subtle visual anchor: mandala background ring */}
              <div className="absolute inset-0 mandala-bg opacity-[0.02] pointer-events-none" />
            </div>

            {/* Inner: Translucent panel for depth */}
            <div className="relative z-10 py-10 md:py-16 px-6 md:px-12 rounded-[1.5rem] bg-black/40 border border-white/10 text-center">
              {/* Eyebrow */}
              <span className="inline-block text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] mb-3">
                A community-led platform for Nepal
              </span>

              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight leading-[1.1]">
                Light a path. कसैको जीवनको ज्योति बन्नुहोस्।
              </h2>
  
              <p className="text-white/70 text-sm max-w-lg mx-auto mb-8 leading-relaxed font-medium">
                Join people across Nepal in helping each other with verified requests, transparent contributions, and real stories.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
                <Link to="/auth">
                  <Button className="h-9 px-8 bg-white text-primary hover:bg-white/90 rounded-2xl font-bold text-xs shadow-xl active:scale-95 transition-all">
                    Get started free
                  </Button>
                </Link>
                <Link to="/browse">
                  <Button variant="ghost" className="h-9 px-8 text-white hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-xs active:scale-95 transition-all">
                    Explore causes
                  </Button>
                </Link>
              </div>

              {/* Proof Strip */}
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-6 border-t border-white/5">
                {[
                  { icon: CheckCircle2, label: 'Verified requests' },
                  { icon: MapPin, label: 'Local to Nepal' },
                  { icon: Handshake, label: 'Community-driven' },
                  { icon: Shield, label: 'Transparent donations' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 opacity-60">
                    <item.icon className="w-3 h-3 text-white" />
                    <span className="text-[10px] font-medium text-white tracking-wide uppercase">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
