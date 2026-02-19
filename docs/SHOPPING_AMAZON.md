# DeadDropstr Starter Pack - Amazon Shopping List

## Quick Stats
- **Total Cost**: ~$30-40 (depending on shipping)
- **Build Time**: 2-3 hours
- **Skill Level**: Beginner-friendly

---

## Core Components

### 1. ESP32-C3 DevKit
**What**: The brains of the operation  
**Why**: Cheap, WiFi + Bluetooth, perfect for starters  

| Option | Price | Link | Notes |
|--------|-------|------|-------|
| **ESP32-C3-DevKitM-1** | ~$4-6 | [Amazon](https://www.amazon.com/s?k=esp32-c3+devkitm) | Official Espressif, most reliable |
| NodeMCU-C3 | ~$5-7 | [Amazon](https://www.amazon.com/s?k=nodemcu+c3) | Clone, but works fine |
| ESP32-C3 SuperMini | ~$3-5 | [Amazon](https://www.amazon.com/s?k=esp32+c3+supermini) | Smallest, cheapest |

**Recommendation**: Get the DevKitM-1 for easier prototyping, SuperMini for smaller builds.

**Quantity needed**: 1

---

### 2. PN532 NFC Module
**What**: Reads NFC cards/phones  
**Why**: Keyless entry, tap-to-unlock  

| Option | Price | Link | Notes |
|--------|-------|------|-------|
| **PN532 I2C + antenna** | ~$6-10 | [Amazon](https://www.amazon.com/s?k=pn532+nfc+module) | Most common, buy this one |
| PN532 SPI version | ~$6-10 | [Amazon](https://www.amazon.com/s?k=pn532+spi) | Works too, different wiring |

**What to look for**: "I2C interface", includes antenna, 3.3V/5V compatible

**Quantity needed**: 1

---

### 3. Relay Module
**What**: Switches power to the lock  
**Why**: ESP32 can't drive locks directly  

| Option | Price | Link | Notes |
|--------|-------|------|-------|
| **5V 2-Channel Relay** | ~$5-8 | [Amazon](https://www.amazon.com/s?k=5v+relay+module+dual) | Most versatile |
| 5V 1-Channel Relay | ~$3-5 | [Amazon](https://www.amazon.com/s?k=5v+relay+module) | Cheaper if only doing 1 lock |
| Relay with optocoupler | ~$7-10 | [Amazon](https://www.amazon.com/s?k=relay+module+opto) | Better isolation, worth the extra |

**What to look for**: Active LOW (common), optocoupler isolation, LED indicators

**Quantity needed**: 1

---

### 4. Solenoid Lock
**What**: The physical lock mechanism  
**Why**: Actually locks/unlocks the box  

| Option | Price | Link | Notes |
|--------|-------|------|-------|
| **12V Electromagnetic Lock** | ~$8-12 | [Amazon](https://www.amazon.com/s?k=12v+electromagnetic+lock+cabinet) | Best for drawers/cabinets |
| 12V Solenoid Bolt | ~$7-10 | [Amazon](https://www.amazon.com/s?k=12v+solenoid+bolt) | Good for doors |
| Electric Cabinet Lock | ~$10-15 | [Amazon](https://www.amazon.com/s?k=electric+cabinet+lock+12v) | More robust |

**Specs to check**: 
- Voltage: 12V DC (matches common power supplies)
- Current draw: <1A (most ESP32 power supplies handle this)
- "Fail-secure" = locked without power (safer)

**Quantity needed**: 1

---

### 5. Power Supply
**What**: Powers everything  
**Why**: Need stable 5V for ESP32, 12V for lock  

| Option | Price | Link | Notes |
|--------|-------|------|-------|
| **USB Power Bank** | ~$10-20 | BYO or [Amazon](https://www.amazon.com/s?k=anker+power+bank+10000mah) | You probably have one |
| 12V 2A PSU | ~$8-12 | [Amazon](https://www.amazon.com/s?k=12v+2a+power+supply) | If you want wall power |
| 5V/12V Dual Output | ~$12-15 | [Amazon](https://www.amazon.com/s?k=5v+12v+dual+power+supply) | Powers both voltages |

**Recommendation**: Start with a USB power bank you already own (like a phone charger battery). Upgrade to 12V PSU later for permanent installs.

**Quantity needed**: 1

---

### 6. Jumper Wires
**What**: Connects everything together  
**Why**: No soldering required  

| Option | Price | Link | Notes |
|--------|-------|------|-------|
| **Dupont M-M Wires** | ~$5-7 | [Amazon](https://www.amazon.com/s?k=dupont+jumper+wires+male+male) | 40pcs, assorted lengths |
| Jumper Wire Kit | ~$6-10 | [Amazon](https://www.amazon.com/s?k=jumper+wire+kit+breadboard) | If you want colors/organization |

**What you need**: Male-to-male (M-M) for breadboard connections

**Quantity needed**: 1 pack (40 wires)

---

### 7. Enclosure
**What**: The actual box/locker  
**Why**: Holds the stuff  

| Option | Price | Link | Use Case |
|--------|-------|------|----------|
| **Plastic Toolbox** | ~$12-18 | [Amazon](https://www.amazon.com/s?k=plastic+tool+box+with+latch) | Indoor, portable, cheapest |
| 50 Cal Ammo Can | ~$15-25 | [Amazon](https://www.amazon.com/s?k=50+cal+ammo+can) | Outdoor, rugged, iconic |
| Metal Cash Box | ~$10-15 | [Amazon](https://www.amazon.com/s?k=metal+cash+box+with+lock) | Pre-built lock, easier mod |
| File Cabinet Lock | ~$8-15 | [Amazon](https://www.amazon.com/s?k=file+cabinet+lock+cylinder) | Retrofit existing drawer |

**Recommendation**: Start with a cheap plastic toolbox to test, upgrade to ammo can for "production."

**Quantity needed**: 1

---

## Optional But Recommended

### 8. LED + Buzzer
**What**: Visual/audio feedback  
**Why**: Know if it worked  

| Option | Price | Link |
|--------|-------|------|
| RGB LED 5mm (10pcs) | ~$5 | [Amazon](https://www.amazon.com/s?k=rgb+led+5mm+common+anode) |
| Piezo Buzzer | ~$4-6 | [Amazon](https://www.amazon.com/s?k=piezo+buzzer+5v+active) |
| Resistor Kit | ~$6 | [Amazon](https://www.amazon.com/s?k=resistor+kit+assorted) |

**Quantity needed**: 1-2 LEDs, 1 buzzer, handful of 220Ω resistors

---

### 9. Multimeter
**What**: Measures voltage/continuity  
**Why**: Debug, test, make sure things work  

| Option | Price | Link |
|--------|-------|------|
| **Basic Digital Multimeter** | ~$12-20 | [Amazon](https://www.amazon.com/s?k=digital+multimeter+auto+ranging) |

**Worth it?** Yes. You'll use this for every electronics project.

**Quantity needed**: 1 (but you probably want one anyway)

---

### 10. Breadboard
**What**: Temporary prototyping board  
**Why**: Test before final wiring  

| Option | Price | Link |
|--------|-------|------|
| **Half-size Breadboard** | ~$4-6 | [Amazon](https://www.amazon.com/s?k=breadboard+half+size) |
| Breadboard + Jumper Kit | ~$8-12 | [Amazon](https://www.amazon.com/s?k=breadboard+jumper+kit) |

**Quantity needed**: 1

---

## Cost Breakdown

### Minimum Viable ($28-35)
| Item | Cost |
|------|------|
| ESP32-C3 | $5 |
| PN532 NFC | $8 |
| Relay Module | $6 |
| Solenoid Lock | $9 |
| Jumper Wires | $6 |
| Toolbox | $0 (use what you have) |
| Power Bank | $0 (use what you have) |
| **Total** | **~$28-35** |

### Recommended ($38-50)
Add:
- LED + Buzzer ($5)
- Multimeter ($15)
- Better enclosure ($12)
- Breadboard ($5)
- **Total: ~$55-70**

### Deluxe ($80-100)
Add to recommended:
- 12V PSU ($12)
- Ammo can ($20)
- Cable management ($8)
- Tamper switch ($5)
- **Total: ~$105-125**

---

## Search Terms for Amazon

Copy-paste these directly:

```
esp32 c3 devkit
pn532 nfc module i2c
5v relay module optocoupler
12v electromagnetic lock cabinet
50 cal ammo can
dupont jumper wires male male
rgb led 5mm common anode
piezo buzzer 5v
breadboard half size
digital multimeter auto ranging
```

---

## What to Expect

**Delivery**: 2-5 days (Prime)
**Total weight**: ~2-3 lbs
**Box size**: Shoebox-sized

**Pro tip**: Order from one seller if possible to save on shipping.

---

## Ready to Buy?

**Starter kit (~$30):**
1. ESP32-C3 DevKit
2. PN532 NFC module
3. 5V relay module
4. 12V solenoid lock
5. Jumper wires

**Use existing:** phone charger (power), any box (enclosure)

**Build time:** 2-3 hours  
**Difficulty:** Beginner  
**Support:** [GitHub Issues](https://github.com/PlutarchsEcho/nostr-dead-drop-lockers/issues)

---

*Build your first locker this weekend.*
