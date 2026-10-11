import { a1Entries } from "@/data/a1";
import type { A1Word } from "@/data/types";

/** Every word of every A1 entry ("Wörter" and phrases), in lesson order. */
export function a1Words(): A1Word[] {
  return a1Entries().flatMap(({ lesson }) =>
    lesson.steps.flatMap((step) => (step.kind === "sound-words" ? step.groups.flatMap((group) => group.words) : step.kind === "phrases" ? step.phrases : []))
  );
}
