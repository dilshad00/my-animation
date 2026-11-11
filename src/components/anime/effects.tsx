/**
 * Anime effects for the engine registry (`"kind": "effect", "type": …`).
 * Each draws into its w×h box centred on the element's x/y (default: full frame).
 */
import React from "react";
import type { EffectProps } from "../effects/Effects";
import { useScene } from "../../scenes/context";
import { GodRays, LensFlare, SakuraPetals, Sparkles, SpeedLines } from "./AnimeFx";

/** Gives a 1920×1080 overlay its own viewport sized w×h around the origin. */
const Box: React.FC<{ w: number; h: number; children: React.ReactNode }> = ({ w, h, children }) => (
  <svg x={-w / 2} y={-h / 2} width={w} height={h} overflow="visible">
    {children}
  </svg>
);
const useFrame = (local: number) => Math.round(local * useScene().fps);

const Sakura: React.FC<EffectProps> = ({ local, w, h, intensity, seed }) => (
  <Box w={w} h={h}><SakuraPetals frame={useFrame(local)} count={Math.round(40 * intensity)} seed={seed} /></Box>
);
const Rays: React.FC<EffectProps> = ({ local, w, h, intensity, color }) => (
  <Box w={w} h={h}><GodRays frame={useFrame(local)} x={960} y={540} opacity={0.35 * intensity} color={color} /></Box>
);
const Focus: React.FC<EffectProps> = ({ local, w, h, intensity, color }) => (
  <Box w={w} h={h}><SpeedLines frame={useFrame(local)} opacity={0.75 * Math.min(1, intensity)} count={Math.round(90 * intensity)} color={color} /></Box>
);
const Twinkle: React.FC<EffectProps> = ({ local, w, h, intensity, seed, color }) => (
  <Box w={w} h={h}><Sparkles frame={useFrame(local)} count={Math.round(20 * intensity)} seed={seed} color={color} size={1.4} /></Box>
);
const Flare: React.FC<EffectProps> = ({ w, h, intensity }) => (
  <Box w={w} h={h}><LensFlare x={960} y={540} tx={460} ty={840} opacity={intensity} /></Box>
);
const Impact: React.FC<EffectProps> = ({ local, intensity, color }) => {
  const k = Math.max(0, 1 - local / 0.35) * Math.min(1, intensity);
  return k > 0 ? <rect x={-3000} y={-3000} width={6000} height={6000} fill={color ?? "#ffffff"} opacity={k} /> : null;
};

export const ANIME_EFFECTS: Record<string, { component: React.FC<EffectProps>; w: number; h: number; description: string }> = {
  sakura: { component: Sakura, w: 1920, h: 1080, description: "ANIME: falling cherry-blossom petals with depth (intensity = amount)" },
  godrays: { component: Rays, w: 1920, h: 1080, description: "ANIME: slowly turning sun rays radiating from x/y. color = light colour" },
  focuslines: { component: Focus, w: 1920, h: 1080, description: "ANIME: flickering manga focus lines converging on x/y" },
  twinkle: { component: Twinkle, w: 1920, h: 1080, description: "ANIME: four-point sparkles twinkling over the box" },
  lensflare: { component: Flare, w: 1920, h: 1080, description: "ANIME: lens flare with streak and ghosts; place x/y on the sun" },
  impactflash: { component: Impact, w: 1920, h: 1080, description: "ANIME: one-shot full-screen flash (0.35 s) for hits and reveals. color" },
};
