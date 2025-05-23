// In script.js
const SETTINGS_KEY = "playboy_settings";
const RECENTLY_WATCHED_ITEMS = "recently_watched_items";

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
    function isHomePage() {
      return (
        window.location.pathname.endsWith("index.html") ||
        window.location.pathname === "/"
      );
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

// Listen for changes to the recently watched setting
document.addEventListener("recentlyWatchedSettingChanged", (event) => {
  const show = event.detail.show;
  const recentlyWatchedSection = document.querySelector(
    ".recently-watched-section"
  );
  if (recentlyWatchedSection) {
    recentlyWatchedSection.style.display = show ? "block" : "none";
  }
});

function isHomePage() {
  return (
    window.location.pathname.endsWith("index.html") ||
    window.location.pathname === "/"
  );
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

    // Get or create section
    const section = createRecentlyWatchedSection();
    const grid = section.querySelector(".recently-watched-grid");

    // Get items from localStorage
    const items =
      JSON.parse(localStorage.getItem(RECENTLY_WATCHED_ITEMS)) || [];

    // Clear grid
    grid.innerHTML = "";

    if (!showRecentlyWatched || items.length === 0) {
      // Hide the section if the setting is off or there are no items
      section.style.display = "none";

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

      // Show the section
      section.style.display = "block";

      // Remove "no-recently-watched" class from search wrapper
      const searchWrapper = document.getElementById("search-wrapper");
      if (searchWrapper) {
        searchWrapper.classList.remove("no-recently-watched");
      }
    }
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
    <div class="recently-watched-card-header">
      <img class="recently-watched-card-img" src="${posterUrl}" alt="${item.title}">
      <button class="recently-watched-delete-btn">&times;</button>
    </div>
    <div class="recently-watched-card-info">
      <h3 class="recently-watched-card-title">${item.title}</h3>
      <p class="recently-watched-card-meta">${mediaType} • ${year}</p>
    </div>
  `;

  // Add click handler for the card (to navigate to the movie/show page)
  card.addEventListener("click", (event) => {
    // Prevent navigation if the delete button is clicked
    if (!event.target.classList.contains("recently-watched-delete-btn")) {
      window.location.href = `${item.media_type}.html?id=${item.id}`;
    }
  });

  // Add click handler for the delete button
  const deleteButton = card.querySelector(".recently-watched-delete-btn");
  deleteButton.addEventListener("click", (event) => {
    event.stopPropagation(); // Prevent the card click event from firing
    removeFromRecentlyWatched(item); // Remove the item from localStorage
    card.remove(); // Remove the card from the UI
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
  // if (!localStorage.getItem(RECENTLY_WATCHED_ITEMS)) {
  //   const sampleData = [
  //     {
  //       id: 123,
  //       title: "Sample Movie",
  //       poster_path: null,
  //       media_type: "movie",
  //       release_date: "2023-01-15",
  //       timestamp: new Date().toISOString(),
  //     },
  //   ];
  //   localStorage.setItem(RECENTLY_WATCHED_ITEMS, JSON.stringify(sampleData));
  // }

  // Display the section
  displayRecentlyWatched();
}

document.addEventListener("DOMContentLoaded", () => {
  initRecentlyWatched(); // Ensure this is called
  displayRecentlyWatched(); // Ensure this is called
});

// Function to remove an item from recently watched
function removeFromRecentlyWatched(item) {
  try {
    // Get existing items from local storage
    let recentItems =
      JSON.parse(localStorage.getItem(RECENTLY_WATCHED_ITEMS)) || [];

    // Find the index of the item to remove
    const index = recentItems.findIndex(
      (i) => i.id === item.id && i.media_type === item.media_type
    );

    // If the item exists, remove it
    if (index !== -1) {
      recentItems.splice(index, 1);
    }

    // Save the updated list back to local storage
    localStorage.setItem(RECENTLY_WATCHED_ITEMS, JSON.stringify(recentItems));

    // If on the homepage, refresh the recently watched section
    if (isHomePage()) {
      displayRecentlyWatched();
    }
  } catch (error) {
    console.error("Error removing from recently watched:", error);
  }
}

// Apply theme from settings - This is the key function
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

//recentlywatchedsettingchanged
document.addEventListener("recentlyWatchedSettingChanged", (event) => {
  const show = event.detail.show;
  const recentlyWatchedSection = document.querySelector(
    ".recently-watched-section"
  );
  if (recentlyWatchedSection) {
    recentlyWatchedSection.style.display = show ? "block" : "none";
  }
});

// Toast Message Component
function showToast(message, duration = 3000) {
  // Check if the toast has expired (1 week in milliseconds)
  const oneWeekInMs = 7 * 24 * 60 * 60 * 1000; // 7 days
  const toastShownCount = localStorage.getItem("toastShownCount");
  const toastDismissed = localStorage.getItem("toastDismissed");
  const toastTimestamp = localStorage.getItem("toastTimestamp");

  // If the timestamp exists and is older than a week, clear the data
  if (toastTimestamp && Date.now() - parseInt(toastTimestamp) > oneWeekInMs) {
    localStorage.removeItem("toastShownCount");
    localStorage.removeItem("toastDismissed");
    localStorage.removeItem("toastTimestamp");
  }

  // Check if the user has seen the toast more than twice or dismissed it
  if (toastShownCount >= 2 || toastDismissed === "true") {
    return; // Don't show the toast if the user has seen it twice or dismissed it
  }

  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  // Create close button
  const closeButton = document.createElement("button");
  closeButton.className = "toast-close";
  closeButton.innerHTML = "&times;";
  closeButton.addEventListener("click", () => {
    // Set the dismissed flag and timestamp in localStorage
    localStorage.setItem("toastDismissed", "true");
    localStorage.setItem("toastTimestamp", Date.now());
    toast.remove();
  });

  // Append close button to toast
  toast.appendChild(closeButton);

  // Append toast to container
  toastContainer.appendChild(toast);

  // Trigger reflow to enable the transition
  void toast.offsetWidth;

  // Show the toast
  toast.classList.add("show");

  // Increment the toast shown count and store the timestamp in localStorage
  localStorage.setItem("toastShownCount", (parseInt(toastShownCount) || 0) + 1);
  localStorage.setItem("toastTimestamp", Date.now());

  // Automatically remove the toast after the specified duration
  if (duration > 0) {
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300); // Wait for the fade-out transition
    }, duration);
  }
}

//toast message---------------------------------------------------------:
document.addEventListener("DOMContentLoaded", () => {
  showToast("Added color themes! Check out settings", 3000);
});
