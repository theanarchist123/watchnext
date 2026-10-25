import fs from "node:fs";
import path from "node:path";

export type Summary = {
  dataset: string;
  generatedAt: string;
  source: string;
  totals: { ratings: number; users: number; movies: number; averageRating: number; tags: number; links: number };
  topMovies: Array<{ id: number; title: string; genres: string[]; ratingCount: number; averageRating: number }>;
  genres: Array<{ name: string; ratingCount: number; averageRating: number }>;
  yearly: Array<{ year: number; ratingCount: number; averageRating: number }>;
  analytics?: {
    preparationSeconds: number;
    models: Array<{ name: string; rmse: number; precision: number; recall: number; ndcg: number }>;
    stream: { windowEvents: number; exactDistinctViewers: number; reservoirSize: number; bloomBits: number; dgimWindow: number; estimatedDistinctViewers: number; estimatedRecentPlays: number };
    rules: Array<{ left: string; right: string; support: number; confidence: number; lift: number }>;
    tribes: Array<{ name: string; size: number; favoriteGenre: string; averageRating: number }>;
    churn: { proxyLabel: string; accuracy: number; precision: number; recall: number; coldest: Array<{ viewer: string; risk: number; reason: string }> };
    graph: { nodes: Array<{ id: number; label: string; rank: number; community: string }>; edges: Array<{ source: number; target: number; weight: number }>; rankSum: number; triangleCount: number };
    benchmarks: Array<{ size: string; pandasSeconds: number | null; sparkSeconds: number; partitions: number[] }>;
  };
};

export function getSummary(): Summary | null {
  try {
    const file = path.join(process.cwd(), "data", "generated", "summary.json");
    return JSON.parse(fs.readFileSync(file, "utf8")) as Summary;
  } catch {
    return null;
  }
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}
