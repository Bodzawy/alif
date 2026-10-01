import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary pb-1 font-arabic text-2xl font-bold leading-none text-primary-foreground shadow-sm",
        className
      )}
    >
      أ
    </span>
  );
}
