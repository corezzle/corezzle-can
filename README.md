# Corezzle CAN

> 📖 NAR kartı üzerinden aracın CAN hattını **canlı dinleyen, kaydeden, frame gönderen ve OBD-II sorgulayan**
> masaüstü uygulaması (macOS, Windows, Linux). Kart tarafı açık kaynak
> [NarRTOS Wear](https://github.com/corezzle/NarRTOS-Wear) firmware'idir (`nar_esp32s3` derlemesi).

*Corezzle CAN is a desktop tool (Electron) that turns a NAR board with a CAN transceiver into a live CAN bus
monitor: per-ID live table, raw stream, CSV recording, automatic bitrate detection, raw frame transmit and OBD-II
queries with decoded values. The board stays in listen-only mode until you explicitly enable transmission.*

## Güvenlik ve sorumluluk

Kart, araca bağlıyken varsayılan olarak yalnız dinleme kipinde çalışacak biçimde tasarlanmıştır; bu kipte hatta sinyal göndermemesi amaçlanır.
Yine de aracın elektronik sistemine takılan her cihaz bir risk taşır. Denemeleri yalnız **park hâlindeki, el freni çekili** bir araçta yapın;
araç hareket hâlindeyken kartı bağlamayın, bağlantıyı değiştirmeyin ve bilgisayarla ilgilenmeyin. Uygulama ve kart kullanıcının kendi
sorumluluğunda kullanılır; Corezzle Electronics araçta oluşabilecek arıza, hasar, veri kaybı ya da garanti kaybından sorumlu tutulamaz.
Emin olmadığınız bir araçta önce Demo ile çalışın. Uygulama bu metni ilk açılışta gösterir ve Ayarlar sekmesinde her zaman tutar.

*Safety and responsibility: when connected to a vehicle the board is designed to run in listen-only mode by default; in this mode it is
intended not to send any signal onto the bus. Even so, any device attached to a vehicle's electronics carries a risk. Only experiment in a
vehicle that is parked with the handbrake on; never connect the board, change the wiring or handle the computer while the vehicle is moving.
The app and the board are used at the user's own responsibility; Corezzle Electronics cannot be held liable for any fault, damage, data loss
or loss of warranty on the vehicle. If you are unsure about a vehicle, work with the Demo first.*

## Ne yapar

| Sekme | İşlev |
|---|---|
| **Canlı** | Kimlik başına son frame; değişen baytlar vurgulu; sayı, saniyedeki frame, son görülme; kimlik süzme |
| **Akış** | Ham satır akışı (son 2000 satır), duraklat, süz |
| **Gönder** | Gönderimi aç/kapat (güvenlik kilidi), OBD-II hazır sorgular (devir, hız, sıcaklık, yakıt…) ve çözümlü cevap, ham frame gönderme, tekrarlı gönderim |
| **Kayıt** | Oturumu belleğe al, CSV olarak kaydet (`zaman_ms,kimlik,ext,dlc,b0..b7`) |
| **Ayarlar** | Hat hızını otomatik bul (500/250/125/1000, hatta görünmeden), elle hız, kart durumu ve hata sayaçları |
| **Konsol** | Karta serbest komut (`help`, `can dump 20` …) |

## Güvenlik modeli

- Kart her açılışta **listen-only** başlar: ACK vermez, hata frame'i üretmez, araç hattı kartı hissetmez. Dinleme ve hız bulma bu moddadır.
- Gönderim yalnız uygulamadan, o oturum için açılır ve ancak hat hızı doğrulanmışsa (pasif dinlemede frame görülmüşse) kabul edilir.
- Gönderilen frame onaylanmazsa (TEC 128) kart gönderimi kendisi kapatıp listen-only'ye döner.
- Yanlış hızda ya da ters CANH/CANL ile gönderim araç hattını bozabilir (göstergeler sönebilir). Araçta yalnız doğrulanmış hızda ve standart OBD-II sorgularıyla gönderim yapın.

## Donanım

- NAR kartı (ESP32-S3) + 3,3 V CAN alıcı-verici (SN65HVD230, TJA1051T/3 vb.). 5 V çipler (TJA1050, MCP2551) uygun değildir.
- Kart ↔ alıcı-verici: 3,3 V, GND, **TXD → GPIO4**, **RXD → GPIO6**. Alıcı-vericide RS/STBY pini varsa GND'ye.
- Alıcı-verici ↔ araç (OBD-II soketi): **CANH → pin 6**, **CANL → pin 14**, **GND → pin 4/5**. Alıcı-verici modülündeki 120 Ω sonlandırma devre dışı olmalı.
- Frame gelmiyorsa en sık sebep CANH/CANL'nin ters olması ya da GND'nin bağlanmamasıdır. Binek araçlarda hız çoğunlukla 500 kbit/s, kamyon/J1939'da 250.

## Kurulum ve çalıştırma

**Hazır paket:** [Releases](https://github.com/corezzle/corezzle-can/releases/latest) sayfasından indirin. Windows `Corezzle-CAN-Setup.exe`
(SmartScreen uyarısında *More info → Run anyway*), macOS `Corezzle-CAN-AppleSilicon.dmg` ya da `Corezzle-CAN-Intel.dmg` (Uygulamalar'a sürükleyin; ilk açılışta sağ tık → *Aç*),
Linux zip (açın, `corezzle-can` dosyasını çalıştırın; kullanıcı `dialout` grubunda olmalı). Adım adım anlatım: `docs/panel-icerik/04-hizli-baslangic.md`.

**Kaynak koddan:** Node.js 18+ ve Git gerekir. Kart tarafı: NarRTOS `nar_esp32s3` derlemesi yüklü kart (`can stream` komutunu tanıyan sürüm).

```bash
git clone https://github.com/corezzle/corezzle-can.git
cd corezzle-can
npm install
npm start
```

Donanım yokken denemek için üstteki **Demo (sahte kart)** düğmesi: yazılım içinde kartı taklit eden bir hat açılır
(500 kbit/s'te 208 benzeri kimlikler yayınlar, OBD sorgularına cevap verir; gerçek araç verisi değildir). Hız bulma,
gönderim kilidi, OBD çözümü ve kayıt dahil bütün akış demoda aynı çalışır.

Gerçek kart için **Karta bağlan** → listeden ESP32-S3 portunu seçin. Kart açılışı 30 saniye sürebilir; hazır olunca
hız ve mod üstte görünür, Canlı sekmesinde frame'ler akar. Frame yoksa **Ayarlar → Hızı bul**.

Kurulum paketi üretmek için: `npm run make` (macOS dmg/zip, Windows Setup.exe, Linux zip; `out/` altına yazar; paket, üretildiği
işletim sistemi için çıkar). Sürüm yayımlamak için `package.json` içindeki `version` artırılır, commit edilir ve aynı numarayla
etiket push edilir (`git tag v0.1.0 && git push github v0.1.0`); `.github/workflows/release.yml` üç platformun paketini GitHub'da
üretip o etiketin Release'ine ekler.

Testler (donanımsız, protokol çözümleri): `npm test`.

## Kart komutları (uygulamanın kullandığı)

```
get can                      durum, hız, mod, sayaçlar
can stream on|off            her frame'i satır olarak akıt: CAN,<ms>,<0xID>,<ext>,<dlc>,<B0 B1 …>
can scan [sn]                hız tarama (listen-only), bulunan kalıcı yazılır
set can bitrate <kbps>       125|250|500|1000 (kalıcı, reboot)
set can tx on|off|force      gönderimi aç (NORMAL) / kapat (LISTEN-ONLY)
can send 0xID,b0,..,b7       tek frame
can obd <pid> [mod]          OBD-II isteği 0x7DF → cevaplar 0x7E8-0x7EF
can dump | can stats | can clear
```

## Dizin yapısı

```
src/main.js       Electron ana süreç: pencere, Web Serial izni, dosya kaydetme
src/preload.js    ekran ↔ ana süreç köprüsü
src/board.js      kartla konuşma: satır ayrıştırma, komutlar, akış
src/fake-board.js demo modu: kartı taklit eden sahte port
src/obd.js        OBD-II PID tablosu ve cevap çözümü
src/app.js        arayüz mantığı
src/index.html    arayüz
src/style.css     görünüm
test/test.js      protokol testleri (node)
```

## Belgeler

İki belge var, ikisi de TR ve EN, corezzle.com Wiki'sine bölüm bölüm girilir:
- **Kullanım kılavuzu** (`docs/panel-kilavuz/`, 9 bölüm): hiç görmemiş biri için indirme, kurulum, Demo, kartı bağlama, hız bulma, OBD-II, kayıt, sorun giderme. Wiki'de "Corezzle CAN".
- **Teknik belge** (`docs/panel-icerik/`, 14 bölüm): kavramlar, bağlantı şeması, güvenlik modeli, kart komutları, kaynak kod. Wiki'de "NarRTOS - CAN".

Teknik belgenin dosyaları Görseller `docs/panel-icerik/gorseller/`,
üretim betikleri `docs/wiki-html/` (ekran görüntüleri: `ekran_al.mjs`, bağlantı şeması: `sema_uret.py`, bölüm metinleri: `bolumler_tr.py` / `bolumler_en.py`, tek dosya birleştirme: `birlestir.mjs`).
Tamamı tek dosyada okumak için: [`docs/panel-icerik/Corezzle-CAN-Wiki.md`](docs/panel-icerik/Corezzle-CAN-Wiki.md) (ayrıca aynı adla `.html` ve `.pdf`).

## Üçüncü taraf bileşenler

- [Electron](https://www.electronjs.org/) (MIT), Electron Forge (MIT)

## Lisans

Apache License 2.0. Ayrıntı için `LICENSE` ve `NOTICE` dosyalarına bakın.

---

Corezzle Electronics
