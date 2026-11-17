// Video-005 objects in the premium ANIME look (cel tones + dark line + rim light).
// Registered additively in src/components/objects/registry.tsx. Names start with "z".
import React from "react";
import { random } from "remotion";
import { geoAlbersUsa, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { feature, mesh } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import usTopo from "us-atlas/states-10m.json";
import type { ObjectDef, ObjectProps } from "../../../src/components/objects/types";
import { num, str } from "../../../src/components/objects/types";
import { mix } from "../../../src/components/anime/palette";
import { useSvgId } from "../../../src/utils/svg";
import { getLength, getPointAtLength } from "@remotion/paths";

const LINE = "#1a1024";
const R = (k: string) => random(`z5o-${k}`);
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const bool = (v: unknown, d: boolean) => (typeof v === "boolean" ? v : d);
const FONT = "'Poppins', 'Arial', sans-serif";

/* ═════════════════════════ Anime zombie (bust) ═════════════════════════ */
type ZLook = { hair: string; top: string; topShade: string; kind: "shirt" | "hoodie" | "scrubs" | "medic" | "gakuran"; accent: string };
const ZLOOKS: ZLook[] = [
  { hair: "#1d1b26", top: "#e9e8dc", topShade: "#b4b3a6", kind: "shirt", accent: "#7a2a36" },
  { hair: "#4a3226", top: "#6a6f7a", topShade: "#474b55", kind: "hoodie", accent: "#9aa0aa" },
  { hair: "#2a2430", top: "#4aa59a", topShade: "#2f7a72", kind: "scrubs", accent: "#2f7a72" },
  { hair: "#5a5650", top: "#26304e", topShade: "#161c32", kind: "medic", accent: "#e8f05a" },
  { hair: "#14121c", top: "#1f2236", topShade: "#11131f", kind: "gakuran", accent: "#d8b84a" },
];
const SKIN = { base: "#bcc8b2", shadow: "#8f9d8a", deep: "#5f6d61", bruise: "#6d4e72", vein: "#55406a" };

const ZombieBust: React.FC<ObjectProps> = ({ t, props, seed }) => {
  const id = useSvgId("zb");
  const v = Math.floor(num(props.variant, Math.floor(R(`v${seed}`) * 5))) % ZLOOKS.length;
  const L = ZLOOKS[v];
  const lunge = clamp(num(props.lunge, 0));
  const reach = clamp(num(props.reach, 0));
  const glow = str(props.eyes, "dead"); // dead | glow
  const light = str(props.light, "night"); // night | red | day
  const ph = R(`p${seed}`) * 6.28;
  const sway = Math.sin(t * 1.3 + ph) * 3 + lunge * 6;
  const tilt = 12 + Math.sin(t * 0.9 + ph) * 5 - lunge * 10;
  const jaw = 0.35 + lunge * 0.65 + Math.max(0, Math.sin(t * 2.2 + ph)) * 0.15;
  const twitch = R(`tw${Math.floor(t * 6)}${seed}`) > 0.93 ? (R(`tx${Math.floor(t * 6)}`) - 0.5) * 8 : 0;
  const rim = light === "red" ? "#ff4a5a" : light === "day" ? "#f4f6e8" : "#8ff0c8";
  const look = num(props.look, 0); // -1 left … 1 right
  const eyeX = look * 10;
  const hairTufts = "M342 350 C 318 250, 372 150, 470 136 C 500 126, 528 120, 556 126 L 600 96 L 590 140 C 660 180, 690 260, 660 352 L 640 318 C 630 250, 370 250, 360 318 Z";
  const FACE = "M362 300 C 362 170, 638 170, 638 300 L 640 400 C 632 468, 566 540, 500 560 C 434 540, 368 468, 360 400 Z";
  return (
    <g transform="translate(-500 -1200)">
      <defs>
        <radialGradient id={`${id}e`}><stop offset="0" stopColor="#e9ffb0" /><stop offset="0.5" stopColor="#b6f05a" stopOpacity="0.6" /><stop offset="1" stopColor="#b6f05a" stopOpacity="0" /></radialGradient>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={SKIN.shadow} /><stop offset="0.35" stopColor={SKIN.base} /><stop offset="1" stopColor={SKIN.base} /></linearGradient>
      </defs>
      <g transform={`rotate(${sway} 500 1200) translate(${twitch} ${lunge * -40})`}>
        {/* torso / clothes */}
        <g>
          <path d="M60 1310 L 84 830 C 100 720, 250 650, 430 600 L 570 600 C 750 650, 900 720, 916 830 L 940 1310 Z" fill={L.top} stroke={LINE} strokeWidth={6} />
          <path d="M60 1310 L 84 830 C 100 720, 250 650, 430 600 L 446 640 C 320 700, 210 800, 200 1310 Z" fill={L.topShade} />
          <path d="M570 600 C 750 650, 900 720, 916 830 L 940 1310 L 912 1310 L 888 840 C 870 740, 740 680, 576 632 Z" fill={rim} opacity={0.5} />
          <g transform="translate(0 -160)">
          {/* torn hem / rips */}
          <path d="M260 1200 L 280 1150 L 300 1190 L 320 1130 L 350 1200 Z M640 1200 L 660 1120 L 690 1170 L 720 1110 L 740 1200 Z" fill="#2a2030" opacity={0.85} />
          <path d="M600 900 L 640 960 L 610 980 L 660 1040" stroke="#2a2030" strokeWidth={5} fill="none" />
          {L.kind === "shirt" ? (
            <>
              <path d="M420 760 L 500 900 L 580 760 L 560 750 L 500 860 L 440 750 Z" fill="#f7f6ee" stroke={LINE} strokeWidth={4} />
              <path d="M488 860 L 512 860 L 530 1020 L 500 1060 L 470 1020 Z" fill={L.accent} stroke={LINE} strokeWidth={4} transform="rotate(14 500 860)" />
            </>
          ) : null}
          {L.kind === "hoodie" ? <path d="M330 790 C 360 700, 640 700, 670 790 C 600 760, 400 760, 330 790 Z M470 860 L 460 980 M530 860 L 540 980" fill={L.topShade} stroke={L.accent} strokeWidth={6} /> : null}
          {L.kind === "scrubs" ? <path d="M430 760 L 500 860 L 570 760" fill="none" stroke={L.accent} strokeWidth={14} /> : null}
          {L.kind === "medic" ? (
            <>
              <rect x={200} y={980} width={600} height={40} fill={L.accent} opacity={0.95} />
              <rect x={200} y={1040} width={600} height={14} fill="#d8dce8" opacity={0.9} />
              <path d="M430 760 L 500 830 L 570 760" fill="none" stroke="#0e1222" strokeWidth={16} />
            </>
          ) : null}
          {L.kind === "gakuran" ? <>{[860, 940, 1020, 1100].map((y) => <circle key={y} cx={500} cy={y} r={11} fill={L.accent} stroke={LINE} strokeWidth={3} />)}<rect x={430} y={752} width={140} height={40} fill={L.top} stroke={LINE} strokeWidth={4} /></> : null}
          {/* dark stains */}
          <path d="M560 800 C 600 820, 640 860, 620 900 C 600 880, 570 870, 550 840 Z" fill="#3a1820" opacity={0.75} />
          <path d="M320 1000 C 340 990, 380 1010, 360 1040 C 340 1030, 320 1020, 320 1000 Z" fill="#3a1820" opacity={0.55} />
          </g>
        </g>
        {/* neck with veins + bite */}
        <path d="M452 520 L 446 622 C 480 636, 520 636, 554 622 L 548 520 Z" fill={SKIN.shadow} stroke={LINE} strokeWidth={5} />
        <path d="M470 560 C 478 580, 466 600, 472 618 M528 556 C 522 578, 536 598, 528 616" stroke={SKIN.vein} strokeWidth={4} fill="none" opacity={0.8} />
        <path d="M560 612 C 584 604, 606 620, 600 640 C 582 650, 560 640, 560 612 Z" fill="#4a1a24" />
        {/* head */}
        <g transform={`rotate(${tilt} 500 560)`}>
          <path d={FACE} fill={rim} transform="translate(-6 0)" opacity={0.85} />
          <path d={FACE} fill={`url(#${id}s)`} stroke={LINE} strokeWidth={6} />
          {/* ears */}
          <path d="M362 330 C 330 320, 326 390, 366 404 Z M638 330 C 670 320, 674 390, 634 404 Z" fill={SKIN.shadow} stroke={LINE} strokeWidth={5} />
          {/* gaunt cheek shadows */}
          <path d="M380 420 C 400 470, 430 500, 460 520 C 430 480, 410 450, 400 410 Z" fill={SKIN.deep} opacity={0.55} />
          <path d="M620 420 C 600 470, 570 500, 540 520 C 570 480, 590 450, 600 410 Z" fill={SKIN.deep} opacity={0.55} />
          {/* scratches */}
          <path d="M590 300 L 620 350 M604 292 L 632 338 M616 290 L 640 326" stroke="#6a2a34" strokeWidth={4} strokeLinecap="round" />
          {/* eyes: bruised sockets, clouded irises, pin pupils */}
          {[428, 572].map((ex, i) => (
            <g key={ex}>
              <ellipse cx={ex} cy={392} rx={66} ry={50} fill={SKIN.bruise} opacity={0.55} />
              <path d={`M${ex - 50} 380 C ${ex - 30} 350, ${ex + 30} 350, ${ex + 50} 380 C ${ex + 30} 404, ${ex - 30} 404, ${ex - 50} 380 Z`} fill="#e3e8c8" stroke={LINE} strokeWidth={5} />
              <circle cx={ex + eyeX + (i ? -4 : 4)} cy={380} r={21} fill={glow === "glow" ? "#d6ff6a" : "#c3cbb0"} stroke="#7f8a70" strokeWidth={3} />
              <circle cx={ex + eyeX + (i ? -4 : 4)} cy={380} r={4} fill="#2a1a20" />
              {glow === "glow" ? <circle cx={ex + eyeX} cy={380} r={60} fill={`url(#${id}e)`} /> : null}
              {/* heavy lids + angry brow */}
              <path d={`M${ex - 56} 372 C ${ex - 30} ${i ? 342 : 352}, ${ex + 30} ${i ? 352 : 342}, ${ex + 56} 372`} stroke={LINE} strokeWidth={8} fill="none" strokeLinecap="round" />
              <path d={i ? `M${ex - 48} 340 L ${ex + 44} 326` : `M${ex - 44} 326 L ${ex + 48} 340`} stroke={mix(L.hair, "#000000", 0.2)} strokeWidth={11} strokeLinecap="round" />
            </g>
          ))}
          {/* nose */}
          <path d="M500 410 L 492 455 L 506 458" stroke={SKIN.deep} strokeWidth={4} fill="none" />
          {/* slack jaw */}
          <g transform={`translate(500 ${492 + jaw * 6})`}>
            <path d={`M-46 0 C -40 ${-8}, 40 ${-8}, 46 0 C 40 ${18 + jaw * 46}, -40 ${18 + jaw * 46}, -46 0 Z`} fill="#2a0e16" stroke={LINE} strokeWidth={5} />
            <path d="M-38 -2 L -30 10 L -22 -2 L -12 12 L -2 -2 L 8 12 L 18 -2 L 28 10 L 38 -2 Z" fill="#e9e2c4" />
            <path d={`M-30 ${14 + jaw * 40} L -20 ${4 + jaw * 40} L -8 ${14 + jaw * 40} L 6 ${4 + jaw * 40} L 18 ${14 + jaw * 40} L 30 ${4 + jaw * 40}`} fill="#d8d0b0" opacity={jaw > 0.4 ? 1 : 0} />
          </g>
          {/* messy hair */}
          <path d={hairTufts} fill={L.hair} stroke={LINE} strokeWidth={5} />
          <path d="M380 300 L 400 250 L 420 300 M560 296 L 590 245 L 610 300" stroke={mix(L.hair, "#ffffff", 0.25)} strokeWidth={6} fill="none" />
          <path d="M360 330 C 352 380, 356 420, 368 450 L 380 340 Z M640 330 C 648 380, 644 420, 632 450 L 620 340 Z" fill={L.hair} />
          <path d="M356 312 C 370 205, 630 205, 644 312 L 628 300 L 612 352 L 588 296 L 560 340 L 536 290 L 508 346 L 484 292 L 452 338 L 432 294 L 404 344 L 392 298 L 370 336 Z" fill={L.hair} stroke={LINE} strokeWidth={5} strokeLinejoin="round" />
          <path d="M410 200 C 430 180, 470 168, 500 166" stroke={mix(L.hair, "#ffffff", 0.3)} strokeWidth={8} fill="none" strokeLinecap="round" />
        </g>
      </g>
      {/* reaching hands rising into frame */}
      {reach > 0 ? [-1, 1].map((s) => {
        const up = (1 - reach) * 500 + Math.sin(t * 2 + s) * 14;
        return (
          <g key={s} transform={`translate(${500 + s * 300} ${1000 + up}) rotate(${s * -18})`}>
            <path d="M-50 260 L -40 40 L 40 40 L 50 260 Z" fill={L.top} stroke={LINE} strokeWidth={5} />
            <path d="M-46 50 C -60 0, -50 -60, -40 -90 L -26 -150 L -12 -90 L -4 -170 L 10 -92 L 22 -160 L 32 -86 L 48 -130 L 50 -60 C 60 -20, 50 20, 46 50 Z" fill={SKIN.base} stroke={LINE} strokeWidth={5} />
            <path d="M-20 0 C 0 10, 20 10, 36 -4" stroke={SKIN.deep} strokeWidth={4} fill="none" />
          </g>
        );
      }) : null}
    </g>
  );
};

/* ═════════════════════════ Horde (row of shambling figures) ═════════════════════════ */
const Horde: React.FC<ObjectProps> = ({ t, props, seed, color }) => {
  const n = Math.round(num(props.n, 9));
  const w = num(props.width, 1400);
  const eyes = str(props.eyes, "");
  const walk = num(props.walk, 1);
  const c = color ?? "#14101e";
  const c2 = mix(c, "#5a6a5a", 0.25);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const depth = R(`hd${seed}${i}`);
        const x = -w / 2 + (i + R(`hx${seed}${i}`) * 0.7) * (w / n);
        const s = 0.7 + depth * 0.5;
        const ph = R(`hp${seed}${i}`) * 6.28;
        const step = Math.sin(t * 3 * walk + ph) * 10 * walk;
        const lean = 10 + Math.sin(t * 1.4 + ph) * 5;
        const arm = R(`ha${seed}${i}`) > 0.45;
        const col = depth > 0.5 ? c : c2;
        return (
          <g key={i} transform={`translate(${x + Math.sin(t * 0.7 + ph) * 8} ${-depth * 30}) scale(${s})`}>
            <ellipse cx={0} cy={0} rx={46} ry={8} fill="#000" opacity={0.3} />
            <g transform={`rotate(${lean})`}>
              <path d={`M-24 0 L ${-14 + step} -150 L 14 -150 L ${24 - step} 0 Z`} fill={col} />
              <path d="M-38 -150 C -42 -230, -28 -270, 0 -274 C 28 -270, 42 -230, 38 -150 Z" fill={col} />
              <path d="M-30 -160 L -20 -200 L -8 -170 L 6 -210 L 18 -168 L 30 -196 L 34 -150 Z" fill={mix(col, "#000000", 0.3)} />
              <ellipse cx={6} cy={-302} rx={30} ry={34} fill={col} />
              <path d="M-26 -312 C -24 -344, 30 -350, 38 -314 L 30 -322 L 22 -308 L 12 -326 L 2 -310 L -8 -324 L -16 -306 Z" fill={col} />
              {arm ? <path d={`M20 -250 L 100 ${-238 + step} L 104 ${-224 + step} L 22 -226 Z`} fill={col} /> : <path d="M26 -250 L 44 -160 L 30 -156 L 14 -236 Z" fill={col} />}
              {arm ? <path d={`M10 -244 L 86 ${-212 - step * 0.6} L 88 ${-198 - step * 0.6} L 8 -222 Z`} fill={mix(col, "#000000", 0.25)} /> : null}
              {eyes ? <><circle cx={0} cy={-306} r={4} fill={eyes} /><circle cx={18} cy={-306} r={4} fill={eyes} /><circle cx={9} cy={-306} r={16} fill={eyes} opacity={0.2} /></> : null}
            </g>
          </g>
        );
      })}
    </g>
  );
};

/* ═════════════════════════ Phone with story screens ═════════════════════════ */
const Phone: React.FC<ObjectProps> = ({ t, local, props }) => {
  const id = useSvgId("zp");
  const screen = str(props.screen, "video"); // video | views | alert | chat | static | radio
  const views = num(props.views, 0);
  const W = 420, H = 840;
  const pulse = (Math.sin(local * 8) + 1) / 2;
  const glowC = screen === "alert" ? "#ff3b4a" : "#8fd0ff";
  const chatText = str(props.text, "lol is this real?? 💀");
  return (
    <g>
      <defs>
        <clipPath id={`${id}c`}><rect x={-W / 2 + 20} y={-H / 2 + 24} width={W - 40} height={H - 48} rx={30} /></clipPath>
        <radialGradient id={`${id}g`}><stop offset="0" stopColor={glowC} stopOpacity="0.45" /><stop offset="1" stopColor={glowC} stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx={0} cy={0} rx={W} ry={H * 0.7} fill={`url(#${id}g)`} opacity={screen === "alert" ? 0.6 + 0.4 * pulse : 0.8} />
      <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={52} fill="#14141c" stroke={LINE} strokeWidth={6} />
      <rect x={-W / 2 + 4} y={-H / 2 + 4} width={10} height={H - 80} rx={5} fill="#ffffff" opacity={0.15} />
      <g clipPath={`url(#${id}c)`}>
        <rect x={-W / 2} y={-H / 2} width={W} height={H} fill={screen === "alert" ? "#2a0a10" : "#0e1428"} />
        {screen === "video" || screen === "views" ? (
          <g>
            {/* shaky footage: ambulance bay, two struggling silhouettes */}
            <g transform={`translate(${Math.sin(local * 23) * 6} ${Math.cos(local * 19) * 5 - 120})`}>
              <rect x={-190} y={-150} width={380} height={300} fill="#3a4a5a" />
              <rect x={-190} y={60} width={380} height={90} fill="#24303c" />
              <rect x={60} y={-90} width={130} height={150} fill="#d8e0e8" />
              <rect x={70} y={-60} width={50} height={30} fill="#ff4a5a" opacity={Math.floor(local * 4) % 2 ? 1 : 0.3} />
              <g transform={`translate(-40 60) rotate(${Math.sin(local * 9) * 8})`}>
                <path d="M-20 0 L -12 -90 L 12 -90 L 20 0 Z M-26 -90 C -26 -130, 26 -130, 26 -90 Z" fill="#e8ece8" />
                <circle cx={4} cy={-142} r={18} fill="#c8c0b0" />
              </g>
              <g transform={`translate(20 66) rotate(${-14 + Math.sin(local * 9 + 1) * 10})`}>
                <path d="M-20 0 L -12 -90 L 12 -90 L 20 0 Z M-26 -90 C -26 -130, 26 -130, 26 -90 Z" fill="#20305a" />
                <rect x={-26} y={-70} width={52} height={8} fill="#e8f05a" />
                <circle cx={-2} cy={-142} r={18} fill="#e8c8a8" />
              </g>
            </g>
            <rect x={-190} y={60} width={380} height={6} fill="#ffffff" opacity={0.6} />
            <rect x={-190} y={60} width={380 * ((local * 0.1) % 1)} height={6} fill="#ff3b4a" />
            <text x={-180} y={110} fontSize={26} fontWeight={700} fill="#fff" fontFamily={FONT}>Man BITES paramedic?!</text>
            <text x={-180} y={150} fontSize={22} fill="#a8b4c8" fontFamily={FONT}>{screen === "views" ? `${Math.round(views).toLocaleString("en-US")} views` : "2.1M views · 1 hour ago"}</text>
            {[0, 1, 2].map((k) => <rect key={k} x={-180} y={180 + k * 60} width={360} height={44} rx={10} fill="#1c2440" />)}
            <text x={-166} y={210} fontSize={20} fill="#cfd8f0" fontFamily={FONT}>"it's a movie promo"</text>
            <text x={-166} y={270} fontSize={20} fill="#cfd8f0" fontFamily={FONT}>"fake. 100% fake"</text>
            <text x={-166} y={330} fontSize={20} fill="#ffb0b8" fontFamily={FONT}>"same thing on my street"</text>
          </g>
        ) : null}
        {screen === "alert" ? (
          <g>
            <rect x={-180} y={-300} width={360} height={420} rx={24} fill="#f4f0f2" />
            <rect x={-180} y={-300} width={360} height={90} rx={24} fill="#d8202e" />
            <path d="M-150 -232 L -120 -282 L -90 -232 Z" fill="#fff" />
            <text x={-118} y={-240} textAnchor="middle" fontSize={34} fontWeight={900} fill="#d8202e" fontFamily={FONT}>!</text>
            <text x={-74} y={-244} fontSize={30} fontWeight={800} fill="#fff" fontFamily={FONT}>EMERGENCY</text>
            {str(props.text, "STAY INDOORS.|LOCK YOUR DOORS.|AVOID CONTACT WITH|ANYONE SHOWING|EXTREME AGGRESSION.").split("|").map((line, k) => (
              <text key={k} x={-160} y={-160 + k * 50} fontSize={28} fontWeight={k < 2 ? 800 : 600} fill="#1a1020" fontFamily={FONT}>{line}</text>
            ))}
            <rect x={-150} y={180} width={300} height={70} rx={35} fill="#d8202e" opacity={0.6 + 0.4 * pulse} />
            <text x={0} y={226} textAnchor="middle" fontSize={30} fontWeight={800} fill="#fff" fontFamily={FONT}>OK</text>
          </g>
        ) : null}
        {screen === "chat" ? (
          <g>
            <rect x={-W / 2} y={-H / 2} width={W} height={120} fill="#1c2440" />
            <circle cx={-130} cy={-330} r={30} fill="#c98a5a" />
            <text x={-86} y={-322} fontSize={30} fontWeight={700} fill="#fff" fontFamily={FONT}>Ren</text>
            <rect x={-180} y={-220} width={300} height={170} rx={24} fill="#2a3458" />
            <rect x={-170} y={-210} width={280} height={110} rx={14} fill="#3a4a5a" />
            <path d="M-50 -180 L -50 -130 L -10 -155 Z" fill="#fff" />
            <text x={-160} y={-66} fontSize={22} fill="#dfe6ff" fontFamily={FONT}>dude look at this</text>
            {local > 0.8 ? (
              <g>
                <rect x={-10} y={-20} width={190} height={70} rx={24} fill="#6a5cff" />
                <text x={86} y={28} textAnchor="middle" fontSize={34} fontFamily="'Segoe UI Emoji', 'Apple Color Emoji', sans-serif">💀</text>
              </g>
            ) : null}
            {local > 1.5 ? <text x={170} y={90} textAnchor="end" fontSize={18} fill="#8a94b8" fontFamily={FONT}>{chatText.includes("💀") ? "Read 11:48 PM" : chatText}</text> : null}
          </g>
        ) : null}
        {screen === "static" ? Array.from({ length: 80 }, (_, k) => <rect key={k} x={-200 + R(`st${k}${Math.floor(t * 12)}`) * 400} y={-420 + k * 10.5} width={60 + R(`sw${k}${Math.floor(t * 12)}`) * 260} height={5} fill="#cfd4e0" opacity={0.15 + R(`so${k}${Math.floor(t * 12)}`) * 0.4} />) : null}
        {screen === "nosignal" ? (
          <g>
            <text x={0} y={-20} textAnchor="middle" fontSize={34} fontWeight={800} fill="#ff8a94" fontFamily={FONT}>NO SERVICE</text>
            {[0, 1, 2, 3].map((k) => <rect key={k} x={-60 + k * 34} y={40 - k * 20} width={22} height={30 + k * 20} rx={4} fill="#3a4058" />)}
            <line x1={-80} y1={80} x2={80} y2={-60} stroke="#ff4a5a" strokeWidth={10} />
          </g>
        ) : null}
      </g>
      <rect x={-50} y={-H / 2 + 16} width={100} height={22} rx={11} fill="#05050a" />
    </g>
  );
};

/* ═════════════════════════ TV-style emergency banner ═════════════════════════ */
const AlertBanner: React.FC<ObjectProps> = ({ local, props }) => {
  const text = str(props.text, "EMERGENCY ALERT");
  const sub = str(props.sub, "A serious outbreak has been reported in your area");
  const w = num(props.width, 1500);
  const slide = clamp(local * 3);
  const pulse = (Math.sin(local * 7) + 1) / 2;
  return (
    <g transform={`translate(${(1 - slide) * -w} 0)`}>
      <rect x={-w / 2} y={-90} width={w} height={180} fill="#14060c" opacity={0.9} />
      <rect x={-w / 2} y={-90} width={260} height={180} fill="#d8202e" opacity={0.8 + 0.2 * pulse} />
      <path d={`M${-w / 2 + 80} 40 L ${-w / 2 + 130} -50 L ${-w / 2 + 180} 40 Z`} fill="#fff" />
      <text x={-w / 2 + 130} y={28} textAnchor="middle" fontSize={56} fontWeight={900} fill="#d8202e" fontFamily={FONT}>!</text>
      <text x={-w / 2 + 300} y={-10} fontSize={64} fontWeight={900} fill="#ffffff" fontFamily={FONT} letterSpacing={4}>{text}</text>
      <text x={-w / 2 + 302} y={56} fontSize={34} fontWeight={600} fill="#ffb0b8" fontFamily={FONT}>{sub}</text>
      <rect x={-w / 2} y={86} width={w} height={8} fill="#d8202e" />
    </g>
  );
};

/* ═════════════════════════ Old battery radio ═════════════════════════ */
const Radio: React.FC<ObjectProps> = ({ t, props }) => {
  const on = num(props.on, 1);
  const signal = num(props.signal, 0); // 0 static … 1 clear voice
  const dial = num(props.dial, 0.3 + Math.sin(t * 0.5) * 0.05);
  return (
    <g>
      <ellipse cx={0} cy={0} rx={260} ry={22} fill="#000" opacity={0.3} />
      <line x1={150} y1={-250} x2={300} y2={-560} stroke="#b8bcc8" strokeWidth={8} />
      <circle cx={300} cy={-560} r={10} fill="#d8dce8" />
      <rect x={-250} y={-260} width={500} height={260} rx={30} fill="#8a3a2a" stroke={LINE} strokeWidth={6} />
      <rect x={-250} y={-260} width={500} height={50} rx={24} fill="#a8503a" />
      <rect x={-220} y={-200} width={240} height={170} rx={16} fill="#3a2420" />
      {Array.from({ length: 9 }, (_, i) => <line key={i} x1={-205} y1={-185 + i * 18} x2={5} y2={-185 + i * 18} stroke="#1a100e" strokeWidth={6} />)}
      <rect x={50} y={-200} width={170} height={70} rx={10} fill={on ? "#ffd27a" : "#4a3a2a"} opacity={on ? 0.9 : 1} />
      {Array.from({ length: 9 }, (_, i) => <line key={i} x1={66 + i * 17} y1={-196} x2={66 + i * 17} y2={-180} stroke="#5a3a1a" strokeWidth={3} />)}
      <line x1={60 + dial * 150} y1={-200} x2={60 + dial * 150} y2={-130} stroke="#d8202e" strokeWidth={5} />
      <circle cx={95} cy={-75} r={34} fill="#2a1a18" stroke={LINE} strokeWidth={4} />
      <circle cx={185} cy={-75} r={34} fill="#2a1a18" stroke={LINE} strokeWidth={4} />
      <line x1={95} y1={-75} x2={95 + Math.cos(dial * 6) * 26} y2={-75 + Math.sin(dial * 6) * 26} stroke="#d8c8a8" strokeWidth={5} />
      {/* sound waves: jagged (static) → smooth (voice) */}
      {on > 0 ? [1, 2, 3].map((k) => (
        <path key={k} d={`M${-280 - k * 50} ${-200 + k * 0} ${Array.from({ length: 10 }, (_, j) => `L ${-280 - k * 50 - (signal > 0.5 ? Math.sin(j * 0.6 + t * 6) * 10 : (R(`rw${k}${j}${Math.floor(t * 15)}`) - 0.5) * 30)} ${-200 + j * 22}`).join(" ")}`}
          stroke={signal > 0.5 ? "#9affd0" : "#cfd4e0"} strokeWidth={5} fill="none" opacity={(0.8 - k * 0.2) * on} />
      )) : null}
    </g>
  );
};

/* ═════════════════════════ Rabies virion (bullet-shaped) ═════════════════════════ */
const Virus: React.FC<ObjectProps> = ({ t, props, color }) => {
  const c = color ?? "#9a6ad8";
  const rot = num(props.rot, Math.sin(t * 0.6) * 12);
  const spikes = 18;
  return (
    <g transform={`rotate(${rot})`}>
      <ellipse cx={0} cy={0} rx={320} ry={170} fill={c} opacity={0.18} />
      {Array.from({ length: spikes }, (_, i) => {
        const x = -170 + (i / (spikes - 1)) * 300;
        return [-1, 1].map((s) => <g key={`${i}${s}`}><line x1={x} y1={s * 95} x2={x + 4} y2={s * (135 + Math.sin(t * 3 + i) * 4)} stroke={mix(c, "#000000", 0.3)} strokeWidth={6} /><circle cx={x + 4} cy={s * (140 + Math.sin(t * 3 + i) * 4)} r={11} fill="#ffd36a" stroke={LINE} strokeWidth={3} /></g>);
      })}
      {/* rounded tip right, flat base left */}
      <path d="M-180 -100 L 120 -100 C 220 -100, 230 100, 120 100 L -180 100 Z" fill={c} stroke={LINE} strokeWidth={7} />
      <path d="M-180 -100 L 120 -100 C 200 -100, 220 -40, 210 -20 C 160 -70, 0 -70, -180 -60 Z" fill={mix(c, "#ffffff", 0.35)} />
      {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${-150 + i * 34} -86 C ${-140 + i * 34} -30, ${-140 + i * 34} 30, ${-150 + i * 34} 86`} stroke={mix(c, "#000000", 0.35)} strokeWidth={5} fill="none" />)}
      <path d="M-180 -100 L -180 100" stroke={LINE} strokeWidth={10} />
    </g>
  );
};

/* ═════════════════════════ Zombie-ant fungus: ant clamped on a leaf, stalk grows ═════════════════════════ */
const AntFungus: React.FC<ObjectProps> = ({ t, props }) => {
  const grow = clamp(num(props.grow, 1));
  const spores = num(props.spores, grow > 0.9 ? 1 : 0);
  const stalkH = 320 * grow;
  return (
    <g>
      {/* stem + leaf (vein underside) */}
      <path d="M-500 120 C -300 60, -100 40, 0 20" stroke="#4a7a3a" strokeWidth={22} fill="none" />
      <path d="M-200 60 C -60 -160, 300 -200, 520 -40 C 300 120, 0 140, -200 60 Z" fill="#5aa04a" stroke={LINE} strokeWidth={6} />
      <path d="M-200 60 C 0 -40, 300 -60, 520 -40" stroke="#3e7a32" strokeWidth={8} fill="none" />
      {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${-60 + i * 110} ${-10 - i * 12} l 60 -70 M${-60 + i * 110} ${-6 - i * 12} l 70 50`} stroke="#3e7a32" strokeWidth={4} />)}
      {/* ant hanging under the vein, jaws clamped */}
      <g transform="translate(120 -10) rotate(8)">
        <ellipse cx={-90} cy={40} rx={70} ry={46} fill="#2a1a12" stroke={LINE} strokeWidth={4} />
        <ellipse cx={-10} cy={30} rx={40} ry={26} fill="#3a2418" />
        <circle cx={52} cy={14} r={36} fill="#3a2418" stroke={LINE} strokeWidth={4} />
        <path d="M80 0 L 104 -26 M78 10 L 108 -14" stroke="#1a0e08" strokeWidth={8} strokeLinecap="round" />
        {[-1, 0, 1].map((k) => <path key={k} d={`M${-20 + k * 30} 50 L ${-50 + k * 46} 120 L ${-80 + k * 50} 150`} stroke="#1a0e08" strokeWidth={7} fill="none" />)}
        <path d="M60 -16 C 70 -60, 100 -80, 130 -90 M44 -18 C 40 -60, 50 -100, 70 -120" stroke="#1a0e08" strokeWidth={5} fill="none" />
        {/* fungal stalk from the back of the head */}
        {grow > 0 ? (
          <g>
            <path d={`M50 -16 C ${40 + Math.sin(t) * 4} ${-stalkH * 0.4}, ${70} ${-stalkH * 0.7}, ${60 + Math.sin(t * 0.8) * 6} ${-stalkH}`} stroke="#d8c8a0" strokeWidth={14 + 6 * grow} fill="none" strokeLinecap="round" />
            <ellipse cx={60 + Math.sin(t * 0.8) * 6} cy={-stalkH * 0.72} rx={20 * grow} ry={34 * grow} fill="#c89a5a" stroke={LINE} strokeWidth={3} />
            {/* white mycelium on the joints */}
            {[[-120, 40], [-60, 60], [20, 40], [-90, 10]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={14 * grow} fill="#f4f0e4" opacity={0.85} />)}
          </g>
        ) : null}
        {spores > 0 ? Array.from({ length: 30 }, (_, i) => {
          const k = (t * 0.25 + R(`sp${i}`)) % 1;
          return <circle key={i} cx={60 + (R(`sx${i}`) - 0.5) * 400 * k} cy={-stalkH * 0.72 + k * 520} r={4 + R(`sr${i}`) * 4} fill="#f4e8c0" opacity={(1 - k) * 0.8 * spores} />;
        }) : null}
      </g>
    </g>
  );
};

/* ═════════════════════════ Bite → nerve → brain path ═════════════════════════ */
const NervePath: React.FC<ObjectProps> = ({ t, props }) => {
  const k = clamp(num(props.k, (t * 0.2) % 1));
  const arm = "M-640 360 C -500 340, -380 300, -300 240 C -200 160, -130 40, -80 -60 C -40 -140, 0 -200, 40 -230";
  return (
    <g>
      {/* side silhouette: head, neck, arm */}
      <path d="M-760 330 C -600 300, -420 280, -300 210 L -180 120 C -120 60, -100 0, -110 -60 C -150 -110, -140 -190, -90 -250 C -20 -330, 120 -330, 190 -260 C 250 -200, 250 -100, 210 -40 C 190 -10, 200 30, 190 60 L 140 70 C 120 120, 100 160, 60 180 L -100 220 C -260 330, -500 420, -760 440 Z" fill="#2a3458" stroke="#8fb0ff" strokeWidth={4} opacity={0.95} />
      {/* brain */}
      <path d="M-80 -230 C -60 -300, 120 -310, 170 -230 C 210 -170, 180 -110, 120 -110 C 60 -100, -60 -120, -80 -170 Z" fill="#ff8ab0" opacity={0.25 + 0.55 * clamp((k - 0.8) / 0.2)} stroke="#ff8ab0" strokeWidth={4} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${-50 + i * 60} -270 C ${-30 + i * 60} -230, ${-60 + i * 60} -180, ${-30 + i * 60} -140`} stroke="#ff8ab0" strokeWidth={3} fill="none" opacity={0.6} />)}
      {/* nerve line, travelled part glowing */}
      <path d={arm} stroke="#5a6aa8" strokeWidth={8} fill="none" strokeDasharray="14 10" />
      <path d={arm} stroke="#ffe36a" strokeWidth={10} fill="none" pathLength={1} strokeDasharray={`${k} 1`} />
      {/* bite mark */}
      <g transform="translate(-640 360)">
        <circle r={36} fill="#ff4a5a" opacity={0.3 + 0.2 * Math.sin(t * 6)} />
        {[-14, 0, 14].map((x) => <circle key={x} cx={x} cy={-8} r={5} fill="#ff4a5a" />)}
        {[-10, 10].map((x) => <circle key={x} cx={x} cy={10} r={5} fill="#ff4a5a" />)}
      </g>
      {/* travelling virus dot */}
      {(() => {
        const pt = getPointAtLength(arm, getLength(arm) * k) ?? { x: -640, y: 360 };
        return <><circle cx={pt.x} cy={pt.y} r={34} fill="#ffe36a" opacity={0.3} /><circle cx={pt.x} cy={pt.y} r={18} fill="#ffe36a" /></>;
      })()}
    </g>
  );
};

/* ═════════════════════════ S → Z → R compartments ═════════════════════════ */
const SZR: React.FC<ObjectProps> = ({ t, props }) => {
  const k = clamp(num(props.k, 0)); // 0 start … 1 zombies win
  const S = Math.round(100 * (1 - k)), Z = Math.round(100 * k * (1 - k * 0.3)), Rm = 100 - S - Z;
  const boxes = [
    { x: -560, label: "SUSCEPTIBLE", sub: "can still be infected", c: "#5ab0ff", v: S },
    { x: 0, label: "ZOMBIE", sub: "infected and hunting", c: "#9ae05a", v: Z },
    { x: 560, label: "REMOVED", sub: "gone for good", c: "#b0a8c8", v: Rm },
  ];
  return (
    <g>
      {boxes.map((b, i) => (
        <g key={i} transform={`translate(${b.x} 0)`}>
          <rect x={-210} y={-170} width={420} height={340} rx={30} fill="#141a34" stroke={b.c} strokeWidth={6} />
          <text x={0} y={-100} textAnchor="middle" fontSize={44} fontWeight={800} fill={b.c} fontFamily={FONT}>{["S", "Z", "R"][i]}</text>
          <text x={0} y={-50} textAnchor="middle" fontSize={30} fontWeight={800} fill="#fff" fontFamily={FONT}>{b.label}</text>
          <text x={0} y={-12} textAnchor="middle" fontSize={22} fill="#a8b0d0" fontFamily={FONT}>{b.sub}</text>
          {Array.from({ length: 20 }, (_, j) => {
            const filled = j < Math.round(b.v / 5);
            return <circle key={j} cx={-160 + (j % 10) * 35} cy={50 + Math.floor(j / 10) * 50} r={13} fill={filled ? b.c : "#2a3050"} />;
          })}
          {i < 2 ? (
            <g transform="translate(280 0)">
              <path d="M-50 -14 L 30 -14 L 30 -36 L 66 0 L 30 36 L 30 14 L -50 14 Z" fill="#ffe36a" opacity={0.6 + 0.4 * Math.sin(t * 4 + i)} />
              <text x={8} y={-50} textAnchor="middle" fontSize={22} fill="#ffe36a" fontFamily={FONT}>{i === 0 ? "bite" : "killed"}</text>
            </g>
          ) : null}
        </g>
      ))}
    </g>
  );
};

/* ═════════════════════════ Doubling tree 1 → 2 → 4 → … ═════════════════════════ */
const Doubling: React.FC<ObjectProps> = ({ props }) => {
  const levels = clamp(num(props.levels, 4), 0, 6);
  const shown = Math.floor(levels);
  const part = levels - shown;
  const counter = num(props.counter, -1);
  const rows = 6;
  const H = 720, W = 1500;
  const nodes: React.ReactNode[] = [];
  for (let r = 0; r <= Math.min(rows - 1, shown); r++) {
    const n = 2 ** r;
    const a = r < shown ? 1 : part > 0 || r === 0 ? Math.max(part, r === 0 ? 1 : 0) : 0;
    for (let i = 0; i < n; i++) {
      const x = -W / 2 + ((i + 0.5) / n) * W;
      const y = -H / 2 + (r / (rows - 1)) * H;
      if (r > 0) {
        const px = -W / 2 + ((Math.floor(i / 2) + 0.5) / (n / 2)) * W;
        const py = -H / 2 + ((r - 1) / (rows - 1)) * H;
        nodes.push(<line key={`l${r}${i}`} x1={px} y1={py + 20} x2={px + (x - px) * a} y2={py + 20 + (y - py - 40) * a} stroke="#9ae05a" strokeWidth={Math.max(2, 6 - r)} opacity={0.7} />);
      }
      const s = Math.max(0.35, 1 - r * 0.13) * a;
      nodes.push(
        <g key={`n${r}${i}`} transform={`translate(${x} ${y}) scale(${s})`}>
          <circle r={26} fill={r === 0 ? "#ff4a5a" : "#9ae05a"} stroke={LINE} strokeWidth={4} />
          <circle cx={-8} cy={-4} r={4} fill={LINE} /><circle cx={8} cy={-4} r={4} fill={LINE} />
          <path d="M-9 10 L 9 10" stroke={LINE} strokeWidth={3} />
        </g>,
      );
    }
  }
  const total = counter >= 0 ? counter : 2 ** Math.max(0, Math.round(levels));
  return (
    <g>
      {nodes}
      <text x={W / 2 + 40} y={H / 2 - 10} fontSize={74} fontWeight={900} fill="#ffffff" fontFamily={FONT} textAnchor="start">{Math.round(total).toLocaleString("en-US")}</text>
    </g>
  );
};

/* ═════════════════════════ R-zero: one person → n new infections ═════════════════════════ */
const RZero: React.FC<ObjectProps> = ({ t, local, props }) => {
  const n = Math.round(num(props.n, 3));
  const label = str(props.label, "R₀");
  const person = (c: string) => <g><circle cy={-70} r={26} fill={c} /><path d="M-34 0 C -34 -40, 34 -40, 34 0 Z" fill={c} /></g>;
  return (
    <g>
      <g transform="translate(-420 30) scale(1.6)">{person("#ff4a5a")}</g>
      {Array.from({ length: n }, (_, i) => {
        const a = (i - (n - 1) / 2) * (Math.PI / Math.max(4, n + 1));
        const x = 200 + Math.cos(a) * 260, y = Math.sin(a) * 300;
        const k = clamp((local - i * 0.25) * 2);
        return (
          <g key={i}>
            <line x1={-330} y1={-30} x2={-330 + (x - 60 + 330) * k} y2={-30 + (y - 30 + 30) * k} stroke="#ffe36a" strokeWidth={6} strokeDasharray="16 10" strokeDashoffset={-t * 60} />
            <g transform={`translate(${x} ${y + 30}) scale(${k})`}>{person("#9ae05a")}</g>
          </g>
        );
      })}
      <text x={-420} y={150} textAnchor="middle" fontSize={56} fontWeight={900} fill="#fff" fontFamily={FONT}>{`${label} = ${n}`}</text>
    </g>
  );
};

/* ═════════════════════════ US spread map (Cornell-style simulation) ═════════════════════════ */
type St = { name: string; d: string; c: [number, number] };
let US: { states: St[]; borders: string; nation: string } | null = null;
const proj = geoAlbersUsa().scale(1900).translate([0, 0]);
const usGeo = () => {
  if (US) return US;
  const pg = geoPath(proj);
  const u = usTopo as unknown as Topology<{ states: GeometryCollection<{ name: string }>; nation: GeometryCollection }>;
  const fc = feature(u, u.objects.states) as unknown as { features: { properties: { name: string }; geometry: unknown }[] };
  US = {
    states: fc.features.map((f) => ({ name: f.properties.name, d: pg(f as unknown as GeoPermissibleObjects) ?? "", c: pg.centroid(f as unknown as GeoPermissibleObjects) as [number, number] })),
    borders: pg(mesh(u, u.objects.states, (a, b) => a !== b)) ?? "",
    nation: pg(feature(u, u.objects.nation) as never) ?? "",
  };
  return US;
};
const CITIES: [string, number, number, number][] = [
  // name, lon, lat, size
  ["New York", -74.0, 40.7, 1], ["Los Angeles", -118.2, 34.05, 0.9], ["Chicago", -87.6, 41.9, 0.8], ["Houston", -95.4, 29.8, 0.7], ["Atlanta", -84.4, 33.75, 0.6],
  ["Philadelphia", -75.2, 39.95, 0.6], ["Dallas", -96.8, 32.8, 0.6], ["Miami", -80.2, 25.8, 0.6], ["San Francisco", -122.4, 37.8, 0.6], ["Seattle", -122.3, 47.6, 0.5],
  ["Washington", -77.0, 38.9, 0.6], ["Boston", -71.06, 42.36, 0.5], ["Detroit", -83.0, 42.3, 0.5], ["Phoenix", -112.1, 33.45, 0.5], ["Denver", -105.0, 39.7, 0.4],
];
const SPARSE: Record<string, number> = { Montana: 1, Wyoming: 0.95, Nevada: 0.85, Idaho: 0.8, "North Dakota": 0.8, "South Dakota": 0.8, Alaska: 1, "New Mexico": 0.6, Utah: 0.55, Nebraska: 0.6, Oregon: 0.35, Colorado: 0.35, Kansas: 0.45, Maine: 0.5, Vermont: 0.45, Arizona: 0.3 };
const USSpread: React.FC<ObjectProps> = ({ t, props }) => {
  const spread = clamp(num(props.spread, 0.5));
  const safe = bool(props.safe, false);
  const showCities = bool(props.cities, true);
  const g = usGeo();
  const cityXY = CITIES.map(([n, lon, lat, s]) => ({ n, s, xy: proj([lon, lat]) ?? [0, 0] }));
  return (
    <g>
      <path d={g.nation} fill="#141a34" stroke="#3a4a8a" strokeWidth={4} />
      {g.states.map((s) => {
        const near = Math.min(...cityXY.map((c) => Math.hypot(c.xy[0] - s.c[0], c.xy[1] - s.c[1]) / (0.6 + c.s * 0.6)));
        const sparse = SPARSE[s.name] ?? 0;
        const level = clamp((spread * 1.5 - near / 900 - sparse * 0.75) * 2.2);
        const fill = mix("#1d2448", "#c8203a", level);
        const isSafe = safe && sparse >= 0.85 && s.name !== "Alaska";
        return <path key={s.name} d={s.d} fill={isSafe ? "#2a6a5a" : fill} opacity={0.95} />;
      })}
      <path d={g.borders} fill="none" stroke="#0a0d1e" strokeWidth={2} />
      {showCities ? cityXY.map((c, i) => {
        const r = (t * 0.6 + i * 0.13) % 1;
        const active = spread > 0.05;
        return (
          <g key={c.n} transform={`translate(${c.xy[0]} ${c.xy[1]})`}>
            {active ? <circle r={20 + r * (60 + 140 * spread) * c.s} fill="none" stroke="#ff4a5a" strokeWidth={3} opacity={(1 - r) * 0.8} /> : null}
            <circle r={6 + c.s * 6} fill={active ? "#ff4a5a" : "#ffe36a"} stroke="#fff" strokeWidth={2} />
          </g>
        );
      }) : null}
      {safe ? (["Montana", "Nevada"] as const).map((n) => {
        const s = g.states.find((x) => x.name === n);
        if (!s) return null;
        return (
          <g key={n} transform={`translate(${s.c[0]} ${s.c[1]})`}>
            <rect x={-90} y={-26} width={180} height={44} rx={22} fill="#0e2a24" stroke="#5affc8" strokeWidth={3} />
            <text y={6} textAnchor="middle" fontSize={24} fontWeight={800} fill="#9affd8" fontFamily={FONT}>{n.toUpperCase()}</text>
          </g>
        );
      }) : null}
    </g>
  );
};

/* ═════════════════════════ Power pylon (sparks / dead) ═════════════════════════ */
const Pylon: React.FC<ObjectProps> = ({ t, props }) => {
  const dead = clamp(num(props.dead, 0));
  const spark = dead > 0.05 && dead < 0.95 && Math.floor(t * 8) % 3 === 0;
  const c = "#2a2a40";
  return (
    <g>
      <path d="M-160 0 L -40 -700 L 40 -700 L 160 0" stroke={c} strokeWidth={14} fill="none" />
      {Array.from({ length: 7 }, (_, i) => {
        const y = -i * 100, w = 160 - i * 17;
        return <path key={i} d={`M${-w} ${y} L ${w - 17} ${y - 100} M${w} ${y} L ${-w + 17} ${y - 100}`} stroke={c} strokeWidth={6} />;
      })}
      {[-560, -420].map((y, i) => <path key={i} d={`M${-260 + i * 40} ${y} L ${260 - i * 40} ${y}`} stroke={c} strokeWidth={14} />)}
      {[-240, 0, 240].map((x, i) => (
        <g key={i}>
          <path d={`M${x} -540 C ${x + 300} -460, ${x + 600} -460, ${x + 900} -540`} stroke="#1a1a28" strokeWidth={4} fill="none" />
          <path d={`M${x} -540 C ${x - 300} -460, ${x - 600} -460, ${x - 900} -540`} stroke="#1a1a28" strokeWidth={4} fill="none" />
        </g>
      ))}
      {spark ? (
        <g transform={`translate(${-240 + 480 * R(`pk${Math.floor(t * 8)}`)} -540)`}>
          <circle r={40} fill="#bfe8ff" opacity={0.5} />
          {Array.from({ length: 8 }, (_, i) => <line key={i} x1={0} y1={0} x2={Math.cos(i) * 70} y2={Math.sin(i * 1.7) * 70} stroke="#e8f8ff" strokeWidth={4} />)}
        </g>
      ) : null}
    </g>
  );
};

/* ═════════════════════════ CDC-style emergency kit ═════════════════════════ */
const Kit: React.FC<ObjectProps> = ({ local, props }) => {
  const shown = num(props.items, 6);
  const labels = bool(props.labels, true);
  const items: { x: number; label: string; draw: React.ReactNode }[] = [
    { x: -600, label: "WATER", draw: <g><rect x={-60} y={-230} width={120} height={230} rx={24} fill="#9fd0ff" stroke={LINE} strokeWidth={5} /><rect x={-26} y={-262} width={52} height={36} rx={8} fill="#3a7ad8" /><rect x={-60} y={-150} width={120} height={60} fill="#3a7ad8" opacity={0.6} /></g> },
    { x: -360, label: "FOOD", draw: <g>{[0, 1, 2].map((i) => <g key={i} transform={`translate(${(i - 1) * 54} ${i === 1 ? -100 : 0})`}><rect x={-46} y={-100} width={92} height={100} rx={8} fill={["#e84a4a", "#f2c14a", "#5ac87a"][i]} stroke={LINE} strokeWidth={4} /><rect x={-46} y={-70} width={92} height={36} fill="#f4f0e4" /></g>)}</g> },
    { x: -100, label: "FIRST AID", draw: <g><rect x={-110} y={-170} width={220} height={170} rx={20} fill="#f4f0f2" stroke={LINE} strokeWidth={5} /><rect x={-22} y={-140} width={44} height={110} fill="#e8202e" /><rect x={-55} y={-107} width={110} height={44} fill="#e8202e" /><rect x={-40} y={-196} width={80} height={30} rx={10} fill="none" stroke={LINE} strokeWidth={8} /></g> },
    { x: 170, label: "RADIO", draw: <g><rect x={-100} y={-150} width={200} height={150} rx={20} fill="#3a3a48" stroke={LINE} strokeWidth={5} /><rect x={-80} y={-120} width={90} height={90} rx={10} fill="#22222c" /><rect x={20} y={-120} width={60} height={30} rx={6} fill="#ffd27a" /><line x1={70} y1={-150} x2={110} y2={-260} stroke="#b8bcc8" strokeWidth={6} /></g> },
    { x: 420, label: "TORCH", draw: <g transform="rotate(-20)"><rect x={-40} y={-200} width={80} height={200} rx={14} fill="#e8c14a" stroke={LINE} strokeWidth={5} /><rect x={-56} y={-240} width={112} height={50} rx={10} fill="#3a3a48" /><ellipse cx={0} cy={-240} rx={50} ry={14} fill="#fff8d0" /></g> },
    { x: 660, label: "FAMILY PLAN", draw: <g><rect x={-100} y={-200} width={200} height={200} fill="#f4ecd8" stroke={LINE} strokeWidth={5} transform="rotate(4)" />{[0, 1, 2, 3].map((i) => <line key={i} x1={-70} y1={-160 + i * 36} x2={60} y2={-160 + i * 36} stroke="#8a7a6a" strokeWidth={5} />)}<circle cx={40} cy={-40} r={20} fill="none" stroke="#e8202e" strokeWidth={6} /></g> },
  ];
  return (
    <g>
      {items.map((it, i) => {
        const k = clamp((local - i * 0.35) * 3) * (i < shown ? 1 : 0);
        if (k <= 0) return null;
        return (
          <g key={i} transform={`translate(${it.x} ${(1 - k) * 60})`} opacity={k}>
            <ellipse cx={0} cy={6} rx={110} ry={14} fill="#000" opacity={0.3} />
            {it.draw}
            {labels ? <text x={0} y={70} textAnchor="middle" fontSize={34} fontWeight={800} fill="#ffffff" fontFamily={FONT} stroke={LINE} strokeWidth={6} paintOrder="stroke">{it.label}</text> : null}
          </g>
        );
      })}
    </g>
  );
};

/* ═════════════════════════ Helicopter with searchlight ═════════════════════════ */
const Heli: React.FC<ObjectProps> = ({ t, props }) => {
  const beam = num(props.beam, 1);
  const ang = num(props.angle, Math.sin(t * 0.6) * 15);
  return (
    <g>
      {beam > 0 ? <path d={`M0 40 L ${-260 + ang * 20} 1100 L ${260 + ang * 20} 1100 Z`} fill="#eaf4ff" opacity={0.16 * beam} /> : null}
      <path d="M-140 0 C -140 -70, 90 -80, 130 -20 L 130 30 L -120 40 Z" fill="#1a2038" stroke={LINE} strokeWidth={5} />
      <path d="M-110 -10 C -100 -50, -40 -60, -10 -50 L -10 0 L -110 10 Z" fill="#6a9ad8" opacity={0.8} />
      <path d="M120 -10 L 330 -36 L 336 -10 L 130 20 Z" fill="#1a2038" />
      <rect x={300} y={-70} width={16} height={60} fill="#1a2038" />
      <rect x={-10} y={-90} width={20} height={20} fill="#1a2038" />
      <ellipse cx={0} cy={-92} rx={260 * Math.abs(Math.cos(t * 30))} ry={6} fill="#2a3048" opacity={0.8} />
      <path d="M-110 50 L 110 50 M-80 40 L -90 50 M80 40 L 90 50" stroke="#1a2038" strokeWidth={8} />
      <circle cx={-90} cy={36} r={12} fill="#fffbe0" />
      <circle cx={60} cy={30} r={6} fill={Math.floor(t * 3) % 2 ? "#ff3a4a" : "#400"} />
    </g>
  );
};

/* ═════════════════════════ Military truck ═════════════════════════ */
const MilTruck: React.FC<ObjectProps> = ({ t, props }) => {
  const moving = bool(props.moving, true);
  const spin = moving ? t * 300 : 0;
  return (
    <g>
      <ellipse cx={0} cy={4} rx={420} ry={22} fill="#000" opacity={0.35} />
      <path d="M-400 -80 L -400 -330 C -400 -350, -380 -360, -360 -360 L 120 -360 L 120 -80 Z" fill="#4a5a3a" stroke={LINE} strokeWidth={6} />
      {Array.from({ length: 5 }, (_, i) => <line key={i} x1={-360 + i * 96} y1={-356} x2={-360 + i * 96} y2={-84} stroke="#3a4a2a" strokeWidth={5} />)}
      <path d="M130 -80 L 130 -280 L 300 -280 L 380 -180 L 400 -80 Z" fill="#5a6a48" stroke={LINE} strokeWidth={6} />
      <path d="M160 -260 L 280 -260 L 340 -184 L 160 -184 Z" fill="#9ab8c8" opacity={0.8} />
      <rect x={-420} y={-90} width={840} height={30} fill="#2a3220" />
      <circle cx={380} cy={-120} r={16} fill="#fffbe0" />
      {[-300, -160, 260].map((x) => (
        <g key={x} transform={`translate(${x} -40)`}>
          <circle r={56} fill="#1a1a1e" stroke={LINE} strokeWidth={4} />
          <circle r={24} fill="#5a5a50" />
          <line x1={0} y1={0} x2={0} y2={-22} stroke="#2a2a28" strokeWidth={6} transform={`rotate(${spin})`} />
        </g>
      ))}
      <rect x={-300} y={-260} width={160} height={70} fill="#3a4a2a" />
      <text x={-220} y={-212} textAnchor="middle" fontSize={34} fontWeight={800} fill="#d8e0c0" fontFamily={FONT}>ARMY</text>
    </g>
  );
};

/* ═════════════════════════ Front door from inside (banging) ═════════════════════════ */
const Door: React.FC<ObjectProps> = ({ t, props }) => {
  const bang = clamp(num(props.bang, 1));
  const hit = Math.max(0, Math.sin(t * 9)) ** 8 * bang;
  return (
    <g transform={`translate(${hit * 6} 0)`}>
      <rect x={-300} y={-900} width={600} height={900} fill="#2a2030" />
      <rect x={-260} y={-860} width={520} height={860} fill="#5a3a2a" stroke={LINE} strokeWidth={6} transform={`skewX(${hit * 1.2})`} />
      {[[-200, -800], [20, -800], [-200, -420], [20, -420]].map(([x, y], i) => <rect key={i} x={x} y={y} width={180} height={320} rx={8} fill="#4a2e22" stroke="#3a2418" strokeWidth={5} />)}
      <circle cx={190} cy={-440} r={22} fill="#d8b84a" stroke={LINE} strokeWidth={4} />
      <rect x={170} y={-520} width={40} height={20} rx={6} fill="#b8984a" />
      <rect x={-300} y={-6} width={600} height={14} fill="#ffd27a" opacity={0.25 + 0.3 * hit} />
      {/* light leaking under the door, shadow of feet */}
      <rect x={-120} y={-6} width={60} height={12} fill="#000" opacity={0.8 * bang} />
      <rect x={40} y={-6} width={60} height={12} fill="#000" opacity={0.8 * bang} />
      {hit > 0.3 ? [0, 1, 2].map((k) => <path key={k} d={`M${-340 - k * 30} ${-600 + k * 60} l -40 ${-10 + k * 10}`} stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={hit} />) : null}
      {hit > 0.3 ? [0, 1, 2].map((k) => <path key={`r${k}`} d={`M${340 + k * 30} ${-600 + k * 60} l 40 ${-10 + k * 10}`} stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={hit} />) : null}
    </g>
  );
};

/* ═════════════════════════ Day marker card (HOUR ZERO / DAY ONE …) ═════════════════════════ */
const DayCard: React.FC<ObjectProps> = ({ local, props, color }) => {
  const text = str(props.text, "DAY ONE");
  const sub = str(props.sub, "");
  const c = color ?? "#ff4a5a";
  const k = clamp(local * 2.5);
  const w = 900;
  return (
    <g opacity={k}>
      <rect x={-w / 2 * k} y={-6} width={w * k} height={6} fill={c} />
      <text x={0} y={-36} textAnchor="middle" fontSize={130} fontWeight={900} fill="#ffffff" fontFamily={FONT} letterSpacing={14 - 6 * k} stroke={LINE} strokeWidth={10} paintOrder="stroke">{text}</text>
      {sub ? <text x={0} y={70} textAnchor="middle" fontSize={40} fontWeight={600} fill={c} fontFamily={FONT} letterSpacing={6}>{sub}</text> : null}
    </g>
  );
};

export const OUTBREAK_OBJECTS: Record<string, ObjectDef> = {
  zzombie: { component: ZombieBust, w: 800, h: 960, category: "outbreak (anime)", description: 'ANIME z5: cel-shaded zombie bust (origin bottom-centre, like anime cast; scale 1 ≈ 800×960). props: { "variant": 0 office|1 hoodie|2 nurse|3 paramedic|4 student, "lunge": 0..1, "reach": 0..1 (hands rise into frame), "eyes": "dead|glow", "light": "night|red|day", "look": -1..1 }' },
  zhorde: { component: Horde, w: 1400, h: 360, category: "outbreak (anime)", description: 'ANIME z5: row of shambling silhouettes. color = silhouette. props: { "n": 9, "width": 1400, "eyes": "#d8ff7a", "walk": 0..1 }' },
  zphone: { component: Phone, w: 420, h: 840, category: "outbreak (anime)", anchor: "center", description: 'ANIME z5: phone. props: { "screen": "video|views|alert|chat|static|nosignal", "views": n (animatable), "text": alert lines split by | }' },
  zalert: { component: AlertBanner, w: 1500, h: 180, category: "outbreak (anime)", anchor: "center", description: 'ANIME z5: red EMERGENCY ALERT banner that slides in. props: { "text", "sub", "width" }' },
  zradio: { component: Radio, w: 520, h: 560, category: "outbreak (anime)", description: 'ANIME z5: old battery radio with sound waves. props: { "on": 0|1, "signal": 0 static … 1 voice, "dial": 0..1 }' },
  zvirus: { component: Virus, w: 640, h: 340, category: "outbreak (anime)", anchor: "center", description: "ANIME z5: bullet-shaped rabies virion. color = body." },
  zant: { component: AntFungus, w: 1000, h: 700, category: "outbreak (anime)", description: 'ANIME z5: carpenter ant clamped under a leaf; Ophiocordyceps stalk grows. props (animatable): { "grow": 0..1, "spores": 0..1 }' },
  znerve: { component: NervePath, w: 1000, h: 800, category: "outbreak (anime)", anchor: "center", description: 'ANIME z5: bite → nerve → brain diagram on a side silhouette. props (animatable): { "k": 0..1 progress }' },
  zszr: { component: SZR, w: 1600, h: 360, category: "outbreak (anime)", anchor: "center", description: 'ANIME z5: S → Z → R compartment boxes with dot counts. props (animatable): { "k": 0 start … 1 zombies win }' },
  zdouble: { component: Doubling, w: 1700, h: 760, category: "outbreak (anime)", anchor: "center", description: 'ANIME z5: doubling tree 1→2→4…32 with a counter. props (animatable): { "levels": 0..6, "counter": n }' },
  zr0: { component: RZero, w: 1100, h: 700, category: "outbreak (anime)", anchor: "center", description: 'ANIME z5: one infected person → n new infections. props: { "n": 3, "label": "R₀" }' },
  zusmap: { component: USSpread, w: 1800, h: 1100, category: "outbreak (anime)", anchor: "center", description: 'ANIME z5: real US state map; outbreak spreads from cities, sparse states last. props (animatable): { "spread": 0..1 }, { "safe": true labels Montana/Nevada, "cities": true }' },
  zpylon: { component: Pylon, w: 520, h: 720, category: "outbreak (anime)", description: 'ANIME z5: power pylon with lines. props (animatable): { "dead": 0..1 (sparks in between) }' },
  zkit: { component: Kit, w: 1500, h: 340, category: "outbreak (anime)", description: 'ANIME z5: emergency kit items pop in one by one (water, food, first aid, radio, torch, family plan). props: { "items": 6, "labels": true }' },
  zheli: { component: Heli, w: 680, h: 200, category: "outbreak (anime)", anchor: "center", description: 'ANIME z5: military helicopter with searchlight. props: { "beam": 0..1, "angle": deg }' },
  ztruck: { component: MilTruck, w: 840, h: 380, category: "outbreak (anime)", description: 'ANIME z5: army truck. props: { "moving": true }' },
  zdoor: { component: Door, w: 600, h: 900, category: "outbreak (anime)", description: 'ANIME z5: front door from inside, shaking as someone bangs on it. props (animatable): { "bang": 0..1 }' },
  zdaycard: { component: DayCard, w: 900, h: 260, category: "outbreak (anime)", anchor: "center", description: 'ANIME z5: big chapter marker. color = accent. props: { "text": "DAY ONE", "sub": "" }' },
};
