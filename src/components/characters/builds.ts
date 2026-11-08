/** Body proportions in character units (feet at y=0, ≈420 units tall). */
export type Build = {
  thigh: number;
  shin: number;
  ankle: number;
  torso: number;
  neck: number;
  headR: number;
  shoulderW: number;
  waistW: number;
  hipW: number;
  belly: number;
  upperArm: number;
  foreArm: number;
  armW: number;
  legW: number;
  /** default forward stoop in degrees */
  stoop: number;
};

export const BUILDS: Record<string, Build> = {
  average: {
    thigh: 86, shin: 80, ankle: 12, torso: 132, neck: 12, headR: 52,
    shoulderW: 96, waistW: 78, hipW: 82, belly: 0.15,
    upperArm: 70, foreArm: 66, armW: 22, legW: 28, stoop: 0,
  },
  slim: {
    thigh: 92, shin: 86, ankle: 12, torso: 134, neck: 14, headR: 50,
    shoulderW: 84, waistW: 64, hipW: 72, belly: 0,
    upperArm: 72, foreArm: 68, armW: 18, legW: 23, stoop: 0,
  },
  athletic: {
    thigh: 90, shin: 84, ankle: 12, torso: 136, neck: 14, headR: 50,
    shoulderW: 118, waistW: 76, hipW: 80, belly: 0,
    upperArm: 72, foreArm: 68, armW: 26, legW: 30, stoop: 0,
  },
  heavy: {
    thigh: 80, shin: 76, ankle: 12, torso: 136, neck: 8, headR: 54,
    shoulderW: 112, waistW: 112, hipW: 108, belly: 1,
    upperArm: 68, foreArm: 64, armW: 28, legW: 36, stoop: 0,
  },
  child: {
    thigh: 54, shin: 50, ankle: 10, torso: 92, neck: 8, headR: 50,
    shoulderW: 70, waistW: 62, hipW: 64, belly: 0.25,
    upperArm: 48, foreArm: 44, armW: 18, legW: 22, stoop: 0,
  },
  elder: {
    thigh: 82, shin: 78, ankle: 12, torso: 126, neck: 10, headR: 51,
    shoulderW: 90, waistW: 84, hipW: 84, belly: 0.45,
    upperArm: 66, foreArm: 64, armW: 21, legW: 27, stoop: 7,
  },
};

export const getBuild = (body: string): Build => BUILDS[body] ?? BUILDS.average;

export const legLength = (b: Build) => b.thigh + b.shin + b.ankle;
export const totalHeight = (b: Build) =>
  legLength(b) + b.torso + b.neck + b.headR * 2;
/** Hip height when seated with feet on the floor (use for chair seat height). */
export const seatHeight = (b: Build) => b.shin + b.ankle;
