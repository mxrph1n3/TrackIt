import { copyFileSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const distDir = join(process.cwd(), 'dist');
const indexPath = join(distDir, 'index.html');
const publicDir = join(process.cwd(), 'public');

if (!existsSync(indexPath)) {
  console.error('[check-web-export] dist/index.html is missing. Run expo export --platform web first.');
  process.exit(1);
}

if (existsSync(publicDir)) {
  for (const name of readdirSync(publicDir)) {
    const source = join(publicDir, name);
    const target = join(distDir, name);
    copyFileSync(source, target);
    console.log('[check-web-export] Copied public/', name);
  }
}

const privacyPath = join(distDir, 'privacy.html');
if (!existsSync(privacyPath)) {
  console.error('[check-web-export] dist/privacy.html is missing after public copy.');
  process.exit(1);
}

const html = readFileSync(indexPath, 'utf8');
const scriptMatch = html.match(/src="(\/_expo\/static\/js\/web\/[^"]+\.js)"/);

if (!scriptMatch) {
  console.error('[check-web-export] dist/index.html has no web JS bundle reference.');
  process.exit(1);
}

const bundlePath = join(distDir, scriptMatch[1].replace(/^\//, ''));
if (!existsSync(bundlePath)) {
  console.error(`[check-web-export] Bundle missing: ${scriptMatch[1]}`);
  process.exit(1);
}

const required = ['EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_ANON_KEY'];
const missing = required.filter((key) => !process.env[key]?.trim());

if (missing.length > 0) {
  console.warn(
    `[check-web-export] Warning: missing env at build time: ${missing.join(', ')}. ` +
      'Add them in Vercel → Settings → Environment Variables (Production) and redeploy.',
  );
}

console.log('[check-web-export] OK:', scriptMatch[1]);
