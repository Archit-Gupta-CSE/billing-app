const path = require("path");
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const sqlite = require("sqlite3").verbose();

const userAppData = app.getPath("appData");
const dbPath = path.join(userAppData, "database.db");
const isDev = process.env.NODE_ENV !== "production";

const db = new sqlite.Database(dbPath, (err) => {
  if (err) {
    console.error(err);
  }
  console.log(dbPath);
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
  db.get(`SELECT * FROM users WHERE phoneNumber = ?`, [data], (err, row) => {
    if (err) {
      console.error(err);
    } else {
      if (row) {
        db.get(
          `SELECT procedure_name FROM procedures WHERE customer_id = ?`,
          [row["phoneNumber"]],
          (err, procInfo) => {
            if (err) {
              console.error(err);
            }
            console.log(procInfo);
          }
        );
      }
      console.log(row);
      event.sender.send("userInfoResult", row);
    }
  });
});

ipcMain.on("formSubmit", (event, data) => {
  if (Object.keys(data).length < 5) {
    console.error("Incomplete data");
  } else {
    console.log(data);
    db.run(
      `INSERT OR REPLACE INTO users (firstName, lastName, address, district, state, phoneNumber, time, date, pincode, sex, age, billNumber, initials)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data["firstName"],
        data["lastName"],
        data["address"],
        data["district"],
        data["state"],
        data["phoneNumber"],
        data["time"],
        data["date"],
        data["pincode"],
        data["sex"],
        data["age"],
        data["billNumber"],
        data["initials"],
      ],

      (err) => {
        if (err) {
          console.error(err);
        }
      }
    );

    db.run(
      `INSERT INTO procedures (procedure_name, procedure_cost, customer_id)
      VALUES (?, ?, ?)`,
      [data["procedureName"], data["procedureCost"], data["phoneNumber"]],
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
      firstName VARCHAR(255),
      lastName VARCHAR(255),
      address VARCHAR(255),
      state VARCHAR(255),
      district VARCHAR(255),
      phoneNumber VARCHAR(255) PRIMARY KEY,
      time VARCHAR(255),
      date VARCHAR(255),
      pincode VARCHAR(255),
      sex VARCHAR(20),
      age VARCHAR(20),
      billNumber VARCHAR(100),
      initials VARCHAR(20),
    )

    CREATE TABLE IF NOT EXISTS procedures (
      procedure_id INTEGER PRIMARY KEY AUTOINCREMENT,
      procedure_name VARCHAR(255),
      procedure_cost VARCHAR(255) NOT NULL,
      customer_id VARCHAR(255) FOREIGN KEY REFERENCES users(phoneNumber)
    )
    `,
    (err) => {
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
