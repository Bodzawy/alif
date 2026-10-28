import type { Locale } from "@/lib/locale";

/** Translations of German texts, keyed by the German text. */
export type Translations = Record<string, Partial<Record<Exclude<Locale, "de">, string>>>;

/** One row per text: German (the key), English, Turkish, Albanian, French. */
export type Row = readonly [de: string, en: string, tr: string, sq: string, fr: string];

export function table(rows: readonly Row[]): Translations {
  return Object.fromEntries(rows.map(([de, en, tr, sq, fr]) => [de, { en, tr, sq, fr }]));
}
