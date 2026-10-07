import type { GapVowel } from "@/lib/arabic/gap";

// Narration of Schritt 5 "Ergänzen" and 6 "Hören". GAPS_TEXT is the one source
// for the on-screen caption AND the recording script; file names refer to
// GapsContent.audioBase (without ".wav").

export const GAPS_TEXT: Record<string, string> = {
  g5_intro: "Welcher Buchstabe fehlt? Schau auf das Bild und das Wort. Zieh den richtigen Buchstaben in die Lücke.",
  g6_intro: "Hör gut zu. Welcher Buchstabe fehlt? Tippe auf den richtigen Buchstaben.",
  g_ok: "Richtig! Gut gemacht.",
  g_hint: "Fast! Hör noch einmal genau zu.",
  g_reveal_a: "Hier hörst du ein A. Die Hamza steht oben.",
  g_reveal_i: "Hier hörst du ein I. Die Hamza steht unten.",
  g_reveal_u: "Hier hörst du ein U. Die Hamza steht oben.",
  g_reveal_sukun: "Nach der Hamza hörst du keinen Vokal. Darum steht ein Sukun.",
  g5_done: "Geschafft! Du hast alle Lücken gefüllt. Schau dir deine Ergebnisse an.",
  g6_done: "Toll! Du hast alles richtig gehört. Das Alif mit Hamza kennst du jetzt gut.",
};

/** Clips shared by both steps (the intro and done clips come from the step data). */
export const GAPS_NARRATION = {
  ok: "g_ok",
  hint: "g_hint",
  reveal: (vowel: GapVowel) => `g_reveal_${vowel}`,
} as const;

/** Fallbacks when a clip cannot be played (missing, muted, blocked): the flow never waits longer. */
export const GAPS_FALLBACK_MS = { intro: 4000, reveal: 4000, clip: 2500 } as const;

/** Stars on the result screen from the share of items right on the first try. */
export function gapStars(firstTry: number, total: number): 1 | 2 | 3 {
  if (total > 0 && firstTry === total) return 3;
  return total > 0 && firstTry / total >= 0.7 ? 2 : 1;
}
