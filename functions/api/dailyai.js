// functions/api/dailyai.js
export async function onRequestGet({ env }) {
  // ✅ 네 계정/게이트웨이 값으로 바꿔야 함
  const ACCOUNT_ID = "d6e21429ad6a96c9f1871c892dcfc8dd";
  const GATEWAY    = "calamus-ai-gateway";

  // ✅ OpenAI 호환 엔드포인트
  const url = `https://gateway.ai.cloudflare.com/v1/${ACCOUNT_ID}/${GATEWAY}/openai/chat/completions`;

  const body = {
    model: "gpt-4o-mini",
    temperature: 0.7,
    max_tokens: 120,
    messages: [
      {
        role: "system",
        content:
          "당신은 차분하고 통찰력 있는 조언자입니다. " +
          "하루를 시작하거나 마무리할 때 곱씹을 수 있는 " +
          "짧은 문장 하나만 한국어로 제시하세요. " +
          "따옴표/설명 없이 문장만 반환하세요."
      },
      { role: "user", content: "오늘의 한 문장" }
    ]
  };

  try {
    if (!env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY missing" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // ✅ 여기는 OpenAI 키 그대로 (Cloudflare가 중계)
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    const text = await res.text(); // 일단 text로 받고
    if (!res.ok) {
      return new Response(JSON.stringify({ error: text }), {
        status: res.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    const data = JSON.parse(text);
    const result = data.choices?.[0]?.message?.content?.trim() || "";

    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // ✅ 하루 캐시
        "Cache-Control": "public, max-age=86400"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
