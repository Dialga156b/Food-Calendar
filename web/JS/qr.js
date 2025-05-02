async function showQRCode(mode, ingredients) {
  const QRFrame = document.getElementById("qr-frame");
  const QRContainer = document.getElementById("qr-container");
  while (QRContainer.firstChild) {
    QRContainer.removeChild(QRContainer.firstChild);
  }
  const link = `https://food-calendar-eight.vercel.app/mobileShopping.html?data=${ingredients}`;
  if (mode) {
    const qr = await makeQrCode(link);
    const imageUrl = URL.createObjectURL(qr);
    const img = document.createElement("img");
    img.src = imageUrl;
    QRContainer.appendChild(img);
    QRFrame.classList.add("visible");
  } else {
    QRFrame.classList.remove("visible");
  }
}
async function makeQrCode(link) {
  const res = await fetch(
    "https://food-calendar-eight.vercel.app/api/create-qr",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ long_url: link }),
    }
  );
  const blob = await res.blob();
  return blob;
}
window.showQRCode = showQRCode;
