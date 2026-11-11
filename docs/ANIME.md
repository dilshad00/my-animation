# Premium 2D anime style

Set `"style": "anime"` at the top of a `storyboard.json` and the whole video renders in the
premium 2D anime look. Nothing else is required: the rest of the storyboard format is the same.

```json
{ "id": "my-video", "title": "…", "style": "anime", "cast": { "hikari": {}, "ren": {} }, "scenes": [ … ] }
```

New project: `npm run new -- <id> "Title" --anime` (anime environments + Hikari as the presenter).
Reference storyboard with every feature: `projects/anime-sample/storyboard.json`.

## What changes in anime style

| Part | Classic | Anime |
|---|---|---|
| Characters | full-body flat figures | cel-shaded **bust** (head + shoulders), wind-blown hair, rim light, big eyes |
| Environments | as written | `city/street/suburb` → `anime-city`, `classroom/office` → `anime-classroom`, `studio/gradient/apartment` → `anime-closeup`; other types render as written |
| Grade | `none` | `anime`: richer colour, bloom tint, vignette, film grain (override per scene with `grade`) |
| Text | Poppins | add `"style": "anime"` to a text element for the glowing display-title look |

## Characters

The bust is 800×960 px at `scale: 1`. Its **bottom centre** sits at the element's `x`/`y`,
and the default `y` is just below the frame (1120), so only `x` is needed for a medium shot.
- Two people side by side: `x: 620` and `x: 1320`.
- Close-up: `scale: 1.5, y: 1500`. Extreme close-up of the eyes: `scale: 3, y: 2700`.

Built-in anime cast: `hikari` (long navy hair, violet eyes, sailor uniform, star clip) and
`ren` (short brown hair, amber eyes, gakuran). Any classic preset or custom cast member also
works and is translated automatically. These cast fields control the anime look:

| Field | Values |
|---|---|
| `animeHair` | `long`, `medium`, `short` (default from `hair`) |
| `animeOutfit` | `sailor`, `gakuran`, `blazer`, `hoodie`, `casual` (default from `outfit`) |
| `lashes` | `true` = long feminine lashes (default true for long/bob/ponytail/bun hair) |
| `hairClip` | star hair clip |
| colours | `hairColor`, `eyeColor`, `skin`, `top` (collar / jacket / hoodie), `accent` (ribbon / tie), `glasses` |

How the performance maps:
- **Expressions**: `neutral` (soft smile), `happy` (grin), `joy` (^ ^ eyes), `sad` (drooping lids), `angry` (slanted lids, small pupils),
  `surprised` (O mouth, tiny pupils), `thinking` (looks up), `worried` (sweat drop), `confident`, `wink`.
- **speaks** lip-syncs to the narration. Blinking is automatic. **look**: `camera | left | right | up | down` moves the irises.
- **Actions**: `nod`, `think`, `react` (pupils shrink and the body jolts), `cheer`/`jump` (bounce), `shrug`, and `wave`/`point`/`present` (lean).
  Moving along a `path` makes the bust bob as it walks.
- **Wind**: hair and ribbons sway more when `weather` is `wind` or `storm`.
- **Rim light** follows the scene `time`: warm at sunset and dawn, blue at night, soft white in the day.

## Environments (`time`: `day` | `sunset` | `night`)

| Type | Look |
|---|---|
| `anime-city` | painted sky and a layered skyline with lit windows |
| `anime-rooftop` | school-rooftop chain-link fence with the city below (sunset adds god rays) |
| `anime-sky` | open sky: towering cel-shaded clouds by day or at sunset, stars and a shooting star at night |
| `anime-classroom` | windows, curtains, light shafts, dust motes and desks. `props.board` is chalkboard text; `color` = wall |
| `anime-action` | burst background with flickering focus lines for big moments. `color` = burst colour |
| `anime-closeup` | soft bokeh gradient for reactions and close-ups. `color` = tint |

Engine weather (`rain`, `snow`, `fog`…) works on top of all of them.

## Effects (`"kind": "effect"`)

`sakura` (petals), `godrays` (rays from x/y), `focuslines` (manga focus lines), `twinkle` (four-point sparkles),
`lensflare` (place x/y on the sun), `impactflash` (one 0.35 s flash for hits and reveals). `intensity` scales each one.

## Shot recipes

- **Establishing**: `anime-sky` or `anime-city` at sunset, camera keys from `zoom: 1.2` to `1`, plus `sakura`.
- **Dialogue**: `anime-rooftop`, two busts at x 620 / 1320, `look` at each other, and `speaks` on the one talking.
- **Reaction**: `anime-closeup` with `scale: 1.5, y: 1500`, `surprised` → `joy`, a `react` action and `twinkle`.
- **Big moment**: `anime-action` + `impactflash` + `camera.shake: 6`, with an `angry` or `surprised` character who `speaks`.
- **Title card**: `anime-city` at night, a character at x 480 looking `up`, text `"style": "anime"` at x 1300.

The hand-made style test lives in `src/compositions/AnimeDemo.tsx` (composition `Anime-Demo`), and the asset sheets are in
`Anime-Assets` (`npx tsx scripts/anime-assets.ts`).
