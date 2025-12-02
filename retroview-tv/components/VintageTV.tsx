import React, { useState, useEffect, useRef } from 'react';
import { TVState, MovieData, DiscType } from '../types';
import { generateMovieInfo, generateMoviePoster } from '../services/geminiService';
import { Loader2, Power, Volume2, Save, WifiOff, Play } from 'lucide-react';

interface VintageTVProps {
  onDropDisc: (disc: DiscType) => void;
  currentDisc: DiscType | null;       // Triggers generation
  playMovie: MovieData | null;        // Triggers direct playback
  onAddToWatchList: (movie: MovieData) => void;
}

export const VintageTV: React.FC<VintageTVProps> = ({ onDropDisc, currentDisc, playMovie, onAddToWatchList }) => {
  const [tvState, setTvState] = useState<TVState>(TVState.OFF);
  const [movieData, setMovieData] = useState<MovieData | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [volume, setVolume] = useState(30);
  const [channel, setChannel] = useState(3);
  const [isSaved, setIsSaved] = useState(false);

  // Handle direct playback from Watch List
  useEffect(() => {
    if (playMovie) {
      if (tvState === TVState.OFF) setTvState(TVState.LOADING); // Wake up
      
      // Small artificial delay for "tuning" effect
      setTvState(TVState.LOADING);
      setTimeout(() => {
        setMovieData(playMovie);
        setTvState(TVState.PLAYING);
        setIsSaved(true); // Assume loaded movies are saved
      }, 800);
    }
  }, [playMovie]);

  // Handle new disc generation
  useEffect(() => {
    if (currentDisc) {
      loadMovie(currentDisc);
    }
  }, [currentDisc]);

  const loadMovie = async (disc: DiscType) => {
    setTvState(TVState.LOADING);
    setIsSaved(false);
    
    try {
      // 1. Get Text Info
      const info = await generateMovieInfo(disc.genre);
      
      // 2. Start Image Gen
      let fullData = { ...info };
      if (info.posterPrompt) {
         const posterUrl = await generateMoviePoster(info.posterPrompt);
         if (posterUrl) {
             fullData.posterBase64 = posterUrl;
         }
      }
      
      // Add a temp ID if missing
      if (!fullData.id) fullData.id = Date.now().toString();

      setMovieData(fullData);
      setTvState(TVState.PLAYING);
    } catch (error) {
      console.error(error);
      setTvState(TVState.ERROR);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovered(true);
  };

  const handleDragLeave = () => {
    setIsHovered(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovered(false);
    const discData = e.dataTransfer.getData('application/json');
    if (discData) {
      try {
        const disc: DiscType = JSON.parse(discData);
        onDropDisc(disc);
      } catch (err) {
        console.error("Failed to parse drop data");
      }
    }
  };

  const togglePower = () => {
    setTvState(prev => prev === TVState.OFF ? TVState.IDLE : TVState.OFF);
    setMovieData(null);
  };

  const handleSave = () => {
    if (movieData) {
      onAddToWatchList(movieData);
      setIsSaved(true);
    }
  };

  // --- Render Helpers ---

  const renderScreenContent = () => {
    if (tvState === TVState.OFF) {
      return <div className="w-full h-full bg-[#050505] transition-all duration-500"></div>;
    }

    if (tvState === TVState.LOADING) {
      return (
        <div className="w-full h-full static-noise flex flex-col items-center justify-center text-green-400 font-mono p-8 text-center relative">
           <div className="z-10 bg-black/80 p-4 rounded border border-green-500/30 backdrop-blur-sm shadow-[0_0_30px_rgba(0,255,0,0.1)]">
              <Loader2 className="w-12 h-12 animate-spin mb-4 mx-auto text-green-500" />
              <p className="animate-pulse text-xl tracking-widest">TUNING...</p>
              <div className="w-full h-1 bg-green-900/50 mt-4 rounded overflow-hidden">
                  <div className="h-full bg-green-500 animate-[loading_2s_ease-in-out_infinite] w-1/2"></div>
              </div>
           </div>
        </div>
      );
    }

    if (tvState === TVState.ERROR) {
      return (
        <div className="w-full h-full static-noise flex flex-col items-center justify-center text-red-500 p-8 text-center">
          <WifiOff className="w-16 h-16 mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold font-mono tracking-widest">NO SIGNAL</h2>
          <p className="mt-2 font-mono text-sm opacity-80">PLEASE CHECK CARTRIDGE</p>
        </div>
      );
    }

    if (tvState === TVState.IDLE) {
      return (
        <div className="w-full h-full relative flex flex-col">
           {/* SMPTE Color Bars */}
           <div className="flex-grow flex w-full h-[66%]">
              <div className="h-full w-[14.28%] bg-[#c0c0c0]"></div>
              <div className="h-full w-[14.28%] bg-[#c0c000]"></div>
              <div className="h-full w-[14.28%] bg-[#00c0c0]"></div>
              <div className="h-full w-[14.28%] bg-[#00c000]"></div>
              <div className="h-full w-[14.28%] bg-[#c000c0]"></div>
              <div className="h-full w-[14.28%] bg-[#c00000]"></div>
              <div className="h-full w-[14.28%] bg-[#0000c0]"></div>
           </div>
           <div className="flex w-full h-[8%]">
              <div className="h-full w-[14.28%] bg-[#0000c0]"></div>
              <div className="h-full w-[14.28%] bg-[#131313]"></div>
              <div className="h-full w-[14.28%] bg-[#c000c0]"></div>
              <div className="h-full w-[14.28%] bg-[#131313]"></div>
              <div className="h-full w-[14.28%] bg-[#00c0c0]"></div>
              <div className="h-full w-[14.28%] bg-[#131313]"></div>
              <div className="h-full w-[14.28%] bg-[#c0c0c0]"></div>
           </div>
           <div className="flex-grow flex w-full h-[26%] items-end">
              {/* Darker bottom bars */}
               <div className="h-full w-[18%] bg-[#00214c]"></div>
               <div className="h-full w-[18%] bg-white"></div>
               <div className="h-full w-[18%] bg-[#32006b]"></div>
               <div className="h-full w-[18%] bg-[#131313]"></div>
               <div className="h-full w-[4%] bg-[#090909]"></div>
               <div className="h-full w-[4%] bg-[#131313]"></div>
               <div className="h-full w-[10%] bg-[#1d1d1d]"></div>
               <div className="h-full w-[14%] bg-[#131313]"></div>
           </div>
           
           {/* No Signal Text Overlay */}
           <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="bg-black/40 px-6 py-3 backdrop-blur-[2px] border-y-4 border-black/50 shadow-lg">
                  <p className="text-white font-['VT323'] text-4xl md:text-6xl tracking-[0.2em] animate-pulse drop-shadow-[2px_2px_0px_black]">NO SIGNAL</p>
              </div>
           </div>

           {/* Drag Hint Overlay (if hovered) */}
            {isHovered && (
             <div className="absolute inset-0 z-20 bg-yellow-500/20 flex items-center justify-center">
               <div className="text-yellow-300 font-['Press_Start_2P'] text-xl animate-bounce drop-shadow-md stroke-black">
                 INSERT DISC
               </div>
             </div>
           )}
        </div>
      );
    }

    if (tvState === TVState.PLAYING && movieData) {
      return (
        <div className="w-full h-full relative flex bg-black">
          {/* Left: Poster Area */}
          <div className="hidden md:block w-2/5 h-full relative border-r-2 border-black/30 overflow-hidden">
             {movieData.posterBase64 ? (
               <img 
                 src={movieData.posterBase64} 
                 alt="Poster" 
                 className="w-full h-full object-cover sepia-[.3] contrast-110 brightness-90"
               />
             ) : (
               <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500 font-mono text-center p-2">
                 [IMAGE DATA CORRUPTED]
               </div>
             )}
             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
          </div>
          
          {/* Right: Info Area */}
          <div className="w-full md:w-3/5 h-full p-4 md:p-6 bg-[#e6d8b8] text-[#2c2c2c] flex flex-col font-['VT323'] overflow-y-auto retro-scrollbar relative">
             {/* Paper Texture Overlay */}
             <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cardboard-flat.png")'}}></div>
             
             <div className="z-10">
                {/* Mobile Poster Header */}
                <div className="md:hidden w-full h-48 mb-4 overflow-hidden rounded border-2 border-[#2c2c2c] relative">
                    {movieData.posterBase64 && (
                       <img src={movieData.posterBase64} className="w-full h-full object-cover object-top" alt="Mobile Poster" />
                    )}
                </div>

                <div className="flex justify-between items-start border-b-2 border-[#2c2c2c] pb-2 mb-4">
                   <h1 className="text-3xl md:text-4xl leading-none uppercase font-bold tracking-tighter break-words w-3/4">{movieData.title}</h1>
                   <span className="text-xl md:text-2xl font-bold bg-[#2c2c2c] text-[#e6d8b8] px-2 rounded-sm transform -rotate-2">{movieData.year}</span>
                </div>
                
                <div className="mb-4 flex flex-wrap items-center gap-2 text-lg md:text-xl">
                  <span className="uppercase font-bold">Dir:</span> {movieData.director}
                  <span className="mx-2 opacity-50">|</span>
                  <span className="text-red-800 font-bold">★ {movieData.rating}</span>
                </div>

                <p className="text-base md:text-lg italic mb-6 border-l-4 border-red-800 pl-4 py-1 opacity-80 bg-red-800/5">
                  "{movieData.tagline}"
                </p>

                <div className="text-xl md:text-2xl mb-2 font-bold underline decoration-wavy decoration-red-800/30">SYNOPSIS</div>
                <p className="text-lg md:text-xl leading-relaxed opacity-90">
                  {movieData.plot}
                </p>
             </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto p-2 md:p-0"
         onDragOver={handleDragOver}
         onDragLeave={handleDragLeave}
         onDrop={handleDrop}
    >
      {/* TV Frame (Wood Container) */}
      <div className="relative bg-[#5c3a21] rounded-[2.5rem] p-4 md:p-8 shadow-[0_30px_60px_rgba(0,0,0,0.7)] border-t-2 border-[#8b5e3c] ring-4 ring-[#3e2613]">
        {/* Wood Grain Texture */}
        <div className="absolute inset-0 opacity-30 pointer-events-none rounded-[2.5rem] mix-blend-overlay" 
             style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")'}}>
        </div>

        <div className="flex flex-col md:flex-row gap-6 relative z-10">
          
          {/* The Screen Area */}
          <div 
            className="relative flex-grow bg-[#0a0a0a] rounded-[2rem] overflow-hidden border-[6px] border-[#1a1a1a] shadow-[inset_0_0_40px_rgba(0,0,0,1)] aspect-[4/3]"
          >
            {/* Physical Screen Glass Reflection/Curve */}
            <div className="absolute inset-0 pointer-events-none z-40 rounded-[1.8rem] shadow-[inset_0_0_90px_rgba(0,0,0,0.9)] ring-1 ring-white/5"></div>
            <div className="absolute top-0 left-1/4 w-1/2 h-8 bg-gradient-to-b from-white/10 to-transparent opacity-40 pointer-events-none z-40 rounded-b-[100%] blur-xl"></div>

            {/* Scanlines & CRT effects */}
            <div className={`absolute inset-0 z-30 pointer-events-none ${tvState !== TVState.OFF ? 'scanlines' : ''}`}></div>
            
            {/* Screen Content Container */}
            <div className={`w-full h-full transition-opacity duration-700 ${tvState === TVState.OFF ? 'opacity-0' : 'opacity-100'}`}>
               {renderScreenContent()}
            </div>
          </div>

          {/* Control Panel (Right Side) */}
          <div className="w-full md:w-40 flex flex-row md:flex-col bg-[#222] rounded-xl p-3 md:p-4 border-l-0 md:border-l-2 border-white/5 shadow-[inset_0_0_20px_rgba(0,0,0,1)] justify-between items-center md:gap-4">
             
             {/* Speakers */}
             <div className="flex md:flex-col gap-1.5 md:mb-4 w-16 md:w-full justify-center">
               {[...Array(8)].map((_, i) => (
                 <div key={i} className="w-1 md:w-full h-8 md:h-1 bg-black/60 rounded-full shadow-[inset_0_0_2px_black]"></div>
               ))}
             </div>

             {/* Controls */}
             <div className="flex flex-row md:flex-col items-center gap-4 md:gap-6 flex-grow justify-end">
                
                {/* Save Button */}
                 <button 
                  onClick={handleSave}
                  disabled={tvState !== TVState.PLAYING || isSaved}
                  className={`group relative w-12 h-12 rounded bg-[#333] border-2 ${isSaved ? 'border-green-600' : 'border-[#555]'} shadow-[0_2px_5px_rgba(0,0,0,0.5)] flex items-center justify-center active:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                  title="Save to List"
                 >
                    <div className="absolute -top-4 text-[0.5rem] text-[#777] font-mono tracking-widest">REC</div>
                    <Save size={20} className={`${isSaved ? 'text-green-500' : 'text-red-500 group-hover:text-red-400'}`} />
                    {isSaved && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#0f0]"></div>}
                 </button>

                {/* Channel */}
                <div className="relative group">
                   <div className="absolute -top-4 md:-top-5 left-0 w-full text-center text-[#666] text-[0.5rem] font-mono tracking-widest">CH</div>
                   <button 
                     onClick={() => setChannel(c => c >= 12 ? 1 : c + 1)}
                     className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#181818] border-b-4 border-r-4 border-[#050505] shadow-[0_5px_15px_rgba(0,0,0,0.5)] flex items-center justify-center transform active:rotate-12 transition-transform"
                   >
                      <div className="w-1 md:w-1.5 h-6 md:h-8 bg-white/80 rounded-full shadow-[0_0_5px_white]"></div>
                   </button>
                </div>

                {/* Volume */}
                <div className="relative group hidden md:block">
                   <div className="absolute -top-5 left-0 w-full text-center text-[#666] text-[0.5rem] font-mono tracking-widest">VOL</div>
                   <button 
                      onClick={() => setVolume(v => v >= 100 ? 0 : v + 10)}
                      className="w-12 h-12 rounded-full bg-[#181818] border-b-2 border-r-2 border-[#050505] shadow-[0_5px_10px_rgba(0,0,0,0.5)] flex items-center justify-center transform active:rotate-12 transition-transform"
                   >
                      <Volume2 className="text-[#444] w-4 h-4" />
                   </button>
                </div>
             </div>

             {/* Power */}
             <div className="ml-4 md:ml-0 md:mt-auto w-auto md:w-full">
                <button 
                  onClick={togglePower}
                  className={`w-12 h-12 md:w-full md:h-12 md:py-0 rounded-full md:rounded border-2 flex items-center justify-center gap-2 font-bold tracking-wider transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)]
                    ${tvState !== TVState.OFF 
                      ? 'bg-green-900/20 text-green-400 border-green-800/50 shadow-[0_0_15px_rgba(0,255,0,0.1)]' 
                      : 'bg-red-950 text-red-500 border-red-900'}
                  `}
                >
                  <Power size={18} />
                  <span className="hidden md:inline text-xs">{tvState === TVState.OFF ? "PWR" : "ON"}</span>
                </button>
             </div>

          </div>
        </div>
        
        {/* VCR Player / Bottom Shelf */}
        <div className="mt-6 relative">
           {/* VCR Unit */}
           <div className="bg-[#222] rounded-lg p-3 border-t border-white/10 shadow-[0_10px_30px_black] flex items-center gap-6 relative z-20">
               <div className="flex flex-col text-zinc-500 font-mono text-[10px] tracking-[0.2em] leading-tight w-20 text-center border-r border-white/5 pr-4">
                   <span>HI-FI</span>
                   <span className="text-zinc-600">STEREO</span>
               </div>

               {/* VCR Slot (The conceptual drop zone) */}
               <div className={`flex-grow h-12 bg-[#111] rounded border-b border-[#333] shadow-[inset_0_4px_10px_black] flex items-center justify-center relative overflow-hidden transition-all ${isHovered ? 'ring-2 ring-amber-500/50 bg-[#1a1a1a]' : ''}`}>
                   <div className="w-[95%] h-[2px] bg-black shadow-[0_1px_0_#333]"></div>
                   {isHovered && <div className="absolute inset-0 bg-amber-500/10 animate-pulse"></div>}
               </div>

               {/* LED Display */}
               <div className="w-32 bg-black rounded border border-white/10 p-1 text-center">
                   <div className="font-['VT323'] text-green-500 text-2xl tracking-widest shadow-[0_0_10px_rgba(0,255,0,0.2)]">
                       {tvState === TVState.PLAYING ? "PLAY" : tvState === TVState.LOADING ? "LOAD" : "00:00"}
                   </div>
               </div>
               
               {/* Indicator Lights */}
               <div className="flex gap-2">
                   <div className={`w-2 h-2 rounded-full ${tvState === TVState.PLAYING ? 'bg-red-500 shadow-[0_0_5px_red]' : 'bg-red-900'}`}></div>
                   <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_#0f0]"></div>
               </div>

               {/* Sticky Note Tip */}
               {!currentDisc && !playMovie && tvState !== TVState.OFF && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 -rotate-2 z-30 pointer-events-none">
                      {/* Tape */}
                      <div className="tape"></div>
                      {/* Paper */}
                      <div className="bg-[#fffcbb] text-[#333] font-['Permanent_Marker'] text-sm md:text-lg px-6 py-3 shadow-lg border border-yellow-300/50 transform rotate-1">
                          Drag Disc Here 
                          <span className="block text-center text-2xl leading-[0.5] mt-1">⬇</span>
                      </div>
                  </div>
               )}
           </div>
           
           {/* Cables Decor */}
           <div className="absolute -bottom-4 left-10 w-full h-4 border-b-2 border-black/50 rounded-full z-0"></div>
        </div>

        {/* Brand Label */}
        <div className="absolute bottom-4 left-8 flex items-center gap-2 opacity-80 pointer-events-none">
           <div className="text-[#ccaa55] font-['Limelight'] text-lg tracking-[0.2em] drop-shadow-sm">
              ZENITH
           </div>
        </div>

      </div>
    </div>
  );
};