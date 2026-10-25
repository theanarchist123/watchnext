import type { Metadata } from "next";
import "./globals.css";
import "./v2.css";

export const metadata: Metadata = {
  title: "WatchNext — Stop scrolling. Start watching.",
  description: "Find a movie you’ll love, alone or with friends. No account required."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `if (typeof window !== "undefined" && window.location.hostname === "localhost" && "serviceWorker" in navigator) { const resetKey = "watchnext-local-worker-reset"; navigator.serviceWorker.getRegistrations().then(async registrations => { if (!registrations.length || sessionStorage.getItem(resetKey)) return; sessionStorage.setItem(resetKey, "1"); await Promise.all(registrations.map(registration => registration.unregister())); if ("caches" in window) await Promise.all((await caches.keys()).map(cache => caches.delete(cache))); window.location.reload(); }); }` }} />
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
