import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource/noto-naskh-arabic/400.css";
import "@fontsource/noto-naskh-arabic/700.css";
import "./globals.css";

import { SiteFooter } from "@/components/ui/site-footer";
import { HideOnHome } from "@/components/ui/hide-on-home";
import { SiteHeader } from "@/components/ui/site-header";
import { LanguageDialog } from "@/components/locale/language-switch";
import { TrackDialog } from "@/components/track/track-switch";

export const metadata: Metadata = {
  title: { default: "Alif – Arabisch lernen", template: "%s · Alif" },
  description:
    "Alif bringt Deutschsprachigen Arabisch bei: Buchstaben, erste Wörter und Aussprachetraining mit direktem Feedback.",
  applicationName: "Alif",
  openGraph: { title: "Alif – Arabisch lernen", locale: "de_DE", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#17766b",
  width: "device-width",
  initialScale: 1,
};

/**
 * Before the first paint: the language the learner chose (localStorage, see src/lib/locale.ts) on <html>,
 * so the browser never sees a German page with Arabic or Turkish text in it (that mismatch makes Chrome
 * offer – or run – its page translation).
 */
const LOCALE_SCRIPT = `try{var l=localStorage.getItem("alif:lang");var m={de:"de",en:"en",tr:"tr",sq:"sq",fr:"fr",it:"it",es:"es",ar:"ar"};if(m[l]){document.documentElement.lang=m[l];document.documentElement.dir=l==="ar"?"rtl":"ltr"}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // translate="no" + notranslate: Alif translates itself (src/i18n/). A browser's machine translation would
  // also "translate" the Arabic being taught – letters, their names and harakat (ث → "الـ", الجيم → "السام").
  return (
    <html lang="de" translate="no" className="notranslate" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
        <script dangerouslySetInnerHTML={{ __html: LOCALE_SCRIPT }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <div className="arabic-letter-pattern" aria-hidden="true" />
        <HideOnHome>
          <SiteHeader />
        </HideOnHome>
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <LanguageDialog />
        <TrackDialog />
      </body>
    </html>
  );
}
