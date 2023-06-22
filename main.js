const path = require('path');
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const sqlite = require('sqlite3').verbose();

const userAppData = app.getPath('appData');
const dbPath = path.join(userAppData, 'database.db');
const isDev = process.env.NODE_ENV !== 'production';
var now = new Date();
const db = new sqlite.Database(dbPath, err => {
  if (err) {
    console.error(err);
  }
  console.log(dbPath);
});

let mainWindow;

// Create a table to store the registration number
db.run(
  'CREATE TABLE IF NOT EXISTS registration (id INTEGER PRIMARY KEY, number TEXT)',
  err => {
    if (err) {
      console.error(err.message);
    }
  }
);

// Function to retrieve the last registration number from the database
const getLastRegistrationNumber = () => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT number FROM registration ORDER BY id DESC LIMIT 1',
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? row.number : null);
        }
      }
    );
  });
};

// Function to increment the registration number and store it in the database
const incrementRegistrationNumber = () => {
  return new Promise((resolve, reject) => {
    getLastRegistrationNumber()
      .then(lastNumber => {
        let newNumber;
        if (lastNumber) {
          // Increment the last number
          let lastDigits = parseInt(lastNumber.slice(-4));
          newNumber =
            now.getFullYear().toString().slice(-2) +
            (now.getMonth() + 1).toString().padStart(2, '0') +
            (lastDigits + 1).toString().padStart(4, '0');
        } else {
          // Generate a new number if no previous number exists
          newNumber =
            now.getFullYear().toString().slice(-2) +
            (now.getMonth() + 1).toString().padStart(2, '0') +
            '0001';
        }
        // Store the new number in the database
        db.run(
          'INSERT INTO registration (number) VALUES (?)',
          [newNumber],
          err => {
            if (err) {
              reject(err);
            } else {
              resolve(newNumber);
            }
          }
        );
      })
      .catch(err => {
        reject(err);
      });
  });
};

function createMainWindow() {
  mainWindow = new BrowserWindow({
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

ipcMain.on('findUser', (event, data) => {
  db.get(
    `SELECT * FROM users WHERE phoneNumber = ? OR billNumber = ?`,
    [data, data],
    (err, user) => {
      if (err) {
        console.error(err);
      } else {
        let newPrice = '';
        let last_procedure = '';
        let check_flag = false;
        if (user) {
          db.all(
            `SELECT * FROM procedures WHERE customer_id = ?`,
            [user['phoneNumber']],
            (err, procInfo) => {
              if (err) {
                console.error(err);
              }
              if (procInfo.length > 0) {
                procInfo.forEach(ele => {
                  last_procedure = ele['procedure_name'];
                  if (
                    ele['procedure_name'] === 'consultationCharges' &&
                    !check_flag
                  ) {
                    check_flag = true;
                    const originalDate = new Date(ele['procedure_date']);
                    const now = new Date();

                    diffDate = Math.abs(now - originalDate);
                    totalDays = Math.ceil(diffDate / (1000 * 60 * 60 * 24));

                    if (totalDays > 4) {
                      newPrice = '400';
                    }
                  }
                });
                user['newPrice'] = newPrice;
                user['procedure'] = last_procedure;
                event.sender.send('userInfoResult', user);
              }
            }
          );
        }
        event.sender.send('userInfoResult', user);
      }
    }
  );
});

ipcMain.on('formSubmit', (event, data) => {
  if (Object.keys(data).length < 5) {
    console.error('Incomplete data');
  } else {
    console.log(data);
    db.run(
      `INSERT OR REPLACE INTO users (firstName, lastName, address, district, state, phoneNumber, time, pincode, sex, age, billNumber, initials)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data['firstName'],
        data['lastName'],
        data['address'],
        data['district'],
        data['state'],
        data['phoneNumber'],
        data['time'],
        data['pincode'],
        data['sex'],
        data['age'],
        data['billNumber'],
        data['initials'],
      ],

      err => {
        if (err) {
          console.error(err);
        }
      }
    );

    db.run(
      `INSERT INTO procedures (procedure_name, procedure_date, procedure_cost, customer_id)
      VALUES (?, ?, ?, ?)`,
      [data['procedure'], data['date'], data['newPrice'], data['phoneNumber']],
      err => {
        if (err) {
          console.error(err);
        }
      }
    );
  }
});

// Handle IPC events
ipcMain.on('resetRegistrationNumber', event => {
  incrementRegistrationNumber()
    .then(newNumber => {
      event.reply('registrationNumberUpdated', newNumber);
    })
    .catch(err => {
      console.error(err);
    });
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
    err => {
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
    err => {
      if (err) {
        console.error(err);
      }
    }
  );

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    db.close(err => {
      if (err) {
        console.error(err);
      }
    });
    app.quit();
  }
});
