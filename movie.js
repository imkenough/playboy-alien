// Extract query parameters
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id"); // Movie ID

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

    updatePlayer("server1"); // Default to Server 1 (VidSrc)

    // Set up event listeners for server switches
    setupServerSwitchers();
  } catch (error) {
    console.error("Error fetching movie details:", error);
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

      // Update player with selected server
      updatePlayer(serverValue);
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

// Update player with selected server
function updatePlayer(server) {
  const playerIframe = document.getElementById("player-iframe");
  const servers = {
    server1: `https://vidsrc.to/embed/movie/${id}`, //vidsrc
    server2: `https://embed.su/embed/movie/${id}`, // Embed.su
    server3: `https://vidlink.pro/movie/${id}`, // vidlink
  };

  playerIframe.src = servers[server];
  console.log("Generated Movie URL:", playerIframe.src);
}

// Fetch details when the page loads
fetchMovieDetails();
