import { copyFileSync, rmSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const src = join(rootDir, 'client', 'dist');
const dest = join(rootDir, 'dist');

try {
  if (existsSync(dest)) {
    rmSync(dest, { recursive: true });
  }
  
  function copyDir(src, dest) {
    mkdirSync(dest, { recursive: true });
    let entries = readdirSync(src, { withFileTypes: true });
    for (let entry of entries) {
      let srcPath = join(src, entry.name);
      let destPath = join(dest, entry.name);
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        copyFileSync(srcPath, destPath);
      }
    }
  }
  
  copyDir(src, dest);
  console.log('Copied client/dist to dist');
} catch (e) {
  console.error('Copy failed:', e);
  process.exit(1);
}