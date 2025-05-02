async function showQRCode(mode, ingredients) {
  const QRFrame = document.getElementById("qr-frame");
  const QRContainer = document.getElementById("qr-container");
  while (QRContainer.firstChild) {
    QRContainer.removeChild(QRContainer.firstChild);
  }
  const link = `https://food-calendar-eight.vercel.app/Food-Calendar/web/mobileShopping.html?data=${ingredients}`;
  const qr = await makeQrCode(link);
  console.log(qr);
  if (mode) {
    // const qrcode = new QRCode(
    //   QRContainer,
    //   `https://food-calendar-eight.vercel.app/mobileShopping.html?data=${ingredients}`
    // );
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
  const data = await res.json();
  console.log("Short URL:", data.bitlink_url);
  console.log("QR Code Image:", data.qr_code_url);
}
window.showQRCode = showQRCode;
