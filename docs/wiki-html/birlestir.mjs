// Panel bölümlerini tek dosyada birleştirir: Corezzle-CAN-Wiki.md (TR+EN, görseller göreli yol)
// ve Corezzle-CAN-Wiki.html (tek dosya, görseller gömülü; panelin markdown-it ayarlarıyla).
// PDF için: Chrome headless --print-to-pdf (bkz. birlestir.sh).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const KOK = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'panel-icerik');
const MD_LIB = process.env.MD_IT || path.join(process.env.HOME, 'Desktop/web-design/design-frontend/node_modules/markdown-it');
const require = createRequire(import.meta.url);
const MarkdownIt = require(MD_LIB);

const TR = [
  ['01-genel-bakis.md', 'Genel bakış'], ['02-bu-uygulama-ne-yapar.md', 'Bu uygulama ne yapar?'],
  ['03-temel-kavramlar.md', 'Temel kavramlar'], ['04-hizli-baslangic.md', 'Hızlı başlangıç'],
  ['05-donanim-ve-baglantilar.md', 'Donanım ve bağlantılar'], ['06-karta-baglanma-ve-hat-hizi.md', 'Karta bağlanma ve hat hızı'],
  ['07-canli-ve-akis.md', 'Canlı ve Akış'], ['08-gonder-obd-ve-guvenlik-kilidi.md', 'Gönder: OBD-II ve güvenlik kilidi'],
  ['09-kayit.md', 'Kayıt'], ['10-konsol-ve-kart-komutlari.md', 'Konsol ve kart komutları'],
  ['11-guvenlik-modeli-ve-sahada-ogrenilenler.md', 'Güvenlik modeli ve sahada öğrenilenler'], ['12-demo-modu.md', 'Demo modu'],
  ['13-sorun-giderme.md', 'Sorun giderme'], ['14-kaynak-kod-testler-ve-lisans.md', 'Kaynak kod, testler ve lisans'],
];
const EN = [
  ['01-overview.md', 'Overview'], ['02-what-does-this-app-do.md', 'What does this app do?'],
  ['03-core-concepts.md', 'Core concepts'], ['04-quick-start.md', 'Quick start'],
  ['05-hardware-and-wiring.md', 'Hardware and wiring'], ['06-connecting-and-bitrate.md', 'Connecting and bitrate'],
  ['07-live-and-stream.md', 'Live and Stream'], ['08-send-obd-and-safety-lock.md', 'Send: OBD-II and the safety lock'],
  ['09-recording.md', 'Recording'], ['10-console-and-board-commands.md', 'Console and board commands'],
  ['11-safety-model-and-field-lessons.md', 'Safety model and field lessons'], ['12-demo-mode.md', 'Demo mode'],
  ['13-troubleshooting.md', 'Troubleshooting'], ['14-source-code-tests-and-licence.md', 'Source code, tests and licence'],
];

// GORSEL: dosya.png → göreli yol (görseller tek dil: İngilizce).
function gorselYolu(dosya, en) { return 'gorseller/' + dosya; }
function bolumOku(klasor, dosya, en) {
  const ham = fs.readFileSync(path.join(KOK, klasor, dosya), 'utf8').trim();
  return ham.replace(/\(GORSEL: ([^)]+)\)/g, (_, d) => '(' + gorselYolu(d.trim(), en) + ')');
}

// ---- 1) Tek Markdown ----
const tarih = new Date().toISOString().slice(0, 10);
let md = `# Corezzle CAN — Wiki dökümanı (tam metin)\n\n`;
md += `Bu dosya \`docs/panel-icerik/\` altındaki 14 bölümün (TR) ve \`en/\` altındaki İngilizce karşılıklarının **tek dosyada birleştirilmiş** halidir; gözden geçirme için. Panele girilecek olan parça dosyalardır; bu dosya elle düzenlenmez, \`node docs/wiki-html/birlestir.mjs\` ile yeniden üretilir. Üretim: ${tarih}.\n\n`;
md += `Görseller: \`gorseller/\` (ekran görüntüleri demo modundan, arayüz metinleri İngilizce; bağlantı şeması İngilizce).\n\n`;
md += `## İçindekiler\n\n**Türkçe**\n\n` + TR.map(([, b], i) => `${i + 1}. ${b}`).join('\n') + `\n\n**English**\n\n` + EN.map(([, b], i) => `${i + 1}. ${b}`).join('\n') + '\n\n---\n\n';
md += `# Türkçe\n\n`;
TR.forEach(([d, b], i) => { md += `## ${i + 1}. ${b}\n\n${bolumOku('', d, false)}\n\n---\n\n`; });
md += `# English\n\n`;
EN.forEach(([d, b], i) => { md += `## ${i + 1}. ${b}\n\n${bolumOku('en', d, true)}\n\n---\n\n`; });
fs.writeFileSync(path.join(KOK, 'Corezzle-CAN-Wiki.md'), md);

// ---- 2) Tek HTML (panelin markdown-it ayarları + aynı güvenlik filtresi) ----
const mdit = new MarkdownIt({ html: true, breaks: true, linkify: true, typographer: true });
const IZINLI = /^<\/?(div|span|p|br|hr|b|strong|i|em|u|s|small|sub|sup|ul|ol|li|table|thead|tbody|tr|th|td|h[1-6]|img|a|code|pre|blockquote)\b/i;
const TEHLIKELI = /\son\w+\s*=|javascript:|<\s*(script|iframe|object|embed|form|input|link|meta|style|svg)\b/i;
const guvenli = s => (IZINLI.test(s.trim()) && !TEHLIKELI.test(s)) ? s : mdit.utils.escapeHtml(s);
mdit.renderer.rules.html_block = (t, i) => guvenli(t[i].content);
mdit.renderer.rules.html_inline = (t, i) => guvenli(t[i].content);

const b64 = p => 'data:image/png;base64,' + fs.readFileSync(path.join(KOK, p)).toString('base64');
function bolumHtml(klasor, dosya, en) {
  const icerik = bolumOku(klasor, dosya, en).replace(/<br\s*\/?>/gi, '\n\n');
  return mdit.render(icerik).replace(/src="(gorseller\/[^"]+)"/g, (_, p) => `src="${b64(p)}"`);
}
const bolumlerHtml = (liste, klasor, en, onek) => liste.map(([d, b], i) =>
  `<section class="bolum" id="${onek}-${i + 1}"><h2><span class="no">${String(i + 1).padStart(2, '0')}</span>${b}</h2>${bolumHtml(klasor, d, en)}</section>`).join('\n');

const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Corezzle CAN — Wiki dökümanı</title>
<style>
:root{color-scheme:light dark;--mt:#1c2430;--arka:#fff;--cizgi:rgba(128,128,128,.28)}
@media (prefers-color-scheme:dark){:root{--mt:#e6ebf0;--arka:#14181d}}
body{margin:0;background:var(--arka);color:var(--mt);font:15px/1.65 -apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
.sayfa{max-width:860px;margin:0 auto;padding:32px 20px 80px}
h1{font-size:30px;margin:0 0 8px}h2{font-size:24px;margin:40px 0 14px;padding-top:8px}h3{font-size:18px;margin:24px 0 8px}
.bolum h2:not(:first-child){font-size:19px;margin-top:28px}.bolum h3{font-size:16.5px}h2 .no{display:inline-block;min-width:34px;color:#12A0AD;font-weight:800;margin-right:8px}
.ust{opacity:.75;font-size:14px}.dil{font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#12A0AD;font-weight:800;margin:60px 0 -20px;border-top:3px solid #12A0AD;padding-top:14px}
.icindekiler{display:grid;grid-template-columns:1fr 1fr;gap:0 30px;margin:20px 0 10px}.icindekiler ol{margin:6px 0;padding-left:22px}.icindekiler a{color:inherit;text-decoration:none}.icindekiler a:hover{color:#12A0AD}
.bolum{border-top:1px solid var(--cizgi);break-inside:auto}
img{max-width:100%;height:auto;border:1px solid var(--cizgi);border-radius:8px;display:block;margin:14px auto}
table{border-collapse:collapse;width:100%;margin:14px 0;font-size:14px}th,td{border:1px solid var(--cizgi);padding:7px 10px;text-align:left;vertical-align:top}th{background:rgba(128,128,128,.12)}
code{font:13px/1.5 ui-monospace,Menlo,Consolas,monospace;background:rgba(128,128,128,.14);padding:1px 5px;border-radius:4px}pre{background:rgba(128,128,128,.12);border:1px solid var(--cizgi);border-radius:8px;padding:12px 14px;overflow:auto}pre code{background:none;padding:0}
a{color:#12A0AD}blockquote{border-left:3px solid var(--cizgi);margin:10px 0;padding:4px 14px;opacity:.85}
@media print{body{background:#fff;color:#1c2430}.sayfa{max-width:none;padding:0}.bolum>h2:first-child{break-before:page}#tr-1>h2:first-child,#en-1>h2:first-child{break-before:auto}.dil{break-before:page}.bolum:first-of-type{border-top:0}pre,img,tr,.bolum>div{break-inside:avoid}a{color:#0b7d87}}
</style></head><body><div class="sayfa">
<h1>Corezzle CAN — Wiki dökümanı</h1>
<p class="ust">corezzle.com Wiki'sine girilecek dökümanın tam metni, gözden geçirme için tek dosyada. 14 bölüm Türkçe + 14 bölüm İngilizce. Görseller demo modundan alınmış gerçek ekran görüntüleridir; yazıları İngilizcedir. Kaynak: <code>docs/panel-icerik/</code>, üretim ${tarih}.</p>
<div class="icindekiler"><div><strong>Türkçe</strong><ol>${TR.map(([, b], i) => `<li><a href="#tr-${i + 1}">${b}</a></li>`).join('')}</ol></div><div><strong>English</strong><ol>${EN.map(([, b], i) => `<li><a href="#en-${i + 1}">${b}</a></li>`).join('')}</ol></div></div>
<div class="dil">Türkçe</div>
${bolumlerHtml(TR, '', false, 'tr')}
<div class="dil" lang="en">English</div>
<div lang="en">${bolumlerHtml(EN, 'en', true, 'en')}</div>
</div></body></html>`;
fs.writeFileSync(path.join(KOK, 'Corezzle-CAN-Wiki.html'), html);
console.log('yazildi:', path.join(KOK, 'Corezzle-CAN-Wiki.md'), (md.length / 1024).toFixed(0) + ' KB;', path.join(KOK, 'Corezzle-CAN-Wiki.html'), (html.length / 1024 / 1024).toFixed(1) + ' MB');
