import Link from "next/link";
import { Explain, ModuleChip } from "../ui/explain";
import { DataNote } from "../ui/states";
import { formatNumber, getSummary } from "../../lib/summary";

export default function BoothPage() {
  const summary = getSummary();
  const topGenre = summary?.genres[0];
  const busiestYear = summary?.yearly.reduce((best, year) => year.ratingCount > best.ratingCount ? year : best, summary.yearly[0]);
  const kpis = summary ? [
    ["TOTAL RATINGS", formatNumber(summary.totals.ratings), "direct count"],
    ["VIEWERS", formatNumber(summary.totals.users), "distinct user IDs"],
    ["MOVIES", formatNumber(summary.totals.movies), "catalogue rows"],
    ["AVERAGE RATING", summary.totals.averageRating.toFixed(2), "five-star scale"],
    ["BUSIEST YEAR", String(busiestYear?.year ?? "—"), busiestYear ? `${formatNumber(busiestYear.ratingCount)} ratings` : "not prepared"],
    ["TOP GENRE", topGenre?.name ?? "—", topGenre ? `${formatNumber(topGenre.ratingCount)} ratings` : "not prepared"]
  ] : [];
  return (
    <div className="page-shell booth-page">
      <section className="booth-hero">
        <div><ModuleChip>MODULE 1 · BIG DATA FOUNDATIONS</ModuleChip><p className="eyebrow">THE PROJECTION BOOTH</p><h1>See what makes<br /><em>the picture move.</em></h1><p>Behind every recommendation is a chain of storage, processing and serving decisions. This is the control room.</p></div>
        <div className="projector"><span>●</span><i /><b>PIPELINE<br />ONLINE</b></div>
      </section>
      <section className="content-section">
        <div className="section-heading"><div><p className="eyebrow">F5 · KPI DASHBOARD</p><h2>Box Office Board</h2></div><Link className="text-link" href="/booth/pipeline">View pipeline map →</Link></div>
        <Explain title="Explain it simply">This board is the first serving layer: an offline data preparation job counts the source files once, then this page reads the saved result quickly. No Spark job runs in your browser.</Explain>
        {!summary && <DataNote>Metrics are not prepared yet. Run <code>npm run data:prepare</code> against the attached <code>ml-32m</code> folder.</DataNote>}
        <div className="kpi-grid">{kpis.map(([label, value, note]) => <div className="kpi-card" key={label}><span>{label}</span><strong>{value}</strong><small>{note}</small></div>)}</div>
        <div className="booth-next"><a href="/booth/why-big-data">Read the five doors →</a></div>
      </section>
    </div>
  );
}
