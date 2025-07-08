const QRFrame = document.getElementById("rs-frame");
const RSTitle = document.getElementById("rs-title");
const clostBtn = document.getElementById("rs-icon");

async function showRS(mode, id = false) {
  if (mode) {
    QRFrame.style.display = "flex";
    if (id) {
      console.log(id);
      window.CR_ID = id;
    }
    setTimeout(() => {
      QRFrame.classList.add("visible");
    }, 50);
  } else {
    QRFrame.classList.remove("visible");
    setTimeout(() => {
      QRFrame.style.display = "none";
    }, 400);
  }
}
window.showRS = showRS;
