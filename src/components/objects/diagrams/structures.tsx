import React from "react";
import { darken, lighten, withAlpha } from "../../../utils/color";
import { useScene } from "../../../scenes/context";
import { ease } from "../../../utils/easing";
import { FONT_FAMILY } from "../../../utils/fonts";
import { ObjectView, OBJECTS } from "../registry";
import { Card, PALETTE, type DiagramProps } from "./charts";

// ------------------------------------------------------------------ FLOW
type FlowNode = { id: string; label: string; x?: number; y?: number; color?: string; icon?: string; object?: string };
type FlowEdge = [string, string, string?] | { from: string; to: string; label?: string };

/**
 * data: { nodes: [{id, label, x?, y?, icon?, object?}], edges: [["a","b","label?"]] }
 * x/y are 0..1 within the diagram (auto horizontal layout when omitted).
 */
export const Flow: React.FC<DiagramProps> = ({ el, k, local }) => {
  const { theme } = useScene();
  const d = (el.data ?? {}) as { nodes?: FlowNode[]; edges?: FlowEdge[] };
  const nodes = d.nodes ?? [];
  const edges = (d.edges ?? []).map((e) => (Array.isArray(e) ? { from: e[0], to: e[1], label: e[2] } : e));
  const W = el.width ?? 1500;
  const H = el.height ?? 600;
  const pos = new Map<string, [number, number]>();
  nodes.forEach((n, i) => {
    const x = n.x !== undefined ? n.x : nodes.length === 1 ? 0.5 : 0.1 + (i / (nodes.length - 1)) * 0.8;
    const y = n.y !== undefined ? n.y : 0.55;
    pos.set(n.id, [x * W - W / 2, y * H - H / 2]);
  });
  const nW = Math.min(300, (W / Math.max(1, nodes.length)) * 0.72);
  const nH = 120;
  const steps = nodes.length + edges.length;
  const stepK = (i: number) => ease("out", k * steps - i);
  return (
    <div style={{ position: "absolute", left: 0, top: 0 }}>
      {el.title ? (
        <div style={{ position: "absolute", left: 0, top: -H / 2 - 30, translate: "-50% 0", width: "max-content", fontFamily: FONT_FAMILY, fontSize: 52, fontWeight: 800, color: theme.text, textShadow: "0 4px 18px rgba(0,0,0,0.4)" }}>
          {el.title}
        </div>
      ) : null}
      <svg width={1} height={1} style={{ position: "absolute", overflow: "visible" }}>
        <defs>
          <marker id={`ah-${el.id ?? "f"}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill={theme.accent} />
          </marker>
        </defs>
        {edges.map((e, i) => {
          const a = pos.get(e.from);
          const b = pos.get(e.to);
          if (!a || !b) return null;
          const kk = stepK(i * 2 + 1);
          const dx = b[0] - a[0];
          const dy = b[1] - a[1];
          const len = Math.hypot(dx, dy) || 1;
          const ux = dx / len;
          const uy = dy / len;
          const padA = Math.abs(ux) > Math.abs(uy) ? nW / 2 + 14 : nH / 2 + 14;
          const sx = a[0] + ux * padA;
          const sy = a[1] + uy * padA;
          const ex = b[0] - ux * padA;
          const ey = b[1] - uy * padA;
          const L = Math.hypot(ex - sx, ey - sy);
          const flow = (local * 80) % 40;
          return (
            <g key={i} opacity={kk > 0 ? 1 : 0}>
              <line x1={sx} y1={sy} x2={sx + (ex - sx) * Math.max(0, kk)} y2={sy + (ey - sy) * Math.max(0, kk)} stroke={theme.accent} strokeWidth={8} strokeLinecap="round" markerEnd={kk > 0.95 ? `url(#ah-${el.id ?? "f"})` : undefined} />
              {kk > 0.95 ? (
                <line x1={sx} y1={sy} x2={ex} y2={ey} stroke="#fff" strokeWidth={3} strokeDasharray="6 34" strokeDashoffset={-flow} opacity={0.6} strokeLinecap="round" />
              ) : null}
              {e.label && kk > 0.5 ? (
                <text x={(sx + ex) / 2} y={(sy + ey) / 2 - 22} textAnchor="middle" fontFamily={FONT_FAMILY} fontSize={28} fontWeight={600} fill={theme.text} opacity={Math.min(1, (kk - 0.5) * 2)}>
                  {e.label}
                </text>
              ) : null}
              <title>{String(L)}</title>
            </g>
          );
        })}
      </svg>
      {nodes.map((n, i) => {
        const p = pos.get(n.id)!;
        // appear at the node's first use: as a source (edge step) or as a target (after its edge draws) — keeps loops intact
        const uses = edges.flatMap((e, ei) => [...(e.from === n.id ? [ei * 2] : []), ...(e.to === n.id ? [ei * 2 + 2] : [])]);
        const kk = stepK(uses.length ? Math.min(...uses) : 0);
        const c = n.color ?? PALETTE[i % PALETTE.length];
        return (
          <div
            key={n.id}
            style={{
              position: "absolute",
              left: p[0] - nW / 2,
              top: p[1] - nH / 2,
              width: nW,
              minHeight: nH,
              borderRadius: 28,
              background: `linear-gradient(160deg, ${lighten(c, 0.1)}, ${darken(c, 0.15)})`,
              boxShadow: `0 20px 50px ${withAlpha(darken(c, 0.5), 0.5)}, inset 0 2px 0 rgba(255,255,255,0.25)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT_FAMILY,
              fontSize: 32,
              fontWeight: 700,
              color: "#fff",
              textAlign: "center",
              padding: "14px 18px",
              boxSizing: "border-box",
              opacity: Math.max(0, Math.min(1, kk * 2)),
              scale: String(Math.max(0.01, ease("back", Math.max(0, Math.min(1, kk))))),
            }}
          >
            {n.object ? (
              <svg width={nW - 40} height={110} viewBox="-150 -150 300 300" style={{ overflow: "visible", marginBottom: 6 }}>
                {(() => {
                  const def = OBJECTS[n.object.toLowerCase()];
                  const s = def ? Math.min(280 / def.w, 280 / def.h) : 1;
                  const dy = def && (def.anchor ?? "ground") === "ground" ? (def.h * s) / 2 : 0;
                  return (
                    <g transform={`translate(0 ${dy}) scale(${s})`}>
                      <ObjectView type={n.object} t={local} lighting={0} />
                    </g>
                  );
                })()}
              </svg>
            ) : null}
            {n.label}
          </div>
        );
      })}
    </div>
  );
};

// -------------------------------------------------------------- TIMELINE
/** data: [{ "label": "1969", "text": "Moon landing" }] */
export const Timeline: React.FC<DiagramProps> = ({ el, k }) => {
  const { theme } = useScene();
  const items = (Array.isArray(el.data) ? el.data : []) as { label: string; text?: string; color?: string }[];
  const W = el.width ?? 1600;
  const n = items.length;
  const lineK = ease("inOut", Math.min(1, k * 1.4));
  return (
    <div style={{ position: "absolute", left: 0, top: 0, fontFamily: FONT_FAMILY, color: theme.text }}>
      {el.title ? (
        <div style={{ position: "absolute", top: -340, left: 0, translate: "-50% 0", width: "max-content", fontSize: 56, fontWeight: 800, textShadow: "0 4px 18px rgba(0,0,0,0.4)" }}>{el.title}</div>
      ) : null}
      <div style={{ position: "absolute", left: -W / 2, top: -5, width: W * lineK, height: 10, borderRadius: 5, background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})`, boxShadow: "0 4px 18px rgba(0,0,0,0.3)" }} />
      {items.map((it, i) => {
        const x = n === 1 ? 0 : -W / 2 + 60 + (i / (n - 1)) * (W - 120);
        const kk = ease("back", (lineK * W - (x + W / 2)) / 160);
        const up = i % 2 === 0;
        const c = it.color ?? PALETTE[i % PALETTE.length];
        return (
          <div key={i} style={{ position: "absolute", left: x, top: 0, opacity: Math.max(0, Math.min(1, kk * 2)) }}>
            <div style={{ position: "absolute", left: -22, top: -22, width: 44, height: 44, borderRadius: 22, background: c, border: "6px solid #fff", boxSizing: "border-box", scale: String(Math.max(0.01, kk)) }} />
            <div style={{ position: "absolute", left: -2, top: up ? -90 : 22, width: 4, height: 68, background: withAlpha("#ffffff", 0.5) }} />
            <div style={{ position: "absolute", left: 0, top: up ? -200 : 100, translate: "-50% 0", width: 280, textAlign: "center" }}>
              <div style={{ fontSize: 44, fontWeight: 800, color: c, textShadow: "0 3px 12px rgba(0,0,0,0.35)" }}>{it.label}</div>
              {it.text ? <div style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.25, textShadow: "0 3px 12px rgba(0,0,0,0.5)" }}>{it.text}</div> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ------------------------------------------------------------------ LIST
/** data: ["point one", "point two"] or [{ "text": "…", "icon": "check" }] */
export const List: React.FC<DiagramProps> = ({ el, k, local }) => {
  const { theme } = useScene();
  const items = (Array.isArray(el.data) ? el.data : []).map((d: unknown) => (typeof d === "string" ? { text: d } : (d as { text: string; icon?: string })));
  const W = el.width ?? 1000;
  const rowH = 110;
  const H = (el.title ? 130 : 50) + items.length * rowH + 30;
  return (
    <Card w={W} h={H} title={el.title}>
      {items.map((it, i) => {
        const kk = ease("out", k * (items.length + 0.5) - i);
        return (
          <div key={i} style={{ position: "absolute", left: 48 + (1 - kk) * 60, top: (el.title ? 120 : 40) + i * rowH, display: "flex", alignItems: "center", gap: 28, opacity: Math.max(0, Math.min(1, kk)), width: W - 100 }}>
            <svg width={70} height={70} viewBox="-90 -90 180 180" style={{ flexShrink: 0, overflow: "visible" }}>
              <ObjectView type="icon" t={local} lighting={0} props={{ name: it.icon ?? "check" }} color={it.icon ? undefined : PALETTE[(i + 3) % PALETTE.length]} />
            </svg>
            <div style={{ fontSize: 40, fontWeight: 600, lineHeight: 1.2, color: theme.text }}>{it.text}</div>
          </div>
        );
      })}
    </Card>
  );
};

// --------------------------------------------------------------- COMPARE
/** data: { left: { title, items[], color }, right: { … } } */
export const Compare: React.FC<DiagramProps> = ({ el, k }) => {
  const { theme } = useScene();
  const d = (el.data ?? {}) as Record<"left" | "right", { title?: string; items?: string[]; color?: string }>;
  const W = el.width ?? 1500;
  const H = el.height ?? 640;
  const col = (side: "left" | "right", i: number) => {
    const c = d[side]?.color ?? (side === "left" ? "#ef476f" : "#06d6a0");
    const kk = ease("out", k * 1.6 - i * 0.3);
    return (
      <div style={{ position: "absolute", left: side === "left" ? -W / 2 : 30, top: -H / 2, width: W / 2 - 30, height: H, borderRadius: 36, background: `linear-gradient(170deg, ${withAlpha(c, 0.95)}, ${withAlpha(darken(c, 0.35), 0.95)})`, boxShadow: "0 30px 70px rgba(0,0,0,0.35)", opacity: Math.max(0, Math.min(1, kk)), translate: `0 ${(1 - kk) * 60}px`, fontFamily: FONT_FAMILY, color: "#fff", padding: "40px 48px", boxSizing: "border-box" }}>
        <div style={{ fontSize: 54, fontWeight: 800, marginBottom: 26 }}>{d[side]?.title ?? ""}</div>
        {(d[side]?.items ?? []).map((it, j) => {
          const ik = ease("out", k * 4 - 1 - j * 0.5 - i * 0.3);
          return (
            <div key={j} style={{ fontSize: 36, fontWeight: 600, margin: "14px 0", opacity: Math.max(0, Math.min(1, ik)), translate: `${(1 - ik) * 30}px 0`, display: "flex", gap: 16 }}>
              <span style={{ opacity: 0.8 }}>{side === "left" ? "✕" : "✓"}</span>
              {it}
            </div>
          );
        })}
      </div>
    );
  };
  return (
    <div style={{ position: "absolute", left: 0, top: 0 }}>
      {col("left", 0)}
      {col("right", 1)}
      <div style={{ position: "absolute", left: -55, top: -55, width: 110, height: 110, borderRadius: 55, background: theme.dark, border: `6px solid ${theme.text}`, color: theme.text, fontFamily: FONT_FAMILY, fontWeight: 800, fontSize: 40, display: "flex", alignItems: "center", justifyContent: "center", scale: String(Math.max(0.01, ease("back", k * 2 - 0.6))) }}>VS</div>
    </div>
  );
};

