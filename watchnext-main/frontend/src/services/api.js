export const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request(path) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return response.json();
}

async function post(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return response.json();
}

export const getHealth = () => request("/api/health");
export const getMovies = (params = {}) => {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.genre) query.set("genre", params.genre);
  if (params.sort) query.set("sort", params.sort);
  if (params.limit) query.set("limit", params.limit);
  if (params.offset) query.set("offset", params.offset);
  const qs = query.toString();
  return request(`/api/movies${qs ? `?${qs}` : ""}`);
};
export const getGenres = () => request("/api/genres");
export const getMovie = (movieId) => request(`/api/movies/${movieId}`);
export const getSimilarMovies = (movieId, limit = 10) =>
  request(`/api/movies/${movieId}/similar?limit=${limit}`);
export const getRecommendations = (userId) =>
  request(`/api/recommendations/${userId}`);
export const getAnalytics = () => request("/api/analytics");
export const getInterestDrop = () => request("/api/analytics/interest-drop");
export const getChurnRisk = () => request("/api/analytics/churn-risk");
export const getTrending = () => request("/api/trending");
export const getEngagement = () => request("/api/engagement");
export const submitRating = (userId, movieId, rating) =>
  post("/api/ratings", { user_id: userId, movie_id: movieId, rating });
export const submitEvent = (event) => post("/api/events", event);

// TMDB poster helper. Recommendation rows without verified metadata receive a
// stable cinema image selected and cached by the backend.
const TMDB_IMG = "https://image.tmdb.org/t/p/w500";
const TMDB_BACKDROP = "https://image.tmdb.org/t/p/w1280";
const FALLBACK_POSTERS = [
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1542206395-9feb3edaa68d?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=700&q=85&sat=-35",
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=700&q=85&sat=-35",
  "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=700&q=85&sat=-35",
];

const UNSPASH_BACKDROPS = [
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1400&q=80",
];
export function getPosterUrl(movie) {
  if (!movie) return FALLBACK_POSTERS[0];
  if (movie.poster_path) {
    return movie.poster_path.startsWith("http")
      ? movie.poster_path
      : `${TMDB_IMG}${movie.poster_path}`;
  }
  if (typeof movie.poster_url === "string" && movie.poster_url.trim()) return movie.poster_url;
  return getTitlePosterUrl(movie);
}

export function getTitlePosterUrl(movie) {
  const movieId = Number(movie?.movie_id ?? movie?.id ?? 0);
  return FALLBACK_POSTERS[Math.abs(movieId) % FALLBACK_POSTERS.length];
}

export function getPosterSearchUrl(movie) {
  const title = String(movie?.title || "movie poster").trim();
  return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(`${title} official movie poster`)}`;
}

export function getBackdropUrl(movie) {
  if (!movie) return FALLBACK_POSTERS[0];
  if (movie.backdrop_path) {
    return movie.backdrop_path.startsWith("http")
      ? movie.backdrop_path
      : `${TMDB_BACKDROP}${movie.backdrop_path}`;
  }
  if (movie.stills && movie.stills.length > 0) return movie.stills[0];
  if (movie.backdrop_url) return movie.backdrop_url;
  const index = Math.abs((movie.movie_id || 1) * 3) % UNSPASH_BACKDROPS.length;
  return UNSPASH_BACKDROPS[index];
}
