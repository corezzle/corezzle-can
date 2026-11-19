# Panel bölümlerinin kaynağı (TR). Çalıştırınca docs/panel-icerik/NN-*.md yeniden üretilir: python3 docs/wiki-html/bolumler_tr.py
import pathlib, os
OUT = pathlib.Path(os.path.expanduser('~/Desktop/corezzle-can/docs/panel-icerik'))
def kutu(baslik, govde, renk='#12A0AD', alfa='.10'):
    r,g,b = int(renk[1:3],16), int(renk[3:5],16), int(renk[5:7],16)
    return f'<div style="border-left:4px solid {renk};background:rgba({r},{g},{b},{alfa});border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">{baslik}</div><div style="line-height:1.6;color:inherit">{govde}</div></div>'
NOT = lambda b,g: kutu(b,g)
UYARI = lambda b,g: kutu(b,g,'#D9922F','.12')
TEHLIKE = lambda b,g: kutu(b,g,'#D95757','.12')
def gorsel(ad, alt, altyazi):
    return f'![{alt}](GORSEL: {ad})\n\n<div style="font-size:12.5px;color:inherit;opacity:.72;text-align:center;margin:-6px 0 14px"><em>{altyazi}</em></div>'
def kart(etiket, baslik, metin):
    return f'<div style="background:rgba(128,128,128,.08);border:1px solid rgba(128,128,128,.24);border-radius:14px;padding:20px"><div style="font-size:11.5px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:#12A0AD">{etiket}</div><div style="font-size:17px;font-weight:700;margin:8px 0 6px;color:inherit">{baslik}</div><div style="font-size:14px;color:inherit;opacity:.72;line-height:1.5">{metin}</div></div>'
def kartlar(*k): return '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px;margin:18px 0">' + ''.join(k) + '</div>'
def sayi(deger, metin):
    return f'<div style="flex:1 1 120px;max-width:190px;background:rgba(128,128,128,.10);border:1px solid rgba(128,128,128,.28);border-radius:12px;padding:16px 10px;text-align:center"><div style="font-size:24px;font-weight:800;color:#12A0AD;line-height:1.1">{deger}</div><div style="font-size:12.5px;color:inherit;opacity:.72;margin-top:6px;line-height:1.35">{metin}</div></div>'
def sayilar(*s): return '<div style="display:flex;gap:10px;flex-wrap:wrap;margin:18px 0">' + ''.join(s) + '</div>'

D = {}
D['01-genel-bakis'] = f"""Corezzle CAN, NAR kartını aracın veri yoluna bağlayıp **o hatta ne konuşulduğunu bilgisayar ekranında gösteren** masaüstü uygulamasıdır. Kartın küçük bir eki (CAN alıcı-verici) aracın OBD-II soketine takılır; uygulama kartla USB üzerinden konuşur, gelen mesajları canlı tabloda gösterir, kaydeder, istenirse araca standart sorular sorar (devir, hız, sıcaklık, yakıt).

{gorsel('ekran-canli.png', 'Canlı sekmesi: kimlik başına son mesaj, değişen baytlar vurgulu', 'Canlı sekmesi. Her satır bir mesaj kimliği; değişen baytlar sarı yanar, sağda saniyedeki tekrar sayısı. (Ekran görüntüleri İngilizce arayüzden; düğme ve sütun adlarının Türkçe karşılıkları metinde.)')}

{sayilar(sayi('6','sekme: Canlı, Akış, Gönder, Kayıt, Ayarlar, Konsol'), sayi('4','hat hızı otomatik taranır (125/250/500/1000)'), sayi('17','hazır OBD-II sorgusu, değeri çözülmüş'), sayi('0','kart hattı hisseder: varsayılan listen-only'), sayi('3','işletim sistemi: macOS, Windows, Linux'))}

Bu belge hem uygulamayı hiç görmemiş biri için (ne yapar, nasıl bağlanır, neye dikkat edilir) hem de araçta ölçüm yapacak teknisyen için (hız bulma, OBD sorgusu, kayıt, sorun giderme) yazıldı. Teknik terimler ilk geçtikleri yerde açıklanıyor; **Temel kavramlar** bölümü kısa bir sözlüktür.

{kartlar(kart('Güvenlik','Hat kartı hissetmez','Kart her açılışta yalnız dinler: onay (ACK) vermez, hata üretmez. Gönderim yalnız uygulamadan, o oturum için ve hat hızı doğrulanmışsa açılır.'), kart('Teşhis','Hızı kendisi bulur','Araçtaki hat hızını bilmeniz gerekmez. Kart dört hızı sırayla, hatta görünmeden dinler; mesaj gelen hızı seçip kalıcı yazar.'), kart('Veri','Ham mesaj + çözülmüş OBD','Canlı tablo ham baytları gösterir; OBD-II cevapları ise motor devri, hız, sıcaklık gibi okunur değerlere çevrilir.'), kart('Donanımsız','Demo modu','Kart ve araç yokken uygulamanın tamamı yazılım içindeki sahte bir kartla denenebilir; eğitim ve tanıtım için.'))}

{NOT('Kart tarafı','Bu uygulama tek başına çalışmaz; karşısında NarRTOS Wear yazılımı yüklü bir NAR kartı (ESP32-S3) ve bir CAN alıcı-verici olmalı. Kart yazılımı açık kaynaktır: <a href="https://github.com/corezzle/NarRTOS-Wear">NarRTOS Wear</a>. Uygulamanın kaynak kodu da açıktır: <a href="https://github.com/corezzle/corezzle-can">corezzle-can</a> (Apache-2.0).')}"""

D['02-bu-uygulama-ne-yapar'] = f"""Modern bir araçta onlarca küçük bilgisayar var: motor kontrol ünitesi, fren sistemi, gösterge paneli, kapı modülleri. Hepsi iki telden oluşan ortak bir hat üzerinden sürekli konuşur. Bu hatta **CAN** denir. Araç çalışırken hatta saniyede binlerce kısa mesaj akar: motor devri, hız, pedal konumu, sıcaklıklar, uyarılar.

Corezzle CAN bu konuşmayı dinlemenizi sağlar. Araç tarafında bir NAR kartı ve küçük bir alıcı-verici, bilgisayar tarafında bu uygulama. Kart mesajları olduğu gibi (ham) iletir; anlamlandırma ve gösterim bilgisayardadır.

## Üç kullanım biçimi

| Kim | Ne için | Hangi sekmeler |
|---|---|---|
| Geliştirici | NarRTOS'un CAN tarafını masada ve araçta doğrulamak, hangi kimliklerin aktığını görmek | Canlı, Akış, Konsol |
| Saha teknisyeni | Araçta hat hızını bulmak, bağlantının doğru olduğunu kanıtlamak, motor verisini sorgulamak | Ayarlar, Gönder |
| Veri toplayan | Bir sürüşün ham CAN kaydını alıp sonradan incelemek (tablo programı, Python) | Kayıt |

## Sekmeler

| Sekme | İşlev |
|---|---|
| **Canlı** | Kimlik başına son mesaj; değişen baytlar vurgulu; sayı, saniyedeki mesaj, son görülme; kimliğe göre süzme |
| **Akış** | Ham satır akışı (son 2000 satır), duraklat, süz |
| **Gönder** | Gönderimi aç/kapat (güvenlik kilidi), hazır OBD-II sorguları ve çözülmüş cevap, ham frame gönderme, tekrarlı gönderim |
| **Kayıt** | Oturumu belleğe al, CSV olarak kaydet |
| **Ayarlar** | Hat hızını otomatik bul, elle hız, kart durumu ve hata sayaçları, kartı yeniden başlat |
| **Konsol** | Karta serbest komut yazma; kartın bütün cevapları burada akar |

## Ne yapmaz

- Mesajların **anlamını** çözmez. 0x208 kimliğinin hangi araçta ne anlama geldiği üreticiye özeldir; uygulama ham baytları gösterir. Çözülen tek şey standart OBD-II cevaplarıdır.
- Arıza kodu silmez, ayar yazmaz, aracın modüllerini programlamaz. Standart OBD-II sorgusu dışında hatta mesaj basmak kullanıcının sorumluluğundadır ve uygulama bunu bilerek zorlaştırır.
- Sunucuya veri göndermez. NarRTOS'un telemetri servisi CAN tablosunu kendi raporuyla sunucuya zaten iletir; bu uygulama yerel bir izleme aracıdır.

{NOT('NarRTOS Drive ile ilişkisi','Corezzle’ın ekransız araç takip ürünü NarRTOS Drive de aynı CAN yaklaşımını kullanır: cihaz ham mesajı iletir, çözüm sunucudadır. Corezzle CAN o ürünün sahadaki gözü gibi düşünülebilir; kart tarafındaki <code>can stream</code> komutunu tanıyan her NarRTOS derlemesiyle çalışır.')}"""

D['03-temel-kavramlar'] = """Belgede geçen terimlerin kısa karşılıkları. Zaten biliyorsanız atlayın.

| Terim | Anlamı |
|---|---|
| **CAN** (Controller Area Network) | Araç içindeki modüllerin ortak konuştuğu iki telli hat. Mesajlar küçüktür (en çok 8 bayt), herkes her mesajı duyar |
| **Frame** (mesaj) | Hattaki bir paket: bir kimlik + 0–8 bayt veri. Belgede "mesaj" ve "frame" aynı şeydir |
| **Kimlik** (ID) | Mesajın türünü söyleyen numara; 11 bit (0x000–0x7FF) ya da 29 bit (genişletilmiş). Hangi kimliğin ne olduğu üreticiye özeldir |
| **DLC** | Mesajdaki veri bayt sayısı (0–8) |
| **Hat hızı** (bitrate) | Hattın konuşma hızı: 125, 250, 500 ya da 1000 kbit/s. Yanlış hızda dinleyen hiçbir şey anlamaz. Binek araçlarda çoğunlukla 500, kamyon/J1939'da 250 |
| **CANH / CANL** | Hattın iki teli. Ters bağlanırsa hiçbir mesaj çözülmez |
| **Transceiver** (alıcı-verici) | Hattın elektriksel seviyesini işlemcinin 3,3 V sinyaline çeviren küçük çip. Olmadan kart hatta bağlanamaz |
| **OBD-II** | Her binek araçta bulunan 16 pinli teşhis soketi ve üzerinde konuşulan standart soru-cevap dili (motor devri, hız, arıza kodları) |
| **PID** | OBD-II'de sorulan "soru numarası": 0C motor devri, 0D araç hızı, 05 soğutma sıvısı sıcaklığı gibi |
| **ECU** | Araçtaki bir kontrol ünitesi. OBD sorusuna 0x7E8 kimliğiyle cevap veren genellikle motor ünitesidir |
| **ACK** (onay) | CAN'de her mesajı duyan düğümler hatta tek bitlik bir onay basar. Onay gelmeyen gönderici hata üretir ve tekrar dener |
| **Listen-only** (yalnız dinleme) | Kartın onay bile basmadığı mod. Hat kartın varlığını hiç hissetmez; araç için en güvenli durum |
| **TEC** | Gönderici hata sayacı. 128'i geçince CAN denetleyicisi "hata-pasif" olur; kart bu eşikte gönderimi kendisi kapatır |
| **NVS** | Kartın kalıcı ayar belleği. Bulunan hat hızı buraya yazılır, yeniden başlatınca korunur |"""

D['04-hizli-baslangic'] = f"""Uygulamayı ilk kez kuran biri için 10 dakikalık yol. Donanım yoksa 4. adımda **Demo** ile devam edilir; gerçek kart ve araç adımları sonraki bölümlerde.

{NOT('Gerekenler','Bilgisayarda <strong>Node.js 18 ya da üstü</strong> ve <strong>Git</strong>. Kart için: NarRTOS <code>nar_esp32s3</code> derlemesi yüklü NAR kartı (Konsol’da <code>help</code> yazınca listede <code>can stream</code> görünmeli) ve bir 3,3 V CAN alıcı-verici.')}

1. **Kodu indirin ve kurun** (bir kez):

```
git clone https://github.com/corezzle/corezzle-can.git
cd corezzle-can
npm install
```

2. **Çalıştırın:** `npm start`. Birkaç saniye sonra uygulama penceresi açılır.

{gorsel('ekran-baslangic.png', 'Açılış ekranı: Karta bağlan ve Demo düğmeleri', 'Açılış. Üstte durum rozetleri (bağlantı, hız, mod), sağda Karta bağlan ve Demo.')}

3. **Kartla:** kartı USB ile takın, **Karta bağlan** deyin, listeden ESP32-S3 portunu seçin. Kart yeni takıldıysa açılış 30 saniye sürebilir; hazır olunca üstte hız ve mod görünür.

4. **Kartsız:** **Demo (sahte kart)** deyin. Yazılım içinde kartı taklit eden bir hat açılır; aşağıdaki adımların hepsi aynı çalışır.

5. **Hızı bulun:** Ayarlar → **Hızı bul**. Yaklaşık 20 saniye sürer; sonuç "bulundu: 500 kbit/s" gibi görünür ve kalıcı yazılır.

6. **İzleyin:** Canlı sekmesine dönün. Mesajlar akıyorsa bağlantı doğrudur.

7. **Sorun:** Gönder → **Gönderimi aç** → listeden *Motor devri* → **Sorgula**. Tabloya motor ünitesinin cevabı çözülmüş değerle düşer.

{UYARI('Araçta ilk denemede','Kontak açık ya da motor çalışır olmalı; çoğu araç kontak kapalıyken hatta hiçbir şey konuşmaz. Hiç mesaj gelmiyorsa önce <strong>CANH/CANL ters mi</strong> ve <strong>GND bağlı mı</strong> diye bakın; bu ikisi ilk denemelerde en sık karşılaşılan sebeptir.')}

Kurulum paketi üretmek için: `npm run make` (macOS için dmg/zip, Windows için Setup.exe, Linux için zip; `out/` klasörüne yazar). Donanımsız testler: `npm test`."""

D['05-donanim-ve-baglantilar'] = f"""**Kısaca:** araç soketinden iki tel ve toprak alıcı-vericiye, alıcı-vericiden dört tel karta. Toplam yedi bağlantı.

{gorsel('baglanti-semasi.png', 'Bağlantı şeması: OBD-II soketi, CAN transceiver, NAR kartı', 'Araç → alıcı-verici → kart. Renkler teller: CANH turuncu, CANL yeşil, toprak gri.')}

## Parçalar

| Parça | Ne | Not |
|---|---|---|
| NAR kartı | NarRTOS Wear yazılımı yüklü ESP32-S3 kartı (`nar_esp32s3` derlemesi) | CAN için GPIO4 ve GPIO6 pedleri kullanılır |
| CAN alıcı-verici | 3,3 V ile çalışan çip: **SN65HVD230**, TJA1051T/3, MCP2562FD (3,3 V beslemeyle) | 5 V çipler (TJA1050, MCP2551) **uygun değildir**; ESP32 pinleri 5 V'a dayanmaz |
| OBD-II kablosu/soketi | Erkek OBD-II fiş ya da soket üzerinden pin 6, 14 ve 4/5'e erişim | Hazır "OBD-II breakout" kablolar işi kolaylaştırır |
| USB kablosu | Kart ↔ bilgisayar; **veri taşıyan** kablo | Yalnız şarj kablosuyla kart hiç görünmez |

## Bağlantı tablosu

| Nereden | Nereye | Not |
|---|---|---|
| OBD-II pin 6 (CANH) | Alıcı-verici CANH | |
| OBD-II pin 14 (CANL) | Alıcı-verici CANL | |
| OBD-II pin 4 ya da 5 (GND) | Alıcı-verici GND | Toprak **zorunlu**; bağlanmazsa hat kararsız olur, mesajlar bozuk gelir ya da hiç gelmez |
| Alıcı-verici TXD (bazı modüllerde CTX) | Kart **GPIO4** | Karttan hatta |
| Alıcı-verici RXD (CRX) | Kart **GPIO6** | Hattan karta |
| Alıcı-verici 3V3 | Kart 3,3 V | |
| Alıcı-verici GND | Kart GND | |

{TEHLIKE('OBD-II pin 16 (+12 V) karta bağlanmaz','Soketin 16. pininde akü gerilimi vardır. Bu hat kartın hiçbir yerine girmez. Kart USB’den beslenir; araçtan beslemek gerekiyorsa arada düzgün bir 12 V → 5 V dönüştürücü olmalı.')}

## Alıcı-verici modülündeki ayarlar

- **120 Ω sonlandırma direnci:** araç hattının iki ucunda zaten var. Modülde bir sonlandırma jumper'ı/direnci varsa **devre dışı** bırakın; üçüncü bir direnç hattı yükler.
- **RS / STBY pini:** varsa GND'ye çekin (yüksek hız modu). Kart yazılımı `PIN_CAN_STBY` tanımlıysa bunu kendisi yapar; NAR derlemesinde tanımlı değildir.
- **Kablo uzunluğu:** soket ile alıcı-verici arası kısa tutulur (bir metre altı), CANH/CANL mümkünse birbirine sarılı.

{UYARI('GPIO5 değil GPIO6','Önceki NAR derlemelerinde CAN girişi GPIO5’teydi. Kasım 2026’dan itibaren GPIO6’dır; eski bir şemaya bakıyorsanız karşılaştırın. Değişiklik kart yazılımında tek bir derleme bayrağıdır (<code>PIN_CAN_RX</code>).')}

## Soketi araçta bulmak

OBD-II soketi direksiyonun altında, çoğunlukla sürücü dizinin hizasında, bazen bir kapak arkasındadır. Trapez biçimli, 16 pinli; pin numaraları soketin üstünde kabartma yazılıdır: üst sıra 1–8, alt sıra 9–16. Belirsizse aracın kılavuzunda "teşhis soketi" başlığına bakın."""

D['06-karta-baglanma-ve-hat-hizi'] = f"""**Kısaca:** Karta bağlan → portu seç → 30 saniyeye kadar bekle → Ayarlar'da Hızı bul. Hız bir kez bulunur, kartta kalıcıdır.

## Bağlanma

1. Kartı USB ile takın. İlk takışta kart açılış testlerini yapar; bu **25–30 saniye** sürer. Uygulama bu süre boyunca "kart açılışı 30 sn sürebilir" der ve bekler.
2. **Karta bağlan** deyin. Açılan listede ESP32-S3 portu görünür (macOS'ta `usbmodem…`, Windows'ta `COM…`, Linux'ta `ttyACM…`). Seçin.
3. Üstteki rozetler dolar: **bağlı**, hız (örn. 250 kbit/s), mod (**listen-only**). Sağda alınan mesaj sayısı, kaç farklı kimlik görüldüğü ve saniyedeki mesaj hızı canlı sayılır.

{NOT('Port listede yoksa','Kablo veri taşımıyor olabilir (yalnız şarj kablosu); başka bir kablo deneyin. Kart başka bir program tarafından açık tutuluyor olabilir (PlatformIO monitörü, başka bir terminal); onu kapatın. Linux’ta kullanıcı <code>dialout</code> grubunda olmalı.')}

## Hat hızı

Kart açılışta kalıcı bellekteki hızı kullanır (ilk kez 250 kbit/s). Araç başka hızda konuşuyorsa Canlı tablo boş kalır. İki yol var:

**Otomatik:** Ayarlar → **Hızı bul**. Kart 500, 250, 125 ve 1000 kbit/s'yi sırayla, her birini birkaç saniye, **hatta görünmeden** (listen-only) dinler. Mesaj gelen hızı seçer, kalıcı yazar ve o hızda dinlemeye devam eder. Sonuç satırı her hızda kaç mesaj sayıldığını gösterir.

{gorsel('ekran-ayarlar-hiz.png', 'Ayarlar sekmesi: Hızı bul sonucu ve kart durumu', 'Hızı bul sonucu: yalnız 500 kbit/s’te mesaj sayıldı. Sağda kartın kendi durum satırı.')}

**Elle:** hızı biliyorsanız listeden seçip **Ayarla ve yeniden başlat** deyin. Kart yeniden başlar (yine ~30 sn) ve yeni hızla açılır.

{UYARI('Tarama sırasında gönderim kapalıdır','Yanlış hızda tek bir mesaj bile göndermek hattı bozar; bu yüzden tarama yalnız dinler. Bulunan hızda da gönderim kendiliğinden açılmaz; Gönder sekmesinden sizin açmanız gerekir.')}

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

**Kartı yeniden başlat** düğmesi `reboot` gönderir; açılış tamamlanınca uygulama kendiliğinden yeniden bağlanır."""

D['07-canli-ve-akis'] = f"""**Kısaca:** Canlı, kimlik başına "şu an ne durumda" tablosudur; Akış, gelen her mesajın zaman sıralı ham listesi.

## Canlı

{gorsel('ekran-canli.png', 'Canlı sekmesi', 'Beş kimlik, biri 29 bit. 0x208 ve 0x348 saniyede 20 kez geliyor; değişen baytlar sarı.')}

| Sütun | Anlamı |
|---|---|
| Kimlik | Mesaj kimliği, onaltılık (0x208) |
| Tür | 11 bit (standart) ya da 29 bit (genişletilmiş) |
| DLC | Veri bayt sayısı |
| Veri (B0 … B7) | Son mesajın baytları. Bir önceki mesaja göre **değişen bayt sarı** vurgulanır; sinyalin hangi baytta olduğunu bulmanın en hızlı yolu budur |
| Sayı | Bu kimlikten kaç mesaj geldi |
| Hz | Saniyedeki tekrar; periyodik sinyaller (devir, hız) yüksek, olay mesajları düşük çıkar |
| Son | Son görülme, kart açılışından itibaren milisaniye |

Üstteki araçlar:

- **Kimlik süz:** `208` yazınca yalnız o kimlik; `7E` yazınca 0x7E0–0x7EF (OBD cevapları) gibi kısmi eşleşme.
- **Yalnız değişenler:** veri baytı hiç değişmeyen kimlikleri gizler; sürüş sırasında hangi sinyallerin canlı olduğunu görmek için.
- **Baytları ondalık göster:** onaltılık yerine 0–255. Bir baytın ne olduğunu tahmin ederken (örneğin 0x1C = 28 km/sa) işe yarar.
- **Duraklat:** tabloyu dondurur, arkada sayım sürer. **Tabloyu temizle:** sayaçları sıfırlar.

{NOT('Bir sinyali bulma yöntemi','Gaza basıp bırakın: Canlı’da sarı yanan baytlar motor devriyle ilgili olanlardır. Fren pedalına basın: tek bir bayt değişiyorsa o bir bit sinyalidir. Bu işin standart yolu budur; kimlik tabloları üreticiye özel olduğu için uygulama bunu sizin yerinize yapamaz.')}

## Akış

{gorsel('ekran-akis.png', 'Akış sekmesi: ham satırlar', 'Akış: her satır bir mesaj, kartın gönderdiği biçimde. Süzgeç kimliğe ya da bayta bakar.')}

Her satır kartın ürettiği ham akış satırıdır:

```
CAN,<ms>,<0xKIMLIK>,<ext>,<dlc>,<B0 B1 … B7>
CAN,27900,0x00000208,0,8,13 5E 32 00 1F 32 32 32
```

Son 2000 satır tutulur; eskiler düşer. **Süz** kutusu hem kimliğe hem bayt değerine bakar (`5E` yazınca verisinde 5E geçen satırlar). **Duraklat** ekranı dondurur, Kayıt sekmesindeki kayıt etkilenmez.

{UYARI('Yoğun hatlarda','Binek araç hattı saniyede 500–2000 mesaj üretebilir. Akış görünümü bunu ekrana yetiştirir ama okunması zordur; o durumda Canlı tabloya bakın, ham veriyi Kayıt ile dosyaya alın.')}"""

D['08-gonder-obd-ve-guvenlik-kilidi'] = f"""**Kısaca:** gönderim kapalı başlar. Açmak için hat hızı doğrulanmış olmalı. Açılınca hazır OBD-II soruları tek tıkla sorulur, cevap çözülmüş gelir.

## Güvenlik kilidi

Kart her açılışta **listen-only** moddadır: hatta tek bir bit bile basmaz, onay (ACK) vermez. Bu modda hiçbir şey gönderilemez. Gönder sekmesindeki **Gönderimi aç** düğmesi kartı NORMAL moda alır; kart bunu ancak **pasif dinlemede en az bir mesaj görmüşse** kabul eder. Mesaj görülmediyse hız doğrulanmamış demektir ve kart reddeder:

```
ERR: once pasif dinlemede frame gorulmeli (rx_total=0, bus_err=0). Hiz dogru mu?
```

{TEHLIKE('Neden bu kadar katı?','Yanlış hızda NORMAL modda duran bir düğüm, hattaki her mesajı hatalı sayıp sürekli <strong>hata frame’i</strong> basar. Araç bunu hat arızası olarak görür: göstergeler sönebilir, devir ve hız 0’a düşebilir, uyarı ışıkları yanabilir. Bu durum ilk saha denemesinde bir araçta bizzat yaşandı; kilit o günden sonra eklendi. Kart ayrıca gönderim açıkken hata sayacı (TEC) 128’e dayanırsa gönderimi <strong>kendisi kapatıp</strong> listen-only’ye döner.')}

**Hız doğrulanmadan zorla** onay kutusu yalnız masa testi içindir (iki kart karşılıklı, araç yok). Araçta kullanmayın; uygulama işaretlendiğinde bir kez daha sorar.

## OBD-II sorgu

{gorsel('ekran-gonder-obd.png', 'Gönder sekmesi: OBD-II sorgu tablosu ve ham frame gönderme', 'Üç sorgu: motor devri, araç hızı, soğutma sıvısı sıcaklığı. Değer sütunu çözülmüş, Ham sütunu cevabın baytları.')}

Listeden bir soru seçip **Sorgula** deyin. Kart 0x7DF kimliğine standart isteği yazar, 0x7E8–0x7EF arasından gelen cevapları toplar; uygulama cevabı çözüp tabloya ekler: zaman, cevap veren ünite (ECU), PID, ad, çözülmüş değer ve ham baytlar. **Her N sn tekrarla** ile aynı soru periyodik sorulur (devir izlemek gibi); Gönderimi kapat ya da Ayır tekrarı durdurur.

Hazır sorular (SAE J1979, mod 01):

| PID | Ad | Birim |
|---|---|---|
| 00 | Desteklenen PID'ler (01–20), bit haritası | |
| 04 | Motor yükü | % |
| 05 | Soğutma sıvısı sıcaklığı | °C |
| 0B | Emme manifoldu basıncı | kPa |
| 0C | Motor devri | d/dk |
| 0D | Araç hızı | km/sa |
| 0F | Emme havası sıcaklığı | °C |
| 10 | Hava kütle akışı (MAF) | g/s |
| 11 | Gaz kelebeği konumu | % |
| 1F | Motor çalışma süresi | s |
| 21 | Arıza ışığı yanalı mesafe | km |
| 2F | Yakıt seviyesi | % |
| 33 | Barometrik basınç | kPa |
| 42 | Kontrol modülü voltajı | V |
| 46 | Ortam sıcaklığı | °C |
| 5C | Motor yağı sıcaklığı | °C |
| 5E | Yakıt tüketim hızı | L/sa |

Listede olmayan bir soru için **özel** kutusuna PID ve isteğe bağlı mod yazın: `0C 01`. Araç o PID'i desteklemiyorsa cevap gelmez ya da "Olumsuz cevap" (NRC) döner; önce PID 00 ile hangilerinin desteklendiğine bakmak iyi bir alışkanlıktır.

{NOT('Cevap gelmiyorsa','Kontak açık mı? Bazı araçlarda motor çalışmadan motor ünitesi cevap vermez. Hız doğru mu (Canlı’da mesaj akıyor mu)? Bazı araçlarda OBD soketi ile asıl hat arasında bir <em>gateway</em> vardır; sorgulara cevap verir ama hattın kendisini göstermez; o araçlarda Canlı tablo boş kalırken OBD çalışabilir ya da tersi.')}

## Ham frame gönder

Kimlik ve 0–8 bayt yazıp **Bir kez gönder**; ya da **her N ms tekrarla**. Kimlik 0x7FF'ten büyükse 29 bit gönderilir. Bu kutu standart OBD dışında hatta mesaj basmak içindir: ne gönderdiğinizi bilmiyorsanız kullanmayın. Varsayılan değer (0x7DF, `02 01 0C …`) motor devri sorusunun ham hâlidir; OBD kutusuyla aynı işi yapar."""

D['09-kayit'] = f"""**Kısaca:** Kaydı başlat, sürüşü yap, Kaydı durdur, CSV olarak kaydet. Dosya tablo programında ve Python'da doğrudan açılır.

{gorsel('ekran-kayit.png', 'Kayıt sekmesi', 'Dört saniyelik kayıt: 204 mesaj. CSV olarak kaydet ve Kaydı at düğmeleri kayıt durunca açılır.')}

Kayıt bellekte tutulur ve Akış görünümünden bağımsızdır (Akış duraklatılsa da kayıt sürer). Durdurunca özet görünür: mesaj sayısı ve süre. **CSV olarak kaydet** dosya seçtirir; ad otomatik `can-kayit-YYYY-AA-GG-SS-DD-SS.csv`. **Kaydı at** belleği boşaltır.

## Dosya biçimi

```
zaman_ms,kimlik,ext,dlc,b0,b1,b2,b3,b4,b5,b6,b7
27900,0x00000208,0,8,13,5E,32,00,1F,32,32,32
27800,0x000002F5,0,7,AD,00,00,00,02,00,11,
```

| Sütun | Anlamı |
|---|---|
| zaman_ms | Kartın açılışından itibaren milisaniye (kartın saati; bilgisayar saati değil) |
| kimlik | 8 haneli onaltılık, başa sıfırlı |
| ext | 0 = 11 bit, 1 = 29 bit |
| dlc | Bayt sayısı |
| b0…b7 | Onaltılık baytlar; dlc'den sonrası boş |

{NOT('Sonradan inceleme','Dosyayı Excel/Numbers’ta açıp kimliğe göre süzebilir, Python’da <code>pandas.read_csv</code> ile okuyup bir baytı zamana karşı çizdirebilirsiniz. Sinyal çözümü (hangi bayt devir, çarpan kaç) üreticiye özeldir; bilinen tanım dosyaları (DBC) varsa bu CSV’yi onlarla eşlemek sonraki adımdır.')}

{UYARI('Uzun kayıtlar','Bellek kaydı; saniyede 1000 mesajlık bir hatta bir saat ≈ 3,6 milyon satır, birkaç yüz MB. Uzun kayıtlarda dosyayı 10–15 dakikada bir kaydedip yeni kayıt açın.')}"""

D['10-konsol-ve-kart-komutlari'] = f"""**Kısaca:** Konsol, karta doğrudan komut yazdığınız yerdir. Uygulamanın düğmeleri aslında bu komutları gönderir; kartın bütün cevapları burada akar.

{gorsel('ekran-konsol.png', 'Konsol sekmesi: kartın komut cevapları', 'Konsol: hız tarama, durum satırları ve bir OBD sorgusunun kart tarafındaki izleri.')}

Komutu yazıp **Gönder** ya da Enter. Kartın her cevap satırı `[cmd]` ile başlar; `OK:` ya da `ERR:` komutun bittiğini söyler. Konsol boşken bile uygulamanın arka planda gönderdiği komutlar (her 5 sn `get can`) ve cevapları görünür; bir sorun olduğunda ilk bakılacak yer burasıdır.

## Uygulamanın kullandığı kart komutları

| Komut | Ne yapar |
|---|---|
| `get can` | Durum: hız, mod, sayaçlar, hata satırı |
| `can stream on` / `off` | Her mesajı anında satır olarak akıt (Canlı ve Akış bunu dinler) |
| `can scan [sn]` | Hız tarama: 500/250/125/1000, her biri `sn` saniye, listen-only; bulunan kalıcı yazılır |
| `set can bitrate <kbps>` | Hızı elle ayarla (125/250/500/1000), kalıcı; yeniden başlatma ister |
| `set can tx on` / `off` / `force` | Gönderimi aç (NORMAL) / kapat (LISTEN-ONLY) / doğrulamasız aç (masa testi) |
| `can obd <pid> [mod]` | OBD-II isteği 0x7DF; cevaplar `cevap 0x000007E8,…` satırlarıyla, sonunda `OK: obd bitti (N cevap)` |
| `can send 0xID,b0,…,b7` | Tek ham mesaj |
| `can dump [n]` · `can stats` · `can clear` | Karttaki kimlik tablosunu listele / sayaçlar / temizle |
| `reboot` | Kartı yeniden başlat (açılış testleriyle ~30 sn) |

Bunların dışında kartın bütün NarRTOS komutları da çalışır: `help` tam listeyi verir, `info` sürüm ve bellek, `get rails` güç rayları. Ayrıntı için NarRTOS Wear belgesinin **Komut Arayüzü** bölümü.

{NOT('Akış satırı ile komut cevabı karışmaz','Kart, akış satırlarını <code>CAN,</code> ile, komut cevaplarını <code>[cmd]</code> ile başlatır. Uygulama ikisini bu ön eklere göre ayırır; Konsol yalnız <code>[cmd]</code> satırlarını gösterir, <code>CAN,</code> satırları Canlı/Akış/Kayıt’a gider.')}"""

D['11-guvenlik-modeli-ve-sahada-ogrenilenler'] = f"""**Kısaca:** araç hattına bağlanan her şey hattı bozabilir. Uygulama ve kart bunu üç katmanla engeller; katmanlar sahada yaşanan iki olaydan çıktı.

## Üç katman

| Katman | Nerede | Ne yapar |
|---|---|---|
| Varsayılan listen-only | Kart yazılımı | Her açılışta yalnız dinler; ACK yok, hata frame'i yok. Hız yanlış olsa bile hat etkilenmez |
| Gönderim kilidi | Kart yazılımı | `set can tx on` yalnız pasif dinlemede mesaj görüldükten sonra kabul edilir; hız doğrulanmış demektir |
| Kendini kapatma | Kart yazılımı | Gönderim açıkken TEC 128'e dayanırsa (gönderilen mesajlar onaylanmıyor) kart gönderimi kapatır, listen-only'ye döner, uygulamaya bildirir |

Uygulama tarafında: gönderim yalnız Gönder sekmesindeki düğmeyle ve o oturum için açılır; Ayır ya da yeniden bağlanma kilidi geri getirir. "Zorla" seçeneği ek bir onay ister.

## Sahada yaşanan iki olay

{UYARI('1. Yanlış hızda gönderim göstergeleri söndürdü','İlk araç denemesinde kart o zamanki yazılımla NORMAL modda açılmıştı ve hız yanlıştı. Hattaki mesajlar kartın gözünde bozuk görünüyor, kart her birine hata frame’i basıyordu. Araç bunu hat arızası saydı: gösterge paneli yanıp söndü, devir ve hız göstergesi sıfıra indi. Kart çıkarılınca araç kendine geldi, kalıcı bir hasar olmadı. Sonuç: varsayılan listen-only, gönderim kilidi ve TEC eşiğinde kendini kapatma.')}

{UYARI('2. Hiç mesaj gelmiyordu: CANH ile CANL tersti','Aynı araçta doğru hızda bile tablo boş kaldı; hata sayaçları artıyordu. Sebep iki telin yer değiştirmiş olmasıydı. Düzeltilince 500 kbit/s’te 4 saniyede 2000’den fazla mesaj, 10 farklı kimlik geldi. Sonuç: Ayarlar’daki bağlantı notları ve bu belgedeki "önce CANH/CANL’ye bak" uyarıları.')}

Üçüncü bir gözlem: 2020 model bir araçta OBD soketinde **hiç** mesaj yoktu, hata da yoktu. Bazı üreticiler soketi asıl hattan bir gateway ile ayırır; soket yalnız OBD sorgularına cevap verir, hattın kendi trafiğini göstermez. Böyle araçlarda Canlı tablo boş kalabilir ama OBD sorgusu çalışır.

## Araçta çalışma kuralları

1. Kontak kapalıyken bağlayın, sonra kontağı açın.
2. Önce **Hızı bul**; Canlı'da mesaj görmeden gönderimi açmayın.
3. Araçta yalnız standart OBD-II sorguları gönderin. Ham frame kutusunu araçta kullanmayın.
4. Göstergelerde bir tuhaflık görürseniz önce **Gönderimi kapat**, sonra kabloyu çekin.
5. Aracı sürerken ölçüm yapacaksanız bilgisayara bakan sürücü olmasın; kayıt alıp sonra inceleyin."""

D['12-demo-modu'] = f"""**Kısaca:** üstteki **Demo (sahte kart)** düğmesi, yazılım içinde kartı ve aracı taklit eden bir hat açar. Donanım olmadan uygulamanın tamamı denenir.

Sahte kart gerçek NAR yazılımının komut cevaplarını birebir biçimde üretir; uygulama onun sahte olduğunu bilmez. Bu yüzden hız bulma, gönderim kilidi, OBD çözümü ve kayıt dahil her akış gerçek kartla aynı yoldan geçer.

| Özellik | Sahte kartta |
|---|---|
| Açılış hızı | 250 kbit/s (gerçek kartın fabrika değeri gibi); sahte araç 500'de konuşur, bu yüzden tablo önce boştur ve **Hızı bul** gerekir |
| Hat trafiği | 500 kbit/s'te 0x208 ve 0x348 saniyede 20 kez (devir ve hız baytları değişir), 0x2F5 ve 0x432 daha seyrek, bir de 29 bit 0x18FEF100 |
| Hız tarama | 500'de ~45 mesaj/sn sayar, diğer hızlarda 0 ve "hata var" |
| Gönderim kilidi | Mesaj görülmeden `tx on` reddedilir; yanlış hızda gönderim denenirse hata sayaçları fırlar (gerçek karttaki gibi) |
| OBD | 0x7E8'den cevap verir: devir, hız, sıcaklık ve diğer PID'ler; yanlış hızda "cevap yok" |
| Yeniden başlat | `reboot` sayaçları sıfırlar ve 250'ye döner |

{NOT('Gerçek araç verisi değildir','Kimlikler ve baytlar bir binek aracın hattına <em>benzetilmiştir</em>; eğitim ve arayüz tanıtımı içindir. Gerçek araçta hangi kimliğin ne olduğu üreticiye özeldir.')}

Demo, eğitimde de kullanılır: NarRTOS Akademi'nin "Aracı dinle" dersi aynı sahte kartla CAN akışını üç boyutlu sahnede gösterir."""

D['13-sorun-giderme'] = f"""Belirtiden sebebe. Önce Konsol'daki son `[cmd]` satırlarına bakın; çoğu sorunun cevabı orada yazar.

| Belirti | En olası sebep | Ne yapmalı |
|---|---|---|
| Port listede yok | Yalnız şarj kablosu; kart başka programda açık; Linux'ta izin | Kabloyu değiştirin; PlatformIO monitörünü kapatın; `dialout` grubuna ekleyin |
| "bağlanıyor… 30 sn" uzun sürüyor, sonra hata | Kart açılış testleri; ya da kartta `can stream` tanımayan eski yazılım | 40 sn bekleyin; Konsol'da `help` yazın, listede `can stream` yoksa kart yazılımını güncelleyin |
| Bağlı ama Canlı boş, hata sayaçları 0 | Hız yanlış **ya da** kontak kapalı **ya da** gateway'li araç | Kontağı açın; Ayarlar → Hızı bul; OBD sorgusu deneyin |
| Canlı boş, `bus_err`/`rx_err` artıyor | CANH/CANL ters; GND bağlı değil; hız yanlış | Telleri değiştirin; toprağı bağlayın; Hızı bul |
| Hızı bul her hızda 0 | Hat sessiz (kontak kapalı) ya da kablolama | Kontak; CANH/CANL/GND; alıcı-vericinin 3,3 V beslemesi |
| Gönderimi aç → "once pasif dinlemede frame gorulmeli" | Hız doğrulanmadı | Önce Canlı'da mesaj görün. Masa testiyse "zorla" |
| OBD cevap yok | Kontak kapalı; PID desteklenmiyor; gateway | Kontak; PID 00 ile destek haritası; başka PID |
| Göstergeler yanıp söndü, devir 0'a düştü | Yanlış hızda gönderim (eski yazılım ya da "zorla") | Hemen Gönderimi kapat, kabloyu çekin; kart yazılımını güncelleyin |
| Gönderim kendiliğinden kapandı | TEC 128: mesajlar onaylanmıyor | Hız ve kablolama; araçta başka düğüm yoksa (masa testi) ACK verecek ikinci düğüm gerekir |
| Tablo "taşma" sayacı artıyor | Araç 96'dan fazla kimlik yayınlıyor | Normal; Canlı'da süzgeç kullanın. Kart tablosu büyütülebilir (yazılım) |
| Akış kesik kesik, "dropped" artıyor | USB hattı yoğunluğa yetişmiyor | Akışı kapatıp yalnız Canlı tabloyu izleyin; kayıt için kısa oturumlar |

{NOT('Her şey doğru görünüyor ama emin değilim','İki kartı karşılıklı bağlayıp (CANH–CANH, CANL–CANL, GND–GND, uçlarda 120 Ω) birinde "zorla" ile gönderim açın, diğerinde Canlı’yı izleyin. Bu masa düzeneği kablolama ve yazılımı araçtan bağımsız doğrular.')}"""

D['14-kaynak-kod-testler-ve-lisans'] = """Uygulama açık kaynaktır: <a href="https://github.com/corezzle/corezzle-can">github.com/corezzle/corezzle-can</a>, Apache-2.0 lisansı. Electron üzerinde çalışır; arayüz düz HTML/JS'dir, çerçeve yoktur.

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

## Geliştirme notları

- Yeni bir OBD PID eklemek: `obd.js` içindeki listeye bir satır (PID, ad, birim, çözüm fonksiyonu).
- Kart komutlarının biçimi değişirse `board.js` içindeki çözücüler ve `fake-board.js` birlikte güncellenir; testler ikisini de sınar.
- Uygulama kart yazılımına yalnız bu belgede listelenen komutları gönderir; kart tarafı NarRTOS Wear deposundadır.

## Lisans

Apache License 2.0; ayrıntı `LICENSE` ve `NOTICE` dosyalarında. Electron ve Electron Forge MIT lisanslıdır.

Corezzle Electronics"""

for ad, metin in D.items():
    (OUT / (ad + '.md')).write_text(metin.strip() + '\n', encoding='utf-8')
print(len(D), 'bölüm yazıldı')
for ad in D: print(ad, os.path.getsize(OUT / (ad + '.md')))
