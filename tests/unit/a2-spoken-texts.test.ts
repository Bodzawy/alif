import { describe, expect, it } from "vitest";

import { A2_LEVEL } from "@/data/a2";
import { ALLOWED_TTS_TEXTS } from "@/lib/pronunciation/targets";

// A quiz under a dialogue (e.g. A2 Lektion 1, Übung 8 b) has listen buttons: without a recording its
// texts go to /api/tts, which only speaks known lesson texts – a missing text stays silent (400).
describe("A2 spoken texts", () => {
  it("every question of a dialogue's quiz can be spoken", () => {
    const texts = A2_LEVEL.units.flatMap((unit) =>
      unit.lessons.flatMap((lesson) => lesson.steps.flatMap((step) => (step.kind === "dialogue" ? (step.quiz ?? []).map((item) => item.spoken ?? item.arabic) : [])))
    );
    expect(texts.length).toBeGreaterThan(0);
    for (const text of texts) expect(ALLOWED_TTS_TEXTS.has(text), text).toBe(true);
  });
});
