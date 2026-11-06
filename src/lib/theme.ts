export type ThemeId = "purple" | "dark" | "white" | "blue" | "yellow";

export interface ThemeOption {
  id: ThemeId;
  name: string;
  dotBg: string;
  dotBorder: string;
  background: string;
  className: string;
}

export const THEMES: ThemeOption[] = [
  {
    id: "purple",
    name: "Ungu (Lavender)",
    dotBg: "bg-[#8a88b5]",
    dotBorder: "border-white/50",
    background: "linear-gradient(135deg, #5d5b86 0%, #6e6c99 50%, #4f4d75 100%)",
    className: "theme-bg-purple",
  },
  {
    id: "dark",
    name: "Hitam (Dark)",
    dotBg: "bg-[#09090c]",
    dotBorder: "border-white/50",
    background: "radial-gradient(circle at 50% 20%, #16161d 0%, #09090c 60%, #000000 100%)",
    className: "theme-bg-dark",
  },
  {
    id: "white",
    name: "White (Putih)",
    dotBg: "bg-[#f8fafc]",
    dotBorder: "border-slate-400",
    background: "radial-gradient(circle at 50% 20%, #ffffff 0%, #e2e8f0 60%, #cbd5e1 100%)",
    className: "theme-bg-white",
  },
  {
    id: "blue",
    name: "Blue (Ocean)",
    dotBg: "bg-[#0284c7]",
    dotBorder: "border-sky-300",
    background: "radial-gradient(circle at 50% 20%, #0f2d57 0%, #071529 60%, #020710 100%)",
    className: "theme-bg-blue",
  },
  {
    id: "yellow",
    name: "Kuning (Gold)",
    dotBg: "bg-[#eab308]",
    dotBorder: "border-yellow-200",
    background: "radial-gradient(circle at 50% 20%, #423206 0%, #211903 60%, #0a0801 100%)",
    className: "theme-bg-yellow",
  },
];
