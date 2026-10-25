import { useState } from "react";
import { Search, Bell, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getMovies, getPosterUrl } from "../services/api";

export default function Topbar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (val) => {
    setQuery(val);
    if (val.trim().length > 1) {
      try {
        const data = await getMovies({ q: val, limit: 6 });
        setResults(data.movies || data || []);
        setOpen(true);
      } catch {
        setResults([]);
      }
    } else {
      setResults([]);
      setOpen(false);
    }
  };

  return (
    <header className="topbar">
      <div className="topbar__left" style={{ position: "relative" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "9999px",
            padding: "8px 16px",
            width: "100%",
          }}
        >
          <Search size={16} style={{ color: "#64748b" }} />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => query.length > 1 && setOpen(true)}
            placeholder="Search films, actors, directors, genres..."
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#fff",
              fontSize: "0.86rem",
              width: "100%",
            }}
          />
        </div>

        {open && results.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              right: 0,
              background: "#13161c",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "14px",
              padding: "8px",
              boxShadow: "0 16px 36px rgba(0, 0, 0, 0.8)",
              zIndex: 100,
            }}
          >
            {results.map((m) => (
              <div
                key={m.movie_id}
                onClick={() => {
                  setOpen(false);
                  setQuery("");
                  navigate(`/movie/${m.movie_id}`);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "8px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <img
                  src={getPosterUrl(m)}
                  alt={m.title}
                  style={{ width: "32px", height: "46px", objectFit: "cover", borderRadius: "4px" }}
                />
                <div>
                  <div style={{ color: "#fff", fontSize: "0.85rem", fontWeight: 600 }}>{m.title}</div>
                  <div style={{ color: "#64748b", fontSize: "0.72rem" }}>
                    {m.year} · {m.genres?.slice(0, 2).join(", ")} · ★ {m.avg_rating?.toFixed(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="topbar__right">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(74, 222, 128, 0.08)",
            border: "1px solid rgba(74, 222, 128, 0.2)",
            borderRadius: "9999px",
            padding: "5px 12px",
            color: "#4ade80",
            fontSize: "0.74rem",
            fontWeight: 600,
          }}
        >
          <span className="badge-status" />
          <span>Spark ALS Active</span>
        </div>

        <button
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#94a3b8",
          }}
        >
          <Bell size={16} />
        </button>
      </div>
    </header>
  );
}
