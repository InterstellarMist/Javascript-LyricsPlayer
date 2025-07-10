
# LyricsPlayer

LyricsPlayer is a desktop application built with Electron that displays the lyrics of the currently playing song on Spotify. It features real-time lyric fetching and a modern, user-friendly interface.

## Features

- **Spotify Integration:** Connects to Spotify via a separate server process using the Spotify Web API to detect the currently playing song.
- **Automatic Lyrics Fetching:** Scrapes the web to find and display lyrics for the current track automatically.
- **Modern UI:** Clean and responsive interface for a seamless experience.
- **Cross-Platform:** Supports Windows and Linux (AppImage).

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [Yarn](https://yarnpkg.com/) (v4.9.1 as specified)
- [Spotify Developer Account](https://developer.spotify.com/) (for API credentials)

### Installation

1. **Clone the repository:**
   ```sh
   git clone <repo-url>
   cd LyricsPlayer-App
   ```
2. **Install dependencies:**
   ```sh
   yarn install
   ```
3. **Configure Spotify API credentials:**
   - Set up your Spotify API credentials in the server process (see server documentation or `.env.example`).

### Running the App

To start the app in development mode:
```sh
yarn start
```

To build for production:
```sh
yarn dist
```

## Project Structure

- `main.js` – Electron main process
- `preload.js` – Preload scripts for Electron
- `client/` – Frontend assets (HTML, CSS, JS)
- `build/` – Icons and build assets
- `server/` – (Not included here) Separate process for Spotify API and lyrics scraping

## How It Works

1. The Electron app launches and communicates with a background server process.
2. The server process authenticates with Spotify and fetches the currently playing song.
3. The server scrapes the web for lyrics of the current song.
4. Lyrics are sent to the Electron app and displayed in real time.

## License

MIT License. See [LICENSE](LICENSE) for details.

## Author

Nicholas Chai
