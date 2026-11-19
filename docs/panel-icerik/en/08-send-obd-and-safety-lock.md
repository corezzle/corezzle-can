**In short:** transmission starts disabled. To enable it, the bitrate must have been verified. Once enabled, ready-made OBD-II questions are asked with one click and the reply arrives decoded.

## Safety lock

On every boot the board is in **listen-only** mode: it does not put a single bit on the bus, not even an acknowledge (ACK). Nothing can be sent in this mode. The **Enable transmission** button in the Send tab switches the board to NORMAL mode; the board accepts this only if it has **seen at least one message while listening passively**. If none was seen, the bitrate is unverified and the board refuses:

```
ERR: once pasif dinlemede frame gorulmeli (rx_total=0, bus_err=0). Hiz dogru mu?
```

(The board's message: "a frame must first be seen in passive listening — is the bitrate right?")

<div style="border-left:4px solid #D95757;background:rgba(217,87,87,.12);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">Why so strict?</div><div style="line-height:1.6;color:inherit">A node sitting in NORMAL mode at the wrong bitrate treats every message on the bus as corrupt and keeps putting <strong>error frames</strong> on it. The car sees this as a bus fault: gauges may go dark, rpm and speed may drop to 0, warning lights may come on. This happened for real in a vehicle during the first field test; the lock was added after that day. In addition, while transmission is on, if the transmit error counter (TEC) reaches 128 the board <strong>disables transmission itself</strong> and returns to listen-only.</div></div>

The **force without verified bitrate** checkbox is for bench tests only (two boards back to back, no car). Do not use it in a vehicle; the app asks once more when it is ticked.

## OBD-II query

![Send tab: OBD-II query table and raw frame transmit](GORSEL: ekran-gonder-obd.png)

<div style="font-size:12.5px;color:inherit;opacity:.72;text-align:center;margin:-6px 0 14px"><em>Three queries: engine speed, vehicle speed, coolant temperature. The Value column is decoded, the Raw column shows the reply bytes.</em></div>

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

<div style="border-left:4px solid #12A0AD;background:rgba(18,160,173,.10);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">No reply?</div><div style="line-height:1.6;color:inherit">Is the ignition on? In some cars the engine unit does not answer until the engine runs. Is the bitrate right (are messages flowing in Live)? Some cars have a <em>gateway</em> between the OBD socket and the real bus; it answers queries but does not expose the bus itself; in those cars the Live table may stay empty while OBD works, or the other way round.</div></div>

## Send raw frame

Type an ID and 0–8 bytes and click **Send once**; or **repeat every N ms**. IDs above 0x7FF are sent as 29-bit. This box is for putting non-OBD messages on the bus: if you do not know what you are sending, do not use it. The default value (0x7DF, `02 01 0C …`) is the raw form of the engine-speed question; it does the same thing as the OBD box.
