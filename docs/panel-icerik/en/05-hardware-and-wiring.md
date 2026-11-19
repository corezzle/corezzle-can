**In short:** two wires and ground from the car socket to the transceiver, four wires from the transceiver to the board. Seven connections in total.

![Wiring diagram: OBD-II socket, CAN transceiver, NAR board](GORSEL: baglanti-semasi.png)

<div style="font-size:12.5px;color:inherit;opacity:.72;text-align:center;margin:-6px 0 14px"><em>Vehicle → transceiver → board. Colours are the wires: CANH orange, CANL green, ground grey.</em></div>

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

<div style="border-left:4px solid #D95757;background:rgba(217,87,87,.12);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">OBD-II pin 16 (+12 V) is never connected to the board</div><div style="line-height:1.6;color:inherit">Pin 16 of the socket carries battery voltage. It goes nowhere on the board. The board is powered from USB; if it must be powered from the car, a proper 12 V → 5 V converter is required in between.</div></div>

## Settings on the transceiver module

- **120 Ω termination resistor:** the vehicle bus already has one at each end. If the module has a termination jumper/resistor, **disable** it; a third resistor loads the bus.
- **RS / STBY pin:** if present, tie it to GND (high-speed mode). The board firmware does this itself when `PIN_CAN_STBY` is defined; it is not defined in the NAR build.
- **Cable length:** keep socket-to-transceiver short (under a metre), CANH/CANL twisted if possible.

<div style="border-left:4px solid #D9922F;background:rgba(217,146,47,.12);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">GPIO6, not GPIO5</div><div style="line-height:1.6;color:inherit">Earlier NAR builds had the CAN input on GPIO5. Since November 2026 it is GPIO6; compare if you are looking at an older diagram. The change is a single build flag in the board firmware (<code>PIN_CAN_RX</code>).</div></div>

## Finding the socket in the car

The OBD-II socket is under the steering wheel, usually at the height of the driver's knee, sometimes behind a cover. Trapezoid shape, 16 pins; pin numbers are embossed on the socket: top row 1–8, bottom row 9–16. If unsure, look for "diagnostic connector" in the car's manual.
