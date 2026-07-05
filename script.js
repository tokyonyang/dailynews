export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      res.status(500).send("OPENAI_API_KEY 환경변수가 설정되어 있지 않습니다.");
      return;
    }

    const { input, model, voice, instructions } = req.body || {};
    if (!input || typeof input !== "string") {
      res.status(400).send("input 값이 필요합니다.");
      return;
    }

    const allowedModels = new Set(["gpt-4o-mini-tts", "tts-1", "tts-1-hd"]);
    const selectedModel = allowedModels.has(model) ? model : "gpt-4o-mini-tts";

    const payload = {
      model: selectedModel,
      voice: voice || "marin",
      input: input.slice(0, 4000),
      response_format: "mp3"
    };

    if (instructions && selectedModel === "gpt-4o-mini-tts") {
      payload.instructions = instructions.slice(0, 800);
    }

    const openaiRes = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!openaiRes.ok) {
      const errorText = await openaiRes.text();
      res.status(openaiRes.status).send(errorText);
      return;
    }

    const audioBuffer = Buffer.from(await openaiRes.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", "inline; filename=goodday24news_tts.mp3");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).send(audioBuffer);
  } catch (error) {
    res.status(500).send(error?.message || "TTS 생성 중 오류가 발생했습니다.");
  }
}
