

let time_disp = document.querySelector(".time-display");
const pause_btn = document.querySelector(".pause_btn");
const res_btn = document.querySelector(".res_btn");
const session_label = document.querySelector(".session_label");
const session_prog = document.querySelectorAll(".dot");
const progress_ring_circle = document.querySelector(".progress-ring-circle");

const radius = 130;
const circumference = 2 * Math.PI * radius;
progress_ring_circle.style.strokeDasharray = circumference;
progress_ring_circle.style.strokeDashoffset = circumference;

const sound = new Audio("sounds/notification.mp3");
sound.preload = "auto";
let timeleft = 25 * 60;
let totalTime = 25 * 60;
let isRunning = false;
let intervalId = null;
let sessionType = "FOCUS";
let cycle = 1;
const FOCUS_TIME = 25 * 60;
const SHORT_BREAK = 5 * 60;
const LONG_BREAK = 15 * 60;

function saveTimerState() {
  const timerState = {
    timeleft,
    totalTime,
    sessionType,
    cycle,
    isRunning,
  };

  localStorage.setItem("timerState", JSON.stringify(timerState));
}

function loadTimerState() {
  const saved = localStorage.getItem("timerState");

  if (saved) {
    const data = JSON.parse(saved);

    timeleft = data.timeleft;
    totalTime = data.totalTime;
    sessionType = data.sessionType;
    cycle = data.cycle;
    isRunning = data.isRunning;
  }
}
loadTimerState();

updateSession();
updateRing();
time_disp.textContent = formatTimer(timeleft);

if (isRunning) {
  timerStart();
  pause_btn.textContent = "PAUSE";
}

function switchSession() {
  if (sessionType === "FOCUS") {
    if (cycle % 4 === 0) {
      sessionType = "LONG_BREAK";
      timeleft = LONG_BREAK;
    } else {
      sessionType = "SHORT_BREAK";
      timeleft = SHORT_BREAK;
    }
    cycle++;
    if (cycle > 4) {
      cycle = 1;
    }
  } else {
    sessionType = "FOCUS";
    timeleft = FOCUS_TIME;
  }
  totalTime = timeleft;
  updateRing();
  updateSession();
  saveTimerState();
}

function updateSession() {
  if (sessionType === "FOCUS") {
    session_label.textContent = `SESSION ${cycle}: FOCUS`;
  } else if (sessionType === "SHORT_BREAK") {
    session_label.textContent = `SHORT BREAK`;
  } else {
    session_label.textContent = `LONG BREAK`;
  }
  updateDOT();
}

function updateDOT() {
  session_prog.forEach((dot, index) => {
    if (index < cycle - 1) {
      dot.classList.add("active");
    } else {
      dot.classList.remove("active");
    }
  });
}

function updateRing() {
  let progress = timeleft / totalTime;
  let offset = progress * circumference;
  progress_ring_circle.style.strokeDashoffset = offset;
}

function timerStart() {
  if (isRunning) return;
  isRunning = true;
  intervalId = setInterval(() => {
    timeleft--;
    updateRing();
    saveTimerState();
    time_disp.textContent = formatTimer(timeleft);
    if (timeleft <= 0) {
      clearInterval(intervalId);
      isRunning = false;
      sound.play();
      saveTimerState();
      switchSession();
    }
  }, 1000);
}

function timerPause() {
  clearInterval(intervalId);
  isRunning = false;
  saveTimerState();
}

function reset() {
  clearInterval(intervalId);
  timeleft = FOCUS_TIME;
  totalTime = FOCUS_TIME;
  isRunning = false;
  sessionType = "FOCUS";
  cycle = 1;
  updateRing();
  updateSession();
  time_disp.textContent = formatTimer(timeleft);
  pause_btn.textContent = "START";
  saveTimerState();
}

function formatTimer(second) {
  let min = Math.floor(second / 60);
  let sec = second % 60;
  return `${min}:${sec < 10 ? "0" : ""}${sec}`;
}

pause_btn.addEventListener("click", () => {
  if (isRunning) {
    timerPause();
    pause_btn.textContent = "START";
  } else {
    timerStart();
    pause_btn.textContent = "PAUSE";
  }
});

res_btn.addEventListener("click", () => {
  reset();
});

let tasks = [];
let task_input = document.querySelector("#task-input");
let task_ul = document.querySelector(".task-list");
let filter = document.querySelectorAll(".filter-btn");
let toggle_btn = document.querySelector("#theme-toggle");
let progress_track = document.querySelector(".progress-fill");
let progress_txt = document.querySelector(".progress-text");
let task_form = document.querySelector(".task-form");
let currentFilter = "all";

function saveTask() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}
function gettask() {
  const stored = localStorage.getItem("tasks");
  if (stored) {
    tasks = JSON.parse(stored);
  }
}

function createTodo(title, status) {
  return {
    id: Date.now(),
    text: title,
    completed: status,
  };
}
gettask();
render_task();

function render_task() {
  task_ul.innerHTML = "";
  let filtered_array = tasks;
  if (currentFilter === "completed") {
    filtered_array = tasks.filter((task) => {
      return task.completed;
    });
  }
  if (currentFilter === "pending") {
    filtered_array = tasks.filter((task) => {
      return !task.completed;
    });
  }

  filtered_array.forEach((task) => {
    const li = document.createElement("li");
    li.classList.add("task-item");
    li.dataset.id = task.id;
    const content = document.createElement("div");
    content.classList.add("task-content");

    const input_checkbox = document.createElement("input");
    input_checkbox.type = "checkbox";
    input_checkbox.classList.add("task-checkbox");
    input_checkbox.checked = task.completed;

    const txt_span = document.createElement("span");
    txt_span.classList.add("task-text");
    txt_span.textContent = task.text;

    const del_btn = document.createElement("button");
    del_btn.classList.add("task-delete");
    del_btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2-icon lucide-trash-2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;

    content.append(input_checkbox, txt_span);
    li.append(content, del_btn);
    task_ul.append(li);
  });
  let total_task = tasks.length;
  let completed_task = tasks.filter((task) => task.completed).length;
  if (total_task !== 0) {
    progress_txt.textContent = `${completed_task} out of ${total_task}`;
    let percentage = (completed_task / total_task) * 100;
    progress_track.style.width = percentage + "%";
  } else {
    progress_txt.textContent = `0 out of 0`;
    progress_track.style.width = "0%";
  }
}

task_form.addEventListener("submit", (e) => {
  e.preventDefault();
  let title = task_input.value.trim();
  if (title === "") {
    return;
  }
  const newtask = createTodo(title, false);
  tasks.push(newtask);
  saveTask();
  task_input.value = "";
  render_task();
});

task_ul.addEventListener("click", (e) => {
  if (e.target.classList.contains("task-checkbox")) {
    let li = e.target.closest(".task-item");
    const id = Number(li.dataset.id);
    const task = tasks.find((task) => task.id === id);
    if (task) {
      task.completed = !task.completed;
    }
    render_task();
    saveTask();
  }
});
task_ul.addEventListener("click", (e) => {
  if (e.target.closest(".task-delete")) {
    let li = e.target.closest(".task-item");
    const id = Number(li.dataset.id);
    tasks = tasks.filter((task) => task.id !== id);
    saveTask();
    render_task();
  }
});
filter.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    filter.forEach((b) => {
      b.classList.remove("active");
    });
    btn.classList.add("active");
    render_task();
  });
});

const savedTheme = localStorage.getItem("theme") || "light";
document.body.classList.add(savedTheme);

toggle_btn.addEventListener("click", () => {
  if (document.body.classList.contains("dark")) {
    document.body.classList.replace("dark", "light");
    localStorage.setItem("theme", "light");
  } else {
    document.body.classList.replace("light", "dark");
    localStorage.setItem("theme", "dark");
  }
});
