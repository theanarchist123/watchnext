import fs from "node:fs";
import path from "node:path";

export type Movie = { id: number; title: string; genres: string[]; ratingCount: number; averageRating: number };

export function getCatalogue(): Movie[] {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "generated", "catalogue.json"), "utf8")) as Movie[];
  } catch {
    return [];
  }
}

export function cleanTitle(title: string) {
  return title.replace(/^"|"$/g, "").replace(/, The \((\d{4})\)$/, " (The, $1)");
}
