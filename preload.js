// preload.js

const { contextBridge, ipcRenderer } = require("electron");

// Expose ipcRenderer to the renderer process
contextBridge.exposeInMainWorld("ipcRenderer", {
  sendFormData: (data) => ipcRenderer.send("formSubmit", data),
  sendPhoneInfo: (data) => ipcRenderer.send("findUser", data),
  receiveUserInfo: (handler) =>
    ipcRenderer.on("userInfoResult", (event, ...args) => handler(...args)),
});
