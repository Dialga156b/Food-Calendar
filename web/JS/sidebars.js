const lToggleBtn = document.getElementById("leftSidebarIcon");
const sidebarLeft = document.getElementById("sidebarL");

const rToggleBtn = document.getElementById("rightSidebarIcon");
const sidebarRight = document.getElementById("sidebarR");
const rHideDiv = document.getElementById("rToggle");

const newRecipeTab = document.getElementById("newRecipeTab");
const todaysRecipeTab = document.getElementById("todaysRecipeTab");
const settingsTab = document.getElementById("settingsTab");
const shoppingListTab = document.getElementById("shoppingListTab");

let leftIsHidden = false;
let rightIsHidden = false;

function setLeftSidebarState(hidden) {
  leftIsHidden = hidden;
  sidebarLeft.classList.toggle("sidebar-disabled", hidden);
  lToggleBtn.name = hidden ? "chevron-forward-sharp" : "chevron-back-sharp";
}

function setRightSidebarState(hidden) {
  rightIsHidden = hidden;
  sidebarRight.classList.toggle("sidebar-right-disabled", hidden);
  rToggleBtn.name = "chevron-forward-sharp";
  void rHideDiv.offsetWidth; // restart anim
  if (!hidden) {
    rHideDiv.classList.remove("animate-exit");
    if (!rHideDiv.classList.contains("animate-enter")) {
      rHideDiv.classList.add("animate-enter");
    }
  } else {
    rHideDiv.classList.remove("animate-enter");
    rHideDiv.classList.add("animate-exit");
  }
}

function toggleLeftSidebar() {
  setLeftSidebarState(!leftIsHidden);
}

function toggleRightSidebar() {
  setRightSidebarState(!rightIsHidden);
}

function setSidebarTab(tab) {
  setRightSidebarState(false);
  todaysRecipeTab.style.display = "none";
  settingsTab.style.display = "none";
  shoppingListTab.style.display = "none";
  newRecipeTab.style.display = "none";
  document.getElementById(`${tab}Tab`).style.display = "flex";
  if (tab === "todaysRecipe") {
    const currentDay = new Date().getDate();
    const currentMonth = new Date().getMonth();
    const schedule = JSON.parse(localStorage.getItem("schedule")) || {};
    const monthSchedule = schedule[currentMonth];
    const recipes = monthSchedule?.[`zone_${currentDay}`];
    if (recipes) {
      loadRecipe(recipes);
    } else {
      loadRecipe(false);
    }
  }
}

setLeftSidebarState(true);
setRightSidebarState(true);
