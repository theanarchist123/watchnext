import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  BellOff,
  Plus,
  Check,
  Star,
  Award,
  Camera,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import { getBackdropUrl } from "../services/api";

export default function IFlixHero({ movie, onOpenPhotos }) {
  const [reminded, setReminded] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Stills Slideshow state
  const [slideIdx, setSlideIdx] = useState(0);

  // Lightbox Modal state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  if (!movie) return null;

  const backdropUrl = getBackdropUrl(movie);
  const mpaa = movie.mpaa_rating || "R-RATED";
  const genres = movie.genres || ["ACTION", "DRAMA", "THRILLER"];

  // Real stills from TMDB
  const stills =
    movie.stills && movie.stills.length > 0
      ? movie.stills
      : [
          backdropUrl,
          "https://image.tmdb.org/t/p/w780/fZlAxZMo6BId1SiqyjLmkd7oUB7.jpg",
        ];

  const photosCount = movie.photos_count || stills.length * 3 || 24;

  const nextSlide = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      setSlideIdx((prev) => (prev + 1) % stills.length);
    },
    [stills.length]
  );

  const prevSlide = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      setSlideIdx((prev) => (prev - 1 + stills.length) % stills.length);
    },
    [stills.length]
  );

  // Auto-advance slideshow every 5 seconds
  useEffect(() => {
    if (lightboxOpen || stills.length <= 1) return;
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % stills.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [lightboxOpen, stills.length]);

  // Lightbox navigation
  const openLightbox = (index = 0) => {
    setLightboxIdx(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextLightbox = useCallback(() => {
    setLightboxIdx((prev) => (prev + 1) % stills.length);
  }, [stills.length]);

  const prevLightbox = useCallback(() => {
    setLightboxIdx((prev) => (prev - 1 + stills.length) % stills.length);
  }, [stills.length]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextLightbox();
      if (e.key === "ArrowLeft") prevLightbox();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, nextLightbox, prevLightbox]);

  const handleRemindClick = () => {
    const newState = !reminded;
    setReminded(newState);
    setToastMessage(
      newState
        ? `🔔 Reminder set! WatchNext will notify you when new streams drop for ${movie.title}.`
        : `Reminder cancelled for ${movie.title}.`
    );
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handleWatchlistClick = () => {
    const newState = !inWatchlist;
    setInWatchlist(newState);
    setToastMessage(
      newState
        ? `✓ Added ${movie.title} to your Watchlist.`
        : `Removed ${movie.title} from Watchlist.`
    );
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const castMembers =
    movie.cast && movie.cast.length > 0 ? movie.cast.slice(0, 3) : [];

  const peekingStill = stills[(slideIdx + 1) % stills.length];
  const secondStill = stills.length > 1 ? stills[1] : stills[0];

  return (
    <>
      <section
        className="iflix-hero"
        style={{
          backgroundImage: `url(${backdropUrl})`,
        }}
        aria-label="Featured Movie Preview"
      >
        <div className="iflix-hero__vignette-left" />
        <div className="iflix-hero__vignette-bottom" />

        <div className="iflix-hero__inner">
          {/* ── Left Column: Metadata, CTAs, Description & Cast ── */}
          <div className="iflix-hero__left">
            {/* Title */}
            <h1 className="iflix-hero__title">{movie.title}</h1>

            {/* MPAA Rating & Genre Tags */}
            <div className="iflix-hero__tags">
              <span className="badge-mpaa">{mpaa}</span>
              <div className="genre-tags-list">
                {genres.map((g, idx) => (
                  <span key={idx} className="genre-tag-item">
                    {typeof g === "string" ? g.toUpperCase() : g}
                  </span>
                ))}
              </div>
            </div>

            {/* Action CTA Buttons (REMIND ME with Bell Icon + ADD TO WATCHLIST) */}
            <div className="iflix-hero__actions">
              <button
                className={`btn-remind-me ${reminded ? "btn-remind-me--active" : ""}`}
                onClick={handleRemindClick}
                id="hero-remind-btn"
                aria-label={reminded ? "Cancel reminder" : "Set reminder"}
              >
                {reminded ? (
                  <>
                    <BellOff size={17} />
                    <span>REMINDER SET ✓</span>
                  </>
                ) : (
                  <>
                    <Bell size={17} fill="#000" />
                    <span>REMIND ME</span>
                  </>
                )}
              </button>

              <button
                className="btn-watchlist"
                onClick={handleWatchlistClick}
                id="hero-watchlist-btn"
              >
                {inWatchlist ? (
                  <>
                    <Check size={16} color="#4ade80" />
                    <span>IN WATCHLIST</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>ADD TO WATCHLIST</span>
                  </>
                )}
              </button>
            </div>

            {/* Lower Details: Description & Top Cast */}
            <div className="iflix-hero__details-grid">
              {/* Description Column */}
              <div className="details-col">
                <div className="details-kicker">DESCRIPTION</div>
                <p className="synopsis-text">
                  {movie.description ||
                    "An American Ambassador is killed during an attack at a U.S. compound in Libya as a security team struggles to make sense out of the chaos."}
                </p>

                {movie.director && (
                  <div className="director-row">
                    <img
                      src={
                        movie.director.avatar ||
                        "https://image.tmdb.org/t/p/w200/8I9H9IKROECFEn7usvyChbRMhbI.jpg"
                      }
                      alt={movie.director.name}
                      className="director-avatar"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80";
                      }}
                    />
                    <div>
                      <div className="director-name">{movie.director.name}</div>
                      <div className="director-role">
                        {movie.director.role || "Director"}
                      </div>
                    </div>
                  </div>
                )}

                <div className="reviews-stats-row">
                  <div className="review-stat-item">
                    <div className="stars-rating">★★★★</div>
                    <div className="review-count-label">
                      {movie.user_reviews || "6.5K User Reviews"}
                    </div>
                  </div>
                  <div className="review-stat-item">
                    <div className="stars-rating">★★★★</div>
                    <div className="review-count-label">
                      {movie.critic_reviews || "383 Critic Reviews"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Cast Column */}
              <div className="details-col">
                <div className="details-kicker">TOP CAST</div>
                <div className="cast-list">
                  {castMembers.map((actor, idx) => (
                    <div key={idx} className="cast-row-item">
                      <div className="cast-row-left">
                        <img
                          src={
                            actor.avatar ||
                            "https://image.tmdb.org/t/p/w200/pmVGDb6Yl6OyFcHVGbu1EYNfyFK.jpg"
                          }
                          alt={actor.name}
                          className="cast-avatar"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80";
                          }}
                        />
                        <div>
                          <div className="cast-actor-name">{actor.name}</div>
                          <div className="cast-character-role">
                            {actor.role || "Lead Role"}
                          </div>
                        </div>
                      </div>
                      <div className="cast-badge-icon">
                        {actor.badge || "🏆"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column: Stills Slideshow & Photo Gallery ── */}
          <div className="iflix-hero__right">
            {/* Row 1: Interactive Movie Stills Slideshow with Peeking Next Slide */}
            <div className="stills-slideshow-wrap">
              <button
                className="stills-nav-arrow stills-nav-arrow--prev"
                onClick={prevSlide}
                aria-label="Previous still photo"
              >
                <ChevronLeft size={18} />
              </button>

              <div
                className="stills-slideshow-card"
                onClick={() => openLightbox(slideIdx)}
                title="Click to view full-resolution photo"
              >
                <img
                  src={stills[slideIdx]}
                  alt={`${movie.title} production still ${slideIdx + 1}`}
                />

                {/* Dots indicator */}
                {stills.length > 1 && (
                  <div className="stills-dots-bar">
                    {stills.map((_, i) => (
                      <span
                        key={i}
                        className={`stills-dot ${i === slideIdx ? "stills-dot--active" : ""}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Peeking preview card on right (exact image2.png replica) */}
              <div className="stills-peeking-preview">
                <img
                  src={peekingStill}
                  alt={`${movie.title} next still preview`}
                />
              </div>

              <button
                className="stills-nav-arrow stills-nav-arrow--next"
                onClick={nextSlide}
                aria-label="Next still photo"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Row 2: Secondary Still with '24 PHOTOS ➔' Badge */}
            <div
              className="scene-still-card"
              onClick={() => openLightbox(1)}
              title="Click to open 24 Photos Gallery"
            >
              <img
                src={secondStill}
                alt={`${movie.title} action scene still`}
              />
              <div className="photos-badge">
                <Camera size={15} />
                <span>{photosCount} PHOTOS</span>
                <ChevronRight size={15} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Toast Notification ────────────────────────────────── */}
      {showToast && (
        <div className="toast-notification" role="status">
          <Bell size={18} color="var(--gold)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Fullscreen Lightbox Photo Gallery Modal ───────────── */}
      {lightboxOpen && (
        <div
          className="lightbox-backdrop"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
        >
          {/* Lightbox Header */}
          <div className="lightbox-topbar" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-title-box">
              <span className="lightbox-title">{movie.title} — Photos</span>
              <span className="lightbox-counter-badge">
                Photo {lightboxIdx + 1} of {stills.length}
              </span>
            </div>
            <button
              className="lightbox-close-btn"
              onClick={closeLightbox}
              aria-label="Close photo gallery"
            >
              <X size={20} />
            </button>
          </div>

          {/* Lightbox Main Stage */}
          <div
            className="lightbox-viewport"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="lightbox-arrow-btn lightbox-arrow-btn--prev"
              onClick={prevLightbox}
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>

            <img
              src={stills[lightboxIdx]}
              alt={`${movie.title} high resolution photo ${lightboxIdx + 1}`}
              className="lightbox-image"
            />

            <button
              className="lightbox-arrow-btn lightbox-arrow-btn--next"
              onClick={nextLightbox}
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Lightbox Thumbnails Strip */}
          <div
            className="lightbox-thumbstrip"
            onClick={(e) => e.stopPropagation()}
          >
            {stills.map((still, idx) => (
              <div
                key={idx}
                className={`lightbox-thumb-item ${idx === lightboxIdx ? "lightbox-thumb-item--active" : ""}`}
                onClick={() => setLightboxIdx(idx)}
              >
                <img src={still} alt={`Thumbnail ${idx + 1}`} />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
