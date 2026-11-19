**Kısaca:** Kaydı başlat, sürüşü yap, Kaydı durdur, CSV olarak kaydet. Dosya tablo programında ve Python'da doğrudan açılır.

![Kayıt sekmesi](GORSEL: ekran-kayit.png)

<div style="font-size:12.5px;color:inherit;opacity:.72;text-align:center;margin:-6px 0 14px"><em>Dört saniyelik kayıt: 204 mesaj. CSV olarak kaydet ve Kaydı at düğmeleri kayıt durunca açılır.</em></div>

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

<div style="border-left:4px solid #12A0AD;background:rgba(18,160,173,.10);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">Sonradan inceleme</div><div style="line-height:1.6;color:inherit">Dosyayı Excel/Numbers’ta açıp kimliğe göre süzebilir, Python’da <code>pandas.read_csv</code> ile okuyup bir baytı zamana karşı çizdirebilirsiniz. Sinyal çözümü (hangi bayt devir, çarpan kaç) üreticiye özeldir; bilinen tanım dosyaları (DBC) varsa bu CSV’yi onlarla eşlemek sonraki adımdır.</div></div>

<div style="border-left:4px solid #D9922F;background:rgba(217,146,47,.12);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">Uzun kayıtlar</div><div style="line-height:1.6;color:inherit">Bellek kaydı; saniyede 1000 mesajlık bir hatta bir saat ≈ 3,6 milyon satır, birkaç yüz MB. Uzun kayıtlarda dosyayı 10–15 dakikada bir kaydedip yeni kayıt açın.</div></div>
