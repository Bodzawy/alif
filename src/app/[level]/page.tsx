import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { LessonCard } from "@/components/lessons/lesson-card";
import { LEVELS, getLevel, lessonEntryHref, lessonExercises } from "@/data/curriculum";

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
        {level.lessons.map((lesson, index) => (
          <li key={lesson.slug}>
            <LessonCard
              levelSlug={level.slug}
              lesson={{
                slug: lesson.slug,
                number: lesson.number,
                title: lesson.title,
                subtitle: lesson.subtitle,
                minutes: lesson.minutes,
                letter: lesson.letter,
              }}
              href={lessonEntryHref(level.slug, lesson)}
              total={lessonExercises(lesson).length}
              previousLessonSlug={level.lessons[index - 1]?.slug}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
