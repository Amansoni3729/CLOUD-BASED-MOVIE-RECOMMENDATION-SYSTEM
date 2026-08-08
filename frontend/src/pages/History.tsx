import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { History as HistoryIcon, Clock, Trash2, ArrowRight } from 'lucide-react';
import { movieService } from '../services/api';
import { Movie } from '../types';
import MovieCard from '../components/MovieCard';
import MovieModal from '../components/MovieModal';
import Loader from '../components/Loader';
import { Link } from 'react-router-dom';

const History: React.FC = () => {
  const [history, setHistory] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await movieService.getHistory();
        setHistory(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-brand">
             <HistoryIcon className="w-5 h-5" />
             <span className="text-xs font-black uppercase tracking-[0.3em]">Watch Vault</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black tracking-tighter">YOUR HISTORY</h1>
          <p className="text-white/60 max-w-lg font-medium">
             Rediscover the films you've searched and explored recently.
          </p>
        </div>
        
        {history.length > 0 && (
          <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl text-sm font-bold transition-all text-white/60 hover:text-white">
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        )}
      </section>

      {isLoading ? (
        <Loader />
      ) : history.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {history.map((movie) => (
             <div key={`hist-${movie.movie_id || movie.id}`} className="relative">
                <div className="absolute top-4 right-4 z-20">
                   <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Viewed
                   </div>
                </div>
                <MovieCard movie={movie} onClick={setSelectedMovie} />
             </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-20 text-center space-y-6">
           <div className="w-20 h-20 bg-white/5 mx-auto rounded-full flex items-center justify-center">
              <HistoryIcon className="w-10 h-10 text-white/20" />
           </div>
           <div>
              <h3 className="text-2xl font-bold mb-2">No history yet</h3>
              <p className="text-white/40 max-w-md mx-auto mb-8">
                Your search history is empty. Start exploring the cinematic world to 
                keep track of your favorites.
              </p>
              <Link to="/dashboard" className="bg-brand hover:bg-brand-hover px-10 py-4 rounded-2xl font-bold inline-flex items-center gap-2 transition-all">
                Search Movies
                <ArrowRight className="w-5 h-5" />
              </Link>
           </div>
        </div>
      )}

      <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
    </div>
  );
};

export default History;
