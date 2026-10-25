export default function StatCard({ icon, label, value, change, changeDir, color = "orange" }) {
  return (
    <div className="stat-card">
      <div className="stat-card__header">
        <span className="stat-card__label">{label}</span>
        <div className={`stat-card__icon stat-card__icon--${color}`}>
          {icon}
        </div>
      </div>
      <div className="stat-card__value">{value}</div>
      {change && (
        <div className={`stat-card__change stat-card__change--${changeDir || "up"}`}>
          {changeDir === "up" ? "↑" : "↓"} {change}
        </div>
      )}
    </div>
  );
}
