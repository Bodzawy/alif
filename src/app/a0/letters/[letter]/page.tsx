import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LetterPractice } from "@/components/alphabet/letter-practice";
import { ALPHABET, ALPHABET_LEVEL, getAlphabetLetter } from "@/data/alphabet";
import { LEVELS } from "@/data/curriculum";

type Params = { letter: string };

export function generateStaticParams(): Params[] {
  return ALPHABET.map((letter) => ({ letter: letter.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const letter = getAlphabetLetter((await params).letter);
  return letter ? { title: `${ALPHABET_LEVEL.code} · ${letter.glyph} – ${letter.modelText}` } : {};
}

export default async function AlphabetLetterPage({ params }: { params: Promise<Params> }) {
  const letter = getAlphabetLetter((await params).letter);
  if (!letter) notFound();

  return <LetterPractice key={letter.id} letterId={letter.id} nextLevelHref={`/${LEVELS[0]!.slug}`} />;
}
