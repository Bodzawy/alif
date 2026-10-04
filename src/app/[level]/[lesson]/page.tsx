import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LessonGate } from "@/components/lessons/lesson-gate";
import { LessonPlayer } from "@/components/lessons/lesson-player";
import { LEVELS, getLesson, lessonEntryHref, nextLesson, previousLesson } from "@/data/curriculum";

type Params = { level: string; lesson: string };

export function generateStaticParams(): Params[] {
  return LEVELS.flatMap((level) => level.lessons.map((lesson) => ({ level: level.slug, lesson: lesson.slug })));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { level: levelSlug, lesson: lessonSlug } = await params;
  const found = getLesson(levelSlug, lessonSlug);
  return found
    ? { title: `${found.level.code} · Lektion ${found.lesson.number}: ${found.lesson.title}`, description: found.lesson.subtitle }
    : {};
}

export default async function LessonPage({ params }: { params: Promise<Params> }) {
  const { level: levelSlug, lesson: lessonSlug } = await params;
  const found = getLesson(levelSlug, lessonSlug);
  if (!found) notFound();

  const next = nextLesson(levelSlug, lessonSlug);
  const previous = previousLesson(levelSlug, lessonSlug);

  return (
    <LessonGate
      levelSlug={found.level.slug}
      levelCode={found.level.code}
      lessonNumber={found.lesson.number}
      previous={previous && { slug: previous.slug, number: previous.number, title: previous.title, href: lessonEntryHref(found.level.slug, previous) }}
    >
      <LessonPlayer
        levelSlug={found.level.slug}
        levelCode={found.level.code}
        lesson={found.lesson}
        nextLessonHref={next ? lessonEntryHref(found.level.slug, next) : undefined}
      />
    </LessonGate>
  );
}
