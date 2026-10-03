import { CheckCircle2, CircleDashed, Lock, SkipForward } from "lucide-react";

import type { LetterStatus } from "@/lib/alphabet-progress";
import { cn } from "@/lib/utils";

const STYLES: Record<LetterStatus, { label: string; className: string; Icon: typeof Lock }> = {
  mastered: { label: "Gemeistert", className: "bg-success-soft text-success", Icon: CheckCircle2 },
  skipped: { label: "Nicht gemeistert", className: "bg-warning-soft text-warning", Icon: SkipForward },
  available: { label: "Bereit", className: "bg-primary-soft text-primary", Icon: CircleDashed },
  locked: { label: "Gesperrt", className: "bg-muted text-muted-foreground", Icon: Lock },
};

export function StatusBadge({ status, className }: { status: LetterStatus; className?: string }) {
  const { label, className: tone, Icon } = STYLES[status];
  return (
    <span dir="ltr" className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", tone, className)}>
      <Icon className="h-3 w-3" aria-hidden />
      {label}
    </span>
  );
}
