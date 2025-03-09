// DOM elements
const recentlyWatchedToggle = document.getElementById("recentlyWatchedToggle");
const darkModeToggle = document.getElementById("darkModeToggle");
const settingsSavedMessage = document.getElementById("settingsSaved");

// Key for storing settings in local storage
const SETTINGS_KEY = "playboy_settings";

// Load settings when the page loads
document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  setupEventListeners();
});

// Function to load saved settings
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

// Function to set up event listeners
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
}

// Function to update dark mode
function updateDarkMode(enabled) {
  if (enabled) {
    document.body.classList.remove("light-mode");
  } else {
    document.body.classList.add("light-mode");
  }
}

// Function to save settings
function saveSettings() {
  try {
    const currentSettings =
      JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};

    // Update settings
    currentSettings["dark_mode"] = darkModeToggle.checked;
    currentSettings["recently_watched"] = recentlyWatchedToggle.checked;

    // Save to local storage
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(currentSettings));
  } catch (error) {
    console.error("Error saving settings:", error);
  }
}

// Function to show a "Settings Saved" message
function showSavedMessage() {
  settingsSavedMessage.classList.add("show");
  setTimeout(() => {
    settingsSavedMessage.classList.remove("show");
  }, 2000);
}
