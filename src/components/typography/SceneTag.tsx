import React from "react";
import { FONT_FAMILY } from "../../utils/fonts";
import { ease } from "../../utils/easing";
import type { SceneTagT } from "../../utils/schema";

const PRESETS: Record<"real" | "hypothetical", { text: string; color: string; icon: string }> = {
  real: { text: "REAL EVENT", color: "#2a9d8f", icon: "✓" },
  hypothetical: { text: "HYPOTHETICAL", color: "#e9a23b", icon: "?" },
};

/**
 * Small corner label so viewers always know whether they are seeing documented
 * facts or a thought experiment. Screen-space, top-right, slides in with the scene.
 */
export const SceneTag: React.FC<{ tag: SceneTagT | undefined; t: number; duration: number }> = ({ tag, t, duration }) => {
  if (!tag || tag === "none") return null;
  const spec = typeof tag === "string" ? PRESETS[tag] : { text: tag.text, color: tag.color ?? "#e9a23b", icon: "•" };
  const kin = ease("out", (t - 0.15) / 0.5);
  const kout = ease("in", (duration - t - 0.05) / 0.3);
  const k = Math.max(0, Math.min(kin, kout));
  return (
    <div
      style={{
        position: "absolute",
        top: 44,
        right: 52,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "9px 20px 9px 10px",
        borderRadius: 999,
        background: "rgba(10,12,22,0.62)",
        border: `2px solid ${spec.color}`,
        boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
        fontFamily: FONT_FAMILY,
        fontWeight: 700,
        fontSize: 24,
        letterSpacing: "0.12em",
        color: "#ffffff",
        opacity: k,
        translate: `${(1 - k) * 40}px 0`,
      }}
    >
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: 999,
          background: spec.color,
          display: "grid",
          placeItems: "center",
          fontSize: 20,
          letterSpacing: 0,
          color: "#0b0d16",
        }}
      >
        {spec.icon}
      </span>
      {spec.text}
    </div>
  );
};
