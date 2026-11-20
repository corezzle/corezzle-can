Uygulama açık kaynaktır: <a href="https://github.com/corezzle/corezzle-can">github.com/corezzle/corezzle-can</a>, Apache-2.0 lisansı. Electron üzerinde çalışır; arayüz düz HTML/JS'dir, çerçeve yoktur.

## Dizin yapısı

```
src/main.js       Electron ana süreç: pencere, seri port izni, dosya kaydetme
src/preload.js    ekran ↔ ana süreç köprüsü
src/board.js      kartla konuşma: satır ayrıştırma, komutlar, akış
src/fake-board.js demo modu: kartı taklit eden sahte port
src/obd.js        OBD-II PID tablosu ve cevap çözümü
src/app.js        arayüz mantığı
src/index.html    arayüz
src/style.css     görünüm
test/test.js      protokol testleri (node)
```

## Nasıl çalışır

Kartla konuşma tarayıcıların **Web Serial** arayüzüyle yapılır; Electron bunu masaüstünde sunar ve port seçim penceresini uygulama kendisi çizer. `board.js` bir komut gönderir, `[cmd]` satırlarını toplar, `OK:`/`ERR:` gelince bitirir; `CAN,` ile başlayan satırları ayrı bir kanaldan Canlı/Akış/Kayıt'a verir. Her 5 saniyede `get can` ile durum tazelenir.

## Testler

`npm test` donanımsız çalışır: akış satırı ayrıştırma, `get can` çözümü, hız tarama çıktısı, OBD cevap çözümü (devir, hız, sıcaklık, olumsuz cevap), komutun ara bildirimde değil son `OK` ile bitmesi. On test.

## Kurulum paketi üretmek

`npm run make` komutu `out/` klasörüne yazar: macOS için `Corezzle-CAN.dmg` ve zip, Windows için `Corezzle-CAN-Setup.exe`, Linux için zip. Paket hangi işletim sisteminde üretilirse o sistem için çıkar. macOS imzası ve notarizasyon yalnız ilgili ortam değişkenleri verilirse yapılır (`forge.config.js` başındaki açıklama); verilmezse paket imzasız çıkar ve ilk açılışta Gatekeeper uyarısı görünür. Sürüm yayımlamak için elle paketlemeye gerek yoktur: `package.json` içindeki `version` artırılıp `v0.1.0` gibi aynı numaralı bir etiket GitHub'a push edilince `.github/workflows/release.yml` iş akışı üç platformun paketini GitHub'ın makinelerinde üretir ve o etiketin *Release* sayfasına ekler. Hızlı başlangıç'taki indirme bağlantısı her zaman en son Release'e gider.

## Geliştirme notları

- Yeni bir OBD PID eklemek: `obd.js` içindeki listeye bir satır (PID, ad, birim, çözüm fonksiyonu).
- Kart komutlarının biçimi değişirse `board.js` içindeki çözücüler ve `fake-board.js` birlikte güncellenir; testler ikisini de sınar.
- Uygulama kart yazılımına yalnız bu belgede listelenen komutları gönderir; kart tarafı NarRTOS Wear deposundadır.

## Lisans

Apache License 2.0; ayrıntı `LICENSE` ve `NOTICE` dosyalarında. Electron ve Electron Forge MIT lisanslıdır.

Corezzle Electronics
