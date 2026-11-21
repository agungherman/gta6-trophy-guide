// Leonida Trophy Guide — entrypoint (Node 22, standard library only).
// The guide is this directory's app/ folder: plain static files a browser opens
// at app/index.html (no build step, no network), and its trophy list and guides
// are app/data/trophies.json. This program hands it in: it checks the trophy
// list first (55 trophies, the 1/2/6/46 grade split, one missable, guides on
// every entry), then copies app/ and screenshots/ to /output and writes
// /output/dossier.json with the vendored make.fun library. Leave
// vendor/makefun-frontend.ts as it is: the scorer requires dossier.json to be
// byte for byte what its own copy writes.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const EXPECTED = { total: 55, platinum: 1, gold: 2, silver: 6, bronze: 46 };

type Trophy = {
  id: number;
  name: string;
  description: string;
  grade: string;
  guide: string;
  source: string;
  kind: string;
  stage: number;
  missable?: boolean;
  unconfirmed?: boolean;
};

function loadTrophies(): Trophy[] {
  const raw = readFileSync(join(here, 'app', 'data', 'trophies.json'), 'utf-8');
  const data = JSON.parse(raw) as { trophies: Trophy[] };
  return data.trophies;
}

type Failure = { id: number; name: string; problem: string };

function validateTrophies(list: Trophy[]): void {
  const failures: Failure[] = [];
  if (list.length !== EXPECTED.total) {
    throw new Error(`expected ${EXPECTED.total} trophies, found ${list.length}`);
  }
  const counts: Record<string, number> = {};
  for (const t of list) counts[t.grade] = (counts[t.grade] ?? 0) + 1;
  for (const grade of ['platinum', 'gold', 'silver', 'bronze'] as const) {
    if (counts[grade] !== EXPECTED[grade]) {
      failures.push({ id: 0, name: '(grade split)', problem: `expected ${EXPECTED[grade]} ${grade}, found ${counts[grade] ?? 0}` });
    }
  }
  const seenIds = new Set<number>();
  const seenNames = new Set<string>();
  for (const t of list) {
    if (seenIds.has(t.id)) failures.push({ id: t.id, name: t.name, problem: 'duplicate trophy id' });
    seenIds.add(t.id);
    if (seenNames.has(t.name)) failures.push({ id: t.id, name: t.name, problem: 'duplicate trophy name' });
    seenNames.add(t.name);
    if (!t.guide.trim()) failures.push({ id: t.id, name: t.name, problem: 'guide is blank' });
    if (!t.description.trim()) failures.push({ id: t.id, name: t.name, problem: 'description is blank' });
    if (!t.source.trim()) failures.push({ id: t.id, name: t.name, problem: 'source is blank' });
    if (t.stage < 1 || t.stage > 5) failures.push({ id: t.id, name: t.name, problem: `stage ${t.stage} is out of range 1-5` });
  }
  const missable = list.filter((t) => t.missable);
  if (missable.length !== 1) {
    failures.push({ id: 0, name: '(missable)', problem: `expected exactly 1 missable trophy, found ${missable.length}` });
  }
  if (failures.length > 0) {
    const lines = failures.map((f) => `  #${f.id} ${f.name}: ${f.problem}`);
    throw new Error(`trophy list failed ${failures.length} check(s):\n${lines.join('\n')}`);
  }
}

const trophies = loadTrophies();
validateTrophies(trophies);
console.log(`Leonida Trophy Guide: ${trophies.length} trophies verified (1 platinum, 2 gold, 6 silver, 46 bronze)`);

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 48 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
