"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Movie } from "../lib/catalogue";

type ShelfItem = Movie & { feeling: "love" | "nope"; personalRating?: number };
const shelfKey = "watchnext-shelf-v2";
const nav = [["/check", "Check a movie"], ["/tonight", "Tonight"], ["/movie-night", "Movie Night"]] as const;
const genres = ["Any mood", "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", "Drama", "Fantasy", "Horror", "Romance", "Sci-Fi", "Thriller"];

function useShelf() {
  const [shelf, setShelf] = useState<ShelfItem[]>([]);
  useEffect(() => { try { setShelf(JSON.parse(localStorage.getItem(shelfKey) ?? "[]")); } catch { setShelf([]); } }, []);
  const save = useCallback((next: ShelfItem[]) => { setShelf(next); localStorage.setItem(shelfKey, JSON.stringify(next)); }, []);
  return [shelf, save] as const;
}

function SiteHeader({ active }: { active: string }) {
  return <><header className="wn-header"><Link href="/check" className="wn-brand"><span className="wn-mark">W</span> WatchNext</Link><nav>{nav.map(([href, label]) => <Link className={active === href ? "selected" : ""} key={href} href={href}>{label}</Link>)}</nav><Link className="wn-shelf-link" href="/check#shelf">My shelf</Link></header><nav className="wn-mobile-nav" aria-label="Main navigation">{nav.map(([href, label]) => <Link className={active === href ? "selected" : ""} key={href} href={href}>{label}</Link>)}</nav></>;
}

function Footer() { return <footer className="wn-footer"><span>Stop scrolling. Start watching.</span><Link href="/how-it-works">How it works</Link></footer>; }
function Shell({ active, children }: { active: string; children: React.ReactNode }) { return <div className="wn-app"><SiteHeader active={active}/><main className="wn-main">{children}</main><Footer/></div>; }

function SearchBox({ onPick, onSkip, placeholder = "Search any movie…" }: { onPick: (movie: Movie) => void; onSkip?: (movie: Movie) => void; placeholder?: string }) {
  const [query, setQuery] = useState(""); const [items, setItems] = useState<Movie[]>([]); const [busy, setBusy] = useState(false);
  useEffect(() => { if (query.trim().length < 2) { setItems([]); return; } const controller = new AbortController(); const timer = setTimeout(async () => { setBusy(true); try { const res = await fetch(`/api/movies?q=${encodeURIComponent(query)}`, { signal: controller.signal }); setItems((await res.json()).movies); } catch { if (!controller.signal.aborted) setItems([]); } finally { setBusy(false); } }, 140); return () => { clearTimeout(timer); controller.abort(); }; }, [query]);
  return <div className="wn-search-wrap"><label className="wn-search"><span aria-hidden="true">⌕</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder={placeholder} aria-label="Search movie titles"/><kbd>⌘ K</kbd></label>{query.length > 1 && <div className="wn-suggestions" role="listbox">{busy ? <p>Finding movies…</p> : items.length ? items.map(movie => <div className="wn-suggestion" key={movie.id}><button onClick={() => { onPick(movie); setQuery(""); setItems([]); }}><strong>{displayTitle(movie.title)}</strong><span>{movie.genres.slice(0, 2).join(" · ")} · ★ {movie.averageRating.toFixed(1)}</span></button>{onSkip&&<button className="wn-skip" onClick={()=>{onSkip(movie);setQuery("");setItems([])}}>Not my thing</button>}</div>) : <p>No matches yet. Try another title.</p>}</div>}</div>;
}
function displayTitle(title: string) { return title.replace(/^"|"$/g, "").replace(/^(.+), The \((\d{4})\)$/, "The $1 ($2)"); }
function movieYear(movie: Movie) { return Number(movie.title.match(/\((\d{4})\)/)?.[1] ?? ""); }
function tone(movie: Movie) { const palettes = ["#7753a4", "#b75b41", "#35736d", "#c0913f", "#425d89", "#914f66"]; return palettes[movie.id % palettes.length]; }
function Poster({ movie, size = "normal" }: { movie: Movie; size?: "normal" | "small" }) { return <div className={`wn-poster ${size === "small" ? "small" : ""}`} style={{ "--poster-tone": tone(movie) } as React.CSSProperties}><span>{movieYear(movie) || "A good one"}</span><b>{displayTitle(movie.title).split(" (")[0]}</b><i>{movie.genres[0] ?? "Movie"}</i></div>; }
function Shelf({ shelf, save, popular }: { shelf: ShelfItem[]; save: (items: ShelfItem[]) => void; popular: Movie[] }) {
  const add = (movie: Movie, feeling: "love" | "nope") => { if (!shelf.some(item => item.id === movie.id)) save([...shelf, { ...movie, feeling }]); };
  return <section className="wn-shelf" id="shelf"><div className="wn-section-heading"><div><p className="wn-kicker">YOUR TASTE, YOUR CALL</p><h2>My shelf <span>{shelf.length}</span></h2></div><p>{Math.max(0, 5 - shelf.filter(item => item.feeling === "love").length)} more loved movie{shelf.filter(item => item.feeling === "love").length === 4 ? "" : "s"} for better picks</p></div>{shelf.length > 0 && <div className="wn-spines">{shelf.map(movie => <button key={movie.id} onClick={() => save(shelf.filter(item => item.id !== movie.id))} title={`Remove ${displayTitle(movie.title)} from your shelf`}><Poster movie={movie} size="small"/><span>{movie.feeling === "love" ? "♥" : "×"}</span></button>)}</div>}<div className="wn-shelf-search"><SearchBox placeholder="Add a movie you love or skip" onPick={movie => add(movie, "love")} onSkip={movie=>add(movie,"nope")}/><p>Choose a title you love, or mark one as “Not my thing”.</p></div><div className="wn-popular"><b>Popular picks · tap ♥ or ×</b><div>{popular.slice(0, 8).map(movie => <div className="wn-popular-item" key={movie.id}><Poster movie={movie} size="small"/><span>{displayTitle(movie.title).split(" (")[0]}</span><div><button disabled={shelf.some(item => item.id === movie.id)} onClick={()=>add(movie,"love")}>♥ Love it</button><button disabled={shelf.some(item => item.id === movie.id)} onClick={()=>add(movie,"nope")}>× Skip</button></div></div>)}</div></div></section>;
}

function usePopular() { const [popular, setPopular] = useState<Movie[]>([]); useEffect(() => { fetch("/api/popular").then(r => r.json()).then(data => setPopular(data.movies ?? [])).catch(() => setPopular([])); }, []); return popular; }
export function CheckPage() {
  const [shelf, save] = useShelf(); const popular = usePopular(); const [selected, setSelected] = useState<Movie | null>(null); const [verdict, setVerdict] = useState<number | null>(null); const [watchLater, setWatchLater] = useState<number[]>([]); const [ratingMovie, setRatingMovie] = useState<Movie | null>(null);
  useEffect(()=>{try{setWatchLater(JSON.parse(localStorage.getItem("watchnext-watch-later")??"[]"))}catch{setWatchLater([])}},[]);
  const loved = shelf.filter(item => item.feeling === "love");
  const predict = (movie: Movie) => { setSelected(movie); const matching = loved.filter(item => item.genres.some(genre => movie.genres.includes(genre))); const disliked = shelf.filter(item=>item.feeling==="nope"&&item.genres.some(genre=>movie.genres.includes(genre))); const baseline = loved.length ? loved.reduce((sum, item) => sum + (item.personalRating??item.averageRating), 0) / loved.length : movie.averageRating; const overlap = loved.length ? matching.length / loved.length : 0; const avoidance=shelf.filter(item=>item.feeling==="nope").length?disliked.length/shelf.filter(item=>item.feeling==="nope").length:0; setVerdict(Math.min(5, Math.max(0.5, movie.averageRating * 0.55 + baseline * 0.2 + overlap * 1.1 - avoidance * 0.8))); };
  return <Shell active="/check"><section className="wn-hero"><div className="wn-hero-copy"><p className="wn-kicker">A BETTER WAY TO PICK A MOVIE</p><h1>Tell us 5 movies<br/>you <em>love.</em></h1><p>We’ll help you find the next one you’ll actually want to watch.</p><a href="#shelf" className="wn-primary">Build my shelf <span>↓</span></a><span className="wn-reassure">No account. Takes about a minute.</span></div><div className="wn-hero-art"><div className="wn-ticket"><span>TONIGHT’S FEATURE</span><b>Something<br/><em>you’ll love.</em></b><i>YOUR NEXT MOVIE IS WAITING</i></div><div className="wn-ticket-back"/></div></section>
    <section className="wn-check-content"><div className="wn-title-row"><div><p className="wn-kicker">WONDERING ABOUT ONE?</p><h2>Check a movie</h2></div></div><SearchBox onPick={predict}/>{selected && verdict !== null && <div className="wn-verdict"><button className="wn-close" onClick={() => setSelected(null)} aria-label="Close verdict">×</button><div className="wn-verdict-poster"><Poster movie={selected}/></div><div className="wn-verdict-copy"><p className="wn-kicker">YOUR MOVIE NIGHT, SORTED</p><h2>{verdict >= 4.1 ? "You'll probably love it" : verdict >= 3.5 ? "Probably a yes" : verdict >= 2.8 ? "Hit or miss for you" : "Probably not your thing"}</h2><h3>You’d rate it about <strong>{verdict.toFixed(1)}★</strong></h3><p>Everyone rates it <b>{selected.averageRating.toFixed(1)}★</b> · {selected.ratingCount.toLocaleString()} ratings</p><div className="wn-rating-bars"><div><span>You</span><i><b style={{ width: `${verdict * 20}%` }}/></i><strong>{verdict.toFixed(1)}</strong></div><div><span>Everyone</span><i><b style={{ width: `${selected.averageRating * 20}%` }}/></i><strong>{selected.averageRating.toFixed(1)}</strong></div></div><div className="wn-confidence"><span>◉</span><p><b>{selected.ratingCount > 1000 && shelf.length >= 3 ? "A useful guide" : "A first impression"}</b><br/>{shelf.length < 3 ? "Add 3 loved movies to make this more personal." : selected.ratingCount < 100 ? "Not many people have rated this, so treat it as a guess." : "Based on your shelf and what other movie fans thought."}</p></div><div className="wn-actions"><button onClick={() => { const next=watchLater.includes(selected.id)?watchLater:[...watchLater,selected.id];setWatchLater(next);localStorage.setItem("watchnext-watch-later",JSON.stringify(next)); }}>{watchLater.includes(selected.id) ? "✓ Saved for later" : "＋ Watch later"}</button><button onClick={() => setRatingMovie(selected)}>I’ve seen it</button></div>{ratingMovie?.id === selected.id && <div className="wn-quick-rating"><span>How much did you like it?</span>{[1,2,3,4,5].map(rating=><button key={rating} onClick={()=>{save([...shelf.filter(item=>item.id!==selected.id),{...selected,feeling:rating>=3?"love":"nope",personalRating:rating}]);setRatingMovie(null)}} aria-label={`Rate ${rating} out of 5`}>{rating}★</button>)}</div>}<p className="wn-stream-note">Streaming details for India aren’t available yet.</p></div></div>}</section>
    <Shelf shelf={shelf} save={save} popular={popular}/></Shell>;
}

export function TonightPage() {
  const [shelf, save] = useShelf(); const [genre, setGenre] = useState("Any mood"); const [era, setEra] = useState("Any era"); const [movies, setMovies] = useState<(Movie & {match:number})[]>([]); const [excluded, setExcluded] = useState<number[]>([]); const [busy, setBusy] = useState(false); const [surprise, setSurprise] = useState(false);
  useEffect(() => { let active = true; setBusy(true); fetch("/api/lineup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shelf, excluded, filters: { genre: genre === "Any mood" ? "" : genre, era: era === "Any era" ? "" : era } }) }).then(r=>r.json()).then(data=>{if(active)setMovies(data.movies??[])}).catch(()=>{if(active)setMovies([])}).finally(()=>{if(active)setBusy(false)}); return ()=>{active=false}; }, [shelf, excluded, genre, era]);
  const feedback = (movie: Movie, feeling: "love" | "nope") => { save([...shelf.filter(item => item.id !== movie.id), { ...movie, feeling }]); setExcluded(prev=>[...prev,movie.id]); };
  return <Shell active="/tonight"><section className="wn-page-intro"><p className="wn-kicker">YOUR NEXT GREAT WATCH</p><h1>Tonight’s<br/><em>lineup.</em></h1><p>Five picks, shaped around the movies on your shelf.</p></section><section className="wn-lineup"><div className="wn-filter-bar"><label>Pick a mood <select value={genre} onChange={e=>setGenre(e.target.value)}>{genres.map(g=><option key={g}>{g}</option>)}</select></label><label>Movie era <select value={era} onChange={e=>setEra(e.target.value)}>{["Any era","Classics","2000s","Recent"].map(g=><option key={g}>{g}</option>)}</select></label><button disabled title="Runtime data is not available yet">2h filter unavailable</button><button onClick={()=>setSurprise(true)}>✦ Surprise me</button></div>{shelf.filter(i=>i.feeling==="love").length<3&&<p className="wn-inline-note">Add a few favorites to your shelf for picks that fit you better. For now, here are popular favorites.</p>}{busy?<div className="wn-loading">Finding a few good ones…</div>:<div className="wn-lineup-grid">{movies.map((movie,index)=><article className="wn-lineup-card" key={movie.id}><Poster movie={movie}/><div className="wn-lineup-details"><span className="wn-rank">PICK {String(index+1).padStart(2,"0")}</span><h2>{displayTitle(movie.title)}</h2><p>{movie.genres.slice(0,3).join(" · ")} · {movieYear(movie)||"Classic"}</p><div className="wn-match">Your estimate · ★ {movie.match.toFixed(1)}</div><p className="wn-reason">{shelf.some(item=>item.feeling==="love"&&item.genres.some(genre=>movie.genres.includes(genre))) ? "Shares a genre with movies you love." : "A popular pick from viewer ratings."}</p><div className="wn-card-actions"><button onClick={()=>feedback(movie,"love")}>Seen it</button><button onClick={()=>{setExcluded(prev=>[...prev,movie.id]);}}>Not interested</button></div></div></article>)}</div>}{movies.length===0&&!busy&&<div className="wn-empty">No picks fit those filters. Try a different mood or era.</div>}</section>{surprise&&movies.length>0&&<div className="wn-toast" role="status">Your adventurous pick: {displayTitle(movies[movies.length-1].title)} <button onClick={()=>setSurprise(false)}>×</button></div>}</Shell>;
}

export function MovieNightPage() {
  const [shelf] = useShelf();
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [members, setMembers] = useState<string[]>([]);
  const [roomError, setRoomError] = useState("");
  const [busy, setBusy] = useState(false);
  const [roomAvailable, setRoomAvailable] = useState<boolean | null>(null);
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/movie-night?room=${room}` : "";

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("room");
    if (!code) return;
    setRoom(code.toUpperCase());
    fetch(`/api/rooms?room=${encodeURIComponent(code)}`).then(async response => {
      const data = await response.json();
      const savedMembers = JSON.parse(localStorage.getItem(`watchnext-room-${code}`) ?? "[]");
      if (Array.isArray(savedMembers) && savedMembers.length) {
        const migration = await fetch("/api/rooms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "migrate", room: code, members: savedMembers }) });
        const migrationData = await migration.json();
        if (migration.ok && migrationData.room) data.room = migrationData.room;
      }
      if (!data.room) {
        const legacyMembers = JSON.parse(localStorage.getItem(`watchnext-room-${code}`) ?? "[]");
        if (Array.isArray(legacyMembers) && legacyMembers.length) {
          const migrated = await fetch("/api/rooms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "migrate", room: code, members: legacyMembers }) });
          const migratedData = await migrated.json();
          if (migrated.ok && migratedData.room) { setMembers(migratedData.room.members); setRoomError(""); setRoomAvailable(true); return; }
        }
        throw new Error("This invite isn’t saved on this server. If you created it in another browser version, open the link in the browser where you started it. Otherwise start a new room and share its new link.");
      }
      setMembers(data.room.members);
      if (data.room.id !== code.toUpperCase()) {
        setRoom(data.room.id);
        history.replaceState(null, "", `/movie-night?room=${data.room.id}`);
      }
      setRoomAvailable(true);
    }).catch(error => { setRoomError(error.message); setRoomAvailable(false); });
  }, []);

  useEffect(() => {
    if (!room || roomAvailable !== true) return;
    const refresh = async () => {
      try {
        const response = await fetch(`/api/rooms?room=${encodeURIComponent(room)}`);
        const data = await response.json();
        if (!response.ok || !data.room) { setRoomError(data.error ?? "This room is no longer available. Start a new room and share its link."); setRoomAvailable(false); return; }
        setMembers(data.room.members);
        if (data.room.id !== room) {
          setRoom(data.room.id);
          history.replaceState(null, "", `/movie-night?room=${data.room.id}`);
        }
      } catch { setRoomError("Couldn’t refresh this room. Check your connection and try again."); }
    };
    const timer = window.setInterval(refresh, 2000);
    return () => window.clearInterval(timer);
  }, [room, roomAvailable]);

  const start = async () => {
    setBusy(true);
    try {
      const response = await fetch("/api/rooms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create" }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setRoom(data.room.id);
      setMembers(data.room.members);
      setRoomError("");
      setRoomAvailable(true);
      history.replaceState(null, "", `/movie-night?room=${data.room.id}`);
    } catch (error) { setRoomError(error instanceof Error ? error.message : "Couldn’t start the room. Try again."); }
    finally { setBusy(false); }
  };

  const join = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      const response = await fetch("/api/rooms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "join", room, name }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setName(data.name);
      setMembers(data.room.members);
      if (data.room.id !== room) {
        setRoom(data.room.id);
        history.replaceState(null, "", `/movie-night?room=${data.room.id}`);
      }
      setJoined(true);
      setRoomError("");
      setRoomAvailable(true);
    } catch (error) { setRoomError(error instanceof Error ? error.message : "Couldn’t join the room. Try again."); }
    finally { setBusy(false); }
  };

  const startOver = async () => {
    setBusy(true);
    setName("");
    setJoined(false);
    setMembers([]);
    setRoomError("");
    try {
      const response = await fetch("/api/rooms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reset", room }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setRoom(data.room.id);
      setMembers(data.room.members);
      setRoomAvailable(true);
      history.replaceState(null, "", `/movie-night?room=${data.room.id}`);
    } catch (error) { setRoomError(error instanceof Error ? error.message : "Couldn’t reset this room. Try again."); }
    finally { setBusy(false); }
  };

  return <Shell active="/movie-night"><section className="wn-page-intro"><p className="wn-kicker">BETTER TOGETHER</p><h1>Movie<br/><em>Night.</em></h1><p>Find a movie the whole group can get behind.</p></section><section className="wn-room-card">{!room?<><div className="wn-room-icon">✦</div><h2>Make it a group pick.</h2><p>Start a room, share the link with your friends, and compare everyone’s favorites.</p><button className="wn-primary" onClick={start} disabled={busy}>{busy?"Starting…":"Start a Movie Night"} <span>→</span></button>{roomError&&<p className="wn-room-error" role="alert">{roomError}</p>}<p className="wn-room-footnote">No sign-up. Just a name and a movie.</p></>:<><p className="wn-kicker">YOUR MOVIE NIGHT</p><h2>{joined?`You’re in, ${name}!`:"Join the room"}</h2><div className="wn-room-code">{room}</div>{!joined&&roomAvailable!==false&&<div className="wn-join-form"><label>Your first name<input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Sam"/></label><button className="wn-primary" onClick={join} disabled={busy}>{busy?"Joining…":"Join this room"} <span>→</span></button></div>}{roomError&&<div className="wn-room-error" role="alert"><span>{roomError}</span><button onClick={startOver}>Start Over</button></div>}<div className="wn-seats"><b>Who’s here · updates automatically</b><div>{members.map((member,index)=><span key={`${member}-${index}`}><i>♥</i>{member}</span>)}{members.length===0&&<small>Seats are waiting for your friends.</small>}</div></div>{roomAvailable!==false&&<><div className="wn-room-actions"><button onClick={()=>navigator.clipboard.writeText(shareUrl)}>Copy invite link</button><a href={`https://wa.me/?text=${encodeURIComponent(`Join my WatchNext Movie Night: ${shareUrl}`)}`} target="_blank" rel="noreferrer">Share on WhatsApp ↗</a></div><p className="wn-room-footnote">This room is shared across browsers on this WatchNext server and expires after 24 hours.</p></>}</>}</section><section className="wn-invite-note"><h2>Everyone gets a say.</h2><p>Bring your favorites. We’ll make it easier to find a movie you can all enjoy.</p>{shelf.length>0&&<span>Your shelf has {shelf.filter(item=>item.feeling==="love").length} favorites ready to share.</span>}</section></Shell>;
}
export function HowPage() {
  const steps=[["01","Your favorites","Add movies you love to your shelf."],["02","Find your taste","We compare the kinds of movies you enjoy."],["03","Make a good guess","Your picks balance your taste with what viewers rated."],["04","Choose your night","Filter by mood and movie era."],["05","Start watching","Pick one and make a night of it."]];
  return <Shell active=""><section className="wn-page-intro"><p className="wn-kicker">A LITTLE BEHIND THE SCENES</p><h1>How it<br/><em>works.</em></h1><p>Friendly picks up front. A big movie collection doing the work behind the curtain.</p></section><section className="wn-how-steps">{steps.map(([n,title,body])=><article key={n}><span>{n}</span><div><h2>{title}</h2><p>{body}</p></div></article>)}</section><section className="wn-how-numbers"><div><b>32 million</b><span>ratings in MovieLens</span></div><div><b>87,585</b><span>movies in the source catalogue</span></div><div><b>200,948</b><span>anonymous viewers represented</span></div></section><details className="wn-examiner"><summary>For examiners: data and project details</summary><p>This project uses the MovieLens 32M public dataset. The current app searches prepared movie statistics and ranks candidates with a lightweight genre and popularity score. It does not yet serve trained movie factors, TMDB details, streaming availability, Spark benchmark runs, or database-backed hosted rooms.</p><div className="wn-lab-links"><Link href="/booth">Project overview</Link>{[["Pipeline","/booth/pipeline"],["Big Data foundations","/booth/why-big-data"]].map(([label,href])=><a key={href} href={href}>{label}</a>)}</div></details></Shell>;
}
