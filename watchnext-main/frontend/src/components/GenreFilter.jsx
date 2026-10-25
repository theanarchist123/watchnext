export default function GenreFilter({ selected, onChange, genres = [] }) {
  const uniqueGenres = [...new Map(
    genres
      .map((genre) => String(genre).trim())
      .filter(Boolean)
      .map((genre) => [genre.toLowerCase(), genre])
  ).values()];
  const availableGenres = ["All", ...uniqueGenres];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        overflowX: "auto",
        padding: "16px 0",
        scrollbarWidth: "none",
      }}
      role="tablist"
      aria-label="Filter by genre"
    >
      {availableGenres.map((genre) => (
        <button
          key={genre}
          type="button"
          className={`genre-pill-item ${selected === genre ? "genre-pill-item--active" : ""}`}
          onClick={() => onChange(genre)}
          role="tab"
          aria-selected={selected === genre}
        >
          {genre}
        </button>
      ))}
    </div>
  );
}
