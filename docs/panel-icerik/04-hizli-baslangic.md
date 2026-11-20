Uygulamayı ilk kez kuran biri için 10 dakikalık yol. Donanım yoksa 4. adımda **Demo** ile devam edilir; gerçek kart ve araç adımları sonraki bölümlerde.

<div style="border-left:4px solid #12A0AD;background:rgba(18,160,173,.10);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">Gerekenler</div><div style="line-height:1.6;color:inherit">Windows, macOS ya da Linux bilgisayar. Kart için: NarRTOS <code>nar_esp32s3</code> derlemesi yüklü NAR kartı (Konsol’da <code>help</code> yazınca listede <code>can stream</code> görünmeli), bir 3,3 V CAN alıcı-verici ve <strong>veri taşıyan</strong> bir USB kablosu. Node.js ve Git yalnız kaynak koddan çalıştıracaklar için gerekir.</div></div>

## 1. Uygulamayı kurun

İki yol var. Yalnız kullanacaksanız hazır paketi alın; kodu değiştirecekseniz kaynak koddan çalıştırın.

### Hazır paket

İndirme sayfası: <a href="https://github.com/corezzle/corezzle-can/releases/latest">github.com/corezzle/corezzle-can/releases</a>. İşletim sisteminize uygun dosyayı alın:

- **Windows:** `Corezzle-CAN-Setup.exe` dosyasını çalıştırın. Windows "Windows protected your PC" (bilgisayarınız korundu) penceresi gösterirse *More info* → *Run anyway* deyin; uygulama yeni olduğu için bu uyarı çıkar. Kurulum birkaç saniyede kendiliğinden tamamlanır ve uygulama açılır; sonraki açılışlar Başlat menüsünden.

- **macOS:** `Corezzle-CAN.dmg` dosyasını açın, Corezzle CAN simgesini Uygulamalar (Applications) klasörüne sürükleyin. İlk açılışta "Apple cannot check it for malicious software" uyarısı çıkarsa uygulamaya sağ tıklayıp *Aç* deyin. Yeni macOS sürümlerinde bu yetmezse *Sistem Ayarları → Gizlilik ve Güvenlik* sayfasının altındaki *Yine de Aç* düğmesine basın. Bir kez yeter.

- **Linux:** `corezzle-can-linux-x64-<sürüm>.zip` dosyasını bir klasöre açın, içindeki `corezzle-can` dosyasını çalıştırın. Seri porta erişim için kullanıcınız `dialout` grubunda olmalı: `sudo usermod -aG dialout $USER`, sonra oturumu kapatıp açın.

### Kaynak koddan

Bilgisayarda Node.js 18 ya da üstü ve Git kurulu olmalı:

```
git clone https://github.com/corezzle/corezzle-can.git
cd corezzle-can
npm install
npm start
```

Son komut birkaç saniye sonra uygulama penceresini açar; sonraki seferlerde yalnız `npm start` yeter.

## 2. Açılış

Hangi yolla kurulmuş olursa olsun uygulama aynı ekranla açılır: üstte durum rozetleri, sağda **Karta bağlan** ve **Demo (sahte kart)**.

![Açılış ekranı: Karta bağlan ve Demo düğmeleri](GORSEL: ekran-baslangic.png)

<div style="font-size:12.5px;color:inherit;opacity:.72;text-align:center;margin:-6px 0 14px"><em>Açılış. Üstte durum rozetleri (bağlantı, hız, mod), sağda Karta bağlan ve Demo.</em></div>

## 3. Kartla

Kartı USB ile takın, **Karta bağlan** deyin, listeden ESP32-S3 portunu seçin (macOS'ta `usbmodem…`, Windows'ta `COM…`, Linux'ta `ttyACM…`). Kart yeni takıldıysa açılış 30 saniye sürebilir; hazır olunca üstte hız ve mod görünür.

## 4. Kartsız

**Demo (sahte kart)** deyin. Yazılım içinde kartı taklit eden bir hat açılır; aşağıdaki adımların hepsi aynı çalışır.

## 5. Hızı bulun

Ayarlar → **Hızı bul**. Yaklaşık 20 saniye sürer; sonuç "bulundu: 500 kbit/s" gibi görünür ve kalıcı yazılır.

## 6. İzleyin

Canlı sekmesine dönün. Mesajlar akıyorsa bağlantı doğrudur.

## 7. Sorun

Gönder → **Gönderimi aç** → listeden *Motor devri* → **Sorgula**. Tabloya motor ünitesinin cevabı çözülmüş değerle düşer.

<div style="border-left:4px solid #D9922F;background:rgba(217,146,47,.12);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">Araçta ilk denemede</div><div style="line-height:1.6;color:inherit">Kontak açık ya da motor çalışır olmalı; çoğu araç kontak kapalıyken hatta hiçbir şey konuşmaz. Hiç mesaj gelmiyorsa önce <strong>CANH/CANL ters mi</strong> ve <strong>GND bağlı mı</strong> diye bakın; bu ikisi ilk denemelerde en sık karşılaşılan sebeptir.</div></div>

## Güncelleme

Uygulama kendini güncellemez. Yeni sürüm çıkınca aynı indirme sayfasından yeni paketi alıp üstüne kurarsınız; kayıtlarınız silinmez. Kaynak koddan çalıştıranlar `git pull` ve `npm install` yapar.
