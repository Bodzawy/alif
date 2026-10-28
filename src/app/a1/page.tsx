import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { A1_LEVEL, a1UnitHref } from "@/data/a1";
import type { A1Unit, A1UnitGroup } from "@/data/types";
import { T } from "@/i18n/use-locale";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: `${A1_LEVEL.code} – ${A1_LEVEL.title}`,
  description: A1_LEVEL.description,
};

/** The lessons in book order, one section per group (the beginning, then each unit of the book). */
function sections(units: A1Unit[]): Array<{ group: A1UnitGroup; units: A1Unit[] }> {
  const out: Array<{ group: A1UnitGroup; units: A1Unit[] }> = [];
  for (const unit of units) {
    const last = out.at(-1);
    if (last && last.group.id === unit.group.id) last.units.push(unit);
    else out.push({ group: unit.group, units: [unit] });
  }
  return out;
}

const parts = (n: number) => (n === 1 ? <T>1 Teil</T> : <T params={{ n }}>{"{n} Teile"}</T>);

// /a1: the lessons of the book, grouped by unit (two per row). A lesson's
// letters, review and phrase are its contents (/a1/<lesson>), not lessons of
// their own. Every card has the same skeleton so a row lines up: badge and
// parts · Arabic title (two lines high) · German line · footer with the letters.
export default function A1Page() {
  return (
    <div className="container max-w-4xl py-8 sm:py-12">
      <Link href="/" className="mb-6 inline-flex items-center gap-1 rounded-md text-sm text-muted-foreground hover:text-foreground focus-ring">
        <ArrowLeft className="h-4 w-4" aria-hidden /> <T>Startseite</T>
      </Link>

      <header className="flex items-center gap-4">
        <span className="rounded-2xl bg-primary px-4 py-3 text-3xl font-bold text-primary-foreground">{A1_LEVEL.code}</span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <T>{A1_LEVEL.title}</T>
          </h1>
          <p className="mt-1 text-muted-foreground">
            <T>{A1_LEVEL.description}</T>
          </p>
        </div>
      </header>

      <div className="mt-10 space-y-10">
        {sections(A1_LEVEL.units).map(({ group, units }) => (
          <section key={group.id} aria-labelledby={`a1-group-${group.id}`} data-testid={`a1-group-${group.id}`}>
            <div className="mb-4 flex items-center gap-3 border-b pb-2 sm:border-0 sm:pb-0">
              <h2 id={`a1-group-${group.id}`} className="flex min-w-0 flex-wrap items-baseline gap-x-2">
                <span lang="ar" dir="rtl" className="font-arabic text-xl font-bold leading-[1.6] text-foreground">
                  {group.arabic}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  <T>{group.german}</T>
                </span>
              </h2>
              <span className="hidden h-px min-w-8 flex-1 bg-border sm:block" aria-hidden />
            </div>

            <ol className="grid gap-4 sm:grid-cols-2" aria-label="Lektionen">
              {units.map((unit, i) => {
                const letters = unit.lessons.filter((lesson) => lesson.letter).map((lesson) => lesson.label);
                // An odd last card sits centred at the width of one column instead of stretching.
                const lone = units.length % 2 === 1 && i === units.length - 1 && units.length > 1;
                const alone = units.length === 1;
                return (
                  <li key={unit.slug} className={cn((lone || alone) && "sm:col-span-2 sm:mx-auto sm:w-[calc(50%-0.5rem)]")}>
                    <Link
                      href={a1UnitHref(unit)}
                      data-testid={`a1-lesson-${unit.slug}`}
                      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-5 shadow-card transition hover:shadow-lift focus-ring"
                    >
                      <span className="absolute inset-x-0 top-0 h-1 bg-primary/30 transition group-hover:bg-primary" aria-hidden />

                      <div className="flex items-center justify-between gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-lg font-bold text-primary">{unit.number}</span>
                        <span className="whitespace-nowrap rounded-full bg-primary-soft px-3 py-1 text-sm font-medium text-primary">{parts(unit.lessons.length)}</span>
                      </div>

                      <h3 lang="ar" dir="rtl" className="mt-3 line-clamp-2 min-h-[3.2em] text-right font-arabic text-[1.75rem] font-bold leading-[1.6] text-primary">
                        {unit.title}
                      </h3>

                      <p className="mb-4 mt-1 line-clamp-2 font-semibold leading-6">
                        <T params={{ n: unit.number }}>{"Lektion {n}"}</T> · <T>{unit.titleGerman}</T>
                      </p>

                      <div className="mt-auto flex min-h-[3.5rem] items-center justify-between gap-3 border-t pt-3">
                        {letters.length > 0 ? (
                          <ul dir="rtl" lang="ar" className="flex flex-wrap gap-1.5" aria-label="Neue Buchstaben" data-testid={`a1-lesson-${unit.slug}-letters`}>
                            {letters.map((letter) => (
                              <li key={letter} className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft font-arabic text-lg font-bold leading-none text-primary">
                                {letter}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span aria-hidden />
                        )}
                        <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" aria-hidden />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
