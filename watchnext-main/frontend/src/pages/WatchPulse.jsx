import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, SkipForward, Rewind, CheckCircle, Radio } from "lucide-react";
import StatCard from "../components/StatCard";
import { getEngagement, submitEvent } from "../services/api";

const EVENT_TYPES = ["play", "pause", "skip", "seek", "complete"];
const MOVIE_TITLES = [
  "Inception", "Interstellar", "The Dark Knight", "Pulp Fiction",
  "Fight Club", "The Matrix", "Forrest Gump", "The Shawshank Redemption",
  "Parasite", "Spirited Away", "The Godfather", "Goodfellas",
  "Whiplash", "Arrival", "Dune", "Everything Everywhere All at Once",
];

function randomEvent() {
  const type = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
  const movie = MOVIE_TITLES[Math.floor(Math.random() * MOVIE_TITLES.length)];
  const userId = Math.floor(Math.random() * 100) + 1;
  return {
    event_id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    event_type: type,
    user_id: userId,
    movie_title: movie,
    watch_duration_seconds: type === "complete" ? Math.floor(Math.random() * 7200) + 600 : Math.floor(Math.random() * 3600),
    timestamp: new Date().toISOString(),
  };
}

const eventIcons = {
  play: <Play size={14} />,
  pause: <Pause size={14} />,
  skip: <SkipForward size={14} />,
  seek: <Rewind size={14} />,
  complete: <CheckCircle size={14} />,
};

const eventIconClass = {
  play: "event-feed__icon--play",
  pause: "event-feed__icon--pause",
  skip: "event-feed__icon--skip",
  seek: "event-feed__icon--seek",
  complete: "event-feed__icon--complete",
};

export default function WatchPulse() {
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ total: 0, plays: 0, completes: 0, skips: 0 });
  const [engagement, setEngagement] = useState(null);
  const intervalRef = useRef(null);

  // Fetch initial engagement data
  useEffect(() => {
    getEngagement()
      .then((data) => setEngagement(data))
      .catch(() => {});
  }, []);

  const addEvent = useCallback(() => {
    const evt = randomEvent();
    setEvents((prev) => [evt, ...prev].slice(0, 50));
    setStats((prev) => ({
      total: prev.total + 1,
      plays: prev.plays + (evt.event_type === "play" ? 1 : 0),
      completes: prev.completes + (evt.event_type === "complete" ? 1 : 0),
      skips: prev.skips + (evt.event_type === "skip" ? 1 : 0),
    }));
    // Fire and forget to backend
    submitEvent(evt).catch(() => {});
  }, []);

  const start = () => {
    if (intervalRef.current) return;
    setRunning(true);
    // Generate first event immediately
    addEvent();
    intervalRef.current = setInterval(() => {
      addEvent();
    }, 800 + Math.random() * 1200);
  };

  const stop = () => {
    setRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const completionRate = stats.total > 0 ? ((stats.completes / stats.total) * 100).toFixed(1) : "0.0";
  const skipRate = stats.total > 0 ? ((stats.skips / stats.total) * 100).toFixed(1) : "0.0";

  return (
    <div className="page-container">
      <div className="page-header">
        <p className="kicker kicker--purple">SPARK STRUCTURED STREAMING</p>
        <h1>Watch Pulse</h1>
        <p>
          Real-time simulation of viewer playback events — play, pause, skip, seek
          and completion — processed by Spark Structured Streaming.
        </p>
      </div>

      {/* ── Simulated data notice ────────────────────────── */}
      <div className="sim-notice">
        ⚠️ Simulated activity — these events are generated locally to demonstrate real-time stream processing.
      </div>

      {/* ── Controls ─────────────────────────────────────── */}
      <div className="pulse-controls">
        {!running ? (
          <button className="btn btn--primary" onClick={start}>
            <Play size={16} /> Start Simulation
          </button>
        ) : (
          <button className="btn btn--outline" onClick={stop}>
            <Pause size={16} /> Stop Simulation
          </button>
        )}

        <button
          className="btn btn--ghost btn--sm"
          onClick={() => { setEvents([]); setStats({ total: 0, plays: 0, completes: 0, skips: 0 }); }}
          disabled={events.length === 0}
        >
          Clear
        </button>

        <div className="pulse-controls__status">
          <span className={`pulse-controls__dot${running ? " pulse-controls__dot--live" : ""}`} />
          {running ? "Live" : "Paused"}
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────── */}
      <div className="stat-grid">
        <StatCard
          icon={<Radio size={18} />}
          label="Total Events"
          value={stats.total.toLocaleString()}
          color="purple"
        />
        <StatCard
          icon={<Play size={18} />}
          label="Play Events"
          value={stats.plays.toLocaleString()}
          color="green"
        />
        <StatCard
          icon={<CheckCircle size={18} />}
          label="Completion Rate"
          value={`${completionRate}%`}
          color="blue"
        />
        <StatCard
          icon={<SkipForward size={18} />}
          label="Skip Rate"
          value={`${skipRate}%`}
          color="orange"
        />
      </div>

      {/* ── Event Feed ───────────────────────────────────── */}
      <div className="event-feed">
        <div className="event-feed__header">
          <span>Live Event Feed</span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Showing last {Math.min(events.length, 50)} events
          </span>
        </div>

        {events.length === 0 ? (
          <div className="event-feed__empty">
            <p>No events yet. Click <strong>Start Simulation</strong> to begin.</p>
          </div>
        ) : (
          events.map((evt) => (
            <div key={evt.event_id} className="event-feed__item">
              <div className={`event-feed__icon ${eventIconClass[evt.event_type] || ""}`}>
                {eventIcons[evt.event_type] || "•"}
              </div>
              <div className="event-feed__details">
                <span className="event-feed__event-type">{evt.event_type}</span>
                <span className="event-feed__event-meta">
                  User #{evt.user_id} · {evt.movie_title}
                  {evt.event_type === "complete" && ` · ${Math.round(evt.watch_duration_seconds / 60)}m`}
                </span>
              </div>
              <span className="event-feed__time">
                {new Date(evt.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
      </div>

      {/* ── Backend engagement data ──────────────────────── */}
      {engagement && (
        <div style={{ marginTop: "24px", padding: "20px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
          <h4 style={{ marginBottom: "8px" }}>Pipeline Engagement Metrics</h4>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            When connected to the Spark Streaming pipeline, aggregated metrics from the Hadoop cluster will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
