#!/usr/bin/env python3
"""Bağlantı şeması: OBD-II soketi → CAN transceiver → NAR kartı. Yalnız İngilizce SVG + PNG üretir (belge görselleri İngilizce).
Kullanım: python3 docs/wiki-html/sema_uret.py   (rsvg-convert gerekir)"""
import pathlib, subprocess
HERE = pathlib.Path(__file__).resolve().parent
IMG = HERE / 'assets/img'; OUT = HERE.parent / 'panel-icerik/gorseller'
T = {
 'tr': dict(baslik='Araç → transceiver → NAR kartı', obd='OBD-II soketi (araçta)', trx='CAN transceiver (3,3 V)', kart='NAR kartı (ESP32-S3)',
            obdnot='Direksiyonun altında, sürücü tarafında. Pin numaraları soketin üstünde yazar.', trxnot='SN65HVD230, TJA1051T/3 gibi 3,3 V çip. 120 Ω sonlandırma kapalı.',
            kartnot='GPIO4 = TX, GPIO6 = RX. Kart listen-only başlar.', uyari='CANH ile CANL ters bağlanırsa hiç frame gelmez; GND bağlanmazsa hat kararsız olur.',
            p6='pin 6 · CANH', p14='pin 14 · CANL', p4='pin 4/5 · GND', g4='GPIO4', g6='GPIO6', v='3,3 V', gnd='GND'),
 'en': dict(baslik='Vehicle → transceiver → NAR board', obd='OBD-II socket (in the car)', trx='CAN transceiver (3.3 V)', kart='NAR board (ESP32-S3)',
            obdnot='Under the dashboard, driver side. Pin numbers are printed on the socket.', trxnot='A 3.3 V part such as SN65HVD230 or TJA1051T/3. 120 Ω termination off.',
            kartnot='GPIO4 = TX, GPIO6 = RX. The board starts in listen-only mode.', uyari='CANH/CANL swapped → no frames at all; GND missing → unstable bus.',
            p6='pin 6 · CANH', p14='pin 14 · CANL', p4='pin 4/5 · GND', g4='GPIO4', g6='GPIO6', v='3.3 V', gnd='GND'),
}
def svg(t):
    pins_top = ''.join(f'<rect x="{78+i*22}" y="92" width="14" height="14" rx="2" fill="{"#E8A33D" if i==5 else "#cfd6dc"}"/><text x="{85+i*22}" y="86" font-size="9" text-anchor="middle" fill="#5a6672">{i+1}</text>' for i in range(8))
    pins_bot = ''.join(f'<rect x="{78+i*22}" y="118" width="14" height="14" rx="2" fill="{"#3EC48A" if i==5 else ("#555" if i in (0,1) and False else "#cfd6dc")}"/><text x="{85+i*22}" y="146" font-size="9" text-anchor="middle" fill="#5a6672">{i+9}</text>' for i in range(8))
    # GND pins 4 and 5 (top row indexes 3,4)
    gnd_pins = ''.join(f'<rect x="{78+i*22}" y="92" width="14" height="14" rx="2" fill="#4b5560"/>' for i in (3,4))
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="520" viewBox="0 0 1200 520" font-family="Inter, Helvetica, Arial, sans-serif">
<rect width="1200" height="520" fill="#ffffff"/>
<text x="600" y="40" font-size="22" font-weight="700" text-anchor="middle" fill="#13303a">{t['baslik']}</text>
<!-- OBD -->
<g transform="translate(40,70)">
 <text x="130" y="0" font-size="15" font-weight="700" text-anchor="middle" fill="#13303a">{t['obd']}</text>
 <path d="M30,20 L230,20 L250,80 L250,150 L230,160 L30,160 L10,150 L10,80 Z" fill="#eef2f5" stroke="#8ba1ac" stroke-width="2"/>
 {pins_top}{gnd_pins}{pins_bot}
</g>
<!-- transceiver -->
<g transform="translate(480,70)">
 <text x="120" y="0" font-size="15" font-weight="700" text-anchor="middle" fill="#13303a">{t['trx']}</text>
 <rect x="20" y="20" width="200" height="150" rx="10" fill="#1f2a33"/>
 <rect x="80" y="60" width="80" height="60" rx="4" fill="#0f171d"/>
 <text x="120" y="95" font-size="11" text-anchor="middle" fill="#9fd6e8">SN65HVD230</text>
 <!-- sol pinler: CANH CANL -->
 <circle cx="20" cy="55" r="7" fill="#E8A33D"/><text x="34" y="59" font-size="11" fill="#fff">CANH</text>
 <circle cx="20" cy="85" r="7" fill="#3EC48A"/><text x="34" y="89" font-size="11" fill="#fff">CANL</text>
 <circle cx="20" cy="135" r="7" fill="#4b5560" stroke="#fff"/><text x="34" y="139" font-size="11" fill="#fff">GND</text>
 <!-- sağ pinler: 3V3 GND TXD RXD -->
 <circle cx="220" cy="45" r="7" fill="#E25555"/><text x="206" y="49" font-size="11" fill="#fff" text-anchor="end">3V3</text>
 <circle cx="220" cy="75" r="7" fill="#4b5560" stroke="#fff"/><text x="206" y="79" font-size="11" fill="#fff" text-anchor="end">GND</text>
 <circle cx="220" cy="105" r="7" fill="#4A7BD9"/><text x="206" y="109" font-size="11" fill="#fff" text-anchor="end">TXD</text>
 <circle cx="220" cy="135" r="7" fill="#9B5DE5"/><text x="206" y="139" font-size="11" fill="#fff" text-anchor="end">RXD</text>
 <text x="120" y="195" font-size="12" text-anchor="middle" fill="#5a6672">{t['trxnot'][:56]}</text>
 <text x="120" y="212" font-size="12" text-anchor="middle" fill="#5a6672">{t['trxnot'][56:]}</text>
</g>
<!-- NAR kartı -->
<g transform="translate(900,70)">
 <text x="130" y="0" font-size="15" font-weight="700" text-anchor="middle" fill="#13303a">{t['kart']}</text>
 <rect x="20" y="20" width="220" height="150" rx="8" fill="#2f7d5a"/>
 <rect x="95" y="55" width="70" height="70" rx="3" fill="#1a1f24"/><text x="130" y="95" font-size="10" text-anchor="middle" fill="#9fd6e8">ESP32-S3</text>
 <circle cx="20" cy="45" r="7" fill="#E25555"/><text x="34" y="49" font-size="11" fill="#fff">{t['v']}</text>
 <circle cx="20" cy="75" r="7" fill="#4b5560" stroke="#fff"/><text x="34" y="79" font-size="11" fill="#fff">{t['gnd']}</text>
 <circle cx="20" cy="105" r="7" fill="#4A7BD9"/><text x="34" y="109" font-size="11" fill="#fff">{t['g4']}</text>
 <circle cx="20" cy="135" r="7" fill="#9B5DE5"/><text x="34" y="139" font-size="11" fill="#fff">{t['g6']}</text>
 <text x="130" y="195" font-size="12" text-anchor="middle" fill="#5a6672">{t['kartnot']}</text>
</g>
<!-- teller: OBD → trx -->
<g fill="none" stroke-width="4" stroke-linecap="round">
 <path d="M228,169 C330,169 380,125 500,125" stroke="#E8A33D"/>
 <path d="M228,195 C330,195 380,155 500,155" stroke="#3EC48A"/>
 <path d="M191,178 C191,250 260,250 380,250 C450,250 470,205 500,205" stroke="#4b5560"/>
 <!-- trx → kart -->
 <path d="M700,115 L920,115" stroke="#E25555"/>
 <path d="M700,145 L920,145" stroke="#4b5560"/>
 <path d="M700,175 L920,175" stroke="#4A7BD9"/>
 <path d="M700,205 L920,205" stroke="#9B5DE5"/>
</g>
<g font-size="12" font-weight="700">
 <text x="330" y="118" fill="#b7791f">{t['p6']}</text>
 <text x="330" y="190" fill="#2a8a60">{t['p14']}</text>
 <text x="300" y="272" fill="#4b5560">{t['p4']}</text>
 <text x="810" y="108" fill="#E25555" text-anchor="middle">{t['v']}</text>
 <text x="810" y="138" fill="#4b5560" text-anchor="middle">{t['gnd']}</text>
 <text x="810" y="168" fill="#4A7BD9" text-anchor="middle">TXD → {t['g4']}</text>
 <text x="810" y="198" fill="#9B5DE5" text-anchor="middle">RXD → {t['g6']}</text>
</g>
<rect x="40" y="330" width="1120" height="150" rx="14" fill="#fff6e8" stroke="#E8A33D" stroke-width="2"/>
<text x="70" y="365" font-size="15" font-weight="700" fill="#8a5a12">!</text>
<text x="95" y="365" font-size="15" font-weight="700" fill="#8a5a12">{t['uyari']}</text>
<g font-size="13" fill="#3c4a55">
 <text x="95" y="392" font-size="13">• {t['obdnot']}</text>
 <text x="95" y="415">• {'OBD-II: pin 6 CANH, pin 14 CANL, pin 4 şasi GND, pin 5 sinyal GND, pin 16 +12 V (karta BAĞLANMAZ).' if t is T['tr'] else 'OBD-II: pin 6 CANH, pin 14 CANL, pin 4 chassis GND, pin 5 signal GND, pin 16 +12 V (NOT connected to the board).'}</text>
 <text x="95" y="438">• {'Transceiver 3,3 V olmalı; 5 V çipler (TJA1050, MCP2551) ESP32 pinlerine uygun değildir.' if t is T['tr'] else 'The transceiver must be a 3.3 V part; 5 V parts (TJA1050, MCP2551) are not suitable for ESP32 pins.'}</text>
 <text x="95" y="461">• {'Binek araçlarda hız çoğunlukla 500 kbit/s; emin değilseniz uygulamadan “Hızı bul”.' if t is T['tr'] else 'Passenger cars mostly run at 500 kbit/s; if unsure, use “Find bitrate” in the app.'}</text>
</g>
</svg>'''
IMG.mkdir(parents=True, exist_ok=True)
for dil, t in T.items():
    if dil != 'en': continue  # TR metinler yalnız kaynak olarak duruyor; görseller İngilizce
    s = svg(t); yol = IMG / 'baglanti-semasi.svg'; yol.write_text(s, encoding='utf-8')
    png = OUT / 'baglanti-semasi.png'
    subprocess.run(['rsvg-convert', '-w', '2400', '-o', str(png), str(yol)], check=True); print(png)
