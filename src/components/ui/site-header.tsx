import Link from "next/link";

import { LanguageSwitch } from "@/components/locale/language-switch";
import { TrackSwitch } from "@/components/track/track-switch";

import { LogoMark } from "./logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 rounded-lg focus-ring" aria-label="Alif – Startseite">
          <LogoMark />
          <span className="hidden text-lg font-bold tracking-tight min-[420px]:inline">Alif</span>
        </Link>
        <nav aria-label="Hauptnavigation" className="flex items-center gap-0.5 text-sm font-medium sm:gap-1">
          <Link href="/a0" className="rounded-lg px-2 py-2 text-muted-foreground sm:px-3 transition hover:bg-muted hover:text-foreground focus-ring">
            A0
          </Link>
          <Link href="/a1" className="rounded-lg px-2 py-2 text-muted-foreground sm:px-3 transition hover:bg-muted hover:text-foreground focus-ring">
            A1
          </Link>
          <TrackSwitch className="ml-1" />
          <LanguageSwitch />
        </nav>
      </div>
    </header>
  );
}
