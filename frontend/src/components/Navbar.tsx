import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, LogOut, User, Film, History, Star, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { movieService } from '../services/api';
import { Movie } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length > 1) {
        try {
          const res = await movieService.getMovies();
          // Filter logic for suggestions if backend doesn't have a specific endpoint
          const filtered = res.data.filter((m: Movie) => 
            m.title.toLowerCase().includes(searchQuery.toLowerCase())
          ).slice(0, 5);
          setSuggestions(filtered);
          setShowSuggestions(true);
        } catch (error) {
          console.error(error);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/dashboard?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Film },
    { name: 'Personalized', path: '/personalized', icon: Star },
    { name: 'History', path: '/history', icon: History },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface-dark/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-1 shrink-0">
          <div className="text-2xl font-black tracking-tighter text-brand flex items-center">
            CLOUD<span className="text-white">RECS</span>
          </div>
        </Link>

        {/* Search Bar - only if authenticated */}
        {isAuthenticated && (
          <div className="relative flex-1 max-w-sm hidden md:block group" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand transition-colors" />
              <input
                type="text"
                placeholder="Search movie to get recommendations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-sm outline-none focus:ring-1 focus:ring-brand transition-all"
              />
            </form>

            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-2 w-full glass-card overflow-hidden shadow-2xl"
                >
                  {suggestions.map((movie) => (
                    <button
                      key={movie.movie_id || movie.id}
                      onClick={() => {
                        setSearchQuery(movie.title);
                        setShowSuggestions(false);
                        navigate(`/dashboard?q=${encodeURIComponent(movie.title)}`);
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-left"
                    >
                      <img 
                        src={movie.poster_path} 
                        alt={movie.title} 
                        className="w-8 h-12 object-cover rounded bg-white/5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{movie.title}</p>
                        <p className="text-xs text-white/40">{movie.release_date.split('-')[0]}</p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Desktop Profile / Logout */}
        {isAuthenticated ? (
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-xs font-bold text-gray-400">Welcome, {user?.name.split(' ')[0]}</div>
              <div className="w-8 h-8 rounded-md bg-brand flex items-center justify-center font-bold text-xs text-white shadow-lg shadow-brand/40">
                {user?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-brand uppercase tracking-widest transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium hover:text-brand transition-colors">Login</Link>
            <Link to="/register" className="bg-brand hover:bg-brand-hover px-4 py-2 rounded-full text-sm font-bold transition-all transform hover:scale-105">Get Started</Link>
          </div>
        )}

        {/* Mobile Menu Toggle */}
        {isAuthenticated && (
          <button 
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 top-16 bg-surface-dark z-50 lg:hidden"
          >
            <div className="p-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <link.icon className="w-6 h-6 text-brand" />
                  <span className="text-lg font-medium">{link.name}</span>
                </Link>
              ))}
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-brand"
              >
                <LogOut className="w-6 h-6" />
                <span className="text-lg font-medium">Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
