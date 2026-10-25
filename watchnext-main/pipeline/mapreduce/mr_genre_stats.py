"""
WatchNext Big Data Pipeline — MapReduce Job 1: Genre Rating Statistics
Computes rating frequency and average rating for each movie genre.
Compatible with standard Hadoop Streaming:
  hadoop jar hadoop-streaming.jar \
    -file mr_genre_stats.py \
    -mapper "python mr_genre_stats.py --mapper" \
    -reducer "python mr_genre_stats.py --reducer" \
    -input /watchnext/data/raw/ratings/ratings.csv \
    -output /watchnext/data/output/genre_stats
Or run directly in Python:
  python mr_genre_stats.py --run
"""

import sys
import os
import csv
import json

def load_movie_genres(movies_csv_path):
    """Loads movieId -> list of genres from movies.csv for the mapper lookup."""
    movie_genres = {}
    if not os.path.exists(movies_csv_path):
        return movie_genres
    with open(movies_csv_path, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        next(reader, None)
        for row in reader:
            if len(row) >= 3:
                mid = row[0].strip()
                genres = row[2].strip().split("|")
                movie_genres[mid] = [g for g in genres if g and g != "(no genres listed)"]
    return movie_genres

def mapper():
    """
    Input: ratings.csv rows (userId, movieId, rating, timestamp)
    Output: key-value pairs formatted as: genre\t<rating>
    """
    # Try locating movies.csv relative to this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.dirname(os.path.dirname(script_dir))
    movies_path = os.path.join(base_dir, "ml-32m", "movies.csv")
    movie_genres = load_movie_genres(movies_path)

    for line in sys.stdin:
        line = line.strip()
        if not line or line.startswith("userId"):
            continue
        parts = line.split(",")
        if len(parts) >= 3:
            mid = parts[1].strip()
            try:
                rating = float(parts[2].strip())
            except ValueError:
                continue
            
            genres = movie_genres.get(mid, ["Unknown"])
            for g in genres:
                print(f"{g}\t{rating}")

def reducer():
    """
    Input: sorted genre\t<rating> stream
    Output: genre\t<count>\t<avg_rating>
    """
    current_genre = None
    count = 0
    rating_sum = 0.0

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        parts = line.split("\t")
        if len(parts) != 2:
            continue
        genre, rating_str = parts[0], parts[1]
        try:
            rating = float(rating_str)
        except ValueError:
            continue

        if current_genre == genre:
            count += 1
            rating_sum += rating
        else:
            if current_genre:
                avg = round(rating_sum / count, 2)
                print(f"{current_genre}\t{count}\t{avg}")
            current_genre = genre
            count = 1
            rating_sum = rating

    if current_genre:
        avg = round(rating_sum / count, 2)
        print(f"{current_genre}\t{count}\t{avg}")

def run_standalone(limit=300000):
    """Executes the mapper and reducer in memory for local verification."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.dirname(os.path.dirname(script_dir))
    movies_path = os.path.join(base_dir, "ml-32m", "movies.csv")
    ratings_path = os.path.join(base_dir, "ml-32m", "ratings.csv")

    print("[MapReduce] Running Genre Statistics Job...")
    movie_genres = load_movie_genres(movies_path)
    
    genre_data = {}
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

            genres = movie_genres.get(mid, ["Unknown"])
            for g in genres:
                if g not in genre_data:
                    genre_data[g] = {"count": 0, "sum": 0.0}
                genre_data[g]["count"] += 1
                genre_data[g]["sum"] += rating

            if limit and row_count >= limit:
                break

    results = []
    for g, stats in sorted(genre_data.items(), key=lambda x: x[1]["count"], reverse=True):
        avg = round(stats["sum"] / max(stats["count"], 1), 2)
        results.append({"genre": g, "count": stats["count"], "avg_rating": avg})

    out_file = os.path.join(os.path.dirname(script_dir), "output", "mr_genre_stats.json")
    os.makedirs(os.path.dirname(out_file), exist_ok=True)
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print(f"[MapReduce] Finished. Processed {row_count:,} ratings across {len(results)} genres.")
    print(f"[MapReduce] Output written to {out_file}")
    return results

if __name__ == "__main__":
    if "--mapper" in sys.argv:
        mapper()
    elif "--reducer" in sys.argv:
        reducer()
    else:
        run_standalone()
