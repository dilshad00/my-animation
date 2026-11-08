/**
 * Writes storyboard.schema.json from the zod schema so editors (VS Code etc.)
 * give autocomplete + inline errors while editing projects/<id>/storyboard.json.
 *   npm run schema
 */
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { Project } from "../src/utils/schema";

const schema = z.toJSONSchema(Project, { io: "input", unrepresentable: "any" });
const out = path.resolve(import.meta.dirname, "..", "storyboard.schema.json");
fs.writeFileSync(out, JSON.stringify(schema, null, 2));
console.log("Wrote", path.relative(process.cwd(), out));
