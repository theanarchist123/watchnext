-- =============================================================================
-- WatchNext Big Data Pipeline — Hive DDL Schema
-- Defines external tables mapped to MovieLens 32M datasets stored in HDFS
-- Execution: hive -f schema.hql
-- =============================================================================

CREATE DATABASE IF NOT EXISTS watchnext_db;
USE watchnext_db;

-- 1. Movies External Table
CREATE EXTERNAL TABLE IF NOT EXISTS movies (
    movie_id INT,
    title STRING,
    genres STRING
)
ROW FORMAT SERDE 'org.apache.hadoop.hive.serde2.OpenCSVSerde'
WITH SERDEPROPERTIES (
   "separatorChar" = ",",
   "quoteChar"     = "\"",
   "escapeChar"    = "\\"
)
STORED AS TEXTFILE
LOCATION '/watchnext/data/raw/movies'
TBLPROPERTIES ("skip.header.line.count"="1");

-- 2. Ratings External Table (MovieLens 32M)
CREATE EXTERNAL TABLE IF NOT EXISTS ratings (
    user_id INT,
    movie_id INT,
    rating DOUBLE,
    rating_timestamp BIGINT
)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ','
STORED AS TEXTFILE
LOCATION '/watchnext/data/raw/ratings'
TBLPROPERTIES ("skip.header.line.count"="1");

-- 3. Tags External Table (Unstructured User Annotations)
CREATE EXTERNAL TABLE IF NOT EXISTS tags (
    user_id INT,
    movie_id INT,
    tag STRING,
    tag_timestamp BIGINT
)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ','
STORED AS TEXTFILE
LOCATION '/watchnext/data/raw/tags'
TBLPROPERTIES ("skip.header.line.count"="1");

-- 4. Links External Table (TMDB & IMDb Mapping)
CREATE EXTERNAL TABLE IF NOT EXISTS links (
    movie_id INT,
    imdb_id STRING,
    tmdb_id STRING
)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ','
STORED AS TEXTFILE
LOCATION '/watchnext/data/raw/links'
TBLPROPERTIES ("skip.header.line.count"="1");

SHOW TABLES;
DESCRIBE FORMATTED movies;
DESCRIBE FORMATTED ratings;
