import { Explain, ModuleChip } from "../../ui/explain";
import { DataNote } from "../../ui/states";
import { getSummary } from "../../../lib/summary";
import type { CSSProperties } from "react";

export default function UniversePage() {
  const graph = getSummary()?.analytics?.graph;
  return <div className="page-shell booth-page"><section className="content-section"><ModuleChip>MODULE 6 · GRAPH ANALYSIS</ModuleChip><p className="eyebrow">F14 · MOVIE UNIVERSE</p><h1>A galaxy of<br /><em>shared taste.</em></h1><Explain title="Explain it simply">Movies become nodes and shared audience preference becomes an edge. PageRank rewards movies connected to other important movies; communities reveal related pockets of taste.</Explain><DataNote>Graph view is capped at {graph?.nodes.length ?? 0} nodes for readability. The full graph job will add topic-sensitive PageRank, HITS and triangle counts.</DataNote><div className="graph-stats"><div><span>RANK SUM</span><strong>{graph?.rankSum.toFixed(4) ?? "—"}</strong></div><div><span>EDGES</span><strong>{graph?.edges.length ?? "—"}</strong></div><div><span>TRIANGLES</span><strong>{graph?.triangleCount ?? "—"}</strong></div></div><div className="node-list">{(graph?.nodes ?? []).map((node, index) => <div key={node.id}><i style={{ "--rank": `${node.rank * 1000}%` } as CSSProperties}>{index + 1}</i><b>{node.label}</b><span>{node.community}</span><em>{node.rank.toFixed(4)}</em></div>)}</div></section></div>;
}
