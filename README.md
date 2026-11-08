# Explainer Animation Engine

A reusable 2D animation engine for 10–15 minute YouTube explainers, built on
Remotion + React + TypeScript. **Every video is a folder of data** in `projects/<id>/`.
You never edit React code to make a new video. Scenes are assembled from a
library of rigged characters, illustrated environments, objects, diagrams and
effects, and timed to your narration word by word.

- 1920×1080 · 30 fps · H.264 MP4
- Narration sync from your voiceover MP3 (local Whisper, free) or estimated timing for drafts
- Per-scene voiceover slices, so scenes can be lengthened or reordered without drift
- Karaoke subtitles, background music with automatic ducking, sound effects
- Parallax camera (pan, zoom, follow, shake), 9 scene transitions, colour grades

See **[docs/LIBRARY.md](docs/LIBRARY.md)** for every available name (environments, characters, objects, diagrams, effects, SFX).

---

## 1. Quick start

```bash
npm install
npm run audio:generate   # once: creates the local SFX + music loop in public/sfx and public/music
npm run dev              # opens Remotion Studio → "Videos/demo"
```

The 54-second demo (`projects/demo/`) shows every system: 8 scenes, 7 environments, 4 characters, lip-sync, charts, a map, effects, transitions, subtitles, music and SFX.

## 2. Making a new video — the workflow

Each video lives in its own folder:

```
projects/video-001/
├── script.md        voiceover script, one "## Scene" section per scene
├── storyboard.json  scenes + visuals (VS Code autocompletes it via storyboard.schema.json)
├── narration.mp3    your recorded voiceover (ElevenLabs etc.; .wav/.m4a also work)
└── captions.json    word timestamps, written by npm run transcribe
```

| Step | You do | Command |
|---|---|---|
| 1 | Write `projects/my-topic/script.md` (or let `new` create a template) | |
| 2 | Create the storyboard: one draft scene per script section | `npm run new -- my-topic "My Title"` |
| 3 | Fill in the visuals scene by scene in `storyboard.json` | (edit JSON) |
| 4 | Preview with estimated timing while you work | `npm run dev` |
| 5 | Record the script exactly as written → `projects/my-topic/narration.mp3` | |
| 6 | Create word timestamps (local, free) | `npm run transcribe -- my-topic` |
| 7 | Check everything | `npm run validate -- my-topic` |
| 8 | Review the whole video as thumbnails → `renders/my-topic/storyboard/` | `npm run storyboard -- my-topic --per-scene=2` |
| 9 | Quick half-res review render | `npm run render -- my-topic --draft` |
| 10 | Final MP4 → `renders/my-topic.mp4` | `npm run render -- my-topic` |

**script.md format**

```markdown
# Where Does Electricity Come From?

## Hook
> Visual note: presenter in a city at dawn (lines starting with > are not narrated)
Have you ever wondered where electricity comes from?

## The Sun
It all begins one hundred and fifty million kilometers away.
```

**Images:** put your own art in `public/characters/`, `public/backgrounds/` or `public/objects/`
and use `{ "kind": "image", "src": "backgrounds/old-map.png" }`.

**Working with Claude:** give Claude the topic. It writes `script.md`, you record `narration.mp3`,
then Claude writes `storyboard.json` using docs/LIBRARY.md and runs transcribe, validate and storyboard.

### Editing individual scenes
Every scene is independent: change, reorder, add or delete entries in `"scenes"`.
- Render only one scene: `npm run render -- my-topic --scene=s05-grid`
- Render a range: `npm run render -- my-topic --from=2:30 --to=3:10`
- In Studio, scrub to any scene; the timeline shows each scene by its id.

If you change the narration of a scene, re-record (or regenerate) that audio and run `npm run transcribe` again.

---

## 3. `storyboard.json` reference

```jsonc
{
  "$schema": "../../storyboard.schema.json",  // enables autocomplete + validation in VS Code
  "id": "my-topic",                             // = folder name
  "title": "My Title",
  "theme": { "accent": "#ffb703", "accent2": "#3a86ff", "text": "#ffffff", "dark": "#14213d" },
  "audio": {
    "wordsPerMinute": 155,                      // draft timing until narration.mp3 is transcribed
    "music": { "src": "music/calm-explainer.wav", "volume": 0.18, "duckTo": 0.07 }
  },
  "subtitles": { "enabled": true, "position": "bottom", "maxWords": 7, "size": 46 },
  "cast": { "host": { "preset": "maya", "top": "#8338ec" } },  // custom/recoloured characters
  "defaultTransition": { "type": "fade", "duration": 0.6 },
  "scenes": [ /* … */ ]
}
```

The narration file and captions are picked up automatically from the project folder; they are not listed in the JSON.

### Scenes

```jsonc
{
  "id": "s03-sun",
  "narration": "It begins one hundred and fifty million kilometers away, with our Sun.",
  "duration": 6,            // optional minimum length (required if no narration)
  "hold": 0.4,              // extra seconds after the narration
  "transition": { "type": "whip", "direction": "left", "duration": 0.5, "sfx": "swoosh" },
  "environment": { "type": "space", "time": "night", "weather": "clear", "seed": 1 },
  "camera": { "keys": [{ "t": 0, "zoom": 1.15 }, { "t": "end", "zoom": 1, "ease": "inOut" }] },
  "grade": "warm",          // none | warm | cool | dramatic | vintage | dream
  "vignette": 0.35,
  "elements": [ /* drawn in order, later = in front */ ],
  "sfx": [{ "at": "@sun", "src": "chime", "volume": 0.6 }]
}
```

Transitions: `none, fade, slide, wipe, iris, whip, zoom, clock, flip` (direction: `left, right, up, down`).

### Timing: numbers or narration cues
Any time field (`at`, `until`, `t`) accepts:

| Value | Meaning |
|---|---|
| `2.5` | seconds from the start of the scene |
| `"@sun"` | when the word *sun* is spoken (also matches *suns*) |
| `"@sun#2"` | 2nd occurrence |
| `"@solar panel"` | a phrase |
| `"@sun+0.5"`, `"@sun-0.3"` | with an offset |
| `"@sun:end"` | when the word finishes |
| `"end"`, `"end-1.5"` | relative to the end of the scene |

Cues follow the **real voiceover** once it is transcribed, so animation stays in sync after a re-record.

### Elements
Common fields for every element: `id, at, until, enter, exit, x, y, scale, rotate, opacity, path, depth, screen, float, flip, zIndex`.

- **Coordinates:** a 1920×1080 stage. Characters and ground objects stand on the environment's floor by default (`y` = ground).
- **`path`:** keyframes `[{ "t": 1, "x": 300 }, { "t": "@here", "x": 1200, "ease": "smooth" }]`. Each key is a target reached at its time. Characters walk or run automatically while moving and face their direction of travel.
- **`enter` / `exit`:** `fade, pop, rise, drop, slideLeft, slideRight, slideUp, slideDown, zoom, spin, blur, draw, wipe, none`, or `{ "type": "pop", "duration": 0.4, "ease": "back" }`.
- **`depth`:** parallax. `1` = world, `0.5` = far away, `1.3` = foreground.
- **`screen: true`:** ignores the camera. This is the default for text and diagrams.
- **Animatable environment props:** most `environment.props` values accept keyframes `[[t, value], …]` (seconds since scene start), e.g. `"water": [[0, "#3d8fc4"], [4, "#7a0f18"]]` or `"open": [[0, 0], [1.5, 1]]`.
- **Scene look:** `grade` (`sepia, crimson, murky, rust, clean, …`), `tag` (`real | hypothetical | none | {text, color}`, default `project.defaultTag`), `environment.rainColor` for coloured rain.

| kind | Key fields |
|---|---|
| `character` | `who`, `actions[{t, do, angle?}]`, `expressions[{t, is}]`, `expression`, `speaks` (`true` or `[[from, to]]`), `facing`, `turns[{t, to}]`, `look` |
| `object` | `type`, `color`, `color2`, `speed`, `props` |
| `text` | `text`, `style` (title, headline, subtitle, label, caption, quote, number), `highlight[]`, `reveal` (words, letters, typewriter, none), `color`, `background`, `size`, `maxWidth`, `align` |
| `diagram` | `type` (bar, line, pie, donut, counter, progress, flow, timeline, list, compare, map), `data`, `title`, `width`, `height`, `build` (seconds) |
| `effect` | `type` (fire, smoke, sparkles, confetti, bubbles, dust, embers, fireflies, leaves, explosion, glow, speedlines, lightning, ripple, energy), `width`, `height`, `intensity`, `color` |
| `arrow` | `from: [x,y]`, `to: [x,y]`, `curve`, `color`, `thickness`, `dashed`, `flow`, `label`, `build` |
| `image` | `src` (in /public), `width`, `height`, `radius`, `frame` |
| `group` | `children[]` (positioned relative to the group) |

Example: a presenter pointing at a chart when a word is spoken:

```json
{ "kind": "character", "who": "drlee", "x": 430, "speaks": true,
  "actions": [{ "t": "@third", "do": "present" }],
  "expressions": [{ "t": 0, "is": "confident" }, { "t": "@renewable", "is": "happy" }] },
{ "kind": "diagram", "type": "donut", "x": 1220, "y": 470, "at": "@third-0.3",
  "title": "World electricity", "data": [{ "label": "Renewables", "value": 30 }, { "label": "Other", "value": 70 }] }
```

---

## 4. Architecture

```
projects/<id>/                 ← one folder per video: script.md, storyboard.json, narration.mp3, captions.json
public/
  characters/ backgrounds/ objects/   ← your own image assets (for "kind": "image")
  music/  sfx/                 ← background music + sound effects (npm run audio:generate)
  audio/                       ← narration copies served to Remotion (made by npm run sync; git-ignored)
src/
  components/
    characters/                ← SVG rig: builds, poses/actions, expressions, hair, head, presets; outfits incl. armor/hivis, headwear (crown/helmet/hardhat/cap), mask
    environments/              ← 24 parallax environments (incl. river, farm, micro, cutaway, window), sky/clouds/hills, coloured rain
    objects/                   ← ~95 animated SVG objects (incl. wildlife, lab, farm & story props); diagrams/ = charts, flow, timeline, real Natural Earth map, arrows
    camera/                    ← camera keyframes, follow, shake, parallax layers
    effects/                   ← particle systems and FX
    typography/                ← animated text blocks + karaoke subtitles
  scenes/                      ← scene renderer, element renderer, scene context, transitions
  compositions/                ← the video composition (+ music) and test galleries for every library
  templates/                   ← starter storyboard / scene / script templates used by npm run new
  utils/                       ← schema, narration timing, keyframes, lighting, colour, easing, sfx, catalog
  projects.generated.ts        ← auto-generated list of projects (npm run sync)
renders/                       ← MP4s and storyboards
scripts/                       ← new, sync, validate, transcribe, storyboard, render, audio, schema, docs
tests/                         ← engine unit tests (npm test)
```

**How timing works:** `calculateMetadata` loads the project, then aligns the script against
the transcript with Needleman–Wunsch alignment, which tolerates transcription mistakes.
It gives each scene its own slice of the voiceover and computes exact frames, allowing for
transition overlaps. Each scene starts narrating once its transition-in finishes, and its
audio ends before the next transition begins.

**Extending the library** (this does need code, and is done once):
- New object: add a component to the right file in `src/components/objects/` and register it in that file's map.
- New environment: add it in `src/components/environments/` and register it in `registry.tsx` there.
- New action or expression: `src/components/characters/poses.ts` / `expressions.ts`, plus the name in `src/utils/schema.ts`.
- Then run `npm run docs` to refresh `docs/LIBRARY.md` and `storyboard.schema.json`.

## 5. Quality checks

```bash
npm test          # timing/alignment/keyframe/subtitle/script unit tests
npm run lint      # eslint + TypeScript
npm run validate -- <id>
npm run words -- <id> [s66,s80]   # scene-relative word times, for map views and animatable props that take seconds
npm run thumbnails -- <id> [--only=thumb-A] [--full]   # YouTube thumbnails (1280×720 JPG) from projects/<id>/thumbnails.json: an engine scene + bold outlined text
```
Studio → **Library-Tests** has visual test sheets for the cast, all 16 actions, all environments,
all objects, all diagrams and all effects.

## 6. Free cloud rendering (GitHub Actions)

This PC has too little RAM for long renders, so final renders can run on GitHub's servers
(`.github/workflows/render.yml`). The video is split into chunks that render **in parallel**
on separate machines. Each chunk is muted H.264 plus WAV audio, and the chunks are then joined
losslessly into one MP4.

1. Push this repo to GitHub. Standard runners are free and unlimited on **public** repos;
   private repos use the account's free monthly Actions minutes.
2. Go to GitHub → **Actions** → **Render video** → **Run workflow**. Enter the project id
   (e.g. `video-001`), the number of chunks (default 8), whether this is a draft, and optionally
   "seconds" to render only the first N seconds (handy for a quick test).
3. When it finishes, download `<project>-final` from the run's **Artifacts**.

`npx tsx scripts/cloud-plan.ts <id> 8` prints the chunk frame ranges the workflow uses.

## 7. Notes
- `npm run transcribe` downloads whisper.cpp and a model into `.whisper/` on first use
  (`--model=base.en` ≈150 MB by default; `small.en`/`medium.en` are more accurate). Nothing is sent to any server.
- If you replace `narration.mp3`, run `npm run transcribe` again (`npm run sync` warns when captions are older than the audio).
- Remote SFX names (`whoosh`, `ding`, …) need internet while rendering. The local ones don't.
- Rendering speed depends on your CPU. Use `--draft` for reviews and `--concurrency=N` to tune.
