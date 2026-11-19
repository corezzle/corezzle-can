// Corezzle CAN: ekran ile ana süreç arasındaki dar köprü. Ekranın node'a ve dosya sistemine erişimi yoktur.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('canUygulama', {
  platform: process.platform,
  bilgi: () => ipcRenderer.invoke('bilgi'),
  seriSec: portId => ipcRenderer.invoke('seri-sec', portId),
  seriListesi: geri => ipcRenderer.on('seri-liste', (_o, liste) => geri(liste)),
  kaydet: (ad, veri) => ipcRenderer.invoke('kaydet', ad, veri),
  goster: yol => ipcRenderer.invoke('goster', yol),
});
