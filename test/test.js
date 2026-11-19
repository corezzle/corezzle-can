// node test/test.js — kart protokolü ve OBD çözümleri (donanımsız)
const assert = require('assert');
const K = require('../src/kart.js');
const O = require('../src/obd.js');

let n = 0;
const bekleyen = [];
function t(ad, f) {
  const p = Promise.resolve().then(f).then(() => { n++; console.log('  ok  ' + ad); }, e => { console.log('  FAIL ' + ad + ': ' + e.message); process.exitCode = 1; });
  bekleyen.push(p);
}

t('CAN satırı çözülür', () => {
  const f = K.satirCoz('CAN,12005,0x00000208,0,8,17 29 32 00 4C 32 32 32');
  assert.deepStrictEqual(f, { ms: 12005, id: 0x208, ext: false, dlc: 8, data: [0x17, 0x29, 0x32, 0, 0x4c, 0x32, 0x32, 0x32] });
});
t('boş veri ve genişletilmiş kimlik', () => {
  const f = K.satirCoz('CAN,5,0x18FEF100,1,0,');
  assert.strictEqual(f.ext, true); assert.strictEqual(f.id, 0x18FEF100); assert.deepStrictEqual(f.data, []);
});
t('CAN olmayan satır null', () => { assert.strictEqual(K.satirCoz('[cmd] OK: x'), null); });
t('durum satırı çözülür', () => {
  const d = K.durumCoz([
    '[cmd] OK: can bitrate=500 kbps twai=running mod=LISTEN-ONLY rx_total=2366 distinct=10/96 dropped=0 stream=on',
    '[cmd]     hata: tx_err=0 rx_err=0 tx_failed=0 rx_missed=0 bus_err=0 arb_lost=0 tx_kuyruk=0',
  ]);
  assert.strictEqual(d.kbps, 500); assert.strictEqual(d.txAcik, false); assert.strictEqual(d.rxTotal, 2366);
  assert.strictEqual(d.distinct, 10); assert.strictEqual(d.stream, true); assert.strictEqual(d.hata.busErr, 0);
});
t('NORMAL mod txAcik', () => { assert.strictEqual(K.durumCoz(['[cmd] OK: can bitrate=250 kbps twai=running mod=NORMAL(tx on) rx_total=0 distinct=0/96 dropped=0 stream=off']).txAcik, true); });
t('tarama çözülür', () => {
  const s = K.taramaCoz(['[cmd]    500 kbit/s: 2366 frame', '[cmd]    250 kbit/s: 0 frame (hata var)', '[cmd] OK: hat 500 kbit/s (2366 frame/4 sn). Kalici yazildi']);
  assert.strictEqual(s.bulunan, 500); assert.strictEqual(s.hizlar[500], 2366); assert.strictEqual(s.hizlar[250], 0);
});
t('OBD cevabı: devir', () => {
  const c = K.obdCevapCoz(['[cmd]   cevap 0x000007E8,04,41,0C,1A,F8,00,00,00  n=1  12 ms once']);
  assert.strictEqual(c.length, 1);
  const r = O.cevapCoz(c[0]);
  assert.strictEqual(r.pid, 0x0C); assert.strictEqual(r.deger, '1726'); assert.strictEqual(r.birim, 'd/dk');
});
t('OBD cevabı: sıcaklık ve olumsuz cevap', () => {
  assert.strictEqual(O.cevapCoz({ id: 0x7E8, data: [3, 0x41, 0x05, 0x5A] }).deger, 50);
  const nrc = O.cevapCoz({ id: 0x7E8, data: [3, 0x7F, 0x01, 0x12] });
  assert.strictEqual(nrc.ad, 'Olumsuz cevap'); assert.strictEqual(nrc.deger, 'NRC 0x12');
});
t('Kart satır ayrıştırma ve komut toplama', async () => {
  const k = new K.Kart();
  const frames = []; k.onFrame = f => frames.push(f);
  k.yaz = async () => {};
  const p = k.komut('get can', 500);
  k._metin('CAN,1,0x00000123,0,2,AA BB\r\n[cmd] OK: can bitrate=125 kbps twai=running mod=LISTEN-ONLY rx_total=1 distinct=1/96 dropped=0 stream=on\n');
  const s = await p;
  assert.strictEqual(frames.length, 1); assert.strictEqual(frames[0].data[1], 0xbb);
  assert.strictEqual(K.durumCoz(s).kbps, 125);
});
t('OBD komutu ara bildirimde bitmez, son OK ile biter', async () => {
  const k = new K.Kart(); k.yaz = async () => {};
  const p = k.komut('can obd 0C', 500);
  k._metin('[cmd] .. OBD istek 0x7DF [02 01 0C] gonderildi, cevap bekleniyor...\n');
  await new Promise(r => setTimeout(r, 20));
  assert.ok(k._bekleyen, 'ara bildirim komutu bitirmemeli');
  k._metin('[cmd]   cevap 0x000007E8,04,41,0C,1A,F8,00,00,00  n=1  12 ms once\n[cmd] OK: obd bitti (1 cevap)\n');
  const s = await p;
  assert.strictEqual(K.obdCevapCoz(s).length, 1);
});
Promise.all(bekleyen).then(() => console.log(`\n${n} test geçti${process.exitCode ? ', hata var' : ''}`));
