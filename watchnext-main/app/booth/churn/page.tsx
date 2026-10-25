import { Explain, ModuleChip } from "../../ui/explain";
import { DataNote } from "../../ui/states";
import { getSummary } from "../../../lib/summary";

export default function ChurnPage() {
  const churn = getSummary()?.analytics?.churn;
  const metrics: Array<[string, number | undefined]> = [["ACCURACY", churn?.accuracy], ["PRECISION", churn?.precision], ["RECALL", churn?.recall]];
  return <div className="page-shell booth-page"><section className="content-section"><ModuleChip>MODULE 5 · CLASSIFICATION</ModuleChip><p className="eyebrow">F12 · CHURN RISK</p><h1>Cooling<br /><em>Radar.</em></h1><Explain title="Explain it simply">This is not cancellation data. A proxy label treats a viewer with no activity in the final timeline window as lapsed, then measures how well a simple classifier spots that pattern.</Explain><DataNote>Proxy label: {churn?.proxyLabel ?? "not prepared"}</DataNote><div className="metric-row">{metrics.map(([label, value]) => <div className="metric" key={label}><span>{label}</span><strong>{value ? `${(value * 100).toFixed(1)}%` : "—"}</strong></div>)}</div><div className="cold-list"><h2>Coldest viewers</h2>{(churn?.coldest ?? []).map(viewer => <div key={viewer.viewer}><b>{viewer.viewer}</b><span className="risk-bar"><i style={{ width: `${viewer.risk * 100}%` }} /></span><em>{viewer.reason}</em></div>)}</div></section></div>;
}
