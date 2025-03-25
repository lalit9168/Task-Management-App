class Task {
  constructor(name, description, status, date) {
    this.id = Date.now();
    this.name = name;
    this.description = description;
    this.status = status;
    this.date = date || new Date().toISOString().split('T')[0]; // Default to today's date
  }
}

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return "No date set";
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Main Page Logic
if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
  const taskNameInput = document.getElementById("task-name");
  const taskDescriptionInput = document.getElementById("task-description");
  const taskDateInput = document.getElementById("task-date");
  const addTaskBtn = document.getElementById("add-task-btn");
  const viewTasksBtn = document.getElementById("view-tasks-btn");

  // Set default date to today
  taskDateInput.valueAsDate = new Date();

  function addTask() {
    const name = taskNameInput.value.trim();
    const description = taskDescriptionInput.value.trim();
    const status = document.querySelector('input[name="status"]:checked').value;
    const date = taskDateInput.value;

    if (!name) {
      alert("Task name cannot be empty!");
      return;
    }

    const newTask = new Task(name, description, status, date);
    tasks.push(newTask);
    saveTasks();

    taskNameInput.value = "";
    taskDescriptionInput.value = "";
    taskDateInput.valueAsDate = new Date(); // Reset to today
    document.querySelector('input[name="status"][value="pending"]').checked = true;

    alert("Task added successfully!");
  }

  addTaskBtn.addEventListener("click", addTask);
  viewTasksBtn.addEventListener("click", () => {
    window.location.href = "tasks.html";
  });
}

// Tasks Page Logic
if (window.location.pathname.endsWith("tasks.html")) {
  const taskList = document.getElementById("task-list");
  const filterSelect = document.getElementById("filter");
  const backBtn = document.getElementById("back-btn");
  const searchInput = document.getElementById("search-task");
  const searchBtn = document.getElementById("search-btn");

  function renderTasks(filter = "all", searchTerm = "") {
    taskList.innerHTML = "";
    const filteredTasks = tasks.filter((task) => {
      // Filter by status
      if (filter === "completed" && task.status !== "completed") return false;
      if (filter === "pending" && task.status !== "pending") return false;
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          task.name.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower) ||
          formatDate(task.date).toLowerCase().includes(searchLower)
        );
      }
      return true;
    });

    if (filteredTasks.length === 0) {
      taskList.innerHTML = '<p class="no-tasks">No tasks found matching your criteria.</p>';
      return;
    }

    filteredTasks.forEach((task) => {
      const taskItem = document.createElement("div");
      taskItem.className = `task-item ${task.status}`;
      taskItem.innerHTML = `
        <div>
          <h3>${task.name}</h3>
          <p>${task.description}</p>
          <small class="task-date">Due: ${formatDate(task.date)}</small>
          <small>Status: ${task.status}</small>
        </div>
        <div class="task-actions">
          <button class="complete-btn" onclick="toggleTaskStatus(${task.id})">
            ${task.status === "pending" ? "Mark as Completed" : "Mark as Pending"}
          </button>
          <button class="edit-btn" onclick="editTask(${task.id})">Edit</button>
          <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
        </div>
      `;
      taskList.appendChild(taskItem);
    });
  }

  window.toggleTaskStatus = function (id) {
    const task = tasks.find((task) => task.id === id);
    task.status = task.status === "pending" ? "completed" : "pending";
    saveTasks();
    renderTasks(filterSelect.value, searchInput.value);
  };

  window.editTask = function (id) {
    const task = tasks.find((task) => task.id === id);
    const newName = prompt("Enter new task name:", task.name);
    const newDescription = prompt("Enter new task description:", task.description);
    const newStatus = prompt("Enter new status (pending/completed):", task.status);
    const newDate = prompt("Enter new date (YYYY-MM-DD):", task.date);

    if (newName !== null && newDescription !== null && newStatus !== null && newDate !== null) {
      task.name = newName.trim();
      task.description = newDescription.trim();
      task.status = newStatus.trim().toLowerCase() === "completed" ? "completed" : "pending";
      task.date = newDate.trim();
      saveTasks();
      renderTasks(filterSelect.value, searchInput.value);
    }
  };

  window.deleteTask = function (id) {
    if (confirm("Are you sure you want to delete this task?")) {
      tasks = tasks.filter((task) => task.id !== id);
      saveTasks();
      renderTasks(filterSelect.value, searchInput.value);
    }
  };

  filterSelect.addEventListener("change", (e) => {
    renderTasks(e.target.value, searchInput.value);
  });

  searchBtn.addEventListener("click", () => {
    renderTasks(filterSelect.value, searchInput.value);
  });

  searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      renderTasks(filterSelect.value, searchInput.value);
    }
  });

  backBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  // Initial render
  renderTasks();
}