/*
 * Corezzle CAN — kartla konuşma (NarRTOS komut arayüzü, USB seri).
 *
 * Kart tarafı (embedded-wear-os, NAR derlemesi) şu komutları tanır:
 *   get can                 durum: bitrate, mod, sayaçlar, akış
 *   can stream on|off       her frame'i satır olarak akıt:  CAN,<ms>,<0xID>,<ext>,<dlc>,<B0 B1 ...>
 *   can scan [sn]           hat hızını bul (listen-only), bulunan kalıcı yazılır
 *   set can bitrate <kbps>  125|250|500|1000 (kalıcı, reboot ister)
 *   set can tx on|off|force gönderimi aç (NORMAL mod) / kapat (LISTEN-ONLY)
 *   can send 0xID,b0,..,b7  tek frame gönder
 *   can obd <pid> [mod]     OBD-II isteği (0x7DF), cevap satırları "cevap 0x000007E8,..."
 *   can dump|stats|clear    tablo / sayaçlar / temizle
 *   reboot
 * Kartın her cevabı "[cmd] " ile başlar; "[cmd] OK:" ya da "[cmd] ERR:" satırı komutun sonudur,
 * "[cmd] .." ara bildirimdir (örn. OBD isteği gönderildi, cevap bekleniyor).
 * Bu dosya hem uygulamada (window.KART) hem node testlerinde (module.exports) çalışır; test için
 * seri port yerine sahte bir port (write/read) verilebilir.
 */
(function (kok) {
  'use strict';
  const VID_ESP = 0x303a;                 // Espressif USB-Serial-JTAG

  /** "CAN,12345,0x00000208,0,8,17 29 32 00 4C 32 32 32" → nesne ya da null */
  function satirCoz(s) {
    if (!s.startsWith('CAN,')) return null;
    const p = s.split(',');
    if (p.length < 6) return null;
    const id = parseInt(p[2], 16);
    if (!Number.isFinite(id)) return null;
    const bayt = p[5].trim() ? p[5].trim().split(/\s+/).map(h => parseInt(h, 16)) : [];
    return { ms: +p[1], id, ext: p[3] === '1', dlc: +p[4], data: bayt };
  }

  /** "[cmd] OK: can bitrate=500 kbps twai=running mod=LISTEN-ONLY rx_total=12 distinct=3/96 dropped=0 stream=on" */
  function durumCoz(satirlar) {
    const d = {};
    for (const s of satirlar) {
      let m;
      if ((m = s.match(/bitrate=(\d+)/))) d.kbps = +m[1];
      if ((m = s.match(/twai=([a-z-]+)/))) d.twai = m[1];
      if ((m = s.match(/mod=([A-Z-]+(?:\(tx on\))?)/))) d.mod = m[1];
      if ((m = s.match(/rx_total=(\d+)/))) d.rxTotal = +m[1];
      if ((m = s.match(/distinct=(\d+)\/(\d+)/))) { d.distinct = +m[1]; d.capacity = +m[2]; }
      if ((m = s.match(/dropped=(\d+)/))) d.dropped = +m[1];
      if ((m = s.match(/stream=(on|off)/))) d.stream = m[1] === 'on';
      if ((m = s.match(/tx_err=(\d+) rx_err=(\d+) tx_failed=(\d+) rx_missed=(\d+) bus_err=(\d+) arb_lost=(\d+)/)))
        d.hata = { txErr: +m[1], rxErr: +m[2], txFailed: +m[3], rxMissed: +m[4], busErr: +m[5], arbLost: +m[6] };
    }
    d.txAcik = !!(d.mod && d.mod.startsWith('NORMAL'));
    return d;
  }

  /** "[cmd]     500 kbit/s: 2366 frame" satırlarından {500: 2366, ...}; "OK: hat 500 kbit/s" → bulunan */
  function taramaCoz(satirlar) {
    const sonuc = { hizlar: {}, bulunan: null };
    for (const s of satirlar) {
      let m;
      if ((m = s.match(/(\d+) kbit\/s:\s+(\d+) frame/))) sonuc.hizlar[+m[1]] = +m[2];
      if ((m = s.match(/OK: hat (\d+) kbit\/s/))) sonuc.bulunan = +m[1];
    }
    return sonuc;
  }

  /** "[cmd]   cevap 0x000007E8,04,41,0C,1A,F8,00,00,00  n=1 ..." → {id, data[]} listesi */
  function obdCevapCoz(satirlar) {
    const out = [];
    for (const s of satirlar) {
      const m = s.match(/cevap (0x[0-9A-Fa-f]{8}),([0-9A-Fa-f,]+)/);
      if (m) out.push({ id: parseInt(m[1], 16), data: m[2].split(',').map(h => parseInt(h, 16)) });
    }
    return out;
  }

  class Kart {
    constructor() {
      this.port = null; this.okur = null; this.kapaniyor = false;
      this.kalan = '';
      this.onFrame = null;      // (frame) → her CAN satırı
      this.onSatir = null;      // (satir) → diğer tüm satırlar (konsol)
      this.onKopma = null;      // () → port gitti
      this._bekleyen = null;    // { satirlar, coz, zaman }
    }

    get bagli() { return !!this.port; }

    /** Web Serial port nesnesiyle bağlan; kart USB açılışında sıfırlanabilir, hazır olana dek bekleriz. */
    async bagla(port) {
      this.port = port; this.kapaniyor = false; this.kalan = '';
      await port.open({ baudRate: 115200, bufferSize: 262144 });
      try { await port.setSignals({ dataTerminalReady: false, requestToSend: false }); } catch (_) { /* bazı sürücüler desteklemez */ }
      this._oku();
    }

    async _oku() {
      const dec = new TextDecoder('utf-8', { fatal: false });
      try {
        while (!this.kapaniyor && this.port && this.port.readable) {
          this.okur = this.port.readable.getReader();
          try {
            for (;;) {
              const { value, done } = await this.okur.read();
              if (done) break;
              this._metin(dec.decode(value, { stream: true }));
            }
          } catch (e) {
            if (!this.port || !this.port.readable) throw e;
          } finally { try { this.okur.releaseLock(); } catch (_) {} }
        }
      } catch (_) {
        // port gitti
      }
      if (!this.kapaniyor) { this.port = null; if (this.onKopma) this.onKopma(); }
    }

    _metin(t) {
      this.kalan += t;
      let i;
      while ((i = this.kalan.indexOf('\n')) >= 0) {
        const satir = this.kalan.slice(0, i).replace(/\r$/, '');
        this.kalan = this.kalan.slice(i + 1);
        this._satir(satir);
      }
      if (this.kalan.length > 65536) this.kalan = this.kalan.slice(-4096);   // çöp birikmesin
    }

    _satir(s) {
      if (s.startsWith('CAN,')) {
        const f = satirCoz(s);
        if (f && this.onFrame) this.onFrame(f);
        return;
      }
      if (this._bekleyen && s.startsWith('[cmd]')) {
        this._bekleyen.satirlar.push(s);
        if (/\[cmd\] (OK|ERR)[: ]/.test(s)) { const b = this._bekleyen; this._bekleyen = null; b.coz(b.satirlar); }
      }
      if (this.onSatir) this.onSatir(s);
    }

    async yaz(metin) {
      if (!this.port || !this.port.writable) throw new Error('kart bağlı değil');
      const y = this.port.writable.getWriter();
      try { await y.write(new TextEncoder().encode(metin)); } finally { y.releaseLock(); }
    }

    /** Bir komut gönder, "[cmd] OK/ERR" satırına kadar cevapları topla. */
    komut(cmd, zamanMs = 8000) {
      return new Promise((coz, red) => {
        if (this._bekleyen) { red(new Error('önceki komut sürüyor')); return; }
        const satirlar = [];
        const zaman = setTimeout(() => { if (this._bekleyen && this._bekleyen.satirlar === satirlar) { this._bekleyen = null; coz(satirlar); } }, zamanMs);
        this._bekleyen = { satirlar, coz: s => { clearTimeout(zaman); coz(s); } };
        this.yaz(cmd + '\r\n').catch(e => { clearTimeout(zaman); this._bekleyen = null; red(e); });
      });
    }

    /** Kart hazır olana kadar `get can` dener (açılış checklist'i ~26 sn sürebilir). */
    async hazirBekle(enCokMs = 60000) {
      const t0 = Date.now();
      while (Date.now() - t0 < enCokMs) {
        const s = await this.komut('get can', 2500).catch(() => []);
        const d = durumCoz(s);
        if (d.kbps) return d;
        await new Promise(r => setTimeout(r, 500));
      }
      throw new Error('kart cevap vermedi (NAR derlemesi yüklü mü?)');
    }

    async durum()            { return durumCoz(await this.komut('get can')); }
    async akis(on)           { return this.komut('can stream ' + (on ? 'on' : 'off')); }
    async tara(sn = 4)       { return taramaCoz(await this.komut('can scan ' + sn, (sn * 4 + 8) * 1000)); }
    async txAc(zorla)        { return this.komut('set can tx ' + (zorla ? 'force' : 'on')); }
    async txKapat()          { return this.komut('set can tx off'); }
    async gonder(id, bayt)   {
      const hex = '0x' + id.toString(16).toUpperCase() + (bayt.length ? ',' + bayt.map(b => b.toString(16).padStart(2, '0')).join(',') : '');
      return this.komut('can send ' + hex);
    }
    async obd(pid, mod = 1)  {
      const s = await this.komut(`can obd ${pid.toString(16).padStart(2, '0')} ${mod.toString(16).padStart(2, '0')}`, 6000);
      return { satirlar: s, cevaplar: obdCevapCoz(s), hata: s.find(x => x.includes('ERR')) || null };
    }
    async hizAyarla(kbps)    { return this.komut(`set can bitrate ${kbps}`); }
    async yenidenBaslat()    { try { await this.yaz('reboot\r\n'); } catch (_) {} }
    async temizle()          { return this.komut('can clear'); }

    async kapat() {
      this.kapaniyor = true;
      try { if (this.port) await this.komut('can stream off', 1500).catch(() => {}); } catch (_) {}
      try { if (this.okur) await this.okur.cancel(); } catch (_) {}
      try { if (this.port) await this.port.close(); } catch (_) {}
      this.port = null;
    }
  }

  /** Web Serial'dan ESP32 portu iste (Electron ana süreç listeyi ekrana verir, seçim oradan döner). */
  async function portIste(secici) {
    const filters = [{ usbVendorId: VID_ESP }];
    return navigator.serial.requestPort({ filters: secici ? [] : filters });
  }

  const disari = { Kart, satirCoz, durumCoz, taramaCoz, obdCevapCoz, portIste, VID_ESP };
  kok.KART = disari;
  if (typeof module !== 'undefined' && module.exports) module.exports = disari;
})(typeof window !== 'undefined' ? window : globalThis);
