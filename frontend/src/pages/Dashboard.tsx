import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, TrendingUp, Info } from 'lucide-react';
import { movieService } from '../services/api';
import { Movie } from '../types';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../components/MovieCard';
import MovieModal from '../components/MovieModal';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);

  // Fetch trending movies on mount
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await movieService.getMovies();
        setTrendingMovies(res.data.slice(0, 10)); // Take top 10 as trending
      } catch (error) {
        console.error('Failed to fetch movies', error);
      } finally {
        setIsLoadingTrending(false);
      }
    };
    fetchTrending();
  }, []);

  // Sync internal query state with URL params
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      handleSearch(null, q);
    }
  }, [searchParams]);

  const handleSearch = async (e: React.FormEvent | null, searchVal?: string) => {
    e?.preventDefault();
    const finalQuery = searchVal || query;
    if (!finalQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await movieService.getRecommendations(finalQuery);
      setMovies(res.data);
      
      // Save this search to history
      try {
        await movieService.saveSearch(finalQuery);
      } catch (historyError) {
        console.error('Failed to save search to history:', historyError);
        // Don't fail the entire operation if history save fails
      }
      
      if (res.data.length === 0) {
        toast.error('No recommendations found for this movie');
      } else {
        toast.success(`Found ${res.data.length} recommendations!`);
      }
    } catch (error) {
      toast.error('Failed to get recommendations');
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 min-h-screen">
      {/* Hero Section */}
      <section className="relative h-64 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-end p-8 border border-white/5 bg-[#0a0a0a]">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand/20 via-transparent to-transparent opacity-60"></div>
        
        <img 
          src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=2000" 
          alt="Hero" 
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />

        <div className="relative z-20 space-y-2">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tight"
          >
            Welcome back, <span className="text-brand">{user?.name}</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 max-w-md text-sm leading-relaxed"
          >
            Ready for your next cinematic journey? Search for a movie below to see what our 
            AI cloud system recommends for you today.
          </motion.p>
        </div>
      </section>

      {/* Main Search Section */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h3 className="text-lg font-semibold tracking-tight">
             {movies.length > 0 ? (
               <>Based on your search: <span className="text-brand italic font-normal">"{query}"</span></>
             ) : (
               "Quick Discovery"
             )}
          </h3>
          
          <form onSubmit={(e) => handleSearch(e)} className="w-full md:w-auto flex-1 max-w-md flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search movie to get recommendations..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 outline-none focus:ring-1 focus:ring-brand transition-all text-sm"
              />
            </div>
            <button
               type="submit"
               disabled={isSearching}
               className="bg-brand hover:bg-brand-hover text-white px-6 py-2 rounded-full font-bold text-sm transition-all disabled:opacity-50"
            >
              FIND
            </button>
          </form>
        </div>

        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader />
            </motion.div>
          ) : movies.length > 0 ? (
            <motion.div
              key="results"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            >
              {movies.map((movie) => (
                <MovieCard key={movie.movie_id || movie.id} movie={movie} onClick={setSelectedMovie} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-12 text-center space-y-4"
            >
               <div className="w-16 h-16 bg-white/5 mx-auto rounded-full flex items-center justify-center">
                  <Info className="w-8 h-8 text-white/20" />
               </div>
               <h4 className="text-xl font-bold">No results found yet</h4>
               <p className="text-white/40 max-w-md mx-auto">
                 Search for a movie like 'Interstellar' or 'The Godfather' to see 
                 personalized recommendations instantly.
               </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Trending Section */}
      <section className="space-y-6">
        <h3 className="text-2xl font-display font-black tracking-tight flex items-center gap-3">
           <TrendingUp className="w-6 h-6 text-brand" />
           TRENDING NOW
        </h3>

        {isLoadingTrending ? (
           <Loader />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {trendingMovies.map((movie) => (
              <MovieCard key={`trending-${movie.movie_id || movie.id}`} movie={movie} onClick={setSelectedMovie} />
            ))}
          </div>
        )}
      </section>

      {/* Movie Modal */}
      <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
    </div>
  );
};

export default Dashboard;
