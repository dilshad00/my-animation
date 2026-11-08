import { staticFile } from "remotion";

/**
 * Sound effects usable by name in storyboard.json (scene.sfx[].src or
 * transition.sfx). Local ones are synthesised by `npm run audio:generate`
 * into public/sfx; remote ones are free Remotion-hosted samples.
 * Any other value is treated as a path inside /public.
 */
export const LOCAL_SFX = [
  "pop", "swoosh", "chime", "riser", "impact", "tick", "bubble", "sparkle",
  // documentary set (loops: rain, rain-heavy, flies, spray, heartbeat)
  "rain", "rain-heavy", "thunder", "flies", "drip", "squelch", "tear", "spray", "boom", "heartbeat", "stinger",
] as const;

export const REMOTE_SFX: Record<string, string> = {
  whoosh: "https://remotion.media/whoosh.wav",
  whip: "https://remotion.media/whip.wav",
  pageturn: "https://remotion.media/page-turn.wav",
  switch: "https://remotion.media/switch.wav",
  click: "https://remotion.media/mouse-click.wav",
  shutter: "https://remotion.media/shutter-modern.wav",
  ding: "https://remotion.media/ding.wav",
};

export const sfxSrc = (name: string): string => {
  if ((LOCAL_SFX as readonly string[]).includes(name)) return staticFile(`sfx/${name}.wav`);
  if (REMOTE_SFX[name]) return REMOTE_SFX[name];
  if (/^https?:\/\//.test(name)) return name;
  return staticFile(name);
};
