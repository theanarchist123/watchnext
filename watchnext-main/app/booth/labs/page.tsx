import { ModuleChip } from "../../ui/explain";

const labs = [
  ["F8", "The Scale Race", "Benchmarks", "/booth/scale"],
  ["F10", "Pattern Explorer", "Mining", "/booth/patterns"],
  ["F11", "Viewer Tribes", "Clustering", "/booth/tribes"],
  ["F12", "Cooling Radar", "Churn proxy", "/booth/churn"],
  ["F13", "Live Pulse", "Streaming", "/booth/pulse"],
  ["F14", "Movie Universe", "Graph analysis", "/booth/universe"],
  ["F15", "Taste-Off Arena", "Recommenders", "/booth/models"]
];

export default function LabsPage() {
  return <div className="page-shell booth-page"><section className="content-section"><ModuleChip>PROJECTION BOOTH · LAB INDEX</ModuleChip><p className="eyebrow">PHASES 2–7</p><h1>Every algorithm<br /><em>gets a seat.</em></h1><p className="booth-lede">Offline artifacts are exposed through focused labs. Heavy computation happens during preparation; the pages stay fast because they read prepared results.</p><div className="lab-grid">{labs.map(([code, title, label, href]) => <a className="lab-card" href={href} key={code}><span>{code}</span><h2>{title}</h2><small>{label} →</small></a>)}</div></section></div>;
}
