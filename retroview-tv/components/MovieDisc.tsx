import React from 'react';
import { DiscType } from '../types';
import { Disc, GripHorizontal } from 'lucide-react';

interface MovieDiscProps {
  disc: DiscType;
  onDragStart: (e: React.DragEvent, disc: DiscType) => void;
  rotation?: number;
}

export const MovieDisc: React.FC<MovieDiscProps> = ({ disc, onDragStart, rotation = 0 }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, disc)}
      className="group relative flex flex-col items-center justify-center w-24 h-24 md:w-28 md:h-28 cursor-grab active:cursor-grabbing transition-all duration-300 hover:scale-110 active:scale-95 hover:z-50"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* Disc Visual */}
      <div 
        className={`absolute inset-0 rounded-full border-4 border-zinc-800 shadow-2xl shadow-black/50 animate-spin-slow`}
        style={{ 
          background: `conic-gradient(from 0deg, #111 0deg, #333 60deg, #111 120deg, #333 180deg, #111 240deg, #333 300deg, #111 360deg)`
        }}
      >
         {/* Shiny reflection overlay */}
         <div className="absolute inset-0 rounded-full opacity-40 bg-gradient-to-tr from-transparent via-white/30 to-transparent rotate-45 pointer-events-none"></div>
         
         {/* Label Area */}
         <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-dashed border-white/40 flex items-center justify-center shadow-inner`} style={{ backgroundColor: disc.color }}>
            <Disc className="w-5 h-5 md:w-6 md:h-6 text-white/80" />
         </div>
      </div>

      {/* Genre Label (Sticker style) */}
      <div className="absolute -bottom-4 bg-[#eee] text-black text-[10px] font-bold font-mono px-2 py-0.5 rounded-sm shadow-md border border-gray-400 rotate-[-2deg] group-hover:scale-110 transition-transform">
        {disc.genre}
      </div>
      
      {/* Drag Handle Hint */}
      <div className="absolute -top-2 -right-2 bg-amber-500 text-black rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
         <GripHorizontal size={14} />
      </div>
    </div>
  );
};
