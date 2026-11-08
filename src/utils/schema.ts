import { z } from "zod";

/**
 * PROJECT SCHEMA
 * ---------------------------------------------------------------------------
 * Every video is described by a `projects/<id>/storyboard.json` that follows this schema.
 * No React code is needed to create a new video: scenes are composed from the
 * registered library of environments, characters, objects, diagrams & effects.
 *
 * Time values ("TimeValue") may be:
 *   - a number of seconds from the start of the scene          e.g. 2.5
 *   - a narration cue: "@word" (first occurrence of the word)   e.g. "@energy"
 *     "@word#2" (2nd occurrence), "@word+0.5" (offset seconds)  e.g. "@sun#2-0.3"
 *   - "end" or "end-1.5"  (relative to the end of the scene)
 */

export const TimeValue = z.union([z.number(), z.string()]);
export type TimeValue = z.infer<typeof TimeValue>;

export const EaseName = z.enum([
  "linear",
  "in",
  "out",
  "inOut",
  "spring",
  "bounce",
  "back",
  "smooth",
]);
export type EaseName = z.infer<typeof EaseName>;

export const AnimPreset = z.enum([
  "none",
  "fade",
  "pop",
  "rise",
  "drop",
  "slideLeft",
  "slideRight",
  "slideUp",
  "slideDown",
  "zoom",
  "spin",
  "draw",
  "wipe",
  "blur",
]);
export type AnimPreset = z.infer<typeof AnimPreset>;

export const Anim = z.union([
  AnimPreset,
  z.object({
    type: AnimPreset,
    duration: z.number().positive().optional(),
    ease: EaseName.optional(),
  }),
]);
export type Anim = z.infer<typeof Anim>;

/** A keyframe for any element transform. Missing properties are held. */
export const Keyframe = z.object({
  t: TimeValue,
  x: z.number().optional(),
  y: z.number().optional(),
  scale: z.number().optional(),
  rotate: z.number().optional(),
  opacity: z.number().optional(),
  ease: EaseName.optional(),
});
export type Keyframe = z.infer<typeof Keyframe>;

const ElementBase = {
  /** Optional id, used by camera follow / pointers */
  id: z.string().optional(),
  /** When the element appears (default 0) */
  at: TimeValue.optional(),
  /** When the element starts to exit (default: stays until the scene ends) */
  until: TimeValue.optional(),
  enter: Anim.optional(),
  exit: Anim.optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  scale: z.number().optional(),
  rotate: z.number().optional(),
  opacity: z.number().optional(),
  /** Keyframed motion, applied on top of x/y/scale/rotate */
  path: z.array(Keyframe).optional(),
  /**
   * Parallax depth. 1 = moves with the world (default for world elements).
   * <1 = further away, >1 = foreground (moves faster than the world).
   */
  depth: z.number().optional(),
  /** true = screen-space (ignores camera). Default true for text/diagrams. */
  screen: z.boolean().optional(),
  /** Gentle idle floating motion amplitude in px */
  float: z.number().optional(),
  /** Draw a soft contact shadow below the element */
  shadow: z.boolean().optional(),
  /** Flip horizontally */
  flip: z.boolean().optional(),
  zIndex: z.number().optional(),
};

// ---------------------------------------------------------------- characters
export const BodyType = z.enum([
  "slim",
  "average",
  "athletic",
  "heavy",
  "child",
  "elder",
]);
export const HairStyle = z.enum([
  "short",
  "side",
  "spiky",
  "bob",
  "long",
  "ponytail",
  "bun",
  "curly",
  "afro",
  "bald",
]);
export const Outfit = z.enum([
  "tshirt",
  "hoodie",
  "shirt",
  "suit",
  "dress",
  "labcoat",
  "jacket",
  "spacesuit",
  "robe",
  "overalls",
  "armor",
  "hivis",
]);
export const Headwear = z.enum(["none", "crown", "helmet", "hardhat", "cap"]);
export const Expression = z.enum([
  "neutral",
  "happy",
  "joy",
  "sad",
  "angry",
  "surprised",
  "thinking",
  "worried",
  "confident",
  "wink",
]);
export const ActionName = z.enum([
  "idle",
  "walk",
  "run",
  "talk",
  "point",
  "wave",
  "sit",
  "sitTalk",
  "type",
  "cheer",
  "think",
  "shrug",
  "react",
  "present",
  "jump",
  "nod",
]);
export type ActionName = z.infer<typeof ActionName>;
export type ExpressionName = z.infer<typeof Expression>;

export const CharacterLook = z.object({
  /** Start from a built-in preset and override only some fields */
  preset: z.string().optional(),
  name: z.string().optional(),
  body: BodyType.default("average"),
  skin: z.string().default("#f1c27d"),
  hair: HairStyle.default("short"),
  hairColor: z.string().default("#3b2a20"),
  outfit: Outfit.default("tshirt"),
  top: z.string().default("#3a86ff"),
  bottom: z.string().default("#2b2d42"),
  shoes: z.string().default("#1b1b1b"),
  accent: z.string().optional(),
  glasses: z.boolean().default(false),
  beard: z.boolean().default(false),
  /** crown | helmet (knight) | hardhat | cap */
  headwear: Headwear.default("none"),
  /** surgical face mask */
  mask: z.boolean().default(false),
  eyeColor: z.string().default("#2b1d14"),
});
export type CharacterLook = z.infer<typeof CharacterLook>;

/** Cast entries: every field optional and WITHOUT defaults, so presets are kept. */
export const CharacterLookPatch = z.object({
  preset: z.string().optional(),
  name: z.string().optional(),
  body: BodyType.optional(),
  skin: z.string().optional(),
  hair: HairStyle.optional(),
  hairColor: z.string().optional(),
  outfit: Outfit.optional(),
  top: z.string().optional(),
  bottom: z.string().optional(),
  shoes: z.string().optional(),
  accent: z.string().optional(),
  glasses: z.boolean().optional(),
  beard: z.boolean().optional(),
  headwear: Headwear.optional(),
  mask: z.boolean().optional(),
  eyeColor: z.string().optional(),
});
export type CharacterLookPatchT = z.infer<typeof CharacterLookPatch>;

export const CharacterElement = z.object({
  kind: z.literal("character"),
  /** Cast member id (defined in project.cast) or a built-in preset id */
  who: z.string(),
  ...ElementBase,
  /** "left" | "right" | "auto" (auto = face direction of travel) */
  facing: z.enum(["left", "right", "auto"]).optional(),
  /** Turn around at given times, e.g. [{ "t": "@wind", "to": "right" }] */
  turns: z.array(z.object({ t: TimeValue, to: z.enum(["left", "right"]) })).optional(),
  /** Action timeline. Each entry starts an action at time t. */
  actions: z
    .array(
      z.object({
        t: TimeValue,
        do: ActionName,
        /** For point/present: direction angle in degrees (0 = forward) */
        angle: z.number().optional(),
      }),
    )
    .optional(),
  expressions: z
    .array(z.object({ t: TimeValue, is: Expression }))
    .optional(),
  /** Base expression */
  expression: Expression.optional(),
  /**
   * Lip-sync with the narration. true = whole scene narration,
   * or a list of [from, to] time ranges.
   */
  speaks: z
    .union([z.boolean(), z.array(z.tuple([TimeValue, TimeValue]))])
    .optional(),
  /** Look target: "camera", "left", "right", "up", "down" */
  look: z.enum(["camera", "left", "right", "up", "down"]).optional(),
});

// ------------------------------------------------------------------ objects
export const ObjectElement = z.object({
  kind: z.literal("object"),
  /** Registered object type, e.g. "car", "laptop", "tree", "dog" */
  type: z.string(),
  ...ElementBase,
  color: z.string().optional(),
  color2: z.string().optional(),
  /** Free-form props passed to the object (e.g. { "text": "42%" }) */
  props: z.record(z.string(), z.any()).optional(),
  /** Speed multiplier for built-in object animation (wheels, wings…) */
  speed: z.number().optional(),
});

// --------------------------------------------------------------------- text
export const TextElement = z.object({
  kind: z.literal("text"),
  ...ElementBase,
  text: z.string(),
  style: z
    .enum(["title", "headline", "subtitle", "label", "caption", "quote", "number"])
    .optional(),
  color: z.string().optional(),
  background: z.string().optional(),
  size: z.number().optional(),
  align: z.enum(["left", "center", "right"]).optional(),
  maxWidth: z.number().optional(),
  /** Animate letters / words in */
  reveal: z.enum(["none", "words", "letters", "typewriter"]).optional(),
  /** Words to highlight with the accent colour */
  highlight: z.array(z.string()).optional(),
  /** Liquid drips running down from the letters: true (crimson) or a colour */
  drip: z.union([z.boolean(), z.string()]).optional(),
});

// ------------------------------------------------------------------ diagrams
export const DiagramElement = z.object({
  kind: z.literal("diagram"),
  /** bar | line | pie | donut | counter | flow | timeline | map | list | compare | progress */
  type: z.string(),
  ...ElementBase,
  width: z.number().optional(),
  height: z.number().optional(),
  title: z.string().optional(),
  data: z.any().optional(),
  color: z.string().optional(),
  /** Seconds the build-on animation takes */
  build: z.number().optional(),
});

// ----------------------------------------------------------------- effects
export const EffectElement = z.object({
  kind: z.literal("effect"),
  /** fire | smoke | sparkles | confetti | bubbles | dust | embers | leaves | explosion | glow | speedlines | lightning | ripple */
  type: z.string(),
  ...ElementBase,
  width: z.number().optional(),
  height: z.number().optional(),
  intensity: z.number().optional(),
  color: z.string().optional(),
  seed: z.number().optional(),
});

// ----------------------------------------------------------------- pointers
export const ArrowElement = z.object({
  kind: z.literal("arrow"),
  ...ElementBase,
  from: z.tuple([z.number(), z.number()]),
  to: z.tuple([z.number(), z.number()]),
  /** Curvature: 0 straight, positive bends left, negative bends right */
  curve: z.number().optional(),
  color: z.string().optional(),
  thickness: z.number().optional(),
  dashed: z.boolean().optional(),
  label: z.string().optional(),
  /** Draw-on duration in seconds */
  build: z.number().optional(),
  /** Flowing dashes along the arrow */
  flow: z.boolean().optional(),
});

export const ImageElement = z.object({
  kind: z.literal("image"),
  ...ElementBase,
  /** File inside /public (e.g. "backgrounds/old-map.png") */
  src: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  radius: z.number().optional(),
  frame: z.boolean().optional(),
});

export type GroupElementT = {
  kind: "group";
  children: ElementT[];
} & Partial<z.infer<z.ZodObject<typeof ElementBase>>>;

export const Element: z.ZodType<ElementT> = z.lazy(() =>
  z.discriminatedUnion("kind", [
    CharacterElement,
    ObjectElement,
    TextElement,
    DiagramElement,
    EffectElement,
    ArrowElement,
    ImageElement,
    // groups are validated through z.lazy
    z.object({
      kind: z.literal("group"),
      ...ElementBase,
      children: z.array(z.lazy(() => Element)),
    }),
  ]),
) as z.ZodType<ElementT>;

export type CharacterElementT = z.infer<typeof CharacterElement>;
export type ObjectElementT = z.infer<typeof ObjectElement>;
export type TextElementT = z.infer<typeof TextElement>;
export type DiagramElementT = z.infer<typeof DiagramElement>;
export type EffectElementT = z.infer<typeof EffectElement>;
export type ArrowElementT = z.infer<typeof ArrowElement>;
export type ImageElementT = z.infer<typeof ImageElement>;
export type ElementT =
  | CharacterElementT
  | ObjectElementT
  | TextElementT
  | DiagramElementT
  | EffectElementT
  | ArrowElementT
  | ImageElementT
  | GroupElementT;

// ------------------------------------------------------------- environment
export const EnvironmentSpec = z.object({
  /** city | street | suburb | apartment | office | forest | ocean | underwater | space | planet | lab | desert | medieval | studio | blueprint */
  type: z.string(),
  time: z.enum(["dawn", "day", "sunset", "night"]).optional(),
  weather: z
    .enum(["clear", "cloudy", "rain", "storm", "snow", "fog", "wind"])
    .optional(),
  /** Variation seed (changes building layout, tree positions…) */
  seed: z.number().optional(),
  /** Primary tint for abstract environments (studio/blueprint) */
  color: z.string().optional(),
  /** Colour of rain/storm drops, e.g. "#9b111e" for blood rain. Also tints clouds, sky and light. */
  rainColor: z.string().optional(),
  /** 0..2 multiplier for rain/snow density (default 1) */
  intensity: z.number().optional(),
  props: z.record(z.string(), z.any()).optional(),
});
export type EnvironmentSpecT = z.infer<typeof EnvironmentSpec>;

export const CameraKey = z.object({
  t: TimeValue,
  /** World point at the centre of the screen. Default 960,540 */
  x: z.number().optional(),
  y: z.number().optional(),
  zoom: z.number().optional(),
  rotate: z.number().optional(),
  ease: EaseName.optional(),
});
export const CameraSpec = z.object({
  keys: z.array(CameraKey).optional(),
  /** Element id to track horizontally */
  follow: z.string().optional(),
  /** Screen shake intensity in px */
  shake: z.number().optional(),
  /** Slow automatic drift for still shots (default true) */
  drift: z.boolean().optional(),
});

export const TransitionSpec = z.object({
  type: z.enum([
    "none",
    "fade",
    "slide",
    "wipe",
    "iris",
    "whip",
    "zoom",
    "clock",
    "flip",
  ]),
  duration: z.number().positive().optional(),
  direction: z.enum(["left", "right", "up", "down"]).optional(),
  /** Sound effect played at the transition */
  sfx: z.string().optional(),
});
export type TransitionSpecT = z.infer<typeof TransitionSpec>;

export const SfxCue = z.object({
  at: TimeValue,
  /** Built-in name (see docs/LIBRARY.md) or a /public path */
  src: z.string(),
  volume: z.number().optional(),
  /** Loop the sound (ambience such as rain or flies) until `until` or the end of the scene */
  loop: z.boolean().optional(),
  until: TimeValue.optional(),
});

/** Corner label telling viewers whether a scene shows real facts or a hypothetical. */
export const SceneTag = z.union([
  z.enum(["none", "real", "hypothetical"]),
  z.object({ text: z.string(), color: z.string().optional() }),
]);
export type SceneTagT = z.infer<typeof SceneTag>;

export const Scene = z.object({
  id: z.string(),
  /** The exact narration for this scene (from the approved script) */
  narration: z.string().optional(),
  /** Minimum scene length in seconds (required when there is no narration) */
  duration: z.number().positive().optional(),
  /** Extra seconds held after the narration ends (default 0.4) */
  hold: z.number().min(0).optional(),
  /** Transition INTO this scene */
  // eslint-disable-next-line @remotion/non-pure-animation -- a data field, not a CSS transition
  transition: TransitionSpec.optional(),
  environment: EnvironmentSpec.optional(),
  camera: CameraSpec.optional(),
  /** Colour grade */
  grade: z.enum(["none", "warm", "cool", "dramatic", "vintage", "dream", "sepia", "crimson", "murky", "rust", "clean"]).optional(),
  /** Corner label: "real" | "hypothetical" | "none" | { text, color } (default: project.defaultTag) */
  tag: SceneTag.optional(),
  vignette: z.number().optional(),
  elements: z.array(Element).default([]),
  sfx: z.array(SfxCue).optional(),
  /** Hide subtitles for this scene */
  subtitles: z.boolean().optional(),
  /** Free notes for the storyboard (ignored by the renderer) */
  notes: z.string().optional(),
});
export type SceneT = z.infer<typeof Scene>;

export const MusicSpec = z.object({
  src: z.string(),
  /** Scene id where this track starts (in a list of music cues). Default: the first scene */
  from: z.string().optional(),
  /** Seconds of crossfade into the next music cue */
  crossfade: z.number().default(2.5),
  volume: z.number().default(0.18),
  /** Volume while narration is speaking */
  duckTo: z.number().default(0.07),
  loop: z.boolean().default(true),
  fadeIn: z.number().default(1.5),
  fadeOut: z.number().default(2.5),
});

export const Project = z.object({
  $schema: z.string().optional(),
  id: z
    .string()
    .regex(/^[a-zA-Z0-9-]+$/, "id may only contain letters, numbers and dashes"),
  title: z.string(),
  topic: z.string().optional(),
  fps: z.number().int().default(30),
  width: z.number().int().default(1920),
  height: z.number().int().default(1080),
  theme: z
    .object({
      accent: z.string().default("#ffb703"),
      accent2: z.string().default("#3a86ff"),
      text: z.string().default("#ffffff"),
      dark: z.string().default("#14213d"),
      font: z.string().default("Poppins"),
    })
    .default({
      accent: "#ffb703",
      accent2: "#3a86ff",
      text: "#ffffff",
      dark: "#14213d",
      font: "Poppins",
    }),
  audio: z
    .object({
      /** Used to estimate timings until projects/<id>/narration.mp3 has been transcribed */
      wordsPerMinute: z.number().default(155),
      voiceVolume: z.number().default(1),
      /** 0..1: let the voiceover start this far into each incoming transition (tightens pacing). Default 0. */
      narrationOverlap: z.number().min(0).max(1).optional(),
      /** One track for the whole video, or a list of cues that switch track at given scenes */
      music: z.union([MusicSpec, z.array(MusicSpec).min(1)]).optional(),
    })
    .default({ wordsPerMinute: 155, voiceVolume: 1 }),
  subtitles: z
    .object({
      enabled: z.boolean().default(true),
      position: z.enum(["bottom", "top"]).default("bottom"),
      highlight: z.string().optional(),
      maxWords: z.number().default(7),
      size: z.number().default(46),
    })
    .default({ enabled: true, position: "bottom", maxWords: 7, size: 46 }),
  /** Named characters, reused across scenes for consistency */
  cast: z.record(z.string(), CharacterLookPatch).default({}),
  /** Corner tag shown on every scene unless the scene sets its own */
  defaultTag: SceneTag.optional(),
  /** Default transition between scenes */
  defaultTransition: TransitionSpec.optional(),
  scenes: z.array(Scene).min(1),
});

export type ProjectInput = z.input<typeof Project>;
export type ProjectT = z.infer<typeof Project>;
