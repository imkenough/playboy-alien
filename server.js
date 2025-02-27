const http = require("http");
const fs = require("fs");
const { URL } = require("url");
require("dotenv").config();

const PORT = process.env.PORT || 3001;

async function fetchFromTMDB(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching from TMDB:", error);
    throw error;
  }
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const { pathname, searchParams } = parsedUrl;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  try {
    if (pathname === "/") {
      // Serve index.html when visiting the root
      res.setHeader("Content-Type", "text/html");
      fs.readFile("index.html", (err, data) => {
        if (err) {
          res.statusCode = 500;
          res.end("Error loading index.html");
        } else {
          res.end(data);
        }
      });
    } else if (pathname === "/api-key" && req.method === "GET") {
      res.end(JSON.stringify({ apiKey: process.env.TMDB_API_KEY }));
    } else if (pathname === "/search" && req.method === "GET") {
      const query = searchParams.get("q");
      if (!query) {
        res.statusCode = 400;
        return res.end(
          JSON.stringify({ error: 'Query parameter "q" is required.' })
        );
      }
      const tmdbUrl = `https://api.themoviedb.org/3/search/multi?api_key=${
        process.env.TMDB_API_KEY
      }&query=${encodeURIComponent(query)}`;
      const data = await fetchFromTMDB(tmdbUrl);
      const filteredResults = data.results.filter(
        (item) => item.poster_path || item.backdrop_path
      );
      res.end(JSON.stringify({ results: filteredResults }));
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: "Endpoint not found." }));
    }
  } catch (error) {
    console.error("Server error:", error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: "Internal server error." }));
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
