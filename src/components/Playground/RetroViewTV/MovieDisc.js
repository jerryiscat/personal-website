import React from 'react';
import './RetroViewTV.css';

const MovieDisc = ({ disc, onDragStart, rotation = 0 }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, disc)}
      className="movie-disc"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div className="movie-disc-visual">
        <div className="movie-disc-label" style={{ backgroundColor: disc.color }}>
          <span className="movie-disc-icon">💿</span>
        </div>
      </div>
      <div className="movie-disc-genre-label">{disc.genre}</div>
    </div>
  );
};

export default MovieDisc;

