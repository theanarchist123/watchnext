export default function LoadingState({ count = 8, type = "card" }) {
  if (type === "card") {
    return (
      <div className="movie-grid">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton skeleton-card__poster" />
            <div className="skeleton skeleton-card__title" />
            <div className="skeleton skeleton-card__meta" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="loading-state">
      <div className="loading-state__spinner" />
      <p>Loading…</p>
    </div>
  );
}
