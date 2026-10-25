"""
WatchNext Big Data Pipeline — Real-time Playback Event Simulator
Simulates high-velocity viewer clickstream events:
  - 'play' (viewer starts streaming)
  - 'pause' (viewer pauses playback)
  - 'seek' (scrubbing forward/backward)
  - 'skip' (viewer abandons before 20% completion)
  - 'complete' (viewer finishes title)
Outputs events via HTTP POST to FastAPI backend or streams to a TCP Socket for Spark Streaming.
"""

import time
import json
import random
import sys
import os
from datetime import datetime

EVENT_TYPES = ["play", "pause", "seek", "skip", "complete"]

POPULAR_TITLES = [
    {"movie_id": 100, "title": "13 Hours", "runtime": 144},
    {"movie_id": 1, "title": "The Shawshank Redemption", "runtime": 142},
    {"movie_id": 3, "title": "The Dark Knight", "runtime": 152},
    {"movie_id": 18, "title": "Dune 2 (沙丘2)", "runtime": 166},
    {"movie_id": 9, "title": "Goodfellas", "runtime": 145},
    {"movie_id": 8, "title": "The Matrix", "runtime": 136},
    {"movie_id": 6, "title": "Inception", "runtime": 148},
    {"movie_id": 101, "title": "1917", "runtime": 119},
    {"movie_id": 103, "title": "Hacksaw Ridge", "runtime": 139},
    {"movie_id": 4, "title": "Pulp Fiction", "runtime": 154}
]

DEVICE_TYPES = ["Smart TV (Samsung/LG)", "Apple TV 4K", "Mobile (iOS/Android)", "Web Browser", "Fire TV Stick"]

def generate_event():
    movie = random.choice(POPULAR_TITLES)
    evt_type = random.choices(EVENT_TYPES, weights=[45, 15, 10, 10, 20])[0]
    user_id = random.randint(1, 250)

    duration = 0
    if evt_type == "complete":
        duration = movie["runtime"] * 60
    elif evt_type == "skip":
        duration = random.randint(30, 480)
    elif evt_type in ["play", "pause", "seek"]:
        duration = random.randint(60, movie["runtime"] * 45)

    return {
        "event_id": f"evt_{int(time.time()*1000)}_{random.randint(1000, 9999)}",
        "event_type": evt_type,
        "user_id": user_id,
        "movie_id": movie["movie_id"],
        "movie_title": movie["title"],
        "device": random.choice(DEVICE_TYPES),
        "watch_duration_seconds": duration,
        "timestamp": datetime.utcnow().isoformat()
    }

def run_simulation(count=50, delay=0.5, post_to_api=False):
    print("=" * 65)
    print(" WATCHNEXT STREAM SIMULATOR — HIGH VELOCITY EVENT GENERATOR")
    print(f" Emitting {count} simulated OTT playback events (delay: {delay}s)...")
    print("=" * 65)

    events_emitted = 0
    try:
        import urllib.request
        api_url = "http://127.0.0.1:8000/api/events"
    except Exception:
        api_url = None

    for i in range(count):
        evt = generate_event()
        events_emitted += 1
        print(f"[{evt['timestamp'][11:19]}] {evt['event_type'].upper():<8} | User {evt['user_id']:<4} | {evt['movie_title'][:25]:<25} | {evt['device']}")

        if post_to_api and api_url:
            try:
                req = urllib.request.Request(
                    api_url,
                    data=json.dumps(evt).encode("utf-8"),
                    headers={"Content-Type": "application/json"}
                )
                urllib.request.urlopen(req, timeout=1)
            except Exception:
                pass

        time.sleep(delay)

    print(f"\n[Simulator] Completed simulation. {events_emitted} events broadcasted.")

if __name__ == "__main__":
    count = int(sys.argv[1]) if len(sys.argv) > 1 else 30
    run_simulation(count=count, delay=0.2, post_to_api=True)
