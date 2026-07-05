import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    throw new Error(`Source not found: ${src}`);
  }
  fs.mkdirSync(dest, { recursive: true });
  for (const item of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, item.name);
    const to = path.join(dest, item.name);
    if (item.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function copyFile(src, dest) {
  if (!fs.existsSync(src)) {
    throw new Error(`Source not found: ${src}`);
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

const vendorRoot = path.join(root, 'vendor');
fs.rmSync(vendorRoot, { recursive: true, force: true });

copyDir(path.join(root, 'node_modules', '@ffmpeg', 'ffmpeg', 'dist', 'esm'), path.join(vendorRoot, 'ffmpeg', 'esm'));
copyDir(path.join(root, 'node_modules', '@ffmpeg', 'util', 'dist', 'esm'), path.join(vendorRoot, 'util', 'esm'));
copyFile(path.join(root, 'node_modules', '@ffmpeg', 'core', 'dist', 'umd', 'ffmpeg-core.js'), path.join(vendorRoot, 'core', 'umd', 'ffmpeg-core.js'));
copyFile(path.join(root, 'node_modules', '@ffmpeg', 'core', 'dist', 'umd', 'ffmpeg-core.wasm'), path.join(vendorRoot, 'core', 'umd', 'ffmpeg-core.wasm'));

console.log('ffmpeg.wasm vendor files copied to /vendor');
