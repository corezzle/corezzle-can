Short definitions of the terms used in this document. Skip if you already know them.

| Term | Meaning |
|---|---|
| **CAN** (Controller Area Network) | The two-wire bus shared by the modules in a vehicle. Messages are small (at most 8 bytes) and everyone hears every message |
| **Frame** (message) | One packet on the bus: an ID plus 0–8 data bytes. "Message" and "frame" mean the same thing here |
| **ID** | The number that says what kind of message this is; 11-bit (0x000–0x7FF) or 29-bit (extended). Which ID means what is manufacturer-specific |
| **DLC** | Number of data bytes in the message (0–8) |
| **Bitrate** | The speed of the bus: 125, 250, 500 or 1000 kbit/s. A listener at the wrong bitrate understands nothing. Passenger cars mostly use 500, trucks/J1939 use 250 |
| **CANH / CANL** | The two wires of the bus. If swapped, no message can be decoded |
| **Transceiver** | The small chip that converts bus voltage levels to the processor's 3.3 V signals. Without it the board cannot connect to the bus |
| **OBD-II** | The 16-pin diagnostic socket found in every passenger car, and the standard question-and-answer protocol spoken on it (engine speed, vehicle speed, fault codes) |
| **PID** | The "question number" in OBD-II: 0C engine speed, 0D vehicle speed, 05 coolant temperature, and so on |
| **ECU** | A control unit in the car. The one answering OBD questions with ID 0x7E8 is usually the engine unit |
| **ACK** (acknowledge) | In CAN, every node that hears a message puts a one-bit acknowledge on the bus. A sender that gets no ACK raises an error and retries |
| **Listen-only** | The mode in which the board does not even acknowledge. The bus never notices the board exists; the safest state for the car |
| **TEC** | Transmit error counter. Above 128 the CAN controller becomes "error-passive"; the board disables transmission itself at that threshold |
| **NVS** | The board's persistent settings memory. The detected bitrate is stored there and survives a reboot |
