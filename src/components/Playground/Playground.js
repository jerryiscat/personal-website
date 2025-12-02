import React, { useState, useEffect, useRef } from 'react';
import './Playground.css';
import { FaMusic, FaUtensils, FaSearch, FaSpinner, FaChevronLeft, FaChevronRight, FaExternalLinkAlt, FaTimes, FaEllipsisH } from 'react-icons/fa';
import RetroViewTV from './RetroViewTV';

function Playground() {
  const [selectedDish, setSelectedDish] = useState(null);
  
  // TMDb API states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedSearchMovie, setSelectedSearchMovie] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [error, setError] = useState(null);
  const [playingMusicId, setPlayingMusicId] = useState(null);
  const [currentTrackUrl, setCurrentTrackUrl] = useState(null);
  const [currentMovieTitle, setCurrentMovieTitle] = useState(null);
  const [isLoadingMusic, setIsLoadingMusic] = useState(false);
  const [soundtrackTracks, setSoundtrackTracks] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);
  const [isLoadingPlayer, setIsLoadingPlayer] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const [showTrackList, setShowTrackList] = useState(false);
  const searchDropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);
  const spotifyIframeRef = useRef(null);
  const trackListRef = useRef(null);
  
  // Cache for soundtrack tracks by movie ID
  // Cache expires after 24 hours (86400000 ms)
  const CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours
  const soundtrackCache = useRef({});
  
  // Helper function to normalize track format (handle backward compatibility)
  const normalizeTrack = (track) => {
    if (typeof track === 'string') {
      // Old format: just URL string
      const trackIdMatch = track.match(/\/track\/([^?]+)/);
      return {
        url: track,
        title: trackIdMatch ? `Track ${trackIdMatch[1]}` : 'Unknown Track',
        artist: 'Unknown Artist'
      };
    }
    // New format: object with url, title, artist
    return track;
  };
  
  // Helper function to get track URL (handles both formats)
  const getTrackUrl = (track) => {
    return normalizeTrack(track).url;
  };
  
  // Helper function to check if cache entry is expired
  const isCacheExpired = (cacheEntry) => {
    if (!cacheEntry || !cacheEntry.timestamp) return true;
    return Date.now() - cacheEntry.timestamp > CACHE_EXPIRY_TIME;
  };
  
  // Helper function to clean expired cache entries
  const cleanExpiredCache = () => {
    Object.keys(soundtrackCache.current).forEach(key => {
      if (isCacheExpired(soundtrackCache.current[key])) {
        delete soundtrackCache.current[key];
      }
    });
  };

  // TMDb API Key - Replace with your own API key from https://www.themoviedb.org/settings/api
  const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY || 'YOUR_API_KEY_HERE';
  const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
  const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

  // Sample movie data - you can replace with your own
  // Note: poster_path will be fetched from TMDb API on component mount
  const [movies, setMovies] = useState([
    {
      id: 1,
      title: "The Grand Budapest Hotel",
      year: 2014,
      description: "A whimsical tale of a legendary concierge and his protégé.",
      music: "https://www.youtube.com/watch?v=example1",
      musicName: "Main Theme - Alexandre Desplat",
      poster_path: null // Will be fetched from TMDb
    },
    {
      id: 2,
      title: "Robot Dreams",
      year: 2023,
      description: "A heartwarming animated film about friendship between a dog and a robot in 1980s New York.",
      music: "https://www.youtube.com/watch?v=example2",
      musicName: "Soundtrack",
      poster_path: null // Will be fetched from TMDb
    },
    {
      id: 3,
      title: "Pulp Fiction",
      year: 1994,
      description: "A nonlinear crime film following interconnected stories of Los Angeles mobsters, small-time criminals, and a mysterious briefcase.",
      music: "https://www.youtube.com/watch?v=example3",
      musicName: "Soundtrack",
      poster_path: null // Will be fetched from TMDb
    }
  ]);

  // Sample cooking dishes - you can replace with your own
  const dishes = [
    {
      id: 1,
      name: "Pasta Carbonara",
      image: "/api/placeholder/300/300", // Placeholder - replace with your drawn dish image
      recipe: {
        ingredients: [
          "200g spaghetti",
          "100g pancetta",
          "2 eggs",
          "50g parmesan cheese",
          "Black pepper",
          "Salt"
        ],
        instructions: [
          "Cook spaghetti in salted water until al dente",
          "Fry pancetta until crispy",
          "Mix eggs and parmesan in a bowl",
          "Combine hot pasta with pancetta",
          "Add egg mixture off heat, stirring quickly",
          "Season with black pepper and serve"
        ]
      }
    },
    {
      id: 2,
      name: "Chocolate Chip Cookies",
      image: "/api/placeholder/300/300",
      recipe: {
        ingredients: [
          "225g butter",
          "150g brown sugar",
          "100g white sugar",
          "2 eggs",
          "280g flour",
          "1 tsp baking soda",
          "200g chocolate chips"
        ],
        instructions: [
          "Cream butter and sugars",
          "Add eggs and vanilla",
          "Mix in flour and baking soda",
          "Fold in chocolate chips",
          "Bake at 180°C for 10-12 minutes",
          "Cool on wire rack"
        ]
      }
    },
    {
      id: 3,
      name: "Beef Stir Fry",
      image: "/api/placeholder/300/300",
      recipe: {
        ingredients: [
          "300g beef strips",
          "1 bell pepper",
          "1 onion",
          "2 cloves garlic",
          "Soy sauce",
          "Ginger",
          "Vegetable oil"
        ],
        instructions: [
          "Marinate beef in soy sauce and ginger",
          "Heat oil in wok",
          "Stir-fry beef until browned",
          "Add vegetables and garlic",
          "Cook until vegetables are tender",
          "Serve over rice"
        ]
      }
    }
  ];

  const handleMovieClick = (movie) => {
    // Use the same music toggle functionality as TMDb recommendations
    handleMusicToggle(movie.id, movie.title);
  };

  const handleDishClick = (dish) => {
    setSelectedDish(selectedDish?.id === dish.id ? null : dish);
  };

  // Fetch poster paths from TMDb API for recommended movies
  useEffect(() => {
    const fetchMoviePosters = async () => {
      if (TMDB_API_KEY === 'YOUR_API_KEY_HERE') {
        return; // Skip if API key is not set
      }

      const updatedMovies = await Promise.all(
        movies.map(async (movie) => {
          if (movie.poster_path) {
            return movie; // Already has poster path
          }

          try {
            const response = await fetch(
              `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movie.title)}&year=${movie.year}&language=en-US&page=1`
            );

            if (response.ok) {
              const data = await response.json();
              if (data.results && data.results.length > 0) {
                // Find the best match (same year or closest)
                const match = data.results.find(
                  (result) => result.release_date && new Date(result.release_date).getFullYear() === movie.year
                ) || data.results[0];

                return {
                  ...movie,
                  poster_path: match.poster_path,
                  tmdb_id: match.id // Store TMDb ID for linking
                };
              }
            }
          } catch (error) {
            console.error(`Error fetching poster for ${movie.title}:`, error);
          }

          return movie; // Return original if fetch fails
        })
      );

      setMovies(updatedMovies);
    };

    fetchMoviePosters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (trackListRef.current && !trackListRef.current.contains(event.target)) {
        setShowTrackList(false);
      }
    };

    if (showDropdown || showTrackList) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown, showTrackList]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // TMDb API functions
  const searchMovies = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setError(null);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    setError(null);
    setRecommendations([]);
    setSelectedSearchMovie(null);

    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to search movies');
      }

      const data = await response.json();
      setSearchResults(data.results.slice(0, 5)); // Show top 5 results
      setShowDropdown(true);
    } catch (err) {
      setError('Failed to search movies. Please check your API key or try again later.');
      console.error('Search error:', err);
      setShowDropdown(false);
    } finally {
      setIsSearching(false);
    }
  };

  const getRecommendations = async (movieId) => {
    setIsLoadingRecommendations(true);
    setError(null);
    setRecommendations([]);

    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/${movieId}/recommendations?api_key=${TMDB_API_KEY}&language=en-US&page=1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();
      setRecommendations(data.results.slice(0, 6)); // Show top 6 recommendations
    } catch (err) {
      setError('Failed to get recommendations. Please try again.');
      console.error('Recommendations error:', err);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const handleMovieSelect = (movie) => {
    setSelectedSearchMovie(movie);
    setShowDropdown(false);
    // Set search query to movie title only (no year)
    setSearchQuery(movie.title);
    getRecommendations(movie.id);
  };

  const handleClearSearch = () => {
    // Clear timeout if exists
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    setSearchQuery('');
    setSearchResults([]);
    setSelectedSearchMovie(null);
    setRecommendations([]);
    setError(null);
    setShowDropdown(false);
    setIsSearching(false);
    
    // Refocus input after clearing
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };


  // Function to search for first track quickly, then continue fetching others
  const searchFirstTrack = async (movieTitle, releaseDetails, tracks, spotifyAccessToken) => {
    if (!tracks || tracks.length === 0 || !spotifyAccessToken) return null;
    
    const firstTrack = tracks[0];
    if (!firstTrack.recording) return null;
    
    const trackTitle = firstTrack.title || firstTrack.recording.title;
    let artistName = null;
    if (firstTrack.recording['artist-credit'] && firstTrack.recording['artist-credit'].length > 0) {
      artistName = firstTrack.recording['artist-credit'][0].artist?.name || 
                  firstTrack.recording['artist-credit'][0].name;
    }
    
    if (!trackTitle) return null;
    
    if (!artistName && releaseDetails['artist-credit'] && releaseDetails['artist-credit'].length > 0) {
      artistName = releaseDetails['artist-credit'][0].artist?.name || 
                  releaseDetails['artist-credit'][0].name;
    }
    
    // Try to find first track quickly
    const searchQueries = [];
    if (artistName) {
      searchQueries.push(`track:"${trackTitle}" artist:"${artistName}"`);
      searchQueries.push(`track:${trackTitle} artist:${artistName}`);
    }
    searchQueries.push(`track:"${trackTitle}"`);
    searchQueries.push(trackTitle);
    
    for (const searchQuery of searchQueries) {
      try {
        const spotifySearchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=1`;
        const spotifyResponse = await fetch(spotifySearchUrl, {
          headers: {
            'Authorization': `Bearer ${spotifyAccessToken}`
          }
        });
        
          if (spotifyResponse.ok) {
            const spotifyData = await spotifyResponse.json();
            if (spotifyData.tracks?.items?.length > 0) {
              const spotifyTrack = spotifyData.tracks.items[0];
              const spotifyTrackId = spotifyTrack.id;
              const trackUrl = `https://open.spotify.com/embed/track/${spotifyTrackId}?utm_source=generator&theme=0&view=list&t=0&autoplay=true`;
              return {
                url: trackUrl,
                title: trackTitle,
                artist: artistName || spotifyTrack.artists?.[0]?.name || 'Unknown Artist'
              };
            }
          }
      } catch (error) {
        continue;
      }
    }
    
    return null;
  };

  // Helper function to process tracks and find Spotify URLs
  const processTracksForSpotify = async (releaseDetails, tracks, spotifyAccessToken, maxTracks = 200, startIndex = 0, onTrackFound = null) => {
    if (!releaseDetails.media || releaseDetails.media.length === 0 || !tracks || tracks.length === 0 || !spotifyAccessToken) {
      return [];
    }
    
    const foundTracks = [];
    const tracksToTry = tracks.length > maxTracks 
      ? (console.warn(`⚠️ Soundtrack has ${tracks.length} tracks, processing first ${maxTracks}`), tracks.slice(0, maxTracks))
      : tracks;
    console.log(`🎵 Processing ${tracksToTry.length - startIndex} tracks from soundtrack (starting from index ${startIndex})`);
    
    for (let i = startIndex; i < tracksToTry.length; i++) {
      const track = tracksToTry[i];
      if (!track.recording) continue;
      
      // Get track title - can be from track.title or track.recording.title
      const trackTitle = track.title || track.recording.title;
      // Get artist - can be from track.recording['artist-credit'] or from release artist
      let artistName = null;
      if (track.recording['artist-credit'] && track.recording['artist-credit'].length > 0) {
        artistName = track.recording['artist-credit'][0].artist?.name || 
                    track.recording['artist-credit'][0].name;
      }
      
      if (!trackTitle) {
        console.log('⚠️ Missing track title, skipping');
        continue;
      }
      
      if (!artistName) {
        // Try to get artist from release artist-credit
        if (releaseDetails['artist-credit'] && releaseDetails['artist-credit'].length > 0) {
          artistName = releaseDetails['artist-credit'][0].artist?.name || 
                      releaseDetails['artist-credit'][0].name;
        }
      }
      
      // Try text search (track + artist) - works ~90% of the time
      try {
        // Build search queries with different strategies
        const searchQueries = [];
        
        if (artistName) {
          // Try with quotes first (exact match)
          searchQueries.push(`track:"${trackTitle}" artist:"${artistName}"`);
          // Try without quotes (looser match)
          searchQueries.push(`track:${trackTitle} artist:${artistName}`);
          // Try with album name if available
          if (releaseDetails.title) {
            searchQueries.push(`track:"${trackTitle}" artist:"${artistName}" album:"${releaseDetails.title}"`);
          }
        }
        
        // Fallback: track only (if no artist)
        searchQueries.push(`track:"${trackTitle}"`);
        searchQueries.push(trackTitle);
        
        for (const searchQuery of searchQueries) {
          const spotifySearchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=1`;
          
          const spotifyResponse = await fetch(spotifySearchUrl, {
            headers: {
              'Authorization': `Bearer ${spotifyAccessToken}`
            }
          });
          
          if (spotifyResponse.ok) {
            const spotifyData = await spotifyResponse.json();
            if (spotifyData.tracks?.items?.length > 0) {
              const spotifyTrack = spotifyData.tracks.items[0];
              const spotifyTrackId = spotifyTrack.id;
              const trackUrl = `https://open.spotify.com/embed/track/${spotifyTrackId}?utm_source=generator&theme=0&view=list&t=0&autoplay=true`;
              console.log('✅ Found Spotify track via text search:', spotifyTrackId, 'using query:', searchQuery);
              foundTracks.push({
                url: trackUrl,
                title: trackTitle,
                artist: artistName || spotifyTrack.artists?.[0]?.name || 'Unknown Artist'
              });
              // Callback to update tracks in real-time
              if (onTrackFound) {
                onTrackFound([...foundTracks]);
              }
              break; // Found this track, move to next
            }
          }
        }
      } catch (error) {
        console.error('❌ Text search failed:', error);
      }
    }
    
    return foundTracks;
  };

  // Function to search for multiple Spotify tracks from a soundtrack
  // No fees: MusicBrainz is free, Spotify API has free tier
  // Processes all tracks from the soundtrack
  const searchSpotifyTracks = async (movieTitle, maxTracks = 200, onTrackFound = null, releaseDetails = null, tracks = null, spotifyAccessToken = null) => {
    console.log('🔍 Searching for soundtrack:', movieTitle);
    try {
      // First, try to find in our manual mapping (for quick access)
      const soundtrackMap = {
        'Robot Dreams': '1mea3bSkSGXuIRvnydlB5b',
        'Pulp Fiction': '2aQITvrlT8QzJZws8Z4NiO',
        'Interstellar': '3BSP2FQu8rSIeWHnKeUvm8',
        'The Dark Knight': '5fVFB9uH9rupb4GXeUeIQ9',
        'The Grand Budapest Hotel': '4V4n0z1xi9L0Q1fqj1qj1q',
      };
      
      const normalizedTitle = movieTitle.toLowerCase().trim();
      for (const [key, value] of Object.entries(soundtrackMap)) {
        if (key.toLowerCase() === normalizedTitle) {
          // Return as array for consistency
          return [`https://open.spotify.com/embed/track/${value}?utm_source=generator&theme=0&view=list&t=0&autoplay=true`];
        }
      }
      
      // If we already have the data, use it directly
      if (releaseDetails && tracks && spotifyAccessToken) {
        const processedTracks = await processTracksForSpotify(releaseDetails, tracks, spotifyAccessToken, maxTracks, 0, onTrackFound);
        return processedTracks.length > 0 ? processedTracks : null;
      }
      
      // Otherwise, fetch from MusicBrainz
      // Step 1: Search MusicBrainz for release-group (soundtrack)
      const mbHeaders = {
        'User-Agent': 'PersonalWebsite/1.0.0 (https://github.com/yourusername)',
        'Accept': 'application/json'
      };
      
      const mbSearchUrl = `https://musicbrainz.org/ws/2/release-group/?query=${encodeURIComponent(movieTitle + ' soundtrack')}&type=soundtrack&limit=5&fmt=json`;
      
      const mbSearchResponse = await fetch(mbSearchUrl, { headers: mbHeaders });
      
      if (!mbSearchResponse.ok) {
        throw new Error('MusicBrainz search failed');
      }
      
      const mbSearchData = await mbSearchResponse.json();
      console.log('📦 MusicBrainz release-groups found:', mbSearchData['release-groups']?.length || 0);
      
      if (!mbSearchData['release-groups'] || mbSearchData['release-groups'].length === 0) {
        console.log('❌ No release-groups found in MusicBrainz');
        return null;
      }
      
      // Get the first matching release-group
      const releaseGroup = mbSearchData['release-groups'][0];
      const releaseGroupId = releaseGroup.id;
      
      // Step 2: Get releases from this release-group
      const releasesUrl = `https://musicbrainz.org/ws/2/release/?release-group=${releaseGroupId}&limit=1&fmt=json&inc=recordings`;
      const releasesResponse = await fetch(releasesUrl, { headers: mbHeaders });
      
      if (!releasesResponse.ok) {
        throw new Error('Failed to fetch releases');
      }
      
      const releasesData = await releasesResponse.json();
      
      if (!releasesData.releases || releasesData.releases.length === 0) {
        return null;
      }
      
      const release = releasesData.releases[0];
      const releaseId = release.id;
      
      // Step 3: Get recordings with ISRC codes (include recordings-rels to get ISRCs)
      // Note: We need to get ISRCs from recordings, but CORS blocks direct recording requests
      // So we'll get the recording IDs and use text search instead
      const releaseDetailsUrl = `https://musicbrainz.org/ws/2/release/${releaseId}?inc=recordings&fmt=json`;
      const releaseDetailsResponse = await fetch(releaseDetailsUrl, { headers: mbHeaders });
      
      if (!releaseDetailsResponse.ok) {
        throw new Error('Failed to fetch release details');
      }
      
      const fetchedReleaseDetails = await releaseDetailsResponse.json();
      
      // Step 4: Get Spotify token
      const spotifyClientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
      const spotifyClientSecret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;
      
      let fetchedSpotifyAccessToken = null;
      if (spotifyClientId && spotifyClientSecret) {
        try {
          console.log('🎵 Getting Spotify access token...');
          // Get access token (client credentials flow)
          const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${btoa(`${spotifyClientId}:${spotifyClientSecret}`)}`
            },
            body: 'grant_type=client_credentials'
          });
          
          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            fetchedSpotifyAccessToken = tokenData.access_token;
            console.log('✅ Spotify token obtained');
          } else {
            const errorText = await tokenResponse.text();
            console.error('❌ Spotify token failed:', tokenResponse.status, errorText);
          }
        } catch (error) {
          console.error('❌ Failed to get Spotify token:', error);
        }
      } else {
        console.warn('⚠️ Spotify credentials not found in environment variables');
      }
      
      if (!fetchedSpotifyAccessToken) {
        console.log('⚠️ No Spotify access token available - cannot search Spotify');
        return null;
      }
      
      if (fetchedReleaseDetails.media && fetchedReleaseDetails.media.length > 0) {
        const fetchedTracks = fetchedReleaseDetails.media[0].tracks;
        console.log('🎵 Found tracks:', fetchedTracks?.length || 0);
        
        const processedTracks = await processTracksForSpotify(fetchedReleaseDetails, fetchedTracks, fetchedSpotifyAccessToken, maxTracks, 0, onTrackFound);
        console.log(`✅ Found ${processedTracks.length} tracks total`);
        return processedTracks.length > 0 ? processedTracks : null;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error searching MusicBrainz/Spotify:', error);
      // Fallback: return null to show search option
      return null;
    }
  };

  const handleMusicToggle = async (movieId, movieTitle) => {
    if (playingMusicId === movieId && currentTrackUrl) {
      // Close the player
      setPlayingMusicId(null);
      setCurrentTrackUrl(null);
      setCurrentMovieTitle(null);
      setIsLoadingMusic(false);
      setIsLoadingPlayer(false);
      setSoundtrackTracks([]);
      setCurrentTrackIndex(0);
      setShouldAutoPlay(false);
    } else {
      // Check cache first
      const cacheKey = `${movieId}_${movieTitle}`;
      const cachedData = soundtrackCache.current[cacheKey];
      
      // Clean expired entries periodically (every 10th access)
      if (Math.random() < 0.1) {
        cleanExpiredCache();
      }
      
      if (cachedData && !isCacheExpired(cachedData) && cachedData.tracks && cachedData.tracks.length > 0) {
        // Use cached data
        console.log('🎵 Using cached soundtrack for:', movieTitle);
        const normalizedTracks = cachedData.tracks.map(normalizeTrack);
        setPlayingMusicId(movieId);
        setCurrentMovieTitle(movieTitle);
        setIsLoadingMusic(false);
        setIsLoadingPlayer(true);
        setCurrentTrackUrl(getTrackUrl(normalizedTracks[0]));
        setSoundtrackTracks(normalizedTracks);
        setCurrentTrackIndex(0);
        setShouldAutoPlay(true);
        
        // Hide loading after iframe loads
        setTimeout(() => {
          setIsLoadingPlayer(false);
        }, 500);
        return;
      } else if (cachedData && isCacheExpired(cachedData)) {
        // Remove expired entry
        delete soundtrackCache.current[cacheKey];
      }
      
      // Search for and play tracks (not in cache)
      setPlayingMusicId(movieId);
      setCurrentMovieTitle(movieTitle);
      setIsLoadingMusic(true);
      setIsLoadingPlayer(false);
      setCurrentTrackUrl(null);
      setSoundtrackTracks([]);
      setCurrentTrackIndex(0);
      setShouldAutoPlay(true); // Enable autoplay for this track
      
      try {
        // Step 1: Get MusicBrainz data first
        const mbHeaders = {
          'User-Agent': 'PersonalWebsite/1.0.0 (https://github.com/yourusername)',
          'Accept': 'application/json'
        };
        
        const mbSearchUrl = `https://musicbrainz.org/ws/2/release-group/?query=${encodeURIComponent(movieTitle + ' soundtrack')}&type=soundtrack&limit=5&fmt=json`;
        const mbSearchResponse = await fetch(mbSearchUrl, { headers: mbHeaders });
        
        if (!mbSearchResponse.ok) {
          throw new Error('MusicBrainz search failed');
        }
        
        const mbSearchData = await mbSearchResponse.json();
        if (!mbSearchData['release-groups'] || mbSearchData['release-groups'].length === 0) {
          setCurrentTrackUrl(null);
          setIsLoadingMusic(false);
          // Cache empty result to avoid retrying
          soundtrackCache.current[cacheKey] = {
            tracks: [],
            timestamp: Date.now()
          };
          return;
        }
        
        const releaseGroupId = mbSearchData['release-groups'][0].id;
        const releasesUrl = `https://musicbrainz.org/ws/2/release/?release-group=${releaseGroupId}&limit=1&fmt=json&inc=recordings`;
        const releasesResponse = await fetch(releasesUrl, { headers: mbHeaders });
        
        if (!releasesResponse.ok) {
          throw new Error('Failed to fetch releases');
        }
        
        const releasesData = await releasesResponse.json();
        if (!releasesData.releases || releasesData.releases.length === 0) {
          setCurrentTrackUrl(null);
          setIsLoadingMusic(false);
          // Cache empty result to avoid retrying
          soundtrackCache.current[cacheKey] = {
            tracks: [],
            timestamp: Date.now()
          };
          return;
        }
        
        const releaseId = releasesData.releases[0].id;
        const releaseDetailsUrl = `https://musicbrainz.org/ws/2/release/${releaseId}?inc=recordings&fmt=json`;
        const releaseDetailsResponse = await fetch(releaseDetailsUrl, { headers: mbHeaders });
        
        if (!releaseDetailsResponse.ok) {
          throw new Error('Failed to fetch release details');
        }
        
        const releaseDetails = await releaseDetailsResponse.json();
        
        // Step 2: Get Spotify token
        const spotifyClientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
        const spotifyClientSecret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;
        
        let spotifyAccessToken = null;
        if (spotifyClientId && spotifyClientSecret) {
          const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${btoa(`${spotifyClientId}:${spotifyClientSecret}`)}`
            },
            body: 'grant_type=client_credentials'
          });
          
          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            spotifyAccessToken = tokenData.access_token;
          }
        }
        
        if (!spotifyAccessToken) {
          setCurrentTrackUrl(null);
          setIsLoadingMusic(false);
          // Cache empty result to avoid retrying
          soundtrackCache.current[cacheKey] = {
            tracks: [],
            timestamp: Date.now()
          };
          return;
        }
        
        // Step 3: Get first track quickly
        if (releaseDetails.media && releaseDetails.media.length > 0) {
          const tracks = releaseDetails.media[0].tracks;
          const firstTrackUrl = await searchFirstTrack(movieTitle, releaseDetails, tracks, spotifyAccessToken);
          
          if (firstTrackUrl) {
            const firstTrack = normalizeTrack(firstTrackUrl);
            // Play first track immediately
            setIsLoadingMusic(false);
            setIsLoadingPlayer(true);
            setCurrentTrackUrl(firstTrack.url);
            setSoundtrackTracks([firstTrack]);
            setCurrentTrackIndex(0);
            
            // Hide loading after iframe loads (give it time to render)
            setTimeout(() => {
              setIsLoadingPlayer(false);
            }, 1500);
            
            // Step 4: Continue fetching other tracks in background (skip first track)
            if (tracks.length > 1) {
              processTracksForSpotify(releaseDetails, tracks, spotifyAccessToken, 200, 1, (updatedTracks) => {
                // Prepend the first track to the updated list
                const allTracks = [firstTrack, ...updatedTracks];
                setSoundtrackTracks(allTracks);
                // Cache the complete track list
                soundtrackCache.current[cacheKey] = {
                  tracks: allTracks,
                  timestamp: Date.now()
                };
              }).catch((error) => {
                console.error('Error loading more tracks:', error);
                // Cache what we have (just the first track)
                soundtrackCache.current[cacheKey] = {
                  tracks: [firstTrack],
                  timestamp: Date.now()
                };
              });
            } else {
              // Only one track, cache it
              soundtrackCache.current[cacheKey] = {
                tracks: [firstTrack],
                timestamp: Date.now()
              };
            }
          } else {
            // Fallback: use full search
            const trackUrls = await searchSpotifyTracks(movieTitle, 200);
            if (trackUrls && trackUrls.length > 0) {
              const normalizedTracks = trackUrls.map(normalizeTrack);
              setIsLoadingMusic(false);
              setIsLoadingPlayer(true);
              setSoundtrackTracks(normalizedTracks);
              setCurrentTrackUrl(getTrackUrl(normalizedTracks[0]));
              setCurrentTrackIndex(0);
              // Cache the tracks
              soundtrackCache.current[cacheKey] = {
                tracks: normalizedTracks,
                timestamp: Date.now()
              };
              // Hide loading after iframe loads
              setTimeout(() => {
                setIsLoadingPlayer(false);
              }, 1500);
            } else {
              setCurrentTrackUrl(null);
              setIsLoadingMusic(false);
              // Cache empty result to avoid retrying
              soundtrackCache.current[cacheKey] = {
                tracks: [],
                timestamp: Date.now()
              };
            }
          }
        } else {
          setCurrentTrackUrl(null);
          setIsLoadingMusic(false);
          // Cache empty result to avoid retrying
          soundtrackCache.current[cacheKey] = {
            tracks: [],
            timestamp: Date.now()
          };
        }
      } catch (error) {
        console.error('Error loading music:', error);
        setCurrentTrackUrl(null);
        setIsLoadingMusic(false);
        setIsLoadingPlayer(false);
        // Cache empty result to avoid retrying on errors
        soundtrackCache.current[cacheKey] = {
          tracks: [],
          timestamp: Date.now()
        };
      }
    }
  };

  const handleNextTrack = () => {
    if (soundtrackTracks.length > 0 && currentTrackIndex < soundtrackTracks.length - 1) {
      setIsLoadingTrack(true);
      const nextIndex = currentTrackIndex + 1;
      setCurrentTrackIndex(nextIndex);
      setCurrentTrackUrl(getTrackUrl(soundtrackTracks[nextIndex]));
      setShouldAutoPlay(true); // Enable autoplay for next track
      // Hide loading after track loads (give it a moment for iframe to render)
      setTimeout(() => {
        setIsLoadingTrack(false);
      }, 800);
    }
  };

  const handlePreviousTrack = () => {
    if (currentTrackIndex > 0) {
      setIsLoadingTrack(true);
      const prevIndex = currentTrackIndex - 1;
      setCurrentTrackIndex(prevIndex);
      setCurrentTrackUrl(getTrackUrl(soundtrackTracks[prevIndex]));
      setShouldAutoPlay(true); // Enable autoplay for previous track
      // Hide loading after track loads
      setTimeout(() => {
        setIsLoadingTrack(false);
      }, 800);
    }
  };

  const getSpotifySearchUrl = (movieTitle) => {
    return `https://open.spotify.com/search/${encodeURIComponent(movieTitle + ' soundtrack main theme')}`;
  };

  return (
    <div id="playground">
      <div className="container">
        <h1 className="sub-title">Playground <i className="fa-solid fa-heart"></i></h1>

        {/* RetroView TV Section */}
        <section className="hobby-section">
          <h2 className="section-title">
            <FaMusic className="section-icon" />
            RetroView TV
          </h2>
          <p className="section-description">
            A retro-style movie recommendation app with vintage TV aesthetics
          </p>
          <RetroViewTV 
            onPlaySoundtrack={handleMusicToggle}
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
        </section>

        {/* Movie Recommendation Section */}
        <section className="hobby-section">
          <h2 className="section-title">
            <FaMusic className="section-icon" />
            Movie Recommendations
          </h2>
          <p className="section-description">
            Discover some of my favorite films and their beautiful soundtracks
          </p>
          
          <div className="movie-list">
            {movies.map((movie) => (
              <div key={movie.id} className="movie-card">
                <div className="movie-poster-container">
                  {movie.poster_path ? (
                    <img
                      src={`${TMDB_IMAGE_BASE_URL}${movie.poster_path}`}
                      alt={movie.title}
                      className="movie-poster"
                    />
                  ) : (
                    <div className="no-poster">No Image</div>
                  )}
                  {movie.tmdb_id && (
                    <a
                      href={`https://www.themoviedb.org/movie/${movie.tmdb_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="movie-more-btn"
                      aria-label={`View ${movie.title} on TMDb`}
                      title="View on TMDb"
                    >
                      <FaExternalLinkAlt />
                    </a>
                  )}
                </div>
                <div className="movie-info">
                  <h3>{movie.title}</h3>
                  <p className="movie-year">{movie.year}</p>
                  <p className="movie-description">{movie.description}</p>
                </div>
                <button 
                  className={`music-icon-btn movie-card-music-btn ${playingMusicId === movie.id ? 'active' : ''}`}
                  onClick={() => handleMovieClick(movie)}
                  aria-label={`Play music from ${movie.title}`}
                  title="Play soundtrack"
                >
                  <FaMusic />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* TMDb Movie Recommendation Section */}
        <section className="hobby-section tmdb-section">
          <h2 className="section-title">
            <FaSearch className="section-icon" />
            Discover Movies You'll Love
          </h2>
          <p className="section-description">
            Type a movie you like, and I'll recommend similar movies you might enjoy
          </p>

          {/* Search Form */}
          <form className="movie-search-form" onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) {
              searchMovies(searchQuery);
            }
          }}>
            <div className="search-input-container">
              <div className="search-dropdown-wrapper" ref={searchDropdownRef}>
                <input
                  type="text"
                  className={`movie-search-input ${showDropdown && searchResults.length > 0 ? 'dropdown-open' : ''}`}
                  placeholder="Enter a movie name (e.g., Pulp Fiction, The Matrix, Robot Dreams)..."
                  value={searchQuery}
                  ref={searchInputRef}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchQuery(value);
                    
                    // Clear previous timeout
                    if (searchTimeoutRef.current) {
                      clearTimeout(searchTimeoutRef.current);
                    }
                    
                    if (value.trim()) {
                      // Debounce the search
                      searchTimeoutRef.current = setTimeout(() => {
                        searchMovies(value);
                      }, 300);
                    } else {
                      setSearchResults([]);
                      setShowDropdown(false);
                    }
                  }}
                  onFocus={() => {
                    if (searchQuery.trim() && searchResults.length > 0) {
                      setShowDropdown(true);
                    }
                  }}
                />
                {isSearching && (
                  <div className="search-loading-indicator">
                    <FaSpinner className="spinning" />
                  </div>
                )}
                {searchQuery && !isSearching && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={handleClearSearch}
                    aria-label="Clear search"
                    title="Clear search"
                  >
                    <FaTimes />
                  </button>
                )}
                {showDropdown && searchResults.length > 0 && !selectedSearchMovie && (
                  <div className="search-dropdown-list">
                    {searchResults.map((movie) => (
                      <div
                        key={movie.id}
                        className="search-dropdown-item"
                        onClick={() => handleMovieSelect(movie)}
                      >
                        <div className="dropdown-movie-info">
                          <span className="dropdown-movie-title">{movie.title}</span>
                          {movie.release_date && (
                            <span className="dropdown-movie-year">
                              ({new Date(movie.release_date).getFullYear()})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <p>{error}</p>
              {TMDB_API_KEY === 'YOUR_API_KEY_HERE' && (
                <p className="api-key-hint">
                  ⚠️ Please set your TMDb API key in the .env file as REACT_APP_TMDB_API_KEY
                </p>
              )}
            </div>
          )}


          {/* Selected Movie Card */}
          {selectedSearchMovie && (
            <div className="selected-movie-section">
              <div className="selected-movie-card-wrapper">
                <div className="selected-movie-card">
                  <div className="selected-movie-poster-container">
                    {selectedSearchMovie.poster_path ? (
                      <img
                        src={`${TMDB_IMAGE_BASE_URL}${selectedSearchMovie.poster_path}`}
                        alt={selectedSearchMovie.title}
                        className="selected-movie-poster"
                      />
                    ) : (
                      <div className="no-poster">No Image</div>
                    )}
                    <a
                      href={`https://www.themoviedb.org/movie/${selectedSearchMovie.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="selected-movie-more-btn"
                      aria-label={`View ${selectedSearchMovie.title} on TMDb`}
                      title="View on TMDb"
                    >
                      <FaExternalLinkAlt />
                    </a>
                  </div>
                  <div className="selected-movie-info">
                    <h4>{selectedSearchMovie.title}</h4>
                    <p className="selected-movie-year">
                      {selectedSearchMovie.release_date ? new Date(selectedSearchMovie.release_date).getFullYear() : 'N/A'}
                    </p>
                    {selectedSearchMovie.vote_average > 0 && (
                      <p className="selected-movie-rating">
                        ⭐ {selectedSearchMovie.vote_average.toFixed(1)}/10
                      </p>
                    )}
                    {selectedSearchMovie.overview && (
                      <p className="selected-movie-overview">
                        {selectedSearchMovie.overview.length > 150 
                          ? `${selectedSearchMovie.overview.substring(0, 150)}...` 
                          : selectedSearchMovie.overview}
                      </p>
                    )}
                  </div>
                  <button
                    className={`music-icon-btn selected-movie-music-btn ${playingMusicId === selectedSearchMovie.id ? 'active' : ''}`}
                    onClick={() => handleMusicToggle(selectedSearchMovie.id, selectedSearchMovie.title)}
                    aria-label={`Play music from ${selectedSearchMovie.title}`}
                    title="Play soundtrack"
                  >
                    <FaMusic />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {isLoadingRecommendations && (
            <div className="loading-recommendations">
              <FaSpinner className="spinning" />
              <p>Finding movies you might like...</p>
            </div>
          )}

          {recommendations.length > 0 && (
            <div className="recommendations-section">
              <h3 className="recommendations-title">
                Movies you might like based on "{selectedSearchMovie?.title}"
              </h3>
              <p className="recommendations-hint">
                Click the <FaMusic /> icon on each card to play the main soundtrack
              </p>
              <div className="recommendations-grid">
                {recommendations.map((movie) => (
                  <div key={movie.id} className="recommendation-card">
                    <div className="recommendation-poster-container">
                      {movie.poster_path ? (
                        <img
                          src={`${TMDB_IMAGE_BASE_URL}${movie.poster_path}`}
                          alt={movie.title}
                          className="recommendation-poster"
                        />
                      ) : (
                        <div className="no-poster">No Image</div>
                      )}
                      <a
                        href={`https://www.themoviedb.org/movie/${movie.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="recommendation-more-btn"
                        aria-label={`View ${movie.title} on TMDb`}
                        title="View on TMDb"
                      >
                        <FaExternalLinkAlt />
                      </a>
                    </div>
                    <div className="recommendation-info">
                      <h4>{movie.title}</h4>
                      <p className="recommendation-year">
                        {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                      </p>
                      {movie.vote_average > 0 && (
                        <p className="recommendation-rating">
                          ⭐ {movie.vote_average.toFixed(1)}/10
                        </p>
                      )}
                    </div>
                    <button
                      className={`music-icon-btn recommendation-music-btn ${playingMusicId === movie.id ? 'active' : ''}`}
                      onClick={() => handleMusicToggle(movie.id, movie.title)}
                      aria-label={`Play music from ${movie.title}`}
                      title="Play soundtrack"
                    >
                      <FaMusic />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Cooking Section */}
        {/* <section className="hobby-section cooking-section">
          <h2 className="section-title">
            <FaUtensils className="section-icon" />
            My Cooking Creations
          </h2>
          <p className="section-description">
            Click on any dish to see the recipe I've created
          </p>
          
          <div className="dish-grid">
            {dishes.map((dish) => (
              <div 
                key={dish.id} 
                className={`dish-card ${selectedDish?.id === dish.id ? 'active' : ''}`}
                onClick={() => handleDishClick(dish)}
              >
                <div className="dish-image-container">
                  <img 
                    src={dish.image} 
                    alt={dish.name}
                    className="dish-image"
                  />
                  <div className="dish-overlay">
                    <h3 className="dish-name">{dish.name}</h3>
                    <p className="dish-hint">Click for recipe</p>
                  </div>
                </div>
                
                {selectedDish?.id === dish.id && (
                  <div className="recipe-panel">
                    <h4 className="recipe-title">Recipe</h4>
                    <div className="recipe-content">
                      <div className="recipe-section">
                        <h5>Ingredients:</h5>
                        <ul className="ingredients-list">
                          {selectedDish.recipe.ingredients.map((ingredient, idx) => (
                            <li key={idx}>{ingredient}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="recipe-section">
                        <h5>Instructions:</h5>
                        <ol className="instructions-list">
                          {selectedDish.recipe.instructions.map((instruction, idx) => (
                            <li key={idx}>{instruction}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section> */}
      </div>

      {/* Bottom Fixed Spotify Player */}
      {playingMusicId && currentMovieTitle && (
        <div className="spotify-bottom-player">
          {isLoadingMusic ? (
            <div className="player-loading">
              <FaSpinner className="spinning" />
              <p>Searching for soundtrack...</p>
            </div>
          ) : currentTrackUrl ? (
            <div className="player-wrapper">
              {(isLoadingPlayer || isLoadingTrack) && (
                <div className="track-loading-overlay">
                  <FaSpinner className="spinning" />
                </div>
              )}
              {shouldAutoPlay && (
                <div 
                  className="autoplay-overlay"
                  onClick={() => {
                    // Click through to the iframe's play button
                    if (spotifyIframeRef.current) {
                      const iframe = spotifyIframeRef.current;
                      
                      // Dispatch click to iframe (may not work due to CORS)
                      try {
                        iframe.contentWindow?.postMessage({
                          type: 'command',
                          command: 'play'
                        }, '*');
                      } catch (err) {
                        // Fallback: remove overlay so user can click manually
                        setShouldAutoPlay(false);
                      }
                    }
                    setShouldAutoPlay(false); // Remove overlay after attempt
                  }}
                  onMouseDown={(e) => {
                    // Also try on mousedown for better compatibility
                    e.preventDefault();
                    if (spotifyIframeRef.current) {
                      setTimeout(() => setShouldAutoPlay(false), 100);
                    }
                  }}
                />
              )}
              <iframe
                ref={spotifyIframeRef}
                src={currentTrackUrl}
                width="100%"
                height="80"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="eager"
                title={`Spotify player for ${currentMovieTitle} - Track ${currentTrackIndex + 1} of ${soundtrackTracks.length}`}
                className="spotify-compact-player"
                key={currentTrackUrl} // Force re-render when track changes
                onLoad={() => {
                  // Auto-click after iframe loads if autoplay is enabled
                  if (shouldAutoPlay && spotifyIframeRef.current) {
                    setTimeout(() => {
                      // Try to programmatically click the play button area
                      const overlay = document.querySelector('.autoplay-overlay');
                      if (overlay) {
                        const clickEvent = new MouseEvent('click', {
                          bubbles: true,
                          cancelable: true,
                          view: window
                        });
                        overlay.dispatchEvent(clickEvent);
                      }
                    }, 1000);
                  }
                }}
              ></iframe>
              {soundtrackTracks.length > 1 && (
                <div className="player-nav-group" ref={trackListRef}>
                  <button
                    className="player-nav-btn player-prev-btn"
                    onClick={handlePreviousTrack}
                    disabled={currentTrackIndex === 0}
                    aria-label="Previous track"
                    title="Previous track"
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    className="player-nav-btn player-next-btn"
                    onClick={handleNextTrack}
                    disabled={currentTrackIndex >= soundtrackTracks.length - 1}
                    aria-label="Next track"
                    title="Next track"
                  >
                    <FaChevronRight />
                  </button>
                  <button
                    className="player-nav-btn player-more-btn"
                    onClick={() => setShowTrackList(!showTrackList)}
                    aria-label="Show all tracks"
                    title="Show all tracks"
                  >
                    <FaEllipsisH />
                  </button>
                  {showTrackList && (
                    <div className="track-list-dropdown">
                      <div className="track-list-header">
                        <span>All Tracks ({soundtrackTracks.length})</span>
                      </div>
                      <div className="track-list-items">
                        {soundtrackTracks.map((track, index) => {
                          const normalizedTrack = normalizeTrack(track);
                          return (
                            <div
                              key={index}
                              className={`track-list-item ${index === currentTrackIndex ? 'active' : ''}`}
                              onClick={() => {
                                setCurrentTrackIndex(index);
                                setCurrentTrackUrl(normalizedTrack.url);
                                setIsLoadingPlayer(true);
                                setShouldAutoPlay(true);
                                setShowTrackList(false);
                                setTimeout(() => {
                                  setIsLoadingPlayer(false);
                                }, 500);
                              }}
                            >
                              <span className="track-number">{index + 1}</span>
                              <div className="track-info">
                                <span className="track-title">{normalizedTrack.title}</span>
                                <span className="track-artist">{normalizedTrack.artist}</span>
                              </div>
                              {index === currentTrackIndex && <FaMusic className="track-playing-icon" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <div className="player-track-info">
                    {currentTrackIndex + 1} / {soundtrackTracks.length}
                  </div>
                </div>
              )}
              <button 
                className="player-close-btn"
                onClick={() => {
                  setPlayingMusicId(null);
                  setCurrentTrackUrl(null);
                  setCurrentMovieTitle(null);
                  setIsLoadingMusic(false);
                  setIsLoadingPlayer(false);
                  setSoundtrackTracks([]);
                  setCurrentTrackIndex(0);
                }}
                aria-label="Close player"
                title="Close player"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="player-fallback">
              <p>Track not found. Search on Spotify:</p>
              <a
                href={getSpotifySearchUrl(currentMovieTitle)}
                target="_blank"
                rel="noopener noreferrer"
                className="spotify-search-btn"
              >
                Search "{currentMovieTitle}" on Spotify →
              </a>
              <button 
                className="player-close-btn"
                onClick={() => {
                  setPlayingMusicId(null);
                  setCurrentTrackUrl(null);
                  setCurrentMovieTitle(null);
                  setIsLoadingMusic(false);
                  setIsLoadingPlayer(false);
                }}
                aria-label="Close player"
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Playground;

