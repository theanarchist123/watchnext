"""
WatchNext Big Data Pipeline — MapReduce Job 4: User Activity & Segmentation
Aggregates rating volume per user and segments viewers into engagement tiers:
  - Casual (<20 ratings)
  - Regular (20-100 ratings)
  - Active (100-500 ratings)
  - Power (500+ ratings)
Hadoop Streaming Command:
  hadoop jar hadoop-streaming.jar \
    -file mr_user_activity.py \
    -mapper "python mr_user_activity.py --mapper" \
    -reducer "python mr_user_activity.py --reducer" \
    -input /watchnext/data/raw/ratings/ratings.csv \
    -output /watchnext/data/output/user_segments
"""

import sys
import os
import csv
import json

def mapper():
    """
    Input: ratings.csv rows (userId, movieId, rating, timestamp)
    Output: userId\t1
    """
    for line in sys.stdin:
        line = line.strip()
        if not line or line.startswith("userId"):
            continue
        parts = line.split(",")
        if len(parts) >= 1:
            uid = parts[0].strip()
            print(f"{uid}\t1")

def reducer():
    """
    Input: sorted userId\t1 stream
    Output: userId\t<total_ratings>\t<segment>
    """
    current_uid = None
    count = 0

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        parts = line.split("\t")
        if len(parts) != 2:
            continue
        uid = parts[0]

        if current_uid == uid:
            count += 1
        else:
            if current_uid:
                segment = categorize(count)
                print(f"{current_uid}\t{count}\t{segment}")
            current_uid = uid
            count = 1

    if current_uid:
        segment = categorize(count)
        print(f"{current_uid}\t{count}\t{segment}")

def categorize(count):
    if count < 20:
        return "Casual (<20 ratings)"
    elif count <= 100:
        return "Regular (20-100)"
    elif count <= 500:
        return "Active (100-500)"
    else:
        return "Power (500+)"

def run_standalone(limit=300000):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.dirname(os.path.dirname(script_dir))
    ratings_path = os.path.join(base_dir, "ml-32m", "ratings.csv")

    print("[MapReduce] Running User Activity & Segmentation Job...")
    user_counts = {}
    row_count = 0

    with open(ratings_path, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        next(reader, None)
        for row in reader:
            if not row:
                continue
            row_count += 1
            uid = row[0].strip()
            user_counts[uid] = user_counts.get(uid, 0) + 1
            if limit and row_count >= limit:
                break

    segment_counts = {
        "Casual (<20 ratings)": 0,
        "Regular (20-100)": 0,
        "Active (100-500)": 0,
        "Power (500+)": 0
    }

    for uid, c in user_counts.items():
        seg = categorize(c)
        segment_counts[seg] += 1

    formatted = [
        {"segment": seg, "count": count}
        for seg, count in segment_counts.items()
    ]

    out_file = os.path.join(os.path.dirname(script_dir), "output", "mr_user_segments.json")
    os.makedirs(os.path.dirname(out_file), exist_ok=True)
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(formatted, f, indent=2)

    print(f"[MapReduce] Finished. Segmented {len(user_counts):,} unique users.")
    print(f"[MapReduce] Output written to {out_file}")
    return formatted

if __name__ == "__main__":
    if "--mapper" in sys.argv:
        mapper()
    elif "--reducer" in sys.argv:
        reducer()
    else:
        run_standalone()
