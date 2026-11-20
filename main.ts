// Leonida Trophy Guide — the program that hands the guide in (Node 22, standard
// library only). It checks the trophy list first, then copies the guide (app/)
// and its screenshots (screenshots/) into the output directory and writes the
// dossier the judge reads, using the kit's vendored library. Outside the
// grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const root = fileURLToPath(new URL(".", import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// The official list this guide must carry: 55 trophies, 1 platinum, 2 gold,
// 6 silver and 46 bronze. Refuse to hand in a guide that does not match it,
// so a broken data file fails here instead of in front of the judge.
function checkTrophies() {
  const data = JSON.parse(readFileSync(join(root, "app", "data", "trophies.json"), "utf8"));
  const list = Array.isArray(data) ? data : data.trophies;
  if (!Array.isArray(list) || list.length !== 55) {
    throw new Error("trophies.json must hold 55 trophies, found " + (Array.isArray(list) ? list.length : "none"));
  }
  const grades = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of list) {
    if (!(t.grade in grades)) throw new Error("trophy " + JSON.stringify(t.name) + " has an unknown grade " + JSON.stringify(t.grade));
    grades[t.grade]++;
    if (typeof t.name !== "string" || !t.name.trim()) throw new Error("a trophy has no name");
    if (typeof t.guide !== "string" || !t.guide.trim()) throw new Error("trophy " + JSON.stringify(t.name) + " has no guide");
  }
  if (grades.platinum !== 1 || grades.gold !== 2 || grades.silver !== 6 || grades.bronze !== 46) {
    throw new Error(
      "grade split must be 1 platinum, 2 gold, 6 silver, 46 bronze, found " +
        grades.platinum + " platinum, " + grades.gold + " gold, " + grades.silver + " silver, " + grades.bronze + " bronze",
    );
  }
  return list.length;
}

const count = checkTrophies();
console.log("Leonida Trophy Guide: " + count + " trophies verified (1 platinum, 2 gold, 6 silver, 46 bronze)");

mkdirSync(outDir, { recursive: true });
cpSync(join(root, "app"), join(outDir, "app"), { recursive: true });
mkdirSync(join(outDir, "screenshots"), { recursive: true });
if (existsSync(join(root, "screenshots"))) {
  cpSync(join(root, "screenshots"), join(outDir, "screenshots"), { recursive: true });
}

// The scorer's own caps: only text_max_bytes shapes the bytes; the rest refuse
// an entry the scorer would refuse (more than 4 screenshots or one over
// 256 KiB; more than 993 files and directories in app/, or 48 MiB of app files).
writeFileSync(
  join(outDir, "dossier.json"),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
console.log("dossier.json written to " + outDir);
