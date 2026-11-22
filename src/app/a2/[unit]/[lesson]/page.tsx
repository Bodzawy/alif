import { notFound, redirect } from "next/navigation";

import { a2Entries, a2StepHref, getA2Lesson, getA2Unit } from "@/data/a2";

type Params = { unit: string; lesson: string };

export function generateStaticParams(): Params[] {
  return a2Entries().map(({ unit, lesson }) => ({ unit: unit.slug, lesson: lesson.slug }));
}

// An entry starts at its first step.
export default async function A2LessonPage({ params }: { params: Promise<Params> }) {
  const { unit: unitSlug, lesson: slug } = await params;
  const unit = getA2Unit(unitSlug);
  const lesson = getA2Lesson(unitSlug, slug);
  if (unit && lesson) redirect(a2StepHref(unit, lesson, lesson.steps[0]!.slug));
  notFound();
}
