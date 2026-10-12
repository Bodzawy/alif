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

export function LearningPath({ levels, standalone = false }: { levels: LearningLevel[]; standalone?: boolean }) {
  return (
    <section id="lernweg" aria-labelledby="lernweg-heading" className={cn("relative z-20 mx-auto max-w-[92rem] scroll-mt-6 home-learning-path", standalone ? "px-4 py-12 sm:px-8 lg:px-12" : "-mt-16 px-3 sm:-mt-20 sm:px-6 lg:-mt-24")}>
      <div className="rounded-[2rem] border border-white/70 bg-brand-ivory/95 p-4 shadow-[0_24px_60px_-24px_rgb(20_33_61/0.15)] backdrop-blur sm:p-7 lg:p-8">
        <h2 id="lernweg-heading" className="px-2 text-[1.5rem] font-bold tracking-tight text-brand-navy sm:text-2xl">
          Dein Lernweg
        </h2>
        <p className="mt-0.5 px-2 text-sm text-brand-navy/70 sm:text-base">Von den ersten Buchstaben bis zur sicheren Kommunikation.</p>
        <ol className="home-levels-grid mt-5 gap-3 2xl:gap-3.5" aria-label="Stufen">
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
        <span className={cn("flex h-[2.65rem] w-[2.65rem] items-center justify-center rounded-full text-lg font-bold text-white shadow-sm", level.tone.badge)} aria-hidden>
          {level.code}
        </span>
        {!available && (
          <span className="rounded-full bg-white/80 px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide text-brand-navy/55" data-testid={`level-soon-${level.code.toLowerCase()}`}>
            Bald
          </span>
        )}
      </span>
      <h3 className="mt-3 text-[0.98rem] font-bold leading-snug text-brand-navy">
        <span className="sr-only">{level.code}: </span>
        {level.title}
      </h3>
      <p className="mt-1.5 text-[0.78rem] leading-[1.45] text-brand-navy/70">{level.description}</p>
      <div className="mt-auto flex items-center justify-between gap-2 pt-5">
        <span className={cn("whitespace-nowrap text-[0.78rem] font-medium", level.tone.footer)}>{level.footer}</span>
        {available ? (
          <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-brand-navy shadow-sm transition group-hover:translate-x-0.5 group-hover:bg-brand-emerald group-hover:text-white">
            <ChevronRight className="h-4 w-4" />
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
  const card = cn("group flex w-full flex-col rounded-[1.6rem] p-4 transition min-[1500px]:min-h-[12rem]", level.tone.card);
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
