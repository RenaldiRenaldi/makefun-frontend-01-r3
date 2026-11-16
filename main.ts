import * as filesystem from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { buildDossier as assemble } from './vendor/makefun-frontend.ts';
const sourceDirectory = fileURLToPath(new URL('.', import.meta.url));
const outputDirectory = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');
filesystem.mkdirSync(outputDirectory, { recursive: true });
for (const folder of ['app', 'screenshots']) {
  const input = resolve(sourceDirectory, folder);
  const target = resolve(outputDirectory, folder);
  filesystem.mkdirSync(target, { recursive: true });
  if (folder === 'app' || filesystem.existsSync(input)) filesystem.cpSync(input, target, { recursive: true });
}
const limits = { text_max_bytes: 163840, screenshots: { max: 3, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 16777216 };
const dossier = assemble(outputDirectory, limits);
filesystem.writeFileSync(resolve(outputDirectory, 'dossier.json'), dossier);
