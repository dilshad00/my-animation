/**
 * SH-PENCIL — "The pencil that overclocked a CPU" (YouTube Short).
 * Narration: Higgs Audio v2 expressive voice (public/short-pencil/audio/narration.wav).
 * Music: Kevin MacLeod (incompetech.com, CC BY 4.0). SFX: Mixkit (Mixkit License) — see public/short-pencil/CREDITS.md.
 */
import React from "react";
import { makeSheet, Mix, ShortMaster, type Bed, type SCap, type Sfx } from "../engine/Engine";
import { CAPTIONS, TOTAL_FRAMES, VO_FRAMES, VOX } from "./data";
import { BEAT_STARTS, c, Picture } from "./Scenes";

export const SH_PENCIL_FRAMES = TOTAL_FRAMES;
const S = (n: string) => `ug-006/sfx/${n}.mp3`;
const N = (n: string) => `short-pencil/sfx/${n}.mp3`;
const MU = (n: string) => `ug-006/music/${n}.mp3`;

const BEDS: Bed[] = [
  [MU("Echoes_of_Time"), 0, c("crazy") + 10, 0.2],
  [MU("Investigations"), c("crazy"), c("imagine2") + 10, 0.2],
  [MU("Lasting_Hope"), c("imagine2"), TOTAL_FRAMES, 0.22],
];
const SFX: Sfx[] = [
  // hook
  [0, S("bass_rumble"), 0.4],
  [2, S("trailer_impact"), 0.45],
  [6, N("elec_whoosh"), 0.35],
  [c("pencil"), N("elec_sparks"), 0.4],
  [c("pencil") + 3, S("deep_impact"), 0.4],
  [c("ridic"), N("elec_glitch"), 0.4],
  [c("ridic") + 6, S("ui_tone"), 0.3],
  // era
  [c("back") - 4, S("whoosh_air"), 0.35],
  [c("back") + 4, S("machine_start"), 0.3],
  [c("back") + 10, N("pc_beep"), 0.35],
  [c("real") - 3, S("whoosh_fast"), 0.35],
  [c("real") + 2, S("typing"), 0.15, 50],
  [c("some") - 2, S("sweep_cine"), 0.3],
  [c("some") + 4, S("swell"), 0.3],
  // bridges
  [c("tiny") - 2, S("whoosh_tunnel"), 0.3],
  [c("bridges"), S("click_scifi"), 0.35],
  [c("cut"), S("welding"), 0.3],
  [c("cut") + 4, N("static_crackle"), 0.25],
  [c("lock") + 6, S("gear_lock"), 0.45],
  [c("lock") + 8, S("metal_door"), 0.3],
  [c("crazy") - 2, S("glitch_rewind"), 0.4],
  [c("crazy") + 2, S("big_impact"), 0.4],
  // graphite
  [c("graphite"), S("shutter"), 0.3],
  [c("graphite") + 4, S("swell"), 0.25],
  [c("conduct"), N("pencil_write"), 0.45],
  [c("conduct") + 30, N("elec_powerup"), 0.35],
  [c("discovered") - 3, S("whoosh_metal"), 0.3],
  [c("discovered") + 10, N("pencil_short"), 0.45],
  [c("reconnect"), N("charge_hum"), 0.3],
  [c("reconnect") + 4, N("pencil_write"), 0.3],
  [c("unlock"), N("elec_shockwave"), 0.4],
  [c("unlock") + 12, S("gear_lock"), 0.4],
  // overclock
  [c("meant"), S("ui_select"), 0.3],
  [c("beyond") - 6, S("riser_heli"), 0.3],
  [c("beyond") + 24, S("whoosh_impact"), 0.4],
  [c("example"), S("bass_pulse"), 0.4],
  [c("cheap"), S("tech_slide"), 0.3],
  [c("ghz") - 8, S("riser_heli"), 0.3],
  [c("ghz") + 6, S("epic_impact"), 0.45],
  [c("massive"), S("stapler"), 0.4],
  [c("guaranteed"), N("device_fail"), 0.35],
  [c("guaranteed") + 10, S("heartbeat_impact"), 0.3],
  // modern
  [c("no") - 3, S("whoosh_fast2"), 0.35],
  [c("modern") + 10, S("hammer_metal"), 0.4],
  [c("today") - 2, S("whoosh_tunnel"), 0.35],
  [c("today"), S("computer_amb"), 0.15, c("imagine2") - c("today")],
  [c("sophisticated"), S("mech_move"), 0.3],
  // ending
  [c("imagine2"), S("swell"), 0.3],
  [c("believe") - 2, S("trailer_whoosh_hit"), 0.4],
  [VO_FRAMES, N("elec_sparks"), 0.35],
  [VO_FRAMES + 2, S("epic_impact"), 0.45],
];

/** Accent words in captions. */
const ACCENT = /^(pencil|graphite|L1|bridges|multiplier|unlocking|unlocked|electricity|overclock|duron|gigahertz|ghz|1|600|guaranteed|cooling|stability|ryzen|intel|crazy|ridiculous|believe|massive|cut|lock)$/i;
/** Hide captions while big type on screen already says the same words. */
const hideCaps = (f: number) => (f >= c("ridic") && f < c("back")) || (f >= c("crazy") && f < c("graphite")) || (f >= c("believe") && f < c("believe") + 40);
const hideChip = (f: number) => f < c("ridic") || f >= c("believe");

export const PencilShort: React.FC<{ audio?: boolean; offset?: number }> = ({ audio = true, offset = 0 }) => (
  <ShortMaster
    offset={offset}
    audio={audio}
    total={TOTAL_FRAMES}
    voFrames={VO_FRAMES}
    picture={(f) => <Picture f={f} />}
    caps={CAPTIONS as SCap[]}
    accent={ACCENT}
    hideCaps={hideCaps}
    topic="CPU · HISTORY"
    hideChip={hideChip}
    mix={<Mix narration="short-pencil/audio/narration.wav" beds={BEDS} sfx={SFX} vox={VOX} total={TOTAL_FRAMES} />}
  />
);

/** QC sheet: one still per beat (rendered via the master's frame offset). */
const SAMPLES = (() => {
  const s = [0, ...BEAT_STARTS(), VO_FRAMES];
  return s.map((a, i) => Math.min(TOTAL_FRAMES - 1, Math.round(i + 1 < s.length ? a + Math.min(30, (s[i + 1] - a) * 0.6) : a + 30)));
})();
export const SH_PENCIL_SHEET_FRAMES = SAMPLES.length;
export const PencilSheet = makeSheet(PencilShort, SAMPLES);
