const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(__dirname, 'public', 'logo.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Completely remove the menu for this window
  mainWindow.removeMenu();

  // Register shortcuts since menu is gone
  globalShortcut.register('F5', () => {
    if (mainWindow) mainWindow.reload();
  });
  globalShortcut.register('CommandOrControl+R', () => {
    if (mainWindow) mainWindow.reload();
  });
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    if (mainWindow) mainWindow.webContents.toggleDevTools();
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    // In dev, wait-on and concurrently will start the next dev server
    mainWindow.loadURL('http://localhost:3000');
  } else {
    // In production, spawn next start on a dynamic port
    const port = Math.floor(Math.random() * 10000) + 30000;
    const { spawn } = require('child_process');
    const nextPath = path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next');

    const nextServer = spawn(process.execPath, [nextPath, 'start', '-p', port.toString()], {
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: '1',
        PORT: port.toString(),
        NODE_ENV: 'production',
        APPDATA_PATH: app.getPath('userData')
      }
    });

    nextServer.stdout.on('data', (data) => {
      const msg = data.toString();
      if (msg.includes('Ready in') || msg.includes('started server on') || msg.includes('http://') || msg.toLowerCase().includes('ready')) {
        mainWindow.loadURL(`http://localhost:${port}`);
      }
    });

    nextServer.stderr.on('data', (data) => {
      console.error(`Next.js error: ${data}`);
    });

    app.on('will-quit', () => {
      nextServer.kill();
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
