
import json
import sqlite3
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
SOURCE = BASE / "pipeline" / "output" / "als_recommendations.json"
DB_PATH = BASE / "pipeline" / "output" / "recommendations.db"

if not SOURCE.exists():
    raise FileNotFoundError(f"Missing recommendations file: {SOURCE}")

if DB_PATH.exists():
    DB_PATH.unlink()

conn = sqlite3.connect(DB_PATH)
conn.execute("""
    CREATE TABLE recommendations (
        user_id INTEGER NOT NULL,
        movie_id INTEGER NOT NULL,
        rank INTEGER NOT NULL,
        predicted_rating REAL NOT NULL,
        title TEXT NOT NULL,
        genres TEXT,
        reason TEXT
    )
""")
conn.execute("""
    CREATE INDEX idx_recommendations_user_rank
    ON recommendations(user_id, rank)
""")

decoder = json.JSONDecoder()
count = 0
batch = []
batch_size = 5000

print("Building recommendation database...")

with SOURCE.open("r", encoding="utf-8") as f:
    buffer = ""
    started = False
    finished = False

    while not finished:
        chunk = f.read(1024 * 1024)

        if chunk:
            buffer += chunk
        else:
            finished = True

        if not started:
            buffer = buffer.lstrip()
            if not buffer:
                continue
            if buffer[0] != "[":
                raise ValueError("Expected a JSON array.")
            buffer = buffer[1:]
            started = True

        while True:
            buffer = buffer.lstrip()

            if buffer.startswith("]"):
                finished = True
                break

            if buffer.startswith(","):
                buffer = buffer[1:]
                continue

            if not buffer:
                break

            try:
                item, end = decoder.raw_decode(buffer)
            except json.JSONDecodeError:
                if finished:
                    raise
                break

            batch.append((
                int(item["user_id"]),
                int(item["movie_id"]),
                int(item["rank"]),
                float(item["predicted_rating"]),
                str(item.get("title", "")),
                json.dumps(item.get("genres", []), ensure_ascii=False),
                str(item.get("reason", "ALS recommendation"))
            ))

            buffer = buffer[end:]
            count += 1

            if len(batch) >= batch_size:
                conn.executemany(
                    "INSERT INTO recommendations VALUES (?, ?, ?, ?, ?, ?, ?)",
                    batch
                )
                conn.commit()
                batch.clear()
                print(f"Imported {count:,} recommendations")

if batch:
    conn.executemany(
        "INSERT INTO recommendations VALUES (?, ?, ?, ?, ?, ?, ?)",
        batch
    )
    conn.commit()

conn.close()
print(f"Finished. Imported {count:,} recommendations.")
print(f"Database: {DB_PATH}")
