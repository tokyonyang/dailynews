# ffmpeg.wasm self-host fix

이번 수정은 CDN에서 `@ffmpeg/ffmpeg`를 직접 import하지 않습니다.

## 왜 필요한가

`@ffmpeg/ffmpeg` 0.12+는 내부적으로 `worker.js`를 생성합니다. 브라우저는 Vercel 페이지(`https://dailynews-silk.vercel.app`)에서 CDN worker(`https://cdn.jsdelivr.net/.../worker.js`)를 직접 Worker로 만들 때 같은 origin이 아니면 차단할 수 있습니다.

## 처리 방식

Vercel 빌드/설치 단계에서 아래 파일을 프로젝트 내부 `/vendor`로 복사합니다.

- `node_modules/@ffmpeg/ffmpeg/dist/esm/*` → `/vendor/ffmpeg/esm/`
- `node_modules/@ffmpeg/util/dist/esm/*` → `/vendor/util/esm/`
- `node_modules/@ffmpeg/core/dist/umd/ffmpeg-core.js` → `/vendor/core/umd/`
- `node_modules/@ffmpeg/core/dist/umd/ffmpeg-core.wasm` → `/vendor/core/umd/`

브라우저에서는 `/vendor/...` 경로를 통해 모두 같은 Vercel origin에서 로딩합니다.

## 배포 후 확인

개발자도구 Network에서 아래 파일들이 200으로 떠야 합니다.

- `/vendor/ffmpeg/esm/index.js`
- `/vendor/ffmpeg/esm/worker.js`
- `/vendor/util/esm/index.js`
- `/vendor/core/umd/ffmpeg-core.js`
- `/vendor/core/umd/ffmpeg-core.wasm`

`cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg.../worker.js` 요청이 보이면 이전 배포본 또는 브라우저 캐시가 남아 있는 것입니다.
