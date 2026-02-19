# Deployment Guide - Nostr Dead Drop Lockers

## Frontend Deployment Options

### Option 1: Static Hosting (Easiest)

#### Netlify (Recommended for quick deploy)
```bash
# Build the project
npm run build

# Install Netlify CLI if needed
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

Or connect your GitHub repo for auto-deploys on every push.

#### Cloudflare Pages (Best for censorship resistance)
```bash
# Build
npm run build

# Use wrangler CLI or drag-drop dist/ folder in Cloudflare dashboard
npx wrangler pages deploy dist
```

#### Vercel
```bash
npm i -g vercel
vercel --prod
```

### Option 2: Self-Hosted (Full Control)

#### VPS (DigitalOcean, Hetzner, etc.)
```bash
# Build locally
npm run build

# SCP to server
scp -r dist/* user@your-server:/var/www/lockers/

# Or use rsync for updates
rsync -avz --delete dist/ user@your-server:/var/www/lockers/
```

#### Raspberry Pi / Local Server
```bash
# Install Caddy (easy HTTPS)
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# Caddyfile
echo 'lockers.yourdomain.com {
    root * /var/www/lockers
    file_server
    try_files {path} /index.html
}' | sudo tee /etc/caddy/Caddyfile

sudo systemctl reload caddy
```

### Option 3: IPFS (Truly Decentralized)

```bash
# Build
npm run build

# Pin to IPFS
ipfs add -r dist/

# Get CID and access via:
# https://ipfs.io/ipfs/YOUR_CID
# https://dweb.link/ipfs/YOUR_CID
# Or use a gateway like Pinata, Fleek, or Web3.Storage
```

**Recommended for this project given your values:** IPFS + Cloudflare Pages fallback

---

## ESP32 Hardware Deployment

### Bill of Materials

| Component | Purpose | Est. Cost |
|-----------|---------|-----------|
| ESP32-WROOM-32 | Main controller | $5-8 |
| 12V Solenoid Lock | Physical lock | $15-25 |
| 12V 2A PSU | Power | $10-15 |
| TIP120 or relay module | Lock driver | $3-5 |
| Diode (1N4007) | Back-EMF protection | $0.10 |
| Resistors, capacitors | Circuit | $2 |
| Enclosure | Weather protection | $15-30 |
| **Total** | | **~$50-80 per locker** |

### Circuit Diagram

```
ESP32 GPIO23 ----[1kΩ]----|       |---- Solenoid (+)
                          | TIP120|
                    GND ---|       |---- Solenoid (-) --- 12V GND
                                  |
                                 [1N4007 Diode across solenoid terminals]
                                 
12V PSU -----> Solenoid (+)
12V PSU GND --> ESP32 GND (common ground)
USB/5V -------> ESP32 VIN (or separate 5V regulator)
```

### Flashing the ESP32

1. **Generate keys:**
```bash
# Generate private key
openssl rand -hex 32

# Get corresponding pubkey (use nostr-tools or similar)
npx nostr-tools keygen  # or use getalby.com/nostr
```

2. **Update config in Arduino sketch:**
```cpp
const char* devicePrivKeyHex = "YOUR_PRIVATE_KEY";
const char* devicePubKeyHex = "YOUR_PUBLIC_KEY";
const char* expectedLockerId = "locker-downtown-001";
```

3. **Upload:**
   - Install ESP32 board support in Arduino IDE
   - Select Tools → Board → ESP32 Dev Module
   - Select correct COM port
   - Click Upload

---

## Production Checklist

### Security
- [ ] Move private keys to secure element (ATECC608A) or encrypted flash
- [ ] Implement rate limiting (max 1 unlock per minute)
- [ ] Add nonce/timestamp validation to prevent replay attacks
- [ ] Use only wss:// (TLS) relay connections
- [ ] Consider adding a physical tamper switch

### Monitoring
- [ ] Add heartbeat/status events from ESP32 (publish every hour)
- [ ] Monitor relay connections with ping/pong
- [ ] Log unlock events for audit trail
- [ ] Set up alerts if locker goes offline

### Economics
- [ ] Set competitive pricing based on location/demand
- [ ] Consider dynamic pricing for peak times
- [ ] Implement trust score minimums for renters

---

## Domain & Branding

**Suggested domains to check:**
- deadlock.network
- nostrlock.io
- dropbox.network (taken?)
- locker.nostr (if nostr handles become a thing)

**For IPFS deployment without a domain:**
- Just share the IPFS CID
- Update via Nostr event (publish new CID as kind 1 with #dead-drop-lockers tag)
- Client can follow for updates

---

## Recommended Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User's Phone                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Nostr Wallet │  │   Browser    │  │  Lightning   │       │
│  │   (NWC)      │  │   (React)    │  │   Wallet     │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
└─────────┼─────────────────┼─────────────────┼───────────────┘
          │                 │                 │
          │    NIP-47       │     HTTPS       │   BOLT11
          │   (WebSocket)   │    (or IPFS)    │   (Lightning)
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    Nostr Relays (Public)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │relay.dito│  │relay.nstr│  │relay.dmus│  │your-relay│    │
│  │  .pub    │  │.band     │  │  .io     │  │          │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │  NIP-17 Gift Wrap (kind 1059)
                              │  NIP-99 Listing (kind 30402)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    ESP32 Hardware Controller                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   WiFi       │  │   NIP-44     │  │   GPIO       │       │
│  │  Module      │  │ Decryption   │  │  Control     │       │
│  └──────┬───────┘  └──────────────┘  └──────┬───────┘       │
│         │                                    │               │
│         └────────────────────────────────────┘               │
│                              │                               │
└──────────────────────────────┼───────────────────────────────┘
                               ▼
                        ┌──────────────┐
                        │  Solenoid    │
                        │    Lock      │
                        └──────────────┘
```