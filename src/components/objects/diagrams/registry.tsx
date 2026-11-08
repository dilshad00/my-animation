import React from "react";
import { useScene } from "../../../scenes/context";
import { BarChart, Counter, LineChart, PieChart, Progress, type DiagramProps } from "./charts";
import { Compare, Flow, List, Timeline } from "./structures";
import { GeoMap } from "./geomap";

export type DiagramDef = { component: React.FC<DiagramProps>; description: string };

const Donut: React.FC<DiagramProps> = (p) => <PieChart {...p} donut />;

/** Every diagram usable in storyboard.json → { "kind": "diagram", "type": … } */
export const DIAGRAMS: Record<string, DiagramDef> = {
  bar: { component: BarChart, description: 'data: [{ "label": "2020", "value": 42, "color"?: "#hex" }] or { "items": [...], "unit": "%" }' },
  line: { component: LineChart, description: 'data: { "labels": [...], "series": [{ "name": "A", "values": [...] }], "unit": "" } or [numbers]' },
  pie: { component: PieChart, description: 'data: [{ "label": "Coal", "value": 36 }]' },
  donut: { component: Donut, description: "same data as pie; centre shows the first slice share" },
  counter: { component: Counter, description: 'data: { "from": 0, "to": 8000000000, "prefix": "", "suffix": "", "decimals": 0, "label": "people" }' },
  progress: { component: Progress, description: 'data: { "value": 0.72, "label": "Charging" }' },
  flow: { component: Flow, description: 'data: { "nodes": [{ "id": "a", "label": "Sun", "x"?: 0..1, "y"?: 0..1, "object"?: "sun" }], "edges": [["a", "b", "label?"]] }' },
  timeline: { component: Timeline, description: 'data: [{ "label": "1969", "text": "Moon landing" }]' },
  list: { component: List, description: 'data: ["point", …] or [{ "text": "…", "icon": "check|cross|star|…" }]' },
  compare: { component: Compare, description: 'data: { "left": { "title", "items": [], "color"? }, "right": { … } }' },
  map: {
    component: GeoMap,
    description:
      'Real Natural Earth map. data: { "views": [{ "t": 0, "center": [lon, lat], "zoom": 1 }, …] (or legacy "focus"+"zoom"), "pins": [{ "lon", "lat", "label", "at"? }], "highlight": [{ "country"|"state", "color", "at", "pulse" }], "shapes": [{ "preset": "kerala|mississippi|missouri|ohio|mulberry-fork|deadzone-2024" | "coords" | "country" | "state", "line"?, "color", "label", "at", "duration", "grow", "pulse", "move": { "to": [lon, lat], "at" } }], "labels": [{ "lon", "lat", "text", "at" }], "markers": [{ "lon", "lat", "object", "size", "at" }], "route": [[lon, lat], …], "states": true }',
  },
};

export const DiagramView: React.FC<DiagramProps> = (props) => {
  const scene = useScene();
  const def = DIAGRAMS[props.el.type.toLowerCase()];
  if (!def) {
    throw new Error(`Scene "${scene.sceneId}": unknown diagram type "${props.el.type}". Available: ${Object.keys(DIAGRAMS).join(", ")}`);
  }
  const C = def.component;
  return <C {...props} />;
};
