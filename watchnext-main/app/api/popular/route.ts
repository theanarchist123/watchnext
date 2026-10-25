import { NextResponse } from "next/server";
import { getCatalogue } from "../../../lib/catalogue";

export const dynamic = "force-dynamic";
export function GET() {
  return NextResponse.json({ movies: getCatalogue().slice(0, 20) });
}
