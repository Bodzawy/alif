import type { Metadata } from "next";

import { HomeHeader } from "@/components/home/home-header";
import { LearningPath } from "@/components/home/learning-path";
import { LEARNING_LEVELS } from "@/data/learning-levels";

export const metadata: Metadata = {
  title: "Dein Lernweg",
  description: "Entdecke alle Arabisch-Lernstufen von A0 bis C2.",
};

export default function LearningPathPage() {
  return (
    <div className="min-h-full bg-brand-cream">
      <HomeHeader />
      <main className="pb-10">
        <LearningPath levels={LEARNING_LEVELS} standalone />
      </main>
    </div>
  );
}
