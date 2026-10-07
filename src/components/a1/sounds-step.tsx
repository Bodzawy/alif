"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button, buttonClasses } from "@/components/ui/button";
import type { SoundItem } from "@/data/types";
import { cn } from "@/lib/utils";

import { SoundCard } from "./sound-card";
import { usePracticeSession } from "./use-practice-session";

// Step type "sounds": one sound at a time (أَ → إِ → أُ), each with listen and
// speak. The student moves on with "Weiter"; after the last sound it leads to
// the next step of the lesson.
export function SoundsStep({ sounds, nextHref, nextLabel }: { sounds: SoundItem[]; nextHref?: string; nextLabel: string }) {
  const [index, setIndex] = useState(0);
  const session = usePracticeSession();
  const sound = sounds[index]!;
  const last = index === sounds.length - 1;

  return (
    <div data-testid="sounds-step" data-index={index}>
      <ol dir="rtl" className="mb-5 flex justify-center gap-2" aria-label="Laute">
        {sounds.map((item, i) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-current={i === index ? "step" : undefined}
              data-testid={`sound-tab-${item.id}`}
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl border font-arabic text-3xl transition focus-ring",
                i === index ? "border-primary bg-primary text-primary-foreground" : "bg-card text-primary hover:bg-primary-soft",
                session.passed.has(item.exercise.id) && i !== index && "border-success/50 bg-success-soft text-success"
              )}
            >
              {item.glyph}
            </button>
          </li>
        ))}
      </ol>

      <SoundCard
        key={sound.id}
        sound={sound}
        passed={session.passed.has(sound.exercise.id)}
        locked={session.isLocked(sound.exercise.id)}
        onBusyChange={session.busyHandler(sound.exercise.id)}
        onResult={session.resultHandler(sound.exercise.id)}
        className="animate-fade-in"
      />

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => setIndex(index - 1)} disabled={index === 0} data-testid="sound-prev">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Zurück
        </Button>
        {!last ? (
          <Button size="lg" onClick={() => setIndex(index + 1)} data-testid="sound-next">
            Weiter zu <span lang="ar" className="font-arabic text-2xl leading-none">{sounds[index + 1]!.glyph}</span>
            <ArrowRight className="h-5 w-5" aria-hidden />
          </Button>
        ) : nextHref ? (
          <Link href={nextHref} className={buttonClasses({ size: "lg" })} data-testid="step-next">
            {nextLabel} <ArrowRight className="h-5 w-5" aria-hidden />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
