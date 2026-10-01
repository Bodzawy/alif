import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";

import { LessonStatus } from "@/components/lessons/lesson-status";
import { LEVELS, getLevel, lessonExercises } from "@/data/curriculum";

type Params = { level: string };

export function generateStaticParams(): Params[] {
  return LEVELS.map((level) => ({ level: level.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const level = getLevel((await params).level);
  return level ? { title: `${level.code} – ${level.title}`, description: level.description } : {};
}

export default async function LevelPage({ params }: { params: Promise<Params> }) {
  const level = getLevel((await params).level);
  if (!level) notFound();

  return (
    <div className="container max-w-4xl py-8 sm:py-12">
      <Link href="/" className="mb-6 inline-flex items-center gap-1 rounded-md text-sm text-muted-foreground hover:text-foreground focus-ring">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Startseite
      </Link>

      <header className="flex items-center gap-4">
        <span className="rounded-2xl bg-primary px-4 py-3 text-3xl font-bold text-primary-foreground">{level.code}</span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{level.title}</h1>
          <p className="mt-1 text-muted-foreground">{level.description}</p>
        </div>
      </header>

      <ol className="mt-8 space-y-4" aria-label="Lektionen">
        {level.lessons.map((lesson) => (
          <li key={lesson.slug}>
            <Link
              href={`/${level.slug}/${lesson.slug}`}
              data-testid={`lesson-link-${lesson.slug}`}
              className="group flex items-center gap-4 rounded-3xl border bg-card p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift focus-ring sm:gap-6 sm:p-5"
            >
              <span
                lang="ar"
                aria-hidden
                className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary-soft font-arabic text-5xl font-bold text-primary sm:h-24 sm:w-24 sm:text-6xl"
              >
                {lesson.letter.glyph}
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-sm font-semibold text-primary">Lektion {lesson.number}</span>
                <span className="block text-lg font-bold sm:text-xl">{lesson.title}</span>
                <span className="mt-1 hidden text-sm text-muted-foreground sm:block">{lesson.subtitle}</span>
                <span className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <LessonStatus levelSlug={level.slug} lessonSlug={lesson.slug} total={lessonExercises(lesson).length} />
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" aria-hidden /> ca. {lesson.minutes} Min.
                  </span>
                </span>
              </span>
              <ArrowRight className="h-6 w-6 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" aria-hidden />
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
