const lToggleBtn = document.getElementById("leftSidebarIcon");
const sidebarLeft = document.getElementById("sidebarL");

const rToggleBtn = document.getElementById("rightSidebarIcon");
const sidebarRight = document.getElementById("sidebarR");
const rHideDiv = document.getElementById("rToggle");

const newRecipeTab = document.getElementById("newRecipeTab");
const todaysRecipeTab = document.getElementById("todaysRecipeTab");
const settingsTab = document.getElementById("settingsTab");

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
  rToggleBtn.name = hidden ? "chevron-back-sharp" : "chevron-forward-sharp";
  rHideDiv.style.display = hidden ? "none" : "flex";
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
  newRecipeTab.style.display = "none";
  console.log(`${tab}Tab`);
  document.getElementById(`${tab}Tab`).style.display = "block";
}

setLeftSidebarState(true);
setRightSidebarState(true);
