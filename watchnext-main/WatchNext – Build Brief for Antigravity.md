# WatchNext – Build Brief for Antigravity

*Big Data Analytics mini project · Nikhil Kadam · OTT personalized recommendation and viewer engagement analytics*

## 0. How the agent should work

You are building **WatchNext**, a web app backed by a real Big Data pipeline. The pipeline is the point of the project; the website is where every result becomes visible. Follow these working rules throughout.

- Read this entire brief first. Then produce a plan and a task list before touching anything.
- Build in **vertical slices**: each phase in Section 3 delivers backend output plus the page that shows it. Never build all the backend first and all the UI later.
- After each phase, run that phase's acceptance checks, open the running app in the browser, and save screenshots and measured numbers into an `evidence/` folder. The student will use these in the lab report.
- Develop everything on the small MovieLens dataset first. One single configuration switch must change the dataset size (small, 1M subset, 10M subset, full 32M). Never hard-code sizes.
- The website must **never run Spark or heavy computation at request time**. Spark and MapReduce jobs run offline and write results into MongoDB. The API only reads precomputed results, except for the lightweight cold-start step described below.
- Every feature lives behind its own route and fails gracefully, so an unfinished feature never breaks the others.
- Do not commit datasets, API keys or model files to git. Provide a download script and a clear README. Ask the human only for secrets (the TMDB API key).
- Be honest in the UI: wherever a result uses a proxy label, a subset or an estimate, show a small visible note saying so.
- Write a short README section per phase explaining what was built, how to run it, and what assumptions were made.

## 1. Product concept and design language

**Concept:** WatchNext is a cinema where every Big Data algorithm gets a seat. The viewer side feels like a streaming service. The analytics side feels like the **projection booth**, the control room behind the screen where you can see how everything works.

**Tagline:** "Behind every recommendation, a pipeline."

**Visual identity**

- Dark by default. Near-black background, warm amber as the main accent, film-red for alerts and risk, soft cream for text.
- Typography: an elegant cinematic serif for titles and big numbers, a clean sans-serif for body text, and a monospace face for all technical readouts.
- Recurring motifs: film strips, ticket stubs, split-flap boards, a projector light beam, leader countdown loaders (3, 2, 1) for loading states.
- Subtle film-grain overlay on hero areas. Keep animations smooth and purposeful, never decorative noise.
- Fully responsive. The viewer app must work well on a phone; the booth pages may be desktop-first but must not break on tablets.

**Two modes**

- **Viewer mode:** the Netflix-like experience.
- **Booth mode:** a toggle in the header that switches to the analytics and algorithm pages. Every Booth page has a small chip in its header naming the syllabus module it demonstrates (for example "Module 4 · Mining Data Streams"), and a collapsible "Explain it simply" panel that gives a plain-English explanation next to the formal term.

## 2. Architecture and decisions

**Layers (draw this on the Pipeline page)**

1. Sources: MovieLens CSVs, TMDB API responses, simulated playback events.
2. Storage: HDFS (single-node, in Docker) for raw files; MongoDB for metadata, precomputed results and stream output.
3. Processing: Spark (batch, MLlib, Structured Streaming), real MapReduce jobs for the syllabus algorithms, and from-scratch Python implementations for stream and mining algorithms.
4. Serving: FastAPI reading from MongoDB.
5. Presentation: Next.js with Tailwind, Recharts for standard charts, D3 for custom visuals, Framer Motion for animation, and a force-graph library for network views.

**Pattern to follow:** batch layer (heavy, offline) plus speed layer (stream) plus serving layer (MongoDB and API). Explain this on the Pipeline page.

**Dataset scale rules**

- Full 32M ratings: used for Spark aggregations and the scale benchmarks.
- ALS training: use up to roughly 10M ratings if the full set is too heavy for the machine. Record the size used.
- From-scratch algorithms (MapReduce jobs, PCY, SON, DGIM, and so on): run on a 1M-rating subset for demonstration clarity.
- Development: the small dataset only.

**MongoDB collections to create (names are a suggestion; keep them consistent)** movies (with TMDB enrichment), movie\_stats, genre\_stats, yearly\_stats, user\_profiles, recs\_als, recs\_content, recs\_hybrid, similar\_items, item\_factors, trending\_live, stream\_estimates, mr\_job\_results, frequent\_itemsets, association\_rules, user\_segments, pagerank\_scores, hits\_scores, communities, churn\_scores, model\_metrics, benchmarks, pipeline\_status.

**Docker:** one compose setup bringing up HDFS, MongoDB, the API and the frontend, with a Spark job runner available as a separate command. A single command should start the whole demo.

## 3. Build phases

**Phase 0 – Foundation.** Repository structure, compose setup, configuration switch, download script, design system (colors, fonts, base components, the leader-countdown loader, the Module chip, the Explain-it-simply panel), and the app shell with Viewer and Booth navigation. *Accept:* one command starts everything; the empty shell renders in both modes.

**Phase 1 – Data foundation.** Load the CSVs into HDFS. Clean the data and record data-quality counts (duplicates removed, nulls, movies with no TMDB match, tags with noise). Enrich movies through TMDB using the tmdbId in links, with caching and rate-limit handling, and store the results in MongoDB. *Accept:* quality report saved; at least the top several thousand most-rated movies have posters and overviews.

**Phase 2 – Batch analytics and MapReduce.** Spark aggregations for the dashboard, plus the MapReduce jobs listed in feature F9. *Accept:* dashboard collections filled; each MapReduce job has stored inputs, intermediate outputs and results.

**Phase 3 – Recommenders.** Popularity baseline, ALS, item-item similarity, content-based, and hybrid, with the evaluation table. *Accept:* metrics stored for every model; recommendations exist for all users or a defined large sample.

**Phase 4 – Stream algorithms.** Event simulator, Spark Structured Streaming trending, and the four from-scratch stream algorithms with exact-versus-estimate tracking. *Accept:* the live page updates continuously for at least ten minutes without errors.

**Phase 5 – Mining.** PCY, multistage PCY and SON frequent itemsets, association rules, canopy plus clustering, and the SVM churn proxy. *Accept:* itemsets, rules, segments and churn scores stored.

**Phase 6 – Graph analysis.** Movie graph, PageRank (including topic-sensitive), HITS, communities and triangle counts. *Accept:* scores stored; graph page loads under a few seconds with a capped node count.

**Phase 7 – Benchmarks and storytelling pages.** Scale race, Why Big Data walkthrough, HDFS and NoSQL explainers, Pipeline metro map. *Accept:* benchmark numbers stored from real runs, not invented.

**Phase 8 – Polish and evidence.** Empty and error states, performance pass, accessibility pass, README, final screenshots, optional deployment of the frontend and API. *Accept:* the full checklist in Section 6 passes.

## 4. Feature specifications with creative representation

Each feature below gives the data and algorithm, the distinctive way to show it, the interaction, and what proves it works.

### Viewer mode

**F1 – The Marquee (home page)**

- *What:* personalized rows built from ALS, content-based and hybrid recommendations, trending, and genre picks.
- *Representation:* rows look like cinema marquee boards with softly glowing bulb edges. Each poster card has a **ticket-stub flip**: tapping it turns the card over to a "Why this?" stub showing the source (for example "Viewers like you loved this" or "Matches your love of heist plots"), the score, and the exact algorithm used.
- *Interaction:* switch between demo viewers from a profile picker styled as a row of seat numbers.
- *Accept:* every card has a working flip with a correct explanation.

**F2 – Taste Calibration (cold-start onboarding)**

- *What:* a new viewer rates a few movies; the system returns personalized recommendations instantly. Compute the new viewer's vector from their ratings against the already-trained item factors, without retraining.
- *Representation:* a swipe deck of posters with three choices: loved it, it was fine, not seen. As the viewer swipes, a **Taste DNA ring** (a circular genre profile) grows live on the side, so they watch their own taste emerge.
- *Accept:* after about eight swipes the Marquee updates in under a couple of seconds.

**F3 – Constellation ("Because you watched X")**

- *What:* item-item similarity from the co-occurrence matrix multiplication (feature F9).
- *Representation:* the chosen movie sits at the centre of a night sky; similar movies orbit as stars. **Distance equals similarity** and star size equals popularity. Hovering a star draws a thin line back to the centre with the similarity value.
- *Interaction:* click any star to re-centre the constellation on it, so the viewer can wander through the catalogue.
- *Accept:* re-centring works for any movie that has similarity data.

**F4 – Movie page with Mood Ring**

- *What:* TMDB details plus sentiment from tags and TMDB reviews, scored with a lexicon or small transformer.
- *Representation:* a **mood ring** badge that changes colour and label ("Heartwarming", "Divisive", "Dark", "Crowd-pleaser") from the sentiment score and its spread. A small tag cloud from the word-count job sits beside it.
- *Accept:* titles without enough text show a neutral "not enough chatter" state, never a fake score.

### Booth mode: dashboard and scale

**F5 – Box Office Board (KPI dashboard)**

- *What:* total ratings, users, movies, average rating, busiest year, top genre.
- *Representation:* a **split-flap airport board**: numbers flip digit by digit on load, labelled like departure boards.
- *Accept:* all figures match direct counts on the data.

**F6 – Genre River**

- *What:* genre popularity by year from the Spark aggregations.
- *Representation:* a **streamgraph** flowing left to right, where each genre is a coloured river branch. Hovering a branch dims the others and shows its share in that year. A slider scrubs through time and highlights the year's top titles.
- *Accept:* totals per year add up to the yearly stats.

**F7 – Film Strip Histogram**

- *What:* rating distribution overall and per genre.
- *Representation:* bars drawn as **film-strip frames**, each frame a bar. A genre selector swaps the strip with a quick frame-advance animation.
- *Accept:* half-star granularity is shown correctly.

**F8 – The Scale Race**

- *What:* the same aggregation timed in pandas and in Spark across data sizes, plus Spark timing across partition counts.
- *Representation:* a **race track** with two lanes. A size slider (1M, 10M, 32M) and a Run Replay button animate the cars using the real recorded times. Where pandas fails or runs out of memory, the car stalls with a crash marker. A second small chart shows time versus partitions.
- *Accept:* all times come from real benchmark runs stored in the benchmarks collection.

### Booth mode: MapReduce and mining

**F9 – The MapReduce Factory**

- *Jobs to implement as real MapReduce:* word count on tags; grouping and aggregation (rating count and average per movie, per genre); selection (ratings at or above 4); projection; natural join of ratings with movies; union, intersection and difference (for example viewers of movie A and movie B); matrix-vector multiplication (one PageRank step); matrix multiplication in one step and in two steps (item co-occurrence from the user-item matrix).
- *Representation:* an animated **assembly line**. Input splits arrive on the left as crates; mapper workers stamp them with keys; a **conveyor shuffle** sorts crates into bins by key; reducer workers combine each bin into results. A **Combiner switch** shows the shuffle volume shrinking, with the saved record count displayed. A **"Knock out a worker"** button shows a failed mapper's task being re-run elsewhere (node-failure handling).
- *Interaction:* pick a job from a job list; step through the stages with a scrubber; use a small sample to keep the animation readable and show full-run counts beside it.
- *Accept:* each job shows real input, map output, post-shuffle groups and reduce output from stored results.

**F10 – Pattern Explorer (frequent itemsets)**

- *What:* PCY, multistage PCY and SON on viewers' watched or highly-rated movie baskets, with association rules (support, confidence, lift).
- *Representation:* results are **combo meals** ("the double feature", "the triple bill") shown as ticket stubs for each rule. A first-pass panel shows the **PCY hash-bucket bar chart** with frequent buckets lit up, and a counter showing how many candidate pairs were eliminated. A second panel shows SON as **chunks of the data** each producing local candidates, then a global verification pass.
- *Interaction:* sliders for minimum support and confidence update the visible rules.
- *Accept:* results cross-checked against Spark FP-Growth on the same subset.

**F11 – Viewer Tribes (clustering)**

- *What:* users described by genre-preference vectors; canopy clustering as a cheap first pass, then a refined clustering method.
- *Representation:* a **2D map of viewers** (dimensionality-reduced) where each tribe is a coloured region. A toggle overlays the canopy circles to show the cheap first pass. Clicking a tribe opens a **persona card**: a name (for example "The Midnight Thriller Crowd"), top genres, average rating habits and sample favourite movies.
- *Accept:* tribe sizes sum to the viewer count; each persona card is generated from real cluster statistics, not written by hand.

**F12 – Cooling Radar (churn risk, SVM)**

- *What:* a linear SVM on features such as recency, activity trend, rating frequency and genre breadth. **Label is a proxy**: a viewer is marked "lapsed" if they have no activity in the final window of their own timeline. State this on the page.
- *Representation:* a **weather-style radar**. Each viewer is a temperature reading from warm (engaged) to freezing (likely to lapse). A ranked table of coldest viewers shows the top reasons per row. A "win-back" panel suggests titles from that viewer's recommendations.
- *Accept:* held-out accuracy, precision and recall displayed with the proxy-label caveat.

### Booth mode: streams

**F13 – Live Pulse (stream hub)**

- *What:* a simulator replays historical timestamped ratings as play, pause, skip and finish events at an adjustable speed, and Spark Structured Streaming computes windowed trending counts. A start, pause and speed control sits on the page.
- *Representation:* an **ECG heartbeat line** across the top whose rhythm follows events per second, and a **trending leaderboard** beneath it that reshuffles smoothly as ranks change.
- *Accept:* the page runs for ten minutes without freezing, and numbers match a recount on the same window.

Below the pulse sits a row of four mini-labs, each comparing the **exact answer** with the **streaming estimate** and showing the memory each one used.

**F13a – Lucky Draw Drum (reservoir sampling).** A glass drum holding a fixed number of tickets. Each new event either bounces off or knocks a random ticket out. A fairness chart shows the sample's genre mix tracking the true mix.

**F13b – Wall of Lights (Bloom filter).** A grid of bulbs, each a bit. Playing a title lights several bulbs chosen by hash functions. Querying "has this viewer seen this?" lights the checked bulbs and answers "definitely not" or "probably yes". A false-positive rate meter updates as the wall fills. This filter removes already-seen titles from live recommendations.

**F13c – Zero Streak Trophy (Flajolet-Martin).** For each user ID, show the hash in binary and highlight its trailing zeros; a trophy tracks the longest zero streak. Several hash functions each produce an estimate, and the page shows how they are combined into a final distinct-viewer count next to the exact count and the memory saved.

**F13d – Buckets of Time (DGIM).** A timeline of the sliding window with stacked blocks whose sizes are powers of two. When a third block of one size appears, two merge into the next size up, animated. A query slider ("plays of this title in the last N events") shows the estimated count with its error bound against the exact count.

### Booth mode: graphs and recommenders

**F14 – Movie Universe (PageRank and HITS)**

- *What:* a movie-to-movie graph (edge when many viewers like both), capped to a readable size on screen. PageRank with dead-end handling and teleportation, topic-sensitive PageRank per genre, HITS on the viewer-movie bipartite graph, community detection and triangle counts.
- *Representation:* a **force-directed galaxy**. Node size shows PageRank; colour shows community. An **iteration scrubber** replays the rank flowing through the graph step by step until it settles. A teleport slider shows its effect. A mode switch moves to HITS, which splits the view into two sides: **hub viewers** on the left and **authority movies** on the right.
- *Accept:* ranks sum to one; the iteration replay uses real stored iterations.

**F15 – Taste-Off Arena (Model Lab)**

- *What:* popularity baseline, item-item, content-based, ALS and hybrid, compared on RMSE for ratings and Precision, Recall and NDCG at ten for ranking, on a held-out split.
- *Representation:* a **boxing-ring scoreboard** with each model as a contestant and metrics as rounds, winner crowned per metric. Choose any viewer and see all models' top-ten lists **side by side**, with movies shared across lists highlighted.
- *Accept:* all numbers come from one documented evaluation split.

### Booth mode: storytelling pages

**F16 – Why Big Data? (Modules 1 and 2)**

- *Representation:* a scroll story with **five doors**, one per V (Volume, Velocity, Variety, Veracity, Value). Opening each door reveals the matching evidence from the project: file sizes, events per second, the three data formats, the data-quality counts, and the model improvement. A final section compares traditional versus Big Data approaches in a two-column slider.

**F17 – HDFS and NoSQL Explainers**

- *HDFS:* the raw file appears as a **deck of cards** dealt into blocks across three datanodes with replicas shown in matching colours. A "switch off a node" button shows the file still being readable.
- *NoSQL:* four **store-type cards** (key-value, document, column-family, graph), each showing where WatchNext uses or could use it, plus short comparisons for HDFS versus GFS and MongoDB versus other stores.

**F18 – Pipeline Metro Map**

- *Representation:* the architecture drawn as a **subway map**. Each layer is a line, each tool a station (HDFS, MongoDB, Spark, MapReduce, Streaming, API, UI). Stations show last-run time and status from the pipeline\_status collection, and clicking a station opens what it stores or computes. Include a note explaining the batch, speed and serving layers, and a note that the demo runs in single-node mode and scales by configuration.

## 5. Cross-cutting requirements

- **Explainability everywhere:** every recommendation and every algorithm page must answer "how did we get this?" in plain words.
- **Honesty labels:** small, visible notes for proxy labels (churn), subsets (which algorithm ran on how many rows), and estimates (stream algorithms).
- **Performance budgets:** page data should load in a couple of seconds; heavy visuals cap their node or point counts and say so.
- **Empty, loading and error states:** each page has all three, styled in the same cinema language.
- **Accessibility:** keyboard navigation, readable contrast on the dark theme, and a reduced-motion setting that turns off the animations.
- **Consistent module chips and Explain-it-simply panels** on every Booth page.

## 6. Verification and evidence checklist

Before calling the project finished, confirm each of these and save proof in `evidence/`.

1. One command starts the full stack; a fresh clone plus the README is enough to reproduce it.
2. Data-quality report exists and its counts are shown on the Why Big Data page.
3. Dashboard figures match direct counts from the data.
4. All listed MapReduce jobs have stored stage outputs and show on the Factory page.
5. Model Lab shows hybrid and ALS compared fairly with the popularity baseline on one stated split.
6. Cold-start flow returns recommendations quickly without retraining.
7. Live Pulse runs ten minutes without errors; exact-versus-estimate values are shown for all four stream algorithms.
8. Frequent itemsets match the Spark FP-Growth cross-check on the same subset.
9. Graph page loads quickly with a capped node count, and PageRank sums to one.
10. Benchmarks in the Scale Race are real recorded runs.
11. Screenshots captured for every page in both modes, plus the Spark UI showing a job's stages.
12. README lists every assumption, subset size and proxy label.

## 7. What to avoid

- Do not run Spark, MapReduce or model training from the API at request time.
- Do not invent numbers, benchmark times, personas or sentiment labels; derive each from stored results.
- Do not present churn as real cancellation data.
- Do not commit the dataset, API keys or large model files.
- Do not build the stretch features (HITS, triangle counting, SVM churn, Kafka) before the core slice (F1, F2, F3, F5 to F9, F13, F15) works end to end.
- Do not skip the Booth-mode explanations; they are what connects the algorithms to the syllabus.
