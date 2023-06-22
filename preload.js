// preload.js

const { contextBridge, ipcRenderer } = require('electron');

// Expose ipcRenderer to the renderer process
contextBridge.exposeInMainWorld('ipcRenderer', {
  sendFormData: data => ipcRenderer.send('formSubmit', data),
  sendPhoneInfo: data => ipcRenderer.send('findUser', data),
  receiveUserInfo: handler =>
    ipcRenderer.on('userInfoResult', (event, ...args) => handler(...args)),
  send: (channel, data) => {
    // Whitelist channels
    let validChannels = ['resetRegistrationNumber'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    let validChannels = ['registrationNumberUpdated'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
});
