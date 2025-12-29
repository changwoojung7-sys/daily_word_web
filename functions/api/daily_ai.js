export async function onRequest(context) {
  const { request } = context;

  /* ===============================
     CORS Preflight
  =============================== */
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: buildCorsHeaders(request),
    });
  }

  if (request.method !== "GET") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: buildCorsHeaders(request),
    });
  }

  /* ===============================
     Render Flask API 호출
  =============================== */
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60_000);

    const res = await fetch(
      "https://saju500.onrender.com/api/daily",
      {
        method: "GET",
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      return jsonResponse(
        {
          error: "Render API error",
          status: res.status,
          detail: errText,
        },
        502,
        request
      );
    }

    let data;
    try {
      data = await res.json();
    } catch {
      const raw = await res.text();
      return jsonResponse(
        { error: "Invalid JSON from Render", raw },
        502,
        request
      );
    }

    return jsonResponse(
      {
        result: data.result ?? "",
      },
      200,
      request
    );

  } catch (err) {
    const message =
      err.name === "AbortError"
        ? "Render API timeout"
        : String(err);

    return jsonResponse(
      {
        error: "Failed to call Render API",
        detail: message,
      },
      502,
      request
    );
  }
}

/* ===============================
   Helper Functions
=============================== */

function buildCorsHeaders(request) {
  const origin = request.headers.get("Origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json",
  };
}

function jsonResponse(body, status, request) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: buildCorsHeaders(request),
    }
  );
}
