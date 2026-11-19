/**
 * Data-viz pieces for UNKNOWN GAMER videos. All animation is driven by `f` (frame
 * relative to the scene start) and `at` cue frames passed in from the timeline.
 */
import { geoNaturalEarth1, geoPath } from "d3-geo";
import React from "react";
import { interpolate, spring } from "remotion";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import world from "world-atlas/countries-110m.json";
import { clamp, ease } from "./fx";
import { C, DISPLAY, INTER, MONO } from "./theme";

const sp = (f: number, at: number, damping = 14) => spring({ frame: f - at, fps: 30, config: { damping } });
const prog = (f: number, a: number, b: number) => interpolate(f, [a, Math.max(a + 1, b)], [0, 1], { ...clamp, easing: ease });

export const fmt = (v: number, prefix = "", dec = 0) =>
  `${v < 0 ? "−" : ""}${prefix}${Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec })}`;

// ------------------------------------------------------------------ line chart
export type LineProps = {
  labels: string[];
  values: number[];
  prefix?: string;
  suffix?: string;
  min: number;
  max: number;
  at: number;
  until: number;
  color?: string;
  title?: string;
  w?: number;
  h?: number;
  ticks?: number[];
  tickFmt?: string;
  pointLabels?: number[];
};
export const LineChart: React.FC<LineProps & { f: number }> = ({ f, labels, values, prefix = "", suffix = "", min, max, at, until, color = C.red, title, w = 1150, h = 520, ticks, pointLabels }) => {
  const n = values.length;
  const X = (i: number) => (i / (n - 1)) * w;
  const Y = (v: number) => h - ((v - min) / (max - min)) * h;
  const p = prog(f, at, until);
  const pts = values.map((v, i) => `${X(i)},${Y(v)}`).join(" ");
  const L = values.slice(1).reduce((s, v, i) => s + Math.hypot(X(i + 1) - X(i), Y(v) - Y(values[i])), 0);
  const head = Math.min(n - 1, p * (n - 1));
  const hi = Math.floor(head);
  const hx = X(hi) + (X(Math.min(n - 1, hi + 1)) - X(hi)) * (head - hi);
  const hy = Y(values[hi]) + (Y(values[Math.min(n - 1, hi + 1)]) - Y(values[hi])) * (head - hi);
  const show = (i: number) => head >= i - 0.02;
  const gid = `lg${Math.round(min)}${n}`;
  return (
    <svg width={w + 220} height={h + 130} viewBox={`-140 -60 ${w + 220} ${h + 130}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.32} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
        <filter id="lglow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="7" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id={`${gid}c`}>
          <rect x={-10} y={-60} width={hx + 10} height={h + 70} />
        </clipPath>
      </defs>
      {title ? (
        <text x={0} y={-24} fill={C.mute} fontFamily={INTER} fontWeight={700} fontSize={22} letterSpacing={3}>
          {title}
        </text>
      ) : null}
      {(ticks ?? [min, (min + max) / 2, max]).map((t) => (
        <g key={t} opacity={prog(f, at - 10, at + 5)}>
          <line x1={0} x2={w} y1={Y(t)} y2={Y(t)} stroke={C.line} strokeDasharray="4 8" />
          <text x={-22} y={Y(t) + 8} textAnchor="end" fill={C.mute} fontFamily={MONO} fontSize={22}>
            {prefix}
            {t.toLocaleString("en-US")}
            {suffix}
          </text>
        </g>
      ))}
      <polygon clipPath={`url(#${gid}c)`} points={`${pts} ${w},${h} 0,${h}`} fill={`url(#${gid})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - p)} filter="url(#lglow)" />
      {p > 0 && p < 1 ? <circle cx={hx} cy={hy} r={12} fill={color} filter="url(#lglow)" /> : null}
      {labels.map((l, i) => (
        <text key={l + i} x={X(i)} y={h + 50} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} fill={C.mute} fontFamily={INTER} fontWeight={600} fontSize={22} letterSpacing={2} opacity={show(i) ? 1 : 0.25}>
          {l}
        </text>
      ))}
      {(pointLabels ?? [0, n - 1]).map((i) => (
        <g key={`pl${i}`} opacity={show(i) ? 1 : 0}>
          <circle cx={X(i)} cy={Y(values[i])} r={10} fill={C.bg} stroke={color} strokeWidth={5} />
          <text x={X(i)} y={Y(values[i]) - 26} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} fill={C.ink} fontFamily={MONO} fontWeight={700} fontSize={32}>
            {prefix}
            {values[i].toLocaleString("en-US")}
            {suffix}
          </text>
        </g>
      ))}
    </svg>
  );
};

// ------------------------------------------------------------------ MSRP vs street bars
export type BarItem = { name: string; msrp: number; street: number; at: number; note?: string; pctText?: string };
export const MsrpBars: React.FC<{ f: number; items: BarItem[]; max: number; w?: number; at: number; overflow?: string }> = ({ f, items, max, w = 1500, at, overflow }) => {
  const rowH = 118;
  return (
    <div style={{ width: w, position: "relative" }}>
      <div style={{ display: "flex", gap: 30, marginBottom: 22, opacity: prog(f, at, at + 10), fontFamily: INTER, fontWeight: 700, fontSize: 22, letterSpacing: 3 }}>
        <span style={{ color: C.mute }}>▬ MSRP (LAUNCH PRICE)</span>
        <span style={{ color: C.red }}>▬ CHEAPEST REAL LISTING · US</span>
      </div>
      {items.map((it) => {
        const a = prog(f, it.at, it.at + 14);
        const b = prog(f, it.at + 8, it.at + 30);
        const msW = (it.msrp / max) * (w - 420);
        const stW = Math.min(1.12, it.street / max) * (w - 420);
        const pct = Math.round(((it.street - it.msrp) / it.msrp) * 100);
        const isOver = it.name === overflow && it.street > max;
        return (
          <div key={it.name} style={{ height: rowH, position: "relative", opacity: a }}>
            <div style={{ position: "absolute", left: 0, top: 18, width: 260, fontFamily: DISPLAY, fontWeight: 600, fontSize: 40, color: C.ink }}>{it.name}</div>
            <div style={{ position: "absolute", left: 280, top: 12, height: 26, width: msW * a, background: "rgba(139,151,164,0.55)", borderRadius: 6 }} />
            <div style={{ position: "absolute", left: 280, top: 46, height: 40, width: stW * b, background: `linear-gradient(90deg, #b81f33, ${C.red})`, borderRadius: 6, boxShadow: "0 0 30px rgba(255,61,82,0.35)" }} />
            <div style={{ position: "absolute", left: 280 + msW * a + 12, top: 8, fontFamily: MONO, fontSize: 24, color: C.mute }}>{fmt(it.msrp, "$")}</div>
            <div style={{ position: "absolute", left: 280 + stW * b + 16, top: 44, fontFamily: MONO, fontWeight: 800, fontSize: 36, color: C.ink, opacity: b, whiteSpace: "nowrap" }}>
              {it.note ?? fmt(it.street, "$")} <span style={{ color: C.red, fontSize: 30 }}>{it.pctText ?? `+${pct}%`}</span>
              {isOver ? <span style={{ color: C.amber, fontSize: 26 }}> ▲ off the chart</span> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ------------------------------------------------------------------ donut
export const Donut: React.FC<{ f: number; from: number; to: number; at: number; land: number; label: string; sub0: string; sub1: string }> = ({ f, from, to, at, land, label, sub0, sub1 }) => {
  const appear = prog(f, at, at + 18);
  const v = (from + (to - from) * prog(f, land, land + 24)) / 100;
  const R = 230;
  const c = 2 * Math.PI * R;
  return (
    <div style={{ position: "relative", width: 620, height: 620, opacity: appear, transform: `scale(${0.9 + 0.1 * appear})` }}>
      <svg width={620} height={620} viewBox="-310 -310 620 620">
        <circle r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={70} />
        <circle r={R} fill="none" stroke={C.teal} strokeWidth={70} strokeDasharray={`${c * v * appear} ${c}`} transform="rotate(-90)" style={{ filter: "drop-shadow(0 0 18px rgba(40,215,255,0.6))" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 120, color: C.ink }}>{Math.round(v * 100)}%</div>
        <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: C.teal }}>{label}</div>
        <div style={{ fontFamily: MONO, fontSize: 24, color: C.mute, marginTop: 8 }}>{f < land + 12 ? sub0 : sub1}</div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ quarterly forecast strip
export const Forecast: React.FC<{ f: number; items: { q: string; lo: number; hi: number }[]; at: number }> = ({ f, items, at }) => (
  <div style={{ display: "flex", gap: 34, alignItems: "flex-end", height: 460 }}>
    {items.map((it, i) => {
      const a = prog(f, at + i * 10, at + i * 10 + 18);
      const hgt = (it.hi / 10) * 360 * a;
      const col = it.hi >= 8 ? C.red : it.hi >= 6 ? C.amber : C.green;
      return (
        <div key={it.q} style={{ width: 230, textAlign: "center", opacity: a }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 44, color: col, marginBottom: 12 }}>
            +{it.lo}–{it.hi}%
          </div>
          <div style={{ height: hgt, borderRadius: 10, background: `linear-gradient(180deg, ${col}, rgba(0,0,0,0))`, boxShadow: `0 0 30px ${col}55` }} />
          <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 40, color: C.ink, marginTop: 14 }}>{it.q}</div>
        </div>
      );
    })}
  </div>
);

// ------------------------------------------------------------------ card grid with % chips
export type GridCard = { name: string; delta?: string; at?: number; up?: boolean; dim?: boolean; vram?: string };
export const CardGrid: React.FC<{ f: number; cards: GridCard[]; cols?: number; at: number; sortAt?: number }> = ({ f, cards, cols = 5, at }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 300px)`, gap: 22 }}>
    {cards.map((c, i) => {
      const a = prog(f, at + i * 2, at + i * 2 + 12);
      const chip = c.at !== undefined ? sp(f, c.at, 11) : 0;
      const col = c.up ? C.red : C.green;
      return (
        <div
          key={c.name}
          style={{
            height: 150,
            borderRadius: 16,
            padding: "18px 20px",
            background: "linear-gradient(180deg, rgba(27,33,41,0.92), rgba(12,15,20,0.92))",
            border: `1px solid ${chip > 0.5 ? col : C.line}`,
            boxShadow: chip > 0.5 ? `0 0 26px ${col}44` : undefined,
            opacity: a * (c.dim && chip < 0.5 ? 0.45 : 1),
            transform: `translateY(${(1 - a) * 20}px)`,
            position: "relative",
          }}
        >
          <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 36, color: C.ink }}>{c.name}</div>
          {c.vram ? <div style={{ fontFamily: MONO, fontSize: 20, color: C.mute, marginTop: 4 }}>{c.vram} VRAM</div> : null}
          {c.delta ? (
            <div style={{ position: "absolute", left: 20, bottom: 16, padding: "4px 14px", borderRadius: 8, background: col, color: "#05070a", fontFamily: MONO, fontWeight: 800, fontSize: 32, transform: `scale(${chip})`, transformOrigin: "left center" }}>
              {c.up ? "▲" : "▼"} {c.delta}
            </div>
          ) : null}
        </div>
      );
    })}
  </div>
);

// ------------------------------------------------------------------ regional podium
export type PodCol = { name: string; local: string; usd: number; exTax?: number; tax?: string };
export const Podium: React.FC<{ f: number; cols: PodCol[]; at: number; fillAt: number; untaxAt?: number; max: number }> = ({ f, cols, at, fillAt, untaxAt, max }) => {
  const H = 470;
  return (
    <div style={{ display: "flex", gap: 90, alignItems: "flex-end", height: H + 190 }}>
      {cols.map((c, i) => {
        const a = prog(f, at + i * 6, at + i * 6 + 16);
        const fill = prog(f, fillAt + i * 12, fillAt + i * 12 + 22);
        const un = untaxAt !== undefined && c.exTax !== undefined ? prog(f, untaxAt + i * 8, untaxAt + i * 8 + 20) : 0;
        const val = c.usd + ((c.exTax ?? c.usd) - c.usd) * un;
        const h = (val / max) * H * fill;
        const taxH = c.exTax !== undefined ? ((c.usd - c.exTax) / max) * H * fill * (1 - un) : 0;
        return (
          <div key={c.name} style={{ width: 300, textAlign: "center", opacity: a }}>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 56, color: C.ink, opacity: fill }}>≈${Math.round(val)}</div>
            <div style={{ fontFamily: MONO, fontSize: 24, color: C.mute, marginBottom: 14, opacity: fill }}>{un > 0.5 ? (c.tax ? `without ${c.tax}` : "before sales tax") : c.local}</div>
            <div style={{ position: "relative", height: Math.max(h, 4), borderRadius: "14px 14px 0 0", background: `linear-gradient(180deg, ${C.teal}, rgba(40,215,255,0.15))`, boxShadow: "0 0 30px rgba(40,215,255,0.3)" }}>
              {taxH > 1 ? (
                <div style={{ position: "absolute", left: 0, right: 0, top: -taxH, height: taxH, borderRadius: "14px 14px 0 0", background: "repeating-linear-gradient(45deg, rgba(255,182,72,0.85) 0 12px, rgba(255,182,72,0.55) 12px 24px)", transform: `translateY(${un * -80}px)`, opacity: 1 - un }}>
                  <span style={{ fontFamily: INTER, fontWeight: 800, fontSize: 22, color: "#1a1206" }}>{c.tax}</span>
                </div>
              ) : null}
            </div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, color: C.ink, marginTop: 18, letterSpacing: 2 }}>{c.name}</div>
          </div>
        );
      })}
    </div>
  );
};

// ------------------------------------------------------------------ table
export const Table: React.FC<{ f: number; head: string[]; rows: { cells: string[]; at: number; hl?: number }[]; widths: number[] }> = ({ f, head, rows, widths }) => (
  <div style={{ fontFamily: INTER, color: C.ink }}>
    <div style={{ display: "flex", borderBottom: `2px solid ${C.line}`, paddingBottom: 12, marginBottom: 6 }}>
      {head.map((h, i) => (
        <div key={h} style={{ width: widths[i], fontWeight: 700, fontSize: 22, letterSpacing: 3, color: C.mute }}>
          {h}
        </div>
      ))}
    </div>
    {rows.map((r, k) => {
      const a = prog(f, r.at, r.at + 14);
      return (
        <div key={k} style={{ display: "flex", padding: "20px 0", borderBottom: `1px solid ${C.line}`, opacity: a, transform: `translateX(${(1 - a) * -30}px)` }}>
          {r.cells.map((c, i) => (
            <div key={i} style={{ width: widths[i], fontFamily: i === 0 ? DISPLAY : MONO, fontWeight: i === r.hl ? 800 : 600, fontSize: i === 0 ? 40 : 34, color: i === r.hl ? C.amber : C.ink }}>
              {c}
            </div>
          ))}
        </div>
      );
    })}
  </div>
);

// ------------------------------------------------------------------ checklist
export const Checklist: React.FC<{ f: number; items: { t: string; at: number }[] }> = ({ f, items }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
    {items.map((it) => {
      const a = sp(f, it.at, 12);
      return (
        <div key={it.t} style={{ display: "flex", alignItems: "center", gap: 28, opacity: Math.min(1, a * 1.5), transform: `translateX(${(1 - a) * -40}px)` }}>
          <div style={{ width: 64, height: 64, borderRadius: 14, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, fontWeight: 900, color: "#05070a", transform: `scale(${a})`, boxShadow: "0 0 26px rgba(53,242,154,0.5)", fontFamily: INTER }}>
            ✓
          </div>
          <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 52, color: C.ink }}>{it.t}</div>
        </div>
      );
    })}
  </div>
);

// ------------------------------------------------------------------ split compare
export type SplitSide = { title: string; value: string; sub: string; color: string };
export const Split: React.FC<{ f: number; left: SplitSide; right: SplitSide; at: number; stamp: string; stampAt: number }> = ({ f, left, right, at, stamp, stampAt }) => {
  const s = sp(f, stampAt, 9);
  const card = (c: SplitSide, d: number) => {
    const a = prog(f, at + d, at + d + 16);
    return (
      <div style={{ width: 640, padding: "40px 46px", borderRadius: 22, background: "linear-gradient(180deg, rgba(27,33,41,0.95), rgba(12,15,20,0.95))", border: `1px solid ${C.line}`, opacity: a, transform: `translateY(${(1 - a) * 30}px)` }}>
        <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 26, letterSpacing: 4, color: C.mute }}>{c.title}</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 110, color: c.color, marginTop: 10 }}>{c.value}</div>
        <div style={{ fontFamily: MONO, fontSize: 28, color: C.mute }}>{c.sub}</div>
      </div>
    );
  };
  return (
    <div style={{ display: "flex", gap: 120, alignItems: "center", position: "relative" }}>
      {card(left, 0)}
      {card(right, 8)}
      <div style={{ position: "absolute", left: "50%", top: "50%", transform: `translate(-50%,-50%) rotate(-8deg) scale(${2 - s})`, opacity: s, padding: "12px 30px", border: `6px solid ${C.red}`, borderRadius: 14, color: C.red, fontFamily: DISPLAY, fontWeight: 700, fontSize: 84, background: "rgba(5,7,10,0.85)" }}>
        {stamp}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ wafer takeover
export const Wafer: React.FC<{ f: number; at: number; takeAt: number; frac?: number }> = ({ f, at, takeAt, frac = 0.3 }) => {
  const N = 14;
  const R = 300;
  const cells: { x: number; y: number; i: number }[] = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const cx = (x + 0.5 - N / 2) * (2 * R / N);
    const cy = (y + 0.5 - N / 2) * (2 * R / N);
    if (Math.hypot(cx, cy) < R - 16) cells.push({ x: cx, y: cy, i: cells.length });
  }
  const a = prog(f, at, at + 20);
  const take = prog(f, takeAt, takeAt + 50);
  const hbmCount = Math.floor(cells.length * frac * take);
  const s = (2 * R) / N - 4;
  return (
    <svg width={760} height={760} viewBox="-380 -380 760 760" style={{ opacity: a, transform: `rotate(${f * 0.05}deg)` }}>
      <defs>
        <radialGradient id="wf" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#5d6b7a" />
          <stop offset="60%" stopColor="#252c35" />
          <stop offset="100%" stopColor="#11151a" />
        </radialGradient>
      </defs>
      <circle r={R + 20} fill="url(#wf)" stroke="rgba(255,255,255,0.25)" strokeWidth={2} />
      {cells.map((c) => {
        const order = (c.i * 37) % cells.length;
        const isH = order < hbmCount;
        return <rect key={c.i} x={c.x - s / 2} y={c.y - s / 2} width={s} height={s} rx={3} fill={isH ? C.teal : "rgba(53,242,154,0.55)"} opacity={isH ? 0.95 : 0.8} />;
      })}
    </svg>
  );
};

// ------------------------------------------------------------------ HBM stack (CSS 3D)
export const HbmStack: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  const rot = -30 + f * 0.25;
  const layer = (z: number, w: number, d: number, color: string, glow = false) => (
    <div style={{ position: "absolute", left: -w / 2, top: -d / 2, width: w, height: d, transform: `translateZ(${z}px)`, background: color, border: "1px solid rgba(255,255,255,0.25)", boxShadow: glow ? `0 0 30px ${C.teal}` : undefined, borderRadius: 6 }} />
  );
  const stacks = [-260, 260].flatMap((x) => [-120, 120].map((y) => ({ x, y })));
  return (
    <div style={{ width: 1000, height: 700, perspective: 1800, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "relative", transformStyle: "preserve-3d", transform: `rotateX(58deg) rotateZ(${rot}deg)` }}>
        {layer(0, 900, 560, "linear-gradient(135deg, #1c3a2a, #0b1a12)")}
        {layer(10, 360, 300, "linear-gradient(135deg, #3a4452, #1a1f27)")}
        <div style={{ position: "absolute", left: -120, top: -40, transform: "translateZ(12px)", fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, color: "rgba(255,255,255,0.8)" }}>AI GPU</div>
        {stacks.map((s, k) => (
          <div key={k} style={{ position: "absolute", left: s.x, top: s.y, transformStyle: "preserve-3d" }}>
            {Array.from({ length: 8 }, (_, i) => {
              const a = prog(f, at + k * 6 + i * 3, at + k * 6 + i * 3 + 8);
              return a > 0 ? <div key={i} style={{ position: "absolute", transformStyle: "preserve-3d", opacity: a, transform: `translateZ(${(1 - a) * 120}px)` }}>{layer(12 + i * 14, 150, 110, i % 2 ? "rgba(40,215,255,0.85)" : "rgba(30,150,190,0.9)", i === 7)}</div> : null;
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ maps
const countries = feature(world as unknown as Topology, (world as unknown as Topology).objects.countries as GeometryCollection);
export type Pin = { lon: number; lat: number; label: string; at: number; sub?: string };
const BASE = geoNaturalEarth1().fitExtent([[80, 110], [1840, 1000]], countries);
const PATH = geoPath(BASE);
const SHAPES = countries.features.map((c) => ({ name: (c.properties as { name?: string })?.name ?? "", d: PATH(c) ?? "" }));
/** World map (Natural Earth). Zoom = CSS scale around a lon/lat target that slides to screen centre. */
export const WorldMap: React.FC<{ f: number; at: number; pins: Pin[]; zoomTo?: [number, number]; zoomK?: number; zoomAt?: number; highlight?: string[]; dimOthers?: boolean }> = ({
  f,
  at,
  pins,
  zoomTo,
  zoomK = 3.2,
  zoomAt = 0,
  highlight = [],
}) => {
  const a = prog(f, at, at + 20);
  const z = zoomTo ? prog(f, zoomAt, zoomAt + 45) : 0;
  const t = zoomTo ? (BASE(zoomTo) ?? [960, 540]) : [960, 540];
  const k = 1 + z * (zoomK - 1);
  const tf = `translate(${(960 - t[0]) * z}px, ${(540 - t[1]) * z}px) scale(${k})`;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: a, overflow: "hidden" }}>
      <g style={{ transform: tf, transformOrigin: `${t[0]}px ${t[1]}px` }}>
        {SHAPES.map((c, i) => {
          const hl = highlight.includes(c.name);
          return <path key={i} d={c.d} fill={hl ? "rgba(255,182,72,0.42)" : "rgba(120,140,160,0.15)"} stroke={hl ? C.amber : "rgba(160,180,200,0.28)"} strokeWidth={hl ? 1.6 : 0.6} vectorEffect="non-scaling-stroke" />;
        })}
        {pins.map((p) => {
          const xy = BASE([p.lon, p.lat]);
          if (!xy) return null;
          const s = sp(f, p.at, 10);
          const pulse = (((f - p.at) % 40) + 40) % 40 / 40;
          return (
            <g key={p.label} transform={`translate(${xy[0]},${xy[1]}) scale(${1 / k})`} opacity={f >= p.at ? s : 0}>
              <circle r={10 + pulse * 40} fill="none" stroke={C.amber} strokeWidth={3} opacity={1 - pulse} />
              <circle r={11} fill={C.amber} />
              <text x={22} y={-14} fill={C.ink} fontFamily={DISPLAY} fontWeight={700} fontSize={46} style={{ paintOrder: "stroke" }} stroke="rgba(5,7,10,0.8)" strokeWidth={8}>
                {p.label}
              </text>
              {p.sub ? (
                <text x={22} y={24} fill={C.amber} fontFamily={MONO} fontWeight={700} fontSize={30} style={{ paintOrder: "stroke" }} stroke="rgba(5,7,10,0.8)" strokeWidth={8}>
                  {p.sub}
                </text>
              ) : null}
            </g>
          );
        })}
      </g>
    </svg>
  );
};
export const EU = ["Germany", "France", "Italy", "Spain", "Poland", "Netherlands", "Belgium", "Austria", "Czechia", "Sweden", "Portugal", "Denmark", "Finland", "Ireland", "Greece", "Hungary", "Romania", "Slovakia", "Bulgaria", "Croatia", "Lithuania", "Latvia", "Estonia", "Slovenia", "Luxembourg"];
