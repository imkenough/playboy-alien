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
  resultsContainer.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement("div");
    skeleton.className = "rt-skeleton";
    resultsContainer.appendChild(skeleton);
  }
}

// Perform search and render results
async function performSearch(query) {
  const resultsContainer = document.getElementById("results-container");
  if (query) {
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
  } else {
    resultsContainer.innerHTML = "";
  }
}

// Debounced search function
const debouncedSearch = debounce(performSearch, 300);

// Event listener for the search input
document.getElementById("search-input").addEventListener("input", (event) => {
  const query = event.target.value.trim();
  moveSearchBar(); // Call moveSearchBar to adjust the search bar position
  debouncedSearch(query); // Trigger the debounced search
});

// Render the results
function renderResults(results) {
  const resultsContainer = document.getElementById("results-container");
  resultsContainer.innerHTML = "";

  results.forEach((result) => {
    const card = document.createElement("div");
    card.className = "rt-card";

    // Add click event to the card
    card.addEventListener("click", () => {
      const mediaType = result.media_type; // 'movie' or 'tv'
      const id = result.id; // Unique ID for the movie/show

      if (mediaType === "movie") {
        window.location.href = `movie.html?id=${id}`;
      } else if (mediaType === "tv") {
        window.location.href = `tv.html?id=${id}`;
      }
    });

    const img = document.createElement("img");
    img.src = result.poster_path
      ? `https://image.tmdb.org/t/p/w500${result.poster_path}`
      : "placeholder.png";
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

// Move search bar to top when typing
function moveSearchBar() {
  const searchWrapper = document.getElementById("search-wrapper");
  const searchInput = document.getElementById("search-input");

  // Add 'active' class when there's input
  if (searchInput.value.trim().length > 0) {
    searchWrapper.classList.add("active");
  } else {
    searchWrapper.classList.remove("active");
  }
}
