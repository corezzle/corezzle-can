From symptom to cause. First look at the last `[cmd]` lines in the Console; the answer to most problems is written there.

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

<div style="border-left:4px solid #12A0AD;background:rgba(18,160,173,.10);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">Everything looks right but I am not sure</div><div style="line-height:1.6;color:inherit">Connect two boards back to back (CANH–CANH, CANL–CANL, GND–GND, 120 Ω at both ends), enable transmission with "force" on one and watch Live on the other. This bench setup verifies wiring and software independently of a car.</div></div>
