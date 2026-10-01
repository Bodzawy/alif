import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource/noto-naskh-arabic/400.css";
import "@fontsource/noto-naskh-arabic/700.css";
import "./globals.css";

import { SiteFooter } from "@/components/ui/site-footer";
import { SiteHeader } from "@/components/ui/site-header";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
