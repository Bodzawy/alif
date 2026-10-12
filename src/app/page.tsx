import { AboutAlif, Faq } from "@/components/home/about-faq";
import { FeatureStrip } from "@/components/home/feature-strip";
import { Hero } from "@/components/home/hero";
import { LearningPath } from "@/components/home/learning-path";
import { LEARNING_LEVELS } from "@/data/learning-levels";
import { ALPHABET } from "@/data/alphabet";
import { WORDS_LEVEL } from "@/data/curriculum";

// The homepage: hero, "Dein Lernweg" (A0 – C2), what Alif offers, about and
// questions. A0 and A1 lead to their pages; the higher levels do not exist yet.

const intro = WORDS_LEVEL.lessons[0]!;

export default function HomePage() {
  return (
    <div className="bg-brand-cream" data-testid="home">
      <Hero startHref="/lernweg" video={{ src: intro.introVideo!.src, poster: intro.introVideo!.poster, title: `Einführung: ${intro.title}` }} />
      <LearningPath levels={LEARNING_LEVELS} />
      <FeatureStrip />
      <div className="home-more-content">
        <AboutAlif letters={ALPHABET.length} wordLessons={WORDS_LEVEL.lessons.length} />
        <Faq />
      </div>
    </div>
  );
}
