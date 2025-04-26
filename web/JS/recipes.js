async function genRecipe() {
  const input = document.getElementById("rdesc").value;
  const apiKey = "sk-proj-CcIx3pVjLwo6LLJDMbXPT3BlbkFJ5rxPVXzScwmHOZw43TOC";
  /* 
    If i were to make this project public i would change this file to
    be in the backend rather than frontend. Chatgpt API keys are expensive!
  */
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "generate a recipe in structured JSON format",
        },
        {
          role: "user",
          content: input,
        },
      ],
      functions: [
        {
          name: "recipe",
          description: "Structured recipe generator",
          parameters: {
            type: "object",
            properties: {
              recipe_name: {
                type: "string",
                description:
                  "The most basic, commonly known name of the recipe.",
              },
              ingredients: {
                type: "array",
                description: "List of ingredients.",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string", description: "Ingredient name" },
                    amount: { type: "string", description: "Amount required" },
                  },
                  required: ["name", "amount"],
                  additionalProperties: false,
                },
              },
              cook_time_minutes: {
                type: "number",
                description: "Cooking time in minutes",
              },
              prep_time_minutes: {
                type: "number",
                description: "Prep time in minutes",
              },
              instructions: {
                type: "array",
                description: "Step-by-step instructions",
                items: {
                  type: "object",
                  properties: {
                    description: {
                      type: "string",
                      description: "Step description",
                    },
                  },
                  required: ["description"],
                  additionalProperties: false,
                },
              },
              calories: { type: "string", description: "Total calories" },
              servings: { type: "string", description: "Number of servings" },
              desc: {
                type: "string",
                description:
                  "Simple description of the food in less than 10 words OR 70 characters.",
              },
            },
            required: [
              "recipe_name",
              "ingredients",
              "cook_time_minutes",
              "prep_time_minutes",
              "instructions",
              "calories",
              "servings",
              "desc",
            ],
            additionalProperties: false,
          },
        },
      ],
      function_call: { name: "recipe" },
    }),
  });

  const data = await response.json();

  const args = JSON.parse(
    //return recipe if response is good
    data.choices?.[0]?.message?.function_call?.arguments || false
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
