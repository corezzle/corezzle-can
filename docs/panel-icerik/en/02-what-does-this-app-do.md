A modern car contains dozens of small computers: the engine control unit, the brake system, the instrument cluster, door modules. They all talk continuously over a shared two-wire bus called **CAN**. While the car runs, thousands of short messages per second flow on it: engine speed, vehicle speed, pedal positions, temperatures, warnings.

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

<div style="border-left:4px solid #12A0AD;background:rgba(18,160,173,.10);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">Relationship to NarRTOS Drive</div><div style="line-height:1.6;color:inherit">Corezzle’s screenless vehicle tracker, NarRTOS Drive, uses the same CAN approach: the device forwards raw messages, decoding happens on the server. Corezzle CAN can be thought of as that product’s eyes in the field; it works with any NarRTOS build whose board firmware understands the <code>can stream</code> command.</div></div>
