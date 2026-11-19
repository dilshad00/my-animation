/** UG-002 graphics review reel: every graphic in script order, back-to-back over a sample backdrop. */
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Stage } from "../ug/blocks";
import { Grain, Vignette } from "../ug/fx";
import { C, INTER, MONO } from "../ug/theme";
import {
  CloudConsoleOnly,
  CONSOLES_TBC,
  CreditTag,
  IfInstalled,
  LowerThird,
  MethodCard,
  Platforms,
  PriceCard,
  RedFlags,
  RemotePlayDiagram,
  ScamTypes,
  SEARCH_HOOK_LEN,
  SearchHook,
  SubscribeNudge,
  VerdictBoard,
} from "./Gfx";

const L: React.FC<{ children: (f: number) => React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  return <>{children(f)}</>;
};

/** Stand-in for footage so overlays can be judged. */
const FakeFootage: React.FC<{ label: string }> = ({ label }) => (
  <L>
    {(f) => (
      <AbsoluteFill>
        <Stage f={f} accent="rgba(255,120,200,0.18)" x={70} y={60} />
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: MONO, fontSize: 40, color: C.mute }}>[ {label} ]</AbsoluteFill>
      </AbsoluteFill>
    )}
  </L>
);

const ITEMS: { len: number; el: React.ReactNode; name: string }[] = [
  { name: "hook", len: SEARCH_HOOK_LEN, el: <L>{(f) => <SearchHook f={f} />}</L> },
  { name: "platforms", len: 110, el: <L>{(f) => <Platforms f={f} />}</L> },
  { name: "board-all", len: 90, el: <L>{(f) => <VerdictBoard f={f} states={["?", "?", "?", "?"]} />}</L> },
  { name: "m1", len: 60, el: <L>{(f) => <MethodCard f={f} n={1} />}</L> },
  { name: "cloud", len: 130, el: <L>{(f) => <CloudConsoleOnly f={f} />}</L> },
  { name: "board-1", len: 80, el: <L>{(f) => <VerdictBoard f={f} states={["no", "?", "?", "?"]} reveal={0} />}</L> },
  { name: "m2", len: 60, el: <L>{(f) => <MethodCard f={f} n={2} />}</L> },
  { name: "board-2", len: 80, el: <L>{(f) => <VerdictBoard f={f} states={["no", "later", "?", "?"]} reveal={1} />}</L> },
  { name: "m3", len: 60, el: <L>{(f) => <MethodCard f={f} n={3} />}</L> },
  { name: "scamtypes", len: 150, el: <L>{(f) => <ScamTypes f={f} />}</L> },
  { name: "flags", len: 170, el: <L>{(f) => <RedFlags f={f} />}</L> },
  { name: "installed", len: 130, el: <L>{(f) => <IfInstalled f={f} />}</L> },
  { name: "board-3", len: 80, el: <L>{(f) => <VerdictBoard f={f} states={["no", "later", "scam", "?"]} reveal={2} />}</L> },
  { name: "m4", len: 60, el: <L>{(f) => <MethodCard f={f} n={4} />}</L> },
  { name: "remote", len: 150, el: <L>{(f) => <RemotePlayDiagram f={f} />}</L> },
  {
    name: "overlays",
    len: 160,
    el: (
      <>
        <FakeFootage label="friend's Remote Play footage" />
        <L>{(f) => <LowerThird f={f} title="PS Remote Play · Android" sub="Home Wi-Fi test" color={C.green} />}</L>
        <L>{(f) => <CreditTag f={f} text="Gameplay: @StreamerName (used with permission)" />}</L>
      </>
    ),
  },
  { name: "board-4", len: 90, el: <L>{(f) => <VerdictBoard f={f} states={["no", "later", "scam", "yes"]} reveal={3} footnote />}</L> },
  { name: "price", len: 120, el: <L>{(f) => <PriceCard f={f} consoles={CONSOLES_TBC} />}</L> },
  { name: "final", len: 90, el: <L>{(f) => <VerdictBoard f={f} states={["no", "later", "scam", "yes"]} footnote />}</L> },
  {
    name: "subscribe",
    len: 150,
    el: (
      <>
        <FakeFootage label="trailer / gameplay" />
        <L>{(f) => <SubscribeNudge f={f} text="I'll test GTA 6 on GeForce Now the day the PC version launches" />}</L>
      </>
    ),
  },
];

export const UG002_GFX_FRAMES = ITEMS.reduce((a, b) => a + b.len, 0);

export const Ug002GfxReel: React.FC = () => {
  let t = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      {ITEMS.map((it) => {
        const from = t;
        t += it.len;
        return (
          <Sequence key={it.name} from={from} durationInFrames={it.len}>
            {it.el}
            <AbsoluteFill style={{ padding: 16, fontFamily: INTER, fontSize: 18, color: "rgba(255,255,255,0.25)" }}>{it.name}</AbsoluteFill>
          </Sequence>
        );
      })}
      <Vignette strength={0.5} />
      <Grain opacity={0.06} />
    </AbsoluteFill>
  );
};
