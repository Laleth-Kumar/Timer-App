/**
 * @author Laleth I N <laleth.kumar@solitontech.com>
 */

const ONE_SECOND = 1000;
const ONE_MINUTE = 60000;
const ONE_HOUR = 3600000;
const USER_NAME = location.search.split("=")[1];
const TIME_LOG_URL = `http://localhost:8000/getlog?user=${USER_NAME}`;
const UPDATE_URL = `http://localhost:8000/updatelog?user=${USER_NAME}`;
const DELETE_LOG = `http://localhost:8000/deletelog?user=${USER_NAME}`;

let references = {
  userName: document.querySelector(".username"),
  taskNameInput: document.querySelector(".task-input"),
  startButton: document.querySelector(".start-task"),
  scheduleButton: document.querySelector(".schedule-task"),
  currentTasks: document.querySelector(".current-tasks"),
  scheduledTasks: document.querySelector(".scheduled-tasks"),
  timeLog: document.querySelector(".time-log"),
  popupBox: document.querySelector(".popup-box"),
  closePopup: document.querySelector(".close"),
  importCsv: document.querySelector(".import"),
  exportCsv: document.querySelector(".export"),
  selectedFile: document.querySelector(".file"),
  sideBarButton: document.querySelector(".sidebar-button"),
  closeSidebar: document.querySelector(".close-sidebar"),
};

let taskList = {};
let taskId = 0;
let selected;

async function deleteLogFromServer(id) {
  let response = await fetch(DELETE_LOG, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: id }),
  });
  if (!response.ok) {
    deleteLogFromServer(selected);
  }
}

async function getLogFromServer() {
  let response = await fetch(TIME_LOG_URL);
  if (response.ok) {
    return response.json();
  } else {
    return { error: "Something Went wrong... Try to login later" };
  }
}

async function getLogs() {
  taskList = await getLogFromServer();
  if (taskList.error) {
    alert(taskList.error);
    taskList = {};
  }
}

async function updateLog() {
  let response = await fetch(UPDATE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskList),
  });
  if (!response.ok) {
    updateLog();
  }
}

(function () {
  getLogs().then(() => {
    updateCardDisplay();

    initialize();
  });
})();

function initialize() {
  references.userName.innerHTML = USER_NAME;
  window.addEventListener("resize", hidebuttons);
  references.sideBarButton.addEventListener("click", openSidebar);
  references.closeSidebar.addEventListener("click", closeSidebar);
  references.scheduleButton.addEventListener("click", scheduleTask);
  references.startButton.addEventListener("click", startTask);
  references.exportCsv.addEventListener("click", exportTimeLog);
  references.importCsv.addEventListener("click", importTimeLog);
  references.closePopup.addEventListener("click", () => {
    references.popupBox.style.visibility = "hidden";
  });
  references.popupBox
    .querySelector(".start")
    .addEventListener("click", startNewTask);
  references.popupBox
    .querySelector(".take-time")
    .addEventListener("click", takeTime);
  references.popupBox
    .querySelector(".add-time")
    .addEventListener("click", addTime);
  references.popupBox
    .querySelector(".delete")
    .addEventListener("click", deleteLog);
}

function hidebuttons() {
  if (document.querySelector("body").clientWidth > 1000) {
    document.querySelector(".sidebar").style.visibility = "visible";
    references.sideBarButton.style.visibility = "hidden";
    references.closeSidebar.style.visibility = "hidden";
  } else if (document.querySelector("body").clientWidth < 999) {
    document.querySelector(".sidebar").style.visibility = "hidden";
    references.sideBarButton.style.visibility = "visible";
    references.closeSidebar.style.visibility = "hidden";
  }
}

function openSidebar() {
  document.querySelector(".sidebar").style.visibility = "visible";
  references.closeSidebar.style.visibility = "visible";
}

function closeSidebar() {
  document.querySelector(".sidebar").style.visibility = "hidden";
  references.closeSidebar.style.visibility = "hidden";
}

function updateScheduleEventListeners() {
  references.startTimerButton.forEach((element) => {
    element.addEventListener("click", updateCurrentTask);
  });
}

function updateStopTimerEventListeners() {
  references.stopTimerButton.forEach((element) => {
    element.addEventListener("click", stopTimer);
  });
}

function updateTimeLogListners() {
  references.logs.forEach((element) => {
    element.addEventListener("click", displayPopup);
  });
}

class task {
  constructor(id) {
    let self = this;
    this.taskId = id;
    this.secondValue = 0;
    this.minuteValue = 0;
    this.hourValue = 0;
    this.startTimer = function () {
      let task = document.getElementById(self.taskId.toString());
      let second = task.querySelector(".second");
      let minute = task.querySelector(".minute");
      let hour = task.querySelector(".hour");

      if (self.secondValue > 59) {
        self.secondValue = 0;
        if (self.minuteValue > 59) {
          self.minuteValue = 0;
          hour.innerHTML = String(++self.hourValue).padStart(2, "0");
        } else {
          minute.innerHTML = String(++self.minuteValue).padStart(2, "0");
        }
      } else {
        second.innerHTML = String(++self.secondValue).padStart(2, "0");
      }
    };
    taskList[this.taskId].intervalId = setInterval(this.startTimer, ONE_SECOND);
  }
}

function addToCurrentTask(taskId) {
  references.currentTasks.innerHTML += `<div class="task" id = "${taskId.toString()}" data-ID = ${taskId.toString()}>
  <img
  src="./assets/icons/circle.svg"
  alt="Stop Timer"
  title="Stop Timer"
  class="button stop-timer"
  />
  <p>${taskList[taskId].taskName}</p>
  <img src="./assets/icons/circle-slice-5.svg" alt="Timer icon" />
  <p>
      <span class="hour">00</span>:<span class="minute">00</span>:<span
      class="second"
      >00</span>
  </p>
</div>`;
  new task(taskId);
}

function startTask() {
  if (references.taskNameInput.value != "") {
    taskList[++taskId] = {
      taskName: references.taskNameInput.value,
      startTime: new Date(),
    };
    addToCurrentTask(taskId);
    references.taskNameInput.value = "";
    references.stopTimerButton = document.querySelectorAll(".stop-timer");
    updateStopTimerEventListeners();
  } else {
    alert("Provide a task name");
  }
}

function addToSchedule(taskId) {
  references.scheduledTasks.innerHTML += `<div class="task" data-ID = ${taskId.toString()}>
  <img
  src="./assets/icons/camera-timer.svg"
  alt="Start Timer"
  title="Start Timer"
  class="button start-timer"
  />
  <p>${taskList[taskId].taskName}</p>
</div>`;
}

function scheduleTask() {
  if (references.taskNameInput.value != "") {
    taskList[++taskId] = {
      taskName: references.taskNameInput.value,
    };
    addToSchedule(taskId);
    references.taskNameInput.value = "";
    references.startTimerButton = document.querySelectorAll(".start-timer");
    updateScheduleEventListeners();
  } else {
    alert("Provide a task name");
  }
}

function updateCurrentTask(ev) {
  let id = ev.currentTarget.parentNode.dataset.id;
  taskList[id].startTime = new Date();
  addToCurrentTask(id);
  references.stopTimerButton = document.querySelectorAll(".stop-timer");
  updateStopTimerEventListeners();
  ev.currentTarget.parentNode.remove();
}

function stopTimer(ev) {
  let id = ev.currentTarget.parentNode.dataset.id;
  taskList[id].endTime = new Date();
  clearInterval(taskList[id].intervalId);
  ev.currentTarget.parentNode.remove();
  addToTimelog(id);
}

function addToTimelog(taskId) {
  let timeSpent = taskList[taskId].endTime - taskList[taskId].startTime;
  let [, month, date, year, ,] = taskList[taskId].endTime.toString().split(" ");
  let convertedTime = (timeSpent / ONE_HOUR).toFixed(2);
  let unit = "hrs";
  if (convertedTime < 1) {
    convertedTime = (timeSpent / ONE_MINUTE).toFixed(2);
    unit = "mins";
  }
  taskList[taskId].timeSpent = convertedTime.toString() + " " + unit;
  taskList[taskId].startTime = taskList[taskId].startTime.toString();
  taskList[taskId].endTime = taskList[taskId].endTime.toString();
  addCard(convertedTime, unit, month, date, year, taskId);
  updateLog();
  references.logs = document.querySelectorAll(".log");
  updateTimeLogListners();
}

function addCard(convertedTime, unit, month, date, year, taskId) {
  references.timeLog.innerHTML += `<div class="log" data-id = "${taskId}"title="Select log">
  <p>
    <span class="date">${date} </span>
    <span class="month">${month} </span>
    <span class="year">${year}</span>
  </p>
  
  <p class="task-name">${taskList[taskId].taskName}</p>
  
  <p>
    <span class="time">${convertedTime + " " + unit}</span>
  </p>
  </div>`;
}

function displayPopup(ev) {
  let id = ev.currentTarget.dataset.id;
  let date;
  let month;
  let year;
  let endTime;
  if (taskList[id].endTime != "Not Available") {
    [, month, date, year, endTime, ,] = taskList[id].endTime
      .toString()
      .split(" ");
  } else {
    [month, date, year, endTime] = ["-", "-", "-", "Not Available"];
  }
  let [, , , , startTime, ,] = taskList[id].startTime.toString().split(" ");
  selected = id;

  references.popupBox.querySelector("h2").innerHTML = taskList[id].taskName;
  references.popupBox.querySelector(".date").innerHTML = date;
  references.popupBox.querySelector(".month").innerHTML = month;
  references.popupBox.querySelector(".year").innerHTML = year;
  references.popupBox.querySelector(".start-time").innerHTML = startTime;
  references.popupBox.querySelector(".end-time").innerHTML = endTime;
  references.popupBox.querySelector(".time-spent").innerHTML =
    taskList[id].timeSpent;
  references.popupBox.style.visibility = "visible";
}

function startNewTask() {
  taskList[++taskId] = {
    taskName: taskList[selected].taskName,
    startTime: new Date(),
  };
  addToCurrentTask(taskId);
  references.stopTimerButton = document.querySelectorAll(".stop-timer");
  updateStopTimerEventListeners();
  references.popupBox.style.visibility = "hidden";
}

function takeTime() {
  let time = parseInt(
    references.popupBox.querySelector("[name = 'time']").value
  );
  let unit = "mins";
  let [value, actualUnit] = taskList[selected].timeSpent.split(" ");

  if (time === 1) {
    unit = "hrs";
  }
  if (actualUnit === unit) {
    if (parseFloat(taskList[selected].timeSpent) < time) {
      alert("Operation Not Possible");
    } else {
      taskList[selected].timeSpent =
        (parseFloat(value) - time).toFixed(2) + " " + unit;
    }
  } else if (actualUnit === "mins" && unit === "hrs") {
    alert("Operation Not Possible");
  } else if (actualUnit === "hrs" && unit === "mins") {
    taskList[selected].timeSpent =
      (parseFloat(value) - time / 100).toFixed(2) + " " + unit;
  }
  references.popupBox.querySelector(".time-spent").innerHTML =
    taskList[selected].timeSpent;
  updateCard();
  updateLog();
}

function addTime() {
  let time = parseInt(
    references.popupBox.querySelector("[name = 'time']").value
  );
  let unit = "mins";
  let [value, actualUnit] = taskList[selected].timeSpent.split(" ");
  if (value === "-" || actualUnit === "-") {
    [value, actualUnit] = [0, "mins"];
  }
  if (time === 1) {
    unit = "hrs";
  }
  if (actualUnit === unit) {
    taskList[selected].timeSpent = parseFloat(value) + time + " " + unit;
  } else if (actualUnit === "mins" && unit === "hrs") {
    taskList[selected].timeSpent =
      (parseFloat(value) / 100 + time).toFixed(2) + " " + unit;
  } else if (actualUnit === "hrs" && unit === "mins") {
    taskList[selected].timeSpent =
      (parseFloat(value) + time / 100).toFixed(2) + " " + unit;
  }
  references.popupBox.querySelector(".time-spent").innerHTML =
    taskList[selected].timeSpent;
  updateCard();
  updateLog();
}

function updateCard() {
  document.querySelectorAll(".log").forEach((card) => {
    let id = card.dataset.id;
    if (id === selected) {
      card.querySelector(".time").innerHTML = taskList[id].timeSpent;
    }
  });
}

function deleteLog() {
  document.querySelectorAll(".log").forEach((card) => {
    let id = card.dataset.id;
    if (id === selected) {
      card.remove();
    }
  });
  delete taskList[selected];
  deleteLogFromServer(selected);
  references.popupBox.style.visibility = "hidden";
}

function download(data) {
  const blob = new Blob([data], { type: "text/csv" });

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.setAttribute("href", url);

  a.setAttribute("download", "timeLog.csv");

  a.click();
}

function exportTimeLog() {
  let myLog = Object.keys(taskList).map((key) => {
    return taskList[key];
  });
  let csv = [
    ["taskName", "startTime", "endTime", "timeSpent"],
    ...myLog.map((task) => [
      task.taskName,
      task.startTime,
      task.endTime,
      task.timeSpent,
    ]),
  ]
    .map((e) => e.join(","))
    .join("\n");
  download(csv);
}

function CSVToJSON(csv) {
  const lines = csv.split("\n");
  const keys = lines[0].split(",");
  return lines.slice(1).map((line) => {
    return line.split(",").reduce((acc, cur, i) => {
      const toAdd = {};
      toAdd[keys[i]] = cur;
      return { ...acc, ...toAdd };
    }, {});
  });
}

function importTimeLog() {
  let [file] = references.selectedFile.files;
  const fileReader = new FileReader();
  fileReader.onload = (e) => {
    toBeAdded(CSVToJSON(e.target.result));
    updateLog();
  };
  fileReader.readAsText(file);
}

function toBeAdded(list) {
  list.forEach((task) => {
    taskList[++taskId] = task;
  });
  references.timeLog.innerHTML = "";
  updateCardDisplay();
}

function updateCardDisplay() {
  Object.keys(taskList).forEach((id) => {
    let [, month, date, year, ,] = taskList[id].endTime.split(" ");
    if (
      taskList[id].endTime === undefined ||
      month === undefined ||
      date === undefined ||
      year === undefined
    ) {
      [month, date, year] = ["-", "-", "-"];
      taskList[id].endTime = "Not Available";
    }
    if (taskList[id].timeSpent === undefined) {
      taskList[id].timeSpent = "- -";
    }
    if (taskList[id].startTime === undefined) {
      taskList[id].startTime = "Not Available";
    }
    addCard(
      taskList[id].timeSpent.split(" ")[0],
      taskList[id].timeSpent.split(" ")[1],
      month,
      date,
      year,
      id
    );
    references.logs = document.querySelectorAll(".log");
    updateTimeLogListners();
  });
}
