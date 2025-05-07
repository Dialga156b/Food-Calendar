const primaryPicker = document.getElementById("primary-color");
const textPicker = document.getElementById("text-color");
const logo = document.getElementById("logo");
const root = document.documentElement;

/* 
  because of the way im handling things here,
  and the fact that everything is relative to the 
  main color unfortunately means that there won't be any 
  support for dark mode. it does look beautiful though!
*/

//colorpicker listeners

primaryPicker.addEventListener("input", function (event) {
  setColors(event.target.value);
});

textPicker.addEventListener("input", function (event) {
  setTextColor(event.target.value);
});

//listeners that detect when done picking a color

primaryPicker.addEventListener("change", (e) => {
  saveColors(e.target.value, null);
});
textPicker.addEventListener("change", (e) => {
  saveColors(null, e.target.value);
});

// when the user loads the page

window.addEventListener("DOMContentLoaded", () => {
  const stored = JSON.parse(localStorage.getItem("colors")) || {};
  if (stored.primary) {
    primaryPicker.value = stored.primary;
    setColors(stored.primary);
  } else {
    setColors("#6bb3ff");
  }
  if (stored.text) {
    textPicker.value = stored.text;
    setTextColor(stored.text);
  } else {
    setTextColor("#623232");
  }
});

function saveColors(newPrimary, newText) {
  const current = JSON.parse(localStorage.getItem("colors")) || {
    primary: primaryPicker.value,
    text: textPicker.value,
  };

  const merged = {
    primary: newPrimary ?? current.primary,
    text: newText ?? current.text,
  };

  localStorage.setItem("colors", JSON.stringify(merged));
}

// functions to edit colors, specifically hexes
// about half are mine. guess which ones!!!

function setColors(selectedColor) {
  const ModifiedColor1 = hexToRGBA(lightenHex(selectedColor, 0.8), 0.6);
  const mainColorDark = hexToRGBA(darkenHex(selectedColor, 0.7), 0.6);
  const universalBorderColor = lightenHex(darkenHex(selectedColor, 0.8), 0.3);
  const uBC_transparent = hexToRGBA(universalBorderColor, 0.55);
  const calendar_light = HexeditSL(selectedColor, 0.9, 0.2);
  const calendar_dark = HexeditSL(selectedColor, 0.8, 0.3);
  const { h, s, v } = hexToHsv(selectedColor);
  document.body.style.backdropFilter = `
    hue-rotate(${h}deg)
    brightness(${v / 100}) 
    saturate(${s / 100})`;
  logo.style.filter = `hue-rotate(${h}deg)`;
  root.style.setProperty("--main-bg", ModifiedColor1);
  root.style.setProperty("--main-border-color", universalBorderColor);
  root.style.setProperty("--main-color", ModifiedColor1);
  root.style.setProperty("--main-color-dark", mainColorDark);
  root.style.setProperty("--calendar-today", ModifiedColor1);
  root.style.setProperty("--calendar-top", calendar_dark);
  root.style.setProperty("--calendar-blank", calendar_light);
  root.style.setProperty("--bc-clear", uBC_transparent);
}

function setTextColor(selectedColor) {
  const textDark = darkenHex(selectedColor, 0.4);
  root.style.setProperty("--text-dark", textDark);
  root.style.setProperty("--main-text", selectedColor);
}

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

  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  let r = parseInt(hex.slice(0, 2), 16);
  let g = parseInt(hex.slice(2, 4), 16);
  let b = parseInt(hex.slice(4, 6), 16);

  if (percent >= 0) {
    r += (255 - r) * percent;
    g += (255 - g) * percent;
    b += (255 - b) * percent;
  } else {
    r += r * percent;
    g += g * percent;
    b += b * percent;
  }

  r = Math.round(Math.max(0, Math.min(255, r)));
  g = Math.round(Math.max(0, Math.min(255, g)));
  b = Math.round(Math.max(0, Math.min(255, b)));

  return (
    "#" +
    r.toString(16).padStart(2, "0") +
    g.toString(16).padStart(2, "0") +
    b.toString(16).padStart(2, "0")
  );
}

function darkenHex(hex, percent) {
  return lightenHex(hex, -percent);
}

function hexToHsv(hex) {
  hex = hex.replace("#", "");

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
    h = 0;
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

window.hexToHsv = hexToHsv;
