async function showQRCode(mode) {
  var ingredients;
  if (localStorage.getItem("shoppinglist") != null) {
    ingredients = minimizeList(
      JSON.parse(localStorage.getItem("shoppinglist")).ingredients
    );
  } else {
    return;
  }

  const QRFrame = document.getElementById("qr-frame");
  const QRContainer = document.getElementById("qr-container");

  // Clear previous QR code
  while (QRContainer.firstChild) {
    QRContainer.removeChild(QRContainer.firstChild);
  }

  const theme = document.getElementById("primary-color").value;

  const params = new URLSearchParams();
  params.set("data", ingredients);
  params.set("theme", theme.replace("#", ""));
  const link = `https://food-calendar-eight.vercel.app/mobileShopping.html?${params.toString()}`;

  if (mode) {
    const qrImgLink = await makeQrCode(link);
    const img = document.createElement("img");
    img.src = qrImgLink;

    QRContainer.appendChild(img);
    img.onload = () => {
      img.classList.add("visible");
    };

    QRFrame.classList.add("visible");
  } else {
    QRFrame.classList.remove("visible");
  }
}

async function makeQrCode(link) {
  const qrStorage = sessionStorage.getItem("QR");
  if (qrStorage == null || qrStorage == "") {
    // no qr code. make one
    console.log(link);
    const res = await fetch(
      "https://food-calendar-eight.vercel.app/api/create-qr",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ long_url: link }),
      }
    );
    const blob = await res.blob();
    const img = URL.createObjectURL(blob);
    sessionStorage.setItem("QR", img);
    return img;
  } else {
    return qrStorage;
  }
}
window.onload = function () {
  sessionStorage.clear();
};
window.showQRCode = showQRCode;
