# Playboiii - Movie & TV Streaming Website

[Alien](https://playboy-alien.onrender.com/)  is a simple, clean streaming website that allows users to search for and watch movies and TV shows through various external providers.

_im still not finalised with the name i just couldnt think of anything else_

---

## 🎬 Features

- **Search functionality**: Search for movies and TV shows with instant results
- **Movie & TV show playback**: Watch content through multiple streaming sources
- **Server switching**: Choose between different streaming providers
- **Responsive design**: Works on desktop and mobile devices
- **Season & episode navigation**: Easy browsing of TV show seasons and episodes

---

## 🛠️ Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js
- **APIs**: The Movie Database (TMDB) API for content information
- **Styling**: Custom CSS with Radix UI components
- **Fonts**: Funnel Sans from Google Fonts

---

## 📋 Project Structure

```
├── assets/                # Images and SVGs (including logo.svg)
├── index.html            # Homepage with search functionality
├── about.html            # About page with creator information
├── legal.html            # Legal disclaimer page
├── why.html              # Creator's motivation for the project
├── movie.html            # Movie player page
├── tv.html               # TV show player with season/episode selection
├── styles.css            # Styling for all pages (not included in attachment)
├── script.js             # Main JavaScript for search functionality
├── movie.js              # JavaScript for movie player functionality
├── tv.js                 # JavaScript for TV show player functionality
├── server.js             # Node.js server for API routing
├── package.json          # Project dependencies and metadata
└── .env                  # Environment variables file for API keys (not tracked)
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16.0.0 or higher)
- API key from The Movie Database (TMDB)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/playboiii.git
   cd playboiii
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your TMDB API key:
   ```
   TMDB_API_KEY=your_api_key_here
   ```

4. Start the server:
   ```
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3001`

---

## 🔍 How It Works

1. The app uses TMDB API to search for movies and TV shows
2. When a user selects content, they're directed to either movie.html or tv.html
3. The player embeds content from external sources like Embed.su, Vidlink, and VidSrc
4. The Node.js server proxies API requests to protect the API key

---

## ⚖️ Legal Disclaimer

This project is created strictly for educational purposes. It demonstrates the use of APIs and web development techniques. The creator does not host any content; all streaming is done through third-party providers. Users are responsible for ensuring they comply with all applicable laws regarding content access.

---

## 👨‍💻 Creator

Made by Kenny (GitHub: [@imkenough](https://github.com/imkenough/))

---

## 🛣️ Future Improvements

- User authentication and favorites list
- Improved UI/UX with more interactive elements
- Better error handling and fallback options for unavailable content
- Additional streaming sources
- Offline viewing capabilities

---

## 📝 License

This project is not explicitly licensed. All rights reserved.

---

*Note: None of the ads on this site belong to the creator. They come from API providers.*
