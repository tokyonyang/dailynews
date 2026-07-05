# Goodday24news OpenAI TTS 카드뉴스 생성기

## 기능
- 브리핑 원문을 6장 카드뉴스 스크립트로 자동 구성
- 카드뉴스 이미지 1~6장 업로드
- OpenAI TTS API로 장표별 MP3 생성
- 생성된 MP3 미리듣기/다운로드
- SRT 자막 다운로드

## 배포 방법: Vercel
1. 이 폴더를 GitHub 저장소에 업로드합니다.
2. Vercel에서 Import Project를 선택합니다.
3. Environment Variables에 아래 값을 추가합니다.

```bash
OPENAI_API_KEY=sk-...
```

4. Deploy를 누릅니다.
5. 배포된 URL에서 사용합니다.

## 보안 주의
OpenAI API 키는 브라우저에 입력하지 않습니다.
반드시 Vercel 환경변수 `OPENAI_API_KEY`에 저장하세요.

## 기본 모델
- gpt-4o-mini-tts
- 기본 음성: marin
- 출력 포맷: mp3
