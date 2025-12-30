// functions/api/dailyai.js
import OpenAI from "openai";

export async function onRequestGet({ env }) {
  const client = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
    baseURL:
      "https://gateway.ai.cloudflare.com/v1/" +
      "d6e21429ad6a96c9f1871c892dcfc8dd" + // ACCOUNT ID
      "/calamus-ai-gateway" +             // GATEWAY NAME
      "/openai",
  });

  const systemPrompt = `
당신은 차분하고 통찰력 있는 문장을 제시하는 조언자입니다.
하루를 시작하거나 마무리할 때 곱씹을 수 있는
짧고 명확한 문장 1개만 한국어로 제시하세요.
`;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "오늘 하루를 위한 한 문장을 제시해 주세요." },
      ],
      temperature: 0.7,
      max_tokens: 120,
    });

    const result =
      completion.choices?.[0]?.message?.content?.trim() || "";

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
