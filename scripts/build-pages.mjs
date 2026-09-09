import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, writeFileSync } from 'node:fs';

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'openai-in-motion';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ??
  (repository.endsWith('.github.io') ? '' : `/${repository}`);
const result = spawnSync('npm', ['exec', '--', 'vite', 'build', '--config', 'vite.pages.config.ts'], {
  stdio: 'inherit',
  env: { ...process.env, NEXT_PUBLIC_BASE_PATH: basePath },
});
if (result.status !== 0) process.exit(result.status || 1);
for (const route of ['', 'en/', 'korea/']) {
  const file = `out/${route}index.html`;
  if (!existsSync(file)) throw new Error(`Missing static page: ${file}`);
}
writeFileSync('out/.nojekyll', '');
copyFileSync('pages-static/fonts/OFL.txt', 'out/assets/Geist-OFL.txt');
