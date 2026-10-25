# WatchNext - Big Data Analytics & Movie Recommendation System

A Big Data Analytics project that processes large-scale movie ratings to generate personalized movie recommendations and derive insights into movie preferences, genre trends, and user activity.

WatchNext combines the Hadoop ecosystem, Apache Spark, collaborative filtering, a FastAPI backend, and a React frontend to demonstrate how large-scale data processing and machine learning can power a personalized movie discovery platform.

## Project Objectives

- Process and analyze the MovieLens 20M dataset containing millions of movie ratings.
- Explore distributed data processing using Hadoop HDFS, Hive, MapReduce, and Apache Spark.
- Build a personalized movie recommendation system using Alternating Least Squares (ALS) collaborative filtering.
- Analyze movie popularity, genre distributions, ratings, and recommendation patterns.
- Present recommendations and analytics through an interactive web application.

## Key Features

### 1. Personalized Movie Recommendations
- Generates ranked recommendations using a pre-trained ALS collaborative filtering model.
- Displays predicted ratings, movie metadata, genres, and recommendation explanations where available.
- Supports multiple demo profiles mapped to MovieLens user IDs.

### 2. Movie Exploration
- Browse and discover movies through a catalogue interface.
- View movie titles, release years, genres, and community ratings where available.
- Display movie posters when verified image metadata is available, with cinema-themed fallback imagery for missing posters.

### 3. Big Data Analytics Dashboard
- Explore genre and rating distributions.
- Review recommendation coverage and model evaluation metrics.
- Examine user activity patterns and recommendation outcomes.
- Present interest-decline indicators and rule-based retention suggestions where supported by the available data.

### 4. Watch Pulse
- Provides an interface for exploring viewing-interest and engagement-related insights.
- Any activity-decline or churn-risk indicators should be interpreted according to their documented data sources and rules, rather than as verified streaming behaviour.

## Technology Stack

| Component | Technologies |
|---|---|
| Dataset | MovieLens 20M |
| Distributed storage | Hadoop HDFS |
| Data querying | Apache Hive |
| Batch processing | Hadoop MapReduce |
| Machine learning | Apache Spark MLlib, ALS collaborative filtering |
| Backend | Python, FastAPI |
| Database | SQLite |
| Frontend | React.js, JavaScript, CSS |
| Development tools | Git, GitHub, VS Code, Oracle VirtualBox |
| Visualization | Frontend analytics dashboards and charts |

## Big Data Processing Pipeline

The project demonstrates a data pipeline for processing large-scale movie ratings and generating recommendation outputs.

1. **Data acquisition:** Obtain the MovieLens 20M dataset, including ratings, movie metadata, tags, and related files.
2. **Distributed storage:** Load supported raw datasets into HDFS for distributed storage and processing.
3. **Data querying:** Use Hive tables and queries to inspect, filter, aggregate, and analyze movie and rating data.
4. **MapReduce processing:** Implement a Hadoop MapReduce job to demonstrate distributed batch computation.
5. **Model training:** Prepare rating data, split it into training and testing sets, and train an ALS collaborative filtering model using PySpark.
6. **Model evaluation:** Calculate Root Mean Squared Error (RMSE) on the held-out test dataset.
7. **Output generation:** Export recommendation results and analytical summaries to structured files.
8. **Application integration:** Store enriched recommendation results in SQLite and expose them through FastAPI endpoints.
9. **Visualization:** Use the React frontend to display recommendations, movie information, and analytical insights.

**Architecture note:** Recommendation results are precomputed and served by the backend. Hadoop, Hive, and Spark are part of the data-processing and model-generation workflow; the application does not need to rerun the entire Big Data pipeline for every page request.

## Dataset

**MovieLens 20M Dataset**

The dataset contains approximately 20 million ratings collected from MovieLens users, alongside movie metadata and tags.

Dataset source: [MovieLens — GroupLens Research](https://grouplens.org/datasets/movielens/20m/)

The project uses the following files where required by the pipeline:

- `rating.csv` — user ratings, movie IDs, and timestamps.
- `movie.csv` — movie titles and genres.
- `tag.csv` — user-generated movie tags.
- `genome_scores.csv` — movie relevance scores for tags.
- `genome_tags.csv` — tag identifiers and descriptions.
- `link.csv` — links to external movie database identifiers.

## ALS Recommendation Model

The recommendation model uses Alternating Least Squares (ALS), a collaborative filtering technique that learns latent user and movie representations from rating data.

### Training configuration

| Parameter | Value |
|---|---:|
| Algorithm | ALS collaborative filtering |
| Rank | 10 |
| Maximum iterations | 10 |
| Regularization parameter | 0.1 |
| Random seed | 42 |
| Training ratings | 15,998,138 |
| Test ratings | 4,002,125 |

### Evaluation results

| Metric | Result |
|---|---:|
| Total ratings | 20,000,263 |
| Distinct movies | 26,744 |
| Distinct users with generated recommendations | 138,493 |
| Recommendations generated | 1,384,930 |
| Recommendations per user | 10 |
| Test RMSE | 0.81788 |

RMSE measures the difference between predicted and actual ratings on the test set. A lower RMSE indicates smaller prediction errors on that evaluation dataset.

These figures describe the recorded model run and generated outputs; they are not a claim of real-time model training.

## Project Structure

The repository contains the application, data-processing artifacts, and generated recommendation outputs. The main directories are organised as follows:

```text
WATCHNEXT-MAIN/
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── App.jsx
├── backend/
│   └── main.py
├── pipeline/
│   └── output/
│       ├── als_recommendations.json
│       ├── als_metrics.json
│       ├── trending.json
│       ├── genre_stats.json
│       └── recommendations.db
└── README.md
```

The separate data-processing workspace contains the dataset, processing scripts, and additional generated outputs. File availability may differ depending on the local setup and what is committed to version control.

## Running the Application Locally

### Prerequisites

- Python 3.10 or a compatible Python version.
- Node.js and npm.
- The project's backend dependencies.
- The generated recommendation database and required output files.

The React application and FastAPI backend can run locally without restarting the complete Hadoop/Spark processing workflow, provided the required precomputed outputs are available.

### 1. Start the backend

Open a terminal in the backend directory:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment on Windows:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install the backend dependencies using the project's dependency file, if provided:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn main:app --reload
```

The default local API address is:

`http://127.0.0.1:8000`

Interactive API documentation is generally available at:

`http://127.0.0.1:8000/docs`

### 2. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local development URL printed by Vite, typically:

`http://127.0.0.1:5173`

