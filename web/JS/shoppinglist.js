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
    /*
     GPT will hallucinate a list if there's nothing. 
     don't send request if no recipes present.
    */
    const response = await sendMessageToChatGPT(
      JSON.stringify(list),
      "ingredients"
    );
    loadShoppingList(response);
  } else {
    console.log("No recipes present");
  }
}

function loadShoppingList(list) {
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

  for (let index = 0; index < list.length; index++) {
    const thisIngredient = list[index];
    console.log(thisIngredient);
    const category = thisIngredient.category;
    const itemName = thisIngredient.item_name;
    const minimum = thisIngredient.minimum_amount;
    const quantity = thisIngredient.quantity;

    const ingredientElement = document
      .getElementById("i-template")
      .cloneNode(true);

    ingredientElement.classList.remove("i-template");
    ingredientElement.id = "i-active";
    const nameElement = ingredientElement.querySelector("#i-name");
    const amountElement = ingredientElement.querySelector("#i-amt");

    const icon = ingredientElement.querySelector("#i-icon");
    switch (category) {
      case "dairy":
        icon.classList.add("fa-mortar-pestle");
        break;
      case "produce":
        icon.classList.add("fa-lemon");
        break;
      case "meat":
        icon.classList.add("fa-bacon");
        break;
      case "spice":
        icon.classList.add("fa-pepper-hot");
        break;
      default:
        icon.classList.add("fa-star");
        break;
    }
    nameElement.textContent = itemName;
    //amountElement.textContent = "";

    ingredientList.appendChild(ingredientElement);
  }
}
window.genShoppingList = genShoppingList;
