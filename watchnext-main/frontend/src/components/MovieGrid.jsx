import MovieCard from "./MovieCard";
import LoadingState from "./LoadingState";

export default function MovieGrid({
  movies,
  loading,
  error,
  showPredicted = false,
  large = false,
}) {
  if (loading) return <LoadingState count={12} />;

  if (error) {
    return (
      <div className="error-state" role="alert">
        <div className="error-state__icon">⚠️</div>
        <h3 className="error-state__title">Something went wrong</h3>
        <p className="error-state__text">{error}</p>
      </div>
    );
  }

  if (!Array.isArray(movies) || movies.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">🎬</div>
        <h3 className="empty-state__title">No movies found</h3>
        <p className="empty-state__text">
          Try another profile or adjust your search filters.
        </p>
      </div>
    );
  }

  // A recommendation list can contain duplicate movie IDs if upstream data is
  // malformed. Keep the first record for each ID to avoid duplicate cards.
  const uniqueMovies = [];
  const seenMovieIds = new Set();

  for (const movie of movies) {
    const id = movie?.movie_id ?? movie?.id;
    if (id == null || !seenMovieIds.has(String(id))) {
      uniqueMovies.push(movie);
      if (id != null) seenMovieIds.add(String(id));
    }
  }

  return (
    <div
      className={`movie-cards-row${large ? " movie-cards-row--large" : ""}`}
    >
      {uniqueMovies.map((movie, index) => (
        <MovieCard
          key={movie.movie_id ?? movie.id ?? `${movie.title ?? "movie"}-${index}`}
          movie={movie}
          showPredicted={showPredicted}
        />
      ))}
    </div>
  );
}
