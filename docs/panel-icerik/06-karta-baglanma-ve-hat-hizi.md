**Kısaca:** Karta bağlan → portu seç → 30 saniyeye kadar bekle → Ayarlar'da Hızı bul. Hız bir kez bulunur, kartta kalıcıdır.

## Bağlanma

1. Kartı USB ile takın. İlk takışta kart açılış testlerini yapar; bu **25–30 saniye** sürer. Uygulama bu süre boyunca "kart açılışı 30 sn sürebilir" der ve bekler.
2. **Karta bağlan** deyin. Açılan listede ESP32-S3 portu görünür (macOS'ta `usbmodem…`, Windows'ta `COM…`, Linux'ta `ttyACM…`). Seçin.
3. Üstteki rozetler dolar: **bağlı**, hız (örn. 250 kbit/s), mod (**listen-only**). Sağda alınan mesaj sayısı, kaç farklı kimlik görüldüğü ve saniyedeki mesaj hızı canlı sayılır.

<div style="border-left:4px solid #12A0AD;background:rgba(18,160,173,.10);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">Port listede yoksa</div><div style="line-height:1.6;color:inherit">Kablo veri taşımıyor olabilir (yalnız şarj kablosu); başka bir kablo deneyin. Kart başka bir program tarafından açık tutuluyor olabilir (PlatformIO monitörü, başka bir terminal); onu kapatın. Linux’ta kullanıcı <code>dialout</code> grubunda olmalı.</div></div>

## Hat hızı

Kart açılışta kalıcı bellekteki hızı kullanır (ilk kez 250 kbit/s). Araç başka hızda konuşuyorsa Canlı tablo boş kalır. İki yol var:

**Otomatik:** Ayarlar → **Hızı bul**. Kart 500, 250, 125 ve 1000 kbit/s'yi sırayla, her birini birkaç saniye, **hatta görünmeden** (listen-only) dinler. Mesaj gelen hızı seçer, kalıcı yazar ve o hızda dinlemeye devam eder. Sonuç satırı her hızda kaç mesaj sayıldığını gösterir.

![Ayarlar sekmesi: Hızı bul sonucu ve kart durumu](GORSEL: ekran-ayarlar-hiz.png)

<div style="font-size:12.5px;color:inherit;opacity:.72;text-align:center;margin:-6px 0 14px"><em>Hızı bul sonucu: yalnız 500 kbit/s’te mesaj sayıldı. Sağda kartın kendi durum satırı.</em></div>

**Elle:** hızı biliyorsanız listeden seçip **Ayarla ve yeniden başlat** deyin. Kart yeniden başlar (yine ~30 sn) ve yeni hızla açılır.

<div style="border-left:4px solid #D9922F;background:rgba(217,146,47,.12);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">Tarama sırasında gönderim kapalıdır</div><div style="line-height:1.6;color:inherit">Yanlış hızda tek bir mesaj bile göndermek hattı bozar; bu yüzden tarama yalnız dinler. Bulunan hızda da gönderim kendiliğinden açılmaz; Gönder sekmesinden sizin açmanız gerekir.</div></div>

## Kart durumu kutusu

Ayarlar'daki **Kart durumu**, kartın `get can` cevabını okunur biçimde gösterir ve her 5 saniyede yenilenir:

| Alan | Anlamı |
|---|---|
| hız · denetleyici · mod | Hat hızı; CAN denetleyicisi çalışıyor mu; LISTEN-ONLY ya da NORMAL |
| alınan | Açılıştan beri alınan toplam mesaj |
| kimlik | Kaç farklı kimlik görüldü / tablo kapasitesi (96) |
| tablo taşması | Tablo dolduğu için atılan yeni kimlik sayısı; artıyorsa araç 96'dan fazla kimlik yayınlıyor |
| akış | Mesajların uygulamaya anlık akışı açık mı |
| hata satırı | `tx_err`, `bus_err`, `tx_failed`… Dinlemede hepsi 0 olmalı; artıyorsa hız yanlış ya da kablolama bozuk |

**Kartı yeniden başlat** düğmesi `reboot` gönderir; açılış tamamlanınca uygulama kendiliğinden yeniden bağlanır.
