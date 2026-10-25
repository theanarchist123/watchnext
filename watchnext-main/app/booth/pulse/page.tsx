import { Explain, ModuleChip } from "../../ui/explain";
import { DataNote } from "../../ui/states";
import { formatNumber, getSummary } from "../../../lib/summary";

export default function PulsePage() {
  const stream = getSummary()?.analytics?.stream;
  return <div className="page-shell booth-page"><section className="content-section"><ModuleChip>MODULE 4 · MINING DATA STREAMS</ModuleChip><p className="eyebrow">F13 · STREAM HUB</p><h1>Live<br /><em>Pulse.</em></h1><Explain title="Explain it simply">A replay process turns historical ratings into events. Exact counters are compared with compact-memory algorithms: reservoir sampling, Bloom filters, Flajolet–Martin and DGIM.</Explain><DataNote>Prepared stream lab: {stream ? formatNumber(stream.windowEvents) : "—"} events. Start/pause controls and ten-minute continuous replay are scheduled for the live simulator slice.</DataNote><div className="stream-grid">{[["RESERVOIR", `${stream?.reservoirSize ?? "—"} tickets`, "fixed sample"], ["BLOOM FILTER", `${stream?.bloomBits ?? "—"} bits`, "probable membership"], ["FM DISTINCT", `${formatNumber(stream?.estimatedDistinctViewers ?? 0)}`, "estimate vs exact"], ["DGIM", `${formatNumber(stream?.estimatedRecentPlays ?? 0)}`, "recent-play estimate"]].map(([name, value, note]) => <div className="stream-card" key={name}><span>{name}</span><strong>{value}</strong><small>{note}</small></div>)}</div></section></div>;
}
