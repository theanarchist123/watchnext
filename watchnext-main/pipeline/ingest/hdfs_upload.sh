#!/bin/bash
# ==============================================================================
# WatchNext Big Data Pipeline — Person 2: HDFS Data Ingestion
# Domain: Entertainment & OTT (MovieLens 32M + TMDB)
# Target Environment: Apache Hadoop 2.x / 3.x (Cloudera QuickStart VM or Native)
# ==============================================================================

set -e

echo "============================================================"
echo " Starting WatchNext HDFS Ingestion Pipeline"
echo " Time: $(date)"
echo "============================================================"

# 1. Check Hadoop CLI availability
if ! command -v hdfs &> /dev/null; then
    echo "[!] 'hdfs' command not found. Ensure Hadoop environment variables (HADOOP_HOME) are set."
    echo "[*] In standalone development mode, raw CSVs are read from local ml-32m directory."
    exit 0
fi

# 2. HDFS Directory Hierarchy (5-Layer Architecture: Raw, Processed, Models)
HDFS_BASE="/watchnext/data"
HDFS_RAW="${HDFS_BASE}/raw"
HDFS_PROCESSED="${HDFS_BASE}/processed"
HDFS_OUTPUT="${HDFS_BASE}/output"

echo "[1/4] Creating HDFS Directory Structure..."
hdfs dfs -mkdir -p ${HDFS_RAW}/movies
hdfs dfs -mkdir -p ${HDFS_RAW}/ratings
hdfs dfs -mkdir -p ${HDFS_RAW}/tags
hdfs dfs -mkdir -p ${HDFS_RAW}/links
hdfs dfs -mkdir -p ${HDFS_PROCESSED}
hdfs dfs -mkdir -p ${HDFS_OUTPUT}

# 3. Ingestion of MovieLens 32M Datasets
LOCAL_DATA_DIR="./ml-32m"
if [ ! -d "${LOCAL_DATA_DIR}" ]; then
    echo "[!] Error: Local data directory ${LOCAL_DATA_DIR} not found!"
    exit 1
fi

echo "[2/4] Uploading raw datasets to HDFS..."
echo "  -> Ingesting movies.csv..."
hdfs dfs -put -f ${LOCAL_DATA_DIR}/movies.csv ${HDFS_RAW}/movies/

echo "  -> Ingesting tags.csv..."
hdfs dfs -put -f ${LOCAL_DATA_DIR}/tags.csv ${HDFS_RAW}/tags/

echo "  -> Ingesting links.csv..."
hdfs dfs -put -f ${LOCAL_DATA_DIR}/links.csv ${HDFS_RAW}/links/

echo "  -> Ingesting ratings.csv (MovieLens 32M)..."
hdfs dfs -put -f ${LOCAL_DATA_DIR}/ratings.csv ${HDFS_RAW}/ratings/

# 4. Verify Ingestion and Replication
echo "[3/4] Verifying HDFS storage and block allocation..."
hdfs dfs -ls -R ${HDFS_RAW}

echo "[4/4] Ingestion Complete. Data is ready for MapReduce, Hive, and Spark processing."
echo "============================================================"
