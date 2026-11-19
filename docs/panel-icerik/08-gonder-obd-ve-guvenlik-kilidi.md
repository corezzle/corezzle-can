**Kısaca:** gönderim kapalı başlar. Açmak için hat hızı doğrulanmış olmalı. Açılınca hazır OBD-II soruları tek tıkla sorulur, cevap çözülmüş gelir.

## Güvenlik kilidi

Kart her açılışta **listen-only** moddadır: hatta tek bir bit bile basmaz, onay (ACK) vermez. Bu modda hiçbir şey gönderilemez. Gönder sekmesindeki **Gönderimi aç** düğmesi kartı NORMAL moda alır; kart bunu ancak **pasif dinlemede en az bir mesaj görmüşse** kabul eder. Mesaj görülmediyse hız doğrulanmamış demektir ve kart reddeder:

```
ERR: once pasif dinlemede frame gorulmeli (rx_total=0, bus_err=0). Hiz dogru mu?
```

<div style="border-left:4px solid #D95757;background:rgba(217,87,87,.12);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">Neden bu kadar katı?</div><div style="line-height:1.6;color:inherit">Yanlış hızda NORMAL modda duran bir düğüm, hattaki her mesajı hatalı sayıp sürekli <strong>hata frame’i</strong> basar. Araç bunu hat arızası olarak görür: göstergeler sönebilir, devir ve hız 0’a düşebilir, uyarı ışıkları yanabilir. Bu durum ilk saha denemesinde bir araçta bizzat yaşandı; kilit o günden sonra eklendi. Kart ayrıca gönderim açıkken hata sayacı (TEC) 128’e dayanırsa gönderimi <strong>kendisi kapatıp</strong> listen-only’ye döner.</div></div>

**Hız doğrulanmadan zorla** onay kutusu yalnız masa testi içindir (iki kart karşılıklı, araç yok). Araçta kullanmayın; uygulama işaretlendiğinde bir kez daha sorar.

## OBD-II sorgu

![Gönder sekmesi: OBD-II sorgu tablosu ve ham frame gönderme](GORSEL: ekran-gonder-obd.png)

<div style="font-size:12.5px;color:inherit;opacity:.72;text-align:center;margin:-6px 0 14px"><em>Üç sorgu: motor devri, araç hızı, soğutma sıvısı sıcaklığı. Değer sütunu çözülmüş, Ham sütunu cevabın baytları.</em></div>

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

<div style="border-left:4px solid #12A0AD;background:rgba(18,160,173,.10);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">Cevap gelmiyorsa</div><div style="line-height:1.6;color:inherit">Kontak açık mı? Bazı araçlarda motor çalışmadan motor ünitesi cevap vermez. Hız doğru mu (Canlı’da mesaj akıyor mu)? Bazı araçlarda OBD soketi ile asıl hat arasında bir <em>gateway</em> vardır; sorgulara cevap verir ama hattın kendisini göstermez; o araçlarda Canlı tablo boş kalırken OBD çalışabilir ya da tersi.</div></div>

## Ham frame gönder

Kimlik ve 0–8 bayt yazıp **Bir kez gönder**; ya da **her N ms tekrarla**. Kimlik 0x7FF'ten büyükse 29 bit gönderilir. Bu kutu standart OBD dışında hatta mesaj basmak içindir: ne gönderdiğinizi bilmiyorsanız kullanmayın. Varsayılan değer (0x7DF, `02 01 0C …`) motor devri sorusunun ham hâlidir; OBD kutusuyla aynı işi yapar.
