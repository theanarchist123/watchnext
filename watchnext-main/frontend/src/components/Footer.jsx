import { Link } from "react-router-dom";

export default function Footer() {
  const linkStyle = {
    color: "var(--text-sub)",
    fontSize: "0.82rem",
    fontWeight: 600,
  };

  return (
    <footer className="iflix-footer" role="contentinfo">
      <div>
        <Link
          to="/"
          style={{
            display: "inline-block",
            fontFamily: "Outfit, sans-serif",
            fontWeight: 900,
            fontSize: "1.2rem",
            color: "#fff",
            marginBottom: "8px",
          }}
        >
          Watch<span style={{ color: "var(--accent-orange)" }}>Next</span>
        </Link>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.8rem",
            maxWidth: "480px",
            lineHeight: 1.6,
          }}
        >
          Find your next favourite movie with personalised recommendations and
          insights into the movies people love.
        </p>
      </div>

      <nav
        aria-label="Footer navigation"
        style={{
          display: "flex",
          gap: "22px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Link to="/" style={linkStyle}>Home</Link>
        <Link to="/explore" style={linkStyle}>Explore</Link>
        <Link to="/recommendations" style={linkStyle}>For You</Link>
        <Link to="/analytics" style={linkStyle}>Analytics</Link>
      </nav>
    </footer>
  );
}
