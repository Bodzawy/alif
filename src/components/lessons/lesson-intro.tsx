"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, PlayCircle, SkipForward } from "lucide-react";

import { buttonClasses } from "@/components/ui/button";
import type { Lesson, LessonIntroVideo } from "@/data/types";
import { getLessonProgress, lessonKey } from "@/lib/progress";
import { cn } from "@/lib/utils";

import { useLessonProgress } from "./use-lesson-progress";

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function LessonIntro({
  levelSlug,
  levelCode,
  lesson,
  video,
}: {
  levelSlug: string;
  levelCode: string;
  lesson: Lesson;
  video: LessonIntroVideo;
}) {
  const { markIntroWatched } = useLessonProgress(levelSlug, lesson.slug);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const chapters = video.chapters ?? [];
  const lessonHref = `/${levelSlug}/${lesson.slug}`;

  // Whether the intro was seen on an earlier visit. Read once after mount so the
  // server render and hydration use the first-visit layout, and so finishing the
  // video now doesn't switch the layout mid-visit.
  const [seenBefore, setSeenBefore] = useState(false);
  useEffect(() => {
    setSeenBefore(Boolean(getLessonProgress(lessonKey(levelSlug, lesson.slug)).introSeenAt));
  }, [levelSlug, lesson.slug]);

  function onTimeUpdate() {
    const time = videoRef.current?.currentTime ?? 0;
    const index = chapters.findLastIndex((chapter) => chapter.start <= time);
    if (index >= 0 && index !== activeChapter) setActiveChapter(index);
  }

  function seek(index: number) {
    const element = videoRef.current;
    if (!element) return;
    setActiveChapter(index);
    element.currentTime = chapters[index]!.start;
    // Autoplay may be refused; the student can still press play.
    element.play().catch(() => {});
  }

  return (
    <div className="container max-w-4xl py-6 sm:py-10">
      <nav aria-label="Brotkrumen" className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/${levelSlug}`} className="inline-flex items-center gap-1 rounded-md hover:text-foreground focus-ring">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {levelCode}
        </Link>
        <span aria-hidden>/</span>
        <span className="font-medium text-foreground">Lektion {lesson.number}</span>
      </nav>

      <header className="mb-6 sm:mb-8">
        <p className="text-sm font-semibold text-primary">
          {levelCode} · Lektion {lesson.number} · Einführung
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{lesson.title}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Schau dir zuerst das kurze Video an – danach geht es direkt mit der Lektion los.</p>
      </header>

      {seenBefore ? (
        <div
          className="mb-4 flex flex-col gap-3 rounded-2xl border bg-card p-3 shadow-card sm:flex-row sm:items-center sm:justify-between sm:pl-5"
          data-testid="intro-seen-notice"
        >
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden />
            Du hast dieses Video schon gesehen.
          </p>
          <Link
            href={lessonHref}
            className={buttonClasses({ variant: "secondary", className: "w-full sm:w-auto" })}
            data-testid="intro-skip-seen"
          >
            <SkipForward className="h-4 w-4" aria-hidden />
            Intro überspringen
          </Link>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-3xl border bg-card shadow-card">
        <video
          ref={videoRef}
          src={video.src}
          poster={video.poster}
          controls
          playsInline
          preload="metadata"
          onTimeUpdate={onTimeUpdate}
          onEnded={markIntroWatched}
          className="aspect-video w-full bg-black"
          data-testid="intro-video"
        >
          Dein Browser kann dieses Video leider nicht abspielen.
        </video>
      </div>

      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        {seenBefore ? (
          <span className="hidden sm:block" />
        ) : (
          <Link
            href={lessonHref}
            onClick={markIntroWatched}
            className="order-2 rounded-md px-2 py-1 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-ring sm:order-1"
            data-testid="intro-skip"
          >
            Überspringen
          </Link>
        )}
        <Link
          href={lessonHref}
          onClick={markIntroWatched}
          className={buttonClasses({ size: "lg", className: "order-1 w-full sm:order-2 sm:w-auto" })}
          data-testid="intro-continue"
        >
          Weiter zur Lektion <ArrowRight className="h-5 w-5" aria-hidden />
        </Link>
      </div>

      {chapters.length > 0 ? (
        <section aria-labelledby="chapters-heading" className="mt-10">
          <h2 id="chapters-heading" className="text-sm font-semibold uppercase tracking-wide text-primary">
            Kapitel
          </h2>
          <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {chapters.map((chapter, index) => {
              const active = index === activeChapter;
              return (
                <li key={chapter.start}>
                  <button
                    type="button"
                    onClick={() => seek(index)}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition focus-ring",
                      active ? "border-primary/30 bg-primary-soft text-primary" : "bg-card hover:bg-muted"
                    )}
                  >
                    <PlayCircle className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} aria-hidden />
                    <span className="w-10 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{formatTime(chapter.start)}</span>
                    <span className="font-medium">{chapter.title}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}
    </div>
  );
}
