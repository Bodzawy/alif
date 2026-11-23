import { stem } from "./stem";

// A check for what the learner writes freely. There is no teacher to read it, so the check only says
// what can be told for sure: Arabic letters, enough words, words of the lesson, and the agreement of
// an adjective with its noun ( هِيَ + feminine · هُوَ + masculine · a noun the book names). Everything
// else stays a hint ("kenne ich nicht"), never a "wrong". The model answer is shown after the check.

export type Level = "ok" | "hint" | "wrong";
export type Verdict = { level: Level; messages: string[] };

export type CheckContext = {
  /** Stems of every word of the lesson (see lessonLexicon). */
  lexicon: ReadonlySet<string>;
  /** Stems of the masculine form of the adjectives of the lesson. */
  adjectives: ReadonlySet<string>;
};

const ARABIC_LETTER = /[ء-ي]/;
const NOT_ARABIC = /[A-Za-zÀ-ɏ]/;
/** Small words that are not in the lesson texts as words of their own. */
const FUNCTION_WORDS = ["و", "ف", "في", "من", "على", "الى", "إلى", "عن", "مع", "هو", "هي", "هذا", "هذه", "ذلك", "تلك", "التي", "الذي", "لا", "ليس", "ليست", "هل", "نعم", "كل", "جدا", "أيضا", "ايضا", "لكن", "ولكن", "او", "أو", "ثم", "بها", "به", "فيها", "فيه", "له", "لها", "ما", "مثل", "حول", "بعض", "غير"].map(stem);

export const tokensOf = (text: string) => text.split(/\s+/).map((token) => token.replace(/[.,،؟?!:؛"«»()]/g, "")).filter(Boolean);

/** Without a possessive ending ( شعره · سيارتي · بيتها ) – to find the word again in the lexicon. */
const bases = (bare: string) => {
  const out = [bare];
  for (const ending of ["ها", "هم", "نا", "ك", "ه", "ي"]) if (bare.length > ending.length + 1 && bare.endsWith(ending)) out.push(bare.slice(0, -ending.length));
  for (const word of [...out]) if (word.endsWith("ت")) out.push(`${word.slice(0, -1)}ة`);
  return out;
};

const known = (token: string, ctx: CheckContext) => {
  const bare = stem(token);
  return /^[\d٠-٩]+$/.test(bare) || bases(bare).some((base) => ctx.lexicon.has(base) || FUNCTION_WORDS.includes(base)) || bases(bare.replace(/^[وف]/, "")).some((base) => ctx.lexicon.has(base));
};

const isFeminineAdjective = (bare: string, ctx: CheckContext) => bare.endsWith("ة") && ctx.adjectives.has(bare.slice(0, -1));
const isMasculineAdjective = (bare: string, ctx: CheckContext) => ctx.adjectives.has(bare);

/** What every text must satisfy: Arabic letters, and the unknown words as a hint. */
function basics(text: string, ctx: CheckContext, minWords: number): Verdict | null {
  const tokens = tokensOf(text);
  if (tokens.length === 0) return { level: "wrong", messages: ["Hier fehlt noch etwas."] };
  if (NOT_ARABIC.test(text) || !ARABIC_LETTER.test(text)) return { level: "wrong", messages: ["Bitte schreib auf Arabisch (mit der arabischen Tastatur)."] };
  if (tokens.length < minWords) return { level: "wrong", messages: [minWords === 1 ? "Hier fehlt noch etwas." : `Schreib mindestens ${minWords} Wörter.`] };
  return null;
}

function unknownHint(tokens: string[], ctx: CheckContext): string | null {
  const unknown = tokens.filter((token) => !known(token, ctx));
  return unknown.length > 0 ? `Aus dieser Lektion kenne ich nicht: ${unknown.map((token) => `«${token}»`).join(" ")} – prüfe die Schreibung.` : null;
}

/** One gap of "أكمل الجمل": an adjective that must agree ("f" / "m") or any word. */
export function checkGap(value: string, agrees: "f" | "m" | undefined, ctx: CheckContext): Verdict {
  const failed = basics(value, ctx, 1);
  if (failed) return failed;
  const tokens = tokensOf(value);
  const messages: string[] = [];
  let level: Level = "ok";
  if (agrees) {
    const adjectives = tokens.map(stem).filter((bare) => isMasculineAdjective(bare, ctx) || isFeminineAdjective(bare, ctx));
    if (adjectives.length === 0) {
      level = "hint";
      messages.push("Hier passt eine Eigenschaft (Adjektiv).");
    } else if (agrees === "f" && adjectives.some((bare) => !isFeminineAdjective(bare, ctx))) {
      return { level: "wrong", messages: ["Das Nomen ist weiblich – das Adjektiv braucht die weibliche Form (… ـَةٌ)."] };
    } else if (agrees === "m" && adjectives.some((bare) => isFeminineAdjective(bare, ctx))) {
      return { level: "wrong", messages: ["Das Nomen ist männlich – das Adjektiv hat keine weibliche Endung (ـَة)."] };
    }
  }
  const hint = unknownHint(tokens, ctx);
  if (hint) {
    level = "hint";
    messages.push(hint);
  }
  return { level, messages: level === "ok" ? ["Gut!"] : messages };
}

/** A longer free text (an advertisement, a city). `describing`: sentences with هُوَ / هِيَ – the adjectives must agree. */
export function checkText(text: string, ctx: CheckContext, options: { minWords: number; describing?: boolean }): Verdict {
  const failed = basics(text, ctx, options.minWords);
  if (failed) return failed;
  const tokens = tokensOf(text);
  if (options.describing) {
    let subject: "m" | "f" | null = null;
    for (const token of tokens) {
      const bare = stem(token);
      /** "وَقَصِيرٌ": the adjective without the "و" that joins it. */
      const core = bare.startsWith("و") && bare.length > 2 ? bare.slice(1) : bare;
      const adjective = isMasculineAdjective(core, ctx) || isFeminineAdjective(core, ctx);
      if (bare === stem("هو")) subject = "m";
      else if (bare === stem("هي")) subject = "f";
      else if (subject === "m" && isFeminineAdjective(core, ctx)) return { level: "wrong", messages: [`Nach هُوَ (er) steht die männliche Form – «${token}» ist weiblich.`] };
      else if (subject === "f" && isMasculineAdjective(core, ctx) && !core.endsWith("ة")) return { level: "wrong", messages: [`Nach هِيَ (sie) steht die weibliche Form (… ـَة) – «${token}» ist männlich.`] };
      // "… وَشَعْرُهَا طَوِيلٌ": a new noun after "و" starts a new clause – its adjective follows that noun, not هُوَ / هِيَ.
      else if (subject && bare.startsWith("و") && bare.length > 2 && !adjective) subject = null;
    }
    if (!tokens.some((token) => [stem("هو"), stem("هي")].includes(stem(token)))) {
      const hint = unknownHint(tokens, ctx);
      return { level: "hint", messages: [hint ?? "Fang am besten mit هُوَ oder هِيَ an.", ...(hint ? ["Fang am besten mit هُوَ oder هِيَ an."] : [])] };
    }
  }
  const hint = unknownHint(tokens, ctx);
  return hint ? { level: "hint", messages: [hint] } : { level: "ok", messages: ["Gut!"] };
}

/** Every Arabic word of the lesson data (as stems): what the learner has seen and may write. */
export function lessonLexicon(data: unknown): string[] {
  const words = JSON.stringify(data).match(/[ء-يً-ٰٟ]+/g) ?? [];
  return [...new Set(words.map(stem).filter((word) => word.length > 0))];
}

/** What the worksheet pages of a lesson need to check the learner's writing: its words and its adjectives (as stems). */
export function writingContext(lesson: { adjectives?: string[]; steps: unknown }): { lexicon: string[]; adjectives: string[] } {
  return { lexicon: lessonLexicon(lesson.steps), adjectives: (lesson.adjectives ?? []).map(stem) };
}
