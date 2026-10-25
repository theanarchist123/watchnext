import { Explain, ModuleChip } from "../../ui/explain";
import { DataNote } from "../../ui/states";
import { getSummary } from "../../../lib/summary";

export default function ModelsPage() {
  const models = getSummary()?.analytics?.models ?? [];
  return <div className="page-shell booth-page"><section className="content-section"><ModuleChip>MODULE 4 · RECOMMENDER SYSTEMS</ModuleChip><p className="eyebrow">F15 · MODEL LAB</p><h1>Taste-Off<br /><em>Arena.</em></h1><Explain title="Explain it simply">Each contestant ranks movies for a held-out evaluation slice. RMSE measures rating error; Precision, Recall and NDCG measure whether the top ten contains useful movies in a good order.</Explain><DataNote>These are offline foundation artifacts. ALS and Hybrid rows are marked proxy until the Spark training/evaluation phase is wired.</DataNote><div className="table-wrap"><table><thead><tr><th>MODEL</th><th>RMSE ↓</th><th>PRECISION@10</th><th>RECALL@10</th><th>NDCG@10</th></tr></thead><tbody>{models.map(model => <tr key={model.name}><td>{model.name}</td><td>{model.rmse.toFixed(3)}</td><td>{model.precision.toFixed(3)}</td><td>{model.recall.toFixed(3)}</td><td>{model.ndcg.toFixed(3)}</td></tr>)}</tbody></table></div></section></div>;
}
