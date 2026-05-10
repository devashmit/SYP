import React from 'react';
import { Heart } from 'lucide-react';

interface HelpTypeToggleProps {
  value: 'offering' | 'seeking';
  onChange: (value: 'offering' | 'seeking') => void;
}

const UnifiedHandHeartIcon = ({ type, active }: { type: 'offering' | 'seeking'; active: boolean }) => (
  <div className="relative w-[60px] h-[60px] flex items-center justify-center rounded-[14px] transition-all duration-250 ease-in-out select-none"
       style={{ backgroundColor: active ? '#fdecea' : '#f2eeeb' }}>
    <div className="relative pt-2">
      {/* Unified Hand SVG (Realistic Anatomical Silhouette) */}
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" 
           className="transition-colors duration-250 opacity-80"
           style={{ color: active ? '#c0392b' : '#b8aea6' }}>
        <path d="M18.8 11.03V5.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v6c0 .28-.22.5-.5.5s-.5-.22-.5-.5V4.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v7c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-6c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v7.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5V8.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v7c0 3.31 2.69 6 6 6h2c3.31 0 6-2.69 6-6v-4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5z" 
              fill="currentColor" />
      </svg>
      
      {/* Heart SVG with specific vertical transitions */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"
           className="absolute left-1/2 -translate-x-1/2 transition-all"
           style={{ 
             color: active ? '#c0392b' : '#b8aea6',
             top: '-6px',
             transitionDuration: '0.5s',
             transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
             transform: `translateX(-50%) ${
                !active ? 'translateY(0) scale(1)' : 
                type === 'offering' ? 'translateY(-14px) scale(1.1)' : 
                'translateY(8px) scale(0.92)'
             }`,
             opacity: active && type === 'offering' ? 0.7 : 1
           }}>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </div>
  </div>
);

const HelpTypeToggle: React.FC<HelpTypeToggleProps> = ({ value, onChange }) => {
  const options = [
    {
      id: 'offering',
      title: 'Offering Help',
      hint: 'I have something to give',
    },
    {
      id: 'seeking',
      title: 'Seeking Help',
      hint: 'I need support',
    }
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-4 w-full max-w-full">
      {options.map((option) => {
        const active = value === option.id;
        return (
          <div
            key={option.id}
            onClick={() => onChange(option.id)}
            className="group relative flex items-center p-4 rounded-[20px] border-[1.5px] cursor-pointer transition-all duration-250 overflow-hidden"
            style={{ 
              backgroundColor: active ? '#fff9f8' : '#ffffff',
              borderColor: active ? '#c0392b' : '#e8e0d8',
            }}
          >
            {/* Active Badge */}
            <div className={`absolute top-4 right-4 flex items-center gap-1.5 transition-opacity duration-250 ${active ? 'opacity-100' : 'opacity-0'}`}>
                <span className="text-[10px] font-bold tracking-widest text-[#c0392b] uppercase">Active</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#c0392b] animate-pulse" />
            </div>

            {/* Icon Box Side */}
            <UnifiedHandHeartIcon type={option.id} active={active} />

            {/* Text Side */}
            <div className="ml-4 pr-12">
              <h3 className="text-[15px] font-semibold leading-tight transition-colors duration-250"
                  style={{ color: active ? '#c0392b' : '#1a1008' }}>
                {option.title}
              </h3>
              <p className="text-[13px] mt-0.5 transition-colors duration-250"
                 style={{ color: active ? '#c87878' : '#b8aea6' }}>
                {option.hint}
              </p>
            </div>

            {/* Hover state overlay for unselected */}
            {!active && (
                <div className="absolute inset-0 bg-transparent group-hover:bg-[#fdf9f4]/20 transition-colors pointer-events-none" />
            )}
          </div>
        );
      })}

      <style dangerouslySetInnerHTML={{ __html: `
        .group:hover:not(.active) {
          border-color: #d4c8c0 !important;
        }
      `}} />
    </div>
  );
};

export default HelpTypeToggle;
