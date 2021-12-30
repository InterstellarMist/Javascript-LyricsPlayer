const { app, BrowserWindow, ipcMain, nativeImage } = require("electron");
const path = require("path");
const URL = require("url");

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
      path.join(__dirname, "./build/favicon.ico")
    ),
    webPreferences: { nodeIntegration: true },
  });

  mainWindow.once("ready-to-show", () => mainWindow.show());

  // and load the index.html of the app.
  mainWindow.loadFile("client/index.html");

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
    height: 550,
    title: "Login with Spotify",
    icon: nativeImage.createFromPath(
      path.join(__dirname, "./build/favicon.ico")
    ),
    webPreferences: { nodeIntegration: true },
  });
  // win.webContents.session.clearStorageData(() => console.log('cache cleared.'));
  win.loadURL(url);

  win.webContents.on("did-finish-load", () => {
    win.webContents.findInPage("Connection Success", [
      (matchCase = true),
      (wordStart = true),
    ]);
    win.webContents.on("found-in-page", (e, result) => {
      if (win) {
        if (result.matches > 0) {
          win.webContents.stopFindInPage("clearSelection");
          let req = URL.parse(win.webContents.getURL(), true);
          let user_id = req.query.user_id;
          console.log(user_id);
          let url = URL.format({
            protocol: "file",
            slashes: true,
            pathname: path.join(__dirname, "client", "player.html"),
          });
          mainWindow.loadURL(url);
          ipcMain.on("id", (e, msg) => {
            e.reply("id", user_id);
          });
          win.close();
        } else {
          win.show();
          console.log("Not yet logged in");
        }
      }
    });
  });

  // win.once('ready-to-show', () => win.show());
  win.on("closed", () => (win = null));
}

//events
ipcMain.on("login", (e, item) => {
  createLoginWindow(BASE_URL + "/spotify/login");
});

//Quit
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
