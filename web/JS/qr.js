function QRCode(mode) {
  const QRContainer = document.getElementById("qr-container");
  const QRElement = document.getElementById("qr-code");
  if (mode) {
    QRContainer.classList.add("visible");
  } else {
    QRContainer.classList.remove("visible");
  }
}
window.QRCode = QRCode;
