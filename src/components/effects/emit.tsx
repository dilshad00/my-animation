import React from "react";
import { random } from "remotion";

export const r = (seed: string, k: string | number) => random(`${seed}-${k}`);

/** Continuous emitter: particle i is re-born every `life` seconds. */
export const emit = (n: number, life: number, local: number, seed: string, fn: (i: number, age: number, k: number, gen: number) => React.ReactNode) =>
  Array.from({ length: n }).map((_, i) => {
    const offset = r(seed, "o" + i) * life;
    const tt = local + offset;
    const gen = Math.floor(tt / life);
    const age = tt - gen * life;
    if (local < offset * 0.15 && gen === 0 && age > local + 0.001) return null;
    return <React.Fragment key={i}>{fn(i, age, age / life, gen)}</React.Fragment>;
  });
