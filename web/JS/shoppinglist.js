import {
  getDaysInMonth,
  getRecipeInfoFromID,
  sendMessageToChatGPT,
} from "./utility.js";

async function genShoppingList(days) {
  const schedule = JSON.parse(localStorage.getItem("schedule")) || {};
  let today = new Date().getDate();
  let currentMonth = new Date().getMonth();
  let currentDay = today;
  let list = [];

  for (let i = 0; i < days; i++) {
    const daysInMonth = getDaysInMonth(currentMonth);
    if (currentDay > daysInMonth) {
      currentDay = 1;
      currentMonth += 1;
    }

    const recipes = schedule[currentMonth]?.[`zone_${currentDay}`];
    for (let foodIndex = 0; foodIndex < recipes?.length; foodIndex++) {
      const recipeID = recipes[foodIndex][0];
      var recipeIngredients = getRecipeInfoFromID(recipeID).ingredients;
      list.push(...recipeIngredients);
    }
    currentDay++;
  }

  if (JSON.stringify(list) != "[]") {
    const response = await sendMessageToChatGPT(
      JSON.stringify(list),
      "ingredients"
    );
    // put shoppinglist in localstorage to be able to generate qr code

    localStorage.setItem("shoppinglist", JSON.stringify(response));
    await loadShoppingList(response);
    const queryString = minimizeList(response.ingredients);
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

  await waitForFontAwesome();

  FontAwesome.config.missing = (icon) => console.warn("Missing icon:", icon);

  const iconMap = {
    dairy: "egg",
    produce: "lemon",
    meat: "bacon",
    spice: "pepper-hot",
  };

  const fragment = document.createDocumentFragment();

  for (const item of list) {
    const clone = document.getElementById("i-template").cloneNode(true);
    clone.classList.remove("i-template");
    clone.removeAttribute("id");

    clone.querySelector("#i-name").textContent = item.item_name;
    clone.querySelector("#i-amt").textContent = `≈ ${item.quantity}`; //`≈ ${item.quantity} ( > ${item.minimum_amount} )`;

    const iconPlaceholder = clone.querySelector("#icon-placeholder");

    const icon = document.createElement("i");
    icon.classList.add("fa-solid");

    icon.classList.add(`fa-${iconMap[item.category] || "star"}`);
    iconPlaceholder.replaceWith(icon);

    fragment.appendChild(clone);
  }
  ingredientList.appendChild(fragment);
  FontAwesome.dom.i2svg({ node: ingredientList });
}

function waitForFontAwesome(timeout = 2000) {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const check = () => {
      if (window.FontAwesome?.dom?.i2svg) return resolve();
      if (performance.now() - start > timeout)
        return reject("FontAwesome not ready");
      requestAnimationFrame(check);
    };
    check();
  });
}

function minimizeList(list) {
  const minimal = list.map((item) => `${item.item_name}:${item.quantity}`);
  console.log(minimal);
  return encodeURIComponent(JSON.stringify(minimal));
}

window.genShoppingList = genShoppingList;
