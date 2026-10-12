import { AboutAlif, Faq } from "@/components/home/about-faq";
import { FeatureStrip } from "@/components/home/feature-strip";
import { Hero } from "@/components/home/hero";
import { LearningPath, type LearningLevel } from "@/components/home/learning-path";
import { A1_LEVEL } from "@/data/a1";
import { ALPHABET, ALPHABET_HREF } from "@/data/alphabet";
import { A0_LEVEL, WORDS_LEVEL } from "@/data/curriculum";

// The homepage: hero, "Dein Lernweg" (A0 – C2), what Alif offers, about and
// questions. A0 and A1 lead to their pages; the higher levels do not exist yet.

const intro = WORDS_LEVEL.lessons[0]!;

const LEVELS: LearningLevel[] = [
  {
    code: "A0",
    title: "Buchstaben",
    description: "Lerne alle 28 arabischen Buchstaben sicher auszusprechen.",
    footer: `${WORDS_LEVEL.lessons.length} Lektionen`,
    href: `/${A0_LEVEL.slug}`,
    tone: { card: "bg-[#e8f3ec]", badge: "bg-brand-emerald", footer: "text-brand-navy" },
  },
  {
    code: "A1",
    title: "Erste Wörter",
    description: "Lerne wichtige Wörter und einfache Ausdrücke aus dem Alltag.",
    footer: "100 Stunden",
    href: `/${A1_LEVEL.slug}`,
    tone: { card: "bg-[#e7f0fb]", badge: "bg-[#2f7ed8]", footer: "text-[#2f6fb8]" },
  },
  { code: "A2", title: "Einfache Sätze", description: "Bilde erste Sätze und führe einfache Gespräche.", footer: "100 Stunden", tone: { card: "bg-[#fdf4dd]", badge: "bg-[#f2b02c] text-brand-navy", footer: "text-brand-navy/70" } },
  { code: "B1", title: "Alltag & Gespräche", description: "Verstehe und nutze Arabisch in alltäglichen Situationen.", footer: "100 Stunden", tone: { card: "bg-[#fde9df]", badge: "bg-[#e8622a]", footer: "text-brand-navy/70" } },
  { code: "B2", title: "Vertiefung", description: "Erweitere deinen Wortschatz und drücke dich klarer aus.", footer: "100 Stunden", tone: { card: "bg-[#fce6ea]", badge: "bg-[#dc4457]", footer: "text-brand-navy/70" } },
  { code: "C1", title: "Fortgeschritten", description: "Verstehe komplexe Texte und diskutiere verschiedene Themen.", footer: "100 Stunden", tone: { card: "bg-[#f0eafb]", badge: "bg-[#8b55d6]", footer: "text-brand-navy/70" } },
  { code: "C2", title: "Meisterschaft", description: "Erreiche ein sehr hohes Sprachniveau und kommuniziere frei.", footer: "100 Stunden", tone: { card: "bg-[#ebe8fb]", badge: "bg-[#6248cf]", footer: "text-brand-navy/70" } },
];

export default function HomePage() {
  return (
    <div className="bg-brand-cream" data-testid="home">
      <Hero startHref={ALPHABET_HREF} video={{ src: intro.introVideo!.src, poster: intro.introVideo!.poster, title: `Einführung: ${intro.title}` }} />
      <LearningPath levels={LEVELS} />
      <FeatureStrip />
      <AboutAlif letters={ALPHABET.length} wordLessons={WORDS_LEVEL.lessons.length} />
      <Faq />
    </div>
  );
}
