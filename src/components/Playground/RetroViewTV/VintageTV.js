import React, { useState, useEffect, useRef } from 'react';
import { TVState } from './types';
import { generateMovieInfo, generateMoviePoster } from './geminiService';
import { fetchMovieByGenre, fetchMoviePoster } from './tmdbService';
import { getMovieByGenre } from './moviesData';
import { FaPlay, FaStop } from 'react-icons/fa';
import './RetroViewTV.css';

const VintageTV = ({ 
  onDropDisc, 
  currentDisc, 
  playMovie, 
  onAddToWatchList,
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
  const [tvState, setTvState] = useState(TVState.IDLE);
  const [movieData, setMovieData] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [soundtrackTracks, setSoundtrackTracks] = useState([]);
  const [isLoadingSoundtrack, setIsLoadingSoundtrack] = useState(false);
  const [soundtrackReady, setSoundtrackReady] = useState(false);
  const [showDragHint, setShowDragHint] = useState(false);
  const currentDiscRef = useRef(null); // Track the current disc to prevent re-loading

  // Fetch soundtrack function
  const fetchSoundtrack = React.useCallback(async (movieTitle, movieId) => {
    setIsLoadingSoundtrack(true);
    setSoundtrackReady(false);
    
    try {
      // Check cache first
      const cacheKey = `${movieId}_${movieTitle}`;
      const cachedData = soundtrackCache?.current?.[cacheKey];
      
      if (cachedData && !isCacheExpired?.(cachedData) && cachedData.tracks && cachedData.tracks.length > 0) {
        console.log('🎵 Using cached soundtrack for:', movieTitle);
        const normalizedTracks = cachedData.tracks.map(normalizeTrack);
        setSoundtrackTracks(normalizedTracks);
        setSoundtrackReady(true);
        setIsLoadingSoundtrack(false);
        return;
      }
      
      // Fetch from API
      if (searchSpotifyTracks) {
        const tracks = await searchSpotifyTracks(movieTitle, 200);
        if (tracks && tracks.length > 0) {
          const normalizedTracks = tracks.map(normalizeTrack);
          setSoundtrackTracks(normalizedTracks);
          setSoundtrackReady(true);
          
          // Cache the tracks
          if (soundtrackCache?.current) {
            soundtrackCache.current[cacheKey] = {
              tracks: normalizedTracks,
              timestamp: Date.now()
            };
          }
        } else {
          setSoundtrackTracks([]);
          setSoundtrackReady(false);
        }
      }
    } catch (error) {
      console.error('Error fetching soundtrack:', error);
      setSoundtrackTracks([]);
      setSoundtrackReady(false);
    } finally {
      setIsLoadingSoundtrack(false);
    }
  }, [searchSpotifyTracks, soundtrackCache, normalizeTrack, isCacheExpired]);

  // Handle direct playback from Watch List
  useEffect(() => {
    if (playMovie) {
      if (tvState === TVState.OFF) setTvState(TVState.LOADING);
      
      setTvState(TVState.LOADING);
      setSoundtrackTracks([]);
      setSoundtrackReady(false);
      setTimeout(() => {
        setMovieData(playMovie);
        setTvState(TVState.PLAYING);
        
        // Fetch soundtrack in the background
        if (searchSpotifyTracks && playMovie.title) {
          fetchSoundtrack(playMovie.title, playMovie.id || Date.now().toString());
        }
      }, 800);
    }
  }, [playMovie, tvState, searchSpotifyTracks, fetchSoundtrack]);

  // Handle new disc generation
  useEffect(() => {
    // Only load if currentDisc is different from what we've already loaded
    if (currentDisc && currentDisc.id !== currentDiscRef.current?.id) {
      currentDiscRef.current = currentDisc;
      loadMovie(currentDisc);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDisc]); // Only depend on currentDisc, loadMovie will have access to latest fetchSoundtrack via closure

  const loadMovie = React.useCallback(async (disc) => {
    setTvState(TVState.LOADING);
    setSoundtrackTracks([]);
    setSoundtrackReady(false);
    
    try {
      // Use predefined movie data for stability
      let fullData = null;
      const predefinedMovie = getMovieByGenre(disc.genre);
      
      if (predefinedMovie) {
        // Use predefined movie data
        fullData = {
          ...predefinedMovie,
          genre: disc.genre,
          posterBase64: predefinedMovie.posterPath, // May be null, will fetch if needed
        };
        
        // Fetch poster from TMDb if not already available
        if (!fullData.posterBase64 && predefinedMovie.title && predefinedMovie.year) {
          try {
            const posterUrl = await fetchMoviePoster(predefinedMovie.title, predefinedMovie.year);
            if (posterUrl) {
              fullData.posterBase64 = posterUrl;
            }
          } catch (error) {
            console.warn(`Failed to fetch poster for ${predefinedMovie.title}:`, error);
          }
        }
      } else {
        // Fallback: Try to fetch from TMDb
        try {
          const tmdbData = await fetchMovieByGenre(disc.genre);
          fullData = {
            ...tmdbData,
            posterBase64: tmdbData.posterPath, // Use TMDb poster
          };
        } catch (tmdbError) {
          console.warn('TMDb fetch failed, falling back to Gemini:', tmdbError);
          // Fallback to Gemini if TMDb fails
          const info = await generateMovieInfo(disc.genre);
          fullData = { ...info };
          
          if (info.posterPrompt) {
            const posterUrl = await generateMoviePoster(info.posterPrompt);
            if (posterUrl) {
              fullData.posterBase64 = posterUrl;
            }
          }
        }
      }
      
      if (!fullData.id) fullData.id = Date.now().toString();
      setMovieData(fullData);
      setTvState(TVState.PLAYING);
      
      // Fetch soundtrack in the background
      if (searchSpotifyTracks && fullData.title) {
        fetchSoundtrack(fullData.title, fullData.id);
      }
    } catch (error) {
      console.error(error);
      setTvState(TVState.ERROR);
    }
  }, [searchSpotifyTracks, fetchSoundtrack]);


  // Check if current movie is playing
  const isCurrentlyPlaying = movieData && playingMusicId === movieData.id && currentTrackUrl;

  const handlePlaySoundtrack = () => {
    // If no signal (IDLE state), show hint to drag disc
    if (tvState === TVState.IDLE) {
      setShowDragHint(true);
      setTimeout(() => {
        setShowDragHint(false);
      }, 3000); // Hide after 3 seconds
      return;
    }
    
    // If currently playing, stop it
    if (isCurrentlyPlaying && onPlaySoundtrack) {
      onPlaySoundtrack(movieData.id, movieData.title); // This will toggle to stop
      return;
    }
    
    // If movie is loaded and soundtrack is ready, play it
    if (movieData && soundtrackTracks.length > 0 && onPlaySoundtrack) {
      // Use the movie title and ID to trigger playback
      onPlaySoundtrack(movieData.id, movieData.title);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsHovered(true);
  };

  const handleDragLeave = () => {
    setIsHovered(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsHovered(false);
    const discData = e.dataTransfer.getData('application/json');
    if (discData) {
      try {
        const disc = JSON.parse(discData);
        onDropDisc(disc);
      } catch (err) {
        console.error("Failed to parse drop data");
      }
    }
  };



  const renderScreenContent = () => {
    if (tvState === TVState.OFF) {
      return <div className="tv-screen-off"></div>;
    }

    if (tvState === TVState.LOADING) {
      return (
        <div className="tv-screen-loading">
          <div className="tv-loading-content">
            <div className="tv-loading-spinner">⏳</div>
            <p className="tv-loading-text">TUNING...</p>
            <div className="tv-loading-bar">
              <div className="tv-loading-progress"></div>
            </div>
          </div>
        </div>
      );
    }

    if (tvState === TVState.ERROR) {
      return (
        <div className="tv-screen-error">
          <div className="tv-error-icon">📡</div>
          <h2 className="tv-error-title">NO SIGNAL</h2>
          <p className="tv-error-text">PLEASE CHECK CARTRIDGE</p>
        </div>
      );
    }

    if (tvState === TVState.IDLE) {
      return (
        <div className="tv-screen-idle">
          <div className="tv-idle-bars">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="tv-idle-bar" style={{ backgroundColor: ['#c0c0c0', '#c0c000', '#00c0c0', '#00c000', '#c000c0', '#c00000', '#0000c0'][i] }}></div>
            ))}
          </div>
          <div className="tv-idle-text"></div>

        </div>
      );
    }

    if (tvState === TVState.PLAYING && movieData) {
      const posterUrl = movieData.posterBase64 || movieData.posterPath;
      return (
        <div className="tv-screen-playing">
          {posterUrl && (
            <div className="tv-poster-area">
              <img 
                src={posterUrl} 
                alt="Poster" 
                className="tv-poster-image" 
                onError={(e) => {
                  // Hide image if it fails to load
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          <div className="tv-info-area">
            <div className="tv-movie-header">
              <h1 className="tv-movie-title">{movieData.title}</h1>
              <span className="tv-movie-year">{movieData.year}</span>
            </div>
            <div className="tv-movie-details">
              <span className="tv-movie-director">Dir: {movieData.director}</span>
              <span className="tv-movie-rating">★ {movieData.rating}</span>
            </div>
            <p className="tv-movie-tagline">"{movieData.tagline}"</p>
            <div className="tv-movie-synopsis">
              <div className="tv-synopsis-title">SYNOPSIS</div>
              <p className="tv-synopsis-text">{movieData.plot}</p>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div 
      className="vintage-tv-container"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="vintage-tv-frame">
        <div className="vintage-tv-screen">
          <div className={`tv-screen-content ${tvState === TVState.OFF ? 'tv-off' : 'tv-on'}`}>
            {renderScreenContent()}
          </div>
        </div>

        <div className="vintage-tv-vcr">
          <div className="tv-vcr-slot">
            {isHovered && <div className="tv-vcr-hint">Drop Disc Here ⬇</div>}
          </div>
          {/* Play Button - always visible */}
          {(tvState === TVState.PLAYING || tvState === TVState.IDLE) && (
            <div className="tv-play-button-wrapper">
              <button 
                className={`tv-play-button ${
                  tvState === TVState.IDLE 
                    ? 'tv-play-button-idle' 
                    : isCurrentlyPlaying
                      ? 'tv-play-button-playing'
                      : soundtrackReady 
                        ? 'tv-play-button-ready' 
                        : 'tv-play-button-loading'
                }`}
                onClick={handlePlaySoundtrack}
                disabled={tvState === TVState.PLAYING && !isCurrentlyPlaying && (!soundtrackReady || isLoadingSoundtrack)}
                title={
                  tvState === TVState.IDLE 
                    ? 'Drag a disc to play' 
                    : isCurrentlyPlaying
                      ? 'Stop Soundtrack'
                      : soundtrackReady 
                        ? 'Play Soundtrack' 
                        : 'Loading Soundtrack...'
                }
              >
                {tvState === TVState.IDLE ? (
                  <FaPlay className="tv-play-icon" />
                ) : isLoadingSoundtrack ? (
                  <span className="tv-play-button-spinner">⏳</span>
                ) : isCurrentlyPlaying ? (
                  <FaStop className="tv-play-icon" />
                ) : soundtrackReady ? (
                  <FaPlay className="tv-play-icon" />
                ) : (
                  <span className="tv-play-button-spinner">⏳</span>
                )}
              </button>
              {tvState === TVState.IDLE ? (
                <div className="tv-play-hint">PLAY</div>
              ) : isLoadingSoundtrack ? (
                <div className="tv-play-hint">LOADING...</div>
              ) : isCurrentlyPlaying ? (
                <div className="tv-play-hint">STOP</div>
              ) : soundtrackReady ? (
                <div className="tv-play-hint">PLAY</div>
              ) : (
                <div className="tv-play-hint">LOADING...</div>
              )}
              {showDragHint && (
                <div className="tv-drag-hint-popup">
                  Drag a disc!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VintageTV;

