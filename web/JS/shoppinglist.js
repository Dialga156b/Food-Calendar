import {
  getDaysInMonth,
  getRecipeInfoFromID,
  sendMessageToChatGPT,
} from "./utility.js";

addEventListener("DOMContentLoaded", (_) => {
  const ingredients = localStorage.getItem("shoppinglist");
  if (ingredients != null && ingredients != "") {
    loadShoppingList(JSON.parse(ingredients));
  }
  //load shopping list if it exists
});

async function genShoppingList(days) {
  const schedule = JSON.parse(localStorage.getItem("schedule")) || {};
  let today = new Date().getDate();
  let currentMonth = new Date().getMonth();
  let currentDay = today;
  let list = [];

  blurAnim(true);
  //go n get all recipes in timeframe
  for (let i = 0; i < days; i++) {
    const daysInMonth = getDaysInMonth(currentMonth);
    if (currentDay > daysInMonth) {
      currentDay = 1;
      currentMonth += 1;
    }

    const recipes = schedule[currentMonth]?.[`zone_${currentDay}`];
    for (let foodIndex = 0; foodIndex < recipes?.length; foodIndex++) {
      const recipeID = recipes[foodIndex][0];
      var recipe = getRecipeInfoFromID(recipeID);
      if (recipe) {
        var recipeIngredients = getRecipeInfoFromID(recipeID).ingredients;
        list.push(...recipeIngredients);
      }
    }
    currentDay++;
  }

  if (JSON.stringify(list) != "[]") {
    console.log(list);
    document.getElementById("outdated-warning").style.display = "none";
    const response = await sendMessageToChatGPT(
      JSON.stringify(list),
      "ingredients"
    );
    sessionStorage.setItem("QR", ""); // clear qr storage
    blurAnim(false);
    // put shoppinglist in localstorage
    localStorage.setItem("shoppinglist", JSON.stringify(response));
    await loadShoppingList(response);
  } else {
    console.log("No recipes present");
  }
}
async function loadShoppingList(list) {
  console.log(list);
  list = list.ingredients;
  const ingredientList = document.getElementById("ingredient-list");

  let child = ingredientList.firstChild;
  while (child) {
    const next = child.nextSibling;
    if (child.id !== "i-template") {
      ingredientList.removeChild(child);
    }
    child = next;
  }

  FontAwesome.config.missing = (icon) => console.warn("Missing icon:", icon);

  const iconMap = {
    //fontawesome icons
    dairy: "egg",
    produce: "lemon",
    meat: "bacon",
    spice: "pepper-hot",
  };

  const fragment = document.createDocumentFragment();

  for (const item of list) {
    //actually loop through and create each ingredient element.
    console.log("goon!");
    await delay(70);

    const clone = document.getElementById("i-template").cloneNode(true);
    clone.classList.remove("i-template");
    clone.classList.add("i-active");
    clone.removeAttribute("id");

    clone.querySelector("#i-name").textContent = item.item_name;
    clone.querySelector("#i-amt").textContent = `≈ ${item.quantity}`;

    const iconPlaceholder = clone.querySelector("#icon-placeholder");

    const icon = document.createElement("i");
    icon.classList.add("fa-solid");
    icon.classList.add(`fa-${iconMap[item.category] || "star"}`);

    iconPlaceholder.replaceWith(icon);
    ingredientList.appendChild(clone);

    await FontAwesome.dom.i2svg({ node: clone });
  }

  ingredientList.appendChild(fragment);
  FontAwesome.dom.i2svg({ node: ingredientList }); // refresh icons
}
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function blurAnim(state) {
  const ingredientList = document.getElementById("ingredient-list");
  const reload = document.getElementById("s-list-icon");
  if (state) {
    ingredientList.classList.add("list-generating");
    reload.classList.add("icon-visible");
  } else {
    ingredientList.classList.remove("list-generating");
    reload.classList.remove("icon-visible");
  }
}

function minimizeList(list) {
  const minimal = list.map((item) => `${item.item_name}:${item.quantity}`); // get list ready for encoding
  return encodeURIComponent(JSON.stringify(minimal));
}

window.minimizeList = minimizeList;
window.genShoppingList = genShoppingList;
