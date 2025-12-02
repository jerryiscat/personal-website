export interface MovieData {
  id?: string; // Added for watch list tracking
  title: string;
  year: string;
  director: string;
  plot: string;
  tagline: string;
  genre: string;
  rating: string;
  posterBase64?: string; 
  posterPrompt?: string;
}

export interface DiscType {
  id: string;
  genre: string;
  color: string;
  icon?: string;
}

export enum TVState {
  OFF = 'OFF',
  IDLE = 'IDLE',   // On but no movie
  LOADING = 'LOADING', // Generating content
  PLAYING = 'PLAYING', // Showing content
  ERROR = 'ERROR'
}
