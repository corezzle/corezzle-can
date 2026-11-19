**Kısaca:** Konsol, karta doğrudan komut yazdığınız yerdir. Uygulamanın düğmeleri aslında bu komutları gönderir; kartın bütün cevapları burada akar.

![Konsol sekmesi: kartın komut cevapları](GORSEL: ekran-konsol.png)

<div style="font-size:12.5px;color:inherit;opacity:.72;text-align:center;margin:-6px 0 14px"><em>Konsol: hız tarama, durum satırları ve bir OBD sorgusunun kart tarafındaki izleri.</em></div>

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

<div style="border-left:4px solid #12A0AD;background:rgba(18,160,173,.10);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">Akış satırı ile komut cevabı karışmaz</div><div style="line-height:1.6;color:inherit">Kart, akış satırlarını <code>CAN,</code> ile, komut cevaplarını <code>[cmd]</code> ile başlatır. Uygulama ikisini bu ön eklere göre ayırır; Konsol yalnız <code>[cmd]</code> satırlarını gösterir, <code>CAN,</code> satırları Canlı/Akış/Kayıt’a gider.</div></div>
