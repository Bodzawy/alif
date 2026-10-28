// The learner's language for everything that is not Arabic: buttons, explanations,
// meanings, spoken instructions (per browser, like the programme in track.ts).
// German is the source language of every text; the others are translations
// (src/i18n/). A text without a translation is shown in German.

export type Locale = "de" | "en" | "tr" | "sq" | "fr";

export const LOCALES: Record<Locale, { name: string; htmlLang: string }> = {
  de: { name: "Deutsch", htmlLang: "de" },
  en: { name: "English", htmlLang: "en" },
  tr: { name: "Türkçe", htmlLang: "tr" },
  sq: { name: "Shqip", htmlLang: "sq" },
  fr: { name: "Français", htmlLang: "fr" },
};

export const LOCALE_ORDER: Locale[] = ["de", "en", "tr", "sq", "fr"];

/** Until a language is chosen (and on the server): German, the source language. */
export const DEFAULT_LOCALE: Locale = "de";

const LOCALE_KEY = "alif:lang";
const listeners = new Set<() => void>();
let memoryLocale: Locale | null = null;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && Object.hasOwn(LOCALES, value);
}

/** The chosen language, or null before the first choice (or without storage). */
export function readLocale(): Locale | null {
  try {
    const value = window.localStorage.getItem(LOCALE_KEY);
    return isLocale(value) ? value : null;
  } catch {
    return memoryLocale;
  }
}

/** The language that applies now. */
export function currentLocale(): Locale {
  return (typeof window === "undefined" ? null : readLocale()) ?? DEFAULT_LOCALE;
}

export function chooseLocale(locale: Locale) {
  memoryLocale = locale;
  try {
    window.localStorage.setItem(LOCALE_KEY, locale);
  } catch {
    // Storage unavailable: the choice lives in memory for this visit.
  }
  try {
    document.documentElement.lang = LOCALES[locale].htmlLang;
  } catch {
    // No document (tests without DOM).
  }
  listeners.forEach((listener) => listener());
}

export function subscribeLocale(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === LOCALE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
