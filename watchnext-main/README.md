# WatchNext

WatchNext is a MovieLens-powered movie discovery and recommendation platform. It combines a React/Vite frontend with a FastAPI backend that serves the movie catalogue, profile-specific recommendations, poster metadata, ratings, and analytics.

## Features

- Browse and search the MovieLens catalogue in **Home** and **Explore**.
- Filter Explore results by genres that have available catalogue data.
- View ALS recommendations in **For You** for four demo profiles:
  - Nikhil — MovieLens user `18`
  - Shravanya — MovieLens user `28`
  - Arnav — MovieLens user `40`
  - Karuna — MovieLens user `47`
- Enter any numeric MovieLens user ID on the For You page.
- View movie details, similar movies, community ratings, and profile-specific ratings.
- Resolve verified TMDB posters when available, with a stable cinema-themed fallback when no poster can be verified.
- Review recommendation, rating, genre, activity, interest-drop, and churn-risk analytics.

## Project structure

```text
watchnext-main/
├── backend/
│   └── main.py                 # FastAPI application
├── frontend/
│   ├── src/
│   │   ├── components/         # Shared navigation, cards, grids, and UI
│   │   ├── pages/              # Home, Explore, For You, details, analytics
│   │   └── services/api.js     # Frontend API and poster helpers
│   └── package.json
├── pipeline/
│   ├── output/                 # Local generated data; ignored by Git
│   └── ...                     # MovieLens and analytics pipeline scripts
├── .env.example
└── .gitignore
```

## Requirements

- Node.js 20 or newer
- Python 3.10 or newer
- The local MovieLens/pipeline output files required by the backend
- A TMDB API key for poster enrichment (optional; fallback artwork is used when it is unavailable)

## Start the backend

From the repository's `watchnext-main` directory, open a PowerShell terminal:

```powershell
Set-Location .\backend
$env:TMDB_API_KEY="your-tmdb-api-key"
& "C:\path\to\python.exe" -m uvicorn main:app --host 127.0.0.1 --port 8000
```

The API is available at `http://127.0.0.1:8000`. Interactive API documentation is available at `http://127.0.0.1:8000/docs`.

The backend reads the key from `TMDB_API_KEY`; do not hardcode API keys or commit `.env` files.

## Start the frontend

In a second PowerShell terminal:

```powershell
Set-Location .\frontend
npm install
npm run dev -- --host 127.0.0.1
```

Open the URL printed by Vite, normally `http://127.0.0.1:5173`.

## Build and lint

```powershell
Set-Location .\frontend
npm run lint
npm run build
```

## Important API routes

The frontend uses the FastAPI service for live data, including:

- `GET /api/movies` — catalogue movies
- `GET /api/genres` — genres with available movies
- `GET /api/recommendations/{user_id}` — profile-specific recommendations
- `GET /api/movies/{movie_id}` — movie details
- `GET /api/movies/{movie_id}/similar` — similar movies
- `POST /api/ratings` — submit a profile rating
- Analytics routes for catalogue, rating, activity, interest-drop, and churn data

The frontend keeps MovieLens IDs, titles, years, genres, ranking, predicted ratings, and community ratings from API responses. Poster resolution is shared across Explore, For You, and movie details so the same movie uses the same verified image wherever it appears.

## Runtime data and secrets

Generated pipeline data is intentionally local and is excluded from Git, including:

- `pipeline/output/*.json`
- `pipeline/output/*.db`
- MovieLens datasets and generated summaries
- Python virtual environments
- `node_modules/` and frontend build output
- `.env` and other local environment files

Copy `.env.example` only when you need a local configuration template. Never commit TMDB credentials or generated database files.

## Notes

The application preserves the existing MovieLens/FastAPI API contracts and uses the local pipeline outputs available in the development environment. Hadoop and Spark scripts remain under `pipeline/`; starting the web application does not automatically run the batch pipeline.
