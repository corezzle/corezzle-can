/*
 * Corezzle CAN — ana süreç. Pencereyi açar, Web Serial iznini yönetir, dosya kaydeder.
 * Ekran (renderer) node'a erişemez; yalnız preload.js'teki köprüyü görür.
 */
const { app, BrowserWindow, ipcMain, Menu, nativeTheme, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

if (require('electron-squirrel-startup')) app.quit();

let pencere = null;
let seriSecimGeri = null;          // select-serial-port cevabı (ekranın seçimi gelene kadar bekler)
const kaydedilenler = new Set();

function pencereAc() {
  pencere = new BrowserWindow({
    width: 1280, height: 820, minWidth: 980, minHeight: 640,
    title: 'Corezzle CAN',
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#06171e' : '#f1f4f6',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false, sandbox: true,
    },
  });
  const ses = pencere.webContents.session;

  // Web Serial: tarayıcıdaki "port seç" penceresi Electron'da yoktur; listeyi ekrana gönderir, seçimi ekrandan alırız.
  ses.on('select-serial-port', (olay, liste, _wc, geri) => {
    olay.preventDefault();
    seriSecimGeri = geri;
    const sade = liste.map(p => ({
      portId: p.portId, portName: p.portName || '', displayName: p.displayName || '',
      vendorId: p.vendorId || '', productId: p.productId || '',
    }));
    pencere.webContents.send('seri-liste', sade);
  });
  ses.setPermissionCheckHandler((_wc, izin) => izin === 'serial');
  ses.setPermissionRequestHandler((_wc, _izin, geri) => geri(false));
  ses.setDevicePermissionHandler(d => d.deviceType === 'serial');

  pencere.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  pencere.loadFile(path.join(__dirname, 'index.html'));
  pencere.on('closed', () => { pencere = null; });
}

ipcMain.handle('seri-sec', (_o, portId) => {
  if (seriSecimGeri) { seriSecimGeri(portId || ''); seriSecimGeri = null; }
});
ipcMain.handle('bilgi', () => ({ surum: app.getVersion(), platform: process.platform }));

// Kayıt/dışa aktarım: kullanıcı yeri seçer (varsayılan İndirilenler).
ipcMain.handle('kaydet', async (_o, ad, veri) => {
  const { canceled, filePath } = await dialog.showSaveDialog(pencere, {
    defaultPath: path.join(app.getPath('downloads'), ad),
    filters: [{ name: 'CSV / metin', extensions: ['csv', 'log', 'txt'] }],
  });
  if (canceled || !filePath) return null;
  fs.writeFileSync(filePath, veri, 'utf8');
  kaydedilenler.add(filePath);
  return { yol: filePath, ad: path.basename(filePath) };
});
ipcMain.handle('goster', (_o, yol) => { if (kaydedilenler.has(yol)) shell.showItemInFolder(yol); });

app.whenReady().then(() => {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    ...(process.platform === 'darwin' ? [{ role: 'appMenu' }] : []),
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' },
  ]));
  pencereAc();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) pencereAc(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
