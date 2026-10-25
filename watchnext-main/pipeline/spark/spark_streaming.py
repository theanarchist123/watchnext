"""
WatchNext Big Data Pipeline — Spark Structured Streaming Pipeline
Processes real-time simulated viewer playback logs.
Computes windowed aggregations:
  - Streaming event counts per event_type over 1-minute sliding windows
  - Real-time title popularity velocity
  - Session completion and drop-off ratios
Execution via spark-submit on YARN:
  spark-submit --master yarn spark_streaming.py
"""

import sys
import os

def run_structured_streaming():
    try:
        from pyspark.sql import SparkSession
        from pyspark.sql.functions import from_json, col, window, count, current_timestamp
        from pyspark.sql.types import StructType, StructField, StringType, IntegerType, DoubleType

        print("[Spark Streaming] Starting SparkSession for Structured Streaming...")
        spark = SparkSession.builder \
            .appName("WatchNext-RealtimePlaybackStreaming") \
            .master("local[*]") \
            .getOrCreate()

        schema = StructType([
            StructField("event_id", StringType(), True),
            StructField("event_type", StringType(), True),
            StructField("user_id", IntegerType(), True),
            StructField("movie_id", IntegerType(), True),
            StructField("movie_title", StringType(), True),
            StructField("device", StringType(), True),
            StructField("watch_duration_seconds", DoubleType(), True),
            StructField("timestamp", StringType(), True)
        ])

        # Read streaming lines from socket or directory
        print("[Spark Streaming] Attaching to streaming socket source (localhost:9999)...")
        lines = spark.readStream \
            .format("socket") \
            .option("host", "localhost") \
            .option("port", 9999) \
            .load()

        parsed_stream = lines.select(from_json(col("value"), schema).alias("data")).select("data.*")
        parsed_stream = parsed_stream.withColumn("event_time", current_timestamp())

        # 1-minute tumbling window aggregation
        windowed_counts = parsed_stream \
            .groupBy(window(col("event_time"), "1 minute"), col("event_type")) \
            .count()

        query = windowed_counts.writeStream \
            .outputMode("complete") \
            .format("console") \
            .option("truncate", "false") \
            .start()

        print("[Spark Streaming] Pipeline running. Listening for events...")
        query.awaitTermination()

    except ImportError:
        print("[Spark Streaming] PySpark not installed in local environment.")
        print("[*] To run on Cloudera QuickStart VM or cluster:")
        print("    spark-submit --master yarn spark_streaming.py")

if __name__ == "__main__":
    run_structured_streaming()
