/*
 * Corezzle CAN — OBD-II (SAE J1979, mod 01) yaygın PID çözümleri ve hazır sorgu listesi.
 * Cevap biçimi (ISO 15765 tek frame): [uzunluk, 0x41, pid, A, B, C, D]
 */
(function (kok) {
  'use strict';
  const PIDLER = [
    { pid: 0x00, ad: 'Desteklenen PID\'ler (01-20)', birim: '', coz: d => d.map(b => b.toString(2).padStart(8, '0')).join(' ') },
    { pid: 0x04, ad: 'Motor yükü', birim: '%', coz: d => (d[0] * 100 / 255).toFixed(1) },
    { pid: 0x05, ad: 'Soğutma sıvısı sıcaklığı', birim: '°C', coz: d => (d[0] - 40) },
    { pid: 0x0B, ad: 'Emme manifoldu basıncı', birim: 'kPa', coz: d => d[0] },
    { pid: 0x0C, ad: 'Motor devri', birim: 'd/dk', coz: d => ((d[0] * 256 + d[1]) / 4).toFixed(0) },
    { pid: 0x0D, ad: 'Araç hızı', birim: 'km/sa', coz: d => d[0] },
    { pid: 0x0F, ad: 'Emme havası sıcaklığı', birim: '°C', coz: d => (d[0] - 40) },
    { pid: 0x10, ad: 'Hava kütle akışı (MAF)', birim: 'g/s', coz: d => ((d[0] * 256 + d[1]) / 100).toFixed(2) },
    { pid: 0x11, ad: 'Gaz kelebeği konumu', birim: '%', coz: d => (d[0] * 100 / 255).toFixed(1) },
    { pid: 0x1F, ad: 'Motor çalışma süresi', birim: 's', coz: d => d[0] * 256 + d[1] },
    { pid: 0x21, ad: 'Arıza ışığı yanalı mesafe', birim: 'km', coz: d => d[0] * 256 + d[1] },
    { pid: 0x2F, ad: 'Yakıt seviyesi', birim: '%', coz: d => (d[0] * 100 / 255).toFixed(1) },
    { pid: 0x33, ad: 'Barometrik basınç', birim: 'kPa', coz: d => d[0] },
    { pid: 0x42, ad: 'Kontrol modülü voltajı', birim: 'V', coz: d => ((d[0] * 256 + d[1]) / 1000).toFixed(2) },
    { pid: 0x46, ad: 'Ortam sıcaklığı', birim: '°C', coz: d => (d[0] - 40) },
    { pid: 0x5C, ad: 'Motor yağı sıcaklığı', birim: '°C', coz: d => (d[0] - 40) },
    { pid: 0x5E, ad: 'Yakıt tüketim hızı', birim: 'L/sa', coz: d => ((d[0] * 256 + d[1]) / 20).toFixed(2) },
  ];
  const HARITA = Object.fromEntries(PIDLER.map(p => [p.pid, p]));

  /** Bir cevap frame'ini (0x7E8..0x7EF) çöz: {ecu, mod, pid, ad, deger, birim, ham} ya da null */
  function cevapCoz(frame) {
    const d = frame.data || [];
    if (d.length < 3) return null;
    const uz = d[0], mod = d[1];
    if (mod === 0x7F) return { ecu: frame.id, mod, pid: d[2], ad: 'Olumsuz cevap', deger: 'NRC 0x' + (d[3] || 0).toString(16).padStart(2, '0'), birim: '', ham: d };
    if ((mod & 0x40) !== 0x40) return null;
    const pid = d[2]; const veri = d.slice(3, 1 + uz);
    const t = HARITA[pid];
    return {
      ecu: frame.id, mod: mod - 0x40, pid,
      ad: t ? t.ad : `PID 0x${pid.toString(16).padStart(2, '0')}`,
      deger: t ? t.coz(veri) : veri.map(b => b.toString(16).padStart(2, '0')).join(' '),
      birim: t ? t.birim : '', ham: d,
    };
  }

  const disari = { PIDLER, HARITA, cevapCoz };
  kok.OBD = disari;
  if (typeof module !== 'undefined' && module.exports) module.exports = disari;
})(typeof window !== 'undefined' ? window : globalThis);
