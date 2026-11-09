"use client";

import Image from "next/image";

import type { Dialogue } from "@/data/types";
import { useT } from "@/i18n/use-locale";

import { DialogueListen } from "./dialogue-listen";
import { DialogueSpeaking } from "./dialogue-speaking";

/** Step type "dialogue": listen to it, repeat it line by line, or speak one role. */
export function DialogueStep({ dialogue, mode, progressKey }: { dialogue: Dialogue; mode: "listen" | "repeat" | "roleplay"; progressKey: string }) {
  const t = useT();
  return (
    <>
      {/* The speakers talking to each other, above the conversation. */}
      {dialogue.scene && (
        <Image
          src={dialogue.scene.src}
          alt={t(dialogue.scene.alt)}
          width={1200}
          height={640}
          priority
          sizes="(max-width: 768px) 100vw, 720px"
          className="mx-auto mb-5 h-auto w-full max-w-2xl rounded-3xl border shadow-card"
          data-testid="dialogue-scene"
        />
      )}
      {mode === "listen" ? <DialogueListen dialogue={dialogue} progressKey={progressKey} /> : <DialogueSpeaking dialogue={dialogue} mode={mode} progressKey={progressKey} />}
    </>
  );
}
