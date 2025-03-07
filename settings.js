// DOM elements
const recentlyWatchedToggle = document.getElementById("recentlyWatchedToggle");
const settingsSavedMessage = document.getElementById("settingsSaved");
const hamburgerMenu = document.querySelector(".hamburger-menu");
const mobileSidebar = document.querySelector(".mobile-sidebar");
const sidebarOverlay = document.querySelector(".sidebar-overlay");

// Settings key constants
const SETTINGS_KEY = "playboy_settings";
const RECENTLY_WATCHED_KEY = "show_recently_watched";

// Load settings from localStorage when the page loads
document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  setupEventListeners();
});

// Load saved settings from localStorage
function loadSettings() {
  try {
    const savedSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};

    // Set toggle state based on saved settings (default to true if not set)
    const showRecentlyWatched =
      savedSettings[RECENTLY_WATCHED_KEY] !== undefined
        ? savedSettings[RECENTLY_WATCHED_KEY]
        : true;

    recentlyWatchedToggle.checked = showRecentlyWatched;

    console.log("Settings loaded:", savedSettings);
  } catch (error) {
    console.error("Error loading settings:", error);
    // If there's an error, set default values
    recentlyWatchedToggle.checked = true;
  }
}

// Set up event listeners
function setupEventListeners() {
  // Toggle event for Recently Watched setting
  recentlyWatchedToggle.addEventListener("change", () => {
    saveSettings();
    showSavedMessage();
  });

  // Mobile menu event listeners
  hamburgerMenu?.addEventListener("click", toggleMobileMenu);
  sidebarOverlay?.addEventListener("click", closeMobileMenu);
}

// Save settings to localStorage
function saveSettings() {
  try {
    // Get existing settings or create new object
    const currentSettings =
      JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};

    // Update with new values
    currentSettings[RECENTLY_WATCHED_KEY] = recentlyWatchedToggle.checked;

    // Save to localStorage
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(currentSettings));

    console.log("Settings saved:", currentSettings);
  } catch (error) {
    console.error("Error saving settings:", error);
  }
}

// Show the "Settings Saved" message briefly
function showSavedMessage() {
  settingsSavedMessage.classList.add("show");

  // Hide the message after 2 seconds
  setTimeout(() => {
    settingsSavedMessage.classList.remove("show");
  }, 2000);
}

// Toggle mobile menu
function toggleMobileMenu() {
  hamburgerMenu.classList.toggle("active");
  mobileSidebar.classList.toggle("active");
  sidebarOverlay.classList.toggle("active");
}

// Close mobile menu
function closeMobileMenu() {
  hamburgerMenu.classList.remove("active");
  mobileSidebar.classList.remove("active");
  sidebarOverlay.classList.remove("active");
}
