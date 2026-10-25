"""
WatchNext Big Data Pipeline — MapReduce Job 2: Movie Rating Aggregation
Computes rating count, average rating, and score distributions per movie.
Hadoop Streaming Command:
  hadoop jar hadoop-streaming.jar \
    -file mr_movie_ratings.py \
    -mapper "python mr_movie_ratings.py --mapper" \
    -reducer "python mr_movie_ratings.py --reducer" \
    -input /watchnext/data/raw/ratings/ratings.csv \
    -output /watchnext/data/output/movie_stats
"""

import sys
import os
import csv
import json

def mapper():
    """
    Input: ratings.csv rows (userId, movieId, rating, timestamp)
    Output: movieId\t<rating>
    """
    for line in sys.stdin:
        line = line.strip()
        if not line or line.startswith("userId"):
            continue
        parts = line.split(",")
        if len(parts) >= 3:
            mid = parts[1].strip()
            rating = parts[2].strip()
            print(f"{mid}\t{rating}")

def reducer():
    """
    Input: sorted movieId\t<rating> stream
    Output: movieId\t<count>\t<avg_rating>
    """
    current_mid = None
    count = 0
    rating_sum = 0.0

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        parts = line.split("\t")
        if len(parts) != 2:
            continue
        mid, rating_str = parts[0], parts[1]
        try:
            rating = float(rating_str)
        except ValueError:
            continue

        if current_mid == mid:
            count += 1
            rating_sum += rating
        else:
            if current_mid:
                avg = round(rating_sum / count, 2)
                print(f"{current_mid}\t{count}\t{avg}")
            current_mid = mid
            count = 1
            rating_sum = rating

    if current_mid:
        avg = round(rating_sum / count, 2)
        print(f"{current_mid}\t{count}\t{avg}")

def run_standalone(limit=300000):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.dirname(os.path.dirname(script_dir))
    ratings_path = os.path.join(base_dir, "ml-32m", "ratings.csv")
    movies_path = os.path.join(base_dir, "ml-32m", "movies.csv")

    print("[MapReduce] Running Movie Rating Aggregation Job...")
    
    # Load movie titles
    movie_meta = {}
    if os.path.exists(movies_path):
        with open(movies_path, "r", encoding="utf-8") as f:
            reader = csv.reader(f)
            next(reader, None)
            for row in reader:
                if len(row) >= 3:
                    movie_meta[row[0].strip()] = {
                        "title": row[1].strip(),
                        "genres": row[2].strip().split("|")
                    }

    movie_stats = {}
    row_count = 0
    with open(ratings_path, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        next(reader, None)
        for row in reader:
            if len(row) < 3:
                continue
            row_count += 1
            mid = row[1].strip()
            try:
                rating = float(row[2].strip())
            except ValueError:
                continue

            if mid not in movie_stats:
                movie_stats[mid] = {"count": 0, "sum": 0.0}
            movie_stats[mid]["count"] += 1
            movie_stats[mid]["sum"] += rating

            if limit and row_count >= limit:
                break

    results = []
    for mid, stats in movie_stats.items():
        if stats["count"] >= 10:  # Minimum count filter
            avg = round(stats["sum"] / stats["count"], 2)
            meta = movie_meta.get(mid, {"title": f"Movie {mid}", "genres": ["Unknown"]})
            results.append({
                "movie_id": int(mid) if mid.isdigit() else mid,
                "title": meta["title"],
                "genres": meta["genres"],
                "rating_count": stats["count"],
                "avg_rating": avg
            })

    # Sort by rating count descending
    results.sort(key=lambda x: (x["avg_rating"], x["rating_count"]), reverse=True)

    out_file = os.path.join(os.path.dirname(script_dir), "output", "mr_movie_ratings.json")
    os.makedirs(os.path.dirname(out_file), exist_ok=True)
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(results[:100], f, indent=2)

    print(f"[MapReduce] Finished. Processed {row_count:,} ratings. Top movies exported to {out_file}")
    return results

if __name__ == "__main__":
    if "--mapper" in sys.argv:
        mapper()
    elif "--reducer" in sys.argv:
        reducer()
    else:
        run_standalone()
