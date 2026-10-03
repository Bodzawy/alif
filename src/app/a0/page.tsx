import type { Metadata } from "next";

import { AlphabetOverview } from "@/components/alphabet/alphabet-overview";
import { ALPHABET_LEVEL } from "@/data/alphabet";
import { LEVELS } from "@/data/curriculum";

export const metadata: Metadata = {
  title: `${ALPHABET_LEVEL.code} – ${ALPHABET_LEVEL.title}`,
  description: ALPHABET_LEVEL.description,
};

export default function AlphabetPage() {
  return <AlphabetOverview nextLevelHref={`/${LEVELS[0]!.slug}`} />;
}
