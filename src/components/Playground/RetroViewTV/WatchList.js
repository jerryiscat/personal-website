import React from 'react';
import './RetroViewTV.css';

const WatchList = ({ movies, onSelectMovie }) => {
  if (movies.length === 0) {
    return (
      <div className="watchlist-empty">
        <div className="watchlist-empty-icon">🔍</div>
        <h3 className="watchlist-empty-title">COLLECTION EMPTY</h3>
        <p className="watchlist-empty-text">
          Go back to the Player, drag a disc to the TV, and hit the "REC" button to save movies here.
        </p>
      </div>
    );
  }

  return (
    <div className="watchlist-container">
      <div className="watchlist-grid">
        {movies.map((movie, index) => (
          <div key={movie.id || index} className="watchlist-item" onClick={() => onSelectMovie(movie)}>
            {movie.posterBase64 ? (
              <img 
                src={movie.posterBase64} 
                alt={movie.title} 
                className="watchlist-poster"
              />
            ) : (
              <div className="watchlist-poster-placeholder">
                <span className="watchlist-poster-icon">🎬</span>
                <span className="watchlist-poster-title">{movie.title}</span>
              </div>
            )}
            <div className="watchlist-item-info">
              <h4 className="watchlist-item-title">{movie.title}</h4>
              <p className="watchlist-item-year">{movie.year}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WatchList;

