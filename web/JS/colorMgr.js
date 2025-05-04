const primaryPicker = document.getElementById("primary-color");
const secondaryPicker = document.getElementById("secondary-color");
const sidebarPicker = document.getElementById("sidebar-color");
const textPicker = document.getElementById("text-color");
const root = document.documentElement;

primaryPicker.addEventListener("input", function (event) {
  const selectedColor = event.target.value;
  const ModifiedColor1 = hexToRGBA(lightenHex(selectedColor, 0.8), 0.6);
  const mainColorDark = hexToRGBA(darkenHex(selectedColor, 0.7), 0.6);
  const universalBorderColor = lightenHex(darkenHex(selectedColor, 0.8), 0.3);
  const { h, s, v } = hexToHsv(selectedColor);
  document.body.style.backdropFilter = `
    hue-rotate(${h}deg) 
    brightness(${v / 100}) 
    saturate(${s / 100})`;
  root.style.setProperty("--main-bg", ModifiedColor1);
  root.style.setProperty("--main-border-color", universalBorderColor);
  root.style.setProperty("--main-color", ModifiedColor1);
  root.style.setProperty("--main-color-dark", mainColorDark);
  root.style.setProperty("--calendar-today", ModifiedColor1);
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
  hex = hex.replace(/^#/, "");
  // expand shorthand
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  // parse channels
  let r = parseInt(hex.slice(0, 2), 16);
  let g = parseInt(hex.slice(2, 4), 16);
  let b = parseInt(hex.slice(4, 6), 16);

  if (percent >= 0) {
    // move each channel toward 255
    r += (255 - r) * percent;
    g += (255 - g) * percent;
    b += (255 - b) * percent;
  } else {
    // move each channel toward 0
    r += r * percent;
    g += g * percent;
    b += b * percent;
  }

  // clamp & round
  r = Math.round(Math.max(0, Math.min(255, r)));
  g = Math.round(Math.max(0, Math.min(255, g)));
  b = Math.round(Math.max(0, Math.min(255, b)));

  // back to hex
  return (
    "#" +
    r.toString(16).padStart(2, "0") +
    g.toString(16).padStart(2, "0") +
    b.toString(16).padStart(2, "0")
  );
}

/**
 * Darkens a hex by a relative percent.
 * Just a thin wrapper around lightenHex.
 */
function darkenHex(hex, percent) {
  return lightenHex(hex, -percent);
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
