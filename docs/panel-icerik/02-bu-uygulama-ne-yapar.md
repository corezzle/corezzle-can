Modern bir araçta onlarca küçük bilgisayar var: motor kontrol ünitesi, fren sistemi, gösterge paneli, kapı modülleri. Hepsi iki telden oluşan ortak bir hat üzerinden sürekli konuşur. Bu hatta **CAN** denir. Araç çalışırken hatta saniyede binlerce kısa mesaj akar: motor devri, hız, pedal konumu, sıcaklıklar, uyarılar.

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

<div style="border-left:4px solid #12A0AD;background:rgba(18,160,173,.10);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">NarRTOS Drive ile ilişkisi</div><div style="line-height:1.6;color:inherit">Corezzle’ın ekransız araç takip ürünü NarRTOS Drive de aynı CAN yaklaşımını kullanır: cihaz ham mesajı iletir, çözüm sunucudadır. Corezzle CAN o ürünün sahadaki gözü gibi düşünülebilir; kart tarafındaki <code>can stream</code> komutunu tanıyan her NarRTOS derlemesiyle çalışır.</div></div>
