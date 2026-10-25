import { NextResponse } from "next/server";
import { getCatalogue } from "../../../lib/catalogue";

export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return request.json().then(({ shelf = [], filters = {}, excluded = [] }) => {
    const liked = new Set<number>(shelf.filter((item: { feeling: string }) => item.feeling === "love").map((item: { id: number }) => item.id));
    const disliked = new Set<number>(shelf.filter((item: { feeling: string }) => item.feeling === "nope").map((item: { id: number }) => item.id));
    const likedMovies = getCatalogue().filter(movie => liked.has(movie.id));
    const dislikedMovies = getCatalogue().filter(movie => disliked.has(movie.id));
    const genres = new Map<string, number>();
    likedMovies.forEach(movie => movie.genres.forEach(genre => genres.set(genre, (genres.get(genre) ?? 0) + 1)));
    const avoidedGenres = new Map<string, number>();
    dislikedMovies.forEach(movie => movie.genres.forEach(genre => avoidedGenres.set(genre, (avoidedGenres.get(genre) ?? 0) + 1)));
    const results = getCatalogue()
      .filter(movie => !liked.has(movie.id) && !disliked.has(movie.id) && !excluded.includes(movie.id))
      .filter(movie => !filters.genre || movie.genres.includes(filters.genre))
      .filter(movie => !filters.era || (filters.era === "Classics" ? year(movie) < 1980 : filters.era === "2000s" ? year(movie) >= 2000 && year(movie) < 2010 : year(movie) >= 2010))
      .map(movie => ({ ...movie, match: matchScore(movie, genres, avoidedGenres, likedMovies) }))
      .sort((a, b) => b.match - a.match || b.ratingCount - a.ratingCount)
      .slice(0, 5);
    return NextResponse.json({ movies: results });
  });
}

function year(movie: { title: string }) { return Number(movie.title.match(/\((\d{4})\)/)?.[1] ?? 0); }
function matchScore(movie: { genres: string[]; averageRating: number }, genres: Map<string, number>, avoidedGenres: Map<string, number>, liked: Array<{ averageRating: number; personalRating?: number }>) {
  if (liked.length === 0 && avoidedGenres.size === 0) return movie.averageRating;
  const familiarity = movie.genres.reduce((sum, genre) => sum + (genres.get(genre) ?? 0), 0) / Math.max(1, liked.length);
  const avoidance = movie.genres.reduce((sum, genre) => sum + (avoidedGenres.get(genre) ?? 0), 0) / Math.max(1, avoidedGenres.size);
  const personalBaseline = liked.length ? liked.reduce((sum, item) => sum + (item.personalRating ?? item.averageRating), 0) / liked.length : 3.5;
  return Math.min(5, Math.max(0.5, movie.averageRating * 0.65 + personalBaseline * 0.2 + Math.min(familiarity, 1) * 0.15 - Math.min(avoidance, 1) * 0.4));
}
