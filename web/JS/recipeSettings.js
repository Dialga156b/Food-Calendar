const QRFrame = document.getElementById("rs-frame");
const RSTitle = document.getElementById("rs-title");
const closeBtn = document.getElementById("rs-icon");
const RSName = document.getElementById("rs-name");

async function showRS(mode, id = false) {
  if (mode) {
    QRFrame.style.display = "flex";
    if (id) {
      const recipes = JSON.parse(localStorage.getItem("recipes")) || {};
      const recipe = recipes[id];

      if (recipe && recipe.recipe_name) {
        RSName.textContent = recipe.recipe_name;
      } else {
        RSName.textContent = "Recipe not found";
      }
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
