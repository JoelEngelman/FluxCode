const { app, BrowserWindow, ipcMain, shell, safeStorage } = require('electron');
const path = require('path');
const fs = require('fs');

let win;
const dataFile = () => path.join(app.getPath('userData'), 'fluxcode.json');

function readStore() {
  try { return JSON.parse(fs.readFileSync(dataFile(), 'utf8')); } catch { return {}; }
}
function writeStore(data) {
  fs.mkdirSync(path.dirname(dataFile()), { recursive: true });
  fs.writeFileSync(dataFile(), JSON.stringify(data, null, 2));
}
function createWindow() {
  win = new BrowserWindow({
    width: 1500, height: 950, minWidth: 1050, minHeight: 700,
    backgroundColor: '#07080c',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
    titleBarOverlay: process.platform === 'win32' ? { color: '#090a0f', symbolColor: '#ffffff', height: 38 } : false,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  win.loadFile('index.html');
}
app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });

ipcMain.handle('store:get', () => readStore());
ipcMain.handle('store:set', (_, key, value) => { const s = readStore(); s[key] = value; writeStore(s); return true; });
ipcMain.handle('secret:set', (_, key, value) => {
  const s = readStore();
  s.secrets ||= {};
  s.secrets[key] = safeStorage.isEncryptionAvailable() ? safeStorage.encryptString(value).toString('base64') : value;
  writeStore(s); return true;
});
ipcMain.handle('secret:get', (_, key) => {
  const s = readStore(); const raw = s.secrets?.[key]; if (!raw) return null;
  try { return safeStorage.isEncryptionAvailable() ? safeStorage.decryptString(Buffer.from(raw, 'base64')) : raw; } catch { return null; }
});
ipcMain.handle('open-external', (_, url) => shell.openExternal(url));
ipcMain.handle('app-info', () => ({ version: app.getVersion(), platform: process.platform }));
