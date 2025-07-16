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
      const site = recipe.site;
      const siteBtn = document.getElementById("btn-web");
      const addSiteBtn = document.getElementById("btn-add-web");
      if (siteBtn) {
        if (site) {
          addSiteBtn.style.display = "none";
          siteBtn.style.display = "block";
        } else {
          addSiteBtn.style.display = "block";
          siteBtn.style.display = "none";
        }
      }

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

function website() {
  const recipeId = window.CR_ID;

  const recipes = JSON.parse(localStorage.getItem("recipes") || "{}");

  if (recipes.hasOwnProperty(recipeId) && recipes[recipeId].site) {
    window.open(recipes[recipeId].site);
  } else {
    alert("You're screwing with me arent ya");
  }
}

function addRecipeWebsite() {
  const recipeId = window.CR_ID;
  const reply = prompt(
    "Insert website link (this won't change the content of the recipe):"
  );

  if (reply) {
    const recipes = JSON.parse(localStorage.getItem("recipes") || "{}");
    if (recipes.hasOwnProperty(recipeId)) {
      recipes[recipeId].site = reply;
      localStorage.setItem("recipes", JSON.stringify(recipes));
    } else {
      alert("dude.");
    }
  }
  showRS(false);
}
window.showRS = showRS;
window.website = website;
window.addRecipeWebsite = addRecipeWebsite;
