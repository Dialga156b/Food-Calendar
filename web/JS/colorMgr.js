const primaryPicker = document.getElementById("primary-color");
const secondaryPicker = document.getElementById("secondary-color");
const sidebarPicker = document.getElementById("sidebar-color");
const textPicker = document.getElementById("text-color");
const root = document.documentElement;

primaryPicker.addEventListener("input", function (event) {
  const selectedColor = event.target.value;
  const today = hexToRGBA(HexeditSL(selectedColor, 0.8, 0.8), 0.6);
  const mainColor = hexToRGBA(HexeditSL(selectedColor, 0.8, 0.8), 1);
  const mainColorDark = hexToRGBA(HexeditSL(selectedColor, 0.5, 1.5), 0.6);
  const { h, s, v } = hexToHsv(selectedColor);
  document.body.style.backdropFilter = `
    hue-rotate(${-h - 10}deg) 
    brightness(${v / 100}) 
    saturate(${s / 100})`;
  root.style.setProperty("--main-bg", today);
  root.style.setProperty("--main-color", mainColor);
  root.style.setProperty("--main-color-dark", mainColorDark);
  root.style.setProperty("--calendar-today", today);
});

textPicker.addEventListener("input", function (event) {
  const selectedColor = event.target.value;
  const textDark = lightenHex(selectedColor, -0.4);
  root.style.setProperty("--text-dark", textDark);
  root.style.setProperty("--main-text", selectedColor);
});

function HexeditSL(hex, saturation, value) {
  return lightenHex(darkenHex(hex, value), saturation);
}

function hexToRGBA(hex, alpha) {
  hex = hex.replace(/^#/, "");

  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  if (hex.length !== 6) throw new Error("Invalid hex color");

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${Math.min(Math.max(alpha, 0), 1)})`;
}

function lightenHex(hex, percent) {
  hex = hex.replace("#", "");

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const newR = Math.min(255, r + (255 - r) * percent);
  const newG = Math.min(255, g + (255 - g) * percent);
  const newB = Math.min(255, b + (255 - b) * percent);

  const newHex =
    Math.round(newR).toString(16).padStart(2, "0") +
    Math.round(newG).toString(16).padStart(2, "0") +
    Math.round(newB).toString(16).padStart(2, "0");

  return "#" + newHex;
}
function darkenHex(hex, amount) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) - amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) - amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) - amount));
  return "#" + (g | (b << 8) | (r << 16)).toString(16).padStart(6, "0");
}

function hexToHsv(hex) {
  // Remove the '#' if it exists
  hex = hex.replace("#", "");

  // Parse hex values to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h,
    s,
    v = max;

  const d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, v: v * 100 };
}
