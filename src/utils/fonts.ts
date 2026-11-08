import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";

const poppins = loadPoppins("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

export const FONT_FAMILY = poppins.fontFamily;
