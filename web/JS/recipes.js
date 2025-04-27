async function sendMessageToChatGPT(userMessage) {
  try {
    const response = await fetch(
      "https://food-calendar-eight.vercel.app/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // Instead of updating HTML here, just return the chatbot's reply
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error communicating with serverless function:", error);
    throw error; // Re-throw so the caller can also handle the error
  }
}

async function genRecipe() {
  const input = document.getElementById("rdesc").value;

  try {
    const chatGptReply = await sendMessageToChatGPT(input);
    console.log("ChatGPT said:", chatGptReply);

    const args = JSON.parse(
      //return recipe if response is good
      chatGptReply || false
    );
    if (args) {
      console.log("Recipe JSON:", args);
      const recipeImgBox = document.getElementById("recipeimgbox");
      const recipeImgLink = recipeImgBox.value;
      // heres the fun stuff! basically a copy of the stuff in main.js tho
      let foods = JSON.parse(localStorage.getItem("recipes")) || {};
      const recipeID = Object.keys(foods).length || 0;

      foods[recipeID] = {
        recipe_name: args.recipe_name,
        ingredients: args.ingredients,
        cook_time_minutes: args.cook_time_minutes,
        prep_time_minutes: args.prep_time_minutes,
        instructions: args.instructions,
        calories: args.calories,
        servings: args.servings,
        desc: args.desc,
        image: recipeImgLink,
        id: recipeID,
      };

      localStorage.setItem("recipes", JSON.stringify(foods));

      reloadRecipes(foods);
    } else {
      console.log("Recipe generation failed!");
    }
  } catch (error) {
    console.error("Something went wrong:", error);
  }
}

function reloadRecipes() {
  recipes = JSON.parse(localStorage.getItem("recipes")) || {};
  const rList = document.getElementById("recipe-list");
  while (rList.firstChild) {
    rList.removeChild(rList.firstChild);
  }
  let recipeCount = Object.keys(recipes).length;
  for (let index = 0; index < recipeCount; index++) {
    const recipe = recipes[index];
    let imgLink = recipe.image;
    if (imgLink == "") {
      imgLink = "../IMG/FoodIcon.png";
    }

    const item = document.createElement("div");
    const img = document.createElement("img");
    const container = document.createElement("div");
    const title = document.createElement("h2");
    const paragraph = document.createElement("p");

    item.classList.add("item");
    item.id = recipe.id;
    img.src = imgLink;
    img.classList.add("food-img");
    container.classList.add("recipe-schedule");
    title.textContent = recipe.recipe_name;
    paragraph.id = "p";
    paragraph.textContent = recipe.desc;

    rList.appendChild(item);
    item.appendChild(img);
    item.appendChild(container);
    container.appendChild(title);
    container.appendChild(paragraph);
  }
  return true;
}
