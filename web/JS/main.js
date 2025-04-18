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
        cell = document.createElement("td");
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
      },
      animation: 230,
      onEnd: function (event) {
        onMoveEnd(event);
      },
    });
  });
}
function populateCalendar() {
  const foods = JSON.parse(localStorage.getItem("schedule"));
  for (const monthIndex in foods) {
    if (monthIndex == newMonth) {
      const zones = foods[monthIndex];
      for (const zone in zones) {
        const foodGroups = zones[zone];
        foodGroups?.forEach((group) => {
          group.forEach((food) => {
            const zoneEl = document.getElementById(zone);
            const foodEl = document.getElementById(food).cloneNode(true);
            if (zoneEl && foodEl) {
              foodEl.classList = "item item-placed";
              //foodEl.querySelector("p").classList.add("p-none");
              zoneEl.appendChild(foodEl);
            }
          });
        });
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
  var clone = event.clone;
  if (clone && item && item.id) {
    clone.id = item.id;
  }

  var foods = JSON.parse(localStorage.getItem("schedule"));
  if (!foods) {
    foods = {
      [newMonth]: {
        [newIndex]: [[item.id]],
      },
    };
  } else {
    //add the item to the day, make the month or the day if either doesnt exist

    if (foods[newMonth] && foods[newMonth][oldIndex]) {
      foods[newMonth][oldIndex] = foods[newMonth][oldIndex].filter(
        (entry) => entry[0] !== item.id
      );

      if (foods[newMonth][oldIndex].length === 0) {
        delete foods[newMonth][oldIndex];
      }
    }

    if (!foods[newMonth]) {
      foods[newMonth] = {};
    }

    if (!foods[newMonth][newIndex]) {
      foods[newMonth][newIndex] = [];
    }

    const dayEntries = foods[newMonth][newIndex];
    dayEntries.push([item.id]);
  }
  localStorage.setItem("schedule", JSON.stringify(foods));
}

function updateMonthName(index) {
  const monthNames = [
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
  y = tempDate.getFullYear();
  m = tempDate.getMonth();

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
newMonth = currentMonth;

addEventListener("DOMContentLoaded", (event) => {
  handleMonthOffset(0);
});
