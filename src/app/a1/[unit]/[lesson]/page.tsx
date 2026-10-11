import { notFound, redirect } from "next/navigation";

import { a1Entries, a1StepHref, getA1Lesson, getA1Unit, movedStep } from "@/data/a1";

type Params = { unit: string; lesson: string };

export function generateStaticParams(): Params[] {
  return a1Entries().map(({ unit, lesson }) => ({ unit: unit.slug, lesson: lesson.slug }));
}

// An entry starts at its first step. Old URLs: /a1/lesson-1/step-N (Alif) and
// /a1/<letter>/step-N lead to the step's new place.
export default async function A1LessonPage({ params }: { params: Promise<Params> }) {
  const { unit: unitSlug, lesson: slug } = await params;
  const unit = getA1Unit(unitSlug);
  const lesson = getA1Lesson(unitSlug, slug);
  if (unit && lesson) redirect(a1StepHref(unit, lesson, lesson.steps[0]!.slug));

  const step = movedStep(slug);
  if (unit && step) {
    const alif = unit.lessons[0]!;
    redirect(a1StepHref(unit, alif, alif.steps.some((s) => s.slug === step) ? step : alif.steps[0]!.slug));
  }
  const entry = a1Entries().find((e) => e.lesson.slug === unitSlug);
  if (entry && step) redirect(a1StepHref(entry.unit, entry.lesson, entry.lesson.steps.some((s) => s.slug === step) ? step : entry.lesson.steps[0]!.slug));
  notFound();
}
