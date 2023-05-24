const path = require("path");
const { app, BrowserWindow, ipcMain } = require("electron");
const sqlite = require("sqlite3").verbose();

const userAppData = app.getPath("appData");
const dbPath = path.join(userAppData, "database.db");
const isDev = process.env.NODE_ENV !== "production";

const db = new sqlite.Database(dbPath, (err) => {
  if (err) {
    console.error(err);
  }
});

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    title: "Billing App",
    width: isDev ? 1000 : 700,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "./preload.js"),
    },
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile(path.join(__dirname, "./public/index.html"));
}

ipcMain.on("findUser", (event, data) => {
  db.get(`SELECT * FROM users WHERE phoneNumber = ?`, [data], (err, rows) => {
    if (err) {
      console.error(err);
    } else {
      event.sender.send("userInfoResult", rows);
    }
  });
});

ipcMain.on("formSubmit", (event, data) => {
  if (Object.keys(data).length < 13) {
    console.error("Incomplete data");
  } else {
    console.log(data);
    db.run(
      `INSERT INTO users (firstName, lastName, address, district, state, phoneNumber, time, date, pincode, sex, age, billNumber)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data["fname"],
        data["lname"],
        data["address"],
        data["district"],
        data["state"],
        data["phnum"],
        data["time"],
        data["date"],
        data["pincode"],
        data["sex"],
        data["age"],
        data["billNumber"],
      ],
      (err) => {
        if (err) {
          console.error(err);
        }
      }
    );
  }
});

app.whenReady().then(() => {
  createMainWindow();

  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName VARCHAR(255),
      lastName VARCHAR(255),
      address VARCHAR(255),
      state VARCHAR(255),
      district VARCHAR(255),
      phoneNumber VARCHAR(255) UNIQUE,
      time VARCHAR(255),
      date VARCHAR(255),
      pincode VARCHAR(255),
      sex VARCHAR(20),
      age VARCHAR(20),
      billNumber VARCHAR(100)
    )
    `,
    (res, err) => {
      if (err) {
        console.error(err);
      } else {
        console.log(res);
      }
    }
  );

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    db.close((err) => {
      if (err) {
        console.error(err);
      }
    });
    app.quit();
  }
});
