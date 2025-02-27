const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
require("dotenv").config();

const PORT = process.env.PORT || 3001;

async function fetchFromTMDB(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.statusText}`);
  }
  return await response.json();
}

const server = http
  .createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const { pathname, searchParams } = parsedUrl;

    res.setHeader("Access-Control-Allow-Origin", "*");

    try {
      // API endpoints
      if (pathname === "/api-key" && req.method === "GET") {
        res.setHeader("Content-Type", "application/json");
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
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ results: filteredResults }));
      }
      // Static file serving
      else {
        // Map the URL path to the appropriate file
        let filePath;

        if (pathname === "/" || pathname === "") {
          filePath = "index.html";
        } else {
          // Remove leading slash and use as file path
          filePath = pathname.substring(1);
        }

        // Get file extension
        const extname = path.extname(filePath);

        // Set content type based on file extension
        let contentType = "text/html";
        switch (extname) {
          case ".js":
            contentType = "text/javascript";
            break;
          case ".css":
            contentType = "text/css";
            break;
          case ".json":
            contentType = "application/json";
            break;
          case ".png":
            contentType = "image/png";
            break;
          case ".jpg":
            contentType = "image/jpg";
            break;
          case ".jpeg":
            contentType = "image/jpeg";
            break;
          case ".svg":
            contentType = "image/svg+xml";
            break;
          case ".ico":
            contentType = "image/x-icon";
            break;
        }

        // Read the file
        // Read the file
        fs.readFile(filePath, (error, content) => {
          if (error) {
            if (error.code === "ENOENT") {
              // Try finding in the assets folder
              const assetsPath = path.join(
                __dirname,
                "assets",
                path.basename(filePath)
              );
              fs.readFile(assetsPath, (assetsError, assetsContent) => {
                if (assetsError) {
                  res.writeHead(404);
                  res.end(`File ${filePath} not found in assets.`);
                } else {
                  res.writeHead(200, { "Content-Type": contentType });
                  res.end(assetsContent, "utf-8");
                }
              });
            } else {
              res.writeHead(500);
              res.end(`Server Error: ${error.code}`);
            }
          } else {
            res.writeHead(200, { "Content-Type": contentType });
            res.end(content, "utf-8");
          }
        });
      }
    } catch (error) {
      console.error("Server error:", error);
      res.statusCode = 500;
      res.end("Internal server error.");
    }
  })
  .setTimeout(120000);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
