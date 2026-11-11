/**
 * "Hikari" — the heroine of the anime style test (Anime-Demo).
 * Thin wrapper over AnimeCharacter with the HIKARI look; `look` here is the iris offset.
 */
import React from "react";
import { AnimeCharacter, HIKARI, type CharProps } from "./AnimeCharacter";

export type GirlProps = Omit<CharProps, "look" | "look2"> & { look?: [number, number] };

export const AnimeGirl: React.FC<GirlProps> = ({ look, ...p }) => <AnimeCharacter {...p} look={HIKARI} look2={look} />;
