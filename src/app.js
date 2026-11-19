/*
 * Corezzle CAN — ekran mantığı. Kartla konuşma board.js'te, OBD çözümü obd.js'te.
 * Frame'ler saniyede yüzlerce gelir; tablo DOM'u 10 Hz'de topluca yenilenir.
 */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const K = window.KART, OBD = window.OBD;
  // Electron dışında (tarayıcıda görünüm geliştirme) köprü yoktur; sessiz bir yedek kullanılır.
  const API = window.canUygulama || { platform: 'web', bilgi: async () => ({ surum: 'dev' }), seriListesi() {}, seriSec() {}, kaydet: async () => null, goster() {} };

  const kart = new K.Kart();
  const tablo = new Map();          // anahtar "id/ext" → { id, ext, dlc, data, onceki, sayi, son, hz, pencere:[] }
  let duraklat = false, akisDuraklat = false, degistiOnce = new Set();
  let akisSatir = [], akisKirli = false;
  let kayit = null;                 // { bas, satirlar:[] }
  let rxToplam = 0, fpsSayac = 0, fps = 0;
  let durumSon = null;
  let obdTekrar = null, gTekrar = null;
  let seriCevap = null;

  /* ── küçük yardımcılar ───────────────────────────────────────── */
  const hex2 = b => b.toString(16).toUpperCase().padStart(2, '0');
  const idYaz = (id, ext) => '0x' + id.toString(16).toUpperCase().padStart(ext ? 8 : 3, '0');
  function mesaj(t, kotu) { const m = $('mesaj'); m.textContent = t; m.className = kotu ? 'kotu' : ''; }
  function konsolYaz(s) {
    const k = $('konsol'); const altta = k.scrollTop + k.clientHeight >= k.scrollHeight - 20;
    k.textContent += s + '\n';
    if (k.textContent.length > 200000) k.textContent = k.textContent.slice(-150000);
    if (altta) k.scrollTop = k.scrollHeight;
  }
  function sekme(ad) {
    document.querySelectorAll('.sekmeler button').forEach(b => b.classList.toggle('aktif', b.dataset.sekme === ad));
    document.querySelectorAll('.sekme').forEach(s => s.classList.toggle('aktif', s.id === 'sekme-' + ad));
  }
  document.querySelectorAll('.sekmeler button').forEach(b => b.onclick = () => sekme(b.dataset.sekme));

  /* ── bağlantı ────────────────────────────────────────────────── */
  API.seriListesi(liste => {
    const kap = $('seri-liste'); kap.innerHTML = '';
    if (!liste.length) kap.innerHTML = '<p class="not">Seri port bulunamadı.</p>';
    for (const p of liste) {
      const b = document.createElement('button');
      const esp = parseInt(p.vendorId, 16) === K.VID_ESP || p.vendorId === String(K.VID_ESP);
      b.innerHTML = `<b>${p.displayName || p.portName || 'port'}</b>${esp ? ' · ESP32-S3' : ''}<small>${p.portName} ${p.vendorId ? 'VID ' + p.vendorId : ''}</small>`;
      b.onclick = () => { $('seri-sec').hidden = true; API.seriSec(p.portId); };
      kap.appendChild(b);
    }
    $('seri-sec').hidden = false;
  });
  $('seri-vazgec').onclick = () => { $('seri-sec').hidden = true; API.seriSec(''); };

  async function bagla(hazirPort) {
    $('b-bagla').disabled = true; $('b-demo').disabled = true; mesaj(hazirPort ? 'sahte kart başlatılıyor…' : 'kart seçiliyor…');
    try {
      const port = hazirPort || await K.portIste(false).catch(async e => { if (/No port selected/i.test(e.message)) throw e; return K.portIste(true); });
      mesaj(hazirPort ? 'demo: sahte hat 500 kbit/s, kart 250 ile başlar; Ayarlar → Hızı bul ile deneyin' : 'bağlanıyor… kart açılışı 30 sn sürebilir');
      await kart.bagla(port);
      $('r-baglanti').textContent = hazirPort ? 'demo (sahte kart)' : 'bağlı'; $('r-baglanti').classList.add('ok');
      $('b-bagla').hidden = true; $('b-demo').hidden = true; $('b-ayir').hidden = false;
      const d = await kart.hazirBekle();
      durumGoster(d);
      await kart.akis(true);
      mesaj(`${hazirPort ? 'demo' : 'bağlandı'}: ${d.kbps} kbit/s, ${d.txAcik ? 'gönderim açık' : 'listen-only'}`);
      if (!d.rxTotal) setTimeout(() => { if (kart.bagli && !rxToplam) mesaj('frame gelmiyor: kontak açık mı? Hız doğru mu? Ayarlar → Hızı bul', true); }, 6000);
    } catch (e) {
      mesaj('bağlanamadı: ' + e.message, true);
      await ayir(true);
    } finally { $('b-bagla').disabled = false; $('b-demo').disabled = false; }
  }
  async function ayir(sessiz) {
    tekrarDurdur();
    await kart.kapat();
    $('r-baglanti').textContent = 'bağlı değil'; $('r-baglanti').classList.remove('ok');
    $('b-bagla').hidden = false; $('b-demo').hidden = false; $('b-ayir').hidden = true;
    if (!sessiz) mesaj('ayrıldı');
  }
  $('b-bagla').onclick = () => bagla(null);
  $('b-demo').onclick = () => bagla(new window.SAHTE_KART.SahtePort());
  $('b-ayir').onclick = () => ayir(false);
  kart.onKopma = () => { tekrarDurdur(); $('r-baglanti').textContent = 'kart koptu'; $('r-baglanti').classList.remove('ok'); $('b-bagla').hidden = false; $('b-demo').hidden = false; $('b-ayir').hidden = true; mesaj('USB bağlantısı koptu', true); };

  /* ── gelen frame'ler ─────────────────────────────────────────── */
  kart.onFrame = f => {
    rxToplam++; fpsSayac++;
    const an = f.ms, anahtar = f.id + '/' + (f.ext ? 1 : 0);
    let s = tablo.get(anahtar);
    if (!s) { s = { id: f.id, ext: f.ext, dlc: f.dlc, data: f.data, onceki: null, sayi: 0, son: an, pencere: [], hz: 0, degisti: false }; tablo.set(anahtar, s); }
    const degisti = s.sayi > 0 && (s.data.length !== f.data.length || s.data.some((b, i) => b !== f.data[i]));
    if (degisti) { s.onceki = s.data; degistiOnce.add(anahtar); s.degisti = true; }
    s.data = f.data; s.dlc = f.dlc; s.sayi++; s.son = an;
    s.pencere.push(an); while (s.pencere.length && an - s.pencere[0] > 2000) s.pencere.shift();
    s.hz = s.pencere.length / 2;
    if (!akisDuraklat) {
      akisSatir.push(`${String(an).padStart(8)}  ${idYaz(f.id, f.ext).padEnd(10)} ${f.ext ? 'E' : 'S'} ${f.dlc}  ${f.data.map(hex2).join(' ')}`);
      if (akisSatir.length > 2000) akisSatir.splice(0, akisSatir.length - 2000);
      akisKirli = true;
    }
    if (kayit) kayit.satirlar.push(`${an},${idYaz(f.id, f.ext)},${f.ext ? 1 : 0},${f.dlc},${f.data.map(hex2).join(',')}`);
  };
  kart.onSatir = s => {
    if (s.startsWith('[cmd]') || s.startsWith('I (') || s.startsWith('W (') || s.startsWith('E (') || s.startsWith('[')) konsolYaz(s);
  };

  /* ── 10 Hz yenileme ──────────────────────────────────────────── */
  setInterval(() => {
    $('s-rx').textContent = rxToplam; $('s-kimlik').textContent = tablo.size; $('s-fps').textContent = fps;
    if (!duraklat) tabloCiz();
    if (akisKirli && !akisDuraklat) { akisKirli = false; const a = $('akis'); const altta = a.scrollTop + a.clientHeight >= a.scrollHeight - 30; a.textContent = akisSatir.join('\n'); if (altta) a.scrollTop = a.scrollHeight; }
    if (kayit) { $('kayit-durum').textContent = `kayıt sürüyor: ${kayit.satirlar.length} frame, ${((Date.now() - kayit.bas) / 1000).toFixed(0)} sn`; }
  }, 100);
  setInterval(() => { fps = fpsSayac; fpsSayac = 0; }, 1000);
  setInterval(async () => { if (kart.bagli && !kart._bekleyen) { try { durumGoster(await kart.durum()); } catch (_) {} } }, 5000);

  function tabloCiz() {
    const tb = $('t-canli').querySelector('tbody');
    const suz = $('f-kimlik').value.trim().toUpperCase().replace(/^0X/, '');
    const yalnizDegisen = $('c-degisen').checked, ondalik = $('c-ondalik').checked;
    const simdi = Date.now();
    const satirlar = [...tablo.values()].sort((a, b) => a.id - b.id).filter(s => {
      if (suz && !idYaz(s.id, s.ext).toUpperCase().includes(suz)) return false;
      if (yalnizDegisen && !degistiOnce.has(s.id + '/' + (s.ext ? 1 : 0))) return false;
      return true;
    });
    $('canli-bos').hidden = tablo.size > 0;
    const html = satirlar.map(s => {
      const hücre = s.data.map((b, i) => `<span class="b${s.onceki && s.onceki[i] !== b && s.degisti ? ' d' : ''}">${ondalik ? b : hex2(b)}</span>`).join(' ');
      return `<tr><td class="mono">${idYaz(s.id, s.ext)}</td><td>${s.ext ? '29 bit' : '11 bit'}</td><td>${s.dlc}</td><td class="mono">${hücre}</td><td>${s.sayi}</td><td>${s.hz.toFixed(1)}</td><td>${s.son} ms</td></tr>`;
    }).join('');
    if (tb.dataset.son !== html) { tb.innerHTML = html; tb.dataset.son = html; }
    for (const s of tablo.values()) s.degisti = false;
    void simdi;
  }
  $('b-temizle').onclick = async () => { tablo.clear(); degistiOnce.clear(); rxToplam = 0; $('t-canli').querySelector('tbody').innerHTML = ''; if (kart.bagli) kart.temizle().catch(() => {}); };
  $('b-duraklat').onclick = e => { duraklat = !duraklat; e.target.textContent = duraklat ? 'Devam' : 'Duraklat'; };
  $('f-kimlik').oninput = () => tabloCiz();
  $('b-akis-duraklat').onclick = e => { akisDuraklat = !akisDuraklat; e.target.textContent = akisDuraklat ? 'Devam' : 'Duraklat'; };
  $('b-akis-temizle').onclick = () => { akisSatir = []; $('akis').textContent = ''; };
  $('f-akis').oninput = () => { const q = $('f-akis').value.trim().toUpperCase(); $('akis').textContent = (q ? akisSatir.filter(s => s.toUpperCase().includes(q)) : akisSatir).join('\n'); };

  /* ── durum ───────────────────────────────────────────────────── */
  function durumGoster(d) {
    durumSon = d;
    $('r-hiz').textContent = (d.kbps || '—') + ' kbit/s';
    $('r-mod').textContent = d.txAcik ? 'NORMAL · gönderim açık' : 'listen-only';
    $('r-mod').classList.toggle('tx', !!d.txAcik);
    $('tx-kapali').hidden = !!d.txAcik; $('tx-acik').hidden = !d.txAcik;
    const h = d.hata || {}; const hataN = (h.busErr || 0) + (h.txFailed || 0);
    $('s-hata').hidden = !hataN; $('s-hata-n').textContent = hataN;
    $('durum').textContent = [
      `hız: ${d.kbps} kbit/s   denetleyici: ${d.twai}   mod: ${d.mod}`,
      `alınan: ${d.rxTotal}   kimlik: ${d.distinct}/${d.capacity}   tablo taşması: ${d.dropped}   akış: ${d.stream ? 'açık' : 'kapalı'}`,
      d.hata ? `hata sayaçları: tx_err=${h.txErr} rx_err=${h.rxErr} tx_failed=${h.txFailed} rx_missed=${h.rxMissed} bus_err=${h.busErr} arb_lost=${h.arbLost}` : '',
      h.txErr >= 128 ? 'UYARI: ACK alınamıyor (transceiver / kablo / hız)' : '',
    ].filter(Boolean).join('\n');
    if (d.kbps) $('hiz-sec').value = String(d.kbps);
  }
  $('b-durum').onclick = async () => { try { durumGoster(await kart.durum()); } catch (e) { mesaj(e.message, true); } };
  $('b-reboot').onclick = async () => { mesaj('kart yeniden başlatılıyor, 30 sn…'); await kart.yenidenBaslat(); try { durumGoster(await kart.hazirBekle()); await kart.akis(true); mesaj('kart hazır'); } catch (e) { mesaj(e.message, true); } };

  /* ── hız ─────────────────────────────────────────────────────── */
  $('b-tara').onclick = async () => {
    if (!kart.bagli) return mesaj('önce bağlanın', true);
    $('b-tara').disabled = true; $('tara-sonuc').textContent = 'taranıyor (~20 sn)…'; mesaj('hız taranıyor, hatta görünmez');
    try {
      const r = await kart.tara(4);
      const ozet = Object.entries(r.hizlar).map(([k, v]) => `${k}: ${v}`).join('  ');
      $('tara-sonuc').textContent = r.bulunan ? `bulundu: ${r.bulunan} kbit/s  (${ozet})` : `hiçbir hızda frame yok  (${ozet}) — kontak? CANH/CANL? GND?`;
      durumGoster(await kart.durum()); await kart.akis(true);
      mesaj(r.bulunan ? `hat ${r.bulunan} kbit/s, kalıcı kaydedildi` : 'frame yok', !r.bulunan);
    } catch (e) { mesaj(e.message, true); } finally { $('b-tara').disabled = false; }
  };
  $('b-hiz').onclick = async () => {
    if (!kart.bagli) return mesaj('önce bağlanın', true);
    const k = +$('hiz-sec').value;
    await kart.hizAyarla(k); mesaj(`${k} kbit/s yazıldı, kart yeniden başlıyor…`);
    await kart.yenidenBaslat();
    try { durumGoster(await kart.hazirBekle()); await kart.akis(true); mesaj('kart hazır'); } catch (e) { mesaj(e.message, true); }
  };

  /* ── gönderim ────────────────────────────────────────────────── */
  $('b-tx-ac').onclick = async () => {
    if (!kart.bagli) return mesaj('önce bağlanın', true);
    const zorla = $('c-tx-zorla').checked;
    if (zorla && !confirm('Hız doğrulanmadan gönderim açılacak. Yanlış hızda gönderim araç hattını bozabilir (göstergeler sönebilir). Araçta DEĞİL, yalnız masa testinde kullanın. Devam?')) return;
    const s = await kart.txAc(zorla);
    const hata = s.find(x => x.includes('ERR'));
    if (hata) mesaj(hata.replace('[cmd] ERR: ', ''), true); else { mesaj('gönderim açık'); }
    durumGoster(await kart.durum());
  };
  $('b-tx-kapat').onclick = async () => { tekrarDurdur(); await kart.txKapat(); durumGoster(await kart.durum()); mesaj('gönderim kapatıldı, listen-only'); };

  const sel = $('obd-pid');
  for (const p of OBD.PIDLER) { const o = document.createElement('option'); o.value = p.pid; o.textContent = `${hex2(p.pid)}  ${p.ad}${p.birim ? ' (' + p.birim + ')' : ''}`; sel.appendChild(o); }
  sel.value = 0x0C;
  async function obdSorgula(pid, mod = 1) {
    if (!kart.bagli) return mesaj('önce bağlanın', true);
    if (!durumSon || !durumSon.txAcik) return mesaj('gönderim kapalı: önce "Gönderimi aç"', true);
    const r = await kart.obd(pid, mod);
    const tb = $('t-obd').querySelector('tbody'); const z = new Date().toLocaleTimeString();
    if (r.hata) { mesaj(r.hata.replace('[cmd] ', ''), true); if (/kapali|TEC/.test(r.hata)) durumGoster(await kart.durum()); return; }
    if (!r.cevaplar.length) { tb.insertAdjacentHTML('afterbegin', `<tr><td>${z}</td><td>—</td><td>${hex2(pid)}</td><td colspan="3" class="not">cevap yok</td></tr>`); }
    for (const c of r.cevaplar) {
      const d = OBD.cevapCoz(c) || { ad: '?', deger: '', birim: '', pid };
      tb.insertAdjacentHTML('afterbegin', `<tr><td>${z}</td><td class="mono">${idYaz(c.id, false)}</td><td class="mono">${hex2(d.pid)}</td><td>${d.ad}</td><td><b>${d.deger}</b> ${d.birim}</td><td class="mono">${c.data.map(hex2).join(' ')}</td></tr>`);
    }
    while (tb.rows.length > 200) tb.deleteRow(-1);
  }
  $('b-obd').onclick = () => obdSorgula(+sel.value);
  $('b-obd-ozel').onclick = () => { const p = $('obd-ozel').value.trim().split(/\s+/); if (!p[0]) return; obdSorgula(parseInt(p[0], 16), p[1] ? parseInt(p[1], 16) : 1); };
  $('c-obd-tekrar').onchange = e => {
    if (e.target.checked) { const ms = Math.max(200, +$('obd-aralik').value * 1000); obdTekrar = setInterval(() => { if (!kart._bekleyen) obdSorgula(+sel.value); }, ms); }
    else { clearInterval(obdTekrar); obdTekrar = null; }
  };
  async function hamGonder() {
    if (!kart.bagli) return mesaj('önce bağlanın', true);
    if (!durumSon || !durumSon.txAcik) return mesaj('gönderim kapalı: önce "Gönderimi aç"', true);
    const id = parseInt($('g-kimlik').value.trim().replace(/^0x/i, ''), 16);
    const bayt = $('g-veri').value.trim() ? $('g-veri').value.trim().split(/[\s,]+/).map(h => parseInt(h, 16)) : [];
    if (!Number.isFinite(id) || bayt.some(b => !(b >= 0 && b <= 255)) || bayt.length > 8) return mesaj('kimlik/veri geçersiz (hex, en çok 8 bayt)', true);
    const s = await kart.gonder(id, bayt);
    const son = s[s.length - 1] || 'cevap yok';
    $('g-sonuc').textContent = (new Date().toLocaleTimeString() + '  ' + son.replace('[cmd] ', '') + '\n' + $('g-sonuc').textContent).slice(0, 4000);
    if (son.includes('ERR')) { mesaj(son.replace('[cmd] ERR: ', ''), true); if (/TEC|kapali/.test(son)) { tekrarDurdur(); durumGoster(await kart.durum()); } }
  }
  $('b-gonder').onclick = hamGonder;
  $('c-g-tekrar').onchange = e => {
    if (e.target.checked) { const ms = Math.max(20, +$('g-aralik').value); gTekrar = setInterval(() => { if (!kart._bekleyen) hamGonder(); }, ms); }
    else { clearInterval(gTekrar); gTekrar = null; }
  };
  function tekrarDurdur() {
    if (obdTekrar) { clearInterval(obdTekrar); obdTekrar = null; $('c-obd-tekrar').checked = false; }
    if (gTekrar) { clearInterval(gTekrar); gTekrar = null; $('c-g-tekrar').checked = false; }
  }

  /* ── kayıt ───────────────────────────────────────────────────── */
  $('b-kayit').onclick = () => {
    if (!kayit) { kayit = { bas: Date.now(), satirlar: [] }; $('b-kayit').textContent = 'Kaydı durdur'; $('b-csv').disabled = true; $('b-kayit-sil').disabled = true; $('kayit-ozet').textContent = ''; }
    else { const k = kayit; kayit = null; window._sonKayit = k; $('b-kayit').textContent = 'Kaydı başlat'; $('kayit-durum').textContent = 'kayıt kapalı'; $('b-csv').disabled = !k.satirlar.length; $('b-kayit-sil').disabled = false; $('kayit-ozet').textContent = `${k.satirlar.length} frame, ${((Date.now() - k.bas) / 1000).toFixed(0)} sn`; }
  };
  $('b-csv').onclick = async () => {
    const k = window._sonKayit; if (!k) return;
    const ad = 'can-kayit-' + new Date(k.bas).toISOString().replace(/[:T]/g, '-').slice(0, 19) + '.csv';
    const veri = 'zaman_ms,kimlik,ext,dlc,b0,b1,b2,b3,b4,b5,b6,b7\n' + k.satirlar.join('\n') + '\n';
    const r = await API.kaydet(ad, veri);
    if (r) { mesaj('kaydedildi: ' + r.ad); API.goster(r.yol); }
  };
  $('b-kayit-sil').onclick = () => { window._sonKayit = null; $('b-csv').disabled = true; $('b-kayit-sil').disabled = true; $('kayit-ozet').textContent = ''; };

  /* ── konsol ──────────────────────────────────────────────────── */
  async function konsolGonder() {
    const c = $('k-komut').value.trim(); if (!c) return;
    if (!kart.bagli) return mesaj('önce bağlanın', true);
    konsolYaz('> ' + c); $('k-komut').value = '';
    try { await kart.komut(c, 15000); } catch (e) { konsolYaz('! ' + e.message); }
  }
  $('b-k-gonder').onclick = konsolGonder;
  $('k-komut').onkeydown = e => { if (e.key === 'Enter') konsolGonder(); };
  $('b-k-temizle').onclick = () => { $('konsol').textContent = ''; };

  API.bilgi().then(b => { $('surum').textContent = 'v' + b.surum; });
  if (API.platform === 'web') window.__can = { kart, tablo };   // tarayıcıda geliştirme: sahte satır beslemek için
  window.addEventListener('beforeunload', () => { if (kart.bagli) kart.kapat(); });
})();
