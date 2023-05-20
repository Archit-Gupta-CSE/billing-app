const path = require("path");
const { app, BrowserWindow } = require("electron");

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    title: "Billing App",
    width: 600,
    height: 700,
  });

  mainWindow.loadFile(path.join(__dirname, "./public/index.html"));
}

app.whenReady().then(() => {
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
