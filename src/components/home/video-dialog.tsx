"use client";

import { useRef } from "react";
import { Play, X } from "lucide-react";

// "Video ansehen": the existing intro video (Lektion 1 · Alif) in a native
// modal <dialog> – focus trap, Esc and backdrop come from the browser. The
// video loads only when opened (preload="none") and stops when closed.
export function VideoDialog({ src, poster, title }: { src: string; poster: string; title: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  function close() {
    video.current?.pause();
    dialog.current?.close();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        data-testid="hero-video"
        className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl border border-brand-navy/10 bg-white px-7 text-lg font-semibold text-brand-navy shadow-sm transition hover:border-brand-emerald/40 hover:shadow-md focus-ring"
      >
        <Play className="h-5 w-5 fill-transparent stroke-[2.2]" aria-hidden /> Video ansehen
      </button>
      <dialog
        ref={dialog}
        onClose={() => video.current?.pause()}
        onClick={(event) => event.target === dialog.current && close()}
        aria-label={title}
        data-testid="video-dialog"
        className="w-[min(56rem,calc(100vw-2rem))] rounded-3xl bg-brand-ivory p-0 shadow-2xl backdrop:bg-brand-navy/60 backdrop:backdrop-blur-sm"
      >
        <div className="flex items-center justify-between gap-3 px-5 py-3">
          <p className="font-semibold text-brand-navy">{title}</p>
          <button type="button" onClick={close} aria-label="Video schließen" data-testid="video-close" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-brand-navy/5 focus-ring">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <video ref={video} src={src} poster={poster} controls preload="none" playsInline className="aspect-video w-full bg-black" data-testid="video-player">
          Dein Browser kann dieses Video nicht abspielen.
        </video>
      </dialog>
    </>
  );
}
