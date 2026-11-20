Belirtiden sebebe. Önce Konsol'daki son `[cmd]` satırlarına bakın; çoğu sorunun cevabı orada yazar.

| Belirti | En olası sebep | Ne yapmalı |
|---|---|---|
| Windows: "Windows protected your PC" | Uygulama yeni, Windows tanımıyor | *More info* → *Run anyway*; standart uyarı |
| macOS: "cannot be opened because Apple cannot check it" | İmzasız uygulama uyarısı | Uygulamaya sağ tık → *Aç*; olmazsa *Sistem Ayarları → Gizlilik ve Güvenlik → Yine de Aç*. Bir kez yeter |
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

<div style="border-left:4px solid #12A0AD;background:rgba(18,160,173,.10);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">Her şey doğru görünüyor ama emin değilim</div><div style="line-height:1.6;color:inherit">İki kartı karşılıklı bağlayıp (CANH–CANH, CANL–CANL, GND–GND, uçlarda 120 Ω) birinde "zorla" ile gönderim açın, diğerinde Canlı’yı izleyin. Bu masa düzeneği kablolama ve yazılımı araçtan bağımsız doğrular.</div></div>
