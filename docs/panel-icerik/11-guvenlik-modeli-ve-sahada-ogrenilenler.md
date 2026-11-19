**Kısaca:** araç hattına bağlanan her şey hattı bozabilir. Uygulama ve kart bunu üç katmanla engeller; katmanlar sahada yaşanan iki olaydan çıktı.

## Üç katman

| Katman | Nerede | Ne yapar |
|---|---|---|
| Varsayılan listen-only | Kart yazılımı | Her açılışta yalnız dinler; ACK yok, hata frame'i yok. Hız yanlış olsa bile hat etkilenmez |
| Gönderim kilidi | Kart yazılımı | `set can tx on` yalnız pasif dinlemede mesaj görüldükten sonra kabul edilir; hız doğrulanmış demektir |
| Kendini kapatma | Kart yazılımı | Gönderim açıkken TEC 128'e dayanırsa (gönderilen mesajlar onaylanmıyor) kart gönderimi kapatır, listen-only'ye döner, uygulamaya bildirir |

Uygulama tarafında: gönderim yalnız Gönder sekmesindeki düğmeyle ve o oturum için açılır; Ayır ya da yeniden bağlanma kilidi geri getirir. "Zorla" seçeneği ek bir onay ister.

## Sahada yaşanan iki olay

<div style="border-left:4px solid #D9922F;background:rgba(217,146,47,.12);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">1. Yanlış hızda gönderim göstergeleri söndürdü</div><div style="line-height:1.6;color:inherit">İlk araç denemesinde kart o zamanki yazılımla NORMAL modda açılmıştı ve hız yanlıştı. Hattaki mesajlar kartın gözünde bozuk görünüyor, kart her birine hata frame’i basıyordu. Araç bunu hat arızası saydı: gösterge paneli yanıp söndü, devir ve hız göstergesi sıfıra indi. Kart çıkarılınca araç kendine geldi, kalıcı bir hasar olmadı. Sonuç: varsayılan listen-only, gönderim kilidi ve TEC eşiğinde kendini kapatma.</div></div>

<div style="border-left:4px solid #D9922F;background:rgba(217,146,47,.12);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">2. Hiç mesaj gelmiyordu: CANH ile CANL tersti</div><div style="line-height:1.6;color:inherit">Aynı araçta doğru hızda bile tablo boş kaldı; hata sayaçları artıyordu. Sebep iki telin yer değiştirmiş olmasıydı. Düzeltilince 500 kbit/s’te 4 saniyede 2000’den fazla mesaj, 10 farklı kimlik geldi. Sonuç: Ayarlar’daki bağlantı notları ve bu belgedeki "önce CANH/CANL’ye bak" uyarıları.</div></div>

Üçüncü bir gözlem: 2020 model bir araçta OBD soketinde **hiç** mesaj yoktu, hata da yoktu. Bazı üreticiler soketi asıl hattan bir gateway ile ayırır; soket yalnız OBD sorgularına cevap verir, hattın kendi trafiğini göstermez. Böyle araçlarda Canlı tablo boş kalabilir ama OBD sorgusu çalışır.

## Araçta çalışma kuralları

1. Kontak kapalıyken bağlayın, sonra kontağı açın.
2. Önce **Hızı bul**; Canlı'da mesaj görmeden gönderimi açmayın.
3. Araçta yalnız standart OBD-II sorguları gönderin. Ham frame kutusunu araçta kullanmayın.
4. Göstergelerde bir tuhaflık görürseniz önce **Gönderimi kapat**, sonra kabloyu çekin.
5. Aracı sürerken ölçüm yapacaksanız bilgisayara bakan sürücü olmasın; kayıt alıp sonra inceleyin.
