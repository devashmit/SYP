import { useEffect, useRef } from 'react';
import { TrendingUp, Banknote, FileText, Package } from 'lucide-react';

const stats = [
  { icon: TrendingUp, label: 'People Helped', target: 4200, suffix: '+', color: 'text-white' },
  { icon: Banknote, label: 'Donated', target: 12, suffix: ' Lakh+', prefix: 'RS ', color: 'text-white' },
  { icon: FileText, label: 'Active Posts', target: 890, suffix: '', color: 'text-white' },
  { icon: Package, label: 'Items Shared', target: 200, suffix: '+', color: 'text-white' },
];

import { useState } from 'react';

const ImpactStrip = () => {
  const [visible, setVisible] = useState(false);
  const [counts, setCounts] = useState(stats.map(() => 0));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const duration = 1800;
    const fps = 60;
    const steps = duration / (1000 / fps);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCounts(stats.map(s => Math.round(s.target * eased)));
      if (progress >= 1) clearInterval(interval);
    }, 1000 / fps);
    return () => clearInterval(interval);
  }, [visible]);

  return (
    <div ref={ref} className="w-full py-16 relative overflow-hidden bg-primary border-y border-white/10 shadow-[inner_0_4px_24px_rgba(0,0,0,0.1)]">
      {/* Subtle mandala grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      <div className="container mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 items-center justify-items-center gap-x-6 gap-y-6 text-white relative z-10">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:bg-white/20 group-hover:scale-110 transition-all duration-500">
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div className="text-left">
                <span className="text-3xl font-black block leading-none tracking-tighter">
                  {s.prefix || ''}{counts[i].toLocaleString()}{s.suffix}
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mt-1 block">{s.label}</span>
              </div>
              {i < stats.length - 1 && (
                <span className="hidden md:inline ml-6 opacity-30 text-2xl leading-none">|</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImpactStrip;
