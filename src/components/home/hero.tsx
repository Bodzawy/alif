import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { HomeHeader } from "./home-header";
import { VideoDialog } from "./video-dialog";

// The hero: header, headline and the two actions on the left; the arch scene
// (public/images/home/hero-arch.svg) on the right. The text and buttons are
// real elements; the picture is decoration on wide screens and a framed
// picture under the text on phones.
export function Hero({ startHref, video }: { startHref: string; video: { src: string; poster: string; title: string } }) {
  return (
    <section className="relative overflow-hidden bg-brand-cream" aria-labelledby="hero-heading" data-testid="hero">
      {/* Geometric pattern, fading out towards the text. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[url('/images/home/pattern.svg')] bg-[length:104px_104px] opacity-60 [mask-image:linear-gradient(90deg,black,transparent_45%)]" />
      {/* The arch scene: right half on wide screens. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative local SVG, sized to avoid layout shift */}
      <img
        src="/images/home/hero-arch.svg"
        alt=""
        aria-hidden
        width={960}
        height={640}
        fetchPriority="high"
        className="pointer-events-none absolute right-0 top-0 hidden h-full w-auto max-w-none select-none lg:block"
        data-testid="hero-art"
      />
      <HomeHeader />

      <div className="relative z-10 mx-auto max-w-[92rem] px-4 pb-24 pt-6 sm:px-8 sm:pb-28 lg:px-12 lg:pb-36 lg:pt-12">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-brand-navy/75 sm:text-sm">Dein Weg zur arabischen Sprache</p>
          <h1 id="hero-heading" className="mt-5 text-[2.75rem] font-extrabold leading-[1.02] tracking-[-0.035em] text-brand-navy sm:text-6xl lg:text-[5.25rem]">
            Arabisch lernen
            <br />
            <span className="text-brand-emerald">mit Alif.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-navy/75 sm:text-[1.4rem] sm:leading-snug">
            Ein klarer, strukturierter Lernweg – von den ersten Buchstaben bis zur sicheren Kommunikation.
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link
              href={startHref}
              data-testid="cta-start"
              className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-brand-emerald px-8 text-lg font-semibold text-white shadow-[0_12px_24px_-10px_rgb(14_90_71/0.8)] transition hover:bg-brand-emerald-dark focus-ring"
            >
              Jetzt starten <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
            <VideoDialog {...video} />
          </div>
        </div>

        {/* Phones and tablets: the scene as a picture under the text. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative local SVG */}
        <img src="/images/home/hero-arch.svg" alt="" aria-hidden width={960} height={640} className="mt-10 aspect-[3/2] w-full rounded-[2rem] object-cover object-[70%_50%] lg:hidden" loading="lazy" />
      </div>
    </section>
  );
}
