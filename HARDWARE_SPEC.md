# DeadDropstr Modular Hardware Architecture

## Design Philosophy

**Separation of Concerns**: The controller (brains) and locks (actuators) are separate, allowing:
- One controller to manage multiple compartments
- Mix-and-match lock types (solenoid, motor, electromagnetic)
- Easy retrofit of existing storage (filing cabinets, lockers, safes)
- Cost optimization (expensive compute once, cheap locks many)

---

## System Components

### 1. Master Controller Unit (MCU)

**Location**: Mounted on top/side of storage unit  
**Function**: Secure compute, UI, network, signing

#### Hardware Specs
```
Microcontroller: ESP32-S3 (dual-core, WiFi + BLE)
Display: 1.28" round LCD (240x240) or 2.4" touch OLED
Input: 4x4 keypad matrix + NFC/RFID reader (PN532)
Secure Element: ATECC608A (NIST P-256 signing)
Connectivity: WiFi 6, optional 4G (SIM7600), optional LoRa
Storage: 8MB PSRAM, 16MB flash
Power: 12V DC input, onboard 5V/3.3V regulators
Backup: 18650 battery + charging circuit
```

#### Interfaces to Locks
```
Primary: RS-485 differential (1200m range, 32 units max)
Secondary: I2C (for nearby locks, <1m)
Tertiary: Wireless 433MHz (for retrofits, no wiring)
Each lock has unique address (1-255)
```

#### Security Features
- Secure element stores device private key (nsec)
- All access logs signed by device key
- Tamper detection (accelerometer, case switches)
- Encrypted communication to locks
- Codes validated locally, no cloud dependency

---

### 2. Lock Module (Per Compartment)

**Types** (interchangeable based on use case):

#### Type A: Solenoid Bolt (Basic)
```
Use: Light-duty drawers, cabinets
Cost: ~$8
Power: 12V, 0.5A (6W) momentary
Control: RS-485 + 12V power on shared bus
Fail-safe: Spring return (locked without power)
Feedback: Microswitch detects bolt position
```

#### Type B: Motorized Deadbolt (Medium)
```
Use: Heavy drawers, lockers, doors
Cost: ~$25
Power: 12V, 1A during movement
Control: RS-485 + H-bridge local driver
Fail-secure: Stays in last position (battery backup required)
Feedback: Hall effect sensor + limit switches
```

#### Type C: Electromagnetic (Cabinet)
```
Use: Filing cabinets, metal enclosures
Cost: ~$15
Power: 12V, 0.3A continuous when unlocked
Control: RS-485 + local MOSFET
Fail-safe: Spring latch, magnet holds open
Feedback: Current sensing (detects engagement)
```

#### Type D: Smart Padlock (Retrofit)
```
Use: Existing lockers, bikes, gates
Cost: ~$40
Power: Internal LiPo, charged via controller dock
Control: BLE or 433MHz from controller
Fail-secure: Manual key override
Feedback: Lock ACK + tamper alerts
```

---

### 3. Example Configurations

#### Example A: 4-Drawer Filing Cabinet
```
┌─────────────────────────────────────────┐
│  [MASTER CONTROLLER]                     │
│  - Screen + Keypad + NFC                │
│  - ESP32-S3 + Secure Element            │
│  - 12V PSU + Battery Backup             │
├─────────────────────────────────────────┤
│  Drawer 1 │ Solenoid Lock │ Address 0x01 │
├─────────────────────────────────────────┤
│  Drawer 2 │ Solenoid Lock │ Address 0x02 │
├─────────────────────────────────────────┤
│  Drawer 3 │ Solenoid Lock │ Address 0x03 │
├─────────────────────────────────────────┤
│  Drawer 4 │ Solenoid Lock │ Address 0x04 │
└─────────────────────────────────────────┘

Wiring: 4-wire bus (+12V, GND, RS-485 A, RS-485 B)
       Daisy-chained to each lock
Cost: ~$120 controller + $32 locks = $152 total
```

#### Example B: Community Locker Bank (8 units)
```
┌─────────────────────────────────────────┐
│  [MASTER CONTROLLER]                     │
│  - Shared screen/keypad on side         │
│  - 4G + WiFi connectivity               │
├─────────────────────────────────────────┤
│  [1] [2] [3] [4]                        │
│  Medium │ Medium │ Medium │ Medium      │
│  Motor  │ Motor  │ Motor  │ Motor       │
├─────────────────────────────────────────┤
│  [5] [6] [7] [8]                        │
│  Large  │ Large  │ Small  │ Small       │
│  Motor  │ Motor  │ Solen  │ Solen       │
└─────────────────────────────────────────┘

Wiring: Controller in center, 2x RS-485 branches
       Each locker has address 0x01-0x08
Cost: ~$180 controller + $160 locks = $340 total
```

#### Example C: Single High-Security Box
```
┌─────────────────────────────────────────┐
│  [CONTROLLER + LOCK INTEGRATED]          │
│  - Tamper-proof enclosure               │
│  - Motorized deadbolt (steel door)      │
│  - Biometric + NFC + Keypad             │
│  - Solar panel + battery                │
└─────────────────────────────────────────┘

All-in-one unit for outdoor/unattended use
Cost: ~$250-400 depending on enclosure
```

---

## Communication Protocol

### RS-485 Bus Protocol (Controller ↔ Locks)

```
Frame Format:
[START][ADDR][CMD][LEN][DATA...][CRC][END]

Commands:
0x01 UNLOCK      - Open compartment
0x02 LOCK        - Close compartment  
0x03 STATUS      - Query lock state
0x04 SET_CODE    - Program access code
0x05 CLEAR_CODE  - Clear access code
0x06 TAMPER_ACK  - Acknowledge tamper

Responses:
0xAA ACK         - Command received/executed
0xBB NACK        - Error (invalid code, jammed, etc)
0xCC STATUS      - State report (locked, unlocked, tamper)
```

### Example Unlock Flow
```
1. User enters code on controller
2. Controller validates locally (hash match + expiry check)
3. Controller sends: [0x02][0x01][0x01][0x00][CRC]
   (to address 0x02, UNLOCK command, no data)
4. Lock 0x02 energizes solenoid for 3 seconds
5. Lock responds: [0xAA] (ACK) + microswitch status
6. Controller logs: signed(timestamp, code_hash, locker_id, result)
7. Controller shows "Unlocked - Close door to lock"
```

---

## Power Architecture

### Option 1: Mains Powered (Indoor)
```
12V 5A PSU → Controller → RS-485 bus → Locks
Battery backup: 3x 18650 (for outages, ~8hr runtime)
Charging: TP4056 modules per cell
```

### Option 2: Solar (Outdoor/Remote)
```
50W Solar Panel → MPPT Controller → 12V 20Ah LiFePO4
Battery → 12V rail → Controller + Locks
Sleep mode: Controller sleeps between rentals (BLE wake)
Estimated runtime: 3 days without sun
```

### Option 3: Battery Only (Portable)
```
12V 10Ah LiPo pack
Smart power: Controller wakes on keypad press
Locks only powered during unlock (minimal drain)
Estimated life: 1-2 weeks typical use
```

---

## Security Model

### Code Validation (Offline)
```
1. User enters 6-digit code
2. Controller computes: SHA256(code + salt + locker_id)
3. Checks against valid_codes[] array in RAM
4. Also checks expiry timestamp
5. If valid: sends unlock command + logs access
```

### Sync (When Online)
```
1. Controller connects to Nostr relay
2. Downloads: new rentals, code updates, config changes
3. Uploads: signed access logs, tamper alerts, status
4. Can operate offline indefinitely (queue events)
```

### Tamper Response
```
Detected: Case opened, vibration, tilt
Action:
  1. Sound piezo alarm (if enabled)
  2. Log signed tamper event
  3. Upload immediately (if online)
  4. Lock all compartments until owner reset
  5. Optional: Trigger camera if equipped
```

---

## Bill of Materials - Controller Board

| Component | Spec | Cost |
|-----------|------|------|
| ESP32-S3-WROOM | N16R8 (16MB flash, 8MB PSRAM) | $4 |
| ATECC608A | SOIC-8 secure element | $1 |
| Display | 1.28" GC9A01 round LCD | $8 |
| NFC Module | PN532 I2C | $6 |
| Keypad | 4x4 matrix | $2 |
| RS-485 Transceiver | MAX485 or SP3485 | $1 |
| Buck Converter | 12V→5V 3A | $2 |
| LDO | 5V→3.3V 500mA | $0.50 |
| Battery Management | TP4056 + protection | $3 |
| Connectors | Terminal blocks, headers | $2 |
| PCB | 4-layer, 100x80mm | $8 |
| **Total** | | **~$38** |

Plus enclosure, PSU, battery: ~$50-100

---

## Firmware Architecture

```cpp
// Core Modules
- main.cpp              // Setup, loop, sleep
- network.cpp           // WiFi/4G/Nostr client
- crypto.cpp            // Secure element, signing
- ui.cpp                // Display, keypad, NFC
- lock_bus.cpp          // RS-485 protocol
- storage.cpp           // SD card / flash storage
- power.cpp             // Battery, charging, sleep

// Event Handlers
- on_valid_code()       // Unlock flow
- on_rental_event()     // Nostr kind 30402
- on_tamper()           // Security response
- on_sync()             // Relay sync

// State Machine
IDLE → INPUT → VALIDATE → UNLOCK → LOG → IDLE
      ↓           ↓           ↓
   TIMEOUT    INVALID      TAMPER
```

---

## Enclosure Guidelines

### Controller Housing
- IP54 minimum (indoor), IP65 (outdoor)
- Metal or ABS+PC blend
- Tamper-evident screws or ultrasonic weld
- Ventilation for heat dissipation
- Window for display (tempered glass or polycarbonate)

### Lock Integration
- Mounting tabs for solenoid/deadbolt
- Cable glands for RS-485 passthrough
- Weatherstripping for outdoor use
- Anti-drill plates for high-security

---

## Certifications to Consider

- **FCC Part 15** (unintentional radiator)
- **CE Marking** (EU market)
- **IP Rating** (ingress protection)
- **UL 294** (access control systems, if applicable)

---

## Next Steps

1. **Prototype Controller PCB** - Order 10 units from JLCPCB
2. **Lock Selection** - Test solenoid vs motor durability (10k cycles)
3. **Firmware Dev** - Nostr event handling, offline validation
4. **Security Audit** - Penetration testing, tamper analysis
5. **Field Test** - Deploy 5 units, monitor reliability

---

*This is an open standard. Contribute improvements via GitHub.*
