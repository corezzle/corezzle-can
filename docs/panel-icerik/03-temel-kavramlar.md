Belgede geçen terimlerin kısa karşılıkları. Zaten biliyorsanız atlayın.

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
| **NVS** | Kartın kalıcı ayar belleği. Bulunan hat hızı buraya yazılır, yeniden başlatınca korunur |
