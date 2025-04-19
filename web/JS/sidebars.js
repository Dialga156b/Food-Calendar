const lToggleBtn = document.getElementById("leftSidebarIcon");
const sidebarLeft = document.getElementById("sidebarL");

const rToggleBtn = document.getElementById("rightSidebarIcon");
const sidebarRight = document.getElementById("sidebarR");

let leftIsHidden = false;
let rightIsHidden = true;

function setLeftSidebarState(hidden) {
  leftIsHidden = hidden;
  sidebarLeft.classList.toggle("sidebar-disabled", hidden);
  lToggleBtn.name = hidden ? "chevron-forward-sharp" : "chevron-back-sharp";
}

function setRightSidebarState(hidden) {
  rightIsHidden = hidden;
  sidebarRight.classList.toggle("sidebar-right-disabled", hidden);
  rToggleBtn.name = hidden ? "chevron-forward-sharp" : "chevron-back-sharp";
}

function toggleLeftSidebar() {
  setLeftSidebarState(!leftIsHidden);
}

function toggleRightSidebar() {
  setRightSidebarState(!rightIsHidden);
}

setLeftSidebarState(false);
setRightSidebarState(true);
