import { NextResponse } from "next/server";
import { getCatalogue } from "../../../lib/catalogue";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim().toLocaleLowerCase() ?? "";
  if (query.length < 2) return NextResponse.json({ movies: [] });
  const movies = getCatalogue()
    .filter(movie => movie.title.toLocaleLowerCase().includes(query))
    .slice(0, 12);
  return NextResponse.json({ movies });
}
