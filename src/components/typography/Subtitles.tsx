import React from "react";
import { AbsoluteFill } from "remotion";
import { withAlpha } from "../../utils/color";
import { ease } from "../../utils/easing";
import { FONT_FAMILY } from "../../utils/fonts";
import type { Word } from "../../utils/narration";

export type SubtitleStyle = {
  position: "bottom" | "top";
  highlight: string;
  maxWords: number;
  size: number;
};

export type Page = { words: Word[]; start: number; end: number };

/** Groups words into readable caption pages (by count, sentence end, or pauses). */
export const paginate = (words: Word[], maxWords: number): Page[] => {
  const pages: Page[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (cur.length) pages.push({ words: cur, start: cur[0].start, end: cur[cur.length - 1].end });
    cur = [];
  };
  words.forEach((w, i) => {
    const next = words[i + 1];
    cur.push(w);
    const sentenceEnd = /[.!?…]["')\]]?$/.test(w.text);
    const clause = /[,;:—–]["')\]]?$/.test(w.text) && cur.length >= Math.ceil(maxWords * 0.6);
    const pause = next ? next.start - w.end > 0.55 : false;
    if (cur.length >= maxWords || sentenceEnd || clause || pause) flush();
  });
  flush();
  // extend each page until the next starts (no flicker in small gaps)
  for (let i = 0; i < pages.length; i++) {
    const next = pages[i + 1];
    pages[i].end = next ? Math.min(next.start, pages[i].end + 0.6) : pages[i].end + 0.6;
  }
  return pages;
};

/** Animated karaoke subtitles: the spoken word is highlighted. */
export const Subtitles: React.FC<{ words: Word[]; t: number; style: SubtitleStyle }> = ({ words, t, style }) => {
  const pages = React.useMemo(() => paginate(words, style.maxWords), [words, style.maxWords]);
  const page = pages.find((p) => t >= p.start - 0.08 && t < p.end);
  if (!page) return null;
  const k = ease("back", (t - (page.start - 0.08)) / 0.25);
  const out = ease("in", (t - (page.end - 0.15)) / 0.15);
  return (
    <AbsoluteFill
      style={{
        justifyContent: style.position === "bottom" ? "flex-end" : "flex-start",
        alignItems: "center",
        paddingBottom: style.position === "bottom" ? 70 : 0,
        paddingTop: style.position === "top" ? 60 : 0,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: 1500,
          textAlign: "center",
          fontFamily: FONT_FAMILY,
          fontWeight: 800,
          fontSize: style.size,
          lineHeight: 1.35,
          color: "#ffffff",
          padding: "14px 30px",
          borderRadius: 22,
          background: withAlpha("#0b1020", 0.55),
          boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
          opacity: Math.min(1, k * 2) * (1 - Math.max(0, out)),
          scale: String(0.92 + 0.08 * Math.max(0, Math.min(1.05, k))),
          translate: `0 ${(1 - Math.min(1, k)) * 14}px`,
        }}
      >
        {page.words.map((w, i) => {
          const active = t >= w.start && t <= w.end + 0.05;
          const spoken = t > w.end;
          const ak = active ? ease("out", (t - w.start) / 0.12) : 0;
          return (
            <React.Fragment key={i}>
              <span
                style={{
                  display: "inline-block",
                  padding: "0 0.14em",
                  borderRadius: 10,
                  background: active ? withAlpha(style.highlight, 0.95 * ak) : "transparent",
                  color: active ? "#14141f" : spoken ? "#ffffff" : "rgba(255,255,255,0.78)",
                  scale: String(1 + 0.06 * ak),
                  textShadow: active ? "none" : "0 2px 6px rgba(0,0,0,0.45)",
                }}
              >
                {w.text}
              </span>{" "}
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
