export async function onRequestGet() {
  const res = await fetch(
    "https://saju500.onrender.com/api/daily",
    { method: "GET" }
  );

  const text = await res.text();

  return new Response(text, {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

