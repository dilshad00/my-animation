/**
 * UNKNOWN GAMER — tech-documentary look (opt-in; used only by src/ug/* compositions).
 */
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadDisplay } from "@remotion/google-fonts/Oswald";

export const INTER = loadInter("normal", { weights: ["400", "500", "600", "700", "800"], subsets: ["latin"] }).fontFamily;
export const MONO = loadMono("normal", { weights: ["500", "700", "800"], subsets: ["latin"] }).fontFamily;
export const DISPLAY = loadDisplay("normal", { weights: ["500", "600", "700"], subsets: ["latin"] }).fontFamily;

export const C = {
  bg: "#05070a",
  ink: "#f3f6f8",
  mute: "#8b97a4",
  green: "#35f29a",
  red: "#ff3d52",
  amber: "#ffb648",
  teal: "#28d7ff",
  line: "rgba(255,255,255,0.10)",
};

export const FPS = 30;
export const sec = (s: number) => Math.round(s * FPS);
