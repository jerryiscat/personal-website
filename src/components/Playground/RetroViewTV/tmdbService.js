// TMDb API service for fetching movies by genre

const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY || 'YOUR_API_KEY_HERE';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Map disc genres to TMDb genre IDs
const GENRE_MAP = {
  'Sci-Fi': 878,
  'Noir': 10402, // Film Noir
  'Western': 37,
  'Horror': 27,
  'Rom-Com': 10749, // Romance
  'Kung Fu': 28, // Action (closest match for martial arts)
};

// Fallback: search by keyword if genre ID doesn't work well
const GENRE_KEYWORDS = {
  'Sci-Fi': 'science fiction',
  'Noir': 'film noir',
  'Western': 'western',
  'Horror': 'horror',
  'Rom-Com': 'romantic comedy',
  'Kung Fu': 'martial arts',
};

/**
 * Fetch a random movie from TMDb by genre
 */
export const fetchMovieByGenre = async (genre) => {
  // Check if API key is available
  if (!TMDB_API_KEY || TMDB_API_KEY === 'YOUR_API_KEY_HERE') {
    throw new Error('TMDb API key not configured');
  }

  try {
    const genreId = GENRE_MAP[genre];
    const keyword = GENRE_KEYWORDS[genre] || genre.toLowerCase();

    // Try to get movies by genre ID first
    let movies = [];
    
    if (genreId) {
      try {
        // Get popular movies from the genre, from 1970-1999 for vintage feel
        // Try with year restriction first
        const response = await fetch(
          `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&primary_release_date.gte=1970-01-01&primary_release_date.lte=1999-12-31&sort_by=popularity.desc&vote_count.gte=20&page=1`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            movies = data.results;
          }
        }
      } catch (error) {
        console.warn('Error fetching by genre ID, trying keyword search:', error);
      }
    }

    // Fallback: search by keyword if genre ID didn't work or returned no results
    if (movies.length === 0) {
      try {
        const searchResponse = await fetch(
          `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(keyword)}&year=1970&primary_release_date.gte=1970-01-01&primary_release_date.lte=1999-12-31&page=1`
        );
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.results && searchData.results.length > 0) {
            movies = searchData.results;
          }
        }
      } catch (error) {
        console.warn('Error with keyword search:', error);
      }
    }

    // If still no results, try without year restriction
    if (movies.length === 0 && genreId) {
      try {
        const response = await fetch(
          `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&vote_count.gte=50&page=1`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            movies = data.results;
          }
        }
      } catch (error) {
        console.warn('Error fetching without year restriction:', error);
      }
    }

    if (movies.length === 0) {
      throw new Error(`No movies found for genre: ${genre}`);
    }

    // Pick a random movie from the results
    const randomMovie = movies[Math.floor(Math.random() * Math.min(movies.length, 20))];
    
    // Get detailed movie info including director and tagline
    const detailsResponse = await fetch(
      `${TMDB_BASE_URL}/movie/${randomMovie.id}?api_key=${TMDB_API_KEY}&append_to_response=credits`
    );
    
    let movieDetails = randomMovie;
    if (detailsResponse.ok) {
      const detailsData = await detailsResponse.json();
      movieDetails = { ...randomMovie, ...detailsData };
    }

    // Format the movie data to match the expected structure
    const director = movieDetails.credits?.crew?.find(person => person.job === 'Director')?.name || 'Unknown Director';
    const year = movieDetails.release_date ? new Date(movieDetails.release_date).getFullYear().toString() : 'Unknown';
    const rating = movieDetails.vote_average ? `${(movieDetails.vote_average / 2).toFixed(1)}/5` : 'N/A';
    const tagline = movieDetails.tagline || `A ${genre} classic`;
    const plot = movieDetails.overview || 'No description available.';
    const posterPath = movieDetails.poster_path 
      ? `${TMDB_IMAGE_BASE_URL}${movieDetails.poster_path}` 
      : null;

    return {
      id: movieDetails.id.toString(),
      title: movieDetails.title,
      year: year,
      director: director,
      plot: plot,
      tagline: tagline,
      rating: rating,
      genre: genre,
      posterPath: posterPath,
      tmdb_id: movieDetails.id,
    };
  } catch (error) {
    console.error('Error fetching movie from TMDb:', error);
    throw error;
  }
};

/**
 * Fetch movie poster from TMDb by title and year
 */
export const fetchMoviePoster = async (title, year) => {
  // Check if API key is available
  if (!TMDB_API_KEY || TMDB_API_KEY === 'YOUR_API_KEY_HERE') {
    return null;
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&year=${year}&language=en-US&page=1`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      // Find the best match (same year or closest)
      const match = data.results.find(
        (result) => result.release_date && new Date(result.release_date).getFullYear() === parseInt(year)
      ) || data.results[0];

      if (match.poster_path) {
        return `${TMDB_IMAGE_BASE_URL}${match.poster_path}`;
      }
    }
    return null;
  } catch (error) {
    console.error(`Error fetching poster for ${title}:`, error);
    return null;
  }
};

