# FFmpeg loader fix

이 버전은 ffmpeg.wasm 공식 0.12 로딩 방식에 맞춰 `toBlobURL()`을 사용합니다.

- `@ffmpeg/ffmpeg@0.12.10`
- `@ffmpeg/core@0.12.10/dist/umd`
- `@ffmpeg/util@0.12.2`
- `ffmpeg-core.worker.js` 요청 없음
- `classWorkerURL` 직접 지정 없음

배포 후 브라우저에서 Ctrl+Shift+R로 강력 새로고침하세요.
