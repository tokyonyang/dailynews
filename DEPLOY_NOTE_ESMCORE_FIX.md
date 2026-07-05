# ffmpeg.wasm ESM core fix

이번 오류 `failed to import ffmpeg-core.js`는 브라우저가 `@ffmpeg/ffmpeg/dist/esm`의 module worker를 쓰는 상황에서 `@ffmpeg/core/dist/umd` 파일을 넘겨 생길 수 있습니다.

이 버전은 다음을 수정합니다.

- `public/vendor/core/umd` 대신 `public/vendor/core/esm` 사용
- `scripts/build-public.mjs`가 `node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js`와 `.wasm`을 복사
- `index.html`의 `coreBaseURL`을 `/vendor/core/esm`으로 변경
- Vercel static cache를 줄이기 위한 header와 URL cache-bust query 추가

배포 후 Network 탭에서 아래 파일이 200인지 확인하세요.

- `/vendor/core/esm/ffmpeg-core.js?v=esmcore-fix-1`
- `/vendor/core/esm/ffmpeg-core.wasm?v=esmcore-fix-1`
- `/vendor/ffmpeg/esm/worker.js`
