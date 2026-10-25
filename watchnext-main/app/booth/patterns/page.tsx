import { Explain, ModuleChip } from "../../ui/explain";
import { DataNote } from "../../ui/states";
import { getSummary } from "../../../lib/summary";

export default function PatternsPage() {
  const rules = getSummary()?.analytics?.rules ?? [];
  return <div className="page-shell booth-page"><section className="content-section"><ModuleChip>MODULE 5 · DATA MINING</ModuleChip><p className="eyebrow">F10 · FREQUENT ITEMSETS</p><h1>Pattern<br /><em>Explorer.</em></h1><Explain title="Explain it simply">A rule says that when the left-hand genre appears in a basket, the right-hand genre often appears too. Support is frequency, confidence is reliability, and lift compares the rule with chance.</Explain><DataNote>Current cards are a genre-level mining demonstration derived from the real MovieLens catalogue. User-basket PCY, multistage PCY and SON results will replace them in the mining job phase.</DataNote><div className="rule-grid">{rules.map(rule => <article className="rule-card" key={`${rule.left}-${rule.right}`}><span>DOUBLE FEATURE</span><h2>{rule.left} <b>+</b> {rule.right}</h2><div><p><strong>{(rule.support * 100).toFixed(1)}%</strong> support</p><p><strong>{(rule.confidence * 100).toFixed(1)}%</strong> confidence</p><p><strong>{rule.lift.toFixed(2)}×</strong> lift</p></div></article>)}</div></section></div>;
}
