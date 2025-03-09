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

// Event listener for the search input (only if it exists)
const searchInput = document.getElementById("search-input");
if (searchInput) {
  searchInput.addEventListener("input", (event) => {
    const query = event.target.value.trim();
    moveSearchBar(); // Call moveSearchBar to adjust the search bar position
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
    }
  }
}

// Hamburger Menu and Sidebar Functionality
document.addEventListener("DOMContentLoaded", function () {
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
});

//------------------------------------------------------------------------------------------------- Toast Notification Settings --------
const TOAST_MESSAGE = "Added a light mode feature! check it out in settings"; // Change message here
const SHOW_TOAST = true; // Set to false to disable the toast

document.addEventListener("DOMContentLoaded", () => {
  if (SHOW_TOAST) {
    showToast(TOAST_MESSAGE);
  }
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

// recently watched section ----------------------------------------------------------------------

// Constants for local storage
const RECENTLY_WATCHED_ITEMS = "recently_watched_items";
const SETTINGS_KEY = "playboy_settings";

// Function to save an item to recently watched
function saveToRecentlyWatched(mediaItem) {
  console.log("Saving to recently watched:", mediaItem); // Debugging log
  try {
    if (!mediaItem || !mediaItem.id) {
      console.error("Invalid media item:", mediaItem);
      return;
    }

    // Get existing items from local storage
    let recentItems =
      JSON.parse(localStorage.getItem(RECENTLY_WATCHED_ITEMS)) || [];
    console.log("Existing recently watched items:", recentItems); // Debugging log

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
    console.log("Updated recently watched items:", recentItems); // Debugging log

    // If on the homepage, refresh the recently watched section
    if (isHomePage()) {
      displayRecentlyWatched();
    }
  } catch (error) {
    console.error("Error saving to recently watched:", error);
  }
}

// Function to check if the current page is the homepage
function isHomePage() {
  const path = window.location.pathname;
  return path === "/" || path.endsWith("index.html") || path === "/index.html";
}

// Function to create the Recently Watched section if it doesn't exist
function createRecentlyWatchedSection() {
  // Check if the section already exists
  let recentlyWatchedSection = document.querySelector(
    ".recently-watched-section"
  );
  if (!recentlyWatchedSection) {
    // Get settings for recently watched visibility
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
    const showRecentlyWatched =
      settings.recently_watched !== undefined
        ? settings.recently_watched
        : true;

    // Create the section
    recentlyWatchedSection = document.createElement("div");
    recentlyWatchedSection.className = "recently-watched-section";
    recentlyWatchedSection.style.display = showRecentlyWatched
      ? "block"
      : "none";

    // Create the header
    const header = document.createElement("h2");
    header.className = "recently-watched-header";
    header.textContent = "Recently Watched";
    recentlyWatchedSection.appendChild(header);

    // Create the grid for the items
    const grid = document.createElement("div");
    grid.className = "recently-watched-grid";
    recentlyWatchedSection.appendChild(grid);

    // Insert after the search wrapper and before the results container
    const searchWrapper = document.getElementById("search-wrapper");
    const resultsContainer = document.getElementById("results-container");
    if (searchWrapper && resultsContainer) {
      searchWrapper.parentNode.insertBefore(
        recentlyWatchedSection,
        resultsContainer
      );
    } else {
      // Fallback: append to the rt-theme-light div
      const rtTheme = document.querySelector(".rt-theme-light");
      if (rtTheme) {
        rtTheme.appendChild(recentlyWatchedSection);
      }
    }
  }
  return recentlyWatchedSection;
}

// Function to display recently watched items on the homepage
function displayRecentlyWatched() {
  console.log("Displaying recently watched items..."); // Debugging log
  try {
    // Check settings to see if recently watched should be shown
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
    const showRecentlyWatched =
      settings.recently_watched !== undefined
        ? settings.recently_watched
        : true;

    // If settings say not to show, don't create or update the section
    if (!showRecentlyWatched) {
      const existingSection = document.querySelector(
        ".recently-watched-section"
      );
      if (existingSection) {
        existingSection.style.display = "none";
      }
      return;
    }

    // Ensure the recently watched section exists
    const recentlyWatchedSection = createRecentlyWatchedSection();
    recentlyWatchedSection.style.display = "block";

    const grid = recentlyWatchedSection.querySelector(".recently-watched-grid");

    // Get the recently watched items from local storage
    const recentItems =
      JSON.parse(localStorage.getItem(RECENTLY_WATCHED_ITEMS)) || [];
    console.log("Recently watched items from localStorage:", recentItems); // Debugging log

    // Clear the grid before populating it
    grid.innerHTML = "";

    if (recentItems.length === 0) {
      // If there are no items, show a message
      const emptyMessage = document.createElement("p");
      emptyMessage.className = "recently-watched-empty";
      emptyMessage.textContent = "No recently watched items yet";
      grid.appendChild(emptyMessage);
    } else {
      // Populate the grid with recently watched items
      recentItems.forEach((item) => {
        const card = createRecentlyWatchedCard(item);
        grid.appendChild(card);
      });
    }
  } catch (error) {
    console.error("Error displaying recently watched:", error);
  }
}

// Listen for setting changes
document.addEventListener("recentlyWatchedSettingChanged", function (event) {
  console.log("Recently watched setting changed:", event.detail.show);
  if (isHomePage()) {
    const section = document.querySelector(".recently-watched-section");
    if (section) {
      section.style.display = event.detail.show ? "block" : "none";
    } else if (event.detail.show) {
      // If the section doesn't exist yet but should be shown, display it
      displayRecentlyWatched();
    }
  }
});

// Helper function to create a recently watched card
function createRecentlyWatchedCard(item) {
  const card = document.createElement("div");
  card.className = "recently-watched-card";

  // Construct the poster URL
  const posterUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : "assets/placeholder.png";

  // Extract the year from the release date or first air date
  const releaseDate = item.release_date || item.first_air_date || "";
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "N/A";

  // Determine the media type (movie or TV show)
  const mediaType = item.media_type === "tv" ? "Show" : "Movie";

  // Build the card HTML
  card.innerHTML = `
    <img class="recently-watched-card-img" src="${posterUrl}" alt="${item.title}">
    <div class="recently-watched-card-info">
      <h3 class="recently-watched-card-title">${item.title}</h3>
      <p class="recently-watched-card-meta">${mediaType} • ${year}</p>
    </div>
  `;

  // Add a click event to navigate to the item's page
  card.addEventListener("click", () => {
    window.location.href = `${item.media_type}.html?id=${item.id}`;
  });

  return card;
}

// Add functionality to display recently watched items on initial page load
function initRecentlyWatched() {
  if (isHomePage()) {
    // Check if recently watched is enabled in settings
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
    const showRecentlyWatched =
      settings.recently_watched !== undefined
        ? settings.recently_watched
        : true;

    if (!showRecentlyWatched) {
      // If disabled in settings, don't show the section
      return;
    }

    // Add some test data if localStorage is empty (for testing purposes)
    if (
      !localStorage.getItem(RECENTLY_WATCHED_ITEMS) ||
      JSON.parse(localStorage.getItem(RECENTLY_WATCHED_ITEMS)).length === 0
    ) {
      console.log("Adding test data for recently watched");
      const testData = [
        {
          id: 123,
          title: "Test Movie",
          poster_path: null, // Will use placeholder
          media_type: "movie",
          release_date: "2023-01-01",
          timestamp: new Date().toISOString(),
        },
      ];
      localStorage.setItem(RECENTLY_WATCHED_ITEMS, JSON.stringify(testData));
    }

    // Display the recently watched items
    displayRecentlyWatched();
  }
}

// Call functions when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed"); // Debugging log

  // Initialize the recently watched section
  initRecentlyWatched();

  // Apply dark/light mode from settings
  const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
  const darkModeEnabled =
    settings.dark_mode !== undefined ? settings.dark_mode : true;
  if (!darkModeEnabled) {
    document.body.classList.add("light-mode");
  }
});

// Update the search bar position based on recently watched section
function updateSearchPosition() {
  const searchWrapper = document.getElementById("search-wrapper");
  const recentlyWatchedSection = document.querySelector(
    ".recently-watched-section"
  );

  if (searchWrapper) {
    // Check if the recently watched section exists and has items
    if (
      recentlyWatchedSection &&
      recentlyWatchedSection.style.display !== "none" &&
      !recentlyWatchedSection.querySelector(".recently-watched-empty")
    ) {
      searchWrapper.classList.remove("no-recently-watched");
    } else {
      searchWrapper.classList.add("no-recently-watched");
    }
  }
}

// Modified moveSearchBar function to maintain position with recently watched items
function moveSearchBar() {
  const searchWrapper = document.getElementById("search-wrapper");
  const searchInput = document.getElementById("search-input");

  if (searchWrapper && searchInput) {
    // Add 'active' class when there's input
    if (searchInput.value.trim().length > 0) {
      searchWrapper.classList.add("active");
    } else {
      searchWrapper.classList.remove("active");
    }
  }
}

// Update the displayRecentlyWatched function to call updateSearchPosition
function displayRecentlyWatched() {
  console.log("Displaying recently watched items...");
  try {
    // [existing code...]

    // After populating/updating the recently watched section
    updateSearchPosition();
  } catch (error) {
    console.error("Error displaying recently watched:", error);
  }
}

// Call updateSearchPosition when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");

  // Initialize the recently watched section
  initRecentlyWatched();

  // Update search position based on recently watched items
  updateSearchPosition();

  // Apply dark/light mode from settings
  const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
  const darkModeEnabled =
    settings.dark_mode !== undefined ? settings.dark_mode : true;
  if (!darkModeEnabled) {
    document.body.classList.add("light-mode");
  }
});
