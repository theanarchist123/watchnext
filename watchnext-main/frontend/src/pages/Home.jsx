import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import IFlixHero from "../components/IFlixHero";
import MovieCard from "../components/MovieCard";
import { getMovies, getMovie, getSimilarMovies, getTrending } from "../services/api";
import { ChevronRight } from "lucide-react";

const GENRES = [
  "All",
  "Action",
  "War",
  "Drama",
  "Crime",
  "Sci-Fi",
  "Thriller",
  "Adventure",
  "Comedy",
];

export default function Home() {
  const navigate = useNavigate();
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [genreFilteredMovies, setGenreFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // 1. Fetch featured movie 100 (13 Hours) matching image2.png
        const [movie100, similarRes, trendingRes, allRes] = await Promise.all([
          getMovie(100).catch(() => null),
          getSimilarMovies(100, 6).catch(() => ({ similar: [] })),
          getTrending().catch(() => ({ movies: [] })),
          getMovies({ limit: 40 }).catch(() => ({ movies: [] })),
        ]);

        const allList = allRes.movies || [];

        // Set featured movie (default to 13 Hours, or first from catalogue)
        const heroMovie = movie100 || allList.find((m) => m.movie_id === 100) || allList[0];
        setFeaturedMovie(heroMovie);

        // Curated "You Might Also Like" (1917, American Sniper, Hacksaw Ridge, etc.)
        setSimilarMovies(similarRes.similar || []);

        // Trending row
        const trendingList = trendingRes.movies && trendingRes.movies.length > 0
          ? trendingRes.movies.filter((m) => m.movie_id !== 100).slice(0, 6)
          : allList.slice(1, 7);
        setTrendingMovies(trendingList);

        // Top rated row (by Big Data Spark collaborative ratings)
        const sorted = [...allList]
          .sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0))
          .filter((m) => m.movie_id !== 100)
          .slice(0, 6);
        setTopRatedMovies(sorted);
      } catch (err) {
        console.error("Failed to load OTT home data", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleGenreClick = async (genre) => {
    setSelectedGenre(genre);
    if (genre === "All") {
      setGenreFilteredMovies([]);
      return;
    }
    try {
      const res = await getMovies({ genre, limit: 12 });
      setGenreFilteredMovies(res.movies || []);
    } catch (err) {
      console.error("Genre fetch error", err);
    }
  };

  const handlePlay = (movie) => {
    navigate(`/movie/${movie.movie_id}?autoplay=true`);
  };

  if (loading || !featuredMovie) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-sub)" }}>
        Loading WatchNext Cinema...
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* ── 1. Hero Cinematic Section (Exact image2.png replica) ── */}
      <IFlixHero
        movie={featuredMovie}
        onPlay={handlePlay}
        onOpenPhotos={() => navigate(`/movie/${featuredMovie.movie_id}`)}
      />

      {/* ── 2. Genre Pills Filter Bar (Crackle style image.png) ──── */}
      <nav className="genre-pills-bar" aria-label="Browse by Genre">
        {GENRES.map((genre) => (
          <button
            key={genre}
            className={`genre-pill-item ${selectedGenre === genre ? "genre-pill-item--active" : ""}`}
            onClick={() => handleGenreClick(genre)}
          >
            {genre}
          </button>
        ))}
      </nav>

      {/* ── 3. Genre Filtered Results (if active) ───────────────── */}
      {selectedGenre !== "All" && genreFilteredMovies.length > 0 && (
        <section className="content-section">
          <div className="content-section__header">
            <h2 className="content-section__title">{selectedGenre} Movies</h2>
            <Link to={`/explore?genre=${selectedGenre}`} className="content-section__view-all">
              <span>VIEW ALL</span>
              <ChevronRight size={14} />
            </Link>
          </div>
          <div className="movie-cards-row">
            {genreFilteredMovies.map((m) => (
              <MovieCard key={m.movie_id} movie={m} />
            ))}
          </div>
        </section>
      )}

      {/* ── 4. "You Might Also Like" (Exact image2.png replica) ─── */}
      <section className="content-section" aria-label="Similar military action movies">
        <div className="content-section__header">
          <h2 className="content-section__title">YOU MIGHT ALSO LIKE</h2>
          <Link to="/explore?genre=War" className="content-section__view-all" id="view-all-similar">
            <span>VIEW ALL</span>
            <ChevronRight size={14} />
          </Link>
        </div>
        <div className="movie-cards-row">
          {(similarMovies.length > 0 ? similarMovies : trendingMovies).map((movie) => (
            <MovieCard key={movie.movie_id} movie={movie} />
          ))}
        </div>
      </section>

      {/* ── 5. "Trending on WatchNext" Row ───────────────────────── */}
      <section className="content-section" aria-label="Trending movies">
        <div className="content-section__header">
          <h2 className="content-section__title">TRENDING ON WATCHNEXT</h2>
          <Link to="/explore?sort=popular" className="content-section__view-all">
            <span>VIEW ALL</span>
            <ChevronRight size={14} />
          </Link>
        </div>
        <div className="movie-cards-row">
          {trendingMovies.map((movie) => (
            <MovieCard key={movie.movie_id} movie={movie} />
          ))}
        </div>
      </section>

      {/* ── 6. "Top Rated by Big Data Community" Row ─────────────── */}
      <section className="content-section" aria-label="Highest rated recommendations">
        <div className="content-section__header">
          <h2 className="content-section__title">TOP RATED BY BIG DATA COMMUNITY</h2>
          <Link to="/recommendations" className="content-section__view-all">
            <span>VIEW ALL</span>
            <ChevronRight size={14} />
          </Link>
        </div>
        <div className="movie-cards-row">
          {topRatedMovies.map((movie) => (
            <MovieCard key={movie.movie_id} movie={movie} />
          ))}
        </div>
      </section>
    </div>
  );
}
