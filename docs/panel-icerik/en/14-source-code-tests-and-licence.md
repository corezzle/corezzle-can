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

## Development notes

- To add an OBD PID: one line in the list in `obd.js` (PID, name, unit, decode function).
- If the board command format changes, the parsers in `board.js` and `fake-board.js` are updated together; the tests exercise both.
- The app sends the board only the commands listed in this document; the board side lives in the NarRTOS Wear repository.

## Licence

Apache License 2.0; see `LICENSE` and `NOTICE`. Electron and Electron Forge are MIT-licensed.

Corezzle Electronics
