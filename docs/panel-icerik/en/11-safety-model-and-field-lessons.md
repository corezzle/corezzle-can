**In short:** anything connected to a vehicle bus can disturb it. The app and the board prevent this with three layers; the layers came out of two incidents in the field.

## Three layers

| Layer | Where | What it does |
|---|---|---|
| Listen-only by default | Board firmware | Only listens on every boot; no ACK, no error frames. Even at the wrong bitrate the bus is unaffected |
| Transmit lock | Board firmware | `set can tx on` is accepted only after a message has been seen in passive listening, which means the bitrate is verified |
| Self shut-off | Board firmware | With transmission on, if TEC reaches 128 (sent messages are not being acknowledged) the board disables transmission, returns to listen-only and tells the app |

On the app side: transmission is enabled only with the button in the Send tab and only for that session; Disconnect or reconnect restores the lock. The "force" option asks for an extra confirmation.

## Two incidents in the field

<div style="border-left:4px solid #D9922F;background:rgba(217,146,47,.12);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">1. Transmitting at the wrong bitrate blanked the gauges</div><div style="line-height:1.6;color:inherit">In the first vehicle test the board booted in NORMAL mode with the firmware of the time, and the bitrate was wrong. Messages on the bus looked corrupt to the board and it put an error frame on the bus for each one. The car treated this as a bus fault: the instrument cluster flickered, rpm and speed dropped to zero. Once the board was removed the car recovered; there was no permanent damage. Result: listen-only by default, the transmit lock, and self shut-off at the TEC threshold.</div></div>

<div style="border-left:4px solid #D9922F;background:rgba(217,146,47,.12);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">2. No messages at all: CANH and CANL were swapped</div><div style="line-height:1.6;color:inherit">In the same car, even at the right bitrate the table stayed empty and the error counters kept growing. The cause was the two wires swapped. Once fixed, more than 2000 messages in 4 seconds and 10 distinct IDs arrived at 500 kbit/s. Result: the wiring notes in Settings and the "check CANH/CANL first" warnings in this document.</div></div>

A third observation: in a 2020 model vehicle there were **no** messages at the OBD socket and no errors either. Some manufacturers separate the socket from the real bus with a gateway; the socket only answers OBD queries and does not expose the bus's own traffic. In such cars the Live table may stay empty while OBD queries work.

## Rules for working in a vehicle

1. Connect with the ignition off, then switch the ignition on.
2. **Find bitrate** first; do not enable transmission before seeing messages in Live.
3. In a vehicle send only standard OBD-II queries. Do not use the raw frame box in a vehicle.
4. If the gauges behave strangely, click **Disable transmission** first, then pull the cable.
5. If measuring while driving, the driver must not be the one watching the laptop; record and analyse afterwards.
