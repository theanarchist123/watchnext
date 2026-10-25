import { useState, useEffect, useCallback } from "react";
import SearchBar from "../components/SearchBar";
import GenreFilter from "../components/GenreFilter";
import MovieGrid from "../components/MovieGrid";
import { getGenres, getMovies } from "../services/api";

const SORT_OPTIONS = [
  { value: "rating", label: "Sort: Highest Rated" },
  { value: "popular", label: "Sort: Most Rated" },
  { value: "year", label: "Sort: Newest" },
  { value: "title", label: "Sort: A → Z" },
];

export default function Explore() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [genre, setGenre] = useState("All");
  const [sort, setSort] = useState("rating");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [availableGenres, setAvailableGenres] = useState([]);
  const limit = 24;

  useEffect(() => {
    getGenres()
      .then((data) => {
        setAvailableGenres(Array.isArray(data.genres) ? data.genres : []);
      })
      .catch(() => setAvailableGenres([]));
  }, []);

  const fetchMovies = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);
      const newOffset = reset ? 0 : offset;
      const params = { sort, limit, offset: newOffset };
      if (genre !== "All") params.genre = genre;
      const data = await getMovies(params);
      const list = data.movies || data || [];
      if (reset) {
        setMovies(list);
        setOffset(list.length);
      } else {
        setMovies((prev) => [...prev, ...list]);
        setOffset((prev) => prev + list.length);
      }
      setHasMore(list.length >= limit);
    } catch (err) {
      setError(err.message || "Failed to load movies");
    } finally {
      setLoading(false);
    }
  }, [genre, sort, offset]);

  // Reset on filter/sort change
  useEffect(() => {
    setOffset(0);
    setMovies([]);
    setHasMore(true);
  }, [genre, sort]);

  // Fetch on offset/filter change
  useEffect(() => {
    if (offset === 0) {
      fetchMovies(true);
    }
  }, [genre, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="subpage-container">
      <div className="subpage-header">
        <h1 className="subpage-title">
          {genre === "All" ? "Explore Films" : `${genre} Movies`}
        </h1>
        <p className="subpage-subtitle">
          Discover titles from the MovieLens 20M catalogue.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          marginBottom: "16px",
          flexWrap: "wrap",
        }}
      >
        <SearchBar placeholder="Search movies by title..." />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{
            background: "var(--bg-card)",
            color: "var(--text-light)",
            border: "1px solid var(--border-medium)",
            borderRadius: "8px",
            padding: "9px 16px",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
            outline: "none",
          }}
          aria-label="Sort movies"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <GenreFilter selected={genre} onChange={setGenre} genres={availableGenres} />

      <MovieGrid
        movies={movies}
        loading={loading && movies.length === 0}
        error={error}
      />

      {hasMore && movies.length > 0 && !loading && (
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <button
            className="btn-watchlist"
            onClick={() => fetchMovies(false)}
            style={{ padding: "12px 32px" }}
          >
            Load More Movies
          </button>
        </div>
      )}

      {loading && movies.length > 0 && (
        <div style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>
          Loading more cinema titles...
        </div>
      )}
    </div>
  );
}
