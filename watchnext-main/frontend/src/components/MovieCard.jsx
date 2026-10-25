import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPosterUrl, getTitlePosterUrl } from "../services/api";

export default function MovieCard({ movie, showPredicted = false }) {
  const navigate = useNavigate();
  const movieId = movie?.movie_id ?? movie?.id;
  const title = movie?.title || "Untitled movie";
  const posterUrl = useMemo(() => getPosterUrl(movie), [movie]);
  const hasVerifiedPoster = Boolean(movie?.poster_path || movie?.poster_url);
  const [resolvedPosterUrl, setResolvedPosterUrl] = useState(
    hasVerifiedPoster ? posterUrl : getTitlePosterUrl(movie)
  );
  const releaseYear = movie?.year || (title.match(/\((\d{4})\)/) || [])[1] || "—";
  const genres = Array.isArray(movie?.genres)
    ? movie.genres
    : typeof movie?.genres === "string"
      ? movie.genres.split("|").map((genre) => genre.trim()).filter(Boolean)
      : [];
  const genreName = genres[0] || "Film";
  const hasPrediction = Number.isFinite(Number(movie?.predicted_rating));
  const predictedRating = Number(movie?.predicted_rating);
  const handleOpen = () => movieId != null && navigate(`/movie/${movieId}`);

  useEffect(() => {
    setResolvedPosterUrl(hasVerifiedPoster ? posterUrl : getTitlePosterUrl(movie));
  }, [movie, posterUrl, hasVerifiedPoster]);

  return (
    <article
      className="movie-poster-card"
      onClick={handleOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleOpen();
        }
      }}
      tabIndex={movieId != null ? 0 : -1}
      role="button"
      aria-label={`View details for ${title}`}
    >
      <div className="movie-poster-card__image-box">
        <img
          src={resolvedPosterUrl}
          alt={`${title} poster`}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = getTitlePosterUrl(movie);
          }}
        />
        <div className="movie-poster-card__match-badge">
          {showPredicted && hasPrediction
            ? `Predicted: ${predictedRating.toFixed(2)} ★`
            : Number.isFinite(Number(movie?.avg_rating))
              ? `Community: ${Number(movie.avg_rating).toFixed(1)}/5`
              : "Recommendation"}
        </div>
      </div>
      <div className="movie-poster-card__info">
        <h4 className="movie-poster-card__title" title={title}>{title}</h4>
        <div className="movie-poster-card__meta">
          <span>{releaseYear}</span><span aria-hidden="true">•</span><span>{genreName}</span>
          {movie?.rank != null && <><span aria-hidden="true">•</span><span style={{ color: "var(--accent-orange)", fontWeight: 700 }}>Rank #{movie.rank}</span></>}
          {showPredicted && hasPrediction && <><span aria-hidden="true">•</span><span style={{ display: "inline-flex", alignItems: "center", gap: "2px", color: "var(--gold)" }}><Star size={11} fill="#f5c518" strokeWidth={0} />{predictedRating.toFixed(2)} pred</span></>}
          {!showPredicted && Number.isFinite(Number(movie?.avg_rating)) && <><span aria-hidden="true">•</span><span style={{ display: "inline-flex", alignItems: "center", gap: "2px", color: "var(--gold)" }}><Star size={11} fill="#f5c518" strokeWidth={0} />{Number(movie.avg_rating).toFixed(1)}</span></>}
        </div>
      </div>
    </article>
  );
}
