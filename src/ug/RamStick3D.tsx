import React from "react";
import { DISPLAY, MONO } from "./theme";

/**
 * Original DDR5 desktop module built from CSS 3D faces (no external model).
 * W×H front face, depth D. rotY/rotX in degrees; glow 0..1 drives the RGB bar.
 */
export const RamStick3D: React.FC<{ rotY: number; rotX: number; scale?: number; glow?: number; hue?: number }> = ({
  rotY,
  rotX,
  scale = 1,
  glow = 1,
  hue = 150,
}) => {
  const W = 1040;
  const H = 300;
  const D = 26;
  const pcbH = 62;
  // specular sheen follows the rotation
  const sheen = 50 + rotY * 2.2;
  const face: React.CSSProperties = { position: "absolute", backfaceVisibility: "hidden" };
  const metal = (deg: number) =>
    `linear-gradient(${deg}deg, #15181d 0%, #2b3038 38%, #4a515c 50%, #22262d 62%, #101216 100%)`;
  const rgb = `linear-gradient(90deg, hsl(${hue},100%,55%), hsl(${hue + 60},100%,60%), hsl(${hue + 140},100%,60%), hsl(${hue},100%,55%))`;

  const Front = (
    <div style={{ ...face, width: W, height: H, transform: `translateZ(${D / 2}px)`, overflow: "hidden", borderRadius: 6 }}>
      {/* heat spreader with chamfered top corners */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: W,
          height: H - pcbH + 8,
          background: metal(100),
          clipPath: "polygon(0 18%, 4% 0, 38% 0, 41% 9%, 59% 9%, 62% 0, 96% 0, 100% 18%, 100% 100%, 0 100%)",
        }}
      >
        {/* brushed texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 2px, rgba(0,0,0,0.03) 2px 4px)",
          }}
        />
        {/* moving sheen */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(105deg, rgba(255,255,255,0) ${sheen - 14}%, rgba(255,255,255,0.28) ${sheen}%, rgba(255,255,255,0) ${sheen + 14}%)`,
          }}
        />
        {/* RGB light bar */}
        <div
          style={{
            position: "absolute",
            left: "5%",
            right: "5%",
            top: 30,
            height: 14,
            borderRadius: 7,
            background: rgb,
            opacity: 0.25 + 0.75 * glow,
            boxShadow: `0 0 ${30 * glow}px hsla(${hue},100%,60%,${0.8 * glow})`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 70,
            top: 92,
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: 92,
            letterSpacing: 6,
            color: "rgba(230,236,242,0.92)",
            textShadow: "0 2px 0 rgba(0,0,0,0.6), 0 -1px 0 rgba(255,255,255,0.25)",
          }}
        >
          DDR5
        </div>
        <div
          style={{
            position: "absolute",
            right: 70,
            top: 116,
            textAlign: "right",
            fontFamily: MONO,
            fontWeight: 700,
            color: "rgba(200,210,220,0.75)",
            fontSize: 26,
            letterSpacing: 4,
            lineHeight: 1.3,
          }}
        >
          6000 MT/s
          <br />
          <span style={{ fontSize: 20, color: "rgba(200,210,220,0.5)" }}>2 × 16 GB · CL30</span>
        </div>
      </div>
      {/* PCB + gold contacts */}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: W,
          height: pcbH,
          background: "linear-gradient(180deg, #0f1a14, #08100c)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ position: "absolute", left: 18, right: 18, bottom: 4, height: 30, display: "flex", gap: 3 }}>
          {Array.from({ length: 82 }, (_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                marginLeft: i === 41 ? 26 : 0,
                background: "linear-gradient(180deg, #f7d67a, #b8862a 60%, #e9c25d)",
                borderRadius: "1px 1px 2px 2px",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const edge = (w: number, h: number, t: string): React.CSSProperties => ({
    ...face,
    width: w,
    height: h,
    left: (W - w) / 2,
    top: (H - h) / 2,
    transform: t,
    background: "linear-gradient(90deg, #0c0e11, #2a2f36, #0c0e11)",
  });

  return (
    <div style={{ width: W, height: H, transformStyle: "preserve-3d", transform: `scale(${scale}) rotateX(${rotX}deg) rotateY(${rotY}deg)` }}>
      {Front}
      <div style={{ ...face, width: W, height: H, transform: `rotateY(180deg) translateZ(${D / 2}px)`, background: metal(80), borderRadius: 6 }} />
      <div style={edge(W, D, `rotateX(90deg) translateZ(${H / 2}px)`)} />
      <div style={edge(W, D, `rotateX(-90deg) translateZ(${H / 2}px)`)} />
      <div style={edge(D, H, `rotateY(-90deg) translateZ(${W / 2}px)`)} />
      <div style={edge(D, H, `rotateY(90deg) translateZ(${W / 2}px)`)} />
    </div>
  );
};
