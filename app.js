const STORAGE_KEY = "color_history_v1";
const MAX_HISTORY = 18;

const elements = {
  hue: document.getElementById("hue"),
  sat: document.getElementById("sat"),
  light: document.getElementById("light"),
  hueValue: document.getElementById("hueValue"),
  satValue: document.getElementById("satValue"),
  lightValue: document.getElementById("lightValue"),
  preview: document.getElementById("preview"),
  hexText: document.getElementById("hexText"),
  rgbText: document.getElementById("rgbText"),
  hslText: document.getElementById("hslText"),
  copyStatus: document.getElementById("copyStatus"),
  history: document.getElementById("history"),
  clearHistory: document.getElementById("clearHistory"),
  valueButtons: Array.from(document.querySelectorAll(".value-item")),
};

let historyColors = loadHistory();
let statusTimer;

function hslToRgb(h, s, l) {
  const sat = s / 100;
  const light = l / 100;
  const chroma = (1 - Math.abs(2 * light - 1)) * sat;
  const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = light - chroma / 2;

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (h >= 0 && h < 60) {
    r1 = chroma;
    g1 = x;
  } else if (h >= 60 && h < 120) {
    r1 = x;
    g1 = chroma;
  } else if (h >= 120 && h < 180) {
    g1 = chroma;
    b1 = x;
  } else if (h >= 180 && h < 240) {
    g1 = x;
    b1 = chroma;
  } else if (h >= 240 && h < 300) {
    r1 = x;
    b1 = chroma;
  } else {
    r1 = chroma;
    b1 = x;
  }

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

function getCurrentColor() {
  const h = Number(elements.hue.value);
  const s = Number(elements.sat.value);
  const l = Number(elements.light.value);
  const { r, g, b } = hslToRgb(h, s, l);
  const hex = rgbToHex(r, g, b);

  return {
    h,
    s,
    l,
    r,
    g,
    b,
    hex,
    hsl: `hsl(${h}, ${s}%, ${l}%)`,
    rgb: `rgb(${r}, ${g}, ${b})`,
  };
}

function updateUI() {
  const color = getCurrentColor();

  elements.hueValue.textContent = `${color.h}°`;
  elements.satValue.textContent = `${color.s}%`;
  elements.lightValue.textContent = `${color.l}%`;

  elements.preview.style.background = color.hsl;
  elements.hexText.textContent = color.hex;
  elements.rgbText.textContent = color.rgb;
  elements.hslText.textContent = color.hsl;
}

function showStatus(message) {
  clearTimeout(statusTimer);
  elements.copyStatus.textContent = message;
  statusTimer = setTimeout(() => {
    elements.copyStatus.textContent = "";
  }, 1300);
}

async function copyText(value, typeText) {
  try {
    await navigator.clipboard.writeText(value);
    showStatus(`已复制 ${typeText}: ${value}`);
  } catch (error) {
    const input = document.createElement("input");
    input.value = value;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
    showStatus(`已复制 ${typeText}: ${value}`);
  }
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(historyColors));
}

function addToHistory(hex) {
  historyColors = [hex, ...historyColors.filter((item) => item !== hex)].slice(
    0,
    MAX_HISTORY
  );
  saveHistory();
  renderHistory();
}

function renderHistory() {
  if (!historyColors.length) {
    elements.history.innerHTML = '<p class="empty">暂无历史颜色</p>';
    return;
  }

  elements.history.innerHTML = "";
  historyColors.forEach((hex) => {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "swatch";
    swatch.style.background = hex;
    swatch.setAttribute("aria-label", `历史颜色 ${hex}`);
    swatch.dataset.hex = hex;

    swatch.addEventListener("click", () => {
      copyText(hex, "HEX");
      elements.preview.style.background = hex;
    });

    elements.history.appendChild(swatch);
  });
}

function bindEvents() {
  [elements.hue, elements.sat, elements.light].forEach((slider) => {
    slider.addEventListener("input", updateUI);
    slider.addEventListener("change", () => {
      const { hex } = getCurrentColor();
      addToHistory(hex);
    });
  });

  elements.valueButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.type;
      const text = document.getElementById(`${type}Text`).textContent;
      copyText(text, type.toUpperCase());

      if (type === "hex") {
        addToHistory(text);
      }
    });
  });

  elements.clearHistory.addEventListener("click", () => {
    historyColors = [];
    saveHistory();
    renderHistory();
    showStatus("历史记录已清空");
  });
}

function init() {
  bindEvents();
  updateUI();
  addToHistory(getCurrentColor().hex);
  renderHistory();
}

init();
