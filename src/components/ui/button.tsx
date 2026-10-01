import { forwardRef } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "accent";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground shadow-sm hover:brightness-110",
  secondary: "border bg-card text-foreground shadow-sm hover:bg-muted",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
  danger: "bg-destructive text-destructive-foreground shadow-sm hover:brightness-110",
  accent: "bg-accent text-accent-foreground shadow-sm hover:brightness-105",
};

const sizes: Record<Size, string> = {
  sm: "h-9 gap-1.5 rounded-lg px-3 text-sm",
  md: "h-11 gap-2 rounded-xl px-4 text-sm",
  lg: "h-14 gap-2.5 rounded-2xl px-6 text-base",
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex select-none items-center justify-center font-semibold transition focus-ring disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});

export function buttonClasses({ variant = "primary", size = "md", className }: { variant?: Variant; size?: Size; className?: string }) {
  return cn(
    "inline-flex select-none items-center justify-center font-semibold transition focus-ring",
    variants[variant],
    sizes[size],
    className
  );
}
