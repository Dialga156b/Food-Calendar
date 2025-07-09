function loadRecipe(ids) {
  const recipes = JSON.parse(localStorage.getItem("recipes")) || {};
  document.querySelectorAll("#tr-active").forEach((element) => {
    element.remove();
  });
  const headerLbl = document.getElementById("tr-header");
  if (!ids) {
    headerLbl.textContent = "Nothing scheduled for today";
  } else {
    headerLbl.textContent = "Today";
    const tab = document.getElementById("recipe-scroll");
    const rTemplate = document.getElementById("tr-template");
    for (let index = 0; index < ids.length; index++) {
      const id = ids[index];
      const recipe = recipes[id];
      const thisRecipe = rTemplate.cloneNode(true);
      const rName = thisRecipe.querySelector("#tr-name");
      const rDesc = thisRecipe.querySelector("#tr-desc");
      const img = thisRecipe.querySelector("#tr-img");
      const cal = thisRecipe.querySelector("#f-cal");
      const prep = thisRecipe.querySelector("#f-prep");
      const cook = thisRecipe.querySelector("#f-cook");
      const servings = thisRecipe.querySelector("#f-serv");
      const ingredient = thisRecipe.querySelector("#ingredient");
      const step = thisRecipe.querySelector("#step");

      tab.appendChild(thisRecipe);
      thisRecipe.id = "tr-active";
      thisRecipe.classList = "tr-active";

      rName.textContent = recipe.recipe_name;
      rDesc.textContent = recipe.desc;
      cal.textContent = recipe.calories;
      prep.textContent = `${recipe.prep_time_minutes}m`;
      cook.textContent = `${recipe.cook_time_minutes}m`;
      servings.textContent = recipe.servings;
      img.src = recipe.image;
      if (recipe.image == "") {
        img.src = "IMG/FoodIcon.png";
      }
      thisRecipe.querySelector("summary").textContent = recipe.recipe_name;
      const site = recipe.site;
      if (site) {
        console.log(site);
        thisRecipe.querySelector("summary").onclick = () => {
          window.TD_SITE = site;
        };
      } else {
        console.log(site);
        thisRecipe.querySelector("#td-site").style.display = "none";
      }

      for (let index = 0; index < recipe.ingredients.length; index++) {
        const thisIngredientEl = ingredient.cloneNode(true);
        thisIngredientEl.style.display = "list-item";
        thisRecipe.querySelector("#ingredients").appendChild(thisIngredientEl);
        const thisIngredient = recipe.ingredients[index];
        thisIngredientEl.innerHTML = `${thisIngredient.amount} ${thisIngredient.name}`;
      }
      for (let index = 0; index < recipe.instructions.length; index++) {
        const thisStepEl = step.cloneNode(true);
        thisStepEl.style.display = "flex";
        thisRecipe.querySelector("#instructions").appendChild(thisStepEl);
        const thisStep = recipe.instructions[index];
        thisStepEl.children[0].textContent = index + 1;
        thisStepEl.children[1].textContent = thisStep.description;
      }
    }
  }
}
