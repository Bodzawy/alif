"use client";

import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

import { buttonClasses } from "@/components/ui/button";

import { useLessonUnlocked } from "./use-lesson-unlocked";

/** Renders a lesson (or its intro) only once the lesson is unlocked. */
export function LessonGate({
  levelSlug,
  levelCode,
  lessonNumber,
  previous,
  children,
}: {
  levelSlug: string;
  levelCode: string;
  lessonNumber: number;
  /** The lesson before this one; omitted for the first lesson. */
  previous?: { slug: string; number: number; title: string; href: string };
  children: React.ReactNode;
}) {
  const { hydrated, unlocked } = useLessonUnlocked(levelSlug, previous?.slug);

  if (unlocked) return <>{children}</>;

  return (
    <div className="container max-w-2xl py-10 sm:py-16">
      <nav aria-label="Brotkrumen" className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/${levelSlug}`} className="inline-flex items-center gap-1 rounded-md hover:text-foreground focus-ring">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {levelCode}
        </Link>
        <span aria-hidden>/</span>
        <span className="font-medium text-foreground">Lektion {lessonNumber}</span>
      </nav>
      {!hydrated ? (
        <div className="h-48 animate-pulse rounded-3xl bg-muted" aria-hidden />
      ) : (
        <div data-testid="lesson-locked" className="rounded-3xl border bg-card p-6 text-center shadow-card sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Lock className="h-7 w-7" aria-hidden />
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight">Diese Lektion ist noch gesperrt.</h1>
          {previous && (
            <>
              <p className="mt-2 text-muted-foreground">
                Schließe zuerst Lektion {previous.number} ab: {previous.title}.
              </p>
              <Link href={previous.href} className={buttonClasses({ size: "lg", className: "mt-6" })}>
                Zu Lektion {previous.number}
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
