**In short:** the Console is where you type commands to the board directly. The app's buttons actually send these commands; all board replies flow here.

![Console tab: board command replies](GORSEL: ekran-konsol.png)

<div style="font-size:12.5px;color:inherit;opacity:.72;text-align:center;margin:-6px 0 14px"><em>Console: bitrate scan, status lines and the board-side trace of an OBD query.</em></div>

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

<div style="border-left:4px solid #12A0AD;background:rgba(18,160,173,.10);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">Stream lines and command replies never mix</div><div style="line-height:1.6;color:inherit">The board starts stream lines with <code>CAN,</code> and command replies with <code>[cmd]</code>. The app separates the two by these prefixes; the Console shows only <code>[cmd]</code> lines, while <code>CAN,</code> lines go to Live/Stream/Record.</div></div>
