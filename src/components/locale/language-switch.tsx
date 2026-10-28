"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { Check, ChevronDown, Globe, X } from "lucide-react";

import { chooseLocale, LOCALE_ORDER, LOCALES, readLocale, subscribeLocale, type Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

// The learner's language: LanguageSwitch (in the headers) shows it and opens
// LanguageDialog, a native modal <dialog> mounted once in the layout. On the
// first visit the dialog opens by itself, before the programme is chosen
// (TrackDialog waits for it), and cannot be dismissed.

const noop = () => () => undefined;
const openers = new Set<() => void>();

/** Each language greets in its own words – the learner may not read German. */
const HEADING: Record<Locale, string> = {
  de: "Wähle deine Sprache",
  en: "Choose your language",
  tr: "Dilini seç",
  sq: "Zgjidh gjuhën tënde",
  fr: "Choisis ta langue",
};

function useLocaleChoice() {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const locale = useSyncExternalStore(subscribeLocale, readLocale, () => null);
  return { hydrated, locale };
}

export function LanguageSwitch({ className }: { className?: string }) {
  const { hydrated, locale } = useLocaleChoice();
  const shown = locale ?? "de";
  return (
    <button
      type="button"
      onClick={() => openers.forEach((open) => open())}
      data-testid="language-switch"
      data-locale={locale ?? ""}
      aria-label={`${LOCALES[shown].name} – ${HEADING[shown]}`}
      className={cn(
        "inline-flex h-10 items-center gap-1 rounded-full border bg-card px-2.5 text-sm font-semibold sm:gap-1.5 sm:px-3 text-foreground shadow-sm transition hover:border-primary/40 focus-ring",
        !hydrated && "invisible",
        className
      )}
    >
      <Globe className="h-4 w-4 text-muted-foreground" aria-hidden />
      {shown.toUpperCase()}
      <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" aria-hidden />
    </button>
  );
}

export function LanguageDialog() {
  const { hydrated, locale } = useLocaleChoice();
  const dialog = useRef<HTMLDialogElement>(null);
  const firstChoice = hydrated && locale === null;

  useEffect(() => {
    const open = () => {
      const el = dialog.current;
      if (!el || el.open) return;
      el.showModal();
      el.focus();
    };
    openers.add(open);
    return () => void openers.delete(open);
  }, []);

  useEffect(() => {
    if (firstChoice) openers.forEach((open) => open());
  }, [firstChoice]);

  // The page's language for screen readers (the server renders German).
  useEffect(() => {
    if (locale) document.documentElement.lang = LOCALES[locale].htmlLang;
  }, [locale]);

  function choose(value: Locale) {
    chooseLocale(value);
    dialog.current?.close();
  }

  return (
    <dialog
      ref={dialog}
      onCancel={(event) => readLocale() === null && event.preventDefault()}
      onClick={(event) => event.target === dialog.current && readLocale() !== null && dialog.current?.close()}
      aria-labelledby="language-title"
      tabIndex={-1}
      data-testid="language-dialog"
      className="w-[min(32rem,calc(100vw-2rem))] rounded-3xl bg-background p-0 text-foreground shadow-2xl outline-none backdrop:bg-brand-navy/60 backdrop:backdrop-blur-sm"
    >
      <div className="p-5 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="language-title" className="text-xl font-bold tracking-tight sm:text-2xl">
              {HEADING[locale ?? "de"]}
            </h2>
            {!locale && (
              <p className="mt-1 text-sm text-muted-foreground" data-testid="language-headings">
                {LOCALE_ORDER.filter((l) => l !== "de")
                  .map((l) => HEADING[l])
                  .join(" · ")}
              </p>
            )}
          </div>
          {locale && (
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              aria-label="✕"
              data-testid="language-close"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-muted focus-ring"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          )}
        </div>
        <ul className="mt-5 grid gap-2">
          {LOCALE_ORDER.map((value) => {
            const selected = value === locale;
            return (
              <li key={value}>
                <button
                  type="button"
                  lang={LOCALES[value].htmlLang}
                  onClick={() => choose(value)}
                  aria-pressed={selected}
                  data-testid={`language-option-${value}`}
                  className={cn(
                    "flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border-2 bg-card px-4 py-3 text-left text-lg font-semibold transition hover:border-primary/60 focus-ring",
                    selected ? "border-primary" : "border-border"
                  )}
                >
                  {LOCALES[value].name}
                  {selected && <Check className="h-5 w-5 text-primary" aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </dialog>
  );
}
