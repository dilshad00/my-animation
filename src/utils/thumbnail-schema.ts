/** Schema for projects/<id>/thumbnails.json (see src/compositions/Thumbnail.tsx). Node-safe: no React imports. */
import { z } from "zod";
import { Scene } from "./schema";

export const ThumbText = z.object({
  text: z.string(),
  x: z.number(),
  y: z.number(),
  size: z.number().default(160),
  color: z.string().default("#ffffff"),
  /** outline colour + width in px */
  stroke: z.string().default("#000000"),
  strokeWidth: z.number().default(14),
  rotate: z.number().default(0),
  align: z.enum(["left", "center", "right"]).default("center"),
  /** liquid drips under each word: true (crimson) or a colour */
  drip: z.union([z.boolean(), z.string()]).optional(),
  /** drip length multiplier (1 = same as in the video) */
  dripLength: z.number().default(0.5),
  /** filled banner behind the text */
  background: z.string().optional(),
  /** letter spacing in em */
  tracking: z.number().default(-0.02),
});

export const ThumbSpec = z.object({
  id: z.string(),
  notes: z.string().optional(),
  /** seconds into the scene to freeze (let entrances finish) */
  at: z.number().default(2.5),
  scene: Scene,
  look: z
    .object({
      saturate: z.number().default(1.25),
      contrast: z.number().default(1.12),
      brightness: z.number().default(1),
      /** 0..1 dark edge vignette */
      vignette: z.number().default(0.5),
      /** optional colour wash over the scene, e.g. "rgba(200,0,20,0.15)" */
      tint: z.string().optional(),
    })
    .default({ saturate: 1.25, contrast: 1.12, brightness: 1, vignette: 0.5 }),
  texts: z.array(ThumbText).default([]),
});
export type ThumbSpecT = z.infer<typeof ThumbSpec>;
export const ThumbFile = z.object({ thumbnails: z.array(ThumbSpec) });

export type ThumbTextT = z.infer<typeof ThumbText>;
