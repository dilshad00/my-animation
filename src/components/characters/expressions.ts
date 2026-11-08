import type { ExpressionName } from "../../utils/schema";

export type Face = {
  /** brow vertical offset (negative = raised), in head-radius units */
  browY: number;
  /** brow tilt: positive = inner ends raised (sad), negative = inner lowered (angry) */
  browTilt: number;
  /** eye openness 0 (closed) .. 1.3 (wide) */
  eyeOpen: number;
  /** 1 = happy closed-eye arcs instead of open eyes */
  happyEyes: number;
  /** mouth curvature -1 (frown) .. 1 (smile) */
  mouthCurve: number;
  /** mouth width in head-radius units */
  mouthW: number;
  /** base mouth openness 0..1 */
  mouthOpen: number;
  /** horizontal mouth shift (smirk / thinking) */
  mouthShift: number;
  /** extra eye-look vertical */
  lookY: number;
  blush: number;
  /** 1 = near eye winks */
  wink: number;
};

export const FACES: Record<ExpressionName, Face> = {
  neutral: { browY: 0, browTilt: 0, eyeOpen: 1, happyEyes: 0, mouthCurve: 0.3, mouthW: 0.26, mouthOpen: 0, mouthShift: 0, lookY: 0, blush: 0.25, wink: 0 },
  happy: { browY: -0.04, browTilt: 0.1, eyeOpen: 0.95, happyEyes: 0, mouthCurve: 0.95, mouthW: 0.32, mouthOpen: 0.12, mouthShift: 0, lookY: 0, blush: 0.5, wink: 0 },
  joy: { browY: -0.08, browTilt: 0.15, eyeOpen: 1, happyEyes: 1, mouthCurve: 1, mouthW: 0.36, mouthOpen: 0.55, mouthShift: 0, lookY: 0, blush: 0.7, wink: 0 },
  sad: { browY: 0.02, browTilt: 0.9, eyeOpen: 0.78, happyEyes: 0, mouthCurve: -0.7, mouthW: 0.22, mouthOpen: 0, mouthShift: 0, lookY: 0.35, blush: 0, wink: 0 },
  angry: { browY: 0.06, browTilt: -1, eyeOpen: 0.82, happyEyes: 0, mouthCurve: -0.5, mouthW: 0.26, mouthOpen: 0.1, mouthShift: 0, lookY: 0, blush: 0.1, wink: 0 },
  surprised: { browY: -0.14, browTilt: 0.2, eyeOpen: 1.3, happyEyes: 0, mouthCurve: 0, mouthW: 0.16, mouthOpen: 0.75, mouthShift: 0, lookY: 0, blush: 0.2, wink: 0 },
  thinking: { browY: -0.05, browTilt: -0.35, eyeOpen: 0.9, happyEyes: 0, mouthCurve: 0.05, mouthW: 0.16, mouthOpen: 0, mouthShift: 0.08, lookY: -0.7, blush: 0.15, wink: 0 },
  worried: { browY: -0.03, browTilt: 0.8, eyeOpen: 1.05, happyEyes: 0, mouthCurve: -0.35, mouthW: 0.2, mouthOpen: 0.05, mouthShift: 0, lookY: 0, blush: 0, wink: 0 },
  confident: { browY: 0, browTilt: -0.25, eyeOpen: 0.85, happyEyes: 0, mouthCurve: 0.75, mouthW: 0.28, mouthOpen: 0, mouthShift: 0.06, lookY: 0, blush: 0.3, wink: 0 },
  wink: { browY: -0.04, browTilt: 0.1, eyeOpen: 1, happyEyes: 0, mouthCurve: 0.9, mouthW: 0.3, mouthOpen: 0.1, mouthShift: 0.04, lookY: 0, blush: 0.5, wink: 1 },
};

export const blendFace = (a: Face, b: Face, k: number): Face => {
  const out = { ...a };
  (Object.keys(a) as (keyof Face)[]).forEach((key) => {
    out[key] = a[key] + (b[key] - a[key]) * k;
  });
  return out;
};
