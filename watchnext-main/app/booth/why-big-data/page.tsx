import { ModuleChip } from "../../ui/explain";
import { getSummary, formatNumber } from "../../../lib/summary";

export default function WhyBigDataPage() {
  const summary = getSummary();
  const doors = [["VOLUME", summary ? `${formatNumber(summary.totals.ratings)} ratings` : "—", "A catalogue this large makes offline aggregation worthwhile."], ["VELOCITY", "event replay", "The speed layer can turn ratings into a moving pulse."], ["VARIETY", "4 CSV sources", "Ratings, movies, links and free-text tags tell different stories."], ["VERACITY", "direct counts", "Every current KPI is computed from the attached files."], ["VALUE", "recommendation rows", "Prepared outputs make the viewer experience fast."]];
  return <div className="page-shell booth-page"><section className="content-section"><ModuleChip>MODULES 1–2 · BIG DATA FOUNDATIONS</ModuleChip><p className="eyebrow">F16 · WHY BIG DATA?</p><h1>Five doors into<br /><em>the pipeline.</em></h1><div className="door-grid">{doors.map(([name, value, text]) => <article key={name}><span>{name}</span><strong>{value}</strong><p>{text}</p></article>)}</div></section></div>;
}
