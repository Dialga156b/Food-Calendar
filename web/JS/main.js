import { reloadRecipes } from "./recipes.js";
function generateCalendar(indent, daysInMonth) {
  const tbody = document.getElementById("calendar-body");
  tbody.innerHTML = "";
  let currentDay = 1;
  let row = document.createElement("tr");

  for (let i = 0; i < indent; i++) {
    //all days before the month
    const cell = document.createElement("td");
    cell.className = "day-blank";
    row.appendChild(cell);
  }

  for (let i = indent; i < 7; i++) {
    if (currentDay > daysInMonth) break;
    row.appendChild(createDayCell(currentDay++));
  }
  tbody.appendChild(row);

  while (currentDay <= daysInMonth) {
    row = document.createElement("tr");
    for (let i = 0; i < 7; i++) {
      if (currentDay <= daysInMonth) {
        row.appendChild(createDayCell(currentDay++));
      } else {
        let cell = document.createElement("td");
        cell.className = "day-blank";
        row.appendChild(cell);
      }
    }
    tbody.appendChild(row);
  }

  initSortable();
}

function createDayCell(day) {
  const cell = document.createElement("td");
  const dayLabel = document.createElement("div");
  const today = new Date();
  if (day == today.getDate() && newMonth == today.getMonth()) {
    //let mon = today.getMonth();
    cell.className = "today";
    const star = document.createElement("ion-icon");
    star.className = "star";
    star.name = "location-sharp";
    cell.className = "today";
    cell.appendChild(star);
  }

  dayLabel.className = "day-number";
  dayLabel.textContent = day;

  const dropZone = document.createElement("div");
  dropZone.className = "drop-zone";

  cell.id = `cell_${day}`;
  dropZone.id = `zone_${day}`;
  cell.appendChild(dayLabel);
  cell.appendChild(dropZone);

  return cell;
}

function initSortable() {
  Sortable.create(document.getElementById("recipe-list"), {
    group: {
      name: "shared",
      pull: "clone",
      put: false,
      zIndex: 10000,
    },
    animation: 150,
    sort: false,
    onEnd: function (event) {
      onMoveEnd(event);
    },
    onMove: function (event) {
      const settingsButton = event.dragged.querySelector(".settings-item");
      if (settingsButton) {
        settingsButton.remove();
      }
    },
  });

  document.querySelectorAll(".drop-zone").forEach((zone) => {
    Sortable.create(zone, {
      group: {
        ghostClass: "item",
        pull: true,
        put: true,
        zIndex: 10000,
      },
      animation: 230,
      onEnd: function (event) {
        onMoveEnd(event);
      },
    });
  });
}
async function populateCalendar() {
  const done = await reloadRecipes();
  if (done) {
    const foods = JSON.parse(localStorage.getItem("schedule"));
    for (const monthIndex in foods) {
      if (monthIndex == newMonth) {
        const zones = foods[monthIndex];
        for (const zone in zones) {
          const foodGroups = zones[zone];
          foodGroups?.forEach((group) => {
            group.forEach((food) => {
              try {
                const zoneEl = document.getElementById(zone);
                const foodEl = document.getElementById(food).cloneNode(true);
                if (zoneEl && foodEl) {
                  foodEl.classList = "item item-placed";
                  zoneEl.appendChild(foodEl);
                }
              } catch (err) {
                //do nothing. har har
              }
            });
          });
        }
      }
    }
  }
}

function deleteScheduledRecipe(month, day, id) {
  console.table(month, day, id);
  let schedule = JSON.parse(localStorage.getItem("schedule")) || {};
  if (schedule[month][day]) {
    const indexToRemove = schedule[month][day].findIndex(
      (entry) => entry[0] === id
    );

    if (indexToRemove !== -1) {
      schedule[month][day].splice(indexToRemove, 1);
      // only delete first occurence, this was a problem before
    }

    if (schedule[month][day].length === 0) {
      console.log("deleted");
      delete schedule[month][day];
      //delete day if it's empty
    }
  }
  localStorage.setItem("schedule", JSON.stringify(schedule));
}

function onMoveEnd(event) {
  if (event.from === event.to) {
    return; // no change
  }

  const item = event.item;
  const oldDay = event.from.id;
  const newDay = event.to.id;
  const foodID = item.id;
  const clone = event.clone;

  if (clone && item && foodID) {
    clone.id = foodID;
    attatchSettingsCheck(clone); // recipes.js
  }

  if (oldDay != "recipe-list") {
    deleteScheduledRecipe(newMonth, oldDay, foodID);
  }
  let schedule = JSON.parse(localStorage.getItem("schedule")) || {};
  if (!schedule[newMonth]) {
    schedule[newMonth] = {};
    //create month
  }
  console.log(schedule);
  if (!schedule[newMonth][newDay]) {
    schedule[newMonth][newDay] = [];
    //create day
  }

  schedule[newMonth][newDay].push([foodID]);
  document.getElementById("outdated-warning").style.display = "flex";
  const today = `zone_${new Date().getDate()}`;
  localStorage.setItem("schedule", JSON.stringify(schedule));
  item.classList.add("item-placed");
  if (oldDay == today || newDay == today) {
    const currentDay = today;
    const currentMonth = new Date().getMonth();
    const schedule = JSON.parse(localStorage.getItem("schedule")) || {};
    const recipes = schedule[currentMonth][currentDay];
    loadRecipe(recipes);
  }
}

function updateMonthName(index) {
  let monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const title = document.getElementById("monthName");
  if (title) {
    title.innerHTML = monthNames[index] ?? null;
  }
}

function handleMonthOffset(int) {
  currentMonthOffset += int;

  const tempDate = new Date();
  tempDate.setMonth(currentMonth + currentMonthOffset);
  var y = tempDate.getFullYear();
  var m = tempDate.getMonth();

  var daysInMonth = new Date(y, m + 1, 0).getDate();
  var firstDate = new Date(y, m, 1);
  var firstDayIndex = firstDate.getDay();
  console.log(m);
  newMonth = m;
  generateCalendar(firstDayIndex, daysInMonth);
  populateCalendar();
  updateMonthName(m);
}

let currentActive = null;
async function manageItemClick(itemElement) {
  //for deletion of items on the calendar
  const target = itemElement;

  if (!target) return;
  if (!target.classList.contains("item-placed")) return;
  if (currentActive === target) return;

  if (currentActive) {
    const existing = currentActive.querySelector(".del-active");
    if (existing) existing.remove();
    const prevRs = currentActive.querySelector("#recipe-schedule");
    if (prevRs) prevRs.style.display = "";
  }

  currentActive = target;

  const delTemplate = document.getElementById("delete");
  const delContainer = delTemplate.cloneNode(true);
  delContainer.classList.add("del-active");
  delContainer.removeAttribute("id");
  target.appendChild(delContainer);

  const rs = target.querySelector("#recipe-schedule");
  if (rs) rs.style.display = "none";

  const closeBtn = delContainer.querySelector("#close-btn");
  const delBtn = delContainer.querySelector("#del-btn");

  const options = new Promise((resolve) => {
    // wait for close or delete button pressed
    const handleClose = () => {
      console.log("closed");
      cleanup();
      resolve("closed");
    };

    const handleDelete = () => {
      console.log("deleted");
      cleanup();

      deleteScheduledRecipe(
        newMonth,
        rs.parentElement.parentElement.id,
        target.id
      );
      target.remove();
      resolve("deleted");
    };

    function cleanup() {
      closeBtn.removeEventListener("click", handleClose);
      delBtn.removeEventListener("click", handleDelete);
    }

    closeBtn.addEventListener("click", handleClose);
    delBtn.addEventListener("click", handleDelete);
  });

  await options;

  delContainer.remove();
  if (document.body.contains(target) && rs) {
    rs.style.display = "";
  }

  currentActive = null;
}
function deleteRecipe() {
  const recipeId = window.CR_ID;
  const itemElements = document.querySelectorAll(
    `[id="${recipeId}"].item, [id="${recipeId}"].item-placed`
  );
  itemElements.forEach((element) => {
    element.remove();
  });

  let schedule = JSON.parse(localStorage.getItem("schedule")) || {};

  for (const monthIndex in schedule) {
    const month = schedule[monthIndex];

    for (const dayIndex in month) {
      const day = month[dayIndex];
      const filteredDay = day.filter((recipeEntry) => {
        return recipeEntry[0] !== recipeId;
      });
      if (filteredDay.length > 0) {
        month[dayIndex] = filteredDay;
      } else {
        delete month[dayIndex];
      }
    }
    if (Object.keys(month).length === 0) {
      delete schedule[monthIndex];
    }
  }
  localStorage.setItem("schedule", JSON.stringify(schedule));

  let recipes = JSON.parse(localStorage.getItem("recipes")) || {};

  if (typeof recipes === "object" && recipes !== null) {
    if (Array.isArray(recipes)) {
      const updatedRecipes = recipes.filter((recipe) => recipe.id !== recipeId);
      localStorage.setItem("recipes", JSON.stringify(updatedRecipes));
    } else {
      delete recipes[recipeId];
      localStorage.setItem("recipes", JSON.stringify(recipes));
    }
  }
  populateCalendar();

  console.log(`Recipe with ID ${recipeId} has been completely deleted`);
}

document.addEventListener("click", async function (event) {
  manageItemClick(event.target.closest(".item"));
});

var currentMonthOffset = 0;
const currentDate = new Date();
const currentMonth = currentDate.getMonth();
var newMonth = currentMonth;

addEventListener("DOMContentLoaded", () => {
  handleMonthOffset(0);
});
document.addEventListener(
  "dragstart",
  function (event) {
    var img = new Image();
    img.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";
    event.dataTransfer.setDragImage(img, 0, 0); // get rid of ugly dragging image
  },
  false
);
window.deleteRecipe = deleteRecipe;
window.handleMonthOffset = handleMonthOffset;
window.manageItemClick = manageItemClick;
