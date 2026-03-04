const STORAGE_KEY = "clock_format_v1";
const WEEKDAYS = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

const elements = {
  time: document.getElementById("time"),
  date: document.getElementById("date"),
  formatToggle: document.getElementById("formatToggle"),
};

let is24Hour = loadHourPreference();

function pad2(value) {
  return String(value).padStart(2, "0");
}

function loadHourPreference() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "12") return false;
  return true;
}

function saveHourPreference() {
  localStorage.setItem(STORAGE_KEY, is24Hour ? "24" : "12");
}

function formatTime(date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  if (is24Hour) {
    return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${period} ${pad2(hour12)}:${pad2(minutes)}:${pad2(seconds)}`;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  const weekday = WEEKDAYS[date.getDay()];

  return `${year}年${month}月${day}日 ${weekday}`;
}

function updateToggleText() {
  elements.formatToggle.textContent = is24Hour ? "切换到 12 小时制" : "切换到 24 小时制";
  elements.formatToggle.setAttribute("aria-pressed", String(!is24Hour));
}

function renderClock() {
  const now = new Date();
  elements.time.textContent = formatTime(now);
  elements.date.textContent = formatDate(now);
}

function bindEvents() {
  elements.formatToggle.addEventListener("click", () => {
    is24Hour = !is24Hour;
    updateToggleText();
    saveHourPreference();
    renderClock();
  });
}

function init() {
  updateToggleText();
  bindEvents();
  renderClock();
  setInterval(renderClock, 1000);
}

init();
