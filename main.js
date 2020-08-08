const { app, BrowserWindow, ipcMain } = require('electron')
const fetch = require('node-fetch');
const path = require('path');
const querystring = require('querystring');

const BASE_URL= "https://lyricsplayer.herokuapp.com"
// const BASE_URL= "http://localhost:8888"

let mainWindow;
let win;

//main window
function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    show:false,
    width: 400,
    height: 800,
    resizable: false,
    autoHideMenuBar: true,
    useContentSize: true,
    alwaysOnTop: true,
    icon: path.join(__dirname,"./build/favicon.ico"),
    webPreferences: { nodeIntegration: true }
  })

  mainWindow.once('ready-to-show', () => mainWindow.show());

  // and load the index.html of the app.
  mainWindow.loadFile('client/index.html')

  mainWindow.on('closed', () => app.quit());
}
app.whenReady().then(createWindow);


//create Login window and send tokens
function createLoginWindow(url) {
  let win = new BrowserWindow({
    parent: mainWindow,
    show: false,
    modal: true,
    width:550,
    height:550,
    title: 'Login with Spotify',
    icon: path.join(__dirname,"./build/favicon.ico"),
    webPreferences: { nodeIntegration:true }
  });
  win.loadURL(url);

  win.webContents.on('did-finish-load', () => {
    console.log('loaded')
    win.webContents.findInPage('AUTHENTICATION ERROR',[matchCase = true, wordStart = true])
  });

  let reload_count = 0;
  win.webContents.on('found-in-page', (e, result) => {
    if (result.matches > 0) {win.webContents.stopFindInPage('clearSelection')
      win.show();
      if (reload_count < 3) {
        setTimeout(() => {win.loadURL(url);reload_count++},500)
      } else {win.close();}
    } else {
      let callback = win.webContents.getURL().split('?').splice(-1)[0];
      let user_id = querystring.decode(callback).user_id;

      let url = require('url').format({
      protocol: 'file',
      slashes: true,
      pathname: require('path').join(__dirname, 'client','player.html')
      });
      mainWindow.loadURL(url);
      ipcMain.on('id', (e,msg)=>{
        e.reply('id',user_id);0
      })
      // win.close();
    }
  });
  win.once('ready-to-show', () => win.show());
  win.on('closed', () => win = null);
}

//events
ipcMain.on('login', (e,item) => {
  createLoginWindow(BASE_URL+'/spotify/login');
});


//Quit
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
