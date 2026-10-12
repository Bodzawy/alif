"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/** The homepage has its own header (src/components/home/home-header.tsx); every other page keeps the site header. */
export function HideOnHome({ children }: { children: ReactNode }) {
  return usePathname() === "/" ? null : <>{children}</>;
}
