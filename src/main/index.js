const { app, shell, BrowserWindow, ipcMain } = require('electron');
const { join } = require('path');
const { electronApp, optimizer, is } = require('@electron-toolkit/utils');
const sqlite3 = require('sqlite3').verbose();
const notifier = require('node-notifier');
const schedule = require('node-schedule');
const http = require('http');
const socketIo = require('socket.io');

let db;

const server = http.createServer();
const io = socketIo(server);

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
  const currentTime = new Date().getTime();

  const query = `
    SELECT patientname, medname, finishTime, halfTime, ninetyPercentTime, customTime
    FROM Finalpatients
    WHERE finishTime = ? 
    OR halfTime = ? 
    OR ninetyPercentTime = ? 
    OR customTime = ?
  `;

  db.all(query, [currentTime, currentTime, currentTime, currentTime], (err, rows) => {
    if (err) {
      console.error('Failed to check patient times:', err);
      return;
    }

    console.log(`Current Time: ${currentTime}`);
    console.log(`Rows found: ${rows.length}`);
    if (rows.length > 0) {
      const patientsWithAlarms = rows.map((row) => ({
        patientname: row.patientname,
        medname: row.medname,
        finishTime: row.finishTime,
        halfTime: row.halfTime,
        ninetyPercentTime: row.ninetyPercentTime,
        customTime: row.customTime
      }));

      console.log(`Patients with alarms: ${JSON.stringify(patientsWithAlarms)}`);

      io.emit('patientTimes', patientsWithAlarms);

      // Also show notifications for each patient
      patientsWithAlarms.forEach((patient) => {
        notifier.notify({
          title: 'Patient Medication Alert',
          message: `Medication time for ${patient.patientname} with ${patient.medname}.`,
          sound: true, // Only Notification Center or Windows Toasters
          wait: true // Wait with callback until user action is taken against notification
        });
      });
    } else {
      console.log('No patients found with matching times.');
    }
  });
}


function startNotificationScheduler() {
  schedule.scheduleJob('* * * * * *', checkPatientTimes); 
}

function authenticateUser(username, password) {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM theusers WHERE username = ? AND password = ?`;
    db.get(query, [username, password], (err, row) => {
      if (err) {
        reject(err);
      } else if (row) {
        resolve(row);
      } else {
        reject(new Error('Invalid username or password'));
      }
    });
  });
}

ipcMain.handle('login', async (event, username, password) => {
  try {
    const user = await authenticateUser(username, password);
    return { success: true, user };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

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

  startNotificationScheduler();

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

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
