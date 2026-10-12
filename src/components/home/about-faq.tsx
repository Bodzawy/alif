import { ChevronDown } from "lucide-react";

// "Über Alif" and "Häufige Fragen" – what the header links to. Only facts
// about the app as it is today.

export function AboutAlif({ letters, wordLessons }: { letters: number; wordLessons: number }) {
  return (
    <section id="ueber-alif" aria-labelledby="ueber-heading" className="scroll-mt-6 border-t border-brand-gold/20 bg-brand-ivory">
      <div className="mx-auto grid max-w-[92rem] gap-8 px-4 py-14 sm:px-8 lg:grid-cols-[1fr_1.2fr] lg:px-12">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-brand-gold">Über Alif</p>
          <h2 id="ueber-heading" className="mt-3 text-3xl font-bold tracking-tight text-brand-navy">Arabisch – Buchstabe für Buchstabe</h2>
          <p lang="ar" dir="rtl" className="mt-3 text-right font-arabic text-2xl text-brand-emerald lg:text-left">تَعَلَّمِ العَرَبِيَّة</p>
        </div>
        <div className="space-y-4 text-lg leading-relaxed text-brand-navy/80">
          <p>
            Alif bringt Deutschsprachigen Arabisch bei. Du beginnst mit den {letters} Buchstaben und den ersten Wörtern ({wordLessons} Lektionen in A0) und gehst dann
            mit A1 weiter – mit Lauten, Formen, Schreiben und ersten Gesprächen.
          </p>
          <p>Du hörst jedes Wort, sprichst es nach und bekommst sofort eine Rückmeldung zu deiner Aussprache – direkt im Browser, ohne App.</p>
        </div>
      </div>
    </section>
  );
}

const FAQ = [
  { q: "Brauche ich ein Konto?", a: "Nein. Alif speichert deinen Fortschritt in deinem Browser. Eine Anmeldung mit Konto gibt es noch nicht." },
  { q: "Wie bekomme ich Feedback zu meiner Aussprache?", a: "Du sprichst ins Mikrofon. Alif prüft die Aufnahme und sagt dir sofort, ob es richtig klang und worauf du achten solltest." },
  { q: "Für wen ist Alif?", a: "Für alle, die Deutsch sprechen und Arabisch von Anfang an lernen möchten – Kinder, Jugendliche und Erwachsene." },
  { q: "Welche Stufen gibt es schon?", a: "A0 (Buchstaben und erste Wörter) und A1 (Lektion 1). Die weiteren Stufen A2 bis C2 sind in Arbeit." },
  { q: "Brauche ich eine App?", a: "Nein. Alif läuft im Browser auf Handy, Tablet und Computer. Für das Nachsprechen braucht dein Gerät ein Mikrofon." },
] as const;

export function Faq() {
  return (
    <section id="fragen" aria-labelledby="fragen-heading" className="scroll-mt-6 border-t border-brand-gold/20 bg-brand-cream">
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-8">
        <h2 id="fragen-heading" className="text-3xl font-bold tracking-tight text-brand-navy">Häufige Fragen</h2>
        <div className="mt-6 divide-y divide-brand-navy/10 rounded-3xl border border-brand-navy/10 bg-white" data-testid="faq">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg font-semibold text-brand-navy focus-ring [&::-webkit-details-marker]:hidden">
                {q}
                <ChevronDown className="h-5 w-5 shrink-0 text-brand-emerald transition group-open:rotate-180" aria-hidden />
              </summary>
              <p className="mt-2 text-brand-navy/75">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
