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
    // Provider Keys를 사용하므로 별도의 API 키 헤더가 필요 없을 수 있습니다.
    // 만약 Cloudflare Gateway 설정에 따라 인증이 필요하다면 env.GEMINI_API_KEY 등을 사용해야 합니다.
    // 현재는 Provider Keys 설정이 되어있다고 가정하고 키 전송을 생략하거나, 
    // 기존 패턴대로 env에 키가 있다면 헤더에 추가하는 방식을 사용할 수 있습니다.
    // 여기서는 Provider Keys 활용을 위해 x-goog-api-key 헤더를 생략합니다.

    // *주의*: 만약 Gateway가 Provider Key를 자동으로 주입하지 않는 설정이라면,
    // headers: { "x-goog-api-key": env.GEMINI_API_KEY, ... } 가 필요할 수 있습니다.
    // 사용자의 요청("구글 방식", "키가 등록되어있어")에 따라 Gateway가 처리하도록 합니다.

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
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
