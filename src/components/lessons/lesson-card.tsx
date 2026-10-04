"use client";

import Link from "next/link";
import { ArrowRight, Clock, Lock } from "lucide-react";

import type { Lesson } from "@/data/types";
import { cn } from "@/lib/utils";

import { LessonStatus } from "./lesson-status";
import { useLessonUnlocked } from "./use-lesson-unlocked";

/** One lesson in a level's list: opens the lesson (or its intro), or shows it locked. */
export function LessonCard({
  levelSlug,
  lesson,
  href,
  total,
  previousLessonSlug,
}: {
  levelSlug: string;
  lesson: Pick<Lesson, "slug" | "number" | "title" | "subtitle" | "minutes" | "letter">;
  href: string;
  total: number;
  previousLessonSlug?: string;
}) {
  const { unlocked } = useLessonUnlocked(levelSlug, previousLessonSlug);

  const content = (
    <>
      <span
        lang="ar"
        aria-hidden
        className={cn(
          "flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl font-arabic text-5xl font-bold sm:h-24 sm:w-24 sm:text-6xl",
          unlocked ? "bg-primary-soft text-primary" : "bg-muted text-muted-foreground/60"
        )}
      >
        {lesson.letter.glyph}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("text-sm font-semibold", unlocked ? "text-primary" : "text-muted-foreground")}>Lektion {lesson.number}</span>
        <span className="block text-lg font-bold sm:text-xl">{lesson.title}</span>
        <span className="mt-1 hidden text-sm text-muted-foreground sm:block">{lesson.subtitle}</span>
        <span className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {unlocked ? (
            <LessonStatus levelSlug={levelSlug} lessonSlug={lesson.slug} total={total} />
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              <Lock className="h-3.5 w-3.5" aria-hidden /> Gesperrt
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden /> ca. {lesson.minutes} Min.
          </span>
        </span>
      </span>
      {unlocked ? (
        <ArrowRight className="h-6 w-6 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" aria-hidden />
      ) : (
        <Lock className="h-5 w-5 shrink-0 text-muted-foreground/60" aria-hidden />
      )}
    </>
  );

  const className = "group flex items-center gap-4 rounded-3xl border bg-card p-4 shadow-card transition sm:gap-6 sm:p-5";

  if (!unlocked) {
    return (
      <div
        aria-disabled
        data-testid={`lesson-link-${lesson.slug}`}
        data-locked="true"
        className={cn(className, "cursor-not-allowed opacity-70 shadow-none")}
      >
        {content}
      </div>
    );
  }

  return (
    <Link href={href} data-testid={`lesson-link-${lesson.slug}`} className={cn(className, "hover:-translate-y-0.5 hover:shadow-lift focus-ring")}>
      {content}
    </Link>
  );
}
