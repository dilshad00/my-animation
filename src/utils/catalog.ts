/**
 * Names of everything in the library – used by the CLI validator and docs
 * generator. Derived from the registries so it can never drift.
 */
import { DIAGRAMS } from "../components/objects/diagrams/registry";
import { EFFECTS } from "../components/effects/Effects";
import { ENVIRONMENTS } from "../components/environments/registry";
import { OBJECTS } from "../components/objects/registry";
import { PRESETS } from "../components/characters/presets";
import { ACTIONS } from "../components/characters/poses";
import { FACES } from "../components/characters/expressions";

export const CATALOG = {
  environments: Object.keys(ENVIRONMENTS),
  objects: Object.keys(OBJECTS),
  diagrams: Object.keys(DIAGRAMS),
  effects: Object.keys(EFFECTS),
  characters: Object.keys(PRESETS),
  actions: Object.keys(ACTIONS),
  expressions: Object.keys(FACES),
};

export const describe = () => ({
  environments: Object.fromEntries(Object.entries(ENVIRONMENTS).map(([k, v]) => [k, v.description])),
  objects: Object.fromEntries(Object.entries(OBJECTS).map(([k, v]) => [k, `${v.category}${v.description ? " — " + v.description : ""}`])),
  diagrams: Object.fromEntries(Object.entries(DIAGRAMS).map(([k, v]) => [k, v.description])),
  effects: Object.fromEntries(Object.entries(EFFECTS).map(([k, v]) => [k, v.description])),
});
