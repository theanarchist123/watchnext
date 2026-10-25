import { Explain, ModuleChip } from "../../ui/explain";

const stations = [["01", "SOURCES", "MovieLens CSVs", "READY"], ["02", "STORAGE", "HDFS / MongoDB", "PLANNED"], ["03", "PROCESSING", "Spark + MapReduce", "PLANNED"], ["04", "SERVING", "FastAPI", "PLANNED"], ["05", "PRESENTATION", "WatchNext UI", "ONLINE"]];

export default function PipelinePage() {
  return <div className="page-shell booth-page"><section className="content-section pipeline-section"><ModuleChip>MODULE 2 · DATA SYSTEMS</ModuleChip><p className="eyebrow">F18 · PIPELINE METRO MAP</p><h1>The route from<br /><em>raw to remarkable.</em></h1><Explain title="Explain it simply">The batch layer does the heavy work offline. The speed layer handles live events. The serving layer stores prepared results so the interface stays fast.</Explain><div className="metro-map">{stations.map(([number, layer, name, status], index) => <div className="station" key={layer}><div className="station-line"><span>{number}</span>{index < stations.length - 1 && <i />}</div><div><b>{layer}</b><strong>{name}</strong><small>{status}</small></div></div>)}</div></section></div>;
}
