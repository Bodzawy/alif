import Link from "next/link";
import { ArrowRight, Check, ChevronDown, Globe, Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";

// The homepage header, over the hero: logo and tagline, the page's sections,
// the language menu and "Anmelden". No JavaScript: the menus are <details>.
// Alif has no accounts yet (progress lives in the browser) and only a German
// interface – both menus say so instead of pretending more.

export const HOME_NAV = [
  { href: "/", label: "Startseite", active: true },
  { href: "/#ueber-alif", label: "Über Alif" },
  { href: "/#lernweg", label: "Lernweg" },
  { href: "/#fragen", label: "Häufige Fragen" },
] as const;

export function HomeLogo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-3 rounded-2xl focus-ring", className)} aria-label="Alif – Startseite" data-testid="home-logo">
      <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-emerald pb-1 font-arabic text-3xl font-bold leading-none text-white shadow-[0_6px_16px_-6px_rgb(14_90_71/0.6)] sm:h-12 sm:w-12 sm:text-4xl">
        أ
      </span>
      <span className="leading-tight">
        <span className="block text-xl font-bold tracking-tight text-brand-navy sm:text-[1.55rem]">Alif</span>
        <span className="block text-xs text-brand-navy/70 sm:text-[0.82rem]">Arabisch lernen. Für jedes Alter.</span>
      </span>
    </Link>
  );
}

const menuPanel = "absolute right-0 top-[calc(100%+0.5rem)] z-40 w-72 rounded-2xl border border-brand-gold/25 bg-brand-ivory p-4 text-left shadow-[0_20px_40px_-16px_rgb(20_33_61/0.35)]";

function LanguageMenu() {
  return (
    <details className="group relative" data-testid="language-menu">
      <summary className="flex h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-brand-navy/10 bg-white px-4 text-[0.95rem] font-medium text-brand-navy shadow-sm transition hover:border-brand-emerald/40 focus-ring [&::-webkit-details-marker]:hidden">
        <Globe className="h-[1.1rem] w-[1.1rem]" aria-hidden />
        Deutsch
        <ChevronDown className="h-4 w-4 transition group-open:rotate-180" aria-hidden />
        <span className="sr-only">– Sprache der Oberfläche</span>
      </summary>
      <div className={menuPanel} role="group" aria-label="Sprache der Oberfläche">
        <p className="flex items-center justify-between rounded-xl bg-brand-emerald/10 px-3 py-2 font-semibold text-brand-emerald">
          Deutsch <Check className="h-4 w-4" aria-hidden />
        </p>
        <p className="mt-2 px-1 text-sm text-brand-navy/70">Alif ist für Deutschsprachige gemacht. Weitere Sprachen der Oberfläche sind noch nicht verfügbar.</p>
      </div>
    </details>
  );
}

function LoginInfo() {
  return (
    <details className="group relative" data-testid="login-menu">
      <summary className="flex h-11 cursor-pointer list-none items-center gap-2 rounded-full bg-brand-emerald px-5 text-[0.95rem] font-semibold text-white shadow-[0_8px_18px_-8px_rgb(14_90_71/0.7)] transition hover:bg-brand-emerald-dark focus-ring [&::-webkit-details-marker]:hidden">
        Anmelden <ArrowRight className="h-4 w-4" aria-hidden />
      </summary>
      <div className={menuPanel} role="note" data-testid="login-info">
        <p className="font-semibold text-brand-navy">Du brauchst kein Konto.</p>
        <p className="mt-1 text-sm text-brand-navy/70">Alif speichert deinen Fortschritt in diesem Browser. Eine Anmeldung mit Konto gibt es noch nicht.</p>
        <Link href="/a0/letters" className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-emerald px-4 py-2 text-sm font-semibold text-white focus-ring">
          Direkt loslernen <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </details>
  );
}

export function HomeHeader() {
  return (
    <header className="relative z-30" data-testid="home-header">
      <div className="mx-auto flex max-w-[92rem] items-center justify-between gap-4 px-4 py-4 sm:px-8 lg:px-12">
        <HomeLogo />

        <nav aria-label="Hauptnavigation" className="hidden items-center gap-8 lg:flex">
          {HOME_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={"active" in item ? "page" : undefined}
              className={cn(
                "relative rounded-md py-2 text-[0.98rem] font-medium text-brand-navy transition hover:text-brand-emerald focus-ring",
                "active" in item && "text-brand-emerald after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-brand-emerald"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageMenu />
          <LoginInfo />
        </div>

        {/* Phones and tablets: one menu with the same links and options. */}
        <details className="group relative lg:hidden" data-testid="mobile-menu">
          <summary className="flex h-12 w-12 cursor-pointer list-none items-center justify-center rounded-full border border-brand-navy/10 bg-white text-brand-navy shadow-sm focus-ring [&::-webkit-details-marker]:hidden" aria-label="Menü öffnen">
            <Menu className="h-5 w-5 group-open:hidden" aria-hidden />
            <X className="hidden h-5 w-5 group-open:block" aria-hidden />
          </summary>
          <div className="absolute right-0 top-[calc(100%+0.5rem)] z-40 w-[min(20rem,calc(100vw-2rem))] rounded-3xl border border-brand-gold/25 bg-brand-ivory p-3 shadow-[0_24px_48px_-16px_rgb(20_33_61/0.35)]">
            <nav aria-label="Hauptnavigation (mobil)" className="flex flex-col">
              {HOME_NAV.map((item) => (
                <Link key={item.href} href={item.href} className={cn("rounded-2xl px-4 py-3 font-medium text-brand-navy hover:bg-brand-emerald/10 focus-ring", "active" in item && "text-brand-emerald")}>
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-2 border-t border-brand-gold/20 px-4 pt-3 text-sm text-brand-navy/70">
              <p className="flex items-center gap-2 font-medium text-brand-navy">
                <Globe className="h-4 w-4" aria-hidden /> Deutsch
              </p>
              <p className="mt-2">Kein Konto nötig – dein Fortschritt bleibt in diesem Browser.</p>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
