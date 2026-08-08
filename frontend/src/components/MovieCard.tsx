import React from 'react';
import { motion } from 'motion/react';
import { Star, Play, Calendar } from 'lucide-react';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick }) => {
  const posterUrl = movie.poster_path || movie.poster || '';
  const rating = movie.vote_average || movie.rating || 0;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group space-y-3 cursor-pointer"
      onClick={() => onClick(movie)}
    >
      {/* Poster Container */}
      <div className="aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-white/10 shadow-lg relative overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]">
        <img
          src={posterUrl}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450?text=No+Image';
          }}
        />
        
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-[#FFD700] text-[10px] px-2 py-1 rounded-md border border-white/10 font-bold flex items-center gap-1">
          <Star className="w-2.5 h-2.5 fill-[#FFD700]" />
          {Number(rating).toFixed(1)}
        </div>

        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-brand/90 p-4 rounded-full shadow-2xl">
            <Play className="w-8 h-8 fill-current text-white" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1">
        <h4 className="text-sm font-semibold truncate group-hover:text-brand transition-colors">
          {movie.title}
        </h4>
        <p className="text-[10px] text-gray-500 font-medium">
          {movie.release_date.split('-')[0]} • Movie
        </p>
      </div>
    </motion.div>
  );
};

export default MovieCard;
