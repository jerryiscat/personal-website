import React from 'react';
import { MovieData } from '../types';
import { PlayCircle, Film, SearchX } from 'lucide-react';

interface WatchListProps {
  movies: MovieData[];
  onSelectMovie: (movie: MovieData) => void;
}

export const WatchList: React.FC<WatchListProps> = ({ movies, onSelectMovie }) => {
  if (movies.length === 0) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center text-zinc-500 bg-white/5 rounded-3xl border-4 border-dashed border-white/10">
        <SearchX size={64} className="mb-6 text-zinc-700" />
        <h3 className="text-2xl font-['Limelight'] text-zinc-400 mb-2">COLLECTION EMPTY</h3>
        <p className="font-mono text-sm opacity-60 max-w-md text-center px-4">
          Go back to the Player, drag a disc to the TV, and hit the "REC" button to save movies here.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative bg-[#3e2723] rounded-lg p-8 shadow-[inset_0_0_60px_rgba(0,0,0,0.8)] border border-[#5d4037]">
        {/* Wood Texture Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none rounded-lg mix-blend-overlay" 
             style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")'}}>
        </div>

        <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-16 pb-8">
          {movies.map((movie, index) => (
            <div key={movie.id || index} className="flex flex-col items-center group">
               
               {/* VHS Tape / Poster Card */}
               <div 
                 onClick={() => onSelectMovie(movie)}
                 className="relative w-full aspect-[2/3] bg-black rounded shadow-[0_10px_20px_rgba(0,0,0,0.6)] cursor-pointer transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_20px_30px_rgba(0,0,0,0.8)] overflow-hidden"
               >
                  {movie.posterBase64 ? (
                    <img 
                      src={movie.posterBase64} 
                      alt={movie.title} 
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800 p-4 text-center border-2 border-zinc-700">
                      <Film className="w-12 h-12 mb-2 text-zinc-600" />
                      <span className="font-['VT323'] text-xl leading-tight uppercase">{movie.title}</span>
                    </div>
                  )}

                  {/* Overlay Effects */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                  
                  {/* Play Hint */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
                     <div className="bg-amber-500 text-black px-4 py-2 rounded-full font-bold font-mono flex items-center gap-2 transform scale-90 group-hover:scale-100 transition-transform">
                        <PlayCircle size={18} /> PLAY
                     </div>
                  </div>

                  {/* Title Label at Bottom of Poster */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                     <h4 className="font-['VT323'] text-xl text-white leading-none drop-shadow-md">{movie.title}</h4>
                     <p className="text-xs font-mono text-amber-400 mt-1">{movie.year}</p>
                  </div>
               </div>

               {/* Shelf Underneath */}
               <div className="w-[120%] h-4 bg-[#281910] mt-4 rounded-sm shadow-[0_5px_10px_rgba(0,0,0,0.5)] relative -z-10">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#4e342e] opacity-50"></div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};