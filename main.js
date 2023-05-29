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
  db.get(`SELECT * FROM users WHERE phoneNumber = ?`, [data], (err, user) => {
    if (err) {
      console.error(err);
    } else {
      let newPrice = "";
      let last_procedure = "";
      let check_flag = false;
      if (user) {
        db.all(
          `SELECT * FROM procedures WHERE customer_id = ?`,
          [user["phoneNumber"]],
          (err, procInfo) => {
            if (err) {
              console.error(err);
            }
            if (procInfo.length > 0) {
              procInfo.forEach((ele) => {
                last_procedure = ele["procedure_name"];
                if (
                  ele["procedure_name"] === "consultationCharges" &&
                  !check_flag
                ) {
                  check_flag = true;
                  const originalDate = new Date(ele["procedure_date"]);
                  const now = new Date();

                  diffDate = Math.abs(now - originalDate);
                  totalDays = Math.ceil(diffDate / (1000 * 60 * 60 * 24));

                  if (totalDays > 4) {
                    newPrice = "400";
                  }
                }
              });
              user["newPrice"] = newPrice;
              user["procedure"] = last_procedure;
              event.sender.send("userInfoResult", user);
            }
          }
        );
      }
      event.sender.send("userInfoResult", user);
    }
  });
});

ipcMain.on("formSubmit", (event, data) => {
  if (Object.keys(data).length < 5) {
    console.error("Incomplete data");
  } else {
    console.log(data);
    db.run(
      `INSERT OR REPLACE INTO users (firstName, lastName, address, district, state, phoneNumber, time, pincode, sex, age, billNumber, initials)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data["firstName"],
        data["lastName"],
        data["address"],
        data["district"],
        data["state"],
        data["phoneNumber"],
        data["time"],
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
      `INSERT INTO procedures (procedure_name, procedure_date, procedure_cost, customer_id)
      VALUES (?, ?, ?, ?)`,
      [data["procedure"], data["date"], data["newPrice"], data["phoneNumber"]],
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
      pincode VARCHAR(255),
      sex VARCHAR(20),
      age VARCHAR(20),
      billNumber VARCHAR(100),
      initials VARCHAR(20)
    )
    `,
    (err) => {
      if (err) {
        console.error(err);
      }
    }
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS procedures (
      procedure_id INTEGER PRIMARY KEY AUTOINCREMENT,
      procedure_name VARCHAR(255),
      procedure_date VARCHAR(255),
      procedure_cost VARCHAR(255) NOT NULL,
      customer_id VARCHAR(255),
      FOREIGN KEY (customer_id) REFERENCES users(phoneNumber)
    )
    `,
    (err) => {
      if (err) {
        console.error(err);
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
