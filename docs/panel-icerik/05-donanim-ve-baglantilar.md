**Kısaca:** araç soketinden iki tel ve toprak alıcı-vericiye, alıcı-vericiden dört tel karta. Toplam yedi bağlantı.

![Bağlantı şeması: OBD-II soketi, CAN transceiver, NAR kartı](GORSEL: baglanti-semasi.png)

<div style="font-size:12.5px;color:inherit;opacity:.72;text-align:center;margin:-6px 0 14px"><em>Araç → alıcı-verici → kart. Renkler teller: CANH turuncu, CANL yeşil, toprak gri.</em></div>

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

<div style="border-left:4px solid #D95757;background:rgba(217,87,87,.12);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">OBD-II pin 16 (+12 V) karta bağlanmaz</div><div style="line-height:1.6;color:inherit">Soketin 16. pininde akü gerilimi vardır. Bu hat kartın hiçbir yerine girmez. Kart USB’den beslenir; araçtan beslemek gerekiyorsa arada düzgün bir 12 V → 5 V dönüştürücü olmalı.</div></div>

## Alıcı-verici modülündeki ayarlar

- **120 Ω sonlandırma direnci:** araç hattının iki ucunda zaten var. Modülde bir sonlandırma jumper'ı/direnci varsa **devre dışı** bırakın; üçüncü bir direnç hattı yükler.
- **RS / STBY pini:** varsa GND'ye çekin (yüksek hız modu). Kart yazılımı `PIN_CAN_STBY` tanımlıysa bunu kendisi yapar; NAR derlemesinde tanımlı değildir.
- **Kablo uzunluğu:** soket ile alıcı-verici arası kısa tutulur (bir metre altı), CANH/CANL mümkünse birbirine sarılı.

<div style="border-left:4px solid #D9922F;background:rgba(217,146,47,.12);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">GPIO5 değil GPIO6</div><div style="line-height:1.6;color:inherit">Önceki NAR derlemelerinde CAN girişi GPIO5’teydi. Kasım 2026’dan itibaren GPIO6’dır; eski bir şemaya bakıyorsanız karşılaştırın. Değişiklik kart yazılımında tek bir derleme bayrağıdır (<code>PIN_CAN_RX</code>).</div></div>

## Soketi araçta bulmak

OBD-II soketi direksiyonun altında, çoğunlukla sürücü dizinin hizasında, bazen bir kapak arkasındadır. Trapez biçimli, 16 pinli; pin numaraları soketin üstünde kabartma yazılıdır: üst sıra 1–8, alt sıra 9–16. Belirsizse aracın kılavuzunda "teşhis soketi" başlığına bakın.
