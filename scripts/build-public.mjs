import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const publicDir = path.join(root, 'public');

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

// Vercel 프로젝트 설정의 Output Directory가 public이면 빌드 완료 후 public 폴더가 반드시 존재해야 합니다.
fs.rmSync(publicDir, { recursive: true, force: true });
fs.mkdirSync(publicDir, { recursive: true });

// 정적 진입 파일
copyFile(path.join(root, 'index.html'), path.join(publicDir, 'index.html'));

// ffmpeg.wasm 파일을 같은 origin(/vendor/*)으로 배포하기 위해 public/vendor 아래로 복사합니다.
copyDir(
  path.join(root, 'node_modules', '@ffmpeg', 'ffmpeg', 'dist', 'esm'),
  path.join(publicDir, 'vendor', 'ffmpeg', 'esm')
);
copyDir(
  path.join(root, 'node_modules', '@ffmpeg', 'util', 'dist', 'esm'),
  path.join(publicDir, 'vendor', 'util', 'esm')
);
copyFile(
  path.join(root, 'node_modules', '@ffmpeg', 'core', 'dist', 'esm', 'ffmpeg-core.js'),
  path.join(publicDir, 'vendor', 'core', 'esm', 'ffmpeg-core.js')
);
copyFile(
  path.join(root, 'node_modules', '@ffmpeg', 'core', 'dist', 'esm', 'ffmpeg-core.wasm'),
  path.join(publicDir, 'vendor', 'core', 'esm', 'ffmpeg-core.wasm')
);

console.log('Build complete: index.html and ffmpeg.wasm ESM vendor files copied to /public');
