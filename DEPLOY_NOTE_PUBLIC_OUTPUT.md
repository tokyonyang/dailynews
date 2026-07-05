# Vercel public Output Directory fix

이번 수정은 Vercel 배포 오류 `No Output Directory named "public" found after the Build completed` 대응용입니다.

## 변경 사항

- `npm run build` 실행 시 `public/` 폴더를 생성합니다.
- `index.html`을 `public/index.html`로 복사합니다.
- ffmpeg.wasm 관련 파일을 `public/vendor/` 아래로 복사합니다.
- `vercel.json`에 `buildCommand: npm run build`, `outputDirectory: public`을 명시했습니다.

## 배포 후 확인 파일

브라우저에서 다음 경로가 200으로 열려야 합니다.

- `/vendor/ffmpeg/esm/index.js`
- `/vendor/ffmpeg/esm/worker.js`
- `/vendor/util/esm/index.js`
- `/vendor/core/umd/ffmpeg-core.js`
- `/vendor/core/umd/ffmpeg-core.wasm`

Vercel 로그에는 다음 문구가 나와야 합니다.

`Build complete: index.html and ffmpeg.wasm vendor files copied to /public`
