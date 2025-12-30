// assets/js/daily.js
const dailyTextEl = document.getElementById("dailyText");
const refreshBtn  = document.getElementById("refreshBtn");
const saveBtn     = document.getElementById("saveBtn");

function todayKey() {
  // KST 기준으로 "오늘" 고정
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

async function loadDaily(force = false) {
  const cached = JSON.parse(localStorage.getItem("daily") || "null");

  if (!force && cached && cached.date === todayKey()) {
    dailyTextEl.textContent = cached.text;
    return;
  }

  dailyTextEl.textContent = "오늘의 문장을 불러오는 중…";

  try {
    // ✅ Pages Functions 경로: functions/api/dailyai.js -> /api/dailyai
    const res = await fetch("/api/dailyai", { method: "GET" });

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(`API error ${res.status} ${t}`);
    }

    const data = await res.json();
    if (!data.result) throw new Error("Invalid API response");

    localStorage.setItem(
      "daily",
      JSON.stringify({ date: todayKey(), text: data.result })
    );

    dailyTextEl.textContent = data.result;
  } catch (err) {
    console.error(err);
    dailyTextEl.textContent =
      "오늘의 문장을 불러오지 못했습니다.\n잠시 후 다시 시도해 주세요.";
  }
}

refreshBtn?.addEventListener("click", () => loadDaily(true));

saveBtn?.addEventListener("click", () => {
  const cached = JSON.parse(localStorage.getItem("daily") || "null");
  if (!cached?.text) return alert("저장할 문장이 없습니다.");
  localStorage.setItem("daily_saved", JSON.stringify(cached));
  alert("저장했습니다!");
});

document.addEventListener("DOMContentLoaded", () => loadDaily(false));
