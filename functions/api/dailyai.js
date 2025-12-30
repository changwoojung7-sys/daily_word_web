export async function onRequestGet() {
  const res = await fetch(
    "https://saju500.onrender.com/api/daily",
    { method: "GET" }
  );

  if (!res.ok) {
    return new Response(
      JSON.stringify({ error: "backend error" }),
      { status: 500 }
    );
  }

  const data = await res.text();

  return new Response(data, {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}