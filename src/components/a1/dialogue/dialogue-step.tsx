"use client";

import Image from "next/image";

import { QuizList } from "@/components/a1/quiz/quiz-list";
import type { Dialogue, QuizItem } from "@/data/types";
import { useT } from "@/i18n/use-locale";

import { DialogueListen } from "./dialogue-listen";
import { DialogueSpeaking } from "./dialogue-speaking";

/** Step type "dialogue": listen to it, repeat it line by line, or speak one role. */
export function DialogueStep({ dialogue, mode, progressKey, quiz }: { dialogue: Dialogue; quiz?: QuizItem[]; mode: "listen" | "repeat" | "roleplay" | "read" | "audio"; progressKey: string }) {
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
      {mode === "listen" && <DialogueListen dialogue={dialogue} progressKey={progressKey} />}
      {/* Only read (no sound, no microphone), then answer the question about the pictures. */}
      {/* Only the sound: the picture shows who talks, the learner can repeat it, the questions come below. */}
      {mode === "audio" && (
        <>
          <DialogueListen dialogue={dialogue} progressKey={progressKey} textHidden translation={false} completes={!quiz} />
          {quiz && (
            <div className="mt-8" data-testid="dialogue-quiz">
              <QuizList items={quiz} progressKey={progressKey} />
            </div>
          )}
        </>
      )}
      {mode === "read" && <DialogueListen dialogue={dialogue} progressKey={progressKey} silent translation={false} />}
      {(mode === "repeat" || mode === "roleplay") && <DialogueSpeaking dialogue={dialogue} mode={mode} progressKey={progressKey} />}
    </>
  );
}
