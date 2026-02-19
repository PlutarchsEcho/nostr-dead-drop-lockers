# DeadDropstr Starter Pack - Minimum Viable Locker

## Philosophy

**Bare bones, field-upgradable, sub-$30 controller.**

Target users:
- Makers with spare parts
- Low-cost deployment (rural areas, developing regions)
- Proof-of-concept before upgrading
- Retrofit existing storage

---

## The Trade-offs

| Feature | Full System | Starter Pack |
|---------|-------------|--------------|
| Display | 1.28" LCD ($8) | LED + beeps ($1) |
| Input | Keypad + NFC ($8) | NFC only ($3) |
| Secure Element | ATECC608A ($1) | ESP32 flash encrypt ($0) |
| Connectivity | WiFi + 4G ($15) | WiFi only ($0) |
| Power | 12V PSU + battery ($20) | USB-C power bank ($0, BYO) |
| Enclosure | Custom ($50+) | Repurposed ($0, BYO) |
| **Controller Cost** | **~$38** | **~$12** |
| **Total Build** | **~$100-150** | **~$20-40** |

---

## Starter Controller Spec

### Core Components ($12 total)

```
Microcontroller: ESP32-C3 (single-core, WiFi/BLE, $3)
  - Cheaper than S3, sufficient for MVP
  - No PSRAM needed for starter
  - 4MB flash adequate

NFC Reader: PN532 I2C ($3)
  - Only input method (no keypad, no screen)
  - Users tap phone or card to unlock

LED + Buzzer: ($1)
  - RGB LED for status (red=locked, green=open, blue=busy)
  - Piezo for audio feedback

Power: USB-C + 5V regulator ($2)
  - Runs off any power bank
  - No battery management needed
  - 5V direct to solenoid (small ones)

Relay: 5V dual relay module ($3)
  - Drive lock actuator
  - Simple, no RS-485 needed for single-lock

PCB: 2-layer, 50x40mm ($1)
  - Minimal routing
  - JLCPCB 5pcs = $5 total

--- Total: ~$12 ---
```

### What Got Cut (and Why It's OK)

**No Display**
- Users interact via phone app or tap NFC card
- LED gives enough feedback: locked/unlocked/error
- Saves $8 + complexity

**No Keypad**
- NFC tap is faster and more secure
- Or use phone app to generate time-limited codes
- For remote users, they need phone anyway

**No Secure Element**
- Use ESP32's flash encryption + secure boot
- Keys stored in encrypted flash
- Less secure than ATECC but sufficient for MVP
- Can upgrade later

**No RS-485 Bus**
- Starter pack = single lock only
- Direct GPIO to relay
- Upgrade to full controller for multi-lock

**No Battery Backup**
- User provides USB power bank
- If power dies, codes still valid when restored
- Locker just stays locked during outage

---

## The Build: 3 Options

### Option A: Toolbox Retrofit ($25 total)

```
Materials:
- Plastic toolbox with latch ($10 at hardware store)
- ESP32-C3 starter controller ($12)
- 12V solenoid bolt ($8)
- USB power bank (BYO)
- Wire, connectors ($3)

Total: ~$25-35 depending on local prices

Build:
1. Mount controller inside toolbox
2. Install solenoid to block latch
3. NFC antenna mounted on outside
4. LED visible through small hole
5. USB cable for power

Result: Weather-resistant, portable, 30-min build
```

### Option B: Ammo Can Special ($35 total)

```
Materials:
- Metal ammo can ($15 surplus)
- Starter controller ($12)
- Electronic cabinet lock ($15)
- USB power bank (BYO)
- Weatherproof USB port ($3)

Total: ~$35-45

Build:
1. Mount controller inside can
2. Install cabinet lock on lid
3. NFC reader on outside
4. Waterproof USB-C connector
5. Tamper switch on lid

Result: Mil-spec rugged, outdoor rated
```

### Option C: Drawer Retrofit ($20 total)

```
Materials:
- Any drawer/cabinet you already own ($0)
- Starter controller ($12)
- 12V solenoid ($8)
- USB phone charger (BYO)

Total: ~$20

Build:
1. Mount solenoid inside drawer cavity
2. Controller hidden in back
3. NFC sticker on front
4. LED visible

Result: Indoor only, invisible installation
```

---

## Firmware: Starter Edition

### Feature Set

```cpp
// Core Features (always work)
- NFC tap to unlock (if valid code)
- Phone app unlock via BLE
- Nostr event sync (when online)
- Access logging to SD card

// Cut Features (not in starter)
- NO: Keypad entry
- NO: Display UI
- NO: Multiple locks
- NO: 4G connectivity
- NO: Battery management
- NO: Tamper detection (optional)
```

### Code Validation

```cpp
// Simplified validation for starter
void validateNFC() {
  String uid = readNFC();
  
  // Check against local valid_codes[]
  for (int i=0; i<MAX_CODES; i++) {
    if (valid_codes[i].hash == sha256(uid + salt) && 
        valid_codes[i].expiry > now()) {
      unlock();
      logAccess(uid, true);
      return;
    }
  }
  
  // Invalid
  beep_error();
  logAccess(uid, false);
}
```

### Phone App Workflow

```
1. User rents locker via DeadDropstr web app
2. Web app generates NFC token (or BLE command)
3. User taps phone to locker NFC reader
4. Locker validates and opens
5. No keypad needed!
```

---

## Network Compatibility

### Starter packs work with full ecosystem:

✅ **Nostr Events**: Same kind 30402 rental events  
✅ **Payment**: Same Lightning invoices  
✅ **Discovery**: Listed on same marketplace  
✅ **Proxy Support**: Can use third-party proxies  
✅ **Upgrade Path**: Flash full firmware later

### Limitations (clearly communicated):

⚠️ **Single lock only** (no multi-drawer)  
⚠️ **WiFi required** (no offline validation)  
⚠️ **NFC or app only** (no manual code entry)  
⚠️ **No tamper detection** (basic model)  
⚠️ **USB powered** (power bank life ~1 week)

---

## Adoption Strategy

### Phase 1: Seed Network

Target: 50 makers globally
- Provide free starter PCBs to contributors
- Require: Build + document + share location
- Result: Geographic coverage proof

### Phase 2: Community Growth

- Release BOM + Gerbers
- Video: "Build a locker for $25"
- Forum support for DIY builds
- Upgrade kits for full features

### Phase 3: Commercial Partners

- Partner with local hackerspaces
- Offer "Locker Kit Workshops"
- Starter → Full upgrade sales

---

## BOM: Minimal Starter

| Item | Qty | Cost | Source |
|------|-----|------|--------|
| ESP32-C3 DevKit | 1 | $3 | AliExpress |
| PN532 NFC Module | 1 | $3 | Amazon |
| 5V Dual Relay | 1 | $3 | Local |
| 12V Solenoid | 1 | $8 | AliExpress |
| RGB LED + Resistors | 1 | $0.50 | Local |
| Piezo Buzzer | 1 | $0.50 | Local |
| USB-C Cable | 1 | $2 | Amazon |
| Jumper Wires | 10 | $1 | Local |
| Enclosure (ammo/tool box) | 1 | $10-15 | Surplus/Hardware |
| **Total** | | **~$25-35** | |

---

## Assembly Time

- **Experienced maker**: 30 minutes
- **First-time builder**: 2 hours
- **Workshop setting**: 1 hour with guidance

---

## Upgrade Path

Starter owners can upgrade incrementally:

```
Step 1: Add keypad ($5) → Flash keypad firmware
Step 2: Add screen ($8) → Full UI
Step 3: Add secure element ($1) → Better crypto
Step 4: Add RS-485 ($2) → Multi-lock support
Step 5: Add 4G module ($15) → No WiFi needed
```

Or simply replace controller with full version.

---

## Call to Action

**"Start with $25. Grow with your needs."**

The starter pack proves the model. Once you have lockers in an area, demand justifies upgrading to full features. The network grows organically from the bottom up.

---

*Starter Pack PCB files available in `/hardware/starter-pack/`*
