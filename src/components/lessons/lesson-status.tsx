"use client";

import { CheckCircle2, Circle, PlayCircle } from "lucide-react";

import { useLessonProgress } from "./use-lesson-progress";

export function LessonStatus({ levelSlug, lessonSlug, total }: { levelSlug: string; lessonSlug: string; total: number }) {
  const { progress } = useLessonProgress(levelSlug, lessonSlug);
  const passed = progress.passed.length;

  if (progress.completedAt) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Abgeschlossen
      </span>
    );
  }
  if (passed > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-foreground">
        <PlayCircle className="h-3.5 w-3.5" aria-hidden /> {Math.min(passed, total)} / {total}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
      <Circle className="h-3.5 w-3.5" aria-hidden /> Neu
    </span>
  );
}
