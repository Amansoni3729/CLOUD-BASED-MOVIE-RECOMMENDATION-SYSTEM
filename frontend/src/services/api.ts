import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('movie_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const movieService = {
  register: (data: any) => api.post('/register', data),
  login: (data: any) => api.post('/login', data),
  getProfile: () => api.get('/profile'),
  getMovies: () => api.get('/movies'),
  getRecommendations: (movieName: string) => api.get(`/recommend/${encodeURIComponent(movieName)}`),
  getMovieById: (id: string) => api.get(`/movie/${id}`),
  saveSearch: (movieName: string) => api.post('/search', { movie: movieName }),
  getHistory: () => api.get('/history'),
  getPersonalized: () => api.get('/personalized'),
};

export default api;
