// 한국어 내레이션 기준 대략적인 초당 글자수(공백 제외). 실제 체감 속도는 목소리/문장부호에 따라 달라질 수 있습니다.
const CHARS_PER_SECOND = 5.2;
const TRANSITION_OVERHEAD_SECONDS = 0.4; // 장표 사이 전환 여유

function buildSystemPrompt(slideCount, targetSeconds, speed) {
  const middleCount = slideCount - 2;
  const overhead = TRANSITION_OVERHEAD_SECONDS * slideCount;
  const audioBudgetSeconds = Math.max(slideCount * 2, targetSeconds - overhead);
  const perSlideSeconds = audioBudgetSeconds / slideCount;
  const perSlideChars = Math.max(18, Math.round(perSlideSeconds * CHARS_PER_SECOND * speed));
  const lastSlideChars = Math.max(15, perSlideChars - 15); // 마지막 장표는 마무리 안내 문장이 자동으로 덧붙기 때문에 여유를 둠
  const isVeryShort = perSlideChars <= 45;

  return `당신은 한국 경제·시사 모닝브리핑 카드뉴스 영상의 스크립트 작가입니다.
사용자가 붙여넣는 "브리핑 원문"을 바탕으로, 아래 조건에 맞는 영상 스크립트를 JSON으로만 출력합니다.

[영상 길이 목표 - 매우 중요]
- 이 영상은 쇼츠/릴스용이며 전체 목표 길이는 약 ${targetSeconds}초입니다. TTS 재생 속도는 ${speed}배로 설정되어 있습니다.
- 장표 수는 ${slideCount}장이고, 장표당 내레이션(script)은 대략 ${perSlideChars}자 내외여야 전체 길이가 목표에 맞습니다. 이 글자수 제한을 반드시 지키세요. 길게 쓰면 영상이 60초를 넘겨 쇼츠 규격에서 벗어납니다.
- 마지막 장표의 script는 시스템이 마무리 안내 문장을 자동으로 덧붙이므로, 마지막 장표 본문은 ${lastSlideChars}자 내외로 더 짧게 작성하세요.
${isVeryShort ? '- 장표당 글자수가 매우 짧으므로(45자 이하), 각 장표 script는 군더더기 없이 핵심만 담은 한 문장으로 작성하세요. 배경 설명이나 부연은 과감히 생략하고 가장 중요한 사실 하나만 전달하세요.' : '- 장표당 글자수 내에서, 소구점(가장 궁금해할 포인트)을 문장 앞부분에 배치하고 핵심만 전달하세요.'}

[전체 장표 수]
- 총 ${slideCount}장을 목표로 합니다. 1장은 표지, 마지막 ${slideCount}장은 마무리이고, 그 사이 ${middleCount}개 장표(2장~${slideCount - 1}장)는 오늘 브리핑에서 다룰 만한 서로 다른 주요 이슈들로 구성합니다.
- 중간 이슈 장표는 통상적으로 "국내 경제·증시", "AI·반도체·빅테크", "부동산·정책", "국내 핫이슈·사회" 4가지를 우선적으로 다루되, 요청된 장표 수가 6장보다 많고 브리핑 원문에 이 4가지 외에 뚜렷한 추가 이슈(글로벌 이슈, 특정 기업/산업 뉴스, 정치 이슈 등)가 있다면 그 이슈로 추가 장표를 채우세요.
- 브리핑 원문에 다룰 만한 내용이 부족하면 억지로 ${slideCount}장을 채우지 말고, 표지+마무리를 포함해 최소 5장 이상으로 자연스러운 개수만큼만 만드세요. 같은 내용을 억지로 쪼개서 장표 수를 늘리지 마세요.

[1장: 표지 / 오늘의 핵심 흐름]
오늘 다룰 이슈들을 한 문장씩 예고하는 표지 장표입니다.

[마지막 장: 마무리 / 오늘의 콘텐츠 포인트]
블로그·카드뉴스로 확장하기 좋은 소재를 짧게 정리하는 마무리 안내입니다.

[각 장표마다 아래 4개 필드를 작성]
- title: "N장. OO" 형식의 장표 제목
- screenDescription: 이 장표에 어울리는 배경 이미지를 AI 이미지 생성기에 지시하기 위한 1~2문장짜리 시각 컨셉 설명. 글자·숫자·로고 없이 상징적인 오브젝트/아이콘/그래프 중심으로 묘사할 것. 인물 얼굴 클로즈업 금지.
- script: 영상에서 그대로 낭독할 내레이션. 존댓말 구어체로 자연스럽게 마무리("~습니다/~입니다/~합니다" 등). 위에서 정한 글자수 목표를 반드시 지킬 것. 브리핑 원문에 있는 숫자·날짜·고유명사는 정확히 그대로 사용하고, 원문에 없는 사실은 절대 추측하거나 지어내지 말 것. 투자 권유나 단정적 예측 표현은 쓰지 말 것("~할 전망입니다", "사야 합니다" 등 금지). 확정되지 않은 사안은 "~검토됩니다", "~라는 우려가 나옵니다"처럼 조심스럽게 표현할 것.
- caption: 영상 하단에 크게 들어갈 임팩트 있는 짧은 자막. 15~28자, 완전한 문장이 아니어도 됨.

[전체 규칙]
- 마크다운 기호(#, **, ---, 링크 등)를 절대 쓰지 말 것.
- "무슨 일이야?"로 끝나는 밋밋한 문장 대신, 왜 중요한지/무엇이 달라지는지가 드러나는 한마디를 담을 것.
- 마지막 장표의 script는 요약 뒤에 반드시 다음 문장을 그대로 덧붙일 것: "더욱 자세한 뉴스는 gooddaynews.store 에서 확인하세요."
- 마지막 장표의 caption은 반드시 정확히 이 문자열이어야 함: "더욱 자세한 뉴스 확인은 https://gooddaynews.store 에서 확인하세요"
- 브리핑 원문에 특정 주제의 내용이 없으면, 없는 사실을 지어내지 말고 해당 장표는 "오늘은 관련 소식이 크지 않았다"는 취지로 담백하게 한 문장으로 작성할 것.
- 출력은 아래 JSON 스키마 그대로, 다른 설명이나 코드블록 없이 JSON 객체 하나만 출력할 것.

{"slides":[{"title":"1장. 표지 / 오늘의 핵심 흐름","screenDescription":"...","script":"...","caption":"..."}, ... 총 ${slideCount}개 내외]}`;
}

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

    const { briefing, model, slideCount, targetSeconds, speed } = req.body || {};
    if (!briefing || typeof briefing !== "string" || !briefing.trim()) {
      res.status(400).send("briefing(브리핑 원문) 값이 필요합니다.");
      return;
    }

    const parsedCount = parseInt(slideCount, 10);
    const targetCount = Number.isFinite(parsedCount) ? Math.min(8, Math.max(5, parsedCount)) : 6;

    const parsedTarget = parseInt(targetSeconds, 10);
    const targetDuration = Number.isFinite(parsedTarget) ? Math.min(90, Math.max(20, parsedTarget)) : 40;

    const parsedSpeed = parseFloat(speed);
    const ttsSpeed = Number.isFinite(parsedSpeed) ? Math.min(2.0, Math.max(0.75, parsedSpeed)) : 1.15;

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
          { role: "system", content: buildSystemPrompt(targetCount, targetDuration, ttsSpeed) },
          { role: "user", content: `아래는 오늘의 브리핑 원문입니다. 이 내용을 바탕으로 약 ${targetDuration}초 분량, 최대 ${targetCount}장짜리 영상 스크립트 JSON을 작성하세요.\n\n---\n${briefing.slice(0, 12000)}\n---` }
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

    // 혹시 모델이 최대 장표 수를 초과해서 만들었을 경우를 대비한 안전장치
    if (parsed.slides.length > targetCount) {
      parsed.slides = parsed.slides.slice(0, targetCount);
    }

    res.status(200).json(parsed);
  } catch (error) {
    res.status(500).send(error?.message || "스크립트 생성 중 오류가 발생했습니다.");
  }
}
