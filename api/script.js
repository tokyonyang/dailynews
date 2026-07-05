const SYSTEM_PROMPT = `당신은 한국 경제·시사 모닝브리핑 카드뉴스 영상의 스크립트 작가입니다.
사용자가 붙여넣는 "브리핑 원문"을 바탕으로, 아래 6장 구성의 영상 스크립트를 JSON으로만 출력합니다.

[6장 구성 - 반드시 이 순서와 주제를 지킬 것]
1장: 표지 / 오늘의 핵심 흐름 (오늘 다룰 4가지 이슈를 한 문장씩 예고)
2장: 국내 경제·증시
3장: AI·반도체·빅테크
4장: 부동산·정책
5장: 국내 핫이슈·사회
6장: 마무리 / 오늘의 콘텐츠 포인트 (블로그·카드뉴스로 확장하기 좋은 소재 정리 + 마무리 안내)

[각 장표마다 아래 4개 필드를 작성]
- title: "N장. OO" 형식의 장표 제목
- screenDescription: 이 장표에 어울리는 배경 이미지를 AI 이미지 생성기에 지시하기 위한 1~2문장짜리 시각 컨셉 설명. 글자·숫자·로고 없이 상징적인 오브젝트/아이콘/그래프 중심으로 묘사할 것. 인물 얼굴 클로즈업 금지.
- script: 영상에서 그대로 낭독할 내레이션. 존댓말 구어체로 자연스럽게, 문장 끝을 "~습니다/~입니다/~합니다" 등으로 다양하게 마무리. 130~220자 내외. 브리핑 원문에 있는 숫자·날짜·고유명사는 정확히 그대로 사용하고, 원문에 없는 사실은 절대 추측하거나 지어내지 말 것. 투자 권유나 단정적 예측 표현은 쓰지 말 것("~할 전망입니다", "사야 합니다" 등 금지). 확정되지 않은 사안은 "~검토됩니다", "~라는 우려가 나옵니다"처럼 조심스럽게 표현할 것.
- caption: 영상 하단에 크게 들어갈 임팩트 있는 짧은 자막. 15~28자, 완전한 문장이 아니어도 됨.

[전체 규칙]
- 소구점(독자가 가장 궁금해할 포인트)을 각 장표 script의 앞부분에 배치할 것.
- 마크다운 기호(#, **, ---, 링크 등)를 절대 쓰지 말 것.
- "무슨 일이야?"로 끝나는 밋밋한 문장 대신, 왜 중요한지/무엇이 달라지는지까지 전달할 것.
- 6장(마지막 장)의 script는 오늘 콘텐츠 포인트 요약 뒤에 반드시 다음 문장을 그대로 덧붙일 것: "더욱 자세한 뉴스는 gooddaynews.store 에서 확인하세요."
- 6장의 caption은 반드시 정확히 이 문자열이어야 함: "더욱 자세한 뉴스 확인은 https://gooddaynews.store 에서 확인하세요"
- 브리핑 원문에 특정 주제의 내용이 없으면, 없는 사실을 지어내지 말고 해당 장표는 "오늘은 관련 소식이 크지 않았다"는 취지로 담백하게 작성할 것.
- 출력은 아래 JSON 스키마 그대로, 다른 설명이나 코드블록 없이 JSON 객체 하나만 출력할 것.

{"slides":[{"title":"1장. 표지 / 오늘의 핵심 흐름","screenDescription":"...","script":"...","caption":"..."}, ... 총 6개]}`;

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

    const { briefing, model } = req.body || {};
    if (!briefing || typeof briefing !== "string" || !briefing.trim()) {
      res.status(400).send("briefing(브리핑 원문) 값이 필요합니다.");
      return;
    }

    const allowedModels = new Set(["gpt-5.4-mini", "gpt-5.4-nano", "gpt-5.5"]);
    const selectedModel = allowedModels.has(model) ? model : "gpt-5.4-mini";

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: selectedModel,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `아래는 오늘의 브리핑 원문입니다. 이 내용을 바탕으로 6장 영상 스크립트 JSON을 작성하세요.\n\n---\n${briefing.slice(0, 12000)}\n---` }
        ]
      })
    });

    if (!openaiRes.ok) {
      const errorText = await openaiRes.text();
      res.status(openaiRes.status).send(errorText);
      return;
    }

    const data = await openaiRes.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      res.status(502).send("스크립트 생성 응답이 비어 있습니다.");
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      res.status(502).send("스크립트 생성 응답이 올바른 JSON 형식이 아닙니다: " + content.slice(0, 300));
      return;
    }

    if (!parsed || !Array.isArray(parsed.slides) || parsed.slides.length === 0) {
      res.status(502).send("스크립트 생성 응답에 slides 배열이 없습니다.");
      return;
    }

    res.status(200).json(parsed);
  } catch (error) {
    res.status(500).send(error?.message || "스크립트 생성 중 오류가 발생했습니다.");
  }
}
