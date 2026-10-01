import Link from "next/link";

import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex max-w-xl flex-col items-center py-20 text-center">
      <span lang="ar" className="font-arabic text-8xl font-bold text-primary/30">؟</span>
      <h1 className="mt-4 text-2xl font-bold">Diese Seite gibt es nicht.</h1>
      <p className="mt-2 text-muted-foreground">Vielleicht hat sich ein Buchstabe vertippt. Zurück zum Lernweg?</p>
      <Link href="/" className={buttonClasses({ size: "lg", className: "mt-6" })}>
        Zur Startseite
      </Link>
    </div>
  );
}
