import { CharacterLook } from "../../utils/schema";

/**
 * Built-in cast. Reference them in a scene with `"who": "maya"`, or define
 * your own in storyboard.json → "cast" (optionally extending a preset with
 * `"preset": "maya"` is not needed – just override the fields you want).
 */
export const PRESETS: Record<string, Partial<CharacterLook>> = {
  alex: {
    name: "Alex",
    body: "average",
    skin: "#e0ac69",
    hair: "short",
    hairColor: "#2b1b12",
    outfit: "hoodie",
    top: "#3a86ff",
    bottom: "#2b2d42",
    shoes: "#f1f1f1",
  },
  maya: {
    name: "Maya",
    body: "slim",
    skin: "#c68642",
    hair: "ponytail",
    hairColor: "#1d1210",
    outfit: "jacket",
    top: "#ff6b6b",
    accent: "#fff3e0",
    bottom: "#264653",
    shoes: "#3d2c29",
  },
  drlee: {
    name: "Dr. Lee",
    body: "average",
    skin: "#f1c27d",
    hair: "side",
    hairColor: "#111111",
    outfit: "labcoat",
    top: "#06d6a0",
    bottom: "#3d405b",
    shoes: "#222222",
    glasses: true,
  },
  sam: {
    name: "Sam",
    body: "child",
    skin: "#ffdbac",
    hair: "curly",
    hairColor: "#b5651d",
    outfit: "overalls",
    top: "#ffd166",
    bottom: "#118ab2",
    shoes: "#ef476f",
  },
  grandpa: {
    name: "Walter",
    body: "elder",
    skin: "#f3c9a5",
    hair: "bald",
    hairColor: "#d9d9d9",
    outfit: "shirt",
    top: "#8d99ae",
    bottom: "#5c4033",
    shoes: "#2e1f1a",
    glasses: true,
    beard: true,
  },
  jordan: {
    name: "Jordan",
    body: "athletic",
    skin: "#8d5524",
    hair: "afro",
    hairColor: "#0f0b0a",
    outfit: "tshirt",
    top: "#06d6a0",
    bottom: "#1d3557",
    shoes: "#ffffff",
  },
  priya: {
    name: "Priya",
    body: "average",
    skin: "#d4a373",
    hair: "long",
    hairColor: "#140c0a",
    outfit: "suit",
    top: "#283618",
    accent: "#bc6c25",
    bottom: "#283618",
    shoes: "#111111",
  },
  ben: {
    name: "Ben",
    body: "heavy",
    skin: "#f5d0b0",
    hair: "spiky",
    hairColor: "#c96a2b",
    outfit: "shirt",
    top: "#e76f51",
    bottom: "#264653",
    shoes: "#3a2a20",
    beard: true,
  },
  nova: {
    name: "Nova",
    body: "athletic",
    skin: "#e8b48a",
    hair: "bob",
    hairColor: "#2a1a33",
    outfit: "spacesuit",
    top: "#eef1f5",
    accent: "#ef476f",
    bottom: "#e3e7ed",
    shoes: "#c9ced6",
  },
  marcus: {
    name: "Marcus",
    body: "average",
    skin: "#e5b887",
    hair: "short",
    hairColor: "#3b2a1a",
    outfit: "robe",
    top: "#f2e8cf",
    accent: "#9d0208",
    bottom: "#8b5e34",
    shoes: "#6f4518",
    beard: true,
  },
  zoe: {
    name: "Zoe",
    body: "slim",
    skin: "#ffe0bd",
    hair: "bun",
    hairColor: "#e9c46a",
    outfit: "dress",
    top: "#9b5de5",
    bottom: "#9b5de5",
    shoes: "#3c096c",
  },
};

export const resolveLook = (
  who: string,
  cast: Record<string, Partial<CharacterLook> & { preset?: string }>,
): CharacterLook => {
  const custom = cast[who] as (Partial<CharacterLook> & { preset?: string }) | undefined;
  const basePreset = custom?.preset ? PRESETS[custom.preset] : PRESETS[who];
  if (!custom && !basePreset) {
    throw new Error(
      `Unknown character "${who}". Define it in storyboard.json → cast, or use a preset: ${Object.keys(PRESETS).join(", ")}`,
    );
  }
  const defined = Object.fromEntries(Object.entries(custom ?? {}).filter(([, v]) => v !== undefined));
  return CharacterLook.parse({ ...(basePreset ?? {}), ...defined });
};
