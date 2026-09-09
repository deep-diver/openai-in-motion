import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'openai-in-motion';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ??
  (repository.endsWith('.github.io') ? '' : `/${repository}`);
const result = spawnSync('npm', ['exec', '--', 'vite', 'build', '--config', 'vite.pages.config.ts'], {
  stdio: 'inherit',
  env: { ...process.env, NEXT_PUBLIC_BASE_PATH: basePath },
});
if (result.status !== 0) process.exit(result.status || 1);
for (const route of ['', 'en/']) {
  const file = `out/${route}index.html`;
  if (!existsSync(file)) throw new Error(`Missing static page: ${file}`);
}
writeFileSync('out/.nojekyll', '');
copyFileSync('pages-static/fonts/OFL.txt', 'out/assets/Geist-OFL.txt');
// Preserve old bookmarks without bundling the separate committee application.
mkdirSync('out/korea', { recursive: true });
writeFileSync('out/korea/index.html', `<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<meta http-equiv="refresh" content="0;url=https://deep-diver.github.io/korea-ai-in-motion/">
<link rel="canonical" href="https://deep-diver.github.io/korea-ai-in-motion/">
<title>국가AI전략위원회 아카이브 이전</title></head>
<body><a href="https://deep-diver.github.io/korea-ai-in-motion/">국가AI전략위원회 독립 사이트로 이동</a></body></html>`);
