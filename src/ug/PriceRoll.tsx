import React from "react";
import { MONO } from "./theme";

/**
 * Odometer-style number roll. `from`/`to` are integers; p is 0..1 progress.
 * Columns start rolling right-to-left with a slight stagger, each with extra spins.
 */
export const PriceRoll: React.FC<{
  from: number;
  to: number;
  p: number;
  size: number;
  color: string;
  prefix?: string;
  glow?: number;
}> = ({ from, to, p, size, color, prefix = "$", glow = 0 }) => {
  const n = Math.max(String(from).length, String(to).length);
  const a = String(from).padStart(n, "0");
  const b = String(to).padStart(n, "0");
  const h = size * 1.08;
  const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
  const cols = Array.from({ length: n }, (_, i) => {
    const fromD = Number(a[i]);
    const toD = Number(b[i]);
    const spins = n - i; // right-most column spins the most
    const local = Math.min(1, Math.max(0, (p - (n - 1 - i) * 0.06) / (1 - (n - 1) * 0.06)));
    const delta = ((toD - fromD + 10) % 10) + 10 * spins;
    const pos = fromD + delta * easeOut(local);
    const leadingZero = i < n - String(local > 0.5 ? to : from).length;
    return { pos, leadingZero };
  });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        fontFamily: MONO,
        fontWeight: 800,
        fontSize: size,
        lineHeight: `${h}px`,
        color,
        textShadow: glow ? `0 0 ${40 * glow}px ${color}` : undefined,
        letterSpacing: -2,
      }}
    >
      <span style={{ fontSize: size * 0.62, marginTop: size * 0.12, marginRight: 6, opacity: 0.85 }}>{prefix}</span>
      {cols.map((c, i) => (
        <div key={i} style={{ height: h, overflow: "hidden", width: c.leadingZero ? 0 : size * 0.62 }}>
          <div style={{ transform: `translateY(${-(c.pos % 10) * h}px)` }}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, k) => (
              <div key={k} style={{ height: h }}>
                {d}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
