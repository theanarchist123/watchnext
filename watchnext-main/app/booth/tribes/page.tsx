import { Explain, ModuleChip } from "../../ui/explain";
import { DataNote } from "../../ui/states";
import { formatNumber, getSummary } from "../../../lib/summary";

export default function TribesPage() {
  const tribes = getSummary()?.analytics?.tribes ?? [];
  return <div className="page-shell booth-page"><section className="content-section"><ModuleChip>MODULE 5 · CLUSTERING</ModuleChip><p className="eyebrow">F11 · VIEWER TRIBES</p><h1>Find your<br /><em>crowd.</em></h1><Explain title="Explain it simply">Viewers are grouped by the kinds of genres they rate. Canopy clustering is the cheap first pass; a refined model can then describe each cluster.</Explain><DataNote>Persona names are generated from the dominant genre. Sizes are derived from the current foundation profile and will be reconciled against full feature vectors during the clustering job.</DataNote><div className="tribe-grid">{tribes.map(tribe => <article className="tribe-card" key={tribe.name}><span>TRIBE PROFILE</span><h2>{tribe.name}</h2><strong>{formatNumber(tribe.size)}</strong><small>viewer seats · avg rating {tribe.averageRating.toFixed(2)}</small><p>Top genre: <b>{tribe.favoriteGenre}</b></p></article>)}</div></section></div>;
}
