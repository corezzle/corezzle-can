**In short:** Connect board → pick the port → wait up to 30 seconds → Find bitrate in Settings. The bitrate is found once and stays on the board.

## Connecting

1. Plug the board in over USB. On first plug-in the board runs its boot self-tests; this takes **25–30 seconds**. The app says "board boot can take 30 s" and waits.
2. Click **Connect board**. The ESP32-S3 port appears in the list (`usbmodem…` on macOS, `COM…` on Windows, `ttyACM…` on Linux). Select it.
3. The badges at the top fill in: **connected**, bitrate (e.g. 250 kbit/s), mode (**listen-only**). On the right, received message count, number of distinct IDs and messages per second count live.

<div style="border-left:4px solid #12A0AD;background:rgba(18,160,173,.10);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">Port not in the list</div><div style="line-height:1.6;color:inherit">The cable may be charge-only; try another one. Another program may be holding the port (PlatformIO monitor, another terminal); close it. On Linux the user must be in the <code>dialout</code> group.</div></div>

## Bitrate

At boot the board uses the bitrate from its persistent memory (250 kbit/s the first time). If the car speaks at a different rate, the Live table stays empty. Two ways:

**Automatic:** Settings → **Find bitrate**. The board listens at 500, 250, 125 and 1000 kbit/s in turn, a few seconds each, **invisibly** (listen-only). It picks the rate with traffic, stores it permanently and keeps listening at that rate. The result line shows how many messages were counted at each rate.

![Settings tab: Find bitrate result and board status](GORSEL: ekran-ayarlar-hiz.png)

<div style="font-size:12.5px;color:inherit;opacity:.72;text-align:center;margin:-6px 0 14px"><em>Find bitrate result: messages counted only at 500 kbit/s. On the right, the board’s own status line.</em></div>

**Manual:** if you know the rate, pick it from the list and click **Set and reboot**. The board reboots (again ~30 s) and comes up at the new rate.

<div style="border-left:4px solid #D9922F;background:rgba(217,146,47,.12);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">Transmission is off during the scan</div><div style="line-height:1.6;color:inherit">Even a single message at the wrong bitrate disturbs the bus, so the scan only listens. Transmission does not switch on by itself at the detected rate either; you enable it from the Send tab.</div></div>

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

The **Reboot board** button sends `reboot`; when boot completes, the app reconnects on its own.
