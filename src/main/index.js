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

function createPatientTable(){
  db.run(`CREATE TABLE IF NOT EXISTS patients (
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
    customAlarmPercentage INTEGER
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
  const { patientname, age, wardnumber, bednumber, medname, volumeoffluid, dosesTaken, flowRate, fluidNumber, customAlarmPercentage } = patient;
  db.run(`INSERT INTO patients (patientname, age, wardnumber, bednumber, medname, volumeoffluid, dosesTaken, flowRate, fluidNumber, customAlarmPercentage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [patientname, age, wardnumber, bednumber, medname, volumeoffluid, dosesTaken, flowRate, fluidNumber, customAlarmPercentage], function (err) {
      if (err) {
        console.error('Failed to add patient:', err);
      } else {
        console.log('Patient added with ID:', this.lastID);
      }
    });
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
