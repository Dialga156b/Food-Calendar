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
  for (let index = 0; index < list.length; index++) {
    const thisIngredient = list[index];
    console.log(thisIngredient);
  }
}
window.genShoppingList = genShoppingList;
