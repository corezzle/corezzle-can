A ten-minute path for someone installing the app for the first time. Without hardware, continue with **Demo** at step 4; the real board and vehicle steps are in the following sections.

<div style="border-left:4px solid #12A0AD;background:rgba(18,160,173,.10);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">Requirements</div><div style="line-height:1.6;color:inherit"><strong>Node.js 18 or newer</strong> and <strong>Git</strong> on the computer. For the board: a NAR board with the NarRTOS <code>nar_esp32s3</code> build (typing <code>help</code> in the Console must list <code>can stream</code>) and a 3.3 V CAN transceiver.</div></div>

1. **Download and install** (once):

```
git clone https://github.com/corezzle/corezzle-can.git
cd corezzle-can
npm install
```

2. **Run:** `npm start`. The app window opens after a few seconds.

![Start screen: Connect board and Demo buttons](GORSEL: ekran-baslangic.png)

<div style="font-size:12.5px;color:inherit;opacity:.72;text-align:center;margin:-6px 0 14px"><em>Start screen. Status badges at the top (connection, bitrate, mode); Connect board and Demo on the right.</em></div>

3. **With a board:** plug the board in over USB, click **Connect board**, pick the ESP32-S3 port from the list. If the board was just plugged in, boot can take 30 seconds; once ready, bitrate and mode appear at the top.

4. **Without a board:** click **Demo (fake board)**. A bus that imitates the board opens inside the software; all the steps below work the same way.

5. **Find the bitrate:** Settings → **Find bitrate**. It takes about 20 seconds; the result reads like "found: 500 kbit/s" and is stored permanently.

6. **Watch:** go back to the Live tab. If messages are flowing, the wiring is right.

7. **Query:** Send → **Enable transmission** → pick *Engine speed* from the list → **Query**. The engine unit's reply lands in the table with the decoded value.

<div style="border-left:4px solid #D9922F;background:rgba(217,146,47,.12);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">First try in a vehicle</div><div style="line-height:1.6;color:inherit">Ignition must be on or the engine running; most cars say nothing on the bus with the ignition off. If no messages arrive, first check whether <strong>CANH/CANL are swapped</strong> and whether <strong>GND is connected</strong>; these two are the most common causes on first attempts.</div></div>

To build installers: `npm run make` (dmg/zip for macOS, Setup.exe for Windows, zip for Linux; written to `out/`). Hardware-free tests: `npm test`.
