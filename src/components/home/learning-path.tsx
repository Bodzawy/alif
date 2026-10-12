import Link from "next/link";
import { ChevronRight, Lock } from "lucide-react";

import { cn } from "@/lib/utils";

// "Dein Lernweg": the seven levels A0 – C2. Only levels that exist in the app
// are links (A0, A1); the others say "Bald verfügbar" and lead nowhere.

export type LearningLevel = {
  code: string;
  title: string;
  description: string;
  footer: string;
  /** The level's page – only when the level exists. */
  href?: string;
  tone: { card: string; badge: string; footer: string };
};

export function LearningPath({ levels }: { levels: LearningLevel[] }) {
  return (
    <section id="lernweg" aria-labelledby="lernweg-heading" className="relative z-20 mx-auto -mt-16 max-w-[92rem] scroll-mt-6 px-3 sm:-mt-20 sm:px-6 lg:-mt-28">
      <div className="rounded-[2rem] border border-white/70 bg-brand-ivory/95 p-4 shadow-[0_24px_60px_-24px_rgb(20_33_61/0.25)] backdrop-blur sm:p-7 lg:p-8">
        <h2 id="lernweg-heading" className="px-2 text-[1.7rem] font-bold tracking-tight text-brand-navy sm:text-3xl">
          Dein Lernweg
        </h2>
        <p className="mt-1 px-2 text-brand-navy/70 sm:text-lg">Von den ersten Buchstaben bis zur sicheren Kommunikation.</p>
        <ol className="mt-6 grid grid-cols-1 gap-3 min-[460px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-7 2xl:gap-3.5" aria-label="Stufen">
          {levels.map((level) => (
            <li key={level.code} className="flex">
              <LevelCard level={level} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function LevelCard({ level }: { level: LearningLevel }) {
  const available = Boolean(level.href);
  const body = (
    <>
      <span className="flex items-start justify-between gap-2">
        <span className={cn("flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full text-xl font-bold text-white shadow-sm", level.tone.badge)} aria-hidden>
          {level.code}
        </span>
        {!available && (
          <span className="rounded-full bg-white/80 px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide text-brand-navy/55" data-testid={`level-soon-${level.code.toLowerCase()}`}>
            Bald
          </span>
        )}
      </span>
      <h3 className="mt-5 text-lg font-bold leading-snug text-brand-navy">
        <span className="sr-only">{level.code}: </span>
        {level.title}
      </h3>
      <p className="mt-2 text-[0.92rem] leading-relaxed text-brand-navy/70">{level.description}</p>
      <div className="mt-auto flex items-center justify-between gap-2 pt-6">
        <span className={cn("whitespace-nowrap text-[0.92rem] font-medium", level.tone.footer)}>{level.footer}</span>
        {available ? (
          <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-brand-navy shadow-sm transition group-hover:translate-x-0.5 group-hover:bg-brand-emerald group-hover:text-white">
            <ChevronRight className="h-5 w-5" />
          </span>
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/60 text-brand-navy/40" title="Bald verfügbar">
            <Lock className="h-4 w-4" aria-hidden />
            <span className="sr-only">Bald verfügbar</span>
          </span>
        )}
      </div>
    </>
  );
  const card = cn("group flex w-full flex-col rounded-3xl p-5 transition", level.tone.card);
  return available ? (
    <Link href={level.href!} className={cn(card, "hover:-translate-y-1 hover:shadow-[0_16px_30px_-16px_rgb(20_33_61/0.35)] focus-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0")} data-testid={`level-card-${level.code.toLowerCase()}`}>
      {body}
    </Link>
  ) : (
    <div className={cn(card, "opacity-90")} data-testid={`level-card-${level.code.toLowerCase()}`} aria-label={`${level.code} ${level.title} – bald verfügbar`}>
      {body}
    </div>
  );
}
