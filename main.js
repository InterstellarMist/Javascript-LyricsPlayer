const { app, BrowserWindow, ipcMain, nativeImage } = require("electron");
const path = require("path");

// const BASE_URL= "https://lyricsplayer.herokuapp.com"
const BASE_URL = "http://localhost:8888";

let mainWindow;
let win;

//main window
function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    show: false,
    width: 400,
    height: 800,
    resizable: false,
    autoHideMenuBar: true,
    useContentSize: true,
    alwaysOnTop: true,
    icon: nativeImage.createFromPath(
      path.join(__dirname, "./build/icons/512x512.png")
    ),
    webPreferences: {
      preload: path.join(__dirname, "./preload.js"),
    },
  });

  mainWindow.once("ready-to-show", () => mainWindow.show());

  // and load the index.html of the app.
  mainWindow.loadFile("client/index.html");

  // mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => app.quit());
}
app
  .whenReady()
  .then(createWindow)
  .catch((err) => console.log(err));

//create Login window and send tokens
function createLoginWindow(url) {
  win = new BrowserWindow({
    parent: mainWindow,
    show: false,
    modal: true,
    width: 550,
    height: 920,
    title: "Login with Spotify",
    icon: nativeImage.createFromPath(
      path.join(__dirname, "./build/icons/512x512.png")
    ),
  });
  win.loadURL(url);
  // win.webContents.session.clearStorageData(() => console.log("cache cleared."));

  win.webContents.on("did-finish-load", () => {
    let carrier_url = win.webContents.getURL();
    if (carrier_url.split("?")[0] == "http://localhost:8888/auth") {
      // Obtain the access token from LyricsPlayer API
      let local_token = new URLSearchParams(carrier_url.split("?")[1]).get(
        "local_token"
      );
      console.log(local_token);
      win.close();

      ipcMain.handle("auth", async () => {
        return local_token;
      });

      // Redirect to player page
      mainWindow.loadFile("client/player.html");
    }
  });

  win.once("ready-to-show", () => win.show());

  win.on("closed", () => (win = null));
}

//events
ipcMain.on("login", (e, item) => {
  createLoginWindow(BASE_URL + "/spotify/login");
  console.log("logging in...");
});

//Quit
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
