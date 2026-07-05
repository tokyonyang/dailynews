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

    const { prompt, size, quality } = req.body || {};
    if (!prompt || typeof prompt !== "string") {
      res.status(400).send("prompt 값이 필요합니다.");
      return;
    }

    const allowedSizes = new Set(["1024x1024", "1024x1536", "1536x1024", "auto"]);
    const selectedSize = allowedSizes.has(size) ? size : "1024x1024";

    const allowedQuality = new Set(["auto", "high", "medium", "low"]);
    const selectedQuality = allowedQuality.has(quality) ? quality : "medium";

    const openaiRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: prompt.slice(0, 4000),
        size: selectedSize,
        quality: selectedQuality,
        n: 1
      })
    });

    if (!openaiRes.ok) {
      const errorText = await openaiRes.text();
      res.status(openaiRes.status).send(errorText);
      return;
    }

    const data = await openaiRes.json();
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) {
      res.status(502).send("이미지 생성 응답에 이미지 데이터가 없습니다.");
      return;
    }

    res.status(200).json({ b64_json: b64 });
  } catch (error) {
    res.status(500).send(error?.message || "이미지 생성 중 오류가 발생했습니다.");
  }
}
