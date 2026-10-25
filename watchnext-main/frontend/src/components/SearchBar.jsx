import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { getMovies, getPosterUrl } from "../services/api";

export default function SearchBar({ onSelect, placeholder = "Search movies by title..." }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const wrapRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await getMovies({ q: query, limit: 8 });
        if (!controller.signal.aborted) {
          setResults(data.movies || data || []);
        }
      } catch {
        if (!controller.signal.aborted) setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (movie) => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    if (onSelect) {
      onSelect(movie);
    } else {
      navigate(`/movie/${movie.movie_id}`);
    }
  };

  return (
    <div className="search-bar" ref={wrapRef}>
      <div className="search-bar__input-wrap">
        <Search size={18} className="search-bar__icon" />
        <input
          className="search-bar__input"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder={placeholder}
          aria-label="Search movies"
        />
      </div>

      {showResults && query.length > 1 && (
        <div className="search-bar__results">
          {loading ? (
            <div className="search-bar__no-results">Searching…</div>
          ) : results.length > 0 ? (
            results.map((movie) => (
              <div
                key={movie.movie_id}
                className="search-bar__result"
                onClick={() => handleSelect(movie)}
                role="option"
              >
                <div className="search-bar__result-poster">
                  <img
                    src={getPosterUrl(movie)}
                    alt=""
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                </div>
                <div className="search-bar__result-info">
                  <div className="search-bar__result-title">{movie.title}</div>
                  <div className="search-bar__result-meta">
                    {movie.year && <span>{movie.year}</span>}
                    {movie.genres && <span>{movie.genres.slice(0, 2).join(" · ")}</span>}
                    {movie.avg_rating && (
                      <span className="search-bar__result-rating">
                        ★ {movie.avg_rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="search-bar__no-results">No movies found. Try another title.</div>
          )}
        </div>
      )}
    </div>
  );
}
