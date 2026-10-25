"""
WatchNext Big Data Pipeline — MapReduce Job 3: Item-Item Co-occurrence & Similarity
Computes co-occurrence counts and Jaccard similarity between movies based on viewer ratings.
Powers the 'Because you watched X' recommendation feature.
Hadoop Streaming Command:
  hadoop jar hadoop-streaming.jar \
    -file mr_item_similarity.py \
    -mapper "python mr_item_similarity.py --mapper" \
    -reducer "python mr_item_similarity.py --reducer" \
    -input /watchnext/data/raw/ratings/ratings.csv \
    -output /watchnext/data/output/item_similarity
"""

import sys
import os
import csv
import json
from collections import defaultdict
import itertools

def mapper():
    """
    Input: ratings.csv rows (userId, movieId, rating, timestamp)
    Emits: userId\tmovieId (for ratings >= 3.5 to filter for positive affinities)
    """
    for line in sys.stdin:
        line = line.strip()
        if not line or line.startswith("userId"):
            continue
        parts = line.split(",")
        if len(parts) >= 3:
            uid, mid, rating_str = parts[0].strip(), parts[1].strip(), parts[2].strip()
            try:
                rating = float(rating_str)
                if rating >= 3.5:
                    print(f"{uid}\t{mid}")
            except ValueError:
                continue

def reducer():
    """
    Input: sorted userId\tmovieId stream
    Groups movies watched by each user, emits movie pairs (midA, midB)\t1
    Then reduces to co-occurrence counts.
    """
    current_uid = None
    user_movies = []

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        parts = line.split("\t")
        if len(parts) != 2:
            continue
        uid, mid = parts[0], parts[1]

        if current_uid == uid:
            user_movies.append(mid)
        else:
            if current_uid and len(user_movies) > 1:
                # Emit all movie pairs
                for pair in itertools.combinations(sorted(set(user_movies)), 2):
                    print(f"{pair[0]},{pair[1]}\t1")
            current_uid = uid
            user_movies = [mid]

    if current_uid and len(user_movies) > 1:
        for pair in itertools.combinations(sorted(set(user_movies)), 2):
            print(f"{pair[0]},{pair[1]}\t1")

def run_standalone(user_limit=1000):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.dirname(os.path.dirname(script_dir))
    ratings_path = os.path.join(base_dir, "ml-32m", "ratings.csv")

    print(f"[MapReduce] Running Item-to-Item Similarity Job (sample of {user_limit} users)...")
    user_likes = defaultdict(set)
    user_set = set()

    with open(ratings_path, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        next(reader, None)
        for row in reader:
            if len(row) < 3:
                continue
            uid, mid = row[0].strip(), row[1].strip()
            try:
                rating = float(row[2].strip())
            except ValueError:
                continue

            if rating >= 3.5:
                user_likes[uid].add(mid)
                user_set.add(uid)
                if len(user_set) >= user_limit:
                    break

    # Movie frequency and co-occurrence counts
    movie_counts = defaultdict(int)
    co_counts = defaultdict(int)

    for uid, movies in user_likes.items():
        movie_list = sorted(list(movies))
        for m in movie_list:
            movie_counts[m] += 1
        for m1, m2 in itertools.combinations(movie_list[:50], 2):
            co_counts[(m1, m2)] += 1

    # Calculate Jaccard similarity: |A ∩ B| / |A ∪ B|
    similarity_map = defaultdict(list)
    for (m1, m2), co_freq in co_counts.items():
        if co_freq >= 3:
            union = movie_counts[m1] + movie_counts[m2] - co_freq
            jaccard = round(co_freq / max(union, 1), 3)
            similarity_map[m1].append({"similar_movie_id": int(m2) if m2.isdigit() else m2, "score": jaccard, "co_views": co_freq})
            similarity_map[m2].append({"similar_movie_id": int(m1) if m1.isdigit() else m1, "score": jaccard, "co_views": co_freq})

    # Sort and keep top 10 similar per movie
    final_output = {}
    for mid, sim_list in similarity_map.items():
        sim_list.sort(key=lambda x: x["score"], reverse=True)
        final_output[mid] = sim_list[:10]

    out_file = os.path.join(os.path.dirname(script_dir), "output", "mr_item_similarity.json")
    os.makedirs(os.path.dirname(out_file), exist_ok=True)
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(final_output, f, indent=2)

    print(f"[MapReduce] Finished. Computed item-item similarity for {len(final_output)} movies.")
    print(f"[MapReduce] Output written to {out_file}")
    return final_output

if __name__ == "__main__":
    if "--mapper" in sys.argv:
        mapper()
    elif "--reducer" in sys.argv:
        reducer()
    else:
        run_standalone()
