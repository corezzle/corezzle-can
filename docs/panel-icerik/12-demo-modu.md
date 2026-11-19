**Kısaca:** üstteki **Demo (sahte kart)** düğmesi, yazılım içinde kartı ve aracı taklit eden bir hat açar. Donanım olmadan uygulamanın tamamı denenir.

Sahte kart gerçek NAR yazılımının komut cevaplarını birebir biçimde üretir; uygulama onun sahte olduğunu bilmez. Bu yüzden hız bulma, gönderim kilidi, OBD çözümü ve kayıt dahil her akış gerçek kartla aynı yoldan geçer.

| Özellik | Sahte kartta |
|---|---|
| Açılış hızı | 250 kbit/s (gerçek kartın fabrika değeri gibi); sahte araç 500'de konuşur, bu yüzden tablo önce boştur ve **Hızı bul** gerekir |
| Hat trafiği | 500 kbit/s'te 0x208 ve 0x348 saniyede 20 kez (devir ve hız baytları değişir), 0x2F5 ve 0x432 daha seyrek, bir de 29 bit 0x18FEF100 |
| Hız tarama | 500'de ~45 mesaj/sn sayar, diğer hızlarda 0 ve "hata var" |
| Gönderim kilidi | Mesaj görülmeden `tx on` reddedilir; yanlış hızda gönderim denenirse hata sayaçları fırlar (gerçek karttaki gibi) |
| OBD | 0x7E8'den cevap verir: devir, hız, sıcaklık ve diğer PID'ler; yanlış hızda "cevap yok" |
| Yeniden başlat | `reboot` sayaçları sıfırlar ve 250'ye döner |

<div style="border-left:4px solid #12A0AD;background:rgba(18,160,173,.10);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">Gerçek araç verisi değildir</div><div style="line-height:1.6;color:inherit">Kimlikler ve baytlar bir binek aracın hattına <em>benzetilmiştir</em>; eğitim ve arayüz tanıtımı içindir. Gerçek araçta hangi kimliğin ne olduğu üreticiye özeldir.</div></div>

Demo, eğitimde de kullanılır: NarRTOS Akademi'nin "Aracı dinle" dersi aynı sahte kartla CAN akışını üç boyutlu sahnede gösterir.
