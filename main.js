const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');
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

  // Listen for the 'formSubmit' event from the renderer process
  ipcMain.on('formSubmit', (event, data) => {
    // Handle the form data
    console.log(data); // Example: Log the form data to the console
  });
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
