import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, resolve } from 'node:path';
import { buildDossier } from './vendor/makefun-frontend.ts';

const project = fileURLToPath(new URL('./', import.meta.url));
const destination = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');
mkdirSync(destination, { recursive: true });
// Publish both trees before deriving the dossier from the delivered bytes.
const foldersToPublish = ['app', 'screenshots'] as const;
for (const name of foldersToPublish) {
  cpSync(join(project, name), join(destination, name), { recursive: true });
}
const dossierCaps = {
  text_max_bytes: 163840,
  screenshots: { max: 3, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
};
const encodedDossier = buildDossier(destination, dossierCaps);
writeFileSync(join(destination, 'dossier.json'), encodedDossier);
