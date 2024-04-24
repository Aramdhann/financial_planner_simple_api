let accessToken = "";

async function register() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const response = await fetch("/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.text();
  alert(data);
}

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const response = await fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();
  if (response.ok) {
    localStorage.setItem("accessToken", data.accessToken); // Store the token in localStorage
    accessToken = data.accessToken; // Set the token to the global variable
    document.getElementById("userForm").style.display = "none";
    document.getElementById("expenseForm").style.display = "block";
    fetchExpenses(); // Fetch expenses after login
    alert("Logged in successfully");
  } else {
    alert("Login failed: " + data.message);
  }
}

async function fetchExpenses() {
  const response = await fetch("/expenses", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const expenses = await response.json();
  refreshExpenses(expenses); // Function to update the DOM with expenses
}

function refreshExpenses(expenses) {
  const expensesList = document.getElementById("expensesList");
  expensesList.innerHTML = ""; // Clear previous list

  if (expenses.length === 0) {
    expensesList.innerHTML = "<p>No expenses found. Add some expenses!</p>";
  } else {
    expensesList.innerHTML += `
        <div>
          <input type="date" id="startDate" placeholder="Start Date" />
          <input type="date" id="endDate" placeholder="End Date" />
          <button onclick="fetchFilteredExpenses()">Apply Date Filter</button>
        </div>
        
        <div id="dateDisplay"></div>
        `;

    expenses.forEach((expense) => {
      expensesList.innerHTML += `
      <div id="expense-${expense.id}">
          <span>${expense.title} - ${expense.amount} - ${expense.date}</span>
          <button onclick="editExpense(${expense.id})">Edit</button>
          <button onclick="deleteExpense(${expense.id})">Delete</button>
          <div id="editDiv-${expense.id}" style="display:none;">
              <input type="text" id="title-${expense.id}" value="${expense.title}">
              <input type="number" id="amount-${expense.id}" value="${expense.amount}">
              <input type="date" id="date-${expense.id}" value="${expense.date}">
              <button onclick="submitExpenseUpdate(${expense.id})">Save</button>
          </div>
      </div>
  `;
    });
  }
}

async function fetchFilteredExpenses() {
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  if (!startDate || !endDate) {
    alert("Please select both start and end dates.");
    return;
  }

  const response = await fetch(
    `/expenses/filter?startDate=${startDate}&endDate=${endDate}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }
  );

  if (response.ok) {
    const expenses = await response.json();
    displayFilteredExpenses(expenses);
  } else {
    alert("Failed to fetch filtered expenses.");
  }
}

function displayFilteredExpenses(expenses) {
  const expensesList = document.getElementById("expensesList");
  expensesList.innerHTML = ""; // Clear previous list

  if (expenses.length === 0) {
    expensesList.innerHTML =
      "<p>No expenses found for the selected date range.</p>";
  } else {
    expenses.forEach((expense) => {
      expensesList.innerHTML += `
      <div id="expense-${expense.id}">
      <span>${expense.title} - ${expense.amount} - ${expense.date}</span>
      <button onclick="editExpense(${expense.id})">Edit</button>
      <button onclick="deleteExpense(${expense.id})">Delete</button>
      <div id="editDiv-${expense.id}" style="display:none;">
          <input type="text" id="title-${expense.id}" value="${expense.title}">
          <input type="number" id="amount-${expense.id}" value="${expense.amount}">
          <input type="date" id="date-${expense.id}" value="${expense.date}">
          <button onclick="submitExpenseUpdate(${expense.id})">Save</button>
      </div>
  </div>
          `;
    });
  }
}

function editExpense(expenseId) {
  const editDiv = document.getElementById(`editDiv-${expenseId}`);
  editDiv.style.display = "block"; // Show the editable input fields
}

async function submitExpenseUpdate(expenseId) {
  const title = document.getElementById(`title-${expenseId}`).value;
  const amount = document.getElementById(`amount-${expenseId}`).value;
  const date = document.getElementById(`date-${expenseId}`).value;

  const response = await fetch(`/expenses/${expenseId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ title, amount, date }),
  });

  if (response.ok) {
    alert("Expense updated successfully");
    fetchExpenses(); // Refresh the list after updating
  } else {
    alert("Failed to update expense");
  }
}

async function addExpense() {
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const amount = document.getElementById("amount").value;
  const date = document.getElementById("date").value;

  const response = await fetch("/expenses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ title, description, amount, date }),
  });

  const data = await response.text();
  alert(data);

  if (response.ok) {
    fetchExpenses(); // Fetch all expenses to update the list
  }
}

async function deleteExpense(expenseId) {
  // Function to handle expense deletion
  const response = await fetch(`/expenses/${expenseId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (response.ok) {
    fetchExpenses(); // Refresh the list after deletion
  } else {
    alert("Failed to delete expense.");
  }
}

function logout() {
  localStorage.removeItem("accessToken"); // Remove the token from localStorage
  accessToken = null; // Clear the global variable
  document.getElementById("userForm").style.display = "block";
  document.getElementById("expenseForm").style.display = "none";
  // Optionally, clear any displayed data that requires login
  document.getElementById("expensesList").innerHTML = "";
  alert("Logged out successfully");
}

document.addEventListener("DOMContentLoaded", function () {
  const storedToken = localStorage.getItem("accessToken");
  if (storedToken) {
    accessToken = storedToken; // Set the global access token
    document.getElementById("userForm").style.display = "none";
    document.getElementById("expenseForm").style.display = "block";
    fetchExpenses(); // Fetch expenses immediately if already logged in
  }
});
