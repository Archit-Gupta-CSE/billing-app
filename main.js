const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const isDev = process.env.NODE_ENV !== 'production';

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    title: 'Billing App',
    width: isDev ? 1000 : 700,
    height: 800,
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile(path.join(__dirname, './public/index.html'));

  // Listen for the 'store-data' event from the renderer process
  ipcMain.on('store-data', (event, data) => {
    // Save the form data to a file
    const jsonData = JSON.stringify(data);
    fs.writeFile('form-data.json', jsonData, err => {
      if (err) throw err;
      console.log('Form data saved successfully!');
    });
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
