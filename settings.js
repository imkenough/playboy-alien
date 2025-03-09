// DOM elements
const recentlyWatchedToggle = document.getElementById("recentlyWatchedToggle");
const darkModeToggle = document.getElementById("darkModeToggle");
const settingsSavedMessage = document.getElementById("settingsSaved");
const hamburgerMenu = document.querySelector(".hamburger-menu");
const mobileSidebar = document.querySelector(".mobile-sidebar");
const sidebarOverlay = document.querySelector(".sidebar-overlay");

// Use `const` only once for settings key
const SETTINGS_KEY = "playboy_settings";

// Load settings on page load
document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  setupEventListeners();
});

// Load saved settings
function loadSettings() {
  try {
    const savedSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};

    // Load dark mode setting (default: true)
    const darkModeEnabled =
      savedSettings["dark_mode"] !== undefined
        ? savedSettings["dark_mode"]
        : true;
    darkModeToggle.checked = darkModeEnabled;
    updateDarkMode(darkModeEnabled);

    // Load recently watched setting (default: true)
    const showRecentlyWatched =
      savedSettings["recently_watched"] !== undefined
        ? savedSettings["recently_watched"]
        : true;
    recentlyWatchedToggle.checked = showRecentlyWatched;
  } catch (error) {
    console.error("Error loading settings:", error);
  }
}

// Event listeners
function setupEventListeners() {
  darkModeToggle.addEventListener("change", () => {
    updateDarkMode(darkModeToggle.checked);
    saveSettings();
    showSavedMessage();
  });

  recentlyWatchedToggle.addEventListener("change", () => {
    saveSettings();
    showSavedMessage();
  });

  // Hamburger Menu Listeners (Fix)
  if (hamburgerMenu && mobileSidebar && sidebarOverlay) {
    hamburgerMenu.addEventListener("click", toggleMobileMenu);
    sidebarOverlay.addEventListener("click", closeMobileMenu);
  }
}

// Apply dark mode
function updateDarkMode(enabled) {
  if (enabled) {
    document.body.classList.remove("light-mode");
  } else {
    document.body.classList.add("light-mode");
  }
}

// Save settings
function saveSettings() {
  try {
    const currentSettings =
      JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};

    // Update settings
    currentSettings["dark_mode"] = darkModeToggle.checked;
    currentSettings["recently_watched"] = recentlyWatchedToggle.checked;

    // Save to localStorage
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(currentSettings));
  } catch (error) {
    console.error("Error saving settings:", error);
  }
}

// Show "Settings Saved" message
function showSavedMessage() {
  settingsSavedMessage.classList.add("show");
  setTimeout(() => {
    settingsSavedMessage.classList.remove("show");
  }, 2000);
}

// Hamburger Menu Functions (Fix)
function toggleMobileMenu() {
  hamburgerMenu.classList.toggle("active");
  mobileSidebar.classList.toggle("active");
  sidebarOverlay.classList.toggle("active");
}

function closeMobileMenu() {
  hamburgerMenu.classList.remove("active");
  mobileSidebar.classList.remove("active");
  sidebarOverlay.classList.remove("active");
}
