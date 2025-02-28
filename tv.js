// Extract query parameters
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id"); // TV Show ID

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

// Set up event listeners for server radio buttons - FIXED
function setupServerSwitchers() {
  // Fix: Update selectors to match the actual DOM structure from Radix UI
  const radioItems = document.querySelectorAll("[data-radix-radio-cards-item]");

  radioItems.forEach((item) => {
    item.classList.add("radix-radio-item"); // Add the class our CSS targets

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

  // Set the default server as checked
  const defaultItem = document.querySelector("[data-value='server1']");
  if (defaultItem) {
    defaultItem.setAttribute("data-state", "checked");
  }
}

// Call setupServerSwitchers after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", setupServerSwitchers);

// Render seasons dropdown using Radix UI Select
function renderSeasons(seasons) {
  const seasonSelect = document.getElementById("season");
  seasonSelect.innerHTML = ""; // Clear existing options

  seasons.forEach((season) => {
    // Skip season 0 (often specials)
    if (season.season_number > 0) {
      const option = document.createElement("option");
      option.value = season.season_number;
      option.textContent = `Season ${season.season_number}`;
      seasonSelect.appendChild(option);
    }
  });

  // Add event listener to season select
  seasonSelect.addEventListener("change", () => {
    fetchEpisodes(seasonSelect.value);
  });

  // Fetch episodes for the first season
  if (seasons.length > 0 && seasons[0].season_number > 0) {
    fetchEpisodes(seasons[0].season_number);
  } else if (seasons.length > 1) {
    fetchEpisodes(seasons[1].season_number);
  }
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

  episodes.forEach((episode) => {
    const listItem = document.createElement("li");
    listItem.textContent = `Episode ${episode.episode_number}: ${episode.name}`;
    listItem.setAttribute("data-episode", episode.episode_number);

    listItem.addEventListener("click", () => {
      // Remove active class from all episodes
      document.querySelectorAll("#episodes li").forEach((item) => {
        item.classList.remove("active");
      });

      // Add active class to this episode
      listItem.classList.add("active");

      // Get the currently selected server
      const selectedServerItem = document.querySelector(
        "[data-radix-radio-cards-item][data-state='checked']"
      );
      const selectedServer = selectedServerItem
        ? selectedServerItem.getAttribute("data-value")
        : "server1";

      updatePlayer(selectedServer, episode.episode_number);
    });

    episodeList.appendChild(listItem);
  });

  // Load the first episode by default
  if (episodes.length > 0) {
    const firstEpisode = document.querySelector("#episodes li");
    if (firstEpisode) {
      firstEpisode.classList.add("active");
      updatePlayer("server1", episodes[0].episode_number);
    }
  }
}

// Update player with selected server and episode
function updatePlayer(server, episodeNumber = 1) {
  const playerIframe = document.getElementById("player-iframe");
  const seasonSelect = document.getElementById("season");
  const seasonNumber = seasonSelect.value;

  const servers = {
    server1: `https://vidsrc.to/embed/tv/${id}/${seasonNumber}/${episodeNumber}`, // VidSrc
    server2: `https://embed.su/embed/tv/${id}/${seasonNumber}/${episodeNumber}`, // Embed.su
    server3: `https://example.com/server3/tv/${id}/${seasonNumber}/${episodeNumber}`, // Placeholder for future servers
  };

  playerIframe.src = servers[server];
  console.log("Generated TV URL:", playerIframe.src);
}

// Fetch details when the page loads
fetchTVDetails();
