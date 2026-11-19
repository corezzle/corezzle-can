# Panel bölümlerinin kaynağı (EN). Çalıştırınca docs/panel-icerik/en/*.md yeniden üretilir: python3 docs/wiki-html/bolumler_en.py
import pathlib, os
OUT = pathlib.Path(os.path.expanduser('~/Desktop/corezzle-can/docs/panel-icerik/en')); OUT.mkdir(exist_ok=True)
def kutu(baslik, govde, renk='#12A0AD', alfa='.10'):
    r,g,b = int(renk[1:3],16), int(renk[3:5],16), int(renk[5:7],16)
    return f'<div style="border-left:4px solid {renk};background:rgba({r},{g},{b},{alfa});border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">{baslik}</div><div style="line-height:1.6;color:inherit">{govde}</div></div>'
NOT = lambda b,g: kutu(b,g)
UYARI = lambda b,g: kutu(b,g,'#D9922F','.12')
TEHLIKE = lambda b,g: kutu(b,g,'#D95757','.12')
def gorsel(ad, alt, altyazi):
    return f'![{alt}](GORSEL: {ad})\n\n<div style="font-size:12.5px;color:inherit;opacity:.72;text-align:center;margin:-6px 0 14px"><em>{altyazi}</em></div>'
def kart(etiket, baslik, metin):
    return f'<div style="background:rgba(128,128,128,.08);border:1px solid rgba(128,128,128,.24);border-radius:14px;padding:20px"><div style="font-size:11.5px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:#12A0AD">{etiket}</div><div style="font-size:17px;font-weight:700;margin:8px 0 6px;color:inherit">{baslik}</div><div style="font-size:14px;color:inherit;opacity:.72;line-height:1.5">{metin}</div></div>'
def kartlar(*k): return '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px;margin:18px 0">' + ''.join(k) + '</div>'
def sayi(deger, metin):
    return f'<div style="flex:1 1 120px;max-width:190px;background:rgba(128,128,128,.10);border:1px solid rgba(128,128,128,.28);border-radius:12px;padding:16px 10px;text-align:center"><div style="font-size:24px;font-weight:800;color:#12A0AD;line-height:1.1">{deger}</div><div style="font-size:12.5px;color:inherit;opacity:.72;margin-top:6px;line-height:1.35">{metin}</div></div>'
def sayilar(*s): return '<div style="display:flex;gap:10px;flex-wrap:wrap;margin:18px 0">' + ''.join(s) + '</div>'
UI = ''

D = {}
D['01-overview'] = f"""Corezzle CAN is a desktop application that connects a NAR board to a vehicle's data bus and **shows what is being said on that bus** on your computer screen. A small add-on to the board (a CAN transceiver) plugs into the car's OBD-II socket; the app talks to the board over USB, shows incoming messages in a live table, records them and, on request, asks the car standard questions (engine speed, vehicle speed, temperature, fuel).

{gorsel('ekran-canli.png', 'Live tab: last message per ID, changed bytes highlighted', 'Live tab. One row per message ID; changed bytes light up yellow, repeat rate per second on the right.' + UI)}

{sayilar(sayi('6','tabs: Live, Stream, Send, Record, Settings, Console'), sayi('4','bitrates scanned automatically (125/250/500/1000)'), sayi('17','ready-made OBD-II queries with decoded values'), sayi('0','impact on the bus by default: listen-only'), sayi('3','operating systems: macOS, Windows, Linux'))}

This document is written both for someone who has never seen the app (what it does, how to connect, what to watch out for) and for the technician measuring in a vehicle (bitrate detection, OBD queries, recording, troubleshooting). Technical terms are explained where they first appear; **Core concepts** is a short glossary.

{kartlar(kart('Safety','The bus does not notice the board','On every boot the board only listens: no acknowledge (ACK), no error frames. Transmission is enabled only from the app, for that session, and only after the bitrate has been verified.'), kart('Diagnostics','Finds the bitrate itself','You do not need to know the bus speed. The board listens at four bitrates in turn, invisibly, picks the one with traffic and stores it permanently.'), kart('Data','Raw frames + decoded OBD','The live table shows raw bytes; OBD-II replies are converted into readable values such as engine speed, vehicle speed and temperature.'), kart('No hardware','Demo mode','Without a board or a car, the whole app can be tried with a fake board built into the software; for training and demos.'))}

{NOT('Board side','The app does not work on its own; it needs a NAR board (ESP32-S3) running the NarRTOS Wear firmware plus a CAN transceiver. The board firmware is open source: <a href="https://github.com/corezzle/NarRTOS-Wear">NarRTOS Wear</a>. The app is open source too: <a href="https://github.com/corezzle/corezzle-can">corezzle-can</a> (Apache-2.0).')}"""

D['02-what-does-this-app-do'] = f"""A modern car contains dozens of small computers: the engine control unit, the brake system, the instrument cluster, door modules. They all talk continuously over a shared two-wire bus called **CAN**. While the car runs, thousands of short messages per second flow on it: engine speed, vehicle speed, pedal positions, temperatures, warnings.

Corezzle CAN lets you listen to that conversation. On the car side a NAR board and a small transceiver, on the computer side this app. The board forwards the messages as they are (raw); interpretation and display happen on the computer.

## Three ways to use it

| Who | For what | Which tabs |
|---|---|---|
| Developer | Verify NarRTOS's CAN side on the bench and in the car, see which IDs are flowing | Live, Stream, Console |
| Field technician | Find the bus bitrate in a vehicle, prove the wiring is right, query engine data | Settings, Send |
| Data collector | Record the raw CAN traffic of a drive and analyse it later (spreadsheet, Python) | Record |

## Tabs

| Tab | Function |
|---|---|
| **Live** | Last message per ID; changed bytes highlighted; count, messages per second, last seen; filter by ID |
| **Stream** | Raw line stream (last 2000 lines), pause, filter |
| **Send** | Enable/disable transmission (safety lock), ready-made OBD-II queries with decoded replies, raw frame transmit, repeated transmit |
| **Record** | Keep the session in memory, save as CSV |
| **Settings** | Auto-detect bitrate, manual bitrate, board status and error counters, reboot the board |
| **Console** | Type any command to the board; all board replies flow here |

## What it does not do

- It does not decode the **meaning** of messages. What ID 0x208 means in a given car is manufacturer-specific; the app shows raw bytes. The only thing it decodes is standard OBD-II replies.
- It does not clear fault codes, write settings or program the car's modules. Putting anything other than a standard OBD-II query on the bus is the user's responsibility, and the app deliberately makes it harder.
- It does not send data to a server. NarRTOS's telemetry service already forwards the CAN table to the server in its own report; this app is a local monitoring tool.

{NOT('Relationship to NarRTOS Drive','Corezzle’s screenless vehicle tracker, NarRTOS Drive, uses the same CAN approach: the device forwards raw messages, decoding happens on the server. Corezzle CAN can be thought of as that product’s eyes in the field; it works with any NarRTOS build whose board firmware understands the <code>can stream</code> command.')}"""

D['03-core-concepts'] = """Short definitions of the terms used in this document. Skip if you already know them.

| Term | Meaning |
|---|---|
| **CAN** (Controller Area Network) | The two-wire bus shared by the modules in a vehicle. Messages are small (at most 8 bytes) and everyone hears every message |
| **Frame** (message) | One packet on the bus: an ID plus 0–8 data bytes. "Message" and "frame" mean the same thing here |
| **ID** | The number that says what kind of message this is; 11-bit (0x000–0x7FF) or 29-bit (extended). Which ID means what is manufacturer-specific |
| **DLC** | Number of data bytes in the message (0–8) |
| **Bitrate** | The speed of the bus: 125, 250, 500 or 1000 kbit/s. A listener at the wrong bitrate understands nothing. Passenger cars mostly use 500, trucks/J1939 use 250 |
| **CANH / CANL** | The two wires of the bus. If swapped, no message can be decoded |
| **Transceiver** | The small chip that converts bus voltage levels to the processor's 3.3 V signals. Without it the board cannot connect to the bus |
| **OBD-II** | The 16-pin diagnostic socket found in every passenger car, and the standard question-and-answer protocol spoken on it (engine speed, vehicle speed, fault codes) |
| **PID** | The "question number" in OBD-II: 0C engine speed, 0D vehicle speed, 05 coolant temperature, and so on |
| **ECU** | A control unit in the car. The one answering OBD questions with ID 0x7E8 is usually the engine unit |
| **ACK** (acknowledge) | In CAN, every node that hears a message puts a one-bit acknowledge on the bus. A sender that gets no ACK raises an error and retries |
| **Listen-only** | The mode in which the board does not even acknowledge. The bus never notices the board exists; the safest state for the car |
| **TEC** | Transmit error counter. Above 128 the CAN controller becomes "error-passive"; the board disables transmission itself at that threshold |
| **NVS** | The board's persistent settings memory. The detected bitrate is stored there and survives a reboot |"""

D['04-quick-start'] = f"""A ten-minute path for someone installing the app for the first time. Without hardware, continue with **Demo** at step 4; the real board and vehicle steps are in the following sections.

{NOT('Requirements','<strong>Node.js 18 or newer</strong> and <strong>Git</strong> on the computer. For the board: a NAR board with the NarRTOS <code>nar_esp32s3</code> build (typing <code>help</code> in the Console must list <code>can stream</code>) and a 3.3 V CAN transceiver.')}

1. **Download and install** (once):

```
git clone https://github.com/corezzle/corezzle-can.git
cd corezzle-can
npm install
```

2. **Run:** `npm start`. The app window opens after a few seconds.

{gorsel('ekran-baslangic.png', 'Start screen: Connect board and Demo buttons', 'Start screen. Status badges at the top (connection, bitrate, mode); Connect board and Demo on the right.' + UI)}

3. **With a board:** plug the board in over USB, click **Connect board**, pick the ESP32-S3 port from the list. If the board was just plugged in, boot can take 30 seconds; once ready, bitrate and mode appear at the top.

4. **Without a board:** click **Demo (fake board)**. A bus that imitates the board opens inside the software; all the steps below work the same way.

5. **Find the bitrate:** Settings → **Find bitrate**. It takes about 20 seconds; the result reads like "found: 500 kbit/s" and is stored permanently.

6. **Watch:** go back to the Live tab. If messages are flowing, the wiring is right.

7. **Query:** Send → **Enable transmission** → pick *Engine speed* from the list → **Query**. The engine unit's reply lands in the table with the decoded value.

{UYARI('First try in a vehicle','Ignition must be on or the engine running; most cars say nothing on the bus with the ignition off. If no messages arrive, first check whether <strong>CANH/CANL are swapped</strong> and whether <strong>GND is connected</strong>; these two are the most common causes on first attempts.')}

To build installers: `npm run make` (dmg/zip for macOS, Setup.exe for Windows, zip for Linux; written to `out/`). Hardware-free tests: `npm test`."""

D['05-hardware-and-wiring'] = f"""**In short:** two wires and ground from the car socket to the transceiver, four wires from the transceiver to the board. Seven connections in total.

{gorsel('baglanti-semasi.png', 'Wiring diagram: OBD-II socket, CAN transceiver, NAR board', 'Vehicle → transceiver → board. Colours are the wires: CANH orange, CANL green, ground grey.')}

## Parts

| Part | What | Note |
|---|---|---|
| NAR board | ESP32-S3 board running the NarRTOS Wear firmware (`nar_esp32s3` build) | Pads GPIO4 and GPIO6 are used for CAN |
| CAN transceiver | A 3.3 V part: **SN65HVD230**, TJA1051T/3, MCP2562FD (with 3.3 V supply) | 5 V parts (TJA1050, MCP2551) are **not suitable**; ESP32 pins are not 5 V tolerant |
| OBD-II cable/socket | Access to pins 6, 14 and 4/5 through a male OBD-II plug or a socket | Ready-made "OBD-II breakout" cables make this easy |
| USB cable | Board ↔ computer; a **data** cable | With a charge-only cable the board never shows up |

## Connection table

| From | To | Note |
|---|---|---|
| OBD-II pin 6 (CANH) | Transceiver CANH | |
| OBD-II pin 14 (CANL) | Transceiver CANL | |
| OBD-II pin 4 or 5 (GND) | Transceiver GND | Ground is **mandatory**; without it the bus is unstable, messages arrive corrupted or not at all |
| Transceiver TXD (CTX on some modules) | Board **GPIO4** | Board to bus |
| Transceiver RXD (CRX) | Board **GPIO6** | Bus to board |
| Transceiver 3V3 | Board 3.3 V | |
| Transceiver GND | Board GND | |

{TEHLIKE('OBD-II pin 16 (+12 V) is never connected to the board','Pin 16 of the socket carries battery voltage. It goes nowhere on the board. The board is powered from USB; if it must be powered from the car, a proper 12 V → 5 V converter is required in between.')}

## Settings on the transceiver module

- **120 Ω termination resistor:** the vehicle bus already has one at each end. If the module has a termination jumper/resistor, **disable** it; a third resistor loads the bus.
- **RS / STBY pin:** if present, tie it to GND (high-speed mode). The board firmware does this itself when `PIN_CAN_STBY` is defined; it is not defined in the NAR build.
- **Cable length:** keep socket-to-transceiver short (under a metre), CANH/CANL twisted if possible.

{UYARI('GPIO6, not GPIO5','Earlier NAR builds had the CAN input on GPIO5. Since November 2026 it is GPIO6; compare if you are looking at an older diagram. The change is a single build flag in the board firmware (<code>PIN_CAN_RX</code>).')}

## Finding the socket in the car

The OBD-II socket is under the steering wheel, usually at the height of the driver's knee, sometimes behind a cover. Trapezoid shape, 16 pins; pin numbers are embossed on the socket: top row 1–8, bottom row 9–16. If unsure, look for "diagnostic connector" in the car's manual."""

D['06-connecting-and-bitrate'] = f"""**In short:** Connect board → pick the port → wait up to 30 seconds → Find bitrate in Settings. The bitrate is found once and stays on the board.

## Connecting

1. Plug the board in over USB. On first plug-in the board runs its boot self-tests; this takes **25–30 seconds**. The app says "board boot can take 30 s" and waits.
2. Click **Connect board**. The ESP32-S3 port appears in the list (`usbmodem…` on macOS, `COM…` on Windows, `ttyACM…` on Linux). Select it.
3. The badges at the top fill in: **connected**, bitrate (e.g. 250 kbit/s), mode (**listen-only**). On the right, received message count, number of distinct IDs and messages per second count live.

{NOT('Port not in the list','The cable may be charge-only; try another one. Another program may be holding the port (PlatformIO monitor, another terminal); close it. On Linux the user must be in the <code>dialout</code> group.')}

## Bitrate

At boot the board uses the bitrate from its persistent memory (250 kbit/s the first time). If the car speaks at a different rate, the Live table stays empty. Two ways:

**Automatic:** Settings → **Find bitrate**. The board listens at 500, 250, 125 and 1000 kbit/s in turn, a few seconds each, **invisibly** (listen-only). It picks the rate with traffic, stores it permanently and keeps listening at that rate. The result line shows how many messages were counted at each rate.

{gorsel('ekran-ayarlar-hiz.png', 'Settings tab: Find bitrate result and board status', 'Find bitrate result: messages counted only at 500 kbit/s. On the right, the board’s own status line.' + UI)}

**Manual:** if you know the rate, pick it from the list and click **Set and reboot**. The board reboots (again ~30 s) and comes up at the new rate.

{UYARI('Transmission is off during the scan','Even a single message at the wrong bitrate disturbs the bus, so the scan only listens. Transmission does not switch on by itself at the detected rate either; you enable it from the Send tab.')}

## Board status box

**Board status** in Settings shows the board's `get can` reply in readable form and refreshes every 5 seconds:

| Field | Meaning |
|---|---|
| bitrate · controller · mode | Bus speed; whether the CAN controller is running; LISTEN-ONLY or NORMAL |
| received | Total messages received since boot |
| IDs | Distinct IDs seen / table capacity (96) |
| table overflow | New IDs dropped because the table was full; if it grows, the car broadcasts more than 96 IDs |
| stream | Whether the instant message stream to the app is on |
| error line | `tx_err`, `bus_err`, `tx_failed`… All should stay 0 while listening; if they grow, the bitrate is wrong or the wiring is bad |

The **Reboot board** button sends `reboot`; when boot completes, the app reconnects on its own."""

D['07-live-and-stream'] = f"""**In short:** Live is a "current state per ID" table; Stream is the time-ordered raw list of every message.

## Live

{gorsel('ekran-canli.png', 'Live tab', 'Five IDs, one of them 29-bit. 0x208 and 0x348 arrive 20 times a second; changed bytes are yellow.' + UI)}

| Column | Meaning |
|---|---|
| ID (Kimlik) | Message ID, hexadecimal (0x208) |
| Type | 11-bit (standard) or 29-bit (extended) |
| DLC | Number of data bytes |
| Data (B0 … B7) | Bytes of the last message. A byte that **changed** since the previous message is highlighted **yellow**; the fastest way to find which byte carries a signal |
| Count | Messages received with this ID |
| Hz | Repeats per second; periodic signals (speed, rpm) are high, event messages low |
| Last (Son) | Last seen, milliseconds since board boot |

Tools at the top:

- **Filter by ID:** typing `208` shows only that ID; `7E` matches 0x7E0–0x7EF (OBD replies) as a partial match.
- **Only changing:** hides IDs whose data bytes never change; to see which signals are alive while driving.
- **Show bytes in decimal:** 0–255 instead of hex. Useful when guessing what a byte is (for example 0x1C = 28 km/h).
- **Pause:** freezes the table, counting continues underneath. **Clear table:** resets counters.

{NOT('How to find a signal','Press and release the accelerator: the bytes that flash yellow in Live are the ones related to engine speed. Press the brake pedal: if a single byte changes, that is a bit signal. This is the standard way to do it; because ID tables are manufacturer-specific, the app cannot do it for you.')}

## Stream

{gorsel('ekran-akis.png', 'Stream tab: raw lines', 'Stream: one message per line, in the format the board sends. The filter looks at ID or bytes.' + UI)}

Each line is the raw stream line produced by the board:

```
CAN,<ms>,<0xID>,<ext>,<dlc>,<B0 B1 … B7>
CAN,27900,0x00000208,0,8,13 5E 32 00 1F 32 32 32
```

The last 2000 lines are kept; older ones drop off. The **filter** box matches both IDs and byte values (`5E` shows lines containing 5E in the data). **Pause** freezes the view; recording in the Record tab is not affected.

{UYARI('On busy buses','A passenger-car bus can produce 500–2000 messages per second. The Stream view keeps up but is hard to read; in that case watch the Live table and capture raw data to a file with Record.')}"""

D['08-send-obd-and-safety-lock'] = f"""**In short:** transmission starts disabled. To enable it, the bitrate must have been verified. Once enabled, ready-made OBD-II questions are asked with one click and the reply arrives decoded.

## Safety lock

On every boot the board is in **listen-only** mode: it does not put a single bit on the bus, not even an acknowledge (ACK). Nothing can be sent in this mode. The **Enable transmission** button in the Send tab switches the board to NORMAL mode; the board accepts this only if it has **seen at least one message while listening passively**. If none was seen, the bitrate is unverified and the board refuses:

```
ERR: once pasif dinlemede frame gorulmeli (rx_total=0, bus_err=0). Hiz dogru mu?
```

(The board's message: "a frame must first be seen in passive listening — is the bitrate right?")

{TEHLIKE('Why so strict?','A node sitting in NORMAL mode at the wrong bitrate treats every message on the bus as corrupt and keeps putting <strong>error frames</strong> on it. The car sees this as a bus fault: gauges may go dark, rpm and speed may drop to 0, warning lights may come on. This happened for real in a vehicle during the first field test; the lock was added after that day. In addition, while transmission is on, if the transmit error counter (TEC) reaches 128 the board <strong>disables transmission itself</strong> and returns to listen-only.')}

The **force without verified bitrate** checkbox is for bench tests only (two boards back to back, no car). Do not use it in a vehicle; the app asks once more when it is ticked.

## OBD-II query

{gorsel('ekran-gonder-obd.png', 'Send tab: OBD-II query table and raw frame transmit', 'Three queries: engine speed, vehicle speed, coolant temperature. The Value column is decoded, the Raw column shows the reply bytes.' + UI)}

Pick a question from the list and click **Query**. The board writes the standard request to ID 0x7DF and collects replies from 0x7E8–0x7EF; the app decodes the reply and adds it to the table: time, replying unit (ECU), PID, name, decoded value and raw bytes. **Repeat every N s** asks the same question periodically (to watch rpm, for example); Disable transmission or Disconnect stops the repeat.

Ready-made questions (SAE J1979, mode 01):

| PID | Name | Unit |
|---|---|---|
| 00 | Supported PIDs (01–20), bit map | |
| 04 | Engine load | % |
| 05 | Coolant temperature | °C |
| 0B | Intake manifold pressure | kPa |
| 0C | Engine speed | rpm |
| 0D | Vehicle speed | km/h |
| 0F | Intake air temperature | °C |
| 10 | Mass air flow (MAF) | g/s |
| 11 | Throttle position | % |
| 1F | Run time since engine start | s |
| 21 | Distance with MIL on | km |
| 2F | Fuel level | % |
| 33 | Barometric pressure | kPa |
| 42 | Control module voltage | V |
| 46 | Ambient air temperature | °C |
| 5C | Engine oil temperature | °C |
| 5E | Fuel rate | L/h |

For a question not in the list, type the PID and an optional mode into the **custom** box: `0C 01`. If the car does not support that PID, there is no reply or a "negative response" (NRC) comes back; checking PID 00 first to see which are supported is a good habit.

{NOT('No reply?','Is the ignition on? In some cars the engine unit does not answer until the engine runs. Is the bitrate right (are messages flowing in Live)? Some cars have a <em>gateway</em> between the OBD socket and the real bus; it answers queries but does not expose the bus itself; in those cars the Live table may stay empty while OBD works, or the other way round.')}

## Send raw frame

Type an ID and 0–8 bytes and click **Send once**; or **repeat every N ms**. IDs above 0x7FF are sent as 29-bit. This box is for putting non-OBD messages on the bus: if you do not know what you are sending, do not use it. The default value (0x7DF, `02 01 0C …`) is the raw form of the engine-speed question; it does the same thing as the OBD box."""

D['09-recording'] = f"""**In short:** Start recording, do the drive, Stop recording, Save as CSV. The file opens directly in a spreadsheet or in Python.

{gorsel('ekran-kayit.png', 'Record tab', 'A four-second recording: 204 messages. Save as CSV and Discard become active when recording stops.' + UI)}

The recording is kept in memory and is independent of the Stream view (recording continues even if Stream is paused). On stop a summary appears: message count and duration. **Save as CSV** opens a file dialog; the name is automatic, `can-kayit-YYYY-MM-DD-HH-MM-SS.csv`. **Discard** frees the memory.

## File format

```
zaman_ms,kimlik,ext,dlc,b0,b1,b2,b3,b4,b5,b6,b7
27900,0x00000208,0,8,13,5E,32,00,1F,32,32,32
27800,0x000002F5,0,7,AD,00,00,00,02,00,11,
```

| Column | Meaning |
|---|---|
| zaman_ms | Milliseconds since board boot (the board's clock, not the computer's) |
| kimlik | 8-digit hexadecimal ID, zero-padded |
| ext | 0 = 11-bit, 1 = 29-bit |
| dlc | Number of bytes |
| b0…b7 | Hexadecimal bytes; empty after dlc |

{NOT('Analysing later','Open the file in Excel/Numbers and filter by ID, or read it in Python with <code>pandas.read_csv</code> and plot a byte against time. Signal decoding (which byte is rpm, what the scale factor is) is manufacturer-specific; if known definition files (DBC) exist, matching this CSV against them is the next step.')}

{UYARI('Long recordings','This is an in-memory recording; on a 1000-messages-per-second bus one hour ≈ 3.6 million rows, a few hundred MB. For long sessions save the file every 10–15 minutes and start a new recording.')}"""

D['10-console-and-board-commands'] = f"""**In short:** the Console is where you type commands to the board directly. The app's buttons actually send these commands; all board replies flow here.

{gorsel('ekran-konsol.png', 'Console tab: board command replies', 'Console: bitrate scan, status lines and the board-side trace of an OBD query.' + UI)}

Type a command and click **Send** or press Enter. Every reply line from the board starts with `[cmd]`; `OK:` or `ERR:` marks the end of a command. Even with the console idle, the commands the app sends in the background (`get can` every 5 s) and their replies are visible; when something goes wrong, this is the first place to look.

## Board commands used by the app

| Command | What it does |
|---|---|
| `get can` | Status: bitrate, mode, counters, error line |
| `can stream on` / `off` | Stream every message instantly as a line (Live and Stream listen to this) |
| `can scan [s]` | Bitrate scan: 500/250/125/1000, `s` seconds each, listen-only; the result is stored permanently |
| `set can bitrate <kbps>` | Set the bitrate manually (125/250/500/1000), permanent; requires reboot |
| `set can tx on` / `off` / `force` | Enable transmission (NORMAL) / disable (LISTEN-ONLY) / enable without verification (bench test) |
| `can obd <pid> [mode]` | OBD-II request on 0x7DF; replies as `cevap 0x000007E8,…` lines, ending with `OK: obd bitti (N cevap)` |
| `can send 0xID,b0,…,b7` | One raw message |
| `can dump [n]` · `can stats` · `can clear` | List the board's ID table / counters / clear |
| `reboot` | Reboot the board (~30 s with boot self-tests) |

All other NarRTOS commands work too: `help` prints the full list, `info` version and memory, `get rails` power rails. See the **Command Interface** section of the NarRTOS Wear document for details.

{NOT('Stream lines and command replies never mix','The board starts stream lines with <code>CAN,</code> and command replies with <code>[cmd]</code>. The app separates the two by these prefixes; the Console shows only <code>[cmd]</code> lines, while <code>CAN,</code> lines go to Live/Stream/Record.')}"""

D['11-safety-model-and-field-lessons'] = f"""**In short:** anything connected to a vehicle bus can disturb it. The app and the board prevent this with three layers; the layers came out of two incidents in the field.

## Three layers

| Layer | Where | What it does |
|---|---|---|
| Listen-only by default | Board firmware | Only listens on every boot; no ACK, no error frames. Even at the wrong bitrate the bus is unaffected |
| Transmit lock | Board firmware | `set can tx on` is accepted only after a message has been seen in passive listening, which means the bitrate is verified |
| Self shut-off | Board firmware | With transmission on, if TEC reaches 128 (sent messages are not being acknowledged) the board disables transmission, returns to listen-only and tells the app |

On the app side: transmission is enabled only with the button in the Send tab and only for that session; Disconnect or reconnect restores the lock. The "force" option asks for an extra confirmation.

## Two incidents in the field

{UYARI('1. Transmitting at the wrong bitrate blanked the gauges','In the first vehicle test the board booted in NORMAL mode with the firmware of the time, and the bitrate was wrong. Messages on the bus looked corrupt to the board and it put an error frame on the bus for each one. The car treated this as a bus fault: the instrument cluster flickered, rpm and speed dropped to zero. Once the board was removed the car recovered; there was no permanent damage. Result: listen-only by default, the transmit lock, and self shut-off at the TEC threshold.')}

{UYARI('2. No messages at all: CANH and CANL were swapped','In the same car, even at the right bitrate the table stayed empty and the error counters kept growing. The cause was the two wires swapped. Once fixed, more than 2000 messages in 4 seconds and 10 distinct IDs arrived at 500 kbit/s. Result: the wiring notes in Settings and the "check CANH/CANL first" warnings in this document.')}

A third observation: in a 2020 model vehicle there were **no** messages at the OBD socket and no errors either. Some manufacturers separate the socket from the real bus with a gateway; the socket only answers OBD queries and does not expose the bus's own traffic. In such cars the Live table may stay empty while OBD queries work.

## Rules for working in a vehicle

1. Connect with the ignition off, then switch the ignition on.
2. **Find bitrate** first; do not enable transmission before seeing messages in Live.
3. In a vehicle send only standard OBD-II queries. Do not use the raw frame box in a vehicle.
4. If the gauges behave strangely, click **Disable transmission** first, then pull the cable.
5. If measuring while driving, the driver must not be the one watching the laptop; record and analyse afterwards."""

D['12-demo-mode'] = f"""**In short:** the **Demo (fake board)** button at the top opens a bus inside the software that imitates the board and the car. The whole app can be tried without hardware.

The fake board produces the real NAR firmware's command replies in exactly the same format; the app does not know it is fake. That is why every flow, including bitrate detection, the transmit lock, OBD decoding and recording, goes through the same path as with a real board.

| Feature | On the fake board |
|---|---|
| Boot bitrate | 250 kbit/s (like a real board's factory value); the fake car speaks at 500, so the table is empty at first and **Find bitrate** is needed |
| Bus traffic | At 500 kbit/s, 0x208 and 0x348 twenty times a second (rpm and speed bytes change), 0x2F5 and 0x432 less often, plus one 29-bit ID 0x18FEF100 |
| Bitrate scan | Counts ~45 messages/s at 500, 0 and "errors" at the other rates |
| Transmit lock | `tx on` is refused until a message has been seen; transmitting at the wrong bitrate makes the error counters jump (as on the real board) |
| OBD | Answers from 0x7E8: rpm, speed, temperature and the other PIDs; "no reply" at the wrong bitrate |
| Reboot | `reboot` resets the counters and returns to 250 |

{NOT('Not real vehicle data','The IDs and bytes are <em>modelled on</em> a passenger-car bus; they are for training and interface demos. In a real car, which ID means what is manufacturer-specific.')}

The demo is also used in training: the "Listen to the car" lesson of NarRTOS Academy shows the CAN stream in a 3D scene using the same fake board."""

D['13-troubleshooting'] = f"""From symptom to cause. First look at the last `[cmd]` lines in the Console; the answer to most problems is written there.

| Symptom | Most likely cause | What to do |
|---|---|---|
| Port not in the list | Charge-only cable; board open in another program; permissions on Linux | Change the cable; close the PlatformIO monitor; add the user to `dialout` |
| "connecting… 30 s" takes long, then an error | Board boot self-tests; or old firmware that does not know `can stream` | Wait 40 s; type `help` in the Console, if `can stream` is missing update the board firmware |
| Connected but Live empty, error counters 0 | Wrong bitrate **or** ignition off **or** a car with a gateway | Switch the ignition on; Settings → Find bitrate; try an OBD query |
| Live empty, `bus_err`/`rx_err` growing | CANH/CANL swapped; GND missing; wrong bitrate | Swap the wires; connect ground; Find bitrate |
| Find bitrate shows 0 at every rate | Silent bus (ignition off) or wiring | Ignition; CANH/CANL/GND; the transceiver's 3.3 V supply |
| Enable transmission → "once pasif dinlemede frame gorulmeli" | Bitrate not verified | See messages in Live first. On a bench test, "force" |
| No OBD reply | Ignition off; PID unsupported; gateway | Ignition; support map with PID 00; another PID |
| Gauges flickered, rpm dropped to 0 | Transmitting at the wrong bitrate (old firmware or "force") | Disable transmission immediately, pull the cable; update the board firmware |
| Transmission switched itself off | TEC 128: messages not acknowledged | Bitrate and wiring; with no other node (bench test) a second node must provide ACK |
| Table "overflow" counter growing | The car broadcasts more than 96 IDs | Normal; use the filter in Live. The board table can be enlarged (firmware) |
| Stream stutters, "dropped" growing | The USB link cannot keep up | Turn the stream off and watch only the Live table; short sessions for recording |

{NOT('Everything looks right but I am not sure','Connect two boards back to back (CANH–CANH, CANL–CANL, GND–GND, 120 Ω at both ends), enable transmission with "force" on one and watch Live on the other. This bench setup verifies wiring and software independently of a car.')}"""

D['14-source-code-tests-and-licence'] = """The app is open source: <a href="https://github.com/corezzle/corezzle-can">github.com/corezzle/corezzle-can</a>, Apache-2.0 licence. It runs on Electron; the interface is plain HTML/JS, no framework.

## Directory layout

```
src/main.js       Electron main process: window, serial port permission, file saving
src/preload.js    renderer ↔ main process bridge
src/board.js      talking to the board: line parsing, commands, stream
src/fake-board.js demo mode: fake port imitating the board
src/obd.js        OBD-II PID table and reply decoding
src/app.js        interface logic
src/index.html    interface
src/style.css     styling
test/test.js      protocol tests (node)
```

## How it works

Talking to the board uses the browsers' **Web Serial** API; Electron provides it on the desktop and the app draws its own port picker. `board.js` sends a command, collects `[cmd]` lines and finishes on `OK:`/`ERR:`; lines starting with `CAN,` go through a separate channel to Live/Stream/Record. Status is refreshed every 5 seconds with `get can`.

## Tests

`npm test` runs without hardware: stream line parsing, `get can` decoding, bitrate scan output, OBD reply decoding (rpm, speed, temperature, negative response), and that a command ends on the final `OK` rather than an intermediate notice. Ten tests.

## Development notes

- To add an OBD PID: one line in the list in `obd.js` (PID, name, unit, decode function).
- If the board command format changes, the parsers in `board.js` and `fake-board.js` are updated together; the tests exercise both.
- The app sends the board only the commands listed in this document; the board side lives in the NarRTOS Wear repository.

## Licence

Apache License 2.0; see `LICENSE` and `NOTICE`. Electron and Electron Forge are MIT-licensed.

Corezzle Electronics"""

TITLES = ['Overview','What does this app do?','Core concepts','Quick start','Hardware and wiring','Connecting and bitrate','Live and Stream','Send: OBD-II and the safety lock','Recording','Console and board commands','Safety model and field lessons','Demo mode','Troubleshooting','Source code, tests and licence']
for ad, metin in D.items():
    (OUT / (ad + '.md')).write_text(metin.strip() + '\n', encoding='utf-8')
(OUT / '00-TITLES.md').write_text('# English section titles (Başlık (en) alanına girilecek)\n\n' + '\n'.join(f'{i+1:02d}. {t}' for i, t in enumerate(TITLES)) + '\n', encoding='utf-8')
print(len(D), 'EN sections written')
