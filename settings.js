const recentlyWatchedToggle = document.getElementById("recentlyWatchedToggle");
const darkModeToggle = document.getElementById("darkModeToggle");
const settingsSavedMessage = document.getElementById("settingsSaved");

const SETTINGS_KEY = "playboy_settings";

document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  setupEventListeners();
});

function loadSettings() {
  try {
    const savedSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};

    const darkModeEnabled =
      savedSettings["dark_mode"] !== undefined
        ? savedSettings["dark_mode"]
        : true;
    darkModeToggle.checked = darkModeEnabled;
    updateDarkMode(darkModeEnabled);

    const showRecentlyWatched =
      savedSettings["recently_watched"] !== undefined
        ? savedSettings["recently_watched"]
        : true;
    recentlyWatchedToggle.checked = showRecentlyWatched;
  } catch (error) {
    console.error("Error loading settings:", error);
  }
}

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

function updateDarkMode(enabled) {
  if (enabled) {
    document.body.classList.remove("light-mode");
  } else {
    document.body.classList.add("light-mode");
  }
}

function saveSettings() {
  try {
    const currentSettings =
      JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};

    currentSettings["dark_mode"] = darkModeToggle.checked;
    currentSettings["recently_watched"] = recentlyWatchedToggle.checked;

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(currentSettings));
  } catch (error) {
    console.error("Error saving settings:", error);
  }
}

function showSavedMessage() {
  settingsSavedMessage.classList.add("show");
  setTimeout(() => {
    settingsSavedMessage.classList.remove("show");
  }, 2000);
}
