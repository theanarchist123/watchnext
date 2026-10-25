import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import MovieGrid from "../components/MovieGrid";
import { API_BASE, getRecommendations } from "../services/api";
import { useSearchParams } from "react-router-dom";

export default function Recommendations({ activeUserId = 18, onSelectUser }) {
  const [searchParams] = useSearchParams();
  const [userId, setUserId] = useState(Number(activeUserId) || 18);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    const incomingId = Number(activeUserId);
    if (Number.isInteger(incomingId) && incomingId > 0 && incomingId !== userId) setUserId(incomingId);
  }, [activeUserId, userId]);

  useEffect(() => {
    const queryUserId = Number(searchParams.get("user"));
    if (Number.isInteger(queryUserId) && queryUserId > 0) {
      setUserId(queryUserId);
      onSelectUser?.(queryUserId);
    }
  }, [searchParams, onSelectUser]);

  useEffect(() => {
    if (!Number.isInteger(Number(userId)) || Number(userId) < 1) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getRecommendations(Number(userId))
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : data?.recommendations;
        setRecs(Array.isArray(list) ? list : []);
        if (!Array.isArray(list) || list.length === 0) setError(`No recommendations were returned for User ID ${userId}.`);
      })
      .catch((err) => {
        if (!cancelled) {
          setRecs([]);
          setError(err?.message || `Could not load recommendations for User ID ${userId}.`);
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [userId, refreshToken]);

  return (
    <div className="page-container">
      <div className="page-header">
        <p className="kicker kicker--purple">FOR YOU</p>
        <h1>Your Recommendations</h1>
        <p>Discover movies selected for your profile.</p>
        <p style={{ fontSize: "0.8rem", marginTop: "10px" }}>
          Active MovieLens user: <strong>{userId}</strong>{" "}
          <a href={`${API_BASE}/api/recommendations/${userId}`} target="_blank" rel="noreferrer">
            View recommendation API response
          </a>
          {" · "}
          <a href={`${API_BASE}/api/health`} target="_blank" rel="noreferrer">API health</a>
        </p>
        {recs.length > 0 && (
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "8px" }}>
            Why these movies: {recs[0].reason || "Personalized recommendation from ALS collaborative filtering."}
            {" · "}
            <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer">Open FastAPI docs</a>
          </p>
        )}
      </div>
      <div className="recommendations-controls">
        <button type="button" onClick={() => setRefreshToken((token) => token + 1)} disabled={loading} aria-label="Refresh recommendations">
          <RefreshCw size={16} className={loading ? "spin" : ""} /> Refresh
        </button>
      </div>
      <MovieGrid movies={recs} loading={loading} error={error} showPredicted />
    </div>
  );
}
