import React from "react";
import { random } from "remotion";
import { useScene } from "../../scenes/context";
import { ease } from "../../utils/easing";
import { normalizeWord } from "../../utils/narration";
import { FONT_FAMILY } from "../../utils/fonts";
import { DISPLAY_FONT } from "../anime/fonts";
import { withAlpha } from "../../utils/color";
import type { TextElementT } from "../../utils/schema";

const STYLE: Record<string, { size: number; weight: number; lineHeight: number }> = {
  title: { size: 112, weight: 800, lineHeight: 1.05 },
  headline: { size: 76, weight: 800, lineHeight: 1.1 },
  subtitle: { size: 46, weight: 600, lineHeight: 1.25 },
  label: { size: 36, weight: 700, lineHeight: 1.2 },
  caption: { size: 32, weight: 500, lineHeight: 1.3 },
  quote: { size: 56, weight: 600, lineHeight: 1.3 },
  number: { size: 180, weight: 800, lineHeight: 1 },
  /** premium anime title: heavy display face, white with a coloured glow */
  anime: { size: 150, weight: 400, lineHeight: 1.05 },
};

/** Liquid drips hanging from a word; they grow after the word appears. */
export const Drips: React.FC<{ word: string; idx: number; local: number; color: string; length?: number }> = ({ word, idx, local, color, length = 1 }) => {
  const n = word.length > 5 ? 3 : word.length > 2 ? 2 : 1;
  return (
    <>
      {Array.from({ length: n }).map((_, k) => {
        const x = 12 + random(`drip${word}${idx}${k}`) * 76;
        const maxH = (0.45 + random(`driph${word}${idx}${k}`) * 1.0) * length;
        const g = ease("out", (local - 0.5 - idx * 0.12 - k * 0.25) / (1.4 + maxH));
        const h = g * maxH;
        const w = 0.1 + random(`dripw${word}${idx}${k}`) * 0.06;
        return (
          <span
            key={k}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: "0.78em",
              filter: "drop-shadow(0 0.04em 0.06em rgba(0,0,0,0.45))",
              width: `${w}em`,
              height: `${h}em`,
              background: color,
              borderRadius: `0 0 ${w}em ${w}em`,
              translate: "-50% 0",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: "50%",
                bottom: `-${w * 0.55}em`,
                width: `${w * 1.6}em`,
                height: `${w * 1.75}em`,
                borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%",
                background: color,
                translate: "-50% 0",
                opacity: h > 0.02 ? 1 : 0,
              }}
            />
          </span>
        );
      })}
    </>
  );
};

/** Text centred on its origin. `local` = seconds since the element appeared. */
export const TextBlock: React.FC<{ el: TextElementT; local: number }> = ({ el, local }) => {
  const { theme } = useScene();
  const style = el.style ?? "headline";
  const st = STYLE[style] ?? STYLE.headline;
  const size = el.size ?? st.size;
  const color = el.color ?? theme.text;
  const accent = theme.accent;
  const highlight = new Set((el.highlight ?? []).map(normalizeWord));
  const reveal = el.reveal ?? (style === "title" || style === "headline" ? "words" : "none");
  const words = el.text.split(/(\s+)/);
  const dripColor = el.drip ? (typeof el.drip === "string" ? el.drip : "#9b111e") : null;

  let charBudget = Infinity;
  if (reveal === "typewriter") charBudget = Math.floor(local * 28);
  let wordIndex = 0;
  let charCount = 0;

  const content = words.map((w, i) => {
    if (/^\s+$/.test(w)) return <span key={i}>{w}</span>;
    const idx = wordIndex++;
    const isHi = highlight.has(normalizeWord(w));
    let opacity = 1;
    let dy = 0;
    const scale = 1;
    if (reveal === "words") {
      const k = ease("out", (local - idx * 0.09) / 0.45);
      opacity = Math.min(1, k * 1.5);
      dy = (1 - k) * 40;
    } else if (reveal === "typewriter") {
      const visible = Math.max(0, Math.min(w.length, charBudget - charCount));
      charCount += w.length + 1;
      return (
        <span key={i} style={{ color: isHi ? accent : undefined }}>
          {w.slice(0, visible)}
          <span style={{ opacity: 0 }}>{w.slice(visible)}</span>
        </span>
      );
    } else if (reveal === "letters") {
      return (
        <span key={i} style={{ display: "inline-block", color: isHi ? accent : undefined }}>
          {w.split("").map((ch, k) => {
            const kk = ease("back", (local - (charCount + k) * 0.03) / 0.35);
            if (k === w.length - 1) charCount += w.length;
            return (
              <span key={k} style={{ display: "inline-block", opacity: Math.min(1, kk * 2), translate: `0 ${(1 - kk) * 30}px`, scale: String(Math.max(0.01, kk)) }}>
                {ch}
              </span>
            );
          })}
        </span>
      );
    }
    if (isHi) {
      const hk = ease("out", (local - 0.3 - idx * 0.09) / 0.4);
      return (
        <span key={i} style={{ display: "inline-block", position: "relative", opacity, translate: `0 ${dy}px`, scale: String(scale), color: style === "label" ? color : accent }}>
          {style !== "label" ? (
            <span
              style={{
                position: "absolute",
                left: -6,
                right: -6,
                bottom: "0.08em",
                height: "0.32em",
                background: withAlpha(accent, 0.35),
                borderRadius: 6,
                transformOrigin: "left",
                scale: `${hk} 1`,
                zIndex: -1,
              }}
            />
          ) : null}
          {w}
          {dripColor ? <Drips word={w} idx={idx} local={local} color={dripColor} /> : null}
        </span>
      );
    }
    return (
      <span key={i} style={{ display: "inline-block", position: dripColor ? "relative" : undefined, opacity, translate: `0 ${dy}px` }}>
        {w}
        {dripColor ? <Drips word={w} idx={idx} local={local} color={dripColor} /> : null}
      </span>
    );
  });

  const align = el.align ?? "center";
  const pill = style === "label" || el.background;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        translate: align === "center" ? "-50% -50%" : align === "right" ? "-100% -50%" : "0 -50%",
        width: "max-content",
        maxWidth: el.maxWidth ?? (style === "title" ? 1600 : 1400),
        fontFamily: style === "anime" ? DISPLAY_FONT : FONT_FAMILY,
        fontSize: size,
        fontWeight: st.weight,
        lineHeight: st.lineHeight,
        color,
        textAlign: align,
        whiteSpace: "pre-wrap",
        letterSpacing: style === "title" || style === "number" ? "-0.02em" : style === "anime" ? "0.06em" : undefined,
        textShadow: pill
          ? undefined
          : style === "anime"
            ? `0 0 26px ${withAlpha(accent, 0.85)}, 0 0 8px ${withAlpha(accent, 0.6)}, 0 7px 0 ${theme.dark}`
            : "0 6px 24px rgba(0,0,0,0.35), 0 2px 4px rgba(0,0,0,0.3)",
        background: pill ? el.background ?? withAlpha(theme.dark, 0.85) : undefined,
        padding: pill ? "0.35em 0.8em" : undefined,
        borderRadius: pill ? 999 : undefined,
        boxShadow: pill ? "0 10px 30px rgba(0,0,0,0.25)" : undefined,
        fontStyle: style === "quote" ? "italic" : undefined,
        isolation: "isolate",
      }}
    >
      {style === "quote" ? <span style={{ color: accent, fontSize: "1.6em", lineHeight: 0, verticalAlign: "-0.35em", marginRight: 8 }}>“</span> : null}
      {content}
      {style === "quote" ? <span style={{ color: accent, fontSize: "1.6em", lineHeight: 0, verticalAlign: "-0.35em", marginLeft: 8 }}>”</span> : null}
    </div>
  );
};
