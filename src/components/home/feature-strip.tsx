import { BookOpen, Headphones, Mic, Star } from "lucide-react";

const FEATURES = [
  { icon: Headphones, title: "Hören", text: "Authentische Aussprache" },
  { icon: Mic, title: "Nachsprechen", text: "Direktes Feedback" },
  { icon: BookOpen, title: "Schritt für Schritt", text: "Klarer und strukturierter Aufbau" },
  { icon: Star, title: "Für jedes Alter", text: "Kinder, Jugendliche und Erwachsene" },
] as const;

export function FeatureStrip() {
  return (
    <section aria-label="Was Alif bietet" className="mx-auto max-w-[92rem] px-4 py-10 sm:px-8 lg:px-12">
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-brand-navy/10" data-testid="feature-strip">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-center gap-4 lg:justify-center lg:px-6">
            <Icon className="h-11 w-11 shrink-0 stroke-[1.5] text-brand-emerald" aria-hidden />
            <div>
              <h3 className="font-semibold text-brand-navy">{title}</h3>
              <p className="text-[0.95rem] text-brand-navy/65">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
