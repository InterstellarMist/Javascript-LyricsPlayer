const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  login: () => ipcRenderer.send("login"),
  auth: () => ipcRenderer.invoke("auth"),
});
