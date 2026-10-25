import { useState } from "react";
import { Play, Plus, TrendingUp, Flame } from "lucide-react";
import { getPosterUrl } from "../services/api";

export default function MovieDetailPanel({ movie }) {
  const [inWatchlist, setInWatchlist] = useState(false);

  if (!movie) return null;

  const posterUrl = getPosterUrl(movie);

  // Default cast if not provided by movie
  const castList = movie.cast && movie.cast.length > 0
    ? movie.cast
    : [
        {
          name: movie.director?.name || "Denis Villeneuve",
          role: "Director",
          avatar: movie.director?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        },
        {
          name: "Timothée Chalamet",
          role: "As Paul Atreide",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
        },
        {
          name: "Zendaya Coleman",
          role: "As Ginny Keynes",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        },
      ];

  const flameScore = movie.flame_score || Math.floor((movie.avg_rating || 4.2) * 1100);
  const runtime = movie.runtime || "135 min";
  const releaseDate = movie.release_date || `${movie.year || 2024}-03-01`;
  const status = movie.status || "Now Showing";
  const liveBoxOffice = movie.live_box_office || "$2,261";
  const boxOfficeGrowth = movie.box_office_growth || "+1.51%";
  const screeningShare = movie.screening_share || "30.12%";
  const shareGrowth = movie.share_growth || "+2.01%";

  // Attendance points for smooth SVG spline curve
  const attendancePoints = [
    { day: "Mon", val: 82 },
    { day: "Tue", val: 55 },
    { day: "Wed", val: 78 },
    { day: "Thu", val: 70 },
    { day: "Fri", val: 89 },
    { day: "Sat", val: 96 },
    { day: "Sun", val: 94 },
  ];

  return (
    <div className="details-panel-container">
      <div className="details-panel-heading">
        <span>Movie Details</span>
      </div>

      <div className="details-panel">
        {/* Left Column: Big Poster */}
        <div className="details-panel__poster">
          <img
            src={posterUrl}
            alt={movie.title}
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80";
            }}
          />
        </div>

        {/* Center Column: Title, Pills, Description, Cast */}
        <div className="details-panel__center">
          <div className="details-panel__title-row">
            <h2 className="details-panel__title">{movie.title}</h2>
            <div className="details-panel__flame-score">
              <span>🔥</span>
              <span>{flameScore.toLocaleString()}</span>
            </div>
          </div>

          <div className="details-panel__pills">
            {(movie.genres || ["Sci-Fi", "Drama"]).slice(0, 2).map((g) => (
              <span key={g} className="pill pill--genre">
                {g}
              </span>
            ))}
            <span className="pill pill--outline">{runtime}</span>
            <span className="pill pill--outline">{releaseDate}</span>
            <span className="pill pill--outline" style={{ color: "#4ade80" }}>
              {status}
            </span>
          </div>

          <p className="details-panel__synopsis">
            {movie.description ||
              "The sequel continues Paul Atreides' journey on the desert planet Arrakis. Now allied with the Fremen, he seeks revenge against the Harkonnens while grappling with his foretold destiny as the messiah. As war erupts over the galaxy's most valuable resource, the 'spice', Paul must choose between love and cosmic power—with terrifying consequences."}
          </p>

          {/* Cast & Crew Avatars */}
          <div className="details-panel__cast">
            {castList.slice(0, 3).map((person, idx) => (
              <div key={idx} className="cast-member">
                <img
                  src={person.avatar}
                  alt={person.name}
                  className="cast-member__avatar"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80";
                  }}
                />
                <div className="cast-member__info">
                  <span className="cast-member__name">{person.name}</span>
                  <span className="cast-member__role">{person.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Actions, Metrics, Attendance Chart */}
        <div className="details-panel__right">
          <div className="details-panel__actions">
            <button className="btn-pill btn-pill--mint">
              <Play size={14} fill="currentColor" />
              <span>Watch Now</span>
            </button>
            <button
              className="btn-pill btn-pill--coral"
              onClick={() => setInWatchlist(!inWatchlist)}
            >
              <span>{inWatchlist ? "Saved ✓" : "Watchlist"}</span>
            </button>
          </div>

          <div className="details-panel__metrics-grid">
            <div className="metric-box">
              <div className="metric-box__label">Live Box Office</div>
              <div className="metric-box__value">{liveBoxOffice}</div>
              <div className="metric-box__growth">
                <TrendingUp size={11} /> {boxOfficeGrowth}
              </div>
              <span className="metric-box__subtext"> vs. yesterday</span>
            </div>

            <div className="metric-box">
              <div className="metric-box__label">Screening Share</div>
              <div className="metric-box__value">{screeningShare}</div>
              <div className="metric-box__growth">
                <TrendingUp size={11} /> {shareGrowth}
              </div>
              <span className="metric-box__subtext"> vs. yesterday</span>
            </div>
          </div>

          {/* Attendance Rate Smooth Spline Chart */}
          <div className="attendance-chart-area">
            <div className="attendance-chart-header">
              <span className="attendance-chart-title">Attendance Rate</span>
            </div>

            <div className="attendance-svg-wrap">
              <svg
                viewBox="0 0 300 75"
                style={{ width: "100%", height: "100%", overflow: "visible" }}
              >
                <defs>
                  <linearGradient id="mintGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ade80" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="25" y1="10" x2="295" y2="10" stroke="rgba(255,255,255,0.04)" />
                <line x1="25" y1="35" x2="295" y2="35" stroke="rgba(255,255,255,0.04)" />
                <line x1="25" y1="60" x2="295" y2="60" stroke="rgba(255,255,255,0.04)" />

                {/* Y-axis Labels */}
                <text x="0" y="14" fill="#64748b" fontSize="8">100%</text>
                <text x="0" y="39" fill="#64748b" fontSize="8">60%</text>
                <text x="10" y="64" fill="#64748b" fontSize="8">0</text>

                {/* Area Gradient */}
                <path
                  d="M 35 22 C 70 55, 95 62, 120 28 C 145 35, 170 42, 195 24 C 220 18, 250 8, 285 10 L 285 65 L 35 65 Z"
                  fill="url(#mintGrad)"
                />

                {/* Spline Path */}
                <path
                  d="M 35 22 C 70 55, 95 62, 120 28 C 145 35, 170 42, 195 24 C 220 18, 250 8, 285 10"
                  fill="none"
                  stroke="#4ade80"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* X-axis Day Labels */}
                <text x="32" y="74" fill="#64748b" fontSize="7.5">Mon</text>
                <text x="73" y="74" fill="#64748b" fontSize="7.5">Tue</text>
                <text x="114" y="74" fill="#64748b" fontSize="7.5">Wed</text>
                <text x="156" y="74" fill="#64748b" fontSize="7.5">Thu</text>
                <text x="198" y="74" fill="#64748b" fontSize="7.5">Fri</text>
                <text x="240" y="74" fill="#64748b" fontSize="7.5">Sat</text>
                <text x="275" y="74" fill="#64748b" fontSize="7.5">Sun</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
