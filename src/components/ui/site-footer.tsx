export function SiteFooter() {
  return (
    <footer className="border-t py-8 text-sm text-muted-foreground">
      <div className="container flex flex-col items-center justify-between gap-2 sm:flex-row">
        <p>
          <span className="font-semibold text-foreground">Alif</span> · Arabisch lernen, Buchstabe für Buchstabe
        </p>
        <p lang="ar" dir="rtl" className="text-base">
          تَعَلَّمِ العَرَبِيَّة
        </p>
      </div>
    </footer>
  );
}
