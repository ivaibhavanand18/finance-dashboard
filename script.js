/**
 * Finance Buddy - Personal Finance Dashboard Data Engine, SPA Routing & Controllers (script.js)
 */

// --------------------------------------------------------------------------
// 1. Theme Engine & Preference Management (Phase 9 - Dark Mode Toggle)
// --------------------------------------------------------------------------
const themeToggleBtn = document.getElementById('theme-toggle');

/**
 * Adds or removes 'dark-mode' class on document.body depending on theme ('dark' or 'light').
 * Also updates toggle button state.
 * @param {string} theme - 'dark' or 'light'
 */
function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
    if (themeToggleBtn) {
      themeToggleBtn.checked = true;
    }
  } else {
    document.body.classList.remove('dark-mode');
    if (themeToggleBtn) {
      themeToggleBtn.checked = false;
    }
  }
}

/**
 * Initializes theme on page load. Checks localStorage for 'themePreference'.
 * If none exists, automatically checks system preference via window.matchMedia('(prefers-color-scheme: dark)').
 */
function initTheme() {
  const savedThemePreference = localStorage.getItem('themePreference');
  if (savedThemePreference) {
    applyTheme(savedThemePreference);
  } else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const defaultTheme = prefersDark ? 'dark' : 'light';
    applyTheme(defaultTheme);
  }
}

// Execute initTheme immediately on load
initTheme();

// Theme toggle click/change event listener
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('change', function () {
    const isDark = document.body.classList.contains('dark-mode');
    const newTheme = isDark ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('themePreference', newTheme);
  });
}

// --------------------------------------------------------------------------
// 2. Single Page Application (SPA) View Router - switchView(targetId)
// --------------------------------------------------------------------------
const navButtons = document.querySelectorAll('.nav-btn');
const spaViews = document.querySelectorAll('.spa-view');

/**
 * Hides all view sections, removes active class from nav buttons,
 * applies display: block/flex to target section, and highlights active button.
 * @param {string} targetId - ID of section to activate (e.g., 'view-dashboard')
 */
function switchView(targetId) {
  // Hide all <section> elements with .spa-view class
  spaViews.forEach(view => {
    view.style.display = 'none';
    view.classList.remove('active-view');
    view.classList.add('hidden-view');
  });

  // Remove active/highlight class from all .nav-btn elements
  navButtons.forEach(btn => {
    btn.classList.remove('active');
  });

  // Target section element
  const targetSection = document.getElementById(targetId);
  if (targetSection) {
    targetSection.style.display = 'block';
    targetSection.classList.remove('hidden-view');
    targetSection.classList.add('active-view');
  }

  // Highlight active nav button matching data-target
  const activeNavBtn = document.querySelector(`.nav-btn[data-target="${targetId}"]`);
  if (activeNavBtn) {
    activeNavBtn.classList.add('active');
  }

  // Re-render / resize chart if switching to Analytics view
  if (targetId === 'view-analytics') {
    updateChart();
    if (chartInstance) {
      setTimeout(() => chartInstance.resize(), 50);
    }
  }
}

// Attach click event listeners to all .nav-btn elements
navButtons.forEach(btn => {
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('data-target');
    if (targetId) {
      switchView(targetId);
    }
  });
});

// --------------------------------------------------------------------------
// 3. Personal Profile State & Modal Management
// --------------------------------------------------------------------------
const defaultProfile = {
  name: 'Alex Morgan',
  age: 28,
  gender: 'Female',
  profession: 'Software Engineer',
  email: 'alex.morgan@financebuddy.io',
  phone: '+91 98765 43210'
};

let userProfile = JSON.parse(localStorage.getItem('userProfile')) || defaultProfile;

function saveProfile() {
  localStorage.setItem('userProfile', JSON.stringify(userProfile));
}

function updateProfileUI() {
  const userNameEl = document.querySelector('.user-name');
  if (userNameEl) {
    userNameEl.textContent = userProfile.name || 'User Profile';
  }

  // Pre-fill profile modal form fields
  if (document.getElementById('profileName')) document.getElementById('profileName').value = userProfile.name || '';
  if (document.getElementById('profileAge')) document.getElementById('profileAge').value = userProfile.age || '';
  if (document.getElementById('profileGender')) document.getElementById('profileGender').value = userProfile.gender || 'Other';
  if (document.getElementById('profileProfession')) document.getElementById('profileProfession').value = userProfile.profession || '';
  if (document.getElementById('profileEmail')) document.getElementById('profileEmail').value = userProfile.email || '';
  if (document.getElementById('profilePhone')) document.getElementById('profilePhone').value = userProfile.phone || '';
}

// Modal DOM References & Handlers
const userProfileBadge = document.getElementById('userProfileBadge');
const profileModal = document.getElementById('profileModal');
const closeProfileModalBtn = document.getElementById('closeProfileModalBtn');
const cancelProfileBtn = document.getElementById('cancelProfileBtn');
const profileForm = document.getElementById('profileForm');

function openProfileModal() {
  updateProfileUI();
  if (profileModal) profileModal.classList.add('active');
}

function closeProfileModal() {
  if (profileModal) profileModal.classList.remove('active');
}

if (userProfileBadge) {
  userProfileBadge.addEventListener('click', openProfileModal);
}

if (closeProfileModalBtn) {
  closeProfileModalBtn.addEventListener('click', closeProfileModal);
}

if (cancelProfileBtn) {
  cancelProfileBtn.addEventListener('click', closeProfileModal);
}

if (profileModal) {
  profileModal.addEventListener('click', function (e) {
    if (e.target === profileModal) {
      closeProfileModal();
    }
  });
}

if (profileForm) {
  profileForm.addEventListener('submit', function (e) {
    e.preventDefault();

    userProfile = {
      name: document.getElementById('profileName').value.trim(),
      age: document.getElementById('profileAge').value.trim(),
      gender: document.getElementById('profileGender').value,
      profession: document.getElementById('profileProfession').value.trim(),
      email: document.getElementById('profileEmail').value.trim(),
      phone: document.getElementById('profilePhone').value.trim()
    };

    saveProfile();
    updateProfileUI();
    closeProfileModal();
  });
}

// Initial UI setup for Profile
updateProfileUI();

// --------------------------------------------------------------------------
// 4. Initial State Data & Monthly Overview Setup
// --------------------------------------------------------------------------
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let monthlyBudget = parseFloat(localStorage.getItem('monthlyBudget')) || 0;

// Current year and month initialization (e.g. '2026-08')
const todayObj = new Date();
const initYear = todayObj.getFullYear();
const initMonthNum = String(todayObj.getMonth() + 1).padStart(2, '0');
let currentMonth = `${initYear}-${initMonthNum}`;

// --------------------------------------------------------------------------
// 5. DOM Element Selections
// --------------------------------------------------------------------------
const totalBalanceEl = document.getElementById('total-balance');
const totalIncomeEl = document.getElementById('total-income');
const totalExpensesEl = document.getElementById('total-expenses');
const transactionForm = document.getElementById('transaction-form');
const transactionsListEl = document.getElementById('transactions-list');

// Month Selector DOM Reference
const monthSelector = document.getElementById('monthSelector');
if (monthSelector) {
  monthSelector.value = currentMonth;
}

// Search & Category Filter DOM Selectors
const searchInput = document.getElementById('searchInput');
const filterCategory = document.getElementById('filterCategory');

// Budget Tracker DOM Selectors
const budgetInput = document.getElementById('budgetInput');
const setBudgetBtn = document.getElementById('setBudgetBtn');
const budgetProgressBar = document.getElementById('budgetProgressBar');
const budgetRemaining = document.getElementById('budgetRemaining');
const budgetWarning = document.getElementById('budgetWarning');

// Additional UI Element References
const netSavingsEl = document.getElementById('net-savings');
const savingsRateSubtextEl = document.getElementById('savings-rate-subtext');
const savingsProgressEl = document.getElementById('savings-progress');
const transactionsCountEl = document.getElementById('transactions-count');
const dateInput = document.getElementById('date');
const filterButtons = document.querySelectorAll('#filter-buttons .btn-filter');

// Global Chart & State Variables
let chartInstance = null;
let activeFilter = 'all';

// --------------------------------------------------------------------------
// 6. LocalStorage Persistence Functions
// --------------------------------------------------------------------------

/**
 * Saves the transactions array to localStorage as a JSON string
 */
function saveTransactions() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

/**
 * Saves the monthlyBudget value to localStorage
 */
function saveBudget() {
  localStorage.setItem('monthlyBudget', monthlyBudget);
}

// --------------------------------------------------------------------------
// 7. Monthly Filtering Helper Function - getCurrentMonthTransactions()
// --------------------------------------------------------------------------

/**
 * Filters the main transactions array and returns only items whose date
 * starts with the currentMonth string (e.g., matching '2026-08')
 * @returns {Array}
 */
function getCurrentMonthTransactions() {
  return transactions.filter(t => t.date && t.date.startsWith(currentMonth));
}

// --------------------------------------------------------------------------
// 8. Helper Formatting Functions
// --------------------------------------------------------------------------

/**
 * Format numerical amount into localized INR currency string
 * @param {number} amount 
 * @returns {string}
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
}

/**
 * Capitalize first letter of string
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// --------------------------------------------------------------------------
// 9. Core Financial Calculations - updateTotals()
// --------------------------------------------------------------------------

/**
 * Calculates totals for the selected month using getCurrentMonthTransactions()
 */
function updateTotals() {
  let totalIncome = 0;
  let totalExpenses = 0;

  // Perform calculations only on current month's filtered transactions
  const currentMonthData = getCurrentMonthTransactions();

  currentMonthData.forEach(transaction => {
    const amount = Number(transaction.amount) || 0;
    if (transaction.type === 'income') {
      totalIncome += amount;
    } else if (transaction.type === 'expense') {
      totalExpenses += amount;
    }
  });

  // Calculate final balance for selected month
  const finalBalance = totalIncome - totalExpenses;

  // Update DOM elements with calculated currency values
  if (totalBalanceEl) totalBalanceEl.innerText = formatCurrency(finalBalance);
  if (totalIncomeEl) totalIncomeEl.innerText = formatCurrency(totalIncome);
  if (totalExpensesEl) totalExpensesEl.innerText = formatCurrency(totalExpenses);

  // Update Savings Ratio Widget
  const netSavings = Math.max(0, finalBalance);
  if (netSavingsEl) netSavingsEl.innerText = formatCurrency(netSavings);

  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0;
  if (savingsRateSubtextEl) savingsRateSubtextEl.innerText = `${savingsRate}% savings rate`;
  if (savingsProgressEl) savingsProgressEl.style.width = `${Math.min(100, savingsRate)}%`;
}

// --------------------------------------------------------------------------
// 10. Monthly Budget Tracking & Warning Engine - updateBudgetProgress()
// --------------------------------------------------------------------------

/**
 * Calculates expense usage against monthlyBudget using getCurrentMonthTransactions()
 */
function updateBudgetProgress() {
  if (!budgetProgressBar || !budgetRemaining || !budgetWarning) return;

  // Sync budgetInput field if set
  if (budgetInput && monthlyBudget > 0 && !budgetInput.value) {
    budgetInput.value = monthlyBudget;
  }

  // Calculate total expenses for current month only
  const currentMonthData = getCurrentMonthTransactions();
  const totalExpenses = currentMonthData
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // If no budget limit has been set
  if (monthlyBudget <= 0) {
    budgetRemaining.textContent = '₹0.00';
    budgetProgressBar.style.width = '0%';
    budgetProgressBar.style.backgroundColor = 'var(--accent-income)';
    budgetWarning.textContent = 'Set a monthly budget to enable tracking.';
    budgetWarning.className = 'budget-warning-text';
    return;
  }

  // Calculate remaining budget amount for current month
  const remaining = monthlyBudget - totalExpenses;
  budgetRemaining.textContent = formatCurrency(remaining);

  // Calculate usage percentage
  const percentage = (totalExpenses / monthlyBudget) * 100;
  const progressWidth = Math.min(100, Math.max(0, percentage));
  budgetProgressBar.style.width = `${progressWidth}%`;

  // Conditional Logic & Visual Warning Triggers
  if (percentage > 100) {
    budgetProgressBar.style.backgroundColor = 'var(--accent-expense)';
    budgetWarning.textContent = '🔴 Budget exceeded!';
    budgetWarning.className = 'budget-warning-text warning-red';
  } else if (percentage >= 90 && percentage <= 100) {
    budgetProgressBar.style.backgroundColor = '#f59e0b';
    budgetWarning.textContent = '⚠️ Warning: You are close to your budget!';
    budgetWarning.className = 'budget-warning-text warning-orange';
  } else {
    budgetProgressBar.style.backgroundColor = 'var(--accent-income)';
    budgetWarning.textContent = '';
    budgetWarning.className = 'budget-warning-text';
  }
}

// Event listener for 'Set Budget' button
if (setBudgetBtn) {
  setBudgetBtn.addEventListener('click', function () {
    const inputValue = parseFloat(budgetInput ? budgetInput.value : 0);

    if (!isNaN(inputValue) && inputValue >= 0) {
      monthlyBudget = inputValue;
      saveBudget();
      updateBudgetProgress();
    } else {
      alert('Please enter a valid non-negative number for your budget.');
    }
  });
}

// --------------------------------------------------------------------------
// 11. Chart.js Doughnut Visualization Engine - updateChart()
// --------------------------------------------------------------------------

/**
 * Renders Chart.js doughnut chart based on getCurrentMonthTransactions()
 */
function updateChart() {
  const chartCanvas = document.getElementById('expenseChart');
  if (!chartCanvas || typeof Chart === 'undefined') return;

  const categoryTotals = {};
  const categoryLabelsMap = {
    salary: 'Salary & Wages',
    freelance: 'Freelance',
    food: 'Food & Dining',
    housing: 'Housing & Utilities',
    shopping: 'Shopping',
    transport: 'Transportation',
    investment: 'Investment',
    health: 'Healthcare',
    other: 'Other'
  };

  // Perform calculations on current month's expenses only
  const currentMonthData = getCurrentMonthTransactions();

  currentMonthData
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const label = categoryLabelsMap[t.category] || capitalize(t.category);
      categoryTotals[label] = (categoryTotals[label] || 0) + Number(t.amount);
    });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  // Destroy existing chart instance to prevent rendering overlaps
  if (chartInstance) {
    chartInstance.destroy();
  }

  const palette = [
    '#f43f5e', '#6366f1', '#f59e0b', '#0ea5e9',
    '#10b981', '#a855f7', '#ec4899', '#8b5cf6'
  ];

  const chartLabels = labels.length > 0 ? labels : ['No Expenses'];
  const chartData = labels.length > 0 ? data : [1];
  const chartColors = labels.length > 0 ? palette.slice(0, labels.length) : ['rgba(156, 163, 175, 0.2)'];

  const ctx = chartCanvas.getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: chartLabels,
      datasets: [{
        data: chartData,
        backgroundColor: chartColors,
        borderWidth: 2,
        borderColor: 'transparent',
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: 'rgb(156, 163, 175)',
            font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' },
            padding: 14,
            usePointStyle: true
          }
        },
        tooltip: {
          enabled: labels.length > 0,
          callbacks: {
            label: function (context) {
              const value = context.parsed || 0;
              return ` ${context.label}: ₹${value.toFixed(2)}`;
            }
          }
        }
      },
      cutout: '70%'
    }
  });
}

/**
 * SVG Icon Helper per category
 */
function getCategoryIcon(category) {
  switch (category) {
    case 'food':
      return `<div class="transaction-category-icon cat-food">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
          <line x1="6" y1="1" x2="6" y2="4"></line>
          <line x1="10" y1="1" x2="10" y2="4"></line>
          <line x1="14" y1="1" x2="14" y2="4"></line>
        </svg>
      </div>`;
    case 'freelance':
    case 'salary':
      return `<div class="transaction-category-icon cat-freelance">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
      </div>`;
    case 'housing':
      return `<div class="transaction-category-icon cat-housing">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </div>`;
    case 'shopping':
    case 'transport':
      return `<div class="transaction-category-icon cat-shopping">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
      </div>`;
    case 'investment':
    default:
      return `<div class="transaction-category-icon cat-investment">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      </div>`;
  }
}

// --------------------------------------------------------------------------
// 12. Transaction List Rendering - renderTransactions(data)
// --------------------------------------------------------------------------

/**
 * Clears list container and renders provided transaction items
 * @param {Array} data - Array of transaction objects (defaults to getCurrentMonthTransactions())
 */
function renderTransactions(data = getCurrentMonthTransactions()) {
  if (!transactionsListEl) return;

  transactionsListEl.innerHTML = '';

  if (transactionsCountEl) {
    transactionsCountEl.innerText = `${data.length} Total`;
  }

  if (data.length === 0) {
    transactionsListEl.innerHTML = `
      <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted); font-size: 0.9rem;">
        No transactions found for ${currentMonth}.
      </div>`;
    return;
  }

  data.forEach(item => {
    const isIncome = item.type === 'income';
    const amountPrefix = isIncome ? '+' : '-';
    const amountClass = isIncome ? 'amount-income' : 'amount-expense';

    const transactionItemEl = document.createElement('div');
    transactionItemEl.className = 'transaction-item';
    transactionItemEl.setAttribute('data-id', item.id);

    transactionItemEl.innerHTML = `
      ${getCategoryIcon(item.category)}
      <div class="transaction-info">
        <span class="transaction-title">${item.description}</span>
        <span class="transaction-meta">${item.date} • ${capitalize(item.category)}</span>
      </div>
      <div class="transaction-action-group">
        <div class="transaction-amount ${amountClass}">
          ${amountPrefix}${formatCurrency(item.amount)}
        </div>
        <button type="button" class="btn-delete" data-id="${item.id}" aria-label="Delete transaction" title="Delete Transaction">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    `;

    const deleteBtn = transactionItemEl.querySelector('.btn-delete');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', function () {
        deleteTransaction(item.id);
      });
    }

    transactionsListEl.appendChild(transactionItemEl);
  });
}

// --------------------------------------------------------------------------
// 13. Search & Category Filtering Function - applyFilters()
// --------------------------------------------------------------------------

function applyFilters() {
  const searchText = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selectedCategory = filterCategory ? filterCategory.value : 'all';

  const currentMonthData = getCurrentMonthTransactions();

  const filteredArray = currentMonthData.filter(item => {
    const matchesSearch = item.description.toLowerCase().includes(searchText);
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesType = activeFilter === 'all' || item.type === activeFilter;

    return matchesSearch && matchesCategory && matchesType;
  });

  renderTransactions(filteredArray);
}

/**
 * Removes transaction from main array based on ID, updates storage, UI & chart for currentMonth
 * @param {number} id 
 */
function deleteTransaction(id) {
  const index = transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    transactions.splice(index, 1);
  }

  saveTransactions();
  refreshDashboardUI();
}

/**
 * Central function to refresh all UI components for currentMonth
 */
function refreshDashboardUI() {
  updateTotals();
  updateChart();
  updateBudgetProgress();
  applyFilters();
}

// --------------------------------------------------------------------------
// 14. Event Listeners (Month Selector, Search, Filter Dropdown, Form Submit)
// --------------------------------------------------------------------------

// Month Selector Change Event Listener
if (monthSelector) {
  monthSelector.addEventListener('change', function () {
    currentMonth = this.value;
    refreshDashboardUI();
  });
}

if (searchInput) {
  searchInput.addEventListener('input', applyFilters);
}

if (filterCategory) {
  filterCategory.addEventListener('change', applyFilters);
}

if (transactionForm) {
  transactionForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const description = document.getElementById('description').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;

    const typeRadio = document.querySelector('input[name="type"]:checked');
    const type = typeRadio ? typeRadio.value : 'expense';

    if (!description || isNaN(amount) || amount <= 0 || !category || !date) {
      alert('Please provide valid input for all form fields.');
      return;
    }

    const newTransaction = {
      id: Date.now(),
      description,
      amount,
      category,
      type,
      date
    };

    transactions.unshift(newTransaction);
    saveTransactions();

    // If new transaction's date matches currentMonth, update selector & refresh
    if (date.startsWith(currentMonth)) {
      refreshDashboardUI();
    } else {
      // Auto-switch currentMonth to new transaction's month for seamless UX
      currentMonth = date.substring(0, 7);
      if (monthSelector) {
        monthSelector.value = currentMonth;
      }
      refreshDashboardUI();
    }

    transactionForm.reset();
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.value = today;
    }
  });
}

// Filter Tab Buttons Handler
filterButtons.forEach(btn => {
  btn.addEventListener('click', function () {
    filterButtons.forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    activeFilter = this.getAttribute('data-filter') || 'all';
    applyFilters();
  });
});

// --------------------------------------------------------------------------
// 15. Startup Initializer
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  if (dateInput && !dateInput.value) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }

  updateProfileUI();
  refreshDashboardUI();
});

// Initial startup load
updateProfileUI();
refreshDashboardUI();
