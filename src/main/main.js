const { app, BrowserWindow, Tray, Menu, screen, ipcMain, nativeImage } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;
let paused = false;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height, x, y } = primaryDisplay.workArea;

  mainWindow = new BrowserWindow({
    width,
    height,
    x,
    y,
    transparent: true,
    backgroundColor: '#00000000',
    frame: false,
    hasShadow: false,
    resizable: false,
    movable: false,
    skipTaskbar: true,
    focusable: false,
    fullscreenable: false,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setAlwaysOnTop(true, 'floating');
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.setIgnoreMouseEvents(true, { forward: true });
  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.webContents.send('pet:bounds', { width, height });
  });

  if (process.env.SCREEN_PET_DEBUG) {
    mainWindow.webContents.on('console-message', (_event, _level, message) => {
      process.stdout.write(`[renderer] ${message}\n`);
    });
  }

  screen.on('display-metrics-changed', () => {
    const area = screen.getPrimaryDisplay().workArea;
    mainWindow.setBounds(area);
    mainWindow.webContents.send('pet:bounds', { width: area.width, height: area.height });
  });
}

function rebuildTrayMenu() {
  const menu = Menu.buildFromTemplate([
    { label: paused ? 'Resume' : 'Pause', click: togglePause },
    { type: 'separator' },
    {
      label: 'Size',
      submenu: [
        { label: 'Small', click: () => setSize('small') },
        { label: 'Medium', click: () => setSize('medium') },
        { label: 'Large', click: () => setSize('large') },
      ],
    },
    { type: 'separator' },
    { label: 'Quit Screen Pet', click: () => app.quit() },
  ]);
  tray.setContextMenu(menu);
}

function togglePause() {
  paused = !paused;
  mainWindow?.webContents.send('pet:paused', paused);
  rebuildTrayMenu();
}

function setSize(size) {
  mainWindow?.webContents.send('pet:size', size);
}

function createTray() {
  tray = new Tray(nativeImage.createEmpty());
  tray.setTitle('🐶');
  tray.setToolTip('Screen Pet');
  rebuildTrayMenu();
}

ipcMain.on('pet:set-ignore-mouse-events', (_event, ignore, options) => {
  mainWindow?.setIgnoreMouseEvents(ignore, options);
});

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on('window-all-closed', () => {
  app.quit();
});
