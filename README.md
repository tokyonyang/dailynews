# Goodday24news Auto Video Maker

카드뉴스 이미지, OpenAI TTS 음성, 하단 자막/브랜드를 합쳐 MP4 영상을 만드는 웹앱입니다.

## 핵심 기능

- 브리핑 원문 → 6장 스크립트 자동 구성
- 카드뉴스 이미지 1~6장 업로드
- OpenAI TTS API로 장표별 MP3 생성
- 장표별 MP3 미리듣기/다운로드
- SRT 자막 다운로드
- ffmpeg.wasm 기반 MP4 자동 생성
- 영상 비율 선택: 1:1, 9:16, 16:9
- 일반 장표 하단 자막 및 `Instagram @goodday24news` 브랜드 삽입
- 마지막 장표 하단에 `자세한 내용은 goodday100news 블로그에서 확인하세요`와 `https://gooddaynews.store` 자동 삽입

## Vercel 배포

1. 이 폴더를 GitHub 저장소에 업로드합니다.
2. Vercel에서 Import Project를 선택합니다.
3. Environment Variables에 아래 값을 추가합니다.

```bash
OPENAI_API_KEY=sk-...
```

4. Deploy를 누릅니다.

## 사용 순서

1. 브리핑 원문을 붙여넣고 6장 스크립트를 구성합니다.
2. 카드뉴스 이미지 1~6장을 업로드합니다.
3. `전체 MP3 생성`을 누릅니다.
4. `MP4 생성`을 누릅니다.
5. 생성된 MP4를 다운로드합니다.

## 참고

- MP4 생성은 브라우저 내부의 `ffmpeg.wasm`으로 처리됩니다.
- 최초 실행 시 ffmpeg.wasm 다운로드 때문에 시간이 걸릴 수 있습니다.
- 브라우저 메모리 제한이 있으면 1:1 비율부터 테스트하세요.
- API 키는 브라우저에 노출되지 않고 Vercel 서버리스 함수에서만 사용됩니다.
