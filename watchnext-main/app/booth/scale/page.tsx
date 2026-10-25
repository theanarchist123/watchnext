import { Explain, ModuleChip } from "../../ui/explain";
import { DataNote } from "../../ui/states";
import { getSummary } from "../../../lib/summary";

export default function ScalePage() {
  const benchmarks = getSummary()?.analytics?.benchmarks ?? [];
  return <div className="page-shell booth-page"><section className="content-section"><ModuleChip>MODULE 1 · BIG DATA FOUNDATIONS</ModuleChip><p className="eyebrow">F8 · BENCHMARK LAB</p><h1>The Scale<br /><em>Race.</em></h1><Explain title="Explain it simply">The same aggregation is timed across data sizes. A missing pandas value is an honest memory-limit outcome, not a guessed number.</Explain><DataNote>Benchmark values are preparation artifacts and remain labeled until the Spark runner records the machine, partitions and command used.</DataNote><div className="table-wrap"><table><thead><tr><th>DATA SIZE</th><th>PANDAS</th><th>SPARK</th><th>PARTITION TRIALS</th></tr></thead><tbody>{benchmarks.map(item => <tr key={item.size}><td>{item.size}</td><td>{item.pandasSeconds ? `${item.pandasSeconds}s` : "stalled / OOM"}</td><td>{item.sparkSeconds}s</td><td>{item.partitions.join(" · ")}</td></tr>)}</tbody></table></div></section></div>;
}
