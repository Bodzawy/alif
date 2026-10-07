import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem", screens: { "2xl": "1200px" } },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))", soft: "hsl(var(--primary-soft))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))", soft: "hsl(var(--accent-soft))" },
        success: { DEFAULT: "hsl(var(--success))", foreground: "hsl(var(--success-foreground))", soft: "hsl(var(--success-soft))" },
        warning: { DEFAULT: "hsl(var(--warning))", foreground: "hsl(var(--warning-foreground))", soft: "hsl(var(--warning-soft))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))", soft: "hsl(var(--destructive-soft))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
      },
      borderRadius: { xl: "1rem", "2xl": "1.25rem", "3xl": "1.75rem" },
      fontFamily: {
        arabic: ['"Noto Naskh Arabic"', '"Geeza Pro"', "serif"],
        sans: ["InterVariable", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(16 24 40 / 0.04), 0 4px 16px -4px rgb(16 24 40 / 0.08)",
        lift: "0 2px 4px 0 rgb(16 24 40 / 0.05), 0 16px 32px -8px rgb(16 24 40 / 0.14)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0", transform: "translateY(6px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "pulse-ring": { "0%": { transform: "scale(1)", opacity: "0.55" }, "100%": { transform: "scale(1.6)", opacity: "0" } },
        "crossfade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        pop: { "0%": { opacity: "0", transform: "scale(.6)" }, "20%": { opacity: "1", transform: "scale(1.08)" }, "35%": { transform: "scale(1)" }, "80%": { opacity: "1" }, "100%": { opacity: "0" } },
        shake: { "0%, 100%": { transform: "translateX(0)" }, "20%, 60%": { transform: "translateX(-6px)" }, "40%, 80%": { transform: "translateX(6px)" } },
      },
      animation: {
        "fade-in": "fade-in .3s ease-out both",
        "pulse-ring": "pulse-ring 1.2s ease-out infinite",
        shake: "shake .4s ease-in-out",
        // Shaped word after the letter tiles slid together.
        "crossfade-in": "crossfade-in .4s ease-out .35s both",
        // Stars after a traced form (A1 · Schreiben).
        pop: "pop 1.1s ease forwards",
      },
    },
  },
  plugins: [],
};

export default config;
