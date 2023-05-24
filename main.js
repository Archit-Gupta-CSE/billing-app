const path = require('path');
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const isDev = process.env.NODE_ENV !== 'production';

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    title: 'Billing App',
    width: isDev ? 1000 : 700,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, './preload.js'),
    },
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile(path.join(__dirname, './public/index.html'));
}

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
