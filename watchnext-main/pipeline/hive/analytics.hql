-- =============================================================================
-- WatchNext Big Data Pipeline — Hive Analytical Queries
-- Queries structured MovieLens 32M data in HDFS to generate business metrics
-- Execution: hive -f analytics.hql
-- =============================================================================

USE watchnext_db;

-- 1. Overall Summary Statistics
SELECT 
    COUNT(DISTINCT m.movie_id) AS total_movies,
    COUNT(r.rating) AS total_ratings,
    COUNT(DISTINCT r.user_id) AS unique_users,
    ROUND(AVG(r.rating), 2) AS overall_avg_rating
FROM movies m
JOIN ratings r ON m.movie_id = r.movie_id;

-- 2. Top 15 Highly Rated Movies (Filtered by Minimum 10,000 Ratings for Statistical Significance)
SELECT 
    m.movie_id,
    m.title,
    m.genres,
    COUNT(r.rating) AS rating_count,
    ROUND(AVG(r.rating), 2) AS avg_rating
FROM movies m
JOIN ratings r ON m.movie_id = r.movie_id
GROUP BY m.movie_id, m.title, m.genres
HAVING COUNT(r.rating) >= 10000
ORDER BY avg_rating DESC, rating_count DESC
LIMIT 15;

-- 3. Genre Popularity & Quality Breakdown using LATERAL VIEW explode()
SELECT 
    genre_col AS genre,
    COUNT(r.rating) AS rating_count,
    ROUND(AVG(r.rating), 2) AS avg_rating
FROM movies m
LATERAL VIEW explode(split(m.genres, '\\|')) t AS genre_col
JOIN ratings r ON m.movie_id = r.movie_id
WHERE genre_col != '(no genres listed)'
GROUP BY genre_col
ORDER BY rating_count DESC;

-- 4. Yearly Rating Trends (Temporal Velocity Analysis)
SELECT 
    FROM_UNIXTIME(r.rating_timestamp, 'yyyy') AS rating_year,
    COUNT(r.rating) AS yearly_ratings,
    ROUND(AVG(r.rating), 2) AS yearly_avg_rating
FROM ratings r
GROUP BY FROM_UNIXTIME(r.rating_timestamp, 'yyyy')
ORDER BY rating_year ASC;

-- 5. Viewer Engagement Tier Distribution
SELECT 
    tier,
    COUNT(user_id) AS user_count
FROM (
    SELECT 
        user_id,
        CASE 
            WHEN COUNT(rating) < 20 THEN 'Casual (<20 ratings)'
            WHEN COUNT(rating) <= 100 THEN 'Regular (20-100)'
            WHEN COUNT(rating) <= 500 THEN 'Active (100-500)'
            ELSE 'Power (500+)'
        END AS tier
    FROM ratings
    GROUP BY user_id
) sub
GROUP BY tier
ORDER BY user_count DESC;
