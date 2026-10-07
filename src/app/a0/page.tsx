import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { ALPHABET, ALPHABET_HREF } from "@/data/alphabet";
import { A0_LEVEL, WORDS_LEVEL } from "@/data/curriculum";

export const metadata: Metadata = {
  title: `${A0_LEVEL.code} – ${A0_LEVEL.title}`,
  description: A0_LEVEL.description,
};

const PARTS = [
  {
    id: "letters",
    href: ALPHABET_HREF,
    arabic: "حروف",
    german: "Buchstaben",
    glyph: "أ ب ت",
    arabicText: "تعلّم الحروف العربية وتدرّب على النطق.",
    text: "Lerne die arabischen Buchstaben und übe ihre Aussprache.",
    count: `${ALPHABET.length} Buchstaben`,
  },
  {
    id: "words",
    href: `/${WORDS_LEVEL.slug}`,
    arabic: "كلمات",
    german: "Wörter",
    glyph: "أَسَد",
    arabicText: "تعلّم الكلمات الأولى واستخدم الحروف التي تعلمتها.",
    text: "Lerne die ersten Wörter und nutze die Buchstaben, die du kennst.",
    count: `${WORDS_LEVEL.lessons.length} Lektionen`,
  },
] as const;

// A0 has two parts: the alphabet (/a0/letters) and the first words (/a0/words).
export default function A0Page() {
  return (
    <div className="container max-w-4xl py-8 sm:py-12">
      <Link href="/" className="mb-6 inline-flex items-center gap-1 rounded-md text-sm text-muted-foreground hover:text-foreground focus-ring">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Startseite
      </Link>

      <header className="flex items-center gap-4">
        <span className="rounded-2xl bg-primary px-4 py-3 text-3xl font-bold text-primary-foreground">{A0_LEVEL.code}</span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{A0_LEVEL.title}</h1>
          <p className="mt-1 text-muted-foreground">{A0_LEVEL.description}</p>
        </div>
      </header>

      <ol className="mt-8 grid gap-5 sm:grid-cols-2" aria-label="Bereiche von A0">
        {PARTS.map((part, index) => (
          <li key={part.id}>
            <Link
              href={part.href}
              data-testid={`a0-part-${part.id}`}
              className="group flex h-full flex-col rounded-3xl border bg-card p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift focus-ring"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-lg font-bold text-primary">{index + 1}</span>
                <ArrowRight className="h-6 w-6 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" aria-hidden />
              </div>
              <p lang="ar" dir="rtl" className="mt-5 font-arabic text-5xl font-bold leading-[1.5] text-primary" aria-hidden>
                {part.glyph}
              </p>
              <h2 className="mt-2 flex items-baseline gap-2 text-xl font-bold">
                <span lang="ar" dir="rtl" className="font-arabic text-2xl">{part.arabic}</span>
                <span className="text-muted-foreground">·</span>
                <span>{part.german}</span>
              </h2>
              <p lang="ar" dir="rtl" className="mt-2 text-right font-arabic text-lg leading-relaxed">{part.arabicText}</p>
              <p className="mt-1 text-sm text-muted-foreground">{part.text}</p>
              <p className="mt-auto pt-4 text-sm font-medium text-primary">{part.count}</p>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
