// Extract query parameters
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id"); // Movie ID

// Local storage key prefix for this movie
const storageKeyPrefix = `movie_${id}_`;

// Create a function to get the API key securely
async function getApiKey() {
  try {
    // Use relative URL instead of hardcoded localhost
    const response = await fetch("/api-key");
    const data = await response.json();
    return data.apiKey;
  } catch (error) {
    console.error("Error fetching API key:", error);
    return null;
  }
}

// Functions to save and load user preferences from localStorage
function saveUserPreference(key, value) {
  try {
    localStorage.setItem(`${storageKeyPrefix}${key}`, value);
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

function loadUserPreference(key, defaultValue) {
  try {
    const value = localStorage.getItem(`${storageKeyPrefix}${key}`);
    return value !== null ? value : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

// Fetch movie details
async function fetchMovieDetails() {
  const apiKey = await getApiKey();

  if (!apiKey) {
    console.error("Failed to get API key");
    return;
  }

  const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("Fetched movie details:", data);

    // Update page title with movie name
    document.title = `${data.title} - Movie Player`;

    // Load saved server preference and update player
    const savedServer = loadUserPreference("server", "server1");
    updatePlayer(savedServer);

    // Set up event listeners for server switches
    setupServerSwitchers();
  } catch (error) {
    console.error("Error fetching movie details:", error);
  }
}

// Set up event listeners for server radio buttons
function setupServerSwitchers() {
  const radioItems = document.querySelectorAll("[data-radix-radio-cards-item]");

  // Load saved server preference
  const savedServer = loadUserPreference("server", "server1");

  radioItems.forEach((item) => {
    item.classList.add("radix-radio-item");
    const serverValue = item.getAttribute("data-value");

    // Set the checked state based on saved preference
    if (serverValue === savedServer) {
      item.setAttribute("data-state", "checked");
    } else {
      item.setAttribute("data-state", "unchecked");
    }

    item.addEventListener("click", () => {
      const serverValue = item.getAttribute("data-value");

      // Update data-state attributes for styling
      radioItems.forEach((otherItem) => {
        if (otherItem === item) {
          otherItem.setAttribute("data-state", "checked");
        } else {
          otherItem.setAttribute("data-state", "unchecked");
        }
      });

      // Save user preference
      saveUserPreference("server", serverValue);

      // Update player with selected server
      updatePlayer(serverValue);
    });
  });
}

// Update player with selected server
function updatePlayer(server) {
  const playerIframe = document.getElementById("player-iframe");
  const servers = {
    server1: `https://embed.su/embed/movie/${id}`, // Embed.su
    server2: `https://vidlink.pro/movie/${id}`, // vidlink
    server3: `https://vidsrc.to/embed/movie/${id}`, //vidsrc
  };

  playerIframe.src = servers[server];
  console.log("Generated Movie URL:", playerIframe.src);
}

// Fetch details when the page loads
fetchMovieDetails();
