import React from "react";
import { geoArea, geoGraticule10, geoMercator, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { feature, mesh } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import worldTopo from "world-atlas/countries-50m.json";
import usTopo from "us-atlas/states-10m.json";
import { useScene } from "../../../scenes/context";
import { darken, lighten, withAlpha } from "../../../utils/color";
import { ease } from "../../../utils/easing";
import { FONT_FAMILY } from "../../../utils/fonts";
import { ObjectView } from "../registry";
import { PALETTE, type DiagramProps } from "./charts";

/*
 * Real-geography map built from Natural Earth (world-atlas, public domain) and
 * US Census state outlines (us-atlas). Geometry is projected ONCE at a base scale
 * (Mercator) and the camera zooms with an SVG transform, so frames stay cheap.
 */

type LonLat = [number, number];
const BASE_W = 1600; // world width at zoom 1 (projected units)
const proj = geoMercator().scale(BASE_W / (2 * Math.PI)).translate([0, 0]).precision(0.2);
const pathGen = geoPath(proj);
const P = (ll: LonLat): [number, number] => proj(ll) ?? [0, 0];

type Shape = { name: string; d: string; centroid: [number, number] };
let cache: { countries: Shape[]; borders: string; land: string; states: Shape[]; stateBorders: string; graticule: string } | null = null;
const geo = () => {
  if (cache) return cache;
  const w = worldTopo as unknown as Topology<{ countries: GeometryCollection<{ name: string }>; land: GeometryCollection }>;
  const u = usTopo as unknown as Topology<{ states: GeometryCollection<{ name: string }>; nation: GeometryCollection }>;
  const toShapes = (fc: { features: { properties: { name: string } | null; geometry: unknown }[] }) =>
    fc.features.map((f) => ({ name: f.properties?.name ?? "", d: pathGen(f as unknown as GeoPermissibleObjects) ?? "", centroid: pathGen.centroid(f as unknown as GeoPermissibleObjects) as [number, number] }));
  cache = {
    countries: toShapes(feature(w, w.objects.countries) as never),
    borders: pathGen(mesh(w, w.objects.countries, (a, b) => a !== b)) ?? "",
    land: pathGen(feature(w, w.objects.land) as never) ?? "",
    states: toShapes(feature(u, u.objects.states) as never),
    stateBorders: pathGen(mesh(u, u.objects.states, (a, b) => a !== b)) ?? "",
    graticule: pathGen(geoGraticule10()) ?? "",
  };
  return cache;
};

/** Hand-traced lon/lat presets for features Natural Earth's admin-0 data doesn't include. */
export const GEO_PRESETS: Record<string, { line?: boolean; coords: LonLat[] }> = {
  kerala: {
    coords: [
      [74.86, 12.78], [75.2, 12.2], [75.5, 11.7], [75.8, 11.2], [75.95, 10.8], [76.15, 10.2], [76.25, 9.7], [76.35, 9.3], [76.5, 8.9], [76.9, 8.5], [77.1, 8.3],
      [77.25, 8.5], [77.15, 9.0], [77.3, 9.5], [77.2, 10.0], [76.85, 10.3], [76.85, 10.8], [76.5, 11.2], [76.4, 11.6], [76.0, 11.9], [75.8, 12.3], [75.4, 12.6], [75.1, 12.9],
    ],
  },
  mississippi: {
    line: true,
    coords: [
      [-95.2, 47.24], [-94.3, 46.4], [-93.9, 45.6], [-93.27, 44.98], [-92.3, 44.5], [-91.25, 43.8], [-91.1, 43.0], [-90.66, 42.5], [-90.5, 41.5], [-91.1, 40.6],
      [-91.4, 39.8], [-90.6, 39.1], [-90.18, 38.63], [-89.6, 37.8], [-89.18, 37.0], [-89.6, 36.3], [-90.05, 35.15], [-90.6, 34.4], [-91.1, 33.9], [-91.0, 33.1],
      [-90.9, 32.35], [-91.3, 31.6], [-91.6, 31.0], [-91.19, 30.45], [-90.6, 30.1], [-90.07, 29.95], [-89.6, 29.5], [-89.25, 29.15],
    ],
  },
  missouri: {
    line: true,
    coords: [[-111.5, 45.9], [-110.0, 47.0], [-108.5, 47.6], [-106.0, 48.0], [-104.0, 48.0], [-101.4, 47.3], [-100.4, 44.4], [-98.5, 43.0], [-97.4, 42.8], [-96.0, 41.3], [-95.0, 40.0], [-94.6, 39.1], [-93.0, 38.9], [-92.2, 38.6], [-90.12, 38.82]],
  },
  ohio: {
    line: true,
    coords: [[-80.0, 40.44], [-80.7, 39.9], [-81.6, 39.3], [-82.6, 38.6], [-83.6, 38.7], [-84.5, 39.1], [-85.76, 38.25], [-86.6, 37.9], [-87.6, 37.97], [-88.2, 37.5], [-88.5, 37.1], [-89.18, 37.0]],
  },
  "mulberry-fork": {
    line: true,
    coords: [[-86.95, 34.25], [-87.05, 34.05], [-87.15, 33.85], [-87.25, 33.7], [-87.35, 33.6]],
  },
  "deadzone-2024": {
    coords: [
      [-89.3, 29.0], [-89.9, 28.6], [-90.6, 28.45], [-91.4, 28.4], [-92.2, 28.5], [-93.0, 28.7], [-93.8, 29.0], [-93.9, 29.45], [-93.2, 29.6], [-92.4, 29.45], [-91.6, 29.25], [-90.8, 29.1], [-90.2, 29.15], [-89.6, 29.3],
    ],
  },
};

type Tw = { t: number; center: LonLat; zoom: number };
type MapShape = {
  preset?: string;
  coords?: LonLat[];
  country?: string;
  state?: string;
  line?: boolean;
  color?: string;
  label?: string;
  at?: number;
  /** seconds to draw a line / grow a polygon */
  duration?: number;
  grow?: boolean;
  pulse?: boolean;
  opacity?: number;
  /** slide the shape so its centre lands on this lon/lat (e.g. New Jersey over the Gulf for scale) */
  move?: { to: LonLat; at?: number; duration?: number };
  width?: number;
  /** screen-px offset for the label, e.g. [160, 0] to put it beside a thin region */
  labelOffset?: [number, number];
};
type MapData = {
  pins?: { lon: number; lat: number; label?: string; color?: string; at?: number }[];
  route?: LonLat[];
  focus?: LonLat;
  zoom?: number;
  /** camera keyframes: [{ t, center: [lon, lat], zoom }] */
  views?: Tw[];
  highlight?: { country?: string; state?: string; color?: string; at?: number; pulse?: boolean }[];
  shapes?: MapShape[];
  labels?: { lon: number; lat: number; text: string; at?: number; size?: number; color?: string }[];
  markers?: { lon: number; lat: number; object: string; size?: number; at?: number; color?: string }[];
  /** draw US state borders */
  states?: boolean;
  land?: string;
  sea?: string;
  graticule?: boolean;
};

const DEFAULT_CENTER: LonLat = [10, 15];

const camera = (views: Tw[], t: number): { c: [number, number]; z: number } => {
  const proj0 = (v: Tw) => ({ c: P(v.center), z: v.zoom });
  if (views.length === 0) return { c: P(DEFAULT_CENTER), z: 1 };
  if (t <= views[0].t) return proj0(views[0]);
  for (let i = 1; i < views.length; i++) {
    if (t <= views[i].t) {
      const a = proj0(views[i - 1]);
      const b = proj0(views[i]);
      const k = ease("inOut", (t - views[i - 1].t) / Math.max(0.001, views[i].t - views[i - 1].t));
      // zoom interpolates geometrically; centre follows the zoom so the flight feels natural
      const z = a.z * Math.pow(b.z / a.z, k);
      const kc = a.z === b.z ? k : (1 / a.z - 1 / z) / (1 / a.z - 1 / b.z);
      return { c: [a.c[0] + (b.c[0] - a.c[0]) * kc, a.c[1] + (b.c[1] - a.c[1]) * kc], z };
    }
  }
  return proj0(views[views.length - 1]);
};

const appear = (local: number, at: number | undefined, dur = 0.6) => (at === undefined ? 1 : ease("out", (local - at) / dur));

export const GeoMap: React.FC<DiagramProps> = ({ el, k, local }) => {
  const { theme } = useScene();
  const d = (el.data ?? {}) as MapData;
  const g = geo();
  const W = el.width ?? 1600;
  const H = el.height ?? 820;
  const land = d.land ?? "#57cc99";
  const sea = d.sea ?? "#1d4e89";
  const views: Tw[] =
    d.views && d.views.length
      ? [...d.views].sort((a, b) => a.t - b.t)
      : d.focus
        ? [
            { t: 0, center: DEFAULT_CENTER, zoom: 1 },
            { t: 2.5, center: d.focus, zoom: d.zoom ?? 1 },
          ]
        : [{ t: 0, center: DEFAULT_CENTER, zoom: d.zoom ?? 1 }];
  const cam = camera(views, local);
  const z = (cam.z * W) / BASE_W;
  const inv = 1 / z; // multiply screen-px sizes by this inside the zoomed group
  const id = `geo-${el.id ?? "m"}`;
  const pinsN = d.pins?.length ?? 0;

  // legacy curved route
  const routePts = (d.route ?? []).map(P);
  let routeD = "";
  routePts.forEach((p, i) => {
    if (i === 0) routeD = `M${p[0]},${p[1]}`;
    else {
      const prev = routePts[i - 1];
      const mx = (prev[0] + p[0]) / 2;
      const my = (prev[1] + p[1]) / 2 - Math.hypot(p[0] - prev[0], p[1] - prev[1]) * 0.25;
      routeD += ` Q${mx},${my} ${p[0]},${p[1]}`;
    }
  });

  const routeLen = routePts.reduce((a, p, i) => (i ? a + Math.hypot(p[0] - routePts[i - 1][0], p[1] - routePts[i - 1][1]) * 1.15 : 0), 0);

  const shapePath = (s: MapShape): { d: string; c: [number, number]; line: boolean; len: number } | null => {
    if (s.country) {
      const f = g.countries.find((c) => c.name.toLowerCase() === s.country!.toLowerCase());
      return f ? { d: f.d, c: f.centroid, line: false, len: 0 } : null;
    }
    if (s.state) {
      const f = g.states.find((c) => c.name.toLowerCase() === s.state!.toLowerCase());
      return f ? { d: f.d, c: f.centroid, line: false, len: 0 } : null;
    }
    const pre = s.preset ? GEO_PRESETS[s.preset] : undefined;
    const coords = s.coords ?? pre?.coords;
    if (!coords) return null;
    const line = s.line ?? pre?.line ?? false;
    let geom: GeoPermissibleObjects = line ? { type: "LineString", coordinates: coords } : { type: "Polygon", coordinates: [[...coords, coords[0]]] };
    // d3 treats a ring by its winding; if it encloses more than half the globe it is inside-out → flip it
    if (!line && geoArea(geom) > 2 * Math.PI) geom = { type: "Polygon", coordinates: [[...coords, coords[0]].reverse()] };
    const dd = pathGen(geom) ?? "";
    const pts = coords.map(P);
    const len = pts.reduce((a, p, i) => (i ? a + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);
    return { d: dd, c: pathGen.centroid(geom) as [number, number], line, len };
  };

  return (
    <div style={{ position: "absolute", left: -W / 2, top: -H / 2, width: W, height: H, borderRadius: 40, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.4)" }}>
      <svg width={W} height={H} viewBox={`${-W / 2} ${-H / 2} ${W} ${H}`}>
        <defs>
          <radialGradient id={id + "sea"} cx="0.5" cy="0.4" r="0.8">
            <stop offset="0" stopColor={lighten(sea, 0.15)} />
            <stop offset="1" stopColor={darken(sea, 0.35)} />
          </radialGradient>
        </defs>
        <rect x={-W / 2} y={-H / 2} width={W} height={H} fill={`url(#${id}sea)`} />
        <g transform={`scale(${z}) translate(${-cam.c[0]} ${-cam.c[1]})`}>
          {d.graticule !== false ? <path d={g.graticule} fill="none" stroke="#fff" strokeOpacity={0.07} strokeWidth={1.5} vectorEffect="non-scaling-stroke" /> : null}
          {/* land with a soft drop edge */}
          <path d={g.land} fill={darken(land, 0.35)} transform={`translate(0 ${4 * inv})`} />
          <path d={g.land} fill={land} />
          {/* highlighted countries / states */}
          {(d.highlight ?? []).map((h, i) => {
            const s = h.country ? g.countries.find((c) => c.name.toLowerCase() === h.country!.toLowerCase()) : g.states.find((c) => c.name.toLowerCase() === (h.state ?? "").toLowerCase());
            if (!s) return null;
            const a = appear(local, h.at);
            const pulse = h.pulse ? 0.75 + 0.25 * Math.sin(local * 4) : 1;
            return <path key={"h" + i} d={s.d} fill={h.color ?? el.color ?? theme.accent} opacity={a * pulse} stroke="#fff" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />;
          })}
          <path d={g.borders} fill="none" stroke={darken(land, 0.3)} strokeWidth={1.2} strokeOpacity={0.8} vectorEffect="non-scaling-stroke" />
          {d.states ? <path d={g.stateBorders} fill="none" stroke={darken(land, 0.25)} strokeWidth={1} strokeOpacity={0.75} strokeDasharray="4 3" vectorEffect="non-scaling-stroke" /> : null}
          {/* shapes: rivers, presets, outlines */}
          {(d.shapes ?? []).map((s, i) => {
            const sp = shapePath(s);
            if (!sp) return null;
            const col = s.color ?? el.color ?? theme.accent;
            const dur = s.duration ?? (sp.line ? 2.5 : 1);
            const kk = s.at === undefined && !sp.line ? 1 : ease("inOut", (local - (s.at ?? 0)) / dur);
            if (kk <= 0) return null;
            const mv = s.move ? ease("inOut", (local - (s.move.at ?? 0)) / (s.move.duration ?? 1.5)) : 0;
            const to = s.move ? P(s.move.to) : sp.c;
            const tx = (to[0] - sp.c[0]) * mv;
            const ty = (to[1] - sp.c[1]) * mv;
            const pulse = s.pulse ? 0.8 + 0.2 * Math.sin(local * 3.5) : 1;
            const grow = s.grow ? kk : 1;
            return (
              <g key={"s" + i} transform={`translate(${tx} ${ty})`}>
                {sp.line ? (
                  <>
                    <path d={sp.d} fill="none" stroke={darken(col, 0.35)} strokeWidth={((s.width ?? 5) + 3) * inv} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${sp.len * 1.02} ${sp.len * 2}`} strokeDashoffset={sp.len * 1.02 * (1 - kk)} />
                    <path d={sp.d} fill="none" stroke={col} strokeWidth={(s.width ?? 5) * inv} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${sp.len * 1.02} ${sp.len * 2}`} strokeDashoffset={sp.len * 1.02 * (1 - kk)} />
                  </>
                ) : (
                  <g transform={`translate(${sp.c[0]} ${sp.c[1]}) scale(${Math.max(0.001, grow)}) translate(${-sp.c[0]} ${-sp.c[1]})`} opacity={(s.grow ? 1 : kk) * pulse}>
                    <path d={sp.d} fill={withAlpha(col, s.opacity ?? 0.75)} stroke={lighten(col, 0.4)} strokeWidth={2.5} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                  </g>
                )}
                {s.label ? (
                  <g transform={`translate(${sp.c[0]} ${sp.c[1]}) scale(${inv})`} opacity={kk}>
                    <g transform={`translate(${s.labelOffset?.[0] ?? 0} ${s.labelOffset?.[1] ?? 0})`}>
                      <MapLabel text={s.label} color={theme.dark} y={sp.line ? -30 : 0} />
                    </g>
                  </g>
                ) : null}
              </g>
            );
          })}
          {routeD ? (
            <g>
              <path d={routeD} stroke="#fff" strokeOpacity={0.25} strokeWidth={6 * inv} fill="none" strokeDasharray={`${12 * inv} ${12 * inv}`} />
              <path d={routeD} stroke={el.color ?? theme.accent} strokeWidth={8 * inv} fill="none" strokeLinecap="round" strokeDasharray={`${routeLen} ${routeLen * 2}`} strokeDashoffset={routeLen * (1 - ease("inOut", k))} />
            </g>
          ) : null}
          {(d.markers ?? []).map((m, i) => {
            const [x, y] = P([m.lon, m.lat]);
            const a = appear(local, m.at, 0.5);
            const s = ((m.size ?? 70) / 200) * inv * ease("back", a);
            return a > 0 ? (
              <g key={"m" + i} transform={`translate(${x} ${y}) scale(${Math.max(0.001, s)})`}>
                <ObjectView type={m.object} t={local} color={m.color} seed={"mk" + i} lighting={0} />
              </g>
            ) : null;
          })}
          {(d.labels ?? []).map((l, i) => {
            const [x, y] = P([l.lon, l.lat]);
            const a = appear(local, l.at);
            return (
              <text key={"l" + i} x={x} y={y} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={800} fontSize={(l.size ?? 30) * inv} fill={l.color ?? "#ffffff"} opacity={a} stroke={withAlpha("#000000", 0.35)} strokeWidth={4 * inv} paintOrder="stroke">
                {l.text}
              </text>
            );
          })}
          {(d.pins ?? []).map((pin, i) => {
            const [x, y] = P([pin.lon, pin.lat]);
            const kk = pin.at !== undefined ? ease("back", (local - pin.at) / 0.5) : ease("back", k * (pinsN + 1) - i);
            const c = pin.color ?? PALETTE[(i + 1) % PALETTE.length];
            const pulse = (local * 0.8 + i * 0.3) % 1;
            return (
              <g key={"p" + i} transform={`translate(${x} ${y}) scale(${Math.max(0.001, kk) * inv})`}>
                <circle r={20 + pulse * 50} fill="none" stroke={c} strokeWidth={4} opacity={1 - pulse} />
                <g transform="translate(0 -48) scale(0.45)">
                  <path d="M0,90 C-20,40 -70,10 -70,-30 A70,70 0 1,1 70,-30 C70,10 20,40 0,90 Z" fill={c} stroke="#fff" strokeWidth={8} />
                  <circle cx={0} cy={-30} r={26} fill="#fff" />
                </g>
                {pin.label ? <MapLabel text={pin.label} color={theme.dark} y={-120} /> : null}
              </g>
            );
          })}
        </g>
      </svg>
      {el.title ? (
        <div style={{ position: "absolute", left: 40, top: 30, fontFamily: FONT_FAMILY, fontSize: 44, fontWeight: 800, color: "#fff", textShadow: "0 4px 16px rgba(0,0,0,0.4)" }}>{el.title}</div>
      ) : null}
    </div>
  );
};

const MapLabel: React.FC<{ text: string; color: string; y: number }> = ({ text, color, y }) => (
  <g transform={`translate(0 ${y})`}>
    <rect x={-text.length * 10 - 20} y={-30} width={text.length * 20 + 40} height={52} rx={26} fill={color} opacity={0.9} />
    <text y={6} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={700} fontSize={30} fill="#fff">
      {text}
    </text>
  </g>
);
