# Panele giriş kılavuzu — Corezzle CAN dökümanı

Bu klasör corezzle.com Wiki'sine (içerik türü "döküman") girilecek **tek bir dökümanın** bölümleridir.
Wear ve Drive dökümanlarıyla aynı düzen: her `NN-*.md` dosyası panelde bir **başlık** (bölüm), içerik Markdown + satır içi stilli HTML.

## Döküman (üst kayıt) alanları — öneri

| Alan | Değer |
|---|---|
| Başlık (TR) | Corezzle CAN |
| Başlık (EN) | Corezzle CAN |
| Kısa açıklama (TR) | NAR kartıyla aracın CAN hattını canlı dinleyen, kaydeden ve OBD-II sorgulayan masaüstü uygulaması. Bağlantı, hız bulma, güvenlik kilidi, kayıt ve sorun giderme. |
| Kısa açıklama (EN) | Desktop app that listens to a vehicle's CAN bus through a NAR board, records it and runs OBD-II queries. Wiring, bitrate detection, safety lock, recording and troubleshooting. |
| Kategori | **Corezzle CAN** (yeni kategori; Drive'ın kendi kategorisi olduğu gibi). İstenirse "NarRTOS Wear" altına da konabilir, çünkü kart yazılımı Wear'dır. |
| Zorluk | Başlangıç |
| Okuma süresi | 30 dk |
| Kapak görseli | `gorseller/ekran-canli.png` (ya da bağlantı şeması) |
| Etiketler | CAN, OBD-II, NarRTOS, araç, Electron |

## Bölüm sırası (14) — TR dosya → EN dosya → EN başlık

| # | TR dosya | Panel başlığı (TR) | EN dosya | Başlık (EN) |
|---|---|---|---|---|
| 01 | 01-genel-bakis.md | Genel bakış | en/01-overview.md | Overview |
| 02 | 02-bu-uygulama-ne-yapar.md | Bu uygulama ne yapar? | en/02-what-does-this-app-do.md | What does this app do? |
| 03 | 03-temel-kavramlar.md | Temel kavramlar | en/03-core-concepts.md | Core concepts |
| 04 | 04-hizli-baslangic.md | Hızlı başlangıç | en/04-quick-start.md | Quick start |
| 05 | 05-donanim-ve-baglantilar.md | Donanım ve bağlantılar | en/05-hardware-and-wiring.md | Hardware and wiring |
| 06 | 06-karta-baglanma-ve-hat-hizi.md | Karta bağlanma ve hat hızı | en/06-connecting-and-bitrate.md | Connecting and bitrate |
| 07 | 07-canli-ve-akis.md | Canlı ve Akış | en/07-live-and-stream.md | Live and Stream |
| 08 | 08-gonder-obd-ve-guvenlik-kilidi.md | Gönder: OBD-II ve güvenlik kilidi | en/08-send-obd-and-safety-lock.md | Send: OBD-II and the safety lock |
| 09 | 09-kayit.md | Kayıt | en/09-recording.md | Recording |
| 10 | 10-konsol-ve-kart-komutlari.md | Konsol ve kart komutları | en/10-console-and-board-commands.md | Console and board commands |
| 11 | 11-guvenlik-modeli-ve-sahada-ogrenilenler.md | Güvenlik modeli ve sahada öğrenilenler | en/11-safety-model-and-field-lessons.md | Safety model and field lessons |
| 12 | 12-demo-modu.md | Demo modu | en/12-demo-mode.md | Demo mode |
| 13 | 13-sorun-giderme.md | Sorun giderme | en/13-troubleshooting.md | Troubleshooting |
| 14 | 14-kaynak-kod-testler-ve-lisans.md | Kaynak kod, testler ve lisans | en/14-source-code-tests-and-licence.md | Source code, tests and licence |

## Her bölüm için adımlar

1. Dökümanda **Yeni başlık** → TR başlığı ve EN başlığı yukarıdaki tablodan.
2. TR içerik: `NN-*.md` dosyasının **tamamını** kopyala, editöre (Markdown modu) yapıştır. HTML kutuları olduğu gibi kalsın; panel `html: true` ile basıyor.
3. Görseller: içerikteki `![…](GORSEL: dosya.png)` satırlarını bul. Editörün **Resim Yükle** düğmesiyle `gorseller/dosya.png` dosyasını yükle, dönen URL'yi `GORSEL: dosya.png` yerine yaz. Hangi bölümde hangi görsel: `00-GORSEL-LISTESI.md`.
4. EN içerik: `en/NN-*.md` aynı şekilde. Görseller TR ile birebir aynı dosyalar (yazıları İngilizce); TR'de yüklediğiniz adresi EN'e de yazın, ikinci yükleme gerekmez.
5. Kaydet, siteyi açık ve koyu temada bir bak: kutular `rgba(128,128,128,…)` + `color:inherit` ile iki temada da okunur olmalı.

## Dikkat

- Tablolardaki `\|` kaçışına dokunma (örn. `set can tx on\|off`); editör bunu düz `|` yaparsa tablo bozulur.
- Kod blokları (``` ile) TR ve EN'de aynı; çevrilmedi (kart cevapları İngilizce-Türkçe karışık, olduğu gibi gösteriliyor).
- 01'deki sayı kutuları ve kartlar tek satırlık HTML; yapıştırırken satır kırılmasın.
- Döküman adresi panelde oluşunca (örn. `/document-content/corezzle-can-NN`) söyle: Wear dökümanındaki "Corezzle CAN ile Araç Hattını Dinleme" sayfası (embedded-wear-os `docs/panel-icerik/19-*.md`) ve corezzle-can README'si bu adrese bağlanacak.
- 04 Hızlı başlangıç'taki indirme bağlantısı `github.com/corezzle/corezzle-can/releases/latest` adresine gider. Bu bölümü panele girmeden önce GitHub'da bir Release yayımlanmış olmalı (dosyalar: `Corezzle-CAN-Setup.exe`, `Corezzle-CAN-AppleSilicon.dmg`, `Corezzle-CAN-Intel.dmg`, `corezzle-can-linux-x64-<sürüm>.zip`). Release yoksa bağlantı boş sayfaya düşer. Release'i `.github/workflows/release.yml` üretir: `git tag v0.1.0 && git push github v0.1.0`, 10-15 dk sonra üç dosya Release'te.

## Tek dosya (gözden geçirme için)

Parça dosyaların tamamı tek dosyada: `Corezzle-CAN-Wiki.md` (TR+EN, görseller göreli yol), `Corezzle-CAN-Wiki.html` (görseller gömülü, tek dosya) ve `Corezzle-CAN-Wiki.pdf`. Panele **parça dosyalar** girilir; tek dosyalar elle düzenlenmez, parça değişince yeniden üretilir:

```
node docs/wiki-html/birlestir.mjs
```

PDF için ardından: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --no-pdf-header-footer --print-to-pdf=docs/panel-icerik/Corezzle-CAN-Wiki.pdf file://$PWD/docs/panel-icerik/Corezzle-CAN-Wiki.html`
(birleştirici panelin kendi markdown-it ayarlarını ve HTML süzgecini kullanır; markdown-it depoda yoksa `npm install --no-save markdown-it` ya da `MD_IT=<markdown-it klasörü>`).

## Görseller nasıl üretildi (yeniden üretmek için)

- Ekran görüntüleri: `node docs/wiki-html/ekran_al.mjs docs/panel-icerik/gorseller /tmp/chrome-profil` — uygulamayı Chrome headless'ta demo modunda sürer, 7 görüntü (1280×N, 2× ölçek).
- Bağlantı şeması: `python3 docs/wiki-html/sema_uret.py` — SVG kaynak `docs/wiki-html/assets/img/`, PNG `gorseller/` (yalnız İngilizce).
- Metinler elle yazıldı; kaynak doğrulama için uygulama kodu (`src/`) ve NarRTOS `command_service.cpp`.
