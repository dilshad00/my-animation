import { noise2D } from "@remotion/noise";
import type { ActionName } from "../../utils/schema";
import type { Build } from "./builds";

/**
 * Joint angles in degrees.
 *  - limb root angle: 0 = hanging straight down, positive = rotated forward
 *  - elbow: positive = forearm bends forward/up
 *  - knee: positive = shin bends backward
 */
export type HandShape = "open" | "fist" | "point" | "palm";
export type Pose = {
  bodyY: number;
  lean: number;
  headTilt: number;
  headLift: number;
  shoulderLift: number;
  armBack: [number, number];
  armFront: [number, number];
  legBack: [number, number];
  legFront: [number, number];
  handFront: HandShape;
  handBack: HandShape;
  /** -1..1 vertical eye look offset (e.g. thinking looks up) */
  lookY: number;
};

export const NEUTRAL: Pose = {
  bodyY: 0,
  lean: 0,
  headTilt: 0,
  headLift: 0,
  shoulderLift: 0,
  armBack: [-7, 10],
  armFront: [7, 12],
  legBack: [-3, 2],
  legFront: [3, 2],
  handFront: "open",
  handBack: "open",
  lookY: 0,
};

const n = (seed: string, t: number) => noise2D(seed, t, 0);
const ramp = (t: number, d = 0.35) => {
  const k = Math.max(0, Math.min(1, t / d));
  return k * k * (3 - 2 * k);
};

export type PoseInput = {
  /** seconds since this action started */
  local: number;
  /** scene time in seconds */
  t: number;
  /** walk-cycle phase in radians (distance based) */
  phase: number;
  build: Build;
  seed: string;
  angle?: number;
};

const breathing = (t: number): Partial<Pose> => ({
  bodyY: Math.sin(t * 2.1) * 1.2,
  shoulderLift: Math.sin(t * 2.1) * 1.4,
});

const sitBase = (b: Build): Partial<Pose> => ({
  bodyY: b.thigh,
  legBack: [86, 84],
  legFront: [90, 88],
  lean: -2,
});

export const ACTIONS: Record<ActionName, (p: PoseInput) => Pose> = {
  idle: ({ t, seed }) => ({
    ...NEUTRAL,
    ...breathing(t),
    headTilt: n(seed + "h", t * 0.25) * 3,
    armBack: [-7 + n(seed + "ab", t * 0.3) * 2, 10],
    armFront: [7 + n(seed + "af", t * 0.3) * 2, 12],
  }),

  walk: ({ phase, t }) => {
    const s = Math.sin(phase);
    const c = Math.cos(phase);
    return {
      ...NEUTRAL,
      bodyY: 6 * Math.abs(s) - 3,
      lean: 4,
      headTilt: Math.sin(t * 2) * 1.2,
      legFront: [26 * s, 6 + 44 * Math.pow(Math.max(0, c), 1.4)],
      legBack: [-26 * s, 6 + 44 * Math.pow(Math.max(0, -c), 1.4)],
      armFront: [-22 * s, 16 + 14 * Math.max(0, -s)],
      armBack: [22 * s, 16 + 14 * Math.max(0, s)],
      handFront: "fist",
      handBack: "fist",
    };
  },

  run: ({ phase }) => {
    const s = Math.sin(phase);
    const c = Math.cos(phase);
    return {
      ...NEUTRAL,
      bodyY: 12 * Math.abs(s) - 10,
      lean: 13,
      headTilt: -6,
      legFront: [44 * s + 8, 18 + 80 * Math.pow(Math.max(0, c), 1.2)],
      legBack: [-44 * s + 8, 18 + 80 * Math.pow(Math.max(0, -c), 1.2)],
      armFront: [-48 * s, 88],
      armBack: [48 * s, 88],
      handFront: "fist",
      handBack: "fist",
    };
  },

  talk: ({ t, seed }) => {
    const g = n(seed + "g", t * 0.9);
    const g2 = n(seed + "g2", t * 0.7);
    return {
      ...NEUTRAL,
      ...breathing(t),
      headTilt: n(seed + "th", t * 0.8) * 4,
      headLift: n(seed + "tl", t * 1.6) * 2,
      armFront: [28 + g * 18, 62 + g2 * 22],
      armBack: [-4 + g2 * 8, 22 + Math.max(0, g) * 30],
      handFront: "palm",
    };
  },

  point: ({ local, t, angle }) => {
    const k = ramp(local, 0.3);
    const a = angle ?? 0;
    return {
      ...NEUTRAL,
      ...breathing(t),
      lean: -2 * k,
      headTilt: -3 * k,
      armFront: [7 + (88 + a - 7) * k, 12 - 10 * k],
      armBack: [-7, 14],
      handFront: k > 0.5 ? "point" : "open",
    };
  },

  present: ({ local, t, angle, seed }) => {
    const k = ramp(local, 0.4);
    const a = angle ?? 0;
    return {
      ...NEUTRAL,
      ...breathing(t),
      headTilt: -4 * k + n(seed + "p", t) * 2,
      armFront: [7 + (58 + a - 7) * k + Math.sin(t * 1.6) * 3, 12 + 18 * k],
      armBack: [-7, 14],
      handFront: "palm",
    };
  },

  wave: ({ local, t }) => {
    const k = ramp(local, 0.3);
    return {
      ...NEUTRAL,
      ...breathing(t),
      headTilt: 5 * k,
      armFront: [7 + 125 * k, 12 + (28 + Math.sin(local * 11) * 26) * k],
      handFront: "palm",
    };
  },

  sit: ({ t, build }) => ({
    ...NEUTRAL,
    ...sitBase(build),
    bodyY: build.thigh + Math.sin(t * 2.1) * 1,
    armFront: [22, 62],
    armBack: [18, 58],
  }),

  sitTalk: ({ t, build, seed }) => {
    const g = n(seed + "g", t * 0.9);
    return {
      ...NEUTRAL,
      ...sitBase(build),
      bodyY: build.thigh,
      headTilt: n(seed + "th", t * 0.8) * 4,
      armFront: [40 + g * 16, 70 + n(seed + "e", t) * 25],
      armBack: [30, 45],
      handFront: "palm",
    };
  },

  type: ({ t, build }) => ({
    ...NEUTRAL,
    ...sitBase(build),
    bodyY: build.thigh,
    lean: 6,
    headTilt: 4,
    armFront: [58 + Math.sin(t * 19) * 2, 52 + Math.sin(t * 23) * 4],
    armBack: [52 + Math.sin(t * 17 + 1) * 2, 50 + Math.sin(t * 21) * 4],
    lookY: 0.4,
  }),

  cheer: ({ local, t }) => {
    const k = ramp(local, 0.25);
    const b = Math.abs(Math.sin(local * 6));
    return {
      ...NEUTRAL,
      bodyY: -12 * b * k,
      headTilt: -6 * k,
      headLift: -3,
      armFront: [7 + 158 * k, 12 + 10 * k + Math.sin(t * 12) * 6],
      armBack: [-7 + 172 * k, 12 + 10 * k + Math.sin(t * 12 + 1) * 6],
      handFront: "fist",
      handBack: "fist",
    };
  },

  think: ({ local, t }) => {
    const k = ramp(local, 0.4);
    return {
      ...NEUTRAL,
      ...breathing(t),
      headTilt: 8 * k,
      armFront: [7 + 63 * k, 12 + 143 * k],
      armBack: [-7 + 32 * k, 12 + 90 * k],
      handFront: "fist",
      handBack: "open",
      lookY: -0.6 * k,
    };
  },

  shrug: ({ local, t }) => {
    const k = Math.sin(Math.min(1, local / 1.2) * Math.PI);
    const hold = ramp(local, 0.3);
    const s = Math.max(k, hold * 0.6);
    return {
      ...NEUTRAL,
      ...breathing(t),
      shoulderLift: 10 * s,
      headTilt: 9 * s,
      armFront: [7 + 20 * s, 12 + 95 * s],
      armBack: [-7 + 26 * s, 12 + 95 * s],
      handFront: "palm",
      handBack: "palm",
    };
  },

  react: ({ local, t }) => {
    const jump = local < 0.5 ? Math.sin((local / 0.5) * Math.PI) : 0;
    const k = ramp(local, 0.15);
    return {
      ...NEUTRAL,
      ...breathing(t),
      bodyY: -28 * jump,
      lean: -8 * k,
      headTilt: -8 * k,
      armFront: [7 + 100 * k, 12 + 50 * k],
      armBack: [-7 + 110 * k, 12 + 50 * k],
      handFront: "palm",
      handBack: "palm",
      legFront: [3 + 10 * jump, 2 + 30 * jump],
      legBack: [-3 - 6 * jump, 2 + 30 * jump],
    };
  },

  jump: ({ local }) => {
    const cyc = (local % 0.9) / 0.9;
    const air = Math.sin(cyc * Math.PI);
    const crouch = cyc < 0.15 ? Math.sin((cyc / 0.15) * Math.PI) : 0;
    return {
      ...NEUTRAL,
      bodyY: -90 * air + 18 * crouch,
      lean: 4,
      armFront: [7 + 140 * air, 20],
      armBack: [-7 + 150 * air, 20],
      legFront: [10 + 25 * air + 30 * crouch, 10 + 50 * air + 40 * crouch],
      legBack: [-5 + 20 * air + 30 * crouch, 10 + 60 * air + 40 * crouch],
      handFront: "fist",
      handBack: "fist",
    };
  },

  nod: ({ t, local }) => ({
    ...NEUTRAL,
    ...breathing(t),
    headTilt: Math.sin(local * 7) * 7 * Math.max(0, 1 - local / 2.5) + 3,
  }),
};

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerp2 = (a: [number, number], b: [number, number], k: number): [number, number] => [
  lerp(a[0], b[0], k),
  lerp(a[1], b[1], k),
];

export const blendPose = (a: Pose, b: Pose, k: number): Pose => ({
  bodyY: lerp(a.bodyY, b.bodyY, k),
  lean: lerp(a.lean, b.lean, k),
  headTilt: lerp(a.headTilt, b.headTilt, k),
  headLift: lerp(a.headLift, b.headLift, k),
  shoulderLift: lerp(a.shoulderLift, b.shoulderLift, k),
  armBack: lerp2(a.armBack, b.armBack, k),
  armFront: lerp2(a.armFront, b.armFront, k),
  legBack: lerp2(a.legBack, b.legBack, k),
  legFront: lerp2(a.legFront, b.legFront, k),
  handFront: k < 0.5 ? a.handFront : b.handFront,
  handBack: k < 0.5 ? a.handBack : b.handBack,
  lookY: lerp(a.lookY, b.lookY, k),
});

export const isSeated = (a: ActionName) => a === "sit" || a === "sitTalk" || a === "type";
