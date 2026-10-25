"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const booth = pathname.startsWith("/booth");
  return (
    <header className="site-header">
      <Link className="brand" href="/">
        <span className="brand-mark">W</span>
        <span>WATCHNEXT</span>
      </Link>
      <nav aria-label="Primary navigation">
        <Link className={!booth ? "active" : ""} href="/">Marquee</Link>
        <Link className={booth ? "active" : ""} href="/booth">Projection Booth</Link>
      </nav>
      <span className="header-status"><i /> OFFLINE PIPELINE · READY</span>
    </header>
  );
}
