function showQRCode(mode, ingredients) {
  const QRFrame = document.getElementById("qr-frame");
  const QRContainer = document.getElementById("qr-container");
  while (QRContainer.firstChild) {
    QRContainer.removeChild(QRContainer.firstChild);
  }
  console.log(ingredients);
  if (mode) {
    const qrcode = new QRCode(
      QRContainer,
      `https://food-calendar-eight.vercel.app/mobileShopping.html?data=${ingredients}`
    );
    QRFrame.classList.add("visible");
  } else {
    QRFrame.classList.remove("visible");
  }
}
window.showQRCode = showQRCode;
