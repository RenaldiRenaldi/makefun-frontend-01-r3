// Lantern's entry program: Node 22, standard library only. app/ is the frontend
// itself — plain static files a browser opens with no build step — so this file
// does one job: hand the entry in. It copies app/ and screenshots/ from beside
// itself into the output directory and writes output/dossier.json with
// buildDossier from the vendored make.fun library, which is what the judge reads
// (the cover shot, the app's first-load files and bytes, and a source outline).
//
// vendor/makefun-frontend.ts stays byte for byte as shipped: the scorer rebuilds
// dossier.json with its own copy and compares the two.
//
// Outside the grader there is no /output, so the directory is overridable:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// To run the frontend: `node serve.ts`, then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const root = dirname(fileURLToPath(import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR || '/output';

mkdirSync(out, { recursive: true });
cpSync(join(root, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(root, 'screenshots'))) {
  cpSync(join(root, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// Caps from the scorer's gate.json: only text_max_bytes shapes the dossier's
// bytes; the rest make a hand-in the scorer would refuse fail here first (at
// most 3 screenshots and 256 KiB each; app/ at most 993 entries and 16 MiB).
writeFileSync(join(out, 'dossier.json'), buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 3, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
}));
