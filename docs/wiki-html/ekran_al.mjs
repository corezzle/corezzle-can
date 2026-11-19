// Corezzle CAN demo ekran görüntüleri — Chrome headless + CDP (Node 22 yerleşik WebSocket). Arayüz metinleri ekran_ceviri.js ile İngilizce çekilir.
// Kullanım: node docs/wiki-html/ekran_al.mjs docs/panel-icerik/gorseller <geçici-chrome-profil-klasörü>
import { spawn } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';
const CEVIRI = readFileSync(new URL('./ekran_ceviri.js', import.meta.url), 'utf8'); // görseller İngilizce: çekim anında TR→EN
const OUT = process.argv[2]; const URL_ = new URL('../../src/index.html', import.meta.url).href; // depo içindeki arayüz, konumdan bağımsız
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--remote-debugging-port=9333', '--window-size=1280,860', '--hide-scrollbars', '--user-data-dir=' + process.argv[3], '--no-first-run', '--allow-file-access-from-files', 'about:blank'], { stdio: 'ignore' });
const sl = ms => new Promise(r => setTimeout(r, ms));
let ws, id = 0, bekleyen = {};
const cdp = (method, params = {}) => new Promise((res, rej) => { const i = ++id; bekleyen[i] = { res, rej }; ws.send(JSON.stringify({ id: i, method, params })); });
try {
  let hedef; for (let i = 0; i < 40 && !hedef; i++) { await sl(250); try { const l = await (await fetch('http://127.0.0.1:9333/json')).json(); hedef = l.find(t => t.type === 'page'); } catch (_) {} }
  ws = new WebSocket(hedef.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && bekleyen[m.id]) { const b = bekleyen[m.id]; delete bekleyen[m.id]; m.error ? b.rej(new Error(m.error.message)) : b.res(m.result); } };
  await cdp('Page.enable'); await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 860, deviceScaleFactor: 2, mobile: false });
  await cdp('Page.navigate', { url: URL_ }); await sl(1200);
  await cdp('Runtime.evaluate', { expression: CEVIRI });
  const js = async (expr) => { const r = await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails)); return r.result.value; };
  const kare = async (ad, hedefMs = 0, boy = 860) => { if (hedefMs) await sl(hedefMs); await js(`document.getElementById('surum').textContent = 'v0.1.0'; 1`); const r = await cdp('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 1280, height: boy, scale: 1 } }); writeFileSync(`${OUT}/${ad}.png`, Buffer.from(r.data, 'base64')); console.log('yazildi', ad); };
  const tik = s => js(`document.querySelector(${JSON.stringify(s)}).click(); 1`);
  const sekme = ad => js(`document.querySelector('nav.sekmeler button[data-sekme="${ad}"]').click(); 1`);
  await kare('ekran-baslangic', 0, 420);
  await tik('#b-demo'); await sl(2500);
  await sekme('ayar'); await tik('#b-tara'); await sl(22000); await kare('ekran-ayarlar-hiz', 0, 500);
  await sekme('canli'); await kare('ekran-canli', 3500, 420);
  await sekme('akis'); await kare('ekran-akis', 1500, 620);
  await sekme('gonder'); await tik('#b-tx-ac'); await sl(1200);
  await js(`document.querySelector('#obd-pid').value = [...document.querySelector('#obd-pid').options].find(o => /0C|devri/i.test(o.textContent)).value; 1`);
  await tik('#b-obd'); await sl(2500);
  await js(`document.querySelector('#obd-pid').value = [...document.querySelector('#obd-pid').options].find(o => /0D|hızı/i.test(o.textContent)).value; 1`);
  await tik('#b-obd'); await sl(2500);
  await js(`document.querySelector('#obd-pid').value = [...document.querySelector('#obd-pid').options].find(o => /05|Soğutma/i.test(o.textContent)).value; 1`);
  await tik('#b-obd'); await kare('ekran-gonder-obd', 2500, 540);
  await sekme('kayit'); await tik('#b-kayit'); await sl(4000); await tik('#b-kayit'); await kare('ekran-kayit', 600, 420);
  await sekme('konsol'); await js(`document.querySelector('#k-komut').value = 'get can'; 1`); await tik('#b-k-gonder'); await kare('ekran-konsol', 1500, 620);
  console.log('durum:', await js(`document.querySelector('#r-hiz').textContent + ' | ' + document.querySelector('#r-mod').textContent + ' | canli satir: ' + document.querySelectorAll('#sekme-canli tbody tr').length + ' | obd satir: ' + document.querySelectorAll('#t-obd tbody tr').length + ' | kayit: ' + document.querySelector('#kayit-ozet').textContent`));
} catch (e) { console.error('HATA', e.message); } finally { chrome.kill(); }
