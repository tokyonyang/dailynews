export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      res.status(500).send("TELEGRAM_BOT_TOKEN 환경변수가 설정되어 있지 않습니다.");
      return;
    }

    const filterChatId = process.env.TELEGRAM_CHAT_ID; // 선택: 특정 채널/채팅으로 한정하고 싶을 때

    const tgRes = await fetch(
      `https://api.telegram.org/bot${token}/getUpdates?limit=100&timeout=0&allowed_updates=${encodeURIComponent(
        JSON.stringify(["message", "channel_post"])
      )}`
    );
    const data = await tgRes.json();

    if (!data.ok) {
      const desc = data.description || "알 수 없는 오류";
      if (/webhook/i.test(desc)) {
        res
          .status(409)
          .send(
            `텔레그램 오류: ${desc}\n\n이 봇에 webhook이 설정되어 있으면 getUpdates를 사용할 수 없습니다. 브라우저에서 https://api.telegram.org/bot${token}/deleteWebhook 를 한 번 호출해 webhook을 해제한 뒤 다시 시도하세요.`
          );
        return;
      }
      res.status(502).send(`텔레그램 오류: ${desc}`);
      return;
    }

    const updates = data.result || [];
    const messages = updates
      .map((u) => u.channel_post || u.message)
      .filter(Boolean)
      .filter((m) => !filterChatId || String(m.chat?.id) === String(filterChatId))
      .filter((m) => m.text && m.text.trim())
      .sort((a, b) => (b.date || 0) - (a.date || 0));

    if (messages.length === 0) {
      res
        .status(404)
        .send(
          "가져올 텍스트 메시지가 없습니다. 최근 24시간 내에 봇이 해당 채팅/채널에서 받은(또는 보낸) 메시지가 있는지, TELEGRAM_CHAT_ID 필터가 올바른지 확인하세요."
        );
      return;
    }

    const latest = messages[0];
    res.status(200).json({
      text: latest.text,
      date: latest.date,
      chatId: latest.chat?.id,
      chatTitle: latest.chat?.title || latest.chat?.username || latest.chat?.first_name || ""
    });
  } catch (error) {
    res.status(500).send(error?.message || "텔레그램 메시지 조회 중 오류가 발생했습니다.");
  }
}
