import Link from "next/link";
import { ArrowRight, Ear, Mic, Sparkles } from "lucide-react";

import { buttonClasses } from "@/components/ui/button";
import { ALPHABET, ALPHABET_LEVEL } from "@/data/alphabet";
import { LEVELS } from "@/data/curriculum";

const STEPS = [
  { icon: Ear, title: "Anhören", text: "Hör jeden Buchstaben und jedes Wort in klarer arabischer Aussprache." },
  { icon: Mic, title: "Nachsprechen", text: "Nimm dich mit einem Tipp auf – direkt im Browser, ohne App." },
  { icon: Sparkles, title: "Feedback", text: "Erfahre sofort, ob es richtig klang und worauf du achten solltest." },
];

export default function HomePage() {
  return (
    <div>
      <section className="pattern-dots border-b bg-primary-soft/40">
        <div className="container grid max-w-6xl items-center gap-10 py-12 sm:py-20 md:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-sm font-medium text-primary shadow-sm">
              <span lang="ar" dir="rtl" className="text-base">أَهْلًا وَسَهْلًا</span> · Willkommen
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Arabisch lernen,
              <br />
              <span className="text-primary">Buchstabe für Buchstabe.</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Alif begleitet dich vom ersten Buchstaben an: hören, nachsprechen und sofort erfahren, wie gut deine Aussprache ist.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/a0" className={buttonClasses({ size: "lg" })} data-testid="cta-start">
                Mit dem Alphabet starten <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
              <Link href="/a1" className={buttonClasses({ size: "lg", variant: "secondary" })}>
                Zu A1 · Erste Wörter
              </Link>
            </div>
          </div>
          <div aria-hidden className="relative mx-auto flex aspect-square w-full max-w-xs items-center justify-center rounded-[2.5rem] bg-card shadow-lift">
            <span lang="ar" className="font-arabic text-[10rem] font-bold leading-none text-primary">أ</span>
            <span className="absolute -bottom-4 -left-4 rounded-2xl bg-accent px-4 py-2 text-sm font-bold text-accent-foreground shadow-lift">Alif · a</span>
          </div>
        </div>
      </section>

      <section className="container max-w-6xl py-12 sm:py-16" aria-labelledby="levels-heading">
        <h2 id="levels-heading" className="text-2xl font-bold tracking-tight">Dein Lernweg</h2>
        <p className="mt-1 text-muted-foreground">Starte bei null – Alif führt dich Schritt für Schritt.</p>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {[
            { slug: ALPHABET_LEVEL.slug, code: ALPHABET_LEVEL.code, title: ALPHABET_LEVEL.title, description: ALPHABET_LEVEL.description, count: `${ALPHABET.length} Buchstaben` },
            ...LEVELS.map((level) => ({
              slug: level.slug,
              code: level.code,
              title: level.title,
              description: level.description,
              count: `${level.lessons.length} ${level.lessons.length === 1 ? "Lektion" : "Lektionen"} verfügbar`,
            })),
          ].map((level) => (
            <Link
              key={level.slug}
              href={`/${level.slug}`}
              data-testid={`level-card-${level.slug}`}
              className="group flex flex-col rounded-3xl border bg-card p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift focus-ring"
            >
              <div className="flex items-start justify-between">
                <span className="rounded-2xl bg-primary px-4 py-2 text-2xl font-bold text-primary-foreground">{level.code}</span>
                <ArrowRight className="h-6 w-6 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" aria-hidden />
              </div>
              <h3 className="mt-5 text-xl font-bold">{level.title}</h3>
              <p className="mt-1 text-muted-foreground">{level.description}</p>
              <p className="mt-4 text-sm font-medium text-primary">{level.count}</p>
            </Link>
          ))}
          <div className="flex flex-col justify-center rounded-3xl border border-dashed p-6 text-muted-foreground">
            <p className="font-semibold text-foreground">A2 und weitere Stufen</p>
            <p className="mt-1 text-sm">Neue Lektionen kommen bald dazu.</p>
          </div>
        </div>
      </section>

      <section className="border-t bg-card/60">
        <div className="container grid max-w-6xl gap-6 py-12 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
