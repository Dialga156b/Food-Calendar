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
  const response = await sendMessageToChatGPT(
    "1/2 cup of flour",
    "ingredients"
  );
  console.log(response);
}

window.genShoppingList = genShoppingList;
