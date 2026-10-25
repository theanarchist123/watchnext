# WatchNext v2 – Build Brief for Antigravity

*Usable-first rebuild · Nikhil Kadam · BDA mini project on MovieLens 32M and TMDB*

## 0. Read this first: what went wrong and what changes

The first version of WatchNext was a showcase of algorithms: dashboards, labs and explainer pages. A real person opening it did not know what to do. **Version 2 is a consumer product first.** A friend with no technical background must be able to open it on a phone and get a useful answer within ten seconds, without any instructions.

The Big Data pipeline stays, because it is what makes the product work and what the course marks. But it now sits **behind** the product. Users never see words like ALS, MapReduce or Spark. Those appear only on one clearly separated "How it works" page.

**The product in one sentence:** *WatchNext helps you decide what to watch, alone or with friends, in under a minute.*

**Tagline:** "Stop scrolling. Start watching."

## 1. Working rules for the agent

- Read the whole brief first, then write a plan and task list before changing anything.
- **Audit before building.** List every existing route, page, API endpoint and database collection from version 1. Mark each as keep, hide or delete. Do not delete working backend jobs or results; the recommender, similarity data, TMDB enrichment and cleaned data are all reused. Remove every analytics or lab page from the main navigation. Move the ones worth keeping under a single hidden path reachable only from the "How it works" page.
- Build in **vertical slices**: each phase delivers a screen a person can actually use, backed by real data. No phase ends with only backend work.
- Every screen is judged by one test: **can a first-time user figure out what to do in five seconds?** If not, simplify it.
- After each phase, run the app in the browser, test it at phone width and at desktop width, and save screenshots to an `evidence/` folder.
- Heavy computation (Spark, model training, similarity building) runs **offline**. The live app only reads precomputed results and does small, fast calculations (described below).
- Keep API keys on the server side only. Never commit datasets, keys or model files to git.
- Be honest in the interface. If a prediction is uncertain, say so in plain words. If a movie has no streaming information, say that instead of guessing.
- Write a short README section per phase: what it does, how to run it, assumptions made.

## 2. Product definition

**Who it is for:** anyone who spends more time choosing a movie than watching one, especially friend groups and families deciding together.

**Four features, in priority order**

1. **Will I Like It?** (core): type any movie, get a personal verdict.
2. **Tonight's Lineup** (core): five picks you would probably enjoy, with filters.
3. **Movie Night** (headline): a shared room where friends find a movie everyone will like.
4. **Taste Twin** (stretch): upload your ratings, get a taste profile, a shareable card and recommendations from your closest match.
5. **Mood Search** (optional stretch): describe what you feel like in plain words.

**Navigation:** a simple bottom bar on mobile and a top bar on desktop with three items: *Check a movie*, *Tonight*, *Movie Night*. Taste Twin gets its own item only when built. "How it works" lives in the footer.

**No account required.** Everything works anonymously. The user's "shelf" (see below) is remembered in the browser. Movie Night uses a name the person types, nothing more.

## 3. Design language

- Friendly, clean, poster-forward. Posters are the hero of every screen, with large rounded cards and generous spacing.
- Light and dark themes following the device setting. A warm accent colour (amber or coral), calm neutral backgrounds, high contrast text.
- Plain English only. Say "match" and "you'd probably rate this" instead of any technical term. Write at roughly a school-level reading standard.
- One main action per screen, shown as a single large button.
- Large tap targets, thumb-friendly layout, no hover-only interactions.
- Loading states use skeleton cards, never spinners alone. Errors use friendly sentences with a retry button. Empty states always tell the user what to do next.
- Motion is light and purposeful: gentle card transitions, a satisfying reveal for results. Provide a reduced-motion option.
- Accessibility: keyboard navigable, readable contrast, alt text on posters.

## 4. The shelf: the heart of onboarding

Everything personal starts with the user's **Shelf**, a small collection of movies they love.

- **First visit:** the home screen has one headline ("Tell us 5 movies you love"), a big search box, and below it a grid of popular, widely known posters to tap. No sign-up, no questions.
- **Representation:** the shelf is shown as a **row of poster "spines" on a wooden-style shelf** that fills up as the user taps movies. A progress hint reads "3 more and your picks get really good". Five is the target, three is the minimum, and the user can add more any time.
- **Seen-it and not-for-me:** every poster has two quick actions, "I love it" and "Not my thing", so the system learns what to avoid too.
- The shelf is saved in the browser and can be edited anytime from a small "My shelf" button.
- **Under the hood (cold-start):** from the shelf, compute a taste vector for this user by solving against the already-trained movie factors from the offline model. This is a quick calculation and does **not** retrain anything. Treat "not my thing" as a low rating and "I love it" as a high one.
- **Acceptance:** a new user can build a useful shelf in under a minute, and every later feature responds to it instantly.

## 5. Feature specifications

### F1 – Will I Like It? (core)

- **What the user does:** types a movie name in a search box with instant suggestions, taps one.
- **What they get:** a **Verdict Ticket**, a card styled like a cinema ticket. At the top, a big plain verdict ("You'll probably love it", "Probably a yes", "Hit or miss for you", "Probably not your thing"), with a predicted star rating for *them* (for example "You'd rate this about 4.1★").
- **Two-bar comparison:** a simple pair of bars, "You: 4.1" against "Everyone: 3.4", so people see when a movie fits them better or worse than its general reputation.
- **Why:** up to three short chips, such as "Because you loved Inception" and "Fans of your favourites rate it highly", derived from the closest shelf movies in the similarity data.
- **Confidence meter:** high, medium or low, shown with a small icon and a plain sentence. It depends on how many ratings the movie has and how many movies are on the shelf. For rare movies, say "Not many people have rated this, so treat this as a guess."
- **Where to watch (India):** a row of streaming service labels from TMDB's watch-provider data for India, split into stream, rent and buy. If none are found, say "Not on a streaming service in India right now." Show a trailer link when available.
- **Actions:** "Add to watch later", "I've seen it" (asks for a quick rating that improves future results), and "Show me similar".
- **Under the hood:** predicted rating comes from the user's taste vector and the movie's factors, clipped to the valid rating range. Confidence comes from rating count and shelf size. "Similar" uses the precomputed item-to-item similarity.
- **Acceptance:** verdict appears within about two seconds of tapping a movie; every verdict has a reason and a confidence.

### F2 – Tonight's Lineup (core)

- **What the user sees:** a short, swipeable **lineup of five cards**, labelled like a theatre programme ("Tonight's lineup"). Each card shows the poster, runtime, a one-line reason, and a match badge.
- **Filter chips along the top:** time ("Under 2 hours", "Quick watch"), genre, era ("Classics", "2000s", "Recent"), and language where TMDB provides it. Chips apply instantly.
- **Quick feedback:** "Seen it" and "Not interested" on each card replace that card with a fresh one and quietly improve the next picks.
- **"Surprise me" button:** returns one pick from slightly outside the user's usual tastes, labelled as an adventurous choice.
- **Filter by service:** an optional "Only what I can stream in India" switch.
- **Under the hood:** rank unseen movies by predicted rating for the user's taste vector, apply a minimum-popularity guard so obscure titles do not dominate, then filter.
- **Acceptance:** results refresh within two seconds after any chip or feedback tap, with no repeated titles in one session.

### F3 – Movie Night (headline feature)

- **Flow:**
  1. The host taps "Start a Movie Night", names the room, and gets a short shareable link with a one-tap WhatsApp share button.
  2. Each friend opens the link on their own phone, types a first name, and either picks 3 to 5 favourites or reuses a saved shelf.
  3. The host sees a live lobby and taps "Find our movie" when everyone is in. Friends can also tap it if the host allows.
  4. The room shows the best five movies for the group, a vote, and then a winner reveal.
- **Representation – the Seat Map:** the lobby is a small cinema floor plan where **each friend is a seat** that lights up as they join, showing their name and a progress mark when their picks are in. In the results, every candidate movie has its own seat map where **each seat glows green, amber or red** according to how well that movie fits that person. A movie with no red seats gets the badge "Everyone's happy". A movie with one amber seat gets "Safe compromise". This lets a group see at a glance why a movie was chosen, and who is compromising.
- **Voting:** thumbs up or down per candidate, then a **winner reveal** with a gentle animation, the poster, runtime, where to stream in India, and a "Share the plan" button.
- **Fairness rules for the scoring:** blend the group's average predicted score with the lowest individual score so that nobody is left with a movie they would hate; exclude any movie that someone has already seen or marked not interesting; keep results varied in genre; explain each pick in one line ("Loved by 3 of 4, and nobody is below 'fine'").
- **Edge cases to handle:** someone joins late (results can be refreshed), someone leaves, only one person submitted (fall back to the single-person lineup with a nudge to invite others), duplicate names (add a number automatically), and an expired room (friendly message and a button to start a new one).
- **Under the hood:** each friend's taste vector is computed the same way as for the shelf. Group scores combine those vectors against the movie factors. Rooms are stored in MongoDB with an automatic expiry after about a day. Live updates in the lobby can use simple polling or server-sent events; either is fine as long as it feels instant.
- **Acceptance:** two people on separate phones can create, join, submit and see the same results in under two minutes, with no instructions.

### F4 – Taste Twin (stretch)

- **What the user does:** uploads their ratings export from Letterboxd or IMDb, or types in more favourites if they have no export.
- **Matching:** match uploaded titles to the catalogue by title and release year. Show the match rate plainly ("We recognised 118 of your 140 ratings") and let the user see what could not be matched.
- **Taste Card:** a **shareable, poster-style card**, like a streaming-year-in-review: favourite genres as a coloured ring, favourite decades as a small timeline, a quirky label based on rating habits ("Generous critic", "Tough crowd", "Cult-classic hunter"), and five signature movies. A button saves the card as an image.
- **Twin match:** find the three most similar viewers among the 200,000 anonymous MovieLens users. Present them as "Twin #1, 92% match" with a few of their favourites the user has not seen. Never imply real identities; the dataset is anonymous.
- **Recommendations:** "Your twin loved these, and you haven't seen them".
- **Privacy:** process the upload for the request only and do not store it unless the user explicitly chooses to save their shelf. Say this plainly on the upload screen.
- **Under the hood:** build an offline nearest-neighbour index over user taste vectors; the app computes the uploaded user's vector and queries the index. An approximate nearest-neighbour search is fine.
- **Acceptance:** an export of a few hundred ratings returns the card and twins within a few seconds, and match rates are shown honestly.

### F5 – Mood Search (optional stretch)

- **What it does:** the user types something like "slow-burn thriller with a twist, under 2 hours" and gets matching movies.
- **How:** combine genre, runtime and year constraints parsed from the sentence with text matching on user tags and TMDB overviews. Keep it simple and clearly labelled "beta".
- **Representation:** results come as a **mood board**, a loose collage of posters grouped under little hand-written style labels such as "Slow burn" and "Mind-bending".
- **Acceptance:** only build this after F1 to F3 are polished.

## 6. Data and backend (kept simple)

**Offline jobs (run once, rerun when needed)**

- Clean the MovieLens data and record data-quality counts.
- Train the explicit-rating factorisation model on up to roughly 10 million ratings if the full 32M is too heavy; record the size used.
- Export movie factors for the catalogue the app serves (see size note below), per-movie statistics (rating count, average, a popularity-adjusted average), and the top similar movies for each movie.
- Export user taste vectors for a sample or all MovieLens users, and build the nearest-neighbour index for Taste Twin.
- Enrich movies from TMDB: poster, runtime, language, genres, overview, trailer link, and cache the results. Cache India watch-provider data per movie and refresh it periodically, since it changes.
- Evaluate the model against a popularity-only baseline on a held-out split and store the metrics for the report.

**Catalogue size note:** the free MongoDB tier is small. Serve only movies with a reasonable number of ratings (for example, at least a few dozen), store vectors in compact form, and check total size before loading. If it does not fit, raise the rating-count threshold.

**API groups (names only)**

- Movies: search with suggestions, movie details, similar movies, streaming availability.
- Personal: verdict for a movie given a shelf, lineup given a shelf and filters, surprise pick.
- Rooms: create, join, submit picks, get lobby status, get results, vote, winner.
- Twin: upload and analyse, get card data.
- Meta: health check and the "How it works" numbers.

**Performance targets:** movie search under half a second; verdict and lineup under two seconds; group results under three seconds.

**Deployment:** frontend on a static or serverless host, API on a free web-service host, MongoDB on a free hosted tier. Put the live link and a short demo video into the README. Mention that free hosts may need a few seconds to wake up and add a friendly loading message for that case.

## 7. The "How it works" page (where the course marks live)

One page, linked from the footer, written in friendly language and split into two parts.

**For everyone:** a simple five-step picture (your favourites → find similar viewers → predict your rating → filter by your needs → show where to watch), with three big numbers: ratings analysed, movies in the catalogue, and viewers learned from.

**For examiners (clearly labelled, collapsed by default):**

- The 5 Vs of Big Data and how this project demonstrates each.
- The pipeline: raw files in HDFS, Spark processing, factorisation model, MongoDB serving, API, frontend.
- Real benchmark numbers: Spark against single-machine processing on the same job at different data sizes, plus model quality against the popularity baseline.
- A table mapping each syllabus module to where it appears in the project, and a link to the hidden lab pages from version 1 (MapReduce jobs, stream algorithms, frequent patterns, graph analysis) if they still work.
- Honest limits: which parts ran on subsets, and that the dataset has little Bollywood or regional-language coverage.

## 8. Build phases

**Phase 0 – Audit and reset.** Run the audit from Section 1, strip the old navigation, set up the new app shell with the three-item navigation, the design system, and the friendly loading, empty and error components. *Accept:* the old dashboard is out of the main flow; the shell looks good on a phone.

**Phase 1 – Serving data.** Produce the offline outputs in Section 6 and load them into the database, with TMDB posters and India streaming data for the served catalogue. *Accept:* any served movie has a poster, runtime and factors; size fits the hosting limit; model metrics saved.

**Phase 2 – Shelf and search.** Build the onboarding screen, instant search, the spine-shelf representation, and browser persistence. *Accept:* a new user builds a shelf in under a minute.

**Phase 3 – Will I Like It?** Build the Verdict Ticket with the two-bar comparison, reasons, confidence, streaming row and actions. *Accept:* verdict within about two seconds, always with a reason and a confidence.

**Phase 4 – Tonight's Lineup.** Build the lineup cards, filter chips, feedback actions, surprise button and streaming filter. *Accept:* instant refresh, no repeats in a session.

**Phase 5 – Movie Night.** Build rooms, the Seat Map lobby and results, voting and the winner reveal, with all edge cases. *Accept:* two phones complete a full flow in under two minutes.

**Phase 6 – Taste Twin (stretch).** Upload, matching, Taste Card, twins. *Accept:* honest match rates and a saveable card.

**Phase 7 – How it works and benchmarks.** Build the page with real recorded numbers. *Accept:* every number comes from a stored run.

**Phase 8 – Usability test, polish and deploy.** Run the test in Section 9, fix what it finds, deploy, and record a short demo. *Accept:* the usability targets below are met.

## 9. Usability test (do not skip)

Ask five people who are not technical, ideally with at least one older relative, to complete these tasks on their own phone **without any help or explanation**, while the builder only watches.

1. Build a shelf of five movies.
2. Find out whether a particular movie is a good fit for them and where to stream it.
3. Get tonight's picks under two hours.
4. Start a Movie Night and get one friend to join using the link.

**Targets:** at least four of five finish every task unaided; no task takes longer than two minutes; nobody asks what a word means. Record where people hesitate, fix those spots, and include the findings in the report. This evidence matters as much as the model metrics.

## 10. What to avoid

- Do not show any technical term to normal users outside the "How it works" page.
- Do not require sign-up or email for any core feature.
- Do not run Spark, MapReduce or model training while a user is waiting.
- Do not invent numbers, benchmarks, ratings or streaming availability. If data is missing, say so.
- Do not present predictions as certain; always show confidence.
- Do not build Mood Search or Taste Twin before the core three features feel finished.
- Do not add dashboards, charts or admin screens to the main experience.
