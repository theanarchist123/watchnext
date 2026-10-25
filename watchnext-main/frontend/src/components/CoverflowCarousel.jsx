import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { getPosterUrl } from "../services/api";

export default function CoverflowCarousel({ movies = [], activeMovie, onSelectMovie }) {
  const [hoveredId, setHoveredId] = useState(null);

  if (!movies || movies.length === 0) return null;

  const activeIndex = movies.findIndex(
    (m) => (m.movie_id || m.id) === (activeMovie?.movie_id || activeMovie?.id)
  );

  const handlePrev = () => {
    const nextIdx = (activeIndex - 1 + movies.length) % movies.length;
    onSelectMovie(movies[nextIdx]);
  };

  const handleNext = () => {
    const nextIdx = (activeIndex + 1) % movies.length;
    onSelectMovie(movies[nextIdx]);
  };

  return (
    <section className="coverflow-section">
      <div className="coverflow-wrapper">
        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          aria-label="Previous movie"
          style={{
            position: "absolute",
            left: "8px",
            zIndex: 20,
            background: "rgba(11, 12, 16, 0.75)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#fff",
            borderRadius: "50%",
            width: "38px",
            height: "38px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(8px)",
          }}
        >
          <ChevronLeft size={20} />
        </button>

        <div className="coverflow-track">
          {movies.map((movie) => {
            const isActive =
              (movie.movie_id || movie.id) === (activeMovie?.movie_id || activeMovie?.id);

            return (
              <div
                key={movie.movie_id || movie.id}
                className={`coverflow-card ${isActive ? "coverflow-card--active" : ""}`}
                onClick={() => onSelectMovie(movie)}
                onMouseEnter={() => setHoveredId(movie.movie_id || movie.id)}
                onMouseLeave={() => setHoveredId(null)}
                role="button"
                tabIndex={0}
                aria-label={`Select ${movie.title}`}
              >
                <img
                  src={getPosterUrl(movie)}
                  alt={movie.title}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80";
                  }}
                />
              </div>
            );
          })}

          {/* Plus / Add Action Card from Image 2 */}
          <div
            className="coverflow-add-card"
            title="Add to cinema lineup"
            onClick={handleNext}
          >
            <Plus size={26} />
          </div>
        </div>

        <button
          onClick={handleNext}
          aria-label="Next movie"
          style={{
            position: "absolute",
            right: "8px",
            zIndex: 20,
            background: "rgba(11, 12, 16, 0.75)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#fff",
            borderRadius: "50%",
            width: "38px",
            height: "38px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(8px)",
          }}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}
