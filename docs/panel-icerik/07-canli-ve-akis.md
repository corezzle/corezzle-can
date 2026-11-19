**Kısaca:** Canlı, kimlik başına "şu an ne durumda" tablosudur; Akış, gelen her mesajın zaman sıralı ham listesi.

## Canlı

![Canlı sekmesi](GORSEL: ekran-canli.png)

<div style="font-size:12.5px;color:inherit;opacity:.72;text-align:center;margin:-6px 0 14px"><em>Beş kimlik, biri 29 bit. 0x208 ve 0x348 saniyede 20 kez geliyor; değişen baytlar sarı.</em></div>

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

<div style="border-left:4px solid #12A0AD;background:rgba(18,160,173,.10);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">Bir sinyali bulma yöntemi</div><div style="line-height:1.6;color:inherit">Gaza basıp bırakın: Canlı’da sarı yanan baytlar motor devriyle ilgili olanlardır. Fren pedalına basın: tek bir bayt değişiyorsa o bir bit sinyalidir. Bu işin standart yolu budur; kimlik tabloları üreticiye özel olduğu için uygulama bunu sizin yerinize yapamaz.</div></div>

## Akış

![Akış sekmesi: ham satırlar](GORSEL: ekran-akis.png)

<div style="font-size:12.5px;color:inherit;opacity:.72;text-align:center;margin:-6px 0 14px"><em>Akış: her satır bir mesaj, kartın gönderdiği biçimde. Süzgeç kimliğe ya da bayta bakar.</em></div>

Her satır kartın ürettiği ham akış satırıdır:

```
CAN,<ms>,<0xKIMLIK>,<ext>,<dlc>,<B0 B1 … B7>
CAN,27900,0x00000208,0,8,13 5E 32 00 1F 32 32 32
```

Son 2000 satır tutulur; eskiler düşer. **Süz** kutusu hem kimliğe hem bayt değerine bakar (`5E` yazınca verisinde 5E geçen satırlar). **Duraklat** ekranı dondurur, Kayıt sekmesindeki kayıt etkilenmez.

<div style="border-left:4px solid #D9922F;background:rgba(217,146,47,.12);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">Yoğun hatlarda</div><div style="line-height:1.6;color:inherit">Binek araç hattı saniyede 500–2000 mesaj üretebilir. Akış görünümü bunu ekrana yetiştirir ama okunması zordur; o durumda Canlı tabloya bakın, ham veriyi Kayıt ile dosyaya alın.</div></div>
