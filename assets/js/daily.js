const dailyTextEl = document.getElementById("dailyText");
const refreshBtn = document.getElementById("refreshBtn");

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

async function loadDaily(force = false) {
  const cached = JSON.parse(localStorage.getItem("daily") || "null");

  if (!force && cached && cached.date === todayKey()) {
    dailyTextEl.textContent = cached.text;
    return;
  }

  dailyTextEl.textContent = "오늘의 문장을 불러오는 중…";

  try {
    // 🔑 GET ONLY
    const res = await fetch("/api/dailyai");

    if (!res.ok) {
      throw new Error(`API error ${res.status}`);
    }

    const data = await res.json();

    if (!data.result) {
      throw new Error("Invalid API response");
    }

    localStorage.setItem(
      "daily",
      JSON.stringify({
        date: todayKey(),
        text: data.result,
      })
    );

    dailyTextEl.textContent = data.result;
  } catch (err) {
    console.error(err);
    dailyTextEl.textContent =
      "오늘의 문장을 불러오지 못했습니다.\n잠시 후 다시 시도해 주세요.";
  }
}

refreshBtn.addEventListener("click", () => loadDaily(true));
document.addEventListener("DOMContentLoaded", () => loadDaily());
