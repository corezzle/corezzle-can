/* Ekran görüntüsü çevirisi: belge görselleri İngilizce olsun diye, çekim anında sayfadaki Türkçe metinleri
   İngilizceye çevirir. Uygulamanın kendisine dokunmaz; yalnız ekran_al.mjs bu dosyayı sayfaya enjekte eder.
   Kart komutları ve CAN satırları (protokol) olduğu gibi kalır. */
(function () {
  const AYNEN = {
    // üst çubuk
    'bağlı değil': 'not connected', 'bağlı': 'connected', 'demo (sahte kart)': 'demo (fake board)', 'rx': 'rx', 'kimlik': 'IDs', 'hız': 'rate', 'hat hatası': 'bus errors',
    'Karta bağlan': 'Connect board', 'Demo (sahte kart)': 'Demo (fake board)', 'Ayır': 'Disconnect', 'NORMAL · gönderim açık': 'NORMAL · TX on',
    'Kart seçin': 'Select board', 'Listede kart yoksa USB kablosunu kontrol edin (veri taşıyan kablo olmalı).': 'If no board is listed, check the USB cable (it must carry data).', 'Vazgeç': 'Cancel',
    // sekmeler
    'Canlı': 'Live', 'Akış': 'Stream', 'Gönder': 'Send', 'Kayıt': 'Record', 'Ayarlar': 'Settings', 'Konsol': 'Console',
    // canlı
    'yalnız değişenler': 'changed only', 'baytları ondalık göster': 'show bytes as decimal', 'Tabloyu temizle': 'Clear table', 'Duraklat': 'Pause', 'Devam': 'Resume',
    'Kimlik': 'ID', 'Tür': 'Type', 'Veri (B0 … B7)': 'Data (B0 … B7)', 'Sayı': 'Count', 'Son': 'Last',
    'Henüz frame yok. Bağlanın; hat canlıysa kimlikler burada akar. Frame gelmiyorsa': 'No frames yet. Connect; if the bus is live, IDs will flow here. If nothing arrives:', 'Ayarlar → Hızı bul': 'Settings → Find bitrate',
    // akış
    'Temizle': 'Clear', 'Son 2000 satır tutulur; tamamı için Kayıt sekmesi.': 'Last 2000 lines are kept; see the Record tab for the full log.',
    // gönder
    'Gönderim kapalı (listen-only).': 'Transmit off (listen-only).',
    'Kart hatta görünmez; bu en güvenli durumdur. Frame göndermek ya da OBD sorgulamak için önce hat hızının doğrulanmış olması gerekir (Canlı sekmesinde frame akıyor olmalı), sonra gönderimi açın.': 'The board is invisible on the bus; this is the safest state. To send frames or query OBD, the bitrate must be verified first (frames flowing in the Live tab), then enable transmit.',
    'Gönderimi aç': 'Enable transmission', 'hız doğrulanmadan zorla (yalnız masa testi)': 'force without verified bitrate (bench test only)',
    'Gönderim açık (NORMAL mod).': 'Transmit on (NORMAL mode).', 'Kart hattaki frame\'leri onaylıyor ve gönderebiliyor. ACK alınamazsa kart kendini listen-only\'ye alır.': 'The board acknowledges frames on the bus and can send. If no ACK is received, the board drops back to listen-only by itself.',
    'Gönderimi kapat': 'Disable transmission', 'OBD-II sorgu': 'OBD-II query', 'Sorgula': 'Query', 'her': 'every', 'sn tekrarla': 's repeat', 'ms tekrarla': 'ms repeat',
    'Zaman': 'Time', 'Ad': 'Name', 'Değer': 'Value', 'Ham': 'Raw', 'Ham frame gönder': 'Send raw frame', 'Veri (hex)': 'Data (hex)', 'Bir kez gönder': 'Send once',
    'Kimlik 0x7FF\'ten büyükse 29 bit (genişletilmiş) gönderilir. Araç hattına frame basmak sorumluluk ister; standart OBD-II sorguları (0x7DF) dışında ne gönderdiğinizi bildiğinizden emin olun.': 'IDs above 0x7FF are sent as 29-bit (extended). Putting frames on a vehicle bus is a responsibility; outside standard OBD-II queries (0x7DF), be sure you know what you are sending.',
    // kayıt
    'Oturum kaydı': 'Session recording', 'Kaydı başlat': 'Start recording', 'Kaydı durdur': 'Stop recording', 'kayıt kapalı': 'not recording', 'CSV olarak kaydet': 'Save as CSV', 'Kaydı at': 'Discard',
    'Kayıt sırasında her frame bellekte tutulur (zaman, kimlik, veri). Durdurunca CSV olarak kaydedebilirsiniz. Biçim:': 'While recording, every frame is kept in memory (time, ID, data). When you stop, you can save it as CSV. Format:', '— Excel, Python ve SavvyCAN ile açılır.': '— opens in Excel, Python and SavvyCAN.',
    // ayarlar
    'Hat hızı': 'Bitrate', 'Hız bilinmiyorsa': 'If the bitrate is unknown:', 'Hızı bul': 'Find bitrate',
    ': kart 500/250/125/1000 kbit/s\'i sırayla, hatta görünmeden dinler; frame gelen hızı seçip kalıcı kaydeder (~20 sn).': ' the board listens at 500/250/125/1000 kbit/s in turn, invisible on the bus; it picks the bitrate with traffic and stores it permanently (~20 s).',
    'Elle:': 'Manual:', 'Ayarla ve yeniden başlat': 'Set and reboot', 'Kart durumu': 'Board status', 'Yenile': 'Refresh', 'Kartı yeniden başlat': 'Reboot board', 'Bağlantı notları': 'Wiring notes',
    'Kart ↔ transceiver: 3,3 V, GND, TXD → GPIO4, RXD → GPIO6. Transceiver ↔ araç: CANH (OBD pin 6), CANL (OBD pin 14), GND (OBD pin 4/5).': 'Board ↔ transceiver: 3.3 V, GND, TXD → GPIO4, RXD → GPIO6. Transceiver ↔ vehicle: CANH (OBD pin 6), CANL (OBD pin 14), GND (OBD pin 4/5).',
    'Hiç frame gelmiyorsa en sık sebep CANH/CANL\'nin ters olması ya da GND\'nin bağlanmamasıdır.': 'If no frames arrive at all, the most common causes are swapped CANH/CANL or a missing GND.',
    'Her açılışta kart listen-only başlar; gönderim yalnız bu uygulamadan ve oturumluk açılır.': 'The board starts in listen-only on every boot; transmit is enabled only from this app and only for the session.',
    // alt çubuk mesajları
    'demo: sahte hat 500 kbit/s, kart 250 ile başlar; Ayarlar → Hızı bul ile deneyin': 'demo: fake bus at 500 kbit/s, board starts at 250; try Settings → Find bitrate',
    'frame gelmiyor: kontak açık mı? Hız doğru mu? Ayarlar → Hızı bul': 'no frames: ignition on? Bitrate right? Settings → Find bitrate',
    'hız taranıyor, hatta görünmez': 'scanning bitrates, invisible on the bus', 'taranıyor (~20 sn)…': 'scanning (~20 s)…', 'gönderim açık': 'transmit on', 'gönderim kapatıldı, listen-only': 'transmit off, listen-only',
    'kart hazır': 'board ready', 'önce bağlanın': 'connect first', 'frame yok': 'no frames', 'ayrıldı': 'disconnected', 'USB bağlantısı koptu': 'USB connection lost',
  };
  const PID = { 'Desteklenen PID\'ler (01-20)': 'Supported PIDs (01-20)', 'Motor yükü': 'Engine load', 'Soğutma sıvısı sıcaklığı': 'Coolant temperature', 'Emme manifoldu basıncı': 'Intake manifold pressure', 'Motor devri': 'Engine speed', 'Araç hızı': 'Vehicle speed', 'Emme havası sıcaklığı': 'Intake air temperature', 'Hava kütle akışı (MAF)': 'Mass air flow (MAF)', 'Gaz kelebeği konumu': 'Throttle position', 'Motor çalışma süresi': 'Run time since engine start', 'Arıza ışığı yanalı mesafe': 'Distance with MIL on', 'Yakıt seviyesi': 'Fuel level', 'Barometrik basınç': 'Barometric pressure', 'Kontrol modülü voltajı': 'Control module voltage', 'Ortam sıcaklığı': 'Ambient air temperature', 'Motor yağı sıcaklığı': 'Engine oil temperature', 'Yakıt tüketim hızı': 'Fuel rate' };
  const BIRIM = { 'd/dk': 'rpm', 'km/sa': 'km/h', 'L/sa': 'L/h' };
  const DESEN = [
    // uygulama dinamik metinleri
    [/^(demo|bağlandı): (\d+) kbit\/s, (gönderim açık|listen-only)$/, (m, a, k, t) => `${a === 'demo' ? 'demo' : 'connected'}: ${k} kbit/s, ${t === 'listen-only' ? 'listen-only' : 'transmit on'}`],
    [/^hat (\d+) kbit\/s, kalıcı kaydedildi$/, 'bus $1 kbit/s, stored permanently'],
    [/^bulundu: (\d+) kbit\/s/, 'found: $1 kbit/s'], [/^hiçbir hızda frame yok/, 'no frames at any bitrate'],
    [/^kayıt sürüyor: (\d+) frame, (\d+) sn$/, 'recording: $1 frames, $2 s'], [/^(\d+) frame, (\d+) sn$/, '$1 frames, $2 s'], [/^kaydedildi: /, 'saved: '],
    [/^hız: (\S+) kbit\/s\s+denetleyici: (\S+)\s+mod: (.*)$/m, 'bitrate: $1 kbit/s   controller: $2   mode: $3'],
    [/^alınan: (\d+)\s+kimlik: (\S+)\s+tablo taşması: (\d+)\s+akış: (açık|kapalı)$/m, (m, a, b, c, d) => `received: ${a}   IDs: ${b}   table overflow: ${c}   stream: ${d === 'açık' ? 'on' : 'off'}`],
    [/^hata sayaçları: /m, 'error counters: '], [/^UYARI: ACK alınamıyor \(transceiver \/ kablo \/ hız\)$/m, 'WARNING: no ACK (transceiver / cable / bitrate)'],
    [/^(\d+) kbit\/s yazıldı, kart yeniden başlıyor…$/, '$1 kbit/s written, board restarting…'], [/^kart yeniden başlatılıyor, 30 sn…$/, 'board restarting, 30 s…'],
    [/^bağlanıyor… kart açılışı 30 sn sürebilir$/, 'connecting… board boot can take 30 s'], [/^gönderim kapalı: önce "Gönderimi aç"$/, 'transmit off: use "Enable transmission" first'],
    // sahte kart cevapları (konsolda görünür)
    [/\(sahte kart\)/g, '(fake board)'], [/Kart bilgisi\s+SAHTE-KART/g, 'Board info        FAKE-BOARD'],
    [/NORMAL: gonderim acik/g, 'NORMAL: transmit on'], [/LISTEN-ONLY: hatta gorunmez/g, 'LISTEN-ONLY: invisible on the bus'], [/ekran D-hatlari devralindi/g, 'display D-lines taken over'],
    [/^(\[cmd\]\s+)hata: /gm, '$1errors: '], [/tx_kuyruk=/g, 'tx_queue='], [/-> ACK YOK: transceiver\/kablo\/hiz/g, '-> NO ACK: transceiver/cable/bitrate'],
    [/can scan: her hiz (\d+) sn, listen-only \(hatta gorunmez\)\.\.\./g, 'can scan: each bitrate $1 s, listen-only (invisible on the bus)...'], [/ frame \(hata var\)/g, ' frames (errors)'], [/^(\[cmd\]\s+\d+ kbit\/s: \d+) frame$/gm, '$1 frames'],
    [/hat (\d+) kbit\/s \((\d+) frame\/(\d+) sn\)\. Kalici yazildi, bu hizda dinleniyor\. Sorgu icin: set can tx on/g, 'bus $1 kbit/s ($2 frames/$3 s). Stored permanently, listening at this bitrate. To query: set can tx on'],
    [/can bitrate=(\d+) kbps \(kalici, reboot gerekli\)/g, 'can bitrate=$1 kbps (persistent, reboot required)'],
    [/can tx=on \(NORMAL mod: ACK \+ gonderim\)/g, 'can tx=on (NORMAL mode: ACK + transmit)'], [/can tx=off \(LISTEN-ONLY: hatta gorunmez\)/g, 'can tx=off (LISTEN-ONLY: invisible on the bus)'],
    [/once pasif dinlemede frame gorulmeli \(rx_total=0, bus_err=0\)\. Hiz dogru mu\? Zorlamak: set can tx force/g, 'frames must be seen in passive listening first (rx_total=0, bus_err=0). Bitrate right? To force: set can tx force'],
    [/can stream=(on|off) \(satir: CAN,<ms>,<0xID>,<ext>,<dlc>,<baytlar>\)/g, 'can stream=$1 (line: CAN,<ms>,<0xID>,<ext>,<dlc>,<bytes>)'],
    [/can tablo bosaltildi/g, 'can table cleared'], [/can: tablo bos/g, 'can: table empty'], [/(\d+) kimlik listelendi \(en taze ustte\)/g, '$1 IDs listed (newest first)'], [/ ms once$/gm, ' ms ago'],
    [/OBD istek 0x7DF \[([0-9A-F ]+)\] gonderildi, cevap bekleniyor\.\.\./g, 'OBD request 0x7DF [$1] sent, waiting for reply...'],
    [/cevap yok \(1,5 sn icinde 0x7E8-0x7EF gelmedi: kontak\? hiz\? gateway\?\)/g, 'no reply (nothing from 0x7E8-0x7EF within 1.5 s: ignition? bitrate? gateway?)'],
    [/^(\[cmd\]\s+)cevap 0x/gm, '$1reply 0x'], [/obd bitti \((\d+) cevap\)/g, 'obd done ($1 replies)'],
    [/gonderim kapali \(listen-only\)\. Once pasif dinlemede frame gor, sonra: set can tx on/g, 'transmit off (listen-only). See frames in passive listening first, then: set can tx on'],
    [/gonderim kapali \(listen-only\)\. Once: set can tx on/g, 'transmit off (listen-only). First: set can tx on'],
    [/sahte kart: get can/g, 'fake board: get can'], [/desteklenen hizlar 125\/250\/500\/1000/g, 'supported bitrates 125/250/500/1000'], [/bilinmeyen komut \(fake board\): /g, 'unknown command (fake board): '],
  ];
  const OZNITELIK = { 'kimlik süz (örn. 208, 7E8)': 'filter ID (e.g. 208, 7E8)', 'süz (kimlik ya da bayt)': 'filter (ID or byte)', 'özel: pid [mod] hex, örn. 0C 01': 'custom: pid [mode] hex, e.g. 0C 01', 'karta komut (örn. help, get can, can dump 20)': 'board command (e.g. help, get can, can dump 20)', 'toplam alınan frame': 'frames received in total', 'farklı kimlik': 'distinct IDs', 'saniyedeki frame': 'frames per second', 'Donanım olmadan dene: yazılım içinde kartı taklit eden sahte hat': 'Try without hardware: a fake bus inside the app that imitates the board' };
  const pidAdi = s => { let r = s; for (const [tr, en] of Object.entries(PID)) r = r.split(tr).join(en); for (const [tr, en] of Object.entries(BIRIM)) r = r.replace('(' + tr + ')', '(' + en + ')').replace(new RegExp('\\b' + tr.replace('/', '\\/') + '\\b'), en); return r; };
  function cevir(s) {
    const anahtar = s.replace(/\s+/g, ' ').trim(); if (!anahtar) return s;
    if (AYNEN[anahtar] !== undefined) return s.replace(/^(\s*)[\s\S]*?(\s*)$/, (m, a, b) => a + AYNEN[anahtar] + b);
    let r = pidAdi(s); for (const [re, yer] of DESEN) r = r.replace(re, yer); return r;
  }
  let mesgul = false;
  function hepsi() {
    if (mesgul) return; mesgul = true;
    try {
      const yur = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); const dugumler = []; let n; while ((n = yur.nextNode())) dugumler.push(n);
      for (const d of dugumler) { if (d.parentNode && d.parentNode.tagName === 'SCRIPT') continue; const y = cevir(d.nodeValue); if (y !== d.nodeValue) d.nodeValue = y; }
      for (const el of document.querySelectorAll('[placeholder],[title]')) for (const a of ['placeholder', 'title']) { const v = el.getAttribute(a); if (v && OZNITELIK[v]) el.setAttribute(a, OZNITELIK[v]); }
    } finally { mesgul = false; }
  }
  hepsi();
  new MutationObserver(hepsi).observe(document.body, { subtree: true, childList: true, characterData: true });
  window.__ceviri = hepsi;
})();
