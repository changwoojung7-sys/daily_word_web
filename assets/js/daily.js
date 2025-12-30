export async function onRequestGet({ env }) {
  const gatewayUrl =
    "https://gateway.ai.cloudflare.com/v1/" +
    "d6e21429ad6a96c9f1871c892dcfc8dd" + // ACCOUNT ID
    "/calamus-ai-gateway" +             // GATEWAY NAME
    "/openai/chat/completions";

  const body = {
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "당신은 차분하고 통찰력 있는 조언자입니다. " +
          "하루를 돌아보거나 시작할 때 곱씹을 수 있는 " +
          "짧은 문장 하나만 한국어로 제시하세요."
      },
      {
        role: "user",
        content: "오늘의 한 문장을 제시해 주세요."
      }
    ],
    temperature: 0.7,
    max_tokens: 120
  };

  try {
    const res = await fetch(gatewayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(
        JSON.stringify({ error: text }),
        { status: res.status }
      );
    }

    const data = await res.json();

    const result =
      data.choices?.[0]?.message?.content?.trim() || "";

    return new Response(
      JSON.stringify({ result }),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=86400", // 하루 캐시
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}
