**In short:** Live is a "current state per ID" table; Stream is the time-ordered raw list of every message.

## Live

![Live tab](GORSEL: ekran-canli.png)

<div style="font-size:12.5px;color:inherit;opacity:.72;text-align:center;margin:-6px 0 14px"><em>Five IDs, one of them 29-bit. 0x208 and 0x348 arrive 20 times a second; changed bytes are yellow.</em></div>

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

<div style="border-left:4px solid #12A0AD;background:rgba(18,160,173,.10);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">How to find a signal</div><div style="line-height:1.6;color:inherit">Press and release the accelerator: the bytes that flash yellow in Live are the ones related to engine speed. Press the brake pedal: if a single byte changes, that is a bit signal. This is the standard way to do it; because ID tables are manufacturer-specific, the app cannot do it for you.</div></div>

## Stream

![Stream tab: raw lines](GORSEL: ekran-akis.png)

<div style="font-size:12.5px;color:inherit;opacity:.72;text-align:center;margin:-6px 0 14px"><em>Stream: one message per line, in the format the board sends. The filter looks at ID or bytes.</em></div>

Each line is the raw stream line produced by the board:

```
CAN,<ms>,<0xID>,<ext>,<dlc>,<B0 B1 … B7>
CAN,27900,0x00000208,0,8,13 5E 32 00 1F 32 32 32
```

The last 2000 lines are kept; older ones drop off. The **filter** box matches both IDs and byte values (`5E` shows lines containing 5E in the data). **Pause** freezes the view; recording in the Record tab is not affected.

<div style="border-left:4px solid #D9922F;background:rgba(217,146,47,.12);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">On busy buses</div><div style="line-height:1.6;color:inherit">A passenger-car bus can produce 500–2000 messages per second. The Stream view keeps up but is hard to read; in that case watch the Live table and capture raw data to a file with Record.</div></div>
