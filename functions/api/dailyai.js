// functions/api/dailyai.js
export async function onRequestGet({ env }) {
  // ✅ 네 계정/게이트웨이 값 (기존 유지)
  const ACCOUNT_ID = "d6e21429ad6a96c9f1871c892dcfc8dd";
  const GATEWAY = "calamus-ai-gateway";

  // ✅ Google AI Studio 호환 엔드포인트 (Gemini 2.5 Flash)
  const url = `https://gateway.ai.cloudflare.com/v1/${ACCOUNT_ID}/${GATEWAY}/google-ai-studio/v1beta/models/gemini-2.5-flash:generateContent`;

  const body = {
    system_instruction: {
      parts: [
        {
          text: "당신은 차분하고 통찰력 있는 조언자입니다. " +
            "하루를 시작하거나 마무리할 때 곱씹을 수 있는 " +
            "짧은 문장 하나만 한국어로 제시하세요. " +
            "따옴표/설명 없이 문장만 반환하세요."
        }
      ]
    },
    contents: [
      {
        role: "user",
        parts: [{ text: "오늘의 한 문장" }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 120
    }
  };

  try {
    // ✅ Explicitly inject key to resolve "unregistered caller" (403)
    // Cloudflare Provider Keys sometimes fail to inject if not configured as "Universal" or due to specific model paths.
    // We fallback to manual injection if the strict Provider Key mode fails.
    const apiKey = env.GOOGLE_AI_KEY || env.GEMINI_API_KEY;

    const headers = {
      "Content-Type": "application/json"
    };

    if (apiKey) {
      headers["x-goog-api-key"] = apiKey;
    }

    const res = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body)
    });

    const text = await res.text();
    if (!res.ok) {
      return new Response(JSON.stringify({ error: text }), {
        status: res.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    const data = JSON.parse(text);
    // Gemini 응답 구조 파싱
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

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
