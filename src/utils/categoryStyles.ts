// ⚡ Bolt Optimization: Use a static dictionary for category styles instead of a switch statement.
// This prevents allocating a new object on every render cycle and reduces garbage collection pressure,
// as getCategoryStyles is called multiple times per render in the heavy ArenaBoard component.
export const CATEGORY_STYLES: Record<string, { border: string; shadow: string; badgeBg: string }> = {
  "Animation": {
    border: "border-cyan-500",
    shadow: "shadow-[0_0_30px_rgba(6,182,212,0.2)]",
    badgeBg: "bg-cyan-900 text-cyan-100 border border-cyan-500",
  },
  "Video Games": {
    border: "border-fuchsia-500",
    shadow: "shadow-[0_0_30px_rgba(217,70,239,0.2)]",
    badgeBg: "bg-fuchsia-900 text-fuchsia-100 border border-fuchsia-500",
  },
  "Pro Wrestling": {
    border: "border-rose-500",
    shadow: "shadow-[0_0_30px_rgba(244,63,94,0.2)]",
    badgeBg: "bg-rose-900 text-rose-100 border border-rose-500",
  },
};

export const DEFAULT_CATEGORY_STYLE = {
  border: "border-slate-600",
  shadow: "shadow-2xl",
  badgeBg: "bg-slate-700 text-slate-300 border border-slate-600",
};
