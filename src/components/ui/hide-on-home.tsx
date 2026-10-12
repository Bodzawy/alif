"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/** The landing and learning-path pages use the shared home header. */
export function HideOnHome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return pathname === "/" || pathname === "/lernweg" ? null : <>{children}</>;
}
