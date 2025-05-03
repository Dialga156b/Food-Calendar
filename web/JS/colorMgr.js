const primaryPicker = document.getElementById("primary-color");
const innerPicker = document.getElementById("inner-color");
const textPicker = document.getElementById("text-color");
const root = document.documentElement;

primaryPicker.addEventListener("input", function (event) {
  const selectedColor = event.target.value;
  const blerg = modifyHexColor(selectedColor, 1.2, 0.8); // boosts saturation by 20%, lowers brightness by 20%
  root.style.setProperty("--main-bg", selectedColor);
  root.style.setProperty("--sidebar-bg", blerg);
});

textPicker.addEventListener("input", function (event) {
  const selectedColor = event.target.value;
  root.style.setProperty("--main-text", selectedColor);
});

function modifyHexColor(hex, saturationMultiplier, valueMultiplier) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  const v = max;
  const delta = max - min;
  let s = max === 0 ? 0 : delta / max;

  s = Math.min(Math.max(s * saturationMultiplier, 0), 1);
  const newV = Math.min(Math.max(v * valueMultiplier, 0), 1);

  const scale = newV / v || 0;
  const newR = Math.min(255, Math.round(r * scale * 255));
  const newG = Math.min(255, Math.round(g * scale * 255));
  const newB = Math.min(255, Math.round(b * scale * 255));

  const toHex = (c) => c.toString(16).padStart(2, "0");
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
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
