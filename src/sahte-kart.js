/*
 * Corezzle CAN — sahte kart (demo modu). Donanım yokken uygulamayı denemek için.
 * Web Serial port nesnesini taklit eder: open/close/setSignals/readable/writable.
 * Gerçek NAR firmware'inin komut cevaplarını birebir biçimde üretir; hat 500 kbit/s'te
 * "Peugeot 208 benzeri" birkaç kimlik yayınlar (devir/hız baytları değişir), OBD-II sorgularına
 * 0x7E8'den cevap verir, yanlış hızda frame vermez. Gerçek araç verisi DEĞİLDİR.
 */
(function (kok) {
  'use strict';
  const HAT_HIZI = 500;        // sahte aracın gerçek hızı

  class SahtePort {
    constructor() {
      this.kbps = 250; this.txOn = false; this.stream = false; this.rx = 0; this.tabloSayac = {};
      this.hata = { txErr: 0, busErr: 0, txFailed: 0 };
      this.ms = 0; this.devir = 820; this.hiz = 0; this.zamanlayici = null; this.acik = false;
      this._kuyruk = []; this._bekleyen = null;
      this.readable = new ReadableStream({ pull: ctrl => this._cek(ctrl) });
      this.writable = new WritableStream({ write: parca => this._yaz(parca) });
      this._enc = new TextEncoder(); this._dec = new TextDecoder(); this._giris = '';
    }
    async open() { this.acik = true; this._emit('ESP-ROM:esp32s3 (sahte kart)\n'); setTimeout(() => this._acilis(), 300); }
    async close() { this.acik = false; clearInterval(this.zamanlayici); }
    async setSignals() {}
    getInfo() { return { usbVendorId: 0x303a, usbProductId: 0x1001 }; }

    _acilis() {
      this._emit(`I (6455) twai: init OK (${this.kbps} kbit/s, ${this.txOn ? 'NORMAL: gonderim acik' : 'LISTEN-ONLY: hatta gorunmez'}, tx=4 rx=6, ekran D-hatlari devralindi)\n`);
      this._emit('[PASS ] Kart bilgisi       SAHTE-KART  MAC 00:11:22:33:44:55\n');
      clearInterval(this.zamanlayici);
      this.zamanlayici = setInterval(() => this._tik(), 50);
    }
    _emit(s) { this._kuyruk.push(this._enc.encode(s)); if (this._bekleyen) { const c = this._bekleyen; this._bekleyen = null; this._cek(c); } }
    _cek(ctrl) { if (this._kuyruk.length) ctrl.enqueue(this._kuyruk.shift()); else this._bekleyen = ctrl; }
    _yaz(parca) {
      this._giris += this._dec.decode(parca);
      let i; while ((i = this._giris.indexOf('\n')) >= 0) { const s = this._giris.slice(0, i).replace(/\r$/, '').trim(); this._giris = this._giris.slice(i + 1); if (s) this._komut(s); }
    }

    /* 50 ms'de bir: hat canlıysa ve hız doğruysa frame üret */
    _tik() {
      this.ms += 50;
      if (this.kbps !== HAT_HIZI) return;
      // sürüş benzetimi: devir ve hız yavaşça dalgalanır
      this.devir += (Math.random() - 0.5) * 120; this.devir = Math.max(750, Math.min(3200, this.devir));
      this.hiz += (Math.random() - 0.48) * 2; this.hiz = Math.max(0, Math.min(120, this.hiz));
      const rpmRaw = Math.round(this.devir * 4), hizRaw = Math.round(this.hiz);
      const frames = [
        [0x208, [rpmRaw >> 8 & 0xff, rpmRaw & 0xff, 0x32, 0x00, Math.round(this.devir / 40), 0x32, 0x32, 0x32]],
        [0x348, [0x00, hizRaw, 0x36, 0x39, 0x01, 0x03, 0x66, 0x00]],
        [0x2F5, [0xAD, 0x00, 0x00, 0x00, 0x02, 0x00, 0x11]],
        [0x432, [0x81, 0x1D, 0x48, 0x1E, 0x00, 0x0D, 0x01, (this.ms / 1000 | 0) & 0xff]],
        [0x18FEF100, [0x00, hizRaw, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]],
      ];
      // her 50 ms'de 0x208 ve 0x348 (20 Hz), diğerleri seyrek
      const sec = [frames[0], frames[1]]; if (this.ms % 200 === 0) sec.push(frames[2], frames[3]); if (this.ms % 1000 === 0) sec.push(frames[4]);
      for (const [id, d] of sec) this._frame(id, d);
    }
    _frame(id, d) {
      this.rx++; this.tabloSayac[id] = (this.tabloSayac[id] || 0) + 1; this._sonVeri = this._sonVeri || {}; this._sonVeri[id] = d;
      if (this.stream) this._emit(`CAN,${this.ms},0x${id.toString(16).toUpperCase().padStart(8, '0')},${id > 0x7ff ? 1 : 0},${d.length},${d.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ')}\n`);
    }
    _durum() {
      const kimlik = Object.keys(this.tabloSayac).length;
      this._emit(`[cmd] OK: can bitrate=${this.kbps} kbps twai=running mod=${this.txOn ? 'NORMAL(tx on)' : 'LISTEN-ONLY'} rx_total=${this.rx} distinct=${kimlik}/96 dropped=0 stream=${this.stream ? 'on' : 'off'}\n`);
      this._emit(`[cmd]     hata: tx_err=${this.hata.txErr} rx_err=0 tx_failed=${this.hata.txFailed} rx_missed=0 bus_err=${this.hata.busErr} arb_lost=0 tx_kuyruk=0${this.hata.txErr >= 128 ? '  -> ACK YOK: transceiver/kablo/hiz' : ''}\n`);
    }
    _komut(s) {
      const p = s.split(/\s+/); const k = p[0].toLowerCase();
      const ok = t => this._emit('[cmd] OK: ' + t + '\n'), err = t => this._emit('[cmd] ERR: ' + t + '\n');
      if (k === 'get' && p[1] === 'can') return this._durum();
      if (k === 'help') return ok('sahte kart: get can | can stream|scan|obd|send|dump|clear|stats | set can bitrate|tx | reboot');
      if (k === 'reboot') { ok('rebooting...'); this.txOn = false; this.stream = false; this.rx = 0; this.tabloSayac = {}; clearInterval(this.zamanlayici); setTimeout(() => this._acilis(), 1500); return; }
      if (k === 'set' && p[1] === 'can' && p[2] === 'bitrate') { const v = +p[3]; if (![125, 250, 500, 1000].includes(v)) return err('desteklenen hizlar 125/250/500/1000'); this.kbps = v; return ok(`can bitrate=${v} kbps (kalici, reboot gerekli)`); }
      if (k === 'set' && p[1] === 'can' && p[2] === 'tx') {
        const v = (p[3] || '').toLowerCase();
        if (v === 'off') { this.txOn = false; return ok('can tx=off (LISTEN-ONLY: hatta gorunmez)'); }
        if (v === 'on' && this.rx === 0) return err(`once pasif dinlemede frame gorulmeli (rx_total=0, bus_err=0). Hiz dogru mu? Zorlamak: set can tx force`);
        if (v === 'on' || v === 'force') { this.txOn = true; return ok('can tx=on (NORMAL mod: ACK + gonderim)'); }
        return err('set can tx on|off|force');
      }
      if (k === 'can') {
        const alt = (p[1] || '').toLowerCase();
        if (alt === 'stats') return this._durum();
        if (alt === 'stream') { this.stream = p[2] === 'on'; return ok(`can stream=${this.stream ? 'on' : 'off'} (satir: CAN,<ms>,<0xID>,<ext>,<dlc>,<baytlar>)`); }
        if (alt === 'clear') { this.tabloSayac = {}; this.rx = 0; return ok('can tablo bosaltildi'); }
        if (alt === 'dump') { const ids = Object.keys(this.tabloSayac); if (!ids.length) return this._emit('[cmd] can: tablo bos\n'); for (const id of ids) { const d = this._sonVeri[id]; this._emit(`[cmd]   0x${(+id).toString(16).toUpperCase().padStart(8, '0')},${d.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(',')}  n=${this.tabloSayac[id]}  3 ms once\n`); } return ok(`${ids.length} kimlik listelendi (en taze ustte)`); }
        if (alt === 'scan') {
          const sn = Math.max(2, Math.min(30, +p[2] || 4)); const eski = this.kbps;
          this._emit(`[cmd] can scan: her hiz ${sn} sn, listen-only (hatta gorunmez)...\n`);
          const hizlar = [500, 250, 125, 1000]; let i = 0;
          const adim = () => {
            if (i < hizlar.length) {
              const h = hizlar[i++]; const n = h === HAT_HIZI ? Math.round(sn * 45) : 0;
              this._emit(`[cmd]   ${String(h).padStart(4)} kbit/s: ${n} frame${h === HAT_HIZI ? '' : ' (hata var)'}\n`);
              setTimeout(adim, 400); return;
            }
            this.kbps = HAT_HIZI; this.rx += 10; this.tabloSayac[0x208] = (this.tabloSayac[0x208] || 0) + 10; this._sonVeri = this._sonVeri || {}; this._sonVeri[0x208] = [0x0C, 0xD0, 0x32, 0, 0x14, 0x32, 0x32, 0x32];
            ok(`hat ${HAT_HIZI} kbit/s (${Math.round(sn * 45)} frame/${sn} sn). Kalici yazildi, bu hizda dinleniyor. Sorgu icin: set can tx on`);
            void eski;
          };
          setTimeout(adim, 300); return;
        }
        if (alt === 'send') {
          if (!this.txOn) return err('gonderim kapali (listen-only). Once: set can tx on');
          if (this.kbps !== HAT_HIZI) { this.hata.txErr = 128; this.hata.busErr += 900; return err('can send: ESP_ERR_INVALID_RESPONSE'); }
          const m = (p[2] || '').match(/^0x([0-9a-f]+)/i); return ok(`can send id=0x${(m ? parseInt(m[1], 16) : 0).toString(16).toUpperCase().padStart(8, '0')} dlc=${((p[2] || '').split(',').length - 1)}`);
        }
        if (alt === 'obd') {
          if (!this.txOn) return err('gonderim kapali (listen-only). Once pasif dinlemede frame gor, sonra: set can tx on');
          const pid = parseInt(p[2] || '0', 16), mod = parseInt(p[3] || '01', 16);
          this._emit(`[cmd] .. OBD istek 0x7DF [02 ${mod.toString(16).padStart(2, '0').toUpperCase()} ${pid.toString(16).padStart(2, '0').toUpperCase()}] gonderildi, cevap bekleniyor...\n`);
          setTimeout(() => {
            if (this.kbps !== HAT_HIZI) { this._emit('[cmd]   cevap yok (1,5 sn icinde 0x7E8-0x7EF gelmedi: kontak? hiz? gateway?)\n'); return ok('obd bitti (0 cevap)'); }
            const r = Math.round(this.devir * 4), cevap = {
              0x00: [6, 0x41, 0x00, 0xBE, 0x3E, 0xB8, 0x11], 0x04: [3, 0x41, 0x04, Math.round(this.devir / 14)],
              0x05: [3, 0x41, 0x05, 0x5A + Math.round(Math.random() * 3)], 0x0C: [4, 0x41, 0x0C, r >> 8 & 0xff, r & 0xff],
              0x0D: [3, 0x41, 0x0D, Math.round(this.hiz)], 0x0F: [3, 0x41, 0x0F, 0x3C], 0x11: [3, 0x41, 0x11, Math.round(this.devir / 20)],
              0x2F: [3, 0x41, 0x2F, 0x9A], 0x42: [4, 0x41, 0x42, 0x37, 0x8C], 0x46: [3, 0x41, 0x46, 0x3B], 0x5C: [3, 0x41, 0x5C, 0x66],
            }[pid] || [3, 0x7F, mod, 0x12];
            const d = cevap.concat(Array(8 - cevap.length).fill(0));
            this._frame(0x7E8, d);
            this._emit(`[cmd]   cevap 0x000007E8,${d.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(',')}  n=1  12 ms once\n`);
            ok('obd bitti (1 cevap)');
          }, 150);
          return;
        }
      }
      err('bilinmeyen komut (sahte kart): ' + s);
    }
  }

  kok.SAHTE_KART = { SahtePort };
})(typeof window !== 'undefined' ? window : globalThis);
