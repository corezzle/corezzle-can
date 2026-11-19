**In short:** Start recording, do the drive, Stop recording, Save as CSV. The file opens directly in a spreadsheet or in Python.

![Record tab](GORSEL: ekran-kayit.png)

<div style="font-size:12.5px;color:inherit;opacity:.72;text-align:center;margin:-6px 0 14px"><em>A four-second recording: 204 messages. Save as CSV and Discard become active when recording stops.</em></div>

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

<div style="border-left:4px solid #12A0AD;background:rgba(18,160,173,.10);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">Analysing later</div><div style="line-height:1.6;color:inherit">Open the file in Excel/Numbers and filter by ID, or read it in Python with <code>pandas.read_csv</code> and plot a byte against time. Signal decoding (which byte is rpm, what the scale factor is) is manufacturer-specific; if known definition files (DBC) exist, matching this CSV against them is the next step.</div></div>

<div style="border-left:4px solid #D9922F;background:rgba(217,146,47,.12);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">Long recordings</div><div style="line-height:1.6;color:inherit">This is an in-memory recording; on a 1000-messages-per-second bus one hour ≈ 3.6 million rows, a few hundred MB. For long sessions save the file every 10–15 minutes and start a new recording.</div></div>
