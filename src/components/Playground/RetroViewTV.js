import React, { useState, useCallback, useRef, useEffect } from 'react';
import VintageTV from './RetroViewTV/VintageTV';
import MovieDisc from './RetroViewTV/MovieDisc';
import WatchList from './RetroViewTV/WatchList';
import { AVAILABLE_DISCS } from './RetroViewTV/constants';
import './RetroViewTV/RetroViewTV.css';

const RetroViewTV = ({ 
  onPlaySoundtrack, 
  searchSpotifyTracks, 
  soundtrackCache, 
  normalizeTrack, 
  getTrackUrl, 
  isCacheExpired, 
  cleanExpiredCache, 
  CACHE_EXPIRY_TIME,
  playingMusicId,
  currentTrackUrl
}) => {
  const [currentDisc, setCurrentDisc] = useState(null);
  const [activeMovie, setActiveMovie] = useState(null);
  const [watchList, setWatchList] = useState([]);
  const [musicNotes, setMusicNotes] = useState([]);
  const containerRef = useRef(null);

  // Split discs into left and right groups for the layout
  const leftDiscs = AVAILABLE_DISCS.filter((_, i) => i % 2 === 0);
  const rightDiscs = AVAILABLE_DISCS.filter((_, i) => i % 2 !== 0);

  const handleDragStart = useCallback((e, disc) => {
    e.dataTransfer.setData('application/json', JSON.stringify(disc));
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  const handleDropDisc = useCallback((disc) => {
    setActiveMovie(null);
    setCurrentDisc(disc);
  }, []);

  const handleAddToWatchList = useCallback((movie) => {
    setWatchList(prev => {
      if (prev.some(m => m.title === movie.title)) return prev;
      return [...prev, { ...movie, id: Date.now().toString() }];
    });
  }, []);

  const handleSelectFromWatchList = useCallback((movie) => {
    setCurrentDisc(null);
    setActiveMovie(movie);
  }, []);

  // Handle click outside TV to create music notes
  useEffect(() => {
    const handleClick = (e) => {
      // Check if click is outside the TV container
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        // Different music note styles
        const noteStyles = [
          { emoji: '♪', className: 'music-note-single' },
          { emoji: '♫', className: 'music-note-double' },
          { emoji: '♬', className: 'music-note-double-beamed' },
          { emoji: '♩', className: 'music-note-quarter' },
          { emoji: '♭', className: 'music-note-flat' },
          // { emoji: '♯', className: 'music-note-sharp' },
        ];
        
        // Randomly select a note style
        const randomStyle = noteStyles[Math.floor(Math.random() * noteStyles.length)];
        
        // Create a music note at the click position with random rotation and style
        // Use pageX/pageY for position relative to document, not viewport
        const note = {
          id: Date.now() + Math.random(),
          x: e.pageX,
          y: e.pageY,
          rotation: Math.random() * 360, // Random initial rotation (0-360 degrees)
          style: randomStyle.className,
          emoji: randomStyle.emoji,
        };
        setMusicNotes(prev => [...prev, note]);
        // Notes stay until page refresh - no timeout removal
      }
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div className="retroview-tv-container" ref={containerRef}>
      {/* Animated Music Notes */}
      {musicNotes.map(note => (
        <div
          key={note.id}
          className="music-note-effect"
          style={{
            left: `${note.x}px`,
            top: `${note.y}px`,
            '--initial-rotation': `${note.rotation}deg`,
          }}
        >
          <span 
            className={`music-note-emoji ${note.style || 'music-note-single'}`}
            style={{ '--initial-rotation': `${note.rotation}deg` }}
          >
            {note.emoji || '♪'}
          </span>
        </div>
      ))}
      {/* Fun Tip */}
      <div className="retroview-tip">
        <span className="retroview-tip-icon">🎬</span>
        <p className="retroview-tip-text">
          Drag a disc into the TV to discover a vintage movie soundtrack! Each disc holds a different genre's musical magic ✨ Once a movie appears, you can play the soundtrack by clicking the play button.
        </p>
      </div>

      {/* Main Content */}
      <main className="retroview-main">
        {/* VIEW: PLAYER */}
        <div className="retroview-player-view">
          {/* Left Discs */}
          <div className="retroview-discs-left">
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
          <div className="retroview-tv-center">
            <VintageTV 
              onDropDisc={handleDropDisc} 
              currentDisc={currentDisc}
              playMovie={activeMovie}
              onAddToWatchList={handleAddToWatchList}
              onPlaySoundtrack={onPlaySoundtrack}
              searchSpotifyTracks={searchSpotifyTracks}
              soundtrackCache={soundtrackCache}
              normalizeTrack={normalizeTrack}
              getTrackUrl={getTrackUrl}
              isCacheExpired={isCacheExpired}
              cleanExpiredCache={cleanExpiredCache}
              CACHE_EXPIRY_TIME={CACHE_EXPIRY_TIME}
              playingMusicId={playingMusicId}
              currentTrackUrl={currentTrackUrl}
            />
          </div>

          {/* Right Discs */}
          <div className="retroview-discs-right">
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
      </main>
    </div>
  );
};

export default RetroViewTV;

