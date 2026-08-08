import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Star, Wand2, Info } from 'lucide-react';
import { movieService } from '../services/api';
import { Movie } from '../types';
import MovieCard from '../components/MovieCard';
import MovieModal from '../components/MovieModal';
import Loader from '../components/Loader';

const Personalized: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  useEffect(() => {
    const fetchPersonalized = async () => {
      try {
        const res = await movieService.getPersonalized();
        setMovies(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPersonalized();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <section className="h-[200px] rounded-3xl overflow-hidden glass-card flex flex-col justify-center p-8 md:p-12 border-l-4 border-brand">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-brand/20 rounded-2xl flex items-center justify-center text-brand">
             <Wand2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-black tracking-tight">PERSONALIZED FOR YOU</h1>
            <p className="text-white/40 text-sm font-medium uppercase tracking-widest">Driven by your watching history & preferences</p>
          </div>
        </div>
      </section>

      {isLoading ? (
        <Loader />
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <MovieCard key={`pers-${movie.movie_id || movie.id}`} movie={movie} onClick={setSelectedMovie} />
          ))}
        </div>
      ) : (
        <div className="glass-card p-20 text-center space-y-4">
           <Info className="w-12 h-12 text-white/20 mx-auto" />
           <h3 className="text-2xl font-bold">Your cinematic journey is just beginning</h3>
           <p className="text-white/40 max-w-md mx-auto">
             Start searching and exploring movies to help our AI learn your taste. 
             Recommendations will appear here soon.
           </p>
        </div>
      )}

      <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
    </div>
  );
};

export default Personalized;
