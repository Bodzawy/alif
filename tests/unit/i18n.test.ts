import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { ALIF_NARRATION_TEXT } from "@/components/a1/forms/content";
import { GAPS_TEXT } from "@/components/a1/gaps/content";
import { A1_LEVEL, getA1Unit } from "@/data/a1";
import { allTranslations, lookup, translate } from "@/i18n/translate";
import { LESSON_1 } from "@/i18n/lesson-1";
import { UI } from "@/i18n/ui";
import { API_ERROR_MESSAGES } from "@/lib/pronunciation/errors";
import { GERMAN_CUES } from "@/lib/pronunciation/cues";
import { ALLOWED_TTS_TEXTS } from "@/lib/pronunciation/targets";
import { TRACKS } from "@/lib/track";
import { buildSsml } from "@/lib/tts/ssml";

// Alif in German, English, Turkish, Albanian, French, Italian, Spanish and Arabic: every text of the interface and of
// Lektion 1 has a translation; anything else falls back to German.

const LOCALES = ["en", "tr", "sq", "fr", "it", "es", "ar"] as const;
/** Names stay as they are (the learner reads them in the Arabic dialogue as well). */
const NAMES = new Set(["Ahmad", "Ali", "Nabila", "Fatima", "Majid"]);
/** Keys of the lesson data that are not German text. */
const NOT_TEXT = new Set(["id", "slug", "src", "audio", "audioBase", "kind", "mode", "voice", "speaker", "target", "transliteration", "modelText", "arabic", "glyph", "label", "titleArabic", "hint", "pattern", "choices", "gapChoices", "answer", "spoken", "line", "tiles", "accepts", "mark", "position", "form", "d", "path", "bookLabel", "letter", "speakers", "tag"]);

/** Every German text of Lektion 1: meanings, pictures, titles, instructions, narration … */
function lessonOneTexts(): string[] {
  const out = new Set<string>();
  const walk = (value: unknown, key: string) => {
    if (typeof value === "string") {
      const latin = value.replace(/[؀-ۿً-ْـ·\s]/g, "");
      if (/[A-Za-zÄÖÜäöüß]{2,}/.test(latin) && !/^[a-z0-9_\-/.]+$/.test(value) && !NOT_TEXT.has(key)) out.add(value);
      return;
    }
    if (!value || typeof value !== "object") return;
    for (const [k, v] of Object.entries(value)) {
      if (k === "letter" && v && typeof v === "object") walk(v, "letter-object");
      else if (k === "speakers" && Array.isArray(v))
        for (const s of v) {
          out.add(s.name);
          out.add(s.avatar.alt);
        }
      else if (k === "tag" && typeof v === "string") out.add(v);
      else walk(v, k);
    }
  };
  walk(getA1Unit("lesson-1"), "");
  for (const unit of A1_LEVEL.units) {
    out.add(unit.titleGerman);
    out.add(unit.group.german);
  }
  return [...out].filter((text) => !NAMES.has(text));
}

/** The literal keys of t("…") / richT("…") / <T>…</T> in the code. */
function codeKeys(): string[] {
  const files: string[] = [];
  const visit = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const file = path.join(dir, name);
      if (statSync(file).isDirectory()) visit(file);
      else if (/\.tsx?$/.test(name)) files.push(file);
    }
  };
  visit(path.join(process.cwd(), "src"));
  const keys = new Set<string>();
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    for (const m of source.matchAll(/\b(?:t|tr|richT)\(\s*"((?:[^"\\]|\\.)*)"/g)) keys.add(m[1]!);
    for (const m of source.matchAll(/<T(?: params=\{\{[^}]*\}\})?>\{"([^"]+)"\}<\/T>/g)) keys.add(m[1]!);
    for (const m of source.matchAll(/<T>([^<{]+)<\/T>/g)) keys.add(m[1]!.trim());
  }
  return [...keys];
}

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe("translations", () => {
  it("every row has all four languages, and the same {placeholders} as its German text", () => {
    for (const dictionary of [UI, LESSON_1])
      for (const [german, row] of Object.entries(dictionary))
        for (const locale of LOCALES) {
          expect(row[locale], `${locale}: ${german}`).toBeTruthy();
          expect(placeholders(row[locale]!), `${locale}: ${german}`).toEqual(placeholders(german));
        }
  });

  it("the interface: every text the code translates", () => {
    const keys = codeKeys();
    expect(keys.length).toBeGreaterThan(150);
    for (const key of keys) for (const locale of LOCALES) expect(lookup(key, locale), `${locale}: ${key}`).toBeDefined();
  });

  it("the interface: messages, cues and the programmes", () => {
    const texts = [...Object.values(API_ERROR_MESSAGES), ...Object.values(GERMAN_CUES), ...Object.values(TRACKS).map((t) => t.german)];
    for (const text of texts) for (const locale of LOCALES) expect(lookup(text, locale), `${locale}: ${text}`).toBeDefined();
  });

  it("Lektion 1: every meaning, picture, title, instruction and narration – in every language", () => {
    const texts = [...lessonOneTexts(), ...Object.values(ALIF_NARRATION_TEXT), ...Object.values(GAPS_TEXT)];
    expect(texts.length).toBeGreaterThan(400);
    const missing = LOCALES.flatMap((locale) => texts.filter((text) => lookup(text, locale) === undefined).map((text) => `${locale}: ${text}`));
    expect(missing).toEqual([]);
  });

  it("templates: one translation for every letter, its parts translated too", () => {
    expect(translate("Heute lernst du die Formen vom Ba. Das Ba sieht nicht immer gleich aus. Hör gut zu und mach mit!", "tr")).toBe(
      "Bugün Be harfinin şekillerini öğreniyorsun. Be her zaman aynı görünmez. İyi dinle ve katıl!"
    );
    expect(translate("Das zweite Wort bedeutet: Haus. Hier sind seine Buchstaben. Jetzt setzen wir sie zusammen.", "en")).toBe(
      "The second word means: House. Here are its letters. Now we put them together."
    );
    expect(translate("Wo steht das {name}?", "fr", { name: "Dschim" })).toBe("Où est le Jim ?");
    expect(translate("Fahr das Alif am Wortende nach. Fang beim grünen Punkt an.", "tr")).toBe("Kelime sonundaki Elif'i çiz. Yeşil noktadan başla.");
    expect(translate("Wörter mit بَ · بِ · بُ", "sq")).toBe("Fjalë me بَ · بِ · بُ");
    expect(translate("Wo steht das {name}?", "es", { name: "Dschim" })).toBe("¿Dónde está la Yim?");
    expect(translate("Wo steht das {name}?", "ar", { name: "Dschim" })).toBe("أين تقع الجيم؟");
    expect(translate("Schritt {n} von {total}", "it", { n: 2, total: 6 })).toBe("Passo 2 di 6");
  });

  it("German is the source; a text without translation stays German", () => {
    expect(translate("Anhören", "de")).toBe("Anhören");
    expect(translate("Ein Satz, den es noch nicht übersetzt gibt.", "en")).toBe("Ein Satz, den es noch nicht übersetzt gibt.");
    expect(translate("Schritt {n} von {total}", "de", { n: 2, total: 6 })).toBe("Schritt 2 von 6");
  });
});

describe("spoken in the learner's language", () => {
  it("/api/tts may speak the translations; Azure uses a voice of that language for them", () => {
    for (const text of allTranslations().slice(0, 50)) expect(ALLOWED_TTS_TEXTS.has(text), text).toBe(true);
    expect(ALLOWED_TTS_TEXTS.has(translate("Super!", "tr"))).toBe(true);
    expect(buildSsml("Great!", undefined, "en")).toContain('<voice name="en-US-JennyNeural">');
    expect(buildSsml("Süper!", undefined, "tr")).toContain('xml:lang="tr-TR"');
    expect(buildSsml("Shumë mirë!", undefined, "sq")).toContain("sq-AL-AnilaNeural");
    expect(buildSsml("Super !", undefined, "fr")).toContain("fr-FR-DeniseNeural");
    expect(buildSsml("Ottimo!", undefined, "it")).toContain("it-IT-ElsaNeural");
    expect(buildSsml("¡Genial!", undefined, "es")).toContain("es-ES-ElviraNeural");
    expect(buildSsml("رائع!", undefined, "ar")).toContain('xml:lang="ar-SA"');
    // Arabic without a translation: the German text in the German voice.
    expect(buildSsml("Super!", undefined, "ar")).toContain("de-DE-KatjaNeural");
    expect(buildSsml("Super!")).toContain("de-DE-KatjaNeural");
    // Arabic is always Arabic.
    expect(buildSsml("بَيْتٌ", undefined, "en")).toContain('xml:lang="ar-SA"');
  });
});
