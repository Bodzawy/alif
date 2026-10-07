import { useCallback } from "react";

import type { WritingForm } from "@/data/types";
import type { FailReason } from "@/lib/writing/trace";

// NARRATION HOOK – the handwriting page has no recorded narration yet. Every
// moment that will get a voice calls narrate(); to add narration later, play
// the matching recording here (e.g. with createNarrator from
// src/lib/audio/narration.ts, like Schritt 3 "Formen"). Until then: silent.

export type WritingNarrationEvent =
  | { type: "go"; form: WritingForm }
  | { type: "nextStroke"; form: WritingForm; stroke: number }
  | { type: "fail"; reason: FailReason }
  | { type: "formDone"; form: WritingForm; stars: number }
  | { type: "allDone" };

export function useWritingNarration() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return useCallback((_event: WritingNarrationEvent) => undefined, []);
}
