"use client";

import type { Dialogue } from "@/data/types";

import { DialogueListen } from "./dialogue-listen";
import { DialogueSpeaking } from "./dialogue-speaking";

/** Step type "dialogue": listen to it, repeat it line by line, or speak one role. */
export function DialogueStep({ dialogue, mode, progressKey }: { dialogue: Dialogue; mode: "listen" | "repeat" | "roleplay"; progressKey: string }) {
  return mode === "listen" ? <DialogueListen dialogue={dialogue} progressKey={progressKey} /> : <DialogueSpeaking dialogue={dialogue} mode={mode} progressKey={progressKey} />;
}
