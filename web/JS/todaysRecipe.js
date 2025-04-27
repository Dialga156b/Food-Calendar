function loadRecipe(ids) {
  /*
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
    */
  console.log(ids);

  recipes = JSON.parse(localStorage.getItem("recipes")) || {};
  document.querySelectorAll("#tr-active").forEach((element) => {
    element.remove();
  });
  if (ids.length == 0) {
    console.log("no items");
  } else {
    const tab = document.getElementById("todaysRecipeTab");
    const rTemplate = document.getElementById("tr-template");
    for (let index = 0; index < ids.length; index++) {
      const id = ids[index];
      const recipe = recipes[id];
      const thisRecipe = rTemplate.cloneNode(true);
      tab.appendChild(thisRecipe);
      thisRecipe.id = "tr-active";
      thisRecipe.classList = "tr-active";
      const rName = thisRecipe.querySelector("#tr-name");
      const rDesc = thisRecipe.querySelector("#tr-desc");
      const cal = thisRecipe.querySelector("#f-cal");
      const prep = thisRecipe.querySelector("#f-prep");
      const cook = thisRecipe.querySelector("#f-cook");
      const servings = thisRecipe.querySelector("#f-serv");
      const ingredient = thisRecipe.querySelector("#ingredient");
      const step = thisRecipe.querySelector("#step");
      const stepNum = step.children[0];
      const stepName = step.children[1];

      rName.textContent = recipe.recipe_name;
      rDesc.textContent = recipe.desc;
      cal.textContent = recipe.calories;
      prep.textContent = recipe.prep_time_minutes;
      cook.textContent = recipe.cook_time_minutes;
      servings.textContent = recipe.servings;

      for (let index = 0; index < recipe.ingredients.length; index++) {
        const thisIngredient = ingredient.cloneNode(true);
      }
    }
  }
}
