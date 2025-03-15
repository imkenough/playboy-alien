// DOM elements
const recentlyWatchedToggle = document.getElementById("recentlyWatchedToggle");
const settingsSavedMessage = document.getElementById("settingsSaved");
const themeCircles = document.querySelectorAll(".theme-circle");

// Key for storing settings in local storage
const SETTINGS_KEY = "playboy_settings";

// Theme definitions
const THEMES = {
  default: {
    name: "default",
    class: "",
  },
  light: {
    name: "light",
    class: "light-mode",
  },
  green: {
    name: "green",
    class: "green-mode",
  },
  purple: {
    name: "purple",
    class: "purple-mode",
  },
  orange: {
    name: "orange",
    class: "orange-mode",
  },
};

// Load settings when the page loads
document.addEventListener("DOMContentLoaded", () => {
  console.log("Loading settings..."); // Debugging log
  loadSettings();
  setupEventListeners();

  // Wait a short moment to ensure script.js has loaded the initHamburgerMenu function
  setTimeout(() => {
    // Check if the hamburger menu is already initialized by script.js
    const hamburgerMenu = document.querySelector(".hamburger-menu");
    if (hamburgerMenu && !hamburgerMenu.hasInitializedMenu) {
      // If not initialized by script.js, do our own initialization
      initSettingsHamburgerMenu();
    }
  }, 100);
});

// Function to load saved settings
function loadSettings() {
  try {
    const savedSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
    console.log("Loaded settings:", savedSettings); // Debugging log

    // Load recently watched setting (default: true)
    const showRecentlyWatched =
      savedSettings["recently_watched"] !== undefined
        ? savedSettings["recently_watched"]
        : true;
    recentlyWatchedToggle.checked = showRecentlyWatched;

    // Load theme setting (default: 'default')
    const currentTheme = savedSettings["theme"] || "default";
    updateTheme(currentTheme);

    // Mark the active theme in the UI
    themeCircles.forEach((circle) => {
      if (circle.getAttribute("data-theme") === currentTheme) {
        circle.classList.add("active");
      } else {
        circle.classList.remove("active");
      }
    });
  } catch (error) {
    console.error("Error loading settings:", error);
  }
}

// Function to set up event listeners
function setupEventListeners() {
  recentlyWatchedToggle.addEventListener("change", () => {
    // Immediately update recently watched section visibility
    updateRecentlyWatchedVisibility(recentlyWatchedToggle.checked);
    saveSettings();
    showSavedMessage();
  });

  // Add event listeners for theme selection
  themeCircles.forEach((circle) => {
    circle.addEventListener("click", () => {
      const theme = circle.getAttribute("data-theme");
      updateTheme(theme);
      saveSettings();
      showSavedMessage();

      // Dispatch an event to notify other scripts of the theme change
      const event = new CustomEvent("themeChanged", {
        detail: { theme: theme },
      });
      document.dispatchEvent(event);
    });
  });
}

// Function to update recently watched visibility
function updateRecentlyWatchedVisibility(show) {
  // Dispatch an event to notify other pages of the change
  const event = new CustomEvent("recentlyWatchedSettingChanged", {
    detail: { show: show },
  });
  document.dispatchEvent(event);
}

// In settings.js - update the updateTheme function
function updateTheme(themeName) {
  // Remove all theme classes
  Object.values(THEMES).forEach((theme) => {
    if (theme.class) {
      document.body.classList.remove(theme.class);
    }
  });

  // Add new theme class
  const theme = THEMES[themeName];
  if (theme && theme.class) {
    document.body.classList.add(theme.class);
  }

  // Update active state on circles
  themeCircles.forEach((circle) => {
    if (circle.getAttribute("data-theme") === themeName) {
      circle.classList.add("active");
    } else {
      circle.classList.remove("active");
    }
  });

  // Dispatch an event to notify script.js
  const event = new CustomEvent("themeChanged", {
    detail: { theme: themeName },
  });
  document.dispatchEvent(event);

  console.log(`Theme updated to: ${themeName}, class: ${theme?.class}`); // Debugging
}

// Function to save settings
function saveSettings() {
  try {
    const currentSettings =
      JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};

    // Update settings
    currentSettings["recently_watched"] = recentlyWatchedToggle.checked;

    // Get active theme
    const activeThemeCircle = document.querySelector(".theme-circle.active");
    if (activeThemeCircle) {
      currentSettings["theme"] = activeThemeCircle.getAttribute("data-theme");
    }

    // Remove the old dark_mode setting if it exists
    if ("dark_mode" in currentSettings) {
      delete currentSettings["dark_mode"];
    }

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

// Our own hamburger menu initialization for the settings page
function initSettingsHamburgerMenu() {
  const hamburgerMenu = document.querySelector(".hamburger-menu");
  const mobileSidebar = document.querySelector(".mobile-sidebar");
  const sidebarOverlay = document.querySelector(".sidebar-overlay");
  const sidebarLinks = document.querySelectorAll(".sidebar-link");

  if (hamburgerMenu && mobileSidebar && sidebarOverlay) {
    // Mark as initialized to prevent duplicate initialization
    hamburgerMenu.hasInitializedMenu = true;

    // Toggle sidebar when hamburger is clicked
    hamburgerMenu.addEventListener("click", function () {
      hamburgerMenu.classList.toggle("active");
      mobileSidebar.classList.toggle("active");
      sidebarOverlay.classList.toggle("active");
      document.body.style.overflow = mobileSidebar.classList.contains("active")
        ? "hidden"
        : "";
    });

    // Close sidebar when overlay is clicked
    sidebarOverlay.addEventListener("click", function () {
      hamburgerMenu.classList.remove("active");
      mobileSidebar.classList.remove("active");
      sidebarOverlay.classList.remove("active");
      document.body.style.overflow = "";
    });

    // Close sidebar when a link is clicked
    sidebarLinks.forEach((link) => {
      link.addEventListener("click", function () {
        hamburgerMenu.classList.remove("active");
        mobileSidebar.classList.remove("active");
        sidebarOverlay.classList.remove("active");
        document.body.style.overflow = "";
      });
    });
  }
}
