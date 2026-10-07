"use client";

import type { ReactNode } from "react";

import { VocabularyCard } from "@/components/lessons/vocabulary-card";
import type { SoundItem, VocabularyItem } from "@/data/types";

import { SoundCard } from "./sound-card";
import { usePracticeSession } from "./use-practice-session";

// Step type "sound-words", laid out like the lesson sheet: one row per sound,
// read right to left – the sound (with listen and speak) first, then the
// words that begin with it, each a card with the picture on top.
//   wide (xl): [ sound ] [ word 1 ] [ word 2 ] [ word 3 ]   (RTL, sound on the right)
//   narrower:  the sound as a strip, then the word cards in three / two / one columns.
//
// `guided` (guided mode, see guided/guided-sound-words.tsx): every card is
// wrapped in a block frame and its listen / record buttons are hidden. Without
// it the page is exactly the button page.
export type GuidedView = {
  frame: (id: string, card: ReactNode) => ReactNode;
  passed: (id: string) => boolean;
};

export function SoundWordsStep({ groups, guided }: { groups: { sound: SoundItem; words: VocabularyItem[] }[]; guided?: GuidedView }) {
  const session = usePracticeSession();
  const passed = (id: string) => (guided ? guided.passed(id) : session.passed.has(id));

  return (
    <div className="space-y-6 lg:space-y-8" data-testid="sound-words-step">
      {groups.map(({ sound, words }) => (
        <section
          key={sound.id}
          dir="rtl"
          aria-label={`Wörter mit ${sound.glyph}`}
          data-testid={`word-group-${sound.id}`}
          className="grid gap-4 rounded-[2rem] border border-primary/10 bg-card/60 p-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[13rem_repeat(3,minmax(0,1fr))] xl:p-4 [&_svg]:shrink-0"
        >
          {guided ? (
            <div className="grid sm:col-span-2 lg:col-span-3 xl:col-span-1">
              {guided.frame(
                sound.id,
                <SoundCard
                  sound={sound}
                  size="side"
                  passed={passed(sound.id)}
                  locked
                  onBusyChange={session.busyHandler(sound.exercise.id)}
                  onResult={session.resultHandler(sound.exercise.id)}
                  className="h-full"
                  hideControls
                />
              )}
            </div>
          ) : (
            <SoundCard
              sound={sound}
              size="side"
              passed={passed(sound.exercise.id)}
              locked={session.isLocked(sound.exercise.id)}
              onBusyChange={session.busyHandler(sound.exercise.id)}
              onResult={session.resultHandler(sound.exercise.id)}
              className="sm:col-span-2 lg:col-span-3 xl:col-span-1"
            />
          )}
          <ol className="contents" aria-label={`Wörter mit ${sound.glyph}`}>
            {words.map((word) => (
              <li key={word.id} dir="ltr" className="grid" data-testid={`word-slot-${word.id}`}>
                {guided ? (
                  guided.frame(
                    word.id,
                    <VocabularyCard
                      item={word}
                      passed={passed(word.id)}
                      locked
                      onBusyChange={session.busyHandler(word.exercise.id)}
                      onResult={session.resultHandler(word.exercise.id)}
                      simpleFeedback
                      hideControls
                    />
                  )
                ) : (
                  <VocabularyCard
                    item={word}
                    passed={passed(word.exercise.id)}
                    locked={session.isLocked(word.exercise.id)}
                    onBusyChange={session.busyHandler(word.exercise.id)}
                    onResult={session.resultHandler(word.exercise.id)}
                    simpleFeedback
                  />
                )}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
