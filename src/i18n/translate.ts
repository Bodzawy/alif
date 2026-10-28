import type { Locale } from "@/lib/locale";

import { LESSON_1 } from "./lesson-1";
import type { Translations } from "./table";
import { UI } from "./ui";

// Every text of Alif is written in German; a translation is looked up by the
// German text itself (src/i18n/ui.ts for the interface, one file per lesson
// for its content). Without a translation the German text is used, so a lesson
// that is not translated yet still works.
//
// Placeholders: {name} in the German key and in the translation, filled from `params`.

export type { Translations } from "./table";

const DICTIONARIES: Translations[] = [UI, LESSON_1];


/** Keys with placeholders ("Das {name} steht am Anfang."): the German text they match, compiled once. */
type Template = { pattern: RegExp; key: string; dictionary: Translations };
let templates: Template[] | null = null;

/** "Das {name} … das {name}" → a pattern whose later {name} must be the same text (a backreference). */
function templatePattern(key: string): RegExp {
  const seen = new Set<string>();
  const body = key.replace(/[.*+?^$()|[\]\\]/g, "\\$&").replace(/\{(\w+)\}/g, (_, name: string) => {
    if (seen.has(name)) return `\\k<${name}>`;
    seen.add(name);
    return `(?<${name}>.+?)`;
  });
  return new RegExp(`^${body}$`);
}

function compiledTemplates(): Template[] {
  templates ??= DICTIONARIES.flatMap((dictionary) =>
    Object.keys(dictionary)
      .filter((key) => /\{\w+\}/.test(key))
      .map((key) => ({
        key,
        dictionary,
        pattern: templatePattern(key),
      }))
  );
  return templates;
}

export function lookup(text: string, locale: Locale): string | undefined {
  if (locale === "de") return text;
  for (const dictionary of DICTIONARIES) {
    const found = dictionary[text]?.[locale];
    if (found !== undefined) return found;
  }
  // A text made from a template, e.g. "Das Ba steht am Anfang." – its parts translated as well ("Haus").
  for (const { pattern, key, dictionary } of compiledTemplates()) {
    const match = pattern.exec(text);
    const translation = match ? dictionary[key]?.[locale] : undefined;
    if (match && translation !== undefined) {
      const params = match.groups ?? {};
      const filled = translation.replace(/\{(\w+)\}/g, (all, name: string) => (name in params ? (lookup(params[name]!, locale) ?? params[name]!) : all));
      // A sentence that starts with a part ("{name} çiz.") starts with a capital letter, like the German one.
      return /^\p{Lu}/u.test(text) && translation.startsWith("{") ? filled.charAt(0).toLocaleUpperCase(locale) + filled.slice(1) : filled;
    }
  }
  return undefined;
}

/** Fills {name} from `params`; a German value (e.g. a letter's name "Dschim") is translated as well. */
function fill(text: string, locale: Locale, params?: Record<string, string | number>) {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (all, key: string) => {
    if (!(key in params)) return all;
    const value = params[key]!;
    return typeof value === "string" ? (lookup(value, locale) ?? value) : String(value);
  });
}

/** The text in the learner's language (German when there is no translation). */
export function translate(text: string, locale: Locale, params?: Record<string, string | number>): string {
  return fill(lookup(text, locale) ?? text, locale, params);
}

/** Every translated text (the speakable ones are allowed for /api/tts). */
export function allTranslations(): string[] {
  return DICTIONARIES.flatMap((dictionary) => Object.values(dictionary).flatMap((entry) => Object.values(entry) as string[]));
}
