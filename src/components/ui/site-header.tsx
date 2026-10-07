import Link from "next/link";

import { LogoMark } from "./logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 rounded-lg focus-ring" aria-label="Alif – Startseite">
          <LogoMark />
          <span className="text-lg font-bold tracking-tight">Alif</span>
        </Link>
        <nav aria-label="Hauptnavigation" className="flex items-center gap-1 text-sm font-medium">
          <Link href="/a0" className="rounded-lg px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-ring">
            A0
          </Link>
          <Link href="/a1" className="rounded-lg px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-ring">
            A1
          </Link>
        </nav>
      </div>
    </header>
  );
}
