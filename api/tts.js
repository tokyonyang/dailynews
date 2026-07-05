// 한국어 자연스러움 순서: Neural2 > Wavenet > Standard. Chirp3-HD는 속도 조절(speakingRate)을 지원하지 않아 제외했습니다.
const ALLOWED_VOICES = new Set([
  "ko-KR-Neural2-A", "ko-KR-Neural2-B", "ko-KR-Neural2-C",
  "ko-KR-Wavenet-A", "ko-KR-Wavenet-B", "ko-KR-Wavenet-C", "ko-KR-Wavenet-D",
  "ko-KR-Standard-A", "ko-KR-Standard-B", "ko-KR-Standard-C", "ko-KR-Standard-D"
]);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
    const apiKey = process.env.GOOGLE_TTS_API_KEY;
    if (!apiKey) {
      res.status(500).send("GOOGLE_TTS_API_KEY 환경변수가 설정되어 있지 않습니다.");
      return;
    }

    const { input, voice, speed } = req.body || {};
    if (!input || typeof input !== "string") {
      res.status(400).send("input 값이 필요합니다.");
      return;
    }

    const selectedVoice = ALLOWED_VOICES.has(voice) ? voice : "ko-KR-Neural2-A";

    const parsedSpeed = parseFloat(speed);
    const speakingRate = Number.isFinite(parsedSpeed) ? Math.min(4.0, Math.max(0.25, parsedSpeed)) : 1.0;

    const payload = {
      input: { text: input.slice(0, 5000) },
      voice: { languageCode: "ko-KR", name: selectedVoice },
      audioConfig: { audioEncoding: "MP3", speakingRate, pitch: 0 }
    };

    const googleRes = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    if (!googleRes.ok) {
      const errorText = await googleRes.text();
      res.status(googleRes.status).send(errorText);
      return;
    }

    const data = await googleRes.json();
    if (!data.audioContent) {
      res.status(502).send("음성 생성 응답에 audioContent가 없습니다.");
      return;
    }

    const audioBuffer = Buffer.from(data.audioContent, "base64");
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", "inline; filename=goodday24news_tts.mp3");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).send(audioBuffer);
  } catch (error) {
    res.status(500).send(error?.message || "TTS 생성 중 오류가 발생했습니다.");
  }
}
