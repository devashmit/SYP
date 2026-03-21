import React from 'react';
import watercolorLeaves from '@/assets/watercolor_leaves.png';
import watercolorFlowers from '@/assets/watercolor_flowers.png';
import watercolorHeart from '@/assets/watercolor_heart.png';

const StoryHeader: React.FC = () => {
  return (
    <div className="relative w-full h-80 sm:h-96 overflow-hidden rounded-t-[3rem]">
      {/* Deep Watercolor Gradient Canvas */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#fff5f5] via-[#fffbfb] to-[#f5f7f2]" />
      
      {/* Decorative Blur Orbs for Depth */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-pink-100/40 blur-[100px] rounded-full animate-float-slow" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-stone-100/50 blur-[80px] rounded-full animate-float-slow" style={{ animationDelay: '2s' }} />

      {/* Main Illustration Container with Organic Masking */}
      <div className="absolute inset-0 flex items-center justify-between px-4 sm:px-12 pointer-events-none">
        {/* Left Botanical Illustration: Watercolor Leaves */}
        <div className="relative w-1/3 h-full flex items-center justify-start group">
          <img 
            src={watercolorLeaves} 
            alt="" 
            className="w-full h-auto object-contain opacity-90 transition-all duration-1000 group-hover:scale-105 group-hover:-rotate-2 animate-sway-slow"
            style={{ 
              maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
              WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
              transform: 'scale(1.4) rotate(-5deg) translateX(-10%)'
            }}
          />
        </div>

        {/* Centerpiece: Hand-Painted Watercolor Heart */}
        <div className="relative flex flex-col items-center z-20">
          <div className="relative group transition-all duration-700 hover:scale-110">
            {/* Prismatic Glow Aura */}
            <div className="absolute inset-0 bg-rose-400/20 blur-3xl rounded-full scale-150 animate-glow-pulse" />
            
            <img 
              src={watercolorHeart} 
              alt="Hand-painted Heart" 
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-[0_10px_20px_rgba(225,29,72,0.15)] relative z-10 animate-float-heart"
            />
          </div>
          
          {/* Subtle elegant divider line */}
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent mt-8 animate-grow-x" />
        </div>

        {/* Right Botanical Illustration: Watercolor Flower Stems */}
        <div className="relative w-1/3 h-full flex items-center justify-end group">
          <img 
            src={watercolorFlowers} 
            alt="" 
            className="w-full h-auto object-contain opacity-90 transition-all duration-1000 group-hover:scale-105 group-hover:rotate-2 animate-sway-slow"
            style={{ 
              maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
              WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
              transform: 'scale(1.4) rotate(5deg) translateX(10%)',
              animationDelay: '1s'
            }}
          />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(10px, -20px); }
        }
        @keyframes sway-slow {
          0%, 100% { transform: scale(1.4) rotate(-2deg) translate(-5%, 0); }
          50% { transform: scale(1.45) rotate(2deg) translate(5%, 5px); }
        }
        @keyframes float-heart {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1.4); }
          50% { opacity: 0.8; transform: scale(1.8); }
        }
        @keyframes grow-x {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        .animate-float-slow { animation: float-slow 12s infinite alternate ease-in-out; }
        .animate-sway-slow { animation: sway-slow 10s infinite alternate ease-in-out; }
        .animate-float-heart { animation: float-heart 6s infinite ease-in-out; }
        .animate-glow-pulse { animation: glow-pulse 8s infinite alternate ease-in-out; }
        .animate-grow-x { animation: grow-x 2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </div>
  );
};

export default StoryHeader;
