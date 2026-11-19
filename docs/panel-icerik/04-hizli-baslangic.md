Uygulamayı ilk kez kuran biri için 10 dakikalık yol. Donanım yoksa 4. adımda **Demo** ile devam edilir; gerçek kart ve araç adımları sonraki bölümlerde.

<div style="border-left:4px solid #12A0AD;background:rgba(18,160,173,.10);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">Gerekenler</div><div style="line-height:1.6;color:inherit">Bilgisayarda <strong>Node.js 18 ya da üstü</strong> ve <strong>Git</strong>. Kart için: NarRTOS <code>nar_esp32s3</code> derlemesi yüklü NAR kartı (Konsol’da <code>help</code> yazınca listede <code>can stream</code> görünmeli) ve bir 3,3 V CAN alıcı-verici.</div></div>

1. **Kodu indirin ve kurun** (bir kez):

```
git clone https://github.com/corezzle/corezzle-can.git
cd corezzle-can
npm install
```

2. **Çalıştırın:** `npm start`. Birkaç saniye sonra uygulama penceresi açılır.

![Açılış ekranı: Karta bağlan ve Demo düğmeleri](GORSEL: ekran-baslangic.png)

<div style="font-size:12.5px;color:inherit;opacity:.72;text-align:center;margin:-6px 0 14px"><em>Açılış. Üstte durum rozetleri (bağlantı, hız, mod), sağda Karta bağlan ve Demo.</em></div>

3. **Kartla:** kartı USB ile takın, **Karta bağlan** deyin, listeden ESP32-S3 portunu seçin. Kart yeni takıldıysa açılış 30 saniye sürebilir; hazır olunca üstte hız ve mod görünür.

4. **Kartsız:** **Demo (sahte kart)** deyin. Yazılım içinde kartı taklit eden bir hat açılır; aşağıdaki adımların hepsi aynı çalışır.

5. **Hızı bulun:** Ayarlar → **Hızı bul**. Yaklaşık 20 saniye sürer; sonuç "bulundu: 500 kbit/s" gibi görünür ve kalıcı yazılır.

6. **İzleyin:** Canlı sekmesine dönün. Mesajlar akıyorsa bağlantı doğrudur.

7. **Sorun:** Gönder → **Gönderimi aç** → listeden *Motor devri* → **Sorgula**. Tabloya motor ünitesinin cevabı çözülmüş değerle düşer.

<div style="border-left:4px solid #D9922F;background:rgba(217,146,47,.12);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">Araçta ilk denemede</div><div style="line-height:1.6;color:inherit">Kontak açık ya da motor çalışır olmalı; çoğu araç kontak kapalıyken hatta hiçbir şey konuşmaz. Hiç mesaj gelmiyorsa önce <strong>CANH/CANL ters mi</strong> ve <strong>GND bağlı mı</strong> diye bakın; bu ikisi ilk denemelerde en sık karşılaşılan sebeptir.</div></div>

Kurulum paketi üretmek için: `npm run make` (macOS için dmg/zip, Windows için Setup.exe, Linux için zip; `out/` klasörüne yazar). Donanımsız testler: `npm test`.
