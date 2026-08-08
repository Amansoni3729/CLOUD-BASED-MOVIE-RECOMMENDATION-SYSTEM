import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Calendar, Play, Clock, LayoutGrid } from 'lucide-react';
import { Movie } from '../types';

interface MovieModalProps {
  movie: Movie | null;
  onClose: () => void;
}

const MovieModal: React.FC<MovieModalProps> = ({ movie, onClose }) => {
  if (!movie) return null;

  const posterUrl = movie.poster_path || movie.poster || '';
  const rating = movie.vote_average || movie.rating || 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        />

        {/* Content */}
        <motion.div
          layoutId={`movie-${movie.id || movie.movie_id}`}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl glass-card overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Left: Poster */}
          <div className="w-full md:w-2/5 shrink-0 overflow-hidden">
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450?text=No+Image';
              }}
            />
          </div>

          {/* Right: Info */}
          <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-4 mb-4 text-xs font-bold text-white/40 tracking-wider uppercase">
              <span>Movie</span>
              <span className="w-1 h-1 bg-white/20 rounded-full" />
              <span>{movie.release_date.split('-')[0]}</span>
            </div>

            <h2 className="text-4xl font-display font-extrabold mb-4 leading-tight">
              {movie.title}
            </h2>

            <div className="flex flex-wrap items-center gap-6 mb-8">
              <div className="flex items-center gap-2">
                <div className="bg-brand text-white px-3 py-1 rounded-lg flex items-center gap-1.5 font-bold">
                  <Star className="w-4 h-4 fill-white" />
                  {Number(rating).toFixed(1)}
                </div>
                <span className="text-white/40 text-sm">Rating</span>
              </div>

              <div className="flex items-center gap-2 text-white/60">
                <Calendar className="w-5 h-5" />
                <span className="text-sm font-medium">{movie.release_date}</span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-brand uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Play className="w-4 h-4 fill-current" />
                  Overview
                </h4>
                <p className="text-white/80 leading-relaxed text-lg italic">
                   "{movie.overview || 'No overview available currently.'}"
                </p>
              </div>

              {movie.watch_providers && movie.watch_providers.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-brand uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Available on
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {movie.watch_providers.map((p) => (
                      <div key={p} className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-4 flex gap-4">
                 <button className="flex-1 bg-brand hover:bg-brand-hover text-white py-4 rounded-2xl font-bold transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2">
                    <Play className="w-5 h-5 fill-current" />
                    Watch Now
                 </button>
                 <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 rounded-2xl font-bold transition-all border border-white/10">
                    <Star className="w-5 h-5" />
                    Add to Watchlist
                 </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MovieModal;
