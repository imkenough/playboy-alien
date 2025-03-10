// DOM elements
const recentlyWatchedToggle = document.getElementById("recentlyWatchedToggle");
const darkModeToggle = document.getElementById("darkModeToggle");
const settingsSavedMessage = document.getElementById("settingsSaved");

// Key for storing settings in local storage
const SETTINGS_KEY = "playboy_settings";

// Load settings when the page loads
document.addEventListener("DOMContentLoaded", () => {
  console.log("Loading settings..."); // Debugging log
  loadSettings();
  setupEventListeners();
});

// Function to load saved settings
function loadSettings() {
  try {
    const savedSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
    console.log("Loaded settings:", savedSettings); // Debugging log

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
    // Immediately update recently watched section visibility
    updateRecentlyWatchedVisibility(recentlyWatchedToggle.checked);
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

// Function to update recently watched visibility
function updateRecentlyWatchedVisibility(show) {
  // For the settings page, we don't need to do anything
  // For the home page, this is handled in the script.js file
  // But we can broadcast an event for other pages to listen to
  const event = new CustomEvent("recentlyWatchedSettingChanged", {
    detail: { show: show },
  });
  document.dispatchEvent(event);
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
    console.log("Settings saved:", currentSettings); // Debugging log
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

// Add this to the DOMContentLoaded event listener in settings.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("Loading settings..."); // Debugging log
  loadSettings();
  setupEventListeners();

  // Initialize hamburger menu if the function exists
  if (typeof initHamburgerMenu === "function") {
    initHamburgerMenu();
  } else {
    // Fallback initialization if the function isn't available yet
    const hamburgerMenu = document.querySelector(".hamburger-menu");
    const mobileSidebar = document.querySelector(".mobile-sidebar");
    const sidebarOverlay = document.querySelector(".sidebar-overlay");

    if (hamburgerMenu && mobileSidebar && sidebarOverlay) {
      hamburgerMenu.addEventListener("click", function () {
        hamburgerMenu.classList.toggle("active");
        mobileSidebar.classList.toggle("active");
        sidebarOverlay.classList.toggle("active");
        document.body.style.overflow = mobileSidebar.classList.contains(
          "active"
        )
          ? "hidden"
          : "";
      });

      sidebarOverlay.addEventListener("click", function () {
        hamburgerMenu.classList.remove("active");
        mobileSidebar.classList.remove("active");
        sidebarOverlay.classList.remove("active");
        document.body.style.overflow = "";
      });
    }
  }
});

// Fix for hamburger menu on settings page
document.addEventListener("DOMContentLoaded", function () {
  const hamburgerMenu = document.querySelector(".hamburger-menu");
  const mobileSidebar = document.querySelector(".mobile-sidebar");
  const sidebarOverlay = document.querySelector(".sidebar-overlay");

  if (hamburgerMenu && mobileSidebar && sidebarOverlay) {
    hamburgerMenu.addEventListener("click", function () {
      hamburgerMenu.classList.toggle("active");
      mobileSidebar.classList.toggle("active");
      sidebarOverlay.classList.toggle("active");
      document.body.style.overflow = mobileSidebar.classList.contains("active")
        ? "hidden"
        : "";
    });

    sidebarOverlay.addEventListener("click", function () {
      hamburgerMenu.classList.remove("active");
      mobileSidebar.classList.remove("active");
      sidebarOverlay.classList.remove("active");
      document.body.style.overflow = "";
    });

    const sidebarLinks = document.querySelectorAll(".sidebar-link");
    sidebarLinks.forEach((link) => {
      link.addEventListener("click", function () {
        hamburgerMenu.classList.remove("active");
        mobileSidebar.classList.remove("active");
        sidebarOverlay.classList.remove("active");
        document.body.style.overflow = "";
      });
    });
  }
});
