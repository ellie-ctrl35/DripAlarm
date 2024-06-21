const { app, shell, BrowserWindow, ipcMain } = require('electron');
const { join } = require('path');
const { electronApp, optimizer, is } = require('@electron-toolkit/utils');
const sqlite3 = require('sqlite3').verbose();
// const icon = require('../../resources/icon.png?asset');

let db;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

// Initialize the database
db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Failed to connect to database:', err);
  } else {
    console.log('Connected to SQLite database.');
    createTable();
    createPatientTable();
  }
});

function createTable() {
  db.run(`CREATE TABLE IF NOT EXISTS theusers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT
  )`, (err) => {
    if (err) {
      console.error('Failed to create table:', err);
    } else {
      console.log('Table created or already exists.');
    }
  });
}

function createPatientTable() {
  db.run(`CREATE TABLE IF NOT EXISTS Finalpatients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patientname TEXT,
    age INTEGER,
    wardnumber INTEGER,
    bednumber INTEGER,
    medname TEXT,
    volumeoffluid INTEGER,
    dosesTaken INTEGER,
    flowRate INTEGER,
    fluidNumber INTEGER,
    customAlarmPercentage INTEGER,
    finishTime TEXT,
    halfTime TEXT,
    ninetyPercentTime TEXT,
    customTime TEXT
  )`, (err) => {
    if (err) {
      console.error('Failed to create patient table:', err);
    } else {
      console.log('Patient Table created or already exists.');
    }
  });
}

// Function to add a new patient
function addPatient(patient) {
  const {
    patientname,
    age,
    wardnumber,
    bednumber,
    medname,
    volumeoffluid,
    dosesTaken,
    flowRate,
    fluidNumber,
    customAlarmPercentage,
    finishTime,
    halfTime,
    ninetyPercentTime,
    customTime
  } = patient;

  db.run(
    `INSERT INTO Finalpatients 
      (patientname, age, wardnumber, bednumber, medname, volumeoffluid, dosesTaken, flowRate, fluidNumber, customAlarmPercentage, finishTime, halfTime, ninetyPercentTime, customTime) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      patientname,
      age,
      wardnumber,
      bednumber,
      medname,
      volumeoffluid,
      dosesTaken,
      flowRate,
      fluidNumber,
      customAlarmPercentage,
      finishTime,
      halfTime,
      ninetyPercentTime,
      customTime
    ],
    function (err) {
      if (err) {
        console.error('Failed to add patient:', err);
      } else {
        console.log('Patient added with ID:', this.lastID);
      }
    }
  );
}

function addNewUser(username, password) {
  db.run(
    `INSERT INTO theusers (username, password) VALUES (?, ?)`,
    [username, password],
    function (err) {
      if (err) {
        console.error('Failed to add user:', err);
      } else {
        console.log('User added with ID:', this.lastID);
      }
    }
  );
}

function checkPatientTimes() {
  const currentTime = new Date().toISOString().slice(0, 16); // Get current time in "YYYY-MM-DDTHH:MM" format

  const query = `
    SELECT patientname, medname
    FROM Finalpatients
    WHERE finishTime = ? OR halfTime = ? OR ninetyPercentTime = ? OR customTime = ?
  `;

  db.all(query, [currentTime, currentTime, currentTime, currentTime], (err, rows) => {
    if (err) {
      console.error('Failed to query patient times:', err);
      return;
    }

    rows.forEach(row => {
      notifier.notify({
        title: 'Medication Alert',
        message: `Patient: ${row.patientname}, Medication: ${row.medname}`
      });
    });
  });
}

// Schedule the checkPatientTimes function to run every minute
function startNotificationScheduler() {
  cron.schedule('* * * * *', checkPatientTimes); // Runs every minute
}

// Handle database queries from the renderer process
ipcMain.handle('query-database', (event, query, params) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
});

// Handle adding a new patient from the renderer process
ipcMain.handle('add-patient', (event, patient) => {
  return new Promise((resolve, reject) => {
    addPatient(patient);
    resolve('Patient added');
  });
});

ipcMain.handle('add-user', (event, username, password) => {
  return new Promise((resolve, reject) => {
    addNewUser(username, password);
    resolve('User added');
  });
});

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  ipcMain.on('ping', () => console.log('pong'));

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    db.close((err) => {
      if (err) {
        console.error('Failed to close database:', err);
      } else {
        console.log('Database connection closed.');
      }
    });
    app.quit();
  }
});
