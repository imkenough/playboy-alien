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

// Constants for local storage
const SETTINGS_KEY = "playboy_settings";
const RECENTLY_WATCHED_KEY = "show_recently_watched";
const RECENTLY_WATCHED_ITEMS = "recently_watched_items";

// Function to check if recently watched should be shown
function shouldShowRecentlyWatched() {
  try {
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
    // Default to true if setting doesn't exist
    return settings[RECENTLY_WATCHED_KEY] !== undefined
      ? settings[RECENTLY_WATCHED_KEY]
      : true;
  } catch (error) {
    console.error("Error reading settings:", error);
    return true; // Default to true on error
  }
}

// Function to save an item to recently watched
function saveToRecentlyWatched(mediaItem) {
  try {
    // Don't save if feature is disabled
    if (!shouldShowRecentlyWatched()) return;

    // Ensure we have required properties
    if (!mediaItem || !mediaItem.id) {
      console.error("Invalid media item:", mediaItem);
      return;
    }

    // Get existing items
    let recentItems =
      JSON.parse(localStorage.getItem(RECENTLY_WATCHED_ITEMS)) || [];

    // Check if item already exists
    const existingIndex = recentItems.findIndex(
      (item) =>
        item.id === mediaItem.id && item.media_type === mediaItem.media_type
    );

    // If exists, remove it (to add it to the front)
    if (existingIndex !== -1) {
      recentItems.splice(existingIndex, 1);
    }

    // Add item to the beginning
    recentItems.unshift({
      id: mediaItem.id,
      title: mediaItem.title || mediaItem.name,
      poster_path: mediaItem.poster_path,
      media_type: mediaItem.media_type,
      release_date: mediaItem.release_date, // Save release date
      first_air_date: mediaItem.first_air_date, // Save first air date for TV shows
      timestamp: new Date().toISOString(),
    });

    // Limit to 10 items
    recentItems = recentItems.slice(0, 10);

    // Save back to localStorage
    localStorage.setItem(RECENTLY_WATCHED_ITEMS, JSON.stringify(recentItems));

    // If on homepage, refresh the recently watched section
    if (isHomePage()) {
      displayRecentlyWatched();
    }
  } catch (error) {
    console.error("Error saving to recently watched:", error);
  }
}

// Function to check if current page is homepage
function isHomePage() {
  const path = window.location.pathname;
  return path === "/" || path.endsWith("index.html") || path === "/index.html";
}

// Track media view for specific pages
function trackMediaView() {
  // Only run on movie/tv pages
  if (
    !window.location.pathname.includes("movie.html") &&
    !window.location.pathname.includes("tv.html")
  ) {
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  if (!id) return;

  const mediaType = window.location.pathname.includes("movie.html")
    ? "movie"
    : "tv";

  // For movie.html or tv.html pages, save the viewed content when page loads
  window.addEventListener("load", function () {
    // Find media title and poster elements
    const titleElement =
      document.getElementById("media-title") ||
      document.querySelector("h1") ||
      document.querySelector(".title");

    const posterElement =
      document.getElementById("media-poster") ||
      document.querySelector(".poster img") ||
      document.querySelector("img[data-poster-path]");

    if (titleElement) {
      const title = titleElement.textContent.trim();
      const posterPath =
        posterElement?.getAttribute("data-poster-path") ||
        posterElement
          ?.getAttribute("src")
          ?.replace("https://image.tmdb.org/t/p/w500", "") ||
        null;

      // Save to recently watched
      saveToRecentlyWatched({
        id: id,
        title: title,
        name: title, // Backup for TV shows
        poster_path: posterPath,
        media_type: mediaType,
      });
    }
  });
}

// Call functions when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Check if we're on the homepage and display recently watched
  if (isHomePage()) {
    displayRecentlyWatched();
  }

  // Track media views on movie/tv pages
  trackMediaView();

  // Listen for settings changes to update display in real-time
  window.addEventListener("storage", (event) => {
    if (event.key === SETTINGS_KEY && isHomePage()) {
      displayRecentlyWatched();
    }
  });
});

// Function to display recently watched items on the homepage
function displayRecentlyWatched() {
  try {
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
    const showRecentlyWatched = settings["recently_watched"] !== false;

    // Remove the section if the feature is disabled
    let recentlyWatchedSection = document.querySelector(
      ".recently-watched-section"
    );
    if (!showRecentlyWatched) {
      if (recentlyWatchedSection) {
        recentlyWatchedSection.remove();
      }
      document.body.classList.remove("has-recently-watched"); // Remove class
      return;
    }

    // If already exists and should be shown, return
    if (recentlyWatchedSection) {
      recentlyWatchedSection.style.display = "block";
      return;
    }

    // Create the section if it doesn’t exist
    recentlyWatchedSection = document.createElement("div");
    recentlyWatchedSection.className = "recently-watched-section";
    recentlyWatchedSection.innerHTML = `
      <h2 class="recently-watched-title">Recently Watched</h2>
      <div class="recently-watched-grid"></div>
    `;

    document.body.insertBefore(
      recentlyWatchedSection,
      document.getElementById("results-container")
    );

    const grid = recentlyWatchedSection.querySelector(".recently-watched-grid");
    const recentItems =
      JSON.parse(localStorage.getItem(RECENTLY_WATCHED_ITEMS)) || [];

    // Populate the grid
    recentItems.forEach((item) => {
      const card = createRecentlyWatchedCard(item);
      grid.appendChild(card);
    });

    document.body.classList.add("has-recently-watched");
  } catch (error) {
    console.error("Error displaying recently watched:", error);
  }
}

// New helper function to create recently watched cards
function createRecentlyWatchedCard(item) {
  const card = document.createElement("div");
  card.className = "recently-watched-card";

  // Use the correct property `poster_path` and construct the full URL
  const posterUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : "assets/placeholder.png"; // Fallback image if poster_path is not available

  // Extract the year from the release date or first air date
  const releaseDate = item.release_date || item.first_air_date || "";
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "N/A";

  // Determine the media type (movie or TV show)
  const mediaType = item.media_type === "tv" ? "Show" : "Movie";

  card.innerHTML = `
    <img class="recently-watched-card-img" src="${posterUrl}" alt="${item.title}">
    <div class="recently-watched-card-info">
      <h3 class="recently-watched-card-title">${item.title}</h3>
      <p class="recently-watched-card-meta">${mediaType} • ${year}</p>
    </div>
  `;

  // Add click event to navigate to the item page
  card.addEventListener("click", () => {
    window.location.href = item.url || `${item.media_type}.html?id=${item.id}`;
  });

  return card;
}

// Helper function to create media card (simplified version)
function createMediaCard(item) {
  const card = document.createElement("div");
  card.className = "rt-card"; // Same class as search results
  card.addEventListener("click", () => {
    // Navigate to media page
    window.location.href = `${item.media_type}.html?id=${item.id}`;
  });

  // Build card HTML
  card.innerHTML = `
    <img class="rt-card-img" src="${
      item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : "assets/placeholder.png"
    }" alt="${item.title}" onerror="this.src='assets/placeholder.png'">
    <div class="rt-card-info">
      <h3 class="rt-card-title">${item.title}</h3>
      <p class="rt-card-meta">${
        item.media_type === "movie" ? "Movie" : "TV Show"
      }</p>
    </div>
  `;

  return card;
}

document.addEventListener("DOMContentLoaded", () => {
  try {
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
    const darkModeEnabled =
      settings["dark_mode"] !== undefined ? settings["dark_mode"] : true;

    if (!darkModeEnabled) {
      document.body.classList.add("light-mode");
    }
  } catch (error) {
    console.error("Error applying dark mode setting:", error);
  }
});
