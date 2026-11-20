The app is open source: <a href="https://github.com/corezzle/corezzle-can">github.com/corezzle/corezzle-can</a>, Apache-2.0 licence. It runs on Electron; the interface is plain HTML/JS, no framework.

## Directory layout

```
src/main.js       Electron main process: window, serial port permission, file saving
src/preload.js    renderer ↔ main process bridge
src/board.js      talking to the board: line parsing, commands, stream
src/fake-board.js demo mode: fake port imitating the board
src/obd.js        OBD-II PID table and reply decoding
src/app.js        interface logic
src/index.html    interface
src/style.css     styling
test/test.js      protocol tests (node)
```

## How it works

Talking to the board uses the browsers' **Web Serial** API; Electron provides it on the desktop and the app draws its own port picker. `board.js` sends a command, collects `[cmd]` lines and finishes on `OK:`/`ERR:`; lines starting with `CAN,` go through a separate channel to Live/Stream/Record. Status is refreshed every 5 seconds with `get can`.

## Tests

`npm test` runs without hardware: stream line parsing, `get can` decoding, bitrate scan output, OBD reply decoding (rpm, speed, temperature, negative response), and that a command ends on the final `OK` rather than an intermediate notice. Ten tests.

## Building installers

`npm run make` writes to the `out/` folder: `Corezzle-CAN.dmg` and a zip for macOS, `Corezzle-CAN-Setup.exe` for Windows, a zip for Linux. A package is produced for the operating system it is built on. macOS signing and notarisation happen only when the relevant environment variables are set (see the comment at the top of `forge.config.js`); otherwise the package is unsigned and Gatekeeper warns on first launch. Publishing a version needs no manual packaging: bump `version` in `package.json` and push a tag with the same number, such as `v0.1.0`, to GitHub; the `.github/workflows/release.yml` workflow builds the packages for all three platforms on GitHub's machines and attaches them to that tag's *Release* page. The download link in Quick start always points to the latest Release.

## Development notes

- To add an OBD PID: one line in the list in `obd.js` (PID, name, unit, decode function).
- If the board command format changes, the parsers in `board.js` and `fake-board.js` are updated together; the tests exercise both.
- The app sends the board only the commands listed in this document; the board side lives in the NarRTOS Wear repository.

## Licence

Apache License 2.0; see `LICENSE` and `NOTICE`. Electron and Electron Forge are MIT-licensed.

Corezzle Electronics
