"""
WatchNext Big Data Pipeline — HBase NoSQL Interface
Manages viewer profiles, latent taste vectors, and personalized recommendation lookups.
Supports dual-mode operation:
  1. Live Apache HBase cluster connection (via happybase / thrift)
  2. Local persistent NoSQL store fallback for standalone development/demo
"""

import os
import json
from datetime import datetime

class HBaseManager:
    def __init__(self, host="127.0.0.1", port=9090):
        self.host = host
        self.port = port
        self.connected = False
        self.connection = None
        self.local_storage_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)), "hbase_local_dump.json"
        )
        self.local_data = {
            "viewer_profiles": {},
            "movie_recs": {},
            "streaming_metrics": {}
        }
        self._load_local_storage()
        self._try_connect()

    def _try_connect(self):
        try:
            import happybase
            self.connection = happybase.Connection(host=self.host, port=self.port, timeout=3000)
            self.connection.open()
            self.connected = True
            print(f"[HBase] Successfully connected to HBase Thrift server at {self.host}:{self.port}")
        except Exception as e:
            self.connected = False
            print(f"[HBase] Native HBase cluster not reachable ({e}). Operating in Local Fast-Lookup Mode.")

    def _load_local_storage(self):
        if os.path.exists(self.local_storage_path):
            try:
                with open(self.local_storage_path, "r", encoding="utf-8") as f:
                    self.local_data = json.load(f)
            except Exception:
                pass

    def _save_local_storage(self):
        with open(self.local_storage_path, "w", encoding="utf-8") as f:
            json.dump(self.local_data, f, indent=2)

    def put_viewer_profile(self, user_id, tier, genre_affinities, avg_rating):
        """
        Stores viewer profile into 'viewer_profiles' table:
          Row Key: user_{user_id}
          Column Family 'info': tier, created_at
          Column Family 'taste': top_genres
          Column Family 'history': avg_rating
        """
        row_key = f"user_{user_id}"
        if self.connected:
            try:
                table = self.connection.table("viewer_profiles")
                data = {
                    b"info:tier": tier.encode("utf-8"),
                    b"info:updated_at": datetime.utcnow().isoformat().encode("utf-8"),
                    b"taste:genres": json.dumps(genre_affinities).encode("utf-8"),
                    b"history:avg_rating": str(avg_rating).encode("utf-8")
                }
                table.put(row_key.encode("utf-8"), data)
                return True
            except Exception as e:
                print(f"[HBase] Put error: {e}")

        # Local storage fallback
        self.local_data["viewer_profiles"][row_key] = {
            "tier": tier,
            "genre_affinities": genre_affinities,
            "avg_rating": avg_rating,
            "updated_at": datetime.utcnow().isoformat()
        }
        self._save_local_storage()
        return True

    def put_recommendations(self, user_id, rec_movie_ids, algorithm="ALS_Collaborative_Filtering"):
        """
        Stores precomputed recommendations into 'movie_recs' table:
          Row Key: user_{user_id}
          Column Family 'recs': list of recommended movie IDs
          Column Family 'context': algorithm name & timestamp
        """
        row_key = f"user_{user_id}"
        if self.connected:
            try:
                table = self.connection.table("movie_recs")
                data = {
                    b"recs:movie_ids": json.dumps(rec_movie_ids).encode("utf-8"),
                    b"context:algorithm": algorithm.encode("utf-8"),
                    b"context:timestamp": datetime.utcnow().isoformat().encode("utf-8")
                }
                table.put(row_key.encode("utf-8"), data)
                return True
            except Exception as e:
                print(f"[HBase] Put recs error: {e}")

        self.local_data["movie_recs"][row_key] = {
            "movie_ids": rec_movie_ids,
            "algorithm": algorithm,
            "timestamp": datetime.utcnow().isoformat()
        }
        self._save_local_storage()
        return True

    def get_recommendations(self, user_id):
        """
        Retrieves precomputed recommendations for a given user from HBase.
        """
        row_key = f"user_{user_id}"
        if self.connected:
            try:
                table = self.connection.table("movie_recs")
                row = table.row(row_key.encode("utf-8"))
                if row:
                    ids = json.loads(row.get(b"recs:movie_ids", b"[]").decode("utf-8"))
                    algo = row.get(b"context:algorithm", b"ALS").decode("utf-8")
                    return {"user_id": user_id, "recommendations": ids, "source": f"HBase ({algo})"}
            except Exception as e:
                print(f"[HBase] Get recs error: {e}")

        entry = self.local_data["movie_recs"].get(row_key)
        if entry:
            return {
                "user_id": user_id,
                "recommendations": entry["movie_ids"],
                "source": f"HBase Store ({entry['algorithm']})"
            }
        return None

    def get_viewer_profile(self, user_id):
        row_key = f"user_{user_id}"
        return self.local_data["viewer_profiles"].get(row_key)

    def close(self):
        if self.connected and self.connection:
            self.connection.close()

if __name__ == "__main__":
    mgr = HBaseManager()
    mgr.put_viewer_profile(1, "Power (500+)", ["Action", "Sci-Fi", "Thriller"], 4.25)
    mgr.put_recommendations(1, [6, 8, 3, 21, 24, 10, 18, 28, 19, 16])
    recs = mgr.get_recommendations(1)
    print("Retrieved from HBase:", recs)
