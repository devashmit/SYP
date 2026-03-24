import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2, Heart, TrendingUp, FileText, Package, ShieldCheck } from 'lucide-react';

// Import images from assets
import Home from '../assets/Home.png';
import Home2 from '../assets/home 2.avif';

const slides = [
  {
    id: 1,
    image: Home,
    title: 'Empowering Nepal',
    subtitle: 'हाम्रो साझा समुदाय'
  },
  {
    id: 2,
    image: Home2,
    title: 'Solidarity in Action',
    subtitle: 'सहयोगमा अटुट एकता'
  },
  {
    id: 3,
    image: Home,
    title: 'Changing Lives',
    subtitle: 'स्थानीय प्रभाव, वास्तविक परिवर्तन'
  }
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const next = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsTransitioning(false), 1400);
  }, [isTransitioning]);

  const prev = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsTransitioning(false), 1400);
  }, [isTransitioning]);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative w-full h-[100vh] overflow-hidden bg-background">
      {/* Background Slider - Cinematic Ken Burns Effect */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${
              index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={slide.image}
              alt={`Slide ${slide.id}`}
              className={`w-full h-full object-cover transition-transform duration-[6000ms] ease-linear ${
                index === current ? 'scale-110 translate-y-2' : 'scale-100 translate-y-0'
              }`}
              style={{ 
                filter: 'contrast(1.1) saturate(1.1) brightness(1.05)',
              }}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
            {/* Darker Cinematic Overlay for better readability */}
            <div className="absolute inset-0 bg-black/40 z-10" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent z-10" />
            <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-black/40 to-transparent z-10" />
          </div>
        ))}
      </div>

      {/* Dynamic SVG Decoration - Animated Mandala Ring */}
      <div className="absolute inset-0 z-10 opacity-[0.03] pointer-events-none overflow-hidden">
        <svg 
          className="absolute -right-[10%] top-1/2 -translate-y-1/2 w-[800px] h-[800px] animate-spin-slow text-primary" 
          viewBox="0 0 100 100"
        >
          <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.1" strokeDasharray="2 2" />
          <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.05" />
          <path d="M50 2 L52 10 L48 10 Z" fill="currentColor" transform="rotate(0 50 50)" />
          {Array.from({ length: 12 }).map((_, i) => (
            <path key={i} d="M50 5 L51 12 L49 12 Z" fill="currentColor" transform={`rotate(${i * 30} 50 50)`} />
          ))}
        </svg>
      </div>

      {/* Main Content Layout */}
      <div className="relative z-20 container mx-auto px-6 h-full flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
        <div className="max-w-[1000px] animate-slide-up">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.3em] mb-10 animate-fade-in shadow-xl shadow-primary/5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Direct Impact across Nepal
          </div>

          <h1 
            key={current}
            className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.05] text-white font-bold mb-10 tracking-tight animate-slide-up"
          >
            <div className="mb-4 drop-shadow-lg">{slides[current].title}</div>
            <div className="text-amber-400 italic text-3xl sm:text-4xl md:text-5xl font-medium tracking-normal drop-shadow-md">
              {slides[current].subtitle}
            </div>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-white/90 mb-10 leading-relaxed max-w-md border-l-2 border-amber-400/50 pl-5 text-left transition-all duration-700 delay-150 font-semibold drop-shadow-sm">
            नेपालका स्थानीय आवश्यकताहरूलाई मनसँग जोड्दै - पारदर्शी, प्रमाणित, र प्रभावकारी सहयोग।
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-12 w-full sm:w-auto">
            <Link to="/create" className="w-full sm:w-auto">
              <button className="h-12 px-8 bg-primary text-white font-semibold rounded-xl transition-all hover:bg-primary/95 hover:shadow-lg active:scale-95 shadow-lg shadow-primary/20 w-full text-sm">
                Start giving
              </button>
            </Link>
            <Link to="/browse" className="w-full sm:w-auto">
              <button className="h-12 px-8 bg-white/80 backdrop-blur-xl border border-border text-foreground font-semibold rounded-xl transition-all hover:bg-white hover:border-primary/20 w-full text-sm">
                Explore feed
              </button>
            </Link>
          </div>

          {/* Trust Row */}
          <div className="flex flex-wrap gap-6 items-center justify-center lg:justify-start pt-6 border-t border-border/10">
            {[
              { label: 'Verified integrity', icon: ShieldCheck },
              { label: 'Community focused', icon: CheckCircle2 },
              { label: 'Direct transfers', icon: TrendingUp }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-foreground/40 group cursor-default hover:text-primary transition-all duration-300">
                <item.icon className="w-4 h-4 text-primary/70" />
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Manual Navigation */}
      <div className="absolute right-12 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col gap-8">
        {[prev, next].map((fn, i) => (
          <button
            key={i}
            onClick={fn}
            className="w-16 h-16 rounded-3xl border border-white/10 flex items-center justify-center text-white transition-all hover:bg-emerald-500/20 hover:border-emerald-500/40 backdrop-blur-md group"
          >
            {i === 0 ? <ChevronLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" /> : <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />}
          </button>
        ))}
      </div>

      {/* Bottom Indicators */}
      <div className="absolute bottom-36 sm:bottom-40 left-1/2 -translate-x-1/2 z-30 flex gap-3 sm:gap-4">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-500 rounded-full h-1.5 ${i === current ? 'w-8 sm:w-12 bg-primary shadow-[0_0_15px_rgba(181,40,42,0.3)]' : 'w-2 sm:w-3 bg-foreground/10 hover:bg-foreground/20'
              }`}
          />
        ))}
      </div>

      {/* Bottom Statistics Bar - Refined */}
      <div className="absolute bottom-0 left-0 w-full z-30 h-[72px] bg-background/85 backdrop-blur-2xl border-t border-border flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/4 to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex overflow-x-auto scrollbar-hide sm:grid sm:grid-cols-3 gap-6 sm:gap-0 items-center justify-between">
            {[
              { icon: Heart, label: 'Impacted lives', value: '4,200+' },
              { icon: TrendingUp, label: 'Verified growth', value: '12L+' },
              { icon: Package, label: 'Active support', value: '890' }
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3 shrink-0 mx-auto group cursor-default">
                <div className="p-2 bg-primary/8 rounded-lg border border-primary/10 group-hover:bg-primary/15 transition-all">
                  <stat.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-base font-bold text-foreground tracking-tight">{stat.value}</div>
                  <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
