import { sendMessageToChatGPT } from "./utility.js";

async function genRecipe() {
  const input = document.getElementById("rdesc");
  const containerInner = document.getElementById("gen-container-inner");
  const containerOuter = document.getElementById("gen-container-outer");
  const genPopup = document.getElementById("gen-popup");
  const recipeImgBox = document.getElementById("recipeimgbox");
  containerInner.classList.add("generate-blur");
  containerOuter.classList.add("blur-border");
  genPopup.classList.add("popup-animated");
  if (input.value.trim().length < 3 || input.value == "") {
    return null;
  }
  try {
    const chatGptReply = await sendMessageToChatGPT(input.value, "recipe");
    if (chatGptReply) {
      console.log("Recipe JSON:", chatGptReply);
      // fun stuff! basically a copy of the stuff in main.js though
      let foods = JSON.parse(localStorage.getItem("recipes")) || {};
      const recipeID = Object.keys(foods).length || 0;

      foods[recipeID] = {
        recipe_name: chatGptReply.recipe_name,
        ingredients: chatGptReply.ingredients,
        cook_time_minutes: chatGptReply.cook_time_minutes,
        prep_time_minutes: chatGptReply.prep_time_minutes,
        instructions: chatGptReply.instructions,
        calories: chatGptReply.calories,
        servings: chatGptReply.servings,
        desc: chatGptReply.desc,
        image: recipeImgBox.value,
        id: recipeID,
      };

      localStorage.setItem("recipes", JSON.stringify(foods));

      reloadRecipes();
    } else {
      console.log("Recipe generation failed!");
    }
  } catch (error) {
    console.error("Something went wrong:", error);
  }
  input.value = "";
  recipeImgBox.value = "";
  containerInner.classList.remove("generate-blur");
  containerOuter.classList.remove("blur-border");
  genPopup.classList.remove("popup-animated");
  console.warn("genRecipe Fucntion complete");
}
async function attatchSettingsCheck(item) {
  item.addEventListener("mouseenter", () => {
    const currentSettingsIcon = item.querySelector(".settings-item");
    if (currentSettingsIcon) {
      currentSettingsIcon.style.display = "flex";
      currentSettingsIcon.style.opacity = "1";
    }
  });

  item.addEventListener("mouseleave", () => {
    const currentSettingsIcon = item.querySelector(".settings-item");
    if (currentSettingsIcon) {
      currentSettingsIcon.style.opacity = "0";
    }
  });

  const settingsIcon = item.querySelector(".settings-item");
  if (settingsIcon) {
    settingsIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      console.log(item.id);
      showRS(true, item.id);
    });
  }
}

async function reloadRecipes() {
  console.log("reloading recipes...");
  const allPlacedItems = document.querySelectorAll(".item-placed");
  allPlacedItems.forEach((item) => {
    item.remove();
  });

  const recipes =
    JSON.parse(localStorage.getItem("recipes")) || (await getDefaultRecipes());
  const rList = document.getElementById("recipe-list");
  while (rList.firstChild) {
    rList.removeChild(rList.firstChild);
  }

  const allSettingsIcons = document.querySelectorAll(".settings-item");
  allSettingsIcons.forEach((icon) => {
    icon.style.opacity = "0";
  });

  const recipeValues = Object.values(recipes);
  for (let i = 0; i < recipeValues.length; i++) {
    const recipe = recipeValues[i];
    if (!recipe) {
      continue;
    }
    console.log("successful creation: " + recipe.recipe_name);
    let imgLink = recipe.image;
    if (imgLink == "") {
      imgLink = "IMG/FoodIcon.png";
    }

    const item = document.createElement("div");
    const img = document.createElement("img");
    const container = document.createElement("div");
    const title = document.createElement("h2");
    const paragraph = document.createElement("p");
    const settingsIcon = document.createElement("div");

    item.classList.add("item");
    item.id = recipe.id;
    img.src = imgLink;
    img.classList.add("food-img");
    container.classList.add("recipe-schedule");
    container.id = "recipe-schedule";
    title.textContent = recipe.recipe_name;
    paragraph.id = "p";
    paragraph.textContent = recipe.desc;

    settingsIcon.classList.add("settings-item");
    settingsIcon.innerHTML = '<ion-icon name="settings"></ion-icon>';

    settingsIcon.style.opacity = "0";
    settingsIcon.style.display = "none";

    item.style.position = "relative";

    rList.appendChild(item);
    item.appendChild(img);
    item.appendChild(container);
    item.appendChild(settingsIcon);
    container.appendChild(title);
    container.appendChild(paragraph);

    // This will now handle both hover and click events
    attatchSettingsCheck(item);
  }
  localStorage.setItem("recipes", JSON.stringify(recipes));
  return true;
}

async function getDefaultRecipes() {
  try {
    const response = await fetch(
      "https://food-calendar-eight.vercel.app/default.json"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const jsonObject = await response.json();
    return jsonObject;
  } catch (error) {
    console.error("Error fetching or parsing JSON:", error);
    return [];
  }
}

window.genRecipe = genRecipe;
window.attatchSettingsCheck = attatchSettingsCheck;
window.reloadRecipes = reloadRecipes;
export { reloadRecipes };
