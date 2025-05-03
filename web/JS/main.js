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

function onMoveEnd(event) {
  if (event.from === event.to) {
    return; // no change
  }

  const item = event.item;
  const oldIndex = event.from.id;
  const newIndex = event.to.id;
  const foodID = item.id;
  const clone = event.clone;

  if (clone && item && foodID) {
    clone.id = foodID;
  }

  let foods = JSON.parse(localStorage.getItem("schedule")) || {};
  const month = newMonth;
  const oldDay = oldIndex;
  const newDay = newIndex;

  if (!foods[month]) {
    foods[month] = {};
    //create month
  }

  if (foods[month][oldDay]) {
    const indexToRemove = foods[month][oldDay].findIndex(
      (entry) => entry[0] === foodID
    );

    if (indexToRemove !== -1) {
      foods[month][oldDay].splice(indexToRemove, 1);
      // only delete first occurence, this was a problem before
    }

    if (foods[month][oldDay].length === 0) {
      delete foods[month][oldDay];
      //delete day if it's empty
    }
  }

  if (!foods[month][newDay]) {
    foods[month][newDay] = [];
    //create day
  }

  foods[month][newDay].push([foodID]);
  document.getElementById("outdated-warning").style.display = "flex";
  const today = `zone_${new Date().getDate()}`;
  localStorage.setItem("schedule", JSON.stringify(foods));
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

var currentMonthOffset = 0;
const currentDate = new Date();
const currentMonth = currentDate.getMonth();
var newMonth = currentMonth; // newMonth isn't defined???? WHAT???

addEventListener("DOMContentLoaded", () => {
  handleMonthOffset(0);
});
document.addEventListener(
  "dragstart",
  function (event) {
    var img = new Image();
    img.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";
    event.dataTransfer.setDragImage(img, 0, 0);
  },
  false
);
window.handleMonthOffset = handleMonthOffset;
