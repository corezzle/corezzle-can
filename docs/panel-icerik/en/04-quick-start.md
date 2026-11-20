A ten-minute path for someone installing the app for the first time. Without hardware, continue with **Demo** at step 4; the real board and vehicle steps are in the following sections.

<div style="border-left:4px solid #12A0AD;background:rgba(18,160,173,.10);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">Requirements</div><div style="line-height:1.6;color:inherit">A Windows, macOS or Linux computer. For the board: a NAR board with the NarRTOS <code>nar_esp32s3</code> build (typing <code>help</code> in the Console must list <code>can stream</code>), a 3.3 V CAN transceiver and a USB cable that <strong>carries data</strong>. Node.js and Git are needed only if you run from source.</div></div>

## 1. Install the app

There are two ways. If you only want to use it, take the ready-made package; if you want to change the code, run from source.

### Ready-made package

Download page: <a href="https://github.com/corezzle/corezzle-can/releases/latest">github.com/corezzle/corezzle-can/releases</a>. Take the file for your operating system:

- **Windows:** Run `Corezzle-CAN-Setup.exe`. If Windows shows "Windows protected your PC", choose *More info* → *Run anyway*; the warning appears because the app is new. The installation completes by itself in a few seconds and the app opens; later launches are from the Start menu.

- **macOS:** Open `Corezzle-CAN.dmg` and drag the Corezzle CAN icon into the Applications folder. If the first launch shows "Apple cannot check it for malicious software", right-click the app and choose *Open*. On recent macOS versions, if that is not enough, press *Open Anyway* at the bottom of *System Settings → Privacy & Security*. Once is enough.

- **Linux:** Unpack `corezzle-can-linux-x64-<version>.zip` into a folder and run the `corezzle-can` file inside. For serial port access your user must be in the `dialout` group: `sudo usermod -aG dialout $USER`, then log out and back in.

### From source

Node.js 18 or newer and Git must be installed on the computer:

```
git clone https://github.com/corezzle/corezzle-can.git
cd corezzle-can
npm install
npm start
```

The last command opens the app window after a few seconds; later, `npm start` alone is enough.

## 2. Start screen

However it was installed, the app opens with the same screen: status badges at the top, **Connect board** and **Demo (fake board)** on the right.

![Start screen: Connect board and Demo buttons](GORSEL: ekran-baslangic.png)

<div style="font-size:12.5px;color:inherit;opacity:.72;text-align:center;margin:-6px 0 14px"><em>Start screen. Status badges at the top (connection, bitrate, mode); Connect board and Demo on the right.</em></div>

## 3. With a board

Plug the board in over USB, click **Connect board**, pick the ESP32-S3 port from the list (`usbmodem…` on macOS, `COM…` on Windows, `ttyACM…` on Linux). If the board was just plugged in, boot can take 30 seconds; once ready, bitrate and mode appear at the top.

## 4. Without a board

Click **Demo (fake board)**. A bus that imitates the board opens inside the software; all the steps below work the same way.

## 5. Find the bitrate

Settings → **Find bitrate**. It takes about 20 seconds; the result reads like "found: 500 kbit/s" and is stored permanently.

## 6. Watch

Go back to the Live tab. If messages are flowing, the wiring is right.

## 7. Query

Send → **Enable transmission** → pick *Engine speed* from the list → **Query**. The engine unit's reply lands in the table with the decoded value.

<div style="border-left:4px solid #D9922F;background:rgba(217,146,47,.12);border-radius:0 10px 10px 0;padding:14px 18px;margin:18px 0"><div style="font-weight:800;margin-bottom:6px;color:inherit">First try in a vehicle</div><div style="line-height:1.6;color:inherit">Ignition must be on or the engine running; most cars say nothing on the bus with the ignition off. If no messages arrive, first check whether <strong>CANH/CANL are swapped</strong> and whether <strong>GND is connected</strong>; these two are the most common causes on first attempts.</div></div>

## Updating

The app does not update itself. When a new version is released, download the new package from the same page and install it over the old one; your recordings are kept. If you run from source, do `git pull` and `npm install`.
