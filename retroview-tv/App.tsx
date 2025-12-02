import React, { useState, useCallback } from 'react';
import { VintageTV } from './components/VintageTV';
import { MovieDisc } from './components/MovieDisc';
import { WatchList } from './components/WatchList';
import { AVAILABLE_DISCS } from './constants';
import { DiscType, MovieData } from './types';
import { Key, Sparkles, Tv, Library } from 'lucide-react';

const App: React.FC = () => {
  const [currentDisc, setCurrentDisc] = useState<DiscType | null>(null);
  const [activeMovie, setActiveMovie] = useState<MovieData | null>(null);
  const [watchList, setWatchList] = useState<MovieData[]>([]);
  const [hasApiKey, setHasApiKey] = useState<boolean>(!!process.env.API_KEY);
  const [activeTab, setActiveTab] = useState<'player' | 'collection'>('player');

  // Split discs into left and right groups for the layout
  const leftDiscs = AVAILABLE_DISCS.filter((_, i) => i % 2 === 0);
  const rightDiscs = AVAILABLE_DISCS.filter((_, i) => i % 2 !== 0);

  const handleDragStart = useCallback((e: React.DragEvent, disc: DiscType) => {
    e.dataTransfer.setData('application/json', JSON.stringify(disc));
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  const handleDropDisc = useCallback((disc: DiscType) => {
    setActiveMovie(null);
    setCurrentDisc(disc);
  }, []);

  const handleAddToWatchList = useCallback((movie: MovieData) => {
    setWatchList(prev => {
      if (prev.some(m => m.title === movie.title)) return prev;
      return [...prev, { ...movie, id: Date.now().toString() }];
    });
  }, []);

  const handleSelectFromWatchList = useCallback((movie: MovieData) => {
    setCurrentDisc(null);
    setActiveMovie(movie);
    setActiveTab('player'); // Switch back to player view
  }, []);

  if (!hasApiKey) {
      return (
          <div className="min-h-screen bg-[#111] flex items-center justify-center text-zinc-400 font-mono p-6">
             <div className="max-w-md text-center border border-red-900/50 bg-red-900/10 p-8 rounded-xl">
                <Key className="w-12 h-12 mx-auto mb-4 text-red-500" />
                <h1 className="text-xl text-red-400 font-bold mb-2">API Key Missing</h1>
                <p className="mb-4">To operate this vintage equipment, you must configure the <code>API_KEY</code> environment variable with a valid Gemini API key.</p>
                <p className="text-sm opacity-60">Restart the application with the key to proceed.</p>
             </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-[#151515] text-gray-200 flex flex-col font-sans overflow-x-hidden relative">
      
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-amber-900/10 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
         {/* Carpet Texture */}
         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
      </div>

      {/* Header & Navigation */}
      <header className="w-full p-4 border-b border-white/5 bg-black/40 backdrop-blur-md relative z-50">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Sparkles className="text-amber-500 w-5 h-5" />
              <h1 className="text-2xl font-['Limelight'] tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
                RETROVIEW TV
              </h1>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center p-1 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm">
               <button 
                 onClick={() => setActiveTab('player')}
                 className={`flex items-center gap-2 px-6 py-2 rounded-full font-['VT323'] text-lg transition-all ${activeTab === 'player' ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)]' : 'text-zinc-400 hover:text-zinc-200'}`}
               >
                 <Tv size={16} />
                 PLAYER
               </button>
               <button 
                 onClick={() => setActiveTab('collection')}
                 className={`flex items-center gap-2 px-6 py-2 rounded-full font-['VT323'] text-lg transition-all ${activeTab === 'collection' ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)]' : 'text-zinc-400 hover:text-zinc-200'}`}
               >
                 <Library size={16} />
                 COLLECTION <span className="text-xs opacity-70 bg-black/20 px-1.5 rounded-md ml-1">{watchList.length}</span>
               </button>
            </div>
          </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center relative z-10 w-full max-w-7xl mx-auto pt-8 md:pt-12 pb-12">
        
        {/* VIEW: PLAYER */}
        {activeTab === 'player' && (
          <div className="flex flex-col xl:flex-row items-center justify-center w-full gap-8 xl:gap-0 relative animate-in fade-in duration-500">
            
            {/* Left Discs (Scatter) */}
            <div className="order-2 xl:order-1 w-full xl:w-1/4 flex flex-row xl:flex-col gap-4 md:gap-12 items-center justify-center xl:pr-12 flex-wrap p-4">
              {leftDiscs.map((disc, i) => (
                <MovieDisc 
                  key={disc.id} 
                  disc={disc} 
                  onDragStart={handleDragStart} 
                  rotation={-10 - (i * 15)} 
                />
              ))}
            </div>

            {/* Center TV */}
            <div className="order-1 xl:order-2 w-full max-w-4xl flex-shrink-0 px-4">
               <VintageTV 
                  onDropDisc={handleDropDisc} 
                  currentDisc={currentDisc}
                  playMovie={activeMovie}
                  onAddToWatchList={handleAddToWatchList}
               />
            </div>

            {/* Right Discs (Scatter) */}
            <div className="order-3 xl:order-3 w-full xl:w-1/4 flex flex-row xl:flex-col gap-4 md:gap-12 items-center justify-center xl:pl-12 flex-wrap p-4">
              {rightDiscs.map((disc, i) => (
                <MovieDisc 
                  key={disc.id} 
                  disc={disc} 
                  onDragStart={handleDragStart} 
                  rotation={10 + (i * 15)}
                />
              ))}
            </div>
          </div>
        )}

        {/* VIEW: COLLECTION */}
        {activeTab === 'collection' && (
           <div className="w-full px-6 animate-in slide-in-from-bottom-4 duration-500">
              <WatchList movies={watchList} onSelectMovie={handleSelectFromWatchList} />
           </div>
        )}

      </main>

    </div>
  );
};

export default App;