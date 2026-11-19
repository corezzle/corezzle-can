**In short:** the **Demo (fake board)** button at the top opens a bus inside the software that imitates the board and the car. The whole app can be tried without hardware.

The fake board produces the real NAR firmware's command replies in exactly the same format; the app does not know it is fake. That is why every flow, including bitrate detection, the transmit lock, OBD decoding and recording, goes through the same path as with a real board.

| Feature | On the fake board |
|---|---|
| Boot bitrate | 250 kbit/s (like a real board's factory value); the fake car speaks at 500, so the table is empty at first and **Find bitrate** is needed |
| Bus traffic | At 500 kbit/s, 0x208 and 0x348 twenty times a second (rpm and speed bytes change), 0x2F5 and 0x432 less often, plus one 29-bit ID 0x18FEF100 |
| Bitrate scan | Counts ~45 messages/s at 500, 0 and "errors" at the other rates |
| Transmit lock | `tx on` is refused until a message has been seen; transmitting at the wrong bitrate makes the error counters jump (as on the real board) |
| OBD | Answers from 0x7E8: rpm, speed, temperature and the other PIDs; "no reply" at the wrong bitrate |
| Reboot | `reboot` resets the counters and returns to 250 |

<div style="border-left:4px solid #12A0AD;background:rgba(18,160,173,.10);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">Not real vehicle data</div><div style="line-height:1.6;color:inherit">The IDs and bytes are <em>modelled on</em> a passenger-car bus; they are for training and interface demos. In a real car, which ID means what is manufacturer-specific.</div></div>

The demo is also used in training: the "Listen to the car" lesson of NarRTOS Academy shows the CAN stream in a 3D scene using the same fake board.
