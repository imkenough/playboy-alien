// Extract query parameters
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id"); // TV Show ID

// Local storage key prefix for this TV show
const storageKeyPrefix = `tv_${id}_`;

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

// Fetch TV show details
async function fetchTVDetails() {
  const apiKey = await getApiKey();

  if (!apiKey) {
    console.error("Failed to get API key");
    return;
  }

  const url = `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("Fetched TV show details:", data);

    // Update page title with show name
    document.title = `${data.name} - TV Show Player`;

    renderSeasons(data.seasons);

    // Set up event listeners for server switches
    setupServerSwitchers();
  } catch (error) {
    console.error("Error fetching TV show details:", error);
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

      // For tv.html - get the active episode if applicable
      const activeEpisode = document.querySelector("#episodes li.active");
      if (activeEpisode) {
        const episodeNumber = activeEpisode.getAttribute("data-episode") || 1;
        updatePlayer(serverValue, episodeNumber);
      } else {
        updatePlayer(serverValue, 1);
      }
    });
  });
}

// Render seasons dropdown
function renderSeasons(seasons) {
  const seasonSelect = document.getElementById("season");
  seasonSelect.innerHTML = ""; // Clear existing options

  // Filter out season 0 (often specials)
  const validSeasons = seasons.filter((season) => season.season_number > 0);

  // Default to first valid season
  let defaultSeason =
    validSeasons.length > 0 ? validSeasons[0].season_number : 1;

  // Load saved season preference
  const savedSeason = parseInt(loadUserPreference("season", defaultSeason));

  validSeasons.forEach((season) => {
    const option = document.createElement("option");
    option.value = season.season_number;
    option.textContent = `Season ${season.season_number}`;
    seasonSelect.appendChild(option);
  });

  // Set the selected season based on saved preference
  seasonSelect.value = savedSeason;

  // Add event listener to season select
  seasonSelect.addEventListener("change", () => {
    const selectedSeason = seasonSelect.value;
    saveUserPreference("season", selectedSeason);
    fetchEpisodes(selectedSeason);
  });

  // Fetch episodes for the selected season
  fetchEpisodes(savedSeason);
}

// Fetch episodes for a season
async function fetchEpisodes(seasonNumber) {
  const apiKey = await getApiKey();

  if (!apiKey) {
    console.error("Failed to get API key");
    return;
  }

  const url = `https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}?api_key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("Fetched episodes:", data);
    renderEpisodes(data.episodes);
  } catch (error) {
    console.error("Error fetching episodes:", error);
  }
}

// Render episodes list
function renderEpisodes(episodes) {
  const episodeList = document.getElementById("episodes");
  episodeList.innerHTML = "";

  // Load saved episode preference for current season
  const savedEpisode = parseInt(loadUserPreference("episode", 1));

  episodes.forEach((episode) => {
    const listItem = document.createElement("li");
    listItem.textContent = `Episode ${episode.episode_number}: ${episode.name}`;
    listItem.setAttribute("data-episode", episode.episode_number);

    // Mark the saved episode as active
    if (episode.episode_number === savedEpisode) {
      listItem.classList.add("active");
    }

    listItem.addEventListener("click", () => {
      // Remove active class from all episodes
      document.querySelectorAll("#episodes li").forEach((item) => {
        item.classList.remove("active");
      });

      // Add active class to this episode
      listItem.classList.add("active");

      // Save selected episode
      saveUserPreference("episode", episode.episode_number);

      // Get the currently selected server
      const selectedServerItem = document.querySelector(
        "[data-radix-radio-cards-item][data-state='checked']"
      );
      const selectedServer = selectedServerItem
        ? selectedServerItem.getAttribute("data-value")
        : loadUserPreference("server", "server1");

      updatePlayer(selectedServer, episode.episode_number);
    });

    episodeList.appendChild(listItem);
  });

  // Find the episode that matches our saved preference
  const targetEpisode = episodes.find(
    (ep) => ep.episode_number === savedEpisode
  );

  // If we found a matching episode, use it; otherwise use the first one
  const episodeToPlay = targetEpisode
    ? targetEpisode.episode_number
    : episodes.length > 0
    ? episodes[0].episode_number
    : 1;

  // Make sure the correct episode is visually marked as active
  const episodeElement = document.querySelector(
    `#episodes li[data-episode="${episodeToPlay}"]`
  );
  if (episodeElement) {
    document
      .querySelectorAll("#episodes li")
      .forEach((item) => item.classList.remove("active"));
    episodeElement.classList.add("active");
  }

  // Get selected server and update player
  const selectedServerItem = document.querySelector(
    "[data-radix-radio-cards-item][data-state='checked']"
  );
  const selectedServer = selectedServerItem
    ? selectedServerItem.getAttribute("data-value")
    : loadUserPreference("server", "server1");

  updatePlayer(selectedServer, episodeToPlay);
}

// Update player with selected server and episode
function updatePlayer(server, episodeNumber = 1) {
  const playerIframe = document.getElementById("player-iframe");
  const seasonSelect = document.getElementById("season");
  const seasonNumber = seasonSelect.value;

  const servers = {
    server1: `https://embed.su/embed/tv/${id}/${seasonNumber}/${episodeNumber}`, // Embed.su
    server2: `https://vidlink.pro/tv/${id}/${seasonNumber}/${episodeNumber}`, // vidlink
    server3: `https://vidsrc.to/embed/tv/${id}/${seasonNumber}/${episodeNumber}`, //vidsrc
  };

  playerIframe.src = servers[server];
  console.log("Generated TV URL:", playerIframe.src);
}

// Fetch details when the page loads
fetchTVDetails();
