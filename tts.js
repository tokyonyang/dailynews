export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
    const clientId = process.env.YT_CLIENT_ID;
    const clientSecret = process.env.YT_CLIENT_SECRET;
    const refreshToken = process.env.YT_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      res.status(500).send("YT_CLIENT_ID / YT_CLIENT_SECRET / YT_REFRESH_TOKEN 환경변수가 필요합니다.");
      return;
    }

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token"
    });

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString()
    });

    const tokenJson = await tokenRes.json();

    if (!tokenRes.ok) {
      res.status(tokenRes.status).json(tokenJson);
      return;
    }

    // 클라이언트에는 단명 액세스 토큰만 전달하고, client_secret/refresh_token은 절대 내려주지 않습니다.
    res.status(200).json({
      access_token: tokenJson.access_token,
      expires_in: tokenJson.expires_in
    });
  } catch (error) {
    res.status(500).send(error?.message || "유튜브 인증 토큰 발급 중 오류가 발생했습니다.");
  }
}
