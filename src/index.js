import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import electronSquirrelStartup from 'electron-squirrel-startup';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (electronSquirrelStartup) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.webContents.openDevTools();
  }
};

ipcMain.handle('dialog:openFile', async (event, options) => {
  const { filters } = options || {};
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: filters || [{ name: 'All Files', extensions: ['*'] }],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const filePath = result.filePaths[0];
  const buffer = fs.readFileSync(filePath);
  const name = path.basename(filePath);

  return {
    name,
    path: filePath,
    buffer: buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
  };
});

ipcMain.handle('dialog:saveFile', async (event, options) => {
  const { defaultName, buffer, filters } = options || {};
  const result = await dialog.showSaveDialog({
    defaultPath: defaultName,
    filters: filters || [{ name: 'All Files', extensions: ['*'] }],
  });

  if (result.canceled || !result.filePath) {
    return null;
  }

  fs.writeFileSync(result.filePath, Buffer.from(buffer));
  return { path: result.filePath };
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
