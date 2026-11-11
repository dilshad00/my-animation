/**
 * Style-kit sheet for the "premium 2D anime" experiment — one frame per asset group.
 * Rendered as stills by `npx tsx scripts/anime-assets.ts` → renders/anime-style-kit/.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { AnimeSkyline, RooftopFence } from "../components/anime/AnimeCity";
import { AnimeGrade, GodRays, LensFlare, PETAL_PATH, SakuraPetals, Sparkles, SpeedLines } from "../components/anime/AnimeFx";
import { AnimeGirl } from "../components/anime/AnimeGirl";
import { NightSky, SunsetSky } from "../components/anime/AnimeSky";
import { ANIME } from "../components/anime/palette";
import { DISPLAY_FONT, UI_FONT } from "../components/anime/fonts";

export const ANIME_ASSET_SHEETS = ["character", "expressions", "eye", "sunset", "night", "fx", "palette"] as const;
export type AnimeSheet = (typeof ANIME_ASSET_SHEETS)[number];

const Label: React.FC<{ children: React.ReactNode; x: number; y: number; color?: string }> = ({ children, x, y, color = "#fff" }) => (
  <div style={{ position: "absolute", left: x, top: y, fontFamily: UI_FONT, fontWeight: 700, fontSize: 30, color, letterSpacing: 2, textShadow: "0 2px 8px rgba(0,0,0,.5)" }}>{children}</div>
);

const Title: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", left: 60, top: 40, fontFamily: DISPLAY_FONT, fontSize: 56, color: "#fff", textShadow: "0 4px 18px rgba(80,20,120,.8)" }}>{text}</div>
);

export const AnimeAssets: React.FC<{ sheet?: AnimeSheet }> = ({ sheet = "character" }) => {
  const f = 40;
  if (sheet === "character")
    return (
      <AbsoluteFill style={{ background: "linear-gradient(#3a2470, #b2508f 70%, #ffb37a)" }}>
        <div style={{ position: "absolute", left: 160, top: 40, width: 820, height: 984 }}><AnimeGirl frame={f} wind={0.7} id="a" /></div>
        <div style={{ position: "absolute", left: 1000, top: 40, width: 820, height: 984 }}><AnimeGirl frame={f} wind={0.7} light="night" look={[-8, 0]} tilt={-4} id="b" /></div>
        <Title text="HIKARI — main character" />
        <Label x={420} y={1000}>sunset rim light</Label>
        <Label x={1280} y={1000}>night rim light</Label>
      </AbsoluteFill>
    );
  if (sheet === "expressions") {
    const ex = [
      { name: "calm", p: {} },
      { name: "blink", p: { blink: 1 } },
      { name: "determined", p: { brow: 1, mouth: 0.5, pupil: 0.8 } },
      { name: "shout", p: { brow: 1, mouth: 1, wind: 1.6 } },
    ];
    return (
      <AbsoluteFill style={{ background: "linear-gradient(#24164f, #6b2f7f)" }}>
        <Title text="Expressions" />
        {ex.map((e, i) => (
          <div key={e.name} style={{ position: "absolute", left: 30 + i * 470, top: 150, width: 460, height: 900, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: -230, top: -80, width: 920, height: 1104 }}>
              <AnimeGirl frame={f} id={`e${i}`} {...e.p} />
            </div>
            <Label x={20} y={830}>{e.name}</Label>
          </div>
        ))}
      </AbsoluteFill>
    );
  }
  if (sheet === "eye")
    return (
      <AbsoluteFill style={{ background: ANIME.skin.base, overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 1000 * 5.4, height: 1200 * 5.4, left: 960 - 428 * 5.4, top: 560 - 375 * 5.4 }}>
          <AnimeGirl frame={f} detail id="eye" />
        </div>
        <Title text="Eye close-up (detail mode)" />
      </AbsoluteFill>
    );
  if (sheet === "sunset")
    return (
      <AbsoluteFill>
        <SunsetSky frame={f} />
        <AnimeSkyline frame={f} />
        <RooftopFence y={820} />
        <GodRays frame={f} x={1350} y={760} />
        <SakuraPetals frame={f} count={40} />
        <AnimeGrade frame={f} />
        <Title text="Sunset sky + city + rooftop" />
      </AbsoluteFill>
    );
  if (sheet === "night")
    return (
      <AbsoluteFill>
        <NightSky frame={f} shootAt={30} />
        <AnimeSkyline frame={f} night />
        <RooftopFence y={820} night />
        <AnimeGrade frame={f} warmth="#7a8cff" />
        <Title text="Night sky + city" />
      </AbsoluteFill>
    );
  if (sheet === "fx")
    return (
      <AbsoluteFill style={{ background: "#1a1240" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 960, height: 540, overflow: "hidden", background: "#e8344e" }}>
          <div style={{ width: 1920, height: 1080, transform: "scale(.5)", transformOrigin: "0 0" }}><SpeedLines frame={f} /></div>
          <Label x={20} y={480}>speed / focus lines</Label>
        </div>
        <div style={{ position: "absolute", left: 960, top: 0, width: 960, height: 540, overflow: "hidden", background: "#3a2470" }}>
          <div style={{ width: 1920, height: 1080, transform: "scale(.5)", transformOrigin: "0 0" }}><GodRays frame={f} x={960} y={300} opacity={0.6} /><LensFlare x={500} y={300} /></div>
          <Label x={20} y={480}>god rays + lens flare</Label>
        </div>
        <div style={{ position: "absolute", left: 0, top: 540, width: 960, height: 540, overflow: "hidden", background: "#5b2f7f" }}>
          <div style={{ width: 1920, height: 1080, transform: "scale(.5)", transformOrigin: "0 0" }}><SakuraPetals frame={f} count={70} size={2} /></div>
          <Label x={20} y={480}>sakura petals</Label>
        </div>
        <div style={{ position: "absolute", left: 960, top: 540, width: 960, height: 540, overflow: "hidden", background: "#0b1440" }}>
          <div style={{ width: 1920, height: 1080, transform: "scale(.5)", transformOrigin: "0 0" }}><Sparkles frame={f} count={40} size={2} /></div>
          <Label x={20} y={480}>sparkles</Label>
        </div>
      </AbsoluteFill>
    );
  // palette
  const groups: [string, string[]][] = [
    ["skin", Object.values(ANIME.skin)],
    ["hair", Object.values(ANIME.hair)],
    ["eye", Object.values(ANIME.eye)],
    ["uniform", Object.values(ANIME.uniform)],
    ["sunset", Object.values(ANIME.sunset)],
    ["night", Object.values(ANIME.night)],
    ["sakura", [...ANIME.sakura]],
  ];
  return (
    <AbsoluteFill style={{ background: "#14102a" }}>
      <Title text="Palette — 3-tone cel shading" />
      {groups.map(([name, cols], r) => (
        <div key={name} style={{ position: "absolute", left: 60, top: 160 + r * 125, display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 200, fontFamily: UI_FONT, fontSize: 30, color: "#fff", fontWeight: 700 }}>{name}</div>
          {cols.map((c) => (
            <div key={c} style={{ width: 150, height: 96, borderRadius: 14, background: c, display: "flex", alignItems: "flex-end", padding: 8, boxSizing: "border-box", fontFamily: UI_FONT, fontSize: 18, color: "#000a", fontWeight: 600 }}>{c}</div>
          ))}
        </div>
      ))}
      <svg viewBox="0 0 100 100" style={{ position: "absolute", right: 80, bottom: 80, width: 220, height: 220 }}>
        <g transform="translate(50 50) scale(2.6)"><path d={PETAL_PATH} fill={ANIME.sakura[1]} /></g>
      </svg>
    </AbsoluteFill>
  );
};
