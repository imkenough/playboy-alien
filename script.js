// Debounce function to limit how often the search is performed
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Function to show skeletons before results load
function showSkeletons(count = 8) {
  const resultsContainer = document.getElementById("results-container");
  if (resultsContainer) {
    resultsContainer.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const skeleton = document.createElement("div");
      skeleton.className = "rt-skeleton";
      resultsContainer.appendChild(skeleton);
    }
  }
}

// Perform search and render results
async function performSearch(query) {
  const resultsContainer = document.getElementById("results-container");
  if (resultsContainer && query) {
    showSkeletons(); // Display skeletons while fetching data
    try {
      // Use relative URL instead of hardcoded localhost
      const response = await fetch(`/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        renderResults(data.results);
      } else {
        resultsContainer.innerHTML = `
          <p class="rt-no-results">No shows/movies found for your search.</p>
        `;
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      resultsContainer.innerHTML = `
        <p class="rt-no-results">Failed to load search results. Please try again later.</p>
      `;
    }
  } else if (resultsContainer) {
    resultsContainer.innerHTML = "";
  }
}

// Debounced search function
const debouncedSearch = debounce(performSearch, 300);

// Event listener for the search input
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      const query = event.target.value.trim();
      moveSearchBar(); // Adjust the search bar position
      debouncedSearch(query); // Trigger the debounced search

      // Hide recently watched when searching
      const recentlyWatchedSection = document.querySelector(
        ".recently-watched-section"
      );
      if (recentlyWatchedSection) {
        recentlyWatchedSection.style.display = query ? "none" : "block";
      }
    });
  }

  // Apply theme immediately when DOM is loaded
  applyThemeFromSettings();
});

// Render the results
function renderResults(results) {
  const resultsContainer = document.getElementById("results-container");
  if (resultsContainer) {
    resultsContainer.innerHTML = "";

    results.forEach((result) => {
      const card = document.createElement("div");
      card.className = "rt-card";

      // Add click event to the card
      card.addEventListener("click", () => {
        const mediaType = result.media_type; // 'movie' or 'tv'
        const id = result.id; // Unique ID for the movie/show

        // Save to recently watched before navigating
        saveToRecentlyWatched(result);

        if (mediaType === "movie") {
          window.location.href = `movie.html?id=${id}`;
        } else if (mediaType === "tv") {
          window.location.href = `tv.html?id=${id}`;
        }
      });

      const img = document.createElement("img");
      img.src = result.poster_path
        ? `https://image.tmdb.org/t/p/w500${result.poster_path}`
        : "assets/placeholder.png";
      img.alt = result.title || result.name;
      img.className = "rt-card-img";
      card.appendChild(img);

      const infoContainer = document.createElement("div");
      infoContainer.className = "rt-card-info";

      const title = document.createElement("h3");
      title.className = "rt-card-title";
      title.textContent = result.title || result.name;
      infoContainer.appendChild(title);

      const meta = document.createElement("p");
      meta.className = "rt-card-meta";
      const type = result.media_type === "tv" ? "Show" : "Movie";
      const releaseDate = result.release_date || result.first_air_date || "";
      const year = releaseDate ? new Date(releaseDate).getFullYear() : "N/A";
      meta.textContent = `${type} • ${year}`;
      infoContainer.appendChild(meta);

      card.appendChild(infoContainer);
      resultsContainer.appendChild(card);
    });
  }
}

// Move search bar to top when typing
function moveSearchBar() {
  const searchWrapper = document.getElementById("search-wrapper");
  const searchInput = document.getElementById("search-input");

  if (searchWrapper && searchInput) {
    // Add 'active' class when there's input
    if (searchInput.value.trim().length > 0) {
      searchWrapper.classList.add("active");
    } else {
      searchWrapper.classList.remove("active");

      // Show recently watched if it should be visible
      const settings =
        JSON.parse(localStorage.getItem("playboy_settings")) || {};
      const showRecentlyWatched =
        settings.recently_watched !== undefined
          ? settings.recently_watched
          : true;

      if (showRecentlyWatched) {
        const recentlyWatchedSection = document.querySelector(
          ".recently-watched-section"
        );
        if (recentlyWatchedSection) {
          recentlyWatchedSection.style.display = "block";
        }
      }
    }
  }
}

// Function to initialize hamburger menu functionality
function initHamburgerMenu() {
  const hamburgerMenu = document.querySelector(".hamburger-menu");
  const mobileSidebar = document.querySelector(".mobile-sidebar");
  const sidebarOverlay = document.querySelector(".sidebar-overlay");
  const sidebarLinks = document.querySelectorAll(".sidebar-link");

  if (
    hamburgerMenu &&
    mobileSidebar &&
    sidebarOverlay &&
    sidebarLinks.length > 0
  ) {
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

    // Handle window resize
    window.addEventListener("resize", function () {
      if (
        window.innerWidth > 768 &&
        mobileSidebar.classList.contains("active")
      ) {
        hamburgerMenu.classList.remove("active");
        mobileSidebar.classList.remove("active");
        sidebarOverlay.classList.remove("active");
        document.body.style.overflow = "";
      }
    });
  }
}

// Hamburger Menu and Sidebar Functionality
document.addEventListener("DOMContentLoaded", function () {
  initHamburgerMenu();
  // Apply theme immediately on all pages
  applyThemeFromSettings();
});

// Toast Notification Settings
const TOAST_MESSAGE =
  "New themes are now available! Check them out in settings"; // Updated message
const SHOW_TOAST = true; // Set to false to disable the toast

document.addEventListener("DOMContentLoaded", () => {
  if (SHOW_TOAST) {
    showToast(TOAST_MESSAGE);
  }

  // Initialize Recently Watched
  initRecentlyWatched();
});

// Function to show toast
function showToast(message) {
  // Remove any existing toast first
  const existingToast = document.querySelector(".toast-container");
  if (existingToast) {
    existingToast.remove();
  }

  // Create toast element
  const toast = document.createElement("div");
  toast.className = "toast-container";
  toast.textContent = message;
  document.body.appendChild(toast);

  // Show toast with delay
  setTimeout(() => {
    toast.classList.add("show");
  }, 200);

  // Auto-hide after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300); // Remove from DOM after fade out
  }, 3000);
}

// Constants for local storage
const RECENTLY_WATCHED_ITEMS = "recently_watched_items";
const SETTINGS_KEY = "playboy_settings";

// Function to check if the current page is the homepage
function isHomePage() {
  const path = window.location.pathname;
  return path === "/" || path.endsWith("index.html") || path === "/index.html";
}

// Function to save an item to recently watched
function saveToRecentlyWatched(mediaItem) {
  if (!mediaItem || !mediaItem.id) {
    console.error("Invalid media item:", mediaItem);
    return;
  }

  try {
    // Get existing items from local storage
    let recentItems =
      JSON.parse(localStorage.getItem(RECENTLY_WATCHED_ITEMS)) || [];

    // Check if the item already exists
    const existingIndex = recentItems.findIndex(
      (item) =>
        item.id === mediaItem.id && item.media_type === mediaItem.media_type
    );

    // If it exists, remove it to avoid duplicates
    if (existingIndex !== -1) {
      recentItems.splice(existingIndex, 1);
    }

    // Add the new item to the beginning of the list
    recentItems.unshift({
      id: mediaItem.id,
      title: mediaItem.title || mediaItem.name,
      poster_path: mediaItem.poster_path,
      media_type: mediaItem.media_type,
      release_date: mediaItem.release_date,
      first_air_date: mediaItem.first_air_date,
      timestamp: new Date().toISOString(),
    });

    // Limit the list to 10 items
    recentItems = recentItems.slice(0, 10);

    // Save the updated list back to local storage
    localStorage.setItem(RECENTLY_WATCHED_ITEMS, JSON.stringify(recentItems));

    // If on the homepage, refresh the recently watched section
    if (isHomePage()) {
      displayRecentlyWatched();
    }
  } catch (error) {
    console.error("Error saving to recently watched:", error);
  }
}

// Function to create and insert the Recently Watched section
function createRecentlyWatchedSection() {
  // First check if it already exists
  let section = document.querySelector(".recently-watched-section");

  if (!section) {
    // Create the section from scratch
    section = document.createElement("div");
    section.className = "recently-watched-section";

    // Create header
    const header = document.createElement("h2");
    header.className = "recently-watched-header";
    header.textContent = "Recently Watched";
    section.appendChild(header);

    // Create grid container
    const grid = document.createElement("div");
    grid.className = "recently-watched-grid";
    section.appendChild(grid);

    // Insert after search wrapper and before results container
    const searchWrapper = document.getElementById("search-wrapper");
    if (searchWrapper) {
      searchWrapper.insertAdjacentElement("afterend", section);
    }
  }

  return section;
}

// Function to display recently watched items
function displayRecentlyWatched() {
  if (!isHomePage()) return;

  try {
    // Check if recently watched should be shown based on settings
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
    const showRecentlyWatched =
      settings.recently_watched !== undefined
        ? settings.recently_watched
        : true;

    if (!showRecentlyWatched) {
      const existingSection = document.querySelector(
        ".recently-watched-section"
      );
      if (existingSection) {
        existingSection.style.display = "none";
      }
      return;
    }

    // Get or create section
    const section = createRecentlyWatchedSection();
    const grid = section.querySelector(".recently-watched-grid");

    // Get items from localStorage
    const items =
      JSON.parse(localStorage.getItem(RECENTLY_WATCHED_ITEMS)) || [];

    // Clear grid
    grid.innerHTML = "";

    if (items.length === 0) {
      // Show empty message
      const emptyMsg = document.createElement("p");
      emptyMsg.className = "recently-watched-empty";
      emptyMsg.textContent = "No recently watched items yet";
      grid.appendChild(emptyMsg);

      // Add "no-recently-watched" class to search wrapper
      const searchWrapper = document.getElementById("search-wrapper");
      if (searchWrapper) {
        searchWrapper.classList.add("no-recently-watched");
      }
    } else {
      // Display items
      items.forEach((item) => {
        const card = createRecentlyWatchedCard(item);
        grid.appendChild(card);
      });

      // Remove "no-recently-watched" class from search wrapper
      const searchWrapper = document.getElementById("search-wrapper");
      if (searchWrapper) {
        searchWrapper.classList.remove("no-recently-watched");
      }
    }

    // Show the section
    section.style.display = "block";
  } catch (error) {
    console.error("Error displaying recently watched:", error);
  }
}

// Function to create a recently watched card
function createRecentlyWatchedCard(item) {
  const card = document.createElement("div");
  card.className = "recently-watched-card";

  // Build poster URL
  const posterUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : "assets/placeholder.png";

  // Format year
  const releaseDate = item.release_date || item.first_air_date || "";
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "N/A";

  // Media type text
  const mediaType = item.media_type === "tv" ? "Show" : "Movie";

  // Build HTML
  card.innerHTML = `
    <img class="recently-watched-card-img" src="${posterUrl}" alt="${item.title}">
    <div class="recently-watched-card-info">
      <h3 class="recently-watched-card-title">${item.title}</h3>
      <p class="recently-watched-card-meta">${mediaType} • ${year}</p>
    </div>
  `;

  // Add click handler
  card.addEventListener("click", () => {
    window.location.href = `${item.media_type}.html?id=${item.id}`;
  });

  return card;
}

// Initialize the recently watched section
function initRecentlyWatched() {
  if (!isHomePage()) return;

  // Check settings
  const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
  const showRecentlyWatched =
    settings.recently_watched !== undefined ? settings.recently_watched : true;

  if (!showRecentlyWatched) return;

  // For development: add sample data if empty
  if (!localStorage.getItem(RECENTLY_WATCHED_ITEMS)) {
    const sampleData = [
      {
        id: 123,
        title: "Sample Movie",
        poster_path: null,
        media_type: "movie",
        release_date: "2023-01-15",
        timestamp: new Date().toISOString(),
      },
    ];
    localStorage.setItem(RECENTLY_WATCHED_ITEMS, JSON.stringify(sampleData));
  }

  // Display the section
  displayRecentlyWatched();
}

// Apply theme from settings - This is the key function
// In script.js - update applyThemeFromSettings function
function applyThemeFromSettings() {
  const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};

  // Apply theme
  const theme = settings.theme || "default";
  const THEMES = {
    default: "",
    light: "light-mode",
    green: "green-mode",
    purple: "purple-mode",
    orange: "orange-mode",
  };

  // Remove all theme classes first
  Object.values(THEMES).forEach((themeClass) => {
    if (themeClass) {
      document.body.classList.remove(themeClass);
    }
  });

  // Apply selected theme
  if (THEMES[theme]) {
    document.body.classList.add(THEMES[theme]);
  }

  console.log(`Applied theme from settings: ${theme}, class: ${THEMES[theme]}`); // Debugging
}

// Add this event listener at the end of script.js
document.addEventListener("themeChanged", (event) => {
  console.log("Theme change event received:", event.detail); // Debugging
  if (event.detail && event.detail.theme) {
    applyThemeFromSettings();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const clearSearch = document.getElementById("clear-search");

  if (searchInput && clearSearch) {
    // Show/hide the clear button based on input
    searchInput.addEventListener("input", () => {
      if (searchInput.value.trim().length > 0) {
        clearSearch.style.opacity = "1";
        clearSearch.style.visibility = "visible";
      } else {
        clearSearch.style.opacity = "0";
        clearSearch.style.visibility = "hidden";
      }
    });

    // Clear the search input and reset the search bar
    clearSearch.addEventListener("click", () => {
      searchInput.value = "";
      searchInput.dispatchEvent(new Event("input")); // Trigger the input event to update the UI
      moveSearchBar(); // Reset the search bar position
    });
  }
});

// Listen for theme changes from settings.js
document.addEventListener("themeChanged", (event) => {
  if (event.detail && event.detail.theme) {
    applyThemeFromSettings();
  }
});
