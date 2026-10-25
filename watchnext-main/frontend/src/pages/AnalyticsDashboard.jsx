import { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, Label
} from "recharts";
import { Film, Users, Star, Activity, TrendingUp, BarChart3 } from "lucide-react";
import StatCard from "../components/StatCard";
import LoadingState from "../components/LoadingState";
import { API_BASE, getAnalytics, getInterestDrop, getChurnRisk } from "../services/api";

const CHART_COLORS = ["#E87A3A", "#7C5CFC", "#34D399", "#60A5FA", "#FBBF24", "#F87171", "#A78BFA", "#2DD4BF"];
const MONITORED_USERS = [
  { id: 18, name: "Nikhil" },
  { id: 28, name: "Shravanya" },
  { id: 40, name: "Arnav" },
  { id: 47, name: "Karuna" },
];

function InferenceNote({ children }) {
  return (
    <p
      style={{
        margin: "8px 0 0",
        color: "var(--text-secondary)",
        fontSize: "0.8rem",
        lineHeight: 1.45,
      }}
    >
      <strong style={{ color: "var(--text-light)" }}>What this shows:</strong>{" "}
      {children}
    </p>
  );
}

function getRetentionPlan(user, name) {
  const insufficient = !user || user.risk_category === "Insufficient Data" || user.interest_status === "Insufficient Evidence";
  if (insufficient) {
    return {
      category: user?.risk_category || "Insufficient Data",
      priority: "Observe",
      signal: "Insufficient comparable timestamped activity",
      action: "Collect additional timestamped ratings or playback observations before targeting this user.",
      explanation: "There is not enough evidence to distinguish disengagement from missing activity.",
      outcome: "Hypothesis: additional observations will support a more reliable, user-specific intervention.",
      plan: [
        "Record additional ratings or playback events through the existing WatchNext flows.",
        "Re-run the activity assessment after comparable baseline and recent windows are available.",
        "Only then select a targeted recommendation collection.",
      ],
      objective: "Improve evidence quality before attempting retention outreach.",
      successMetric: "Subsequent rating activity, used only as an engagement proxy.",
      period: "Re-evaluate after the next 30-day comparison window.",
    };
  }
  const isHigh = user.risk_category === "High Risk";
  return {
    category: user.risk_category,
    priority: user.intervention_priority,
    signal: user.signals?.[0] || user.trigger_metric,
    action: user.recommended_intervention,
    explanation: isHigh
      ? "The sharp activity decline warrants a refreshed and more diverse collection rather than generic trending content."
      : "The measured activity decline supports a profile-relevant Continue Exploring collection.",
    outcome: isHigh
      ? "Hypothesis: more varied, preference-aligned recommendations may encourage renewed exploration; retention impact is not guaranteed."
      : "Hypothesis: a more relevant selection may encourage renewed exploration; retention impact is not guaranteed.",
    plan: isHigh
      ? [
          "Open the selected user's recommendation collection.",
          "Refresh the collection with diverse titles aligned to historical preferences.",
          "Review subsequent rating activity during the follow-up period.",
        ]
      : [
          "Open the selected user's recommendation collection.",
          "Surface the Continue Exploring selection using existing profile preferences.",
          "Review subsequent rating activity during the follow-up period.",
        ],
    objective: "Encourage renewed, preference-aligned movie exploration.",
    successMetric: "Subsequent rating activity, explicitly used as a proxy rather than watch engagement.",
    period: "Review the proxy after 30 days or after enough new events are recorded.",
  };
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interestDrop, setInterestDrop] = useState(null);
  const [churnRisk, setChurnRisk] = useState(null);
  const [activityFilter, setActivityFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [retentionUserId, setRetentionUserId] = useState(18);
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [plannedUsers, setPlannedUsers] = useState({});

  useEffect(() => {
    async function load() {
      try {
        const [result, interestResult, churnResult] = await Promise.all([
          getAnalytics(),
          getInterestDrop(),
          getChurnRisk(),
        ]);
        setData(result);
        setInterestDrop(interestResult);
        setChurnRisk(churnResult);
      } catch (err) {
        setError(err.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="page-container"><LoadingState type="spinner" /></div>;
  if (error) {
    return (
      <div className="page-container">
        <div className="error-state">
          <div className="error-state__icon">⚠️</div>
          <h3 className="error-state__title">{error}</h3>
          <p className="error-state__text">Make sure the backend API is running on port 8000.</p>
        </div>
      </div>
    );
  }
  if (!data) return null;

  const { summary, genre_stats, rating_distribution, top_movies, trends, viewer_segments } = data;
  const interestUsers = (interestDrop?.users || []).filter((user) =>
    activityFilter === "All" || user.interest_status === activityFilter
  );
  const churnUsers = (churnRisk?.users || []).filter((user) =>
    riskFilter === "All" || user.risk_category === riskFilter
  );
  const selectedRetentionUser = (churnRisk?.users || []).find((user) => user.user_id === retentionUserId);
  const selectedInterestUser = (interestDrop?.users || []).find((user) => user.user_id === retentionUserId);
  const selectedAssessment = selectedRetentionUser || (selectedInterestUser ? {
    user_id: retentionUserId,
    risk_category: selectedInterestUser.interest_status === "Insufficient Evidence" ? "Insufficient Data" : "Medium Risk",
    interest_status: selectedInterestUser.interest_status,
    signals: [selectedInterestUser.trigger_metric],
    metric_values: {
      baseline_activity: selectedInterestUser.baseline_value,
      recent_activity: selectedInterestUser.recent_value,
      percentage_change: selectedInterestUser.percentage_change,
    },
    comparison_periods: {
      baseline: selectedInterestUser.baseline_period,
      recent: selectedInterestUser.comparison_period,
    },
    explanation: selectedInterestUser.reason,
    recommended_intervention: selectedInterestUser.recommended_action,
    intervention_priority: "Soon",
  } : null);
  const selectedRetentionName = MONITORED_USERS.find((user) => user.id === retentionUserId)?.name || "Selected user";
  const retentionPlan = getRetentionPlan(selectedAssessment, selectedRetentionName);

  return (
    <div className="page-container">
      <div className="page-header">
        <p className="kicker kicker--purple">HIVE · MAPREDUCE · SPARK</p>
        <h1>Analytics Dashboard</h1>
        <p>
          Viewership trends, genre popularity, and engagement metrics from the
          MovieLens 20M dataset.
        </p>
        
      </div>

      {/* ── Summary Stats ────────────────────────────────── */}
      <div className="stat-grid">
        <StatCard
          icon={<Film size={18} />}
          label="Total Movies"
          value={summary?.total_movies?.toLocaleString() || "—"}
          color="orange"
        />
        <StatCard
          icon={<Star size={18} />}
          label="Total Ratings"
          value={summary?.total_ratings?.toLocaleString() || "—"}
          color="purple"
        />
        <StatCard
          icon={<Users size={18} />}
          label="Unique Users"
          value={summary?.unique_users?.toLocaleString() || "—"}
          color="blue"
        />
        <StatCard
          icon={<Activity size={18} />}
          label="Avg Rating"
          value={summary?.avg_rating?.toFixed(2) || "—"}
          color="green"
        />
      </div>
      <InferenceNote>
        Use these baselines to size the catalogue, understand the depth of rating evidence, and track whether future data refreshes change the platform’s coverage or overall sentiment.
      </InferenceNote>

      {/* ── Spark MLlib ALS Model Performance Metrics ────────────────── */}
      {data.model_metrics && (
        <div
          style={{
            marginBottom: "32px",
            padding: "20px 24px",
            background: "rgba(124, 92, 252, 0.08)",
            border: "1px solid rgba(124, 92, 252, 0.25)",
            borderRadius: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 10px", borderRadius: "9999px", background: "#7C5CFC", color: "#fff" }}>
                SPARK MLLIB ALS MODEL
              </span>
              <h3 style={{ fontSize: "1rem", color: "var(--text-white)", margin: 0 }}>
                Collaborative Filtering Offline Evaluation Metrics
              </h3>
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--emerald)", fontWeight: 700 }}>
              RMSE: {data.model_metrics.rmse ? data.model_metrics.rmse.toFixed(4) : "—"}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", fontSize: "0.82rem" }}>
            <div style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ color: "var(--text-muted)", marginBottom: "4px" }}>Training Ratings</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-white)" }}>
                {data.model_metrics.training_rating_count?.toLocaleString() || "—"}
              </div>
            </div>
            <div style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ color: "var(--text-muted)", marginBottom: "4px" }}>Latent Factors (Rank)</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--gold)" }}>
                {data.model_metrics.rank || "—"}
              </div>
            </div>
            <div style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ color: "var(--text-muted)", marginBottom: "4px" }}>Regularization (regParam)</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-white)" }}>
                {data.model_metrics.reg_param ?? "—"}
              </div>
            </div>
            <div style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ color: "var(--text-muted)", marginBottom: "4px" }}>Precomputed Recommendations</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--emerald)" }}>
                {data.model_metrics.recommendation_count?.toLocaleString() || "—"}
              </div>
            </div>
            <InferenceNote>
              The evaluation error provides a quality baseline for comparing future model runs. Use the current configuration as the reference point when tuning factors or regularization.
            </InferenceNote>
          </div>
        </div>
      )}

      {/* ── Charts Row 1: Genre Popularity + Rating Distribution ── */}
      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-card__header">
            <div>
              <div className="chart-card__title">Genre Popularity</div>
              <div className="chart-card__subtitle">Number of movies per genre. Taller bars indicate more catalogue titles.</div>
              <InferenceNote>
                Prioritize broad catalogue coverage in the tallest genres, then use the smaller categories to find opportunities for discovery-focused collections and content gaps.
              </InferenceNote>
            </div>
            <BarChart3 size={18} style={{ color: "var(--text-muted)" }} />
          </div>
          <div style={{ position: "relative", paddingLeft: "28px" }}>
            <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%) rotate(-90deg)", color: "#e2e8f0", fontSize: "0.82rem", whiteSpace: "nowrap" }}>Movie count</div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={genre_stats || []} margin={{ top: 5, right: 20, left: 18, bottom: 18 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="genre" tick={{ fontSize: 11, fill: "#e2e8f0" }} angle={-35} textAnchor="end" height={78}>
                <Label value="Genre" fill="#e2e8f0" position="insideBottom" offset={-8} />
              </XAxis>
              <YAxis tick={{ fontSize: 11, fill: "#e2e8f0" }} width={52} />
              <Tooltip
                contentStyle={{
                  background: "#151524",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  color: "#fff",
                  labelStyle: { color: "#fff" },
                  itemStyle: { color: "#fff" },
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {(genre_stats || []).map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card__header">
            <div>
              <div className="chart-card__title">Rating Distribution</div>
              <div className="chart-card__subtitle">How users rate movies. The bars show the volume at each rating value.</div>
              <InferenceNote>
                A concentrated high-rating pattern suggests strong overall satisfaction and useful positive-signal coverage; a wider spread suggests that recommendations should distinguish more carefully between user tastes.
              </InferenceNote>
            </div>
          </div>
          <div style={{ position: "relative", paddingLeft: "28px" }}>
            <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%) rotate(-90deg)", color: "#e2e8f0", fontSize: "0.82rem", whiteSpace: "nowrap" }}>Rating count</div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={rating_distribution || []} margin={{ top: 5, right: 20, left: 18, bottom: 18 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="rating" tick={{ fontSize: 11, fill: "#e2e8f0" }} height={42}>
                <Label value="Rating value" fill="#e2e8f0" position="insideBottom" offset={-8} />
              </XAxis>
              <YAxis tick={{ fontSize: 11, fill: "#e2e8f0" }} width={52} />
              <Tooltip
                contentStyle={{
                  background: "#151524",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  color: "#fff",
                  labelStyle: { color: "#fff" },
                  itemStyle: { color: "#fff" },
                }}
              />
              <Bar dataKey="count" fill="#7C5CFC" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Top Rated Movies Table ────────────────────────── */}
      {top_movies && top_movies.length > 0 && (
        <div className="chart-card" style={{ marginBottom: "28px" }}>
          <div className="chart-card__header">
            <div>
              <div className="chart-card__title">Top Rated Movies</div>
              <div className="chart-card__subtitle">By average rating (min. 1,000 ratings)</div>
              <InferenceNote>
                These titles have the highest recorded average ratings among movies with at least 1,000 ratings. The list reflects rating history, not current popularity or guaranteed personal relevance.
              </InferenceNote>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="top-movies-table">
              <thead>
                <tr><th>#</th><th>Title</th><th>Genres</th><th>Rating</th><th>Ratings Count</th></tr>
              </thead>
              <tbody>
                {top_movies.map((movie, i) => (
                  <tr key={movie.movie_id || i}>
                    <td className="top-movies-table__rank">{i + 1}</td>
                    <td className="top-movies-table__title">{movie.title}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{(movie.genres || []).slice(0, 2).join(", ")}</td>
                    <td className="top-movies-table__rating">★ {movie.avg_rating?.toFixed(2)}</td>
                    <td className="top-movies-table__count">{movie.rating_count?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Charts Row 2: Trends + Viewer Segments ──────── */}
      <div className="chart-grid">
        {trends && trends.length > 0 && (
          <div className="chart-card">
            <div className="chart-card__header">
              <div>
                <div className="chart-card__title">Rating Trends Over Time</div>
                <div className="chart-card__subtitle">Monthly rating volume. Peaks indicate periods with more submitted ratings.</div>
                <InferenceNote>
                  Use high-activity months as engagement benchmarks and investigate sustained declines as a prompt to refresh recommendations or collect more feedback.
                </InferenceNote>
              </div>
              <TrendingUp size={18} style={{ color: "var(--text-muted)" }} />
            </div>
            <div style={{ position: "relative", paddingLeft: "28px" }}>
              <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%) rotate(-90deg)", color: "#e2e8f0", fontSize: "0.82rem", whiteSpace: "nowrap" }}>Rating count</div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trends} margin={{ top: 5, right: 20, left: 18, bottom: 18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#e2e8f0" }} height={42}>
                  <Label value="Month" fill="#e2e8f0" position="insideBottom" offset={-8} />
                </XAxis>
                <YAxis tick={{ fontSize: 11, fill: "#e2e8f0" }} width={52} />
                <Tooltip
                  contentStyle={{
                    background: "#151524",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    fontSize: "0.82rem",
                    color: "#fff",
                    labelStyle: { color: "#fff" },
                    itemStyle: { color: "#fff" },
                  }}
                />
                <Line type="monotone" dataKey="count" stroke="#E87A3A" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {viewer_segments && viewer_segments.length > 0 && (
          <div className="chart-card">
            <div className="chart-card__header">
              <div>
                <div className="chart-card__title">Viewer Segments</div>
                <div className="chart-card__subtitle">Users by activity level. Each slice shows that segment's share of users.</div>
                <InferenceNote>
                  Focus retention experiments on the largest low-activity segment first, while using the highly active segment to learn which recommendation experiences encourage continued participation.
                </InferenceNote>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={viewer_segments}
                  dataKey="count"
                  nameKey="segment"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  paddingAngle={3}
                  label={({ segment, percent }) => `${segment} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {viewer_segments.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#151524",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    fontSize: "0.82rem",
                    color: "#fff",
                    labelStyle: { color: "#fff" },
                    itemStyle: { color: "#fff" },
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <section className="chart-card" style={{ marginBottom: "28px" }}>
        <div className="chart-card__header">
          <div>
            <div className="chart-card__title">Interest-Drop Detection, Churn-Risk & Retention Center</div>
            <InferenceNote>
              Use the comparison periods to identify users who need closer observation, then connect each signal to a targeted recommendation refresh and a measurable follow-up check.
            </InferenceNote>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <a href={`${API_BASE}/api/analytics/interest-drop`} target="_blank" rel="noreferrer">Interest API</a>
            <a href={`${API_BASE}/api/analytics/churn-risk`} target="_blank" rel="noreferrer">Risk API</a>
          </div>
        </div>
      
        <h3 style={{ marginBottom: "6px" }}>Interest-Drop Detection</h3>
        <div className="stat-grid" style={{ marginBottom: "18px" }}>
          <StatCard label="Users monitored" value={interestDrop?.summary?.users_monitored ?? "—"} color="blue" />
          <StatCard label="Declining activity" value={interestDrop?.summary?.declining_users ?? "—"} color="orange" />
          <StatCard label="Sharp declines" value={interestDrop?.summary?.sharp_decline_users ?? "—"} color="purple" />
          <StatCard label="Insufficient evidence" value={interestDrop?.summary?.insufficient_evidence_users ?? "—"} color="green" />
        </div>
        <label htmlFor="interest-status-filter">Interest status </label>
        <select id="interest-status-filter" value={activityFilter} onChange={(event) => setActivityFilter(event.target.value)}>
          <option>All</option>
          <option>Stable</option>
          <option>Declining</option>
          <option>Sharp Decline</option>
          <option>Insufficient Evidence</option>
        </select>
        {interestUsers.length > 0 ? (
          <div style={{ overflowX: "auto", marginTop: "14px" }}>
            <table className="top-movies-table">
              <thead><tr><th>User</th><th>Status</th><th>Metric</th><th>Baseline → Recent</th><th>Change</th><th>Evidence / Action</th></tr></thead>
              <tbody>{interestUsers.map((user) => (
                <tr key={user.user_id}>
                  <td>{user.user_id}</td>
                  <td>{user.interest_status}</td>
                  <td>{user.trigger_metric}</td>
                  <td>{user.baseline_value} → {user.recent_value}<br /><small>{user.baseline_period}<br />{user.comparison_period}</small></td>
                  <td>{user.percentage_change == null ? "—" : `${user.percentage_change}%`}</td>
                  <td><strong>{user.evidence_strength}</strong><br />{user.reason}<br /><small>{user.recommended_action}</small></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <p style={{ color: "var(--text-secondary)", marginTop: "14px" }}>No users meet the evidence requirements. Record timestamped ratings or playback events through the existing API before interpreting a decline.</p>}
      <div style={{ marginTop: "28px", paddingTop: "28px", borderTop: "1px solid var(--border-subtle)" }}>
        <div className="chart-card__header">
          <div>
            <div className="chart-card__title">Churn-Risk & Retention Center</div>
          </div>
          <a href={`${API_BASE}/api/analytics/churn-risk`} target="_blank" rel="noreferrer">Open API</a>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>
          High Risk = Sharp Decline, Medium Risk = Declining, Low Risk = Stable. Use the category to sequence retention work.
        </p>
        <InferenceNote>
          Start with High Risk users, match the intervention to their strongest signal, and review new rating activity after the follow-up period to learn whether the recommendation refresh improved engagement.
        </InferenceNote>
        <div className="stat-grid" style={{ marginBottom: "18px" }}>
          <StatCard label="High risk" value={churnRisk?.summary?.high_risk ?? "—"} color="purple" />
          <StatCard label="Medium risk" value={churnRisk?.summary?.medium_risk ?? "—"} color="orange" />
          <StatCard label="Low risk" value={churnRisk?.summary?.low_risk ?? "—"} color="green" />
          <StatCard label="Insufficient data" value={churnRisk?.summary?.insufficient_data ?? "—"} color="blue" />
        </div>
        <label htmlFor="risk-filter">Risk category </label>
        <select id="risk-filter" value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)}>
          <option>All</option><option>High Risk</option><option>Medium Risk</option><option>Low Risk</option><option>Insufficient Data</option>
        </select>
        {churnUsers.length > 0 ? (
          <div style={{ overflowX: "auto", marginTop: "14px" }}>
            <table className="top-movies-table">
              <thead><tr><th>User</th><th>Risk</th><th>Score</th><th>Signals</th><th>Intervention</th><th>Priority</th></tr></thead>
              <tbody>{churnUsers.map((user) => (
                <tr key={user.user_id}>
                  <td>{user.user_id}</td>
                  <td>{user.risk_category}<br /><small>{user.interest_status}</small></td>
                  <td>{user.risk_score == null ? "—" : `${user.risk_score} points`}<br /><small>Not a probability</small></td>
                  <td>{user.signals.join(", ")}<br /><small>{user.comparison_periods.baseline}<br />{user.comparison_periods.recent}</small></td>
                  <td>{user.explanation}<br /><strong>{user.recommended_intervention}</strong><br /><small>Hypothesis: {user.expected_outcome.replace("Hypothesis: ", "")}</small></td>
                  <td>{user.intervention_priority}<br /><a href={`/recommendations?user=${user.user_id}`}>Open recommendations</a></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <p style={{ color: "var(--text-secondary)", marginTop: "14px" }}>No risk assessments can be made from the currently recorded activity.</p>}
      </div>

      <div style={{ marginTop: "28px", paddingTop: "28px", borderTop: "1px solid var(--border-subtle)" }}>
        <div className="chart-card__header">
          <div>
            <div className="chart-card__title">Recommended Retention Action</div>
            <div className="chart-card__subtitle">
              One evidence-based proposal for the selected monitored user.
            </div>
            <InferenceNote>
              Use this card as the next-best action for the selected user: open the profile recommendations, apply the proposed collection strategy, and monitor the listed proxy during follow-up.
            </InferenceNote>
          </div>
          <span style={{ padding: "5px 10px", borderRadius: "999px", background: "rgba(232,122,58,0.15)", color: "var(--accent-orange)", fontSize: "0.78rem", fontWeight: 700 }}>
            {retentionPlan.priority} Priority
          </span>
        </div>
        <label htmlFor="retention-user">Select monitored user</label>
        <select
          id="retention-user"
          value={retentionUserId}
          onChange={(event) => {
            setRetentionUserId(Number(event.target.value));
            setWorkflowOpen(false);
          }}
          style={{ display: "block", width: "100%", marginTop: "8px", marginBottom: "22px" }}
        >
          {MONITORED_USERS.map((user) => (
            <option key={user.id} value={user.id}>{user.name} · User {user.id}</option>
          ))}
        </select>
        <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "22px" }}>
          <h3 style={{ marginBottom: "4px" }}>{selectedRetentionName}</h3>
          <p style={{ color: "var(--text-secondary)" }}>MovieLens User ID: {retentionUserId}</p>
          <p style={{ marginTop: "6px" }}>
            <strong>{retentionPlan.category}</strong> · {retentionPlan.priority} priority
          </p>
          <div style={{ marginTop: "24px" }}>
            <div className="chart-card__subtitle" style={{ textTransform: "uppercase" }}>Signal that triggered the assessment</div>
            <p style={{ marginTop: "8px", fontWeight: 700 }}>{retentionPlan.signal}</p>
            {selectedAssessment ? (
              <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>
                {selectedAssessment.metric_values?.baseline_activity ?? "—"} → {selectedAssessment.metric_values?.recent_activity ?? "—"} recorded events
                {" · "}
                {selectedAssessment.comparison_periods?.baseline || "Baseline unavailable"} vs. {selectedAssessment.comparison_periods?.recent || "Recent period unavailable"}
                {" · "}
                {selectedAssessment.metric_values?.percentage_change == null ? "Change unavailable" : `${selectedAssessment.metric_values.percentage_change}% change`}
              </p>
            ) : (
              <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>
                Insufficient data: no assessment is available for this user in the current backend response.
              </p>
            )}
          </div>
          <div style={{ marginTop: "22px" }}>
            <div className="chart-card__subtitle" style={{ textTransform: "uppercase" }}>Recommended action</div>
            <p style={{ marginTop: "8px", fontWeight: 700 }}>{retentionPlan.action}</p>
            <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>{retentionPlan.explanation}</p>
          </div>
          <div style={{ marginTop: "22px" }}>
            <div className="chart-card__subtitle" style={{ textTransform: "uppercase" }}>Expected outcome · hypothesis</div>
            <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>{retentionPlan.outcome}</p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "22px" }}>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setWorkflowOpen(true)}
            >
              Design Action Workflow →
            </button>
            <a className="btn btn--secondary" href={`/recommendations?user=${retentionUserId}`}>
              Open recommendations
            </a>
          </div>
        
        </div>
      </div>
      </section>

      {workflowOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="workflow-title"
          style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.72)", display: "grid", placeItems: "center", padding: "20px" }}
          onClick={(event) => event.target === event.currentTarget && setWorkflowOpen(false)}
        >
          <div style={{ width: "min(720px, 100%)", maxHeight: "90vh", overflowY: "auto", background: "var(--bg-card)", border: "1px solid var(--border-medium)", borderRadius: "16px", padding: "24px", color: "var(--text-light)" }}>
            <h2 id="workflow-title">Action workflow · {selectedRetentionName} (User {retentionUserId})</h2>
            <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>
              Proposed plan only.
            </p>
            <div style={{ display: "grid", gap: "16px", marginTop: "22px" }}>
              <div><strong>Detected problem and evidence</strong><p style={{ color: "var(--text-secondary)", marginTop: "5px" }}>{retentionPlan.signal}. {selectedAssessment?.explanation || "Insufficient data is available for this user."}</p></div>
              <div><strong>Retention objective</strong><p style={{ color: "var(--text-secondary)", marginTop: "5px" }}>{retentionPlan.objective}</p></div>
              <div><strong>Recommended action</strong><p style={{ color: "var(--text-secondary)", marginTop: "5px" }}>{retentionPlan.action}</p></div>
              <div>
                <strong>Action plan</strong>
                <ol style={{ color: "var(--text-secondary)", marginTop: "5px", paddingLeft: "22px" }}>
                  {retentionPlan.plan.map((step) => <li key={step}>{step}</li>)}
                </ol>
              </div>
              <div><strong>Supporting WatchNext route</strong><p style={{ marginTop: "5px" }}><a href={`/recommendations?user=${retentionUserId}`}>Open recommendations for User {retentionUserId}</a></p></div>
              <div><strong>Success metric</strong><p style={{ color: "var(--text-secondary)", marginTop: "5px" }}>{retentionPlan.successMetric}</p></div>
              <div><strong>Follow-up evaluation</strong><p style={{ color: "var(--text-secondary)", marginTop: "5px" }}>{retentionPlan.period}</p></div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
              <button type="button" className="btn btn--secondary" onClick={() => setWorkflowOpen(false)}>Back</button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  setPlannedUsers((current) => ({ ...current, [retentionUserId]: true }));
                  setWorkflowOpen(false);
                }}
              >
                Mark as Planned
              </button>
            </div>
          </div>
        </div>
      )}
    <p style={{ fontSize: "0.8rem", marginTop: "10px" }}>
          <a href={`${API_BASE}/api/analytics`} target="_blank" rel="noreferrer">
            View analytics API response
          </a>
          {" · "}
          <a href={`${API_BASE}/api/movies?limit=10`} target="_blank" rel="noreferrer">
            View movies API response
          </a>
          {" · "}
          <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer">
            Open FastAPI docs
          </a>
        </p>
     
    </div>
  );
}
