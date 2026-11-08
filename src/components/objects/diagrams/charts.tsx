import React from "react";
import { darken, lighten, withAlpha } from "../../../utils/color";
import { useScene } from "../../../scenes/context";
import { ease } from "../../../utils/easing";
import { FONT_FAMILY } from "../../../utils/fonts";
import type { DiagramElementT } from "../../../utils/schema";

export type DiagramProps = {
  el: DiagramElementT;
  /** 0..1 build progress */
  k: number;
  /** seconds since the diagram appeared */
  local: number;
};

export const PALETTE = ["#3a86ff", "#ff006e", "#ffbe0b", "#06d6a0", "#8338ec", "#fb5607", "#118ab2", "#ef476f"];

/** Rounded card the diagram sits on. Centred on the origin. */
export const Card: React.FC<{ w: number; h: number; title?: string; children: React.ReactNode; plain?: boolean }> = ({ w, h, title, children, plain }) => {
  const { theme } = useScene();
  return (
    <div
      style={{
        position: "absolute",
        left: -w / 2,
        top: -h / 2,
        width: w,
        height: h,
        borderRadius: 36,
        background: plain ? undefined : `linear-gradient(160deg, ${withAlpha(lighten(theme.dark, 0.08), 0.92)}, ${withAlpha(darken(theme.dark, 0.25), 0.92)})`,
        boxShadow: plain ? undefined : "0 30px 80px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)",
        fontFamily: FONT_FAMILY,
        color: theme.text,
        overflow: "visible",
      }}
    >
      {title ? (
        <div style={{ position: "absolute", left: 48, top: 30, fontSize: 40, fontWeight: 700, letterSpacing: "-0.01em" }}>{title}</div>
      ) : null}
      {children}
    </div>
  );
};

type Item = { label: string; value: number; color?: string };
const toItems = (data: unknown): Item[] => {
  if (Array.isArray(data)) {
    return data.map((d, i) =>
      typeof d === "number" ? { label: String(i + 1), value: d } : { label: String(d.label ?? ""), value: Number(d.value ?? 0), color: d.color },
    );
  }
  if (data && typeof data === "object" && Array.isArray((data as { items?: unknown }).items)) {
    return toItems((data as { items: unknown }).items);
  }
  return [];
};
const unitOf = (data: unknown) =>
  data && typeof data === "object" && !Array.isArray(data) ? String((data as { unit?: string }).unit ?? "") : "";

const fmt = (v: number, unit: string) => {
  const abs = Math.abs(v);
  const s = abs >= 1e9 ? (v / 1e9).toFixed(1) + "B" : abs >= 1e6 ? (v / 1e6).toFixed(1) + "M" : abs >= 1e4 ? (v / 1e3).toFixed(0) + "K" : Number.isInteger(v) ? String(v) : v.toFixed(1);
  return unit === "%" ? s + "%" : unit ? (unit.length <= 2 ? unit + s : s + " " + unit) : s;
};

// ------------------------------------------------------------------- BAR
export const BarChart: React.FC<DiagramProps> = ({ el, k }) => {
  const { theme } = useScene();
  const items = toItems(el.data);
  const unit = unitOf(el.data);
  const W = el.width ?? 1100;
  const H = el.height ?? 640;
  const top = el.title ? 175 : 90;
  const chartH = H - top - 100;
  const max = Math.max(...items.map((d) => d.value), 1e-6);
  const n = items.length;
  const gap = 28;
  const bw = (W - 120 - gap * (n - 1)) / n;
  return (
    <Card w={W} h={H} title={el.title}>
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <line key={g} x1={60} x2={W - 60} y1={top + chartH * (1 - g)} y2={top + chartH * (1 - g)} stroke="#fff" strokeOpacity={0.08} strokeWidth={2} />
        ))}
        <line x1={60} x2={W - 60} y1={top + chartH} y2={top + chartH} stroke="#fff" strokeOpacity={0.3} strokeWidth={3} />
        {items.map((d, i) => {
          const kk = ease("back", k * (n * 0.35 + 1) - i * 0.35);
          const h = (d.value / max) * chartH * Math.max(0, kk);
          const x = 60 + i * (bw + gap);
          const c = d.color ?? el.color ?? PALETTE[i % PALETTE.length];
          const shown = Math.max(0, Math.min(1, kk));
          return (
            <g key={i}>
              <rect x={x} y={top + chartH - h} width={bw} height={Math.max(0, h)} rx={Math.min(16, bw / 4)} fill={c} />
              <rect x={x} y={top + chartH - h} width={bw * 0.35} height={Math.max(0, h)} rx={Math.min(16, bw / 4)} fill="#fff" opacity={0.12} />
              <text x={x + bw / 2} y={top + chartH - h - 16} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={800} fontSize={Math.min(40, bw * 0.4)} fill={theme.text} opacity={shown}>
                {fmt(d.value * shown, unit)}
              </text>
              <text x={x + bw / 2} y={top + chartH + 50} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={600} fontSize={Math.min(30, bw * 0.3)} fill={theme.text} opacity={0.8}>
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </Card>
  );
};

// ------------------------------------------------------------------ LINE
type Series = { name?: string; values: number[]; color?: string };
export const LineChart: React.FC<DiagramProps> = ({ el, k }) => {
  const { theme } = useScene();
  const d = el.data as { labels?: string[]; series?: Series[]; values?: number[]; unit?: string } | number[] | undefined;
  const series: Series[] = Array.isArray(d) ? [{ values: d }] : d?.series ?? (d?.values ? [{ values: d.values }] : []);
  const labels = Array.isArray(d) ? [] : d?.labels ?? [];
  const unit = Array.isArray(d) ? "" : d?.unit ?? "";
  const W = el.width ?? 1100;
  const H = el.height ?? 640;
  const top = el.title ? 130 : 70;
  const left = 110;
  const cw = W - left - 60;
  const ch = H - top - 100;
  const all = series.flatMap((s) => s.values);
  const max = Math.max(...all, 1e-6);
  const min = Math.min(0, ...all);
  const X = (i: number, n: number) => left + (n <= 1 ? 0 : (i / (n - 1)) * cw);
  const Y = (v: number) => top + ch - ((v - min) / (max - min)) * ch;
  return (
    <Card w={W} h={H} title={el.title}>
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <defs>
          {series.map((s, si) => (
            <linearGradient key={si} id={`lg-${si}-${el.id ?? "x"}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={s.color ?? PALETTE[si]} stopOpacity={0.45} />
              <stop offset="1" stopColor={s.color ?? PALETTE[si]} stopOpacity={0} />
            </linearGradient>
          ))}
          <clipPath id={`lc-${el.id ?? "x"}`}>
            <rect x={0} y={0} width={left + cw * k + 20} height={H} />
          </clipPath>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((g) => (
          <g key={g}>
            <line x1={left} x2={left + cw} y1={top + ch * (1 - g)} y2={top + ch * (1 - g)} stroke="#fff" strokeOpacity={g === 0 ? 0.3 : 0.08} strokeWidth={2} />
            <text x={left - 18} y={top + ch * (1 - g) + 10} textAnchor="end" fontFamily={FONT_FAMILY} fontSize={24} fill={theme.text} opacity={0.6}>
              {fmt(min + (max - min) * g, unit)}
            </text>
          </g>
        ))}
        {labels.map((l, i) => (
          <text key={i} x={X(i, labels.length)} y={top + ch + 48} textAnchor="middle" fontFamily={FONT_FAMILY} fontSize={26} fontWeight={600} fill={theme.text} opacity={0.75}>
            {l}
          </text>
        ))}
        <g clipPath={`url(#lc-${el.id ?? "x"})`}>
          {series.map((s, si) => {
            const pts = s.values.map((v, i) => [X(i, s.values.length), Y(v)] as const);
            const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
            const c = s.color ?? (si === 0 && el.color ? el.color : PALETTE[si]);
            return (
              <g key={si}>
                <path d={`${line} L${pts[pts.length - 1][0]},${top + ch} L${pts[0][0]},${top + ch} Z`} fill={`url(#lg-${si}-${el.id ?? "x"})`} />
                <path d={line} stroke={c} strokeWidth={7} fill="none" strokeLinejoin="round" strokeLinecap="round" />
                {pts.map((p, i) => (
                  <circle key={i} cx={p[0]} cy={p[1]} r={9} fill={theme.dark} stroke={c} strokeWidth={5} />
                ))}
              </g>
            );
          })}
        </g>
        {series.length > 1
          ? series.map((s, si) => (
              <g key={si} transform={`translate(${W - 60 - (series.length - si) * 210} ${el.title ? 52 : 30})`}>
                <rect width={28} height={10} y={-8} rx={5} fill={s.color ?? PALETTE[si]} />
                <text x={38} y={4} fontFamily={FONT_FAMILY} fontSize={24} fill={theme.text}>
                  {s.name ?? ""}
                </text>
              </g>
            ))
          : null}
      </svg>
    </Card>
  );
};

// ------------------------------------------------------------- PIE/DONUT
export const PieChart: React.FC<DiagramProps & { donut?: boolean }> = ({ el, k, donut }) => {
  const { theme } = useScene();
  const items = toItems(el.data);
  const unit = unitOf(el.data) || "%";
  const total = items.reduce((a, b) => a + b.value, 0) || 1;
  const W = el.width ?? 1000;
  const H = el.height ?? 620;
  const R = Math.min(W * 0.5, H - (el.title ? 160 : 80)) / 2;
  const cx = W * 0.32;
  const cy = (el.title ? 70 : 0) + H / 2 - (el.title ? 30 : 0);
  let acc = 0;
  const sweep = ease("inOut", k) * Math.PI * 2;
  const arcs = items.map((d, i) => {
    const a0 = (acc / total) * Math.PI * 2;
    acc += d.value;
    const a1 = (acc / total) * Math.PI * 2;
    const s0 = Math.min(a0, sweep);
    const s1 = Math.min(a1, sweep);
    const c = d.color ?? PALETTE[i % PALETTE.length];
    if (s1 <= s0) return null;
    const p = (a: number, r: number) => [cx + Math.sin(a) * r, cy - Math.cos(a) * r];
    const large = s1 - s0 > Math.PI ? 1 : 0;
    const [x0, y0] = p(s0, R);
    const [x1, y1] = p(s1, R);
    const ri = donut ? R * 0.58 : 0;
    const [x2, y2] = p(s1, ri);
    const [x3, y3] = p(s0, ri);
    const dpath = donut
      ? `M${x0},${y0} A${R},${R} 0 ${large} 1 ${x1},${y1} L${x2},${y2} A${ri},${ri} 0 ${large} 0 ${x3},${y3} Z`
      : `M${cx},${cy} L${x0},${y0} A${R},${R} 0 ${large} 1 ${x1},${y1} Z`;
    return <path key={i} d={dpath} fill={c} stroke={theme.dark} strokeWidth={4} />;
  });
  const legendTop = cy - (items.length * 70) / 2;
  return (
    <Card w={W} h={H} title={el.title}>
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <circle cx={cx} cy={cy + 10} r={R} fill="#000" opacity={0.2} />
        {arcs}
        {donut ? (
          <text x={cx} y={cy + 20} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={800} fontSize={R * 0.36} fill={theme.text}>
            {fmt(Math.round(items[0] ? (items[0].value / total) * 100 * Math.min(1, k * 1.2) : 0), "%")}
          </text>
        ) : null}
        {items.map((d, i) => {
          const kk = ease("out", k * 2 - i * 0.15);
          return (
            <g key={i} transform={`translate(${W * 0.62 + (1 - kk) * 40} ${legendTop + i * 70})`} opacity={Math.max(0, Math.min(1, kk))}>
              <rect width={34} height={34} rx={10} fill={d.color ?? PALETTE[i % PALETTE.length]} />
              <text x={52} y={28} fontFamily={FONT_FAMILY} fontWeight={600} fontSize={30} fill={theme.text}>
                {d.label}
              </text>
              <text x={W * 0.34} y={28} textAnchor="end" fontFamily={FONT_FAMILY} fontWeight={800} fontSize={30} fill={theme.accent}>
                {unit === "%" ? `${Math.round((d.value / total) * 100)}%` : fmt(d.value, unit)}
              </text>
            </g>
          );
        })}
      </svg>
    </Card>
  );
};

// --------------------------------------------------------------- COUNTER
export const Counter: React.FC<DiagramProps> = ({ el, k }) => {
  const { theme } = useScene();
  const d = (el.data ?? {}) as { from?: number; to?: number; prefix?: string; suffix?: string; decimals?: number; label?: string };
  const from = d.from ?? 0;
  const to = d.to ?? 100;
  const v = from + (to - from) * ease("out", k);
  const dec = d.decimals ?? 0;
  const str = v.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  return (
    <div style={{ position: "absolute", left: 0, top: 0, translate: "-50% -50%", textAlign: "center", fontFamily: FONT_FAMILY, color: theme.text, width: "max-content" }}>
      <div style={{ fontSize: el.height ?? 200, fontWeight: 800, lineHeight: 1, color: el.color ?? theme.accent, letterSpacing: "-0.03em", textShadow: "0 10px 40px rgba(0,0,0,0.35)", fontVariantNumeric: "tabular-nums" }}>
        {d.prefix ?? ""}
        {str}
        {d.suffix ?? ""}
      </div>
      {d.label ? <div style={{ fontSize: 44, fontWeight: 600, marginTop: 10, opacity: Math.min(1, k * 2), textShadow: "0 4px 18px rgba(0,0,0,0.4)" }}>{d.label}</div> : null}
    </div>
  );
};

// -------------------------------------------------------------- PROGRESS
export const Progress: React.FC<DiagramProps> = ({ el, k }) => {
  const { theme } = useScene();
  const d = (el.data ?? {}) as { value?: number; label?: string };
  const v = (d.value ?? 0.75) * ease("out", k);
  const W = el.width ?? 900;
  const c = el.color ?? theme.accent;
  return (
    <div style={{ position: "absolute", left: -W / 2, top: -60, width: W, fontFamily: FONT_FAMILY, color: theme.text }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 38, fontWeight: 700, marginBottom: 16, textShadow: "0 3px 12px rgba(0,0,0,0.4)" }}>
        <span>{d.label ?? el.title ?? ""}</span>
        <span style={{ color: c }}>{Math.round(v * 100)}%</span>
      </div>
      <div style={{ height: 40, borderRadius: 20, background: "rgba(255,255,255,0.15)", overflow: "hidden", boxShadow: "inset 0 3px 8px rgba(0,0,0,0.3)" }}>
        <div style={{ width: `${v * 100}%`, height: "100%", borderRadius: 20, background: `linear-gradient(90deg, ${darken(c, 0.15)}, ${lighten(c, 0.15)})` }} />
      </div>
    </div>
  );
};
