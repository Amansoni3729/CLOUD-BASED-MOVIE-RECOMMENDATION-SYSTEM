export interface User {
  id: string;
  name: string;
  email: string;
  joinedDate?: string;
  totalSearches?: number;
}

export interface Movie {
  id?: string;
  movie_id?: number | string;
  title: string;
  poster_path: string;
  poster?: string;
  vote_average: number;
  rating?: number;
  release_date: string;
  overview?: string;
  watch_providers?: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
