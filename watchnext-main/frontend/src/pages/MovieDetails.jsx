import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Star, Tv } from "lucide-react";
import IFlixHero from "../components/IFlixHero";
import MovieCard from "../components/MovieCard";
import { getMovie, getSimilarMovies, submitRating } from "../services/api";

export default function MovieDetails({ activeUserId = 18 }) {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setMovie(null);
    setSimilar([]);
    setError(null);
    Promise.all([getMovie(id), getSimilarMovies(id)])
      .then(([movieData, similarData]) => {
        if (cancelled) return;
        setMovie(movieData);
        setSimilar(Array.isArray(similarData) ? similarData : similarData?.similar || []);
      })
      .catch((err) => !cancelled && setError(err?.message || "Unable to load this movie."));
    return () => { cancelled = true; };
  }, [id]);

  const handleRate = async (rating) => {
    const numericUserId = Number(activeUserId);
    if (!Number.isInteger(numericUserId) || numericUserId < 1) return;
    try {
      await submitRating(numericUserId, Number(id), rating);
      setUserRating(rating);
      setRatingSubmitted(true);
    } catch (err) {
      setError(err?.message || "Unable to save your rating.");
    }
  };

  if (error && !movie) {
    return <div className="page-container"><div className="error-state" role="alert"><h3 className="error-state__title">Something went wrong</h3><p className="error-state__text">{error}</p></div></div>;
  }
  if (!movie) return <div className="page-container"><div className="loading-state">Loading movie details...</div></div>;

  return (
    <div style={{ paddingBottom: "60px" }}>
      <div className="page-container" style={{ paddingBottom: 0 }}>
        <Link to="/explore" className="back-link"><ArrowLeft size={16} /> Back to Explore</Link>
      </div>
      <IFlixHero movie={movie} />
      <section className="content-section">
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "16px", padding: "28px 32px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "32px" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", color: "var(--text-white)", marginBottom: "8px" }}>Rate this movie</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "16px", lineHeight: 1.5 }}>Your rating helps us understand your preferences.</p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button type="button" key={star} onClick={() => handleRate(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} style={{ color: (hoverRating || userRating) >= star ? "var(--gold)" : "rgba(255,255,255,0.18)", transition: "color 0.15s ease" }} aria-label={`Rate ${star} stars`}>
                  <Star size={26} fill="currentColor" />
                </button>
              ))}
              {ratingSubmitted && <span style={{ color: "var(--emerald)", fontSize: "0.82rem", fontWeight: 700, marginLeft: "12px" }}>Rating saved</span>}
            </div>
            {error && <p className="error-state__text" role="alert">{error}</p>}
          </div>
          <div>
            <h3 style={{ fontSize: "1.1rem", color: "var(--text-white)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}><Tv size={18} color="var(--emerald)" /> Where to watch</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>Streaming availability depends on your region and can change over time. Check your preferred streaming service for current availability.</p>
          </div>
        </div>
      </section>
      {similar.length > 0 && (
        <section className="content-section">
          <div className="content-section__header"><h2 className="content-section__title">YOU MIGHT ALSO LIKE</h2><Link to="/explore" className="content-section__view-all"><span>EXPLORE ALL</span></Link></div>
          <div className="movie-cards-row">{similar.map((similarMovie, index) => <MovieCard key={similarMovie.movie_id ?? similarMovie.id ?? `${similarMovie.title || "similar"}-${index}`} movie={similarMovie} />)}</div>
        </section>
      )}
    </div>
  );
}
