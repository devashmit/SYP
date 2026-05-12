import React from 'react';
import watercolorLeaves from '@/assets/watercolor_leaves.png';
import watercolorFlowers from '@/assets/watercolor_flowers.png';
import watercolorHeart from '@/assets/watercolor_heart.png';

const StoryHeader: React.FC = () => {
  return (
    <div className="relative w-full h-28 sm:h-36 overflow-hidden rounded-t-[3rem]">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#fff5f5] via-[#fffbfb] to-[#f5f7f2]" />
      <div className="absolute top-[-30%] left-[-10%] w-[50%] h-[120%] bg-pink-100/30 blur-[80px] rounded-full" />
      <div className="absolute bottom-[-30%] right-[-5%] w-[40%] h-[120%] bg-stone-100/40 blur-[60px] rounded-full" />

      {/* Illustrations — smaller and tighter */}
      <div className="absolute inset-0 flex items-center justify-between px-6 sm:px-12 pointer-events-none">
        <img
          src={watercolorLeaves}
          alt=""
          className="w-24 sm:w-32 h-auto object-contain opacity-80"
          style={{ transform: 'scale(1.1) rotate(-5deg) translateX(-8%)' }}
        />
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-rose-400/15 blur-2xl rounded-full scale-150" />
          <img
            src={watercolorHeart}
            alt=""
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-sm relative z-10"
          />
        </div>
        <img
          src={watercolorFlowers}
          alt=""
          className="w-24 sm:w-32 h-auto object-contain opacity-80"
          style={{ transform: 'scale(1.1) rotate(5deg) translateX(8%)' }}
        />
      </div>
    </div>
  );
};

export default StoryHeader;
