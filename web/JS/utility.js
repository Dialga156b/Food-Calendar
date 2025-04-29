function getDaysInMonth(month) {
  const tempDate = new Date(); // <<< missing before
  tempDate.setMonth(month);
  const y = tempDate.getFullYear();
  const m = tempDate.getMonth();
  return new Date(y, m + 1, 0).getDate();
}

function getRecipeInfoFromID(id) {
  const recipes = JSON.parse(localStorage.getItem("recipes")) || {};
  return recipes[id];
}

export { getDaysInMonth, getRecipeInfoFromID };
