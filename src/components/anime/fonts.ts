import { loadFont as loadDela } from "@remotion/google-fonts/DelaGothicOne";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";

export const DISPLAY_FONT = loadDela("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
export const UI_FONT = loadMontserrat("normal", { weights: ["500", "700", "800"], subsets: ["latin"] }).fontFamily;
