# NSite Deployment Guide - Nostr-Native Hosting

## What is nsite?

nsite hosts static websites entirely on Nostr using NIP-94 (file header events) and optionally Blossom servers for binary storage.

Your site becomes:
- Censorship-resistant (no DNS, no hosting provider)
- Versioned naturally (every update is a new Nostr event)
- Discoverable via Nostr (people can follow site updates)

---

## Installation

```bash
# Install nsite CLI
npm install -g nsite-cli

# Verify
nsite --version
```

---

## Quick Deploy

### 1. Build Your Project

```bash
cd ~/Desktop/projects/nostr-dead-drop-lockers
npm run build
```

### 2. Configure nsite

Create `~/.nsite.json`:

```json
{
  "relays": [
    "wss://relay.ditto.pub",
    "wss://relay.nostr.band",
    "wss://relay.damus.io",
    "wss://nos.lol"
  ],
  "blossom": [
    "https://blossom.f7z.io",
    "https://cdn.nostrcheck.me"
  ],
  "secret_key": "nsec1..."  // Or use NOSTR_SECRET_KEY env var
}
```

**Security tip:** Don't put your nsec in the config file for production. Use:
```bash
export NOSTR_SECRET_KEY="nsec1..."
```

### 3. Deploy

```bash
# Basic deploy
nsite publish dist/

# With specific options
nsite publish dist/ \
  --title "Dead Drop Lockers" \
  --description "Decentralized smart locker network" \
  --tag "dead-drop" \
  --tag "lockers" \
  --tag "marketplace"

# With Blossom (recommended for large files)
nsite publish dist/ --use-blossom
```

### 4. Access Your Site

After publishing, you'll get a URL like:

```
https://nsite.lol/<your_npub>
```

Or access via any nsite gateway:
- `https://nsite.lol/<npub>`
- `https://nsite.run/<npub>`  (your link)
- Self-hosted gateway (see below)

---

## Advanced Configuration

### Custom Domain (NIP-05)

You can point a NIP-05 identifier to your nsite:

```json
// Your NIP-05 JSON at https://yourdomain.com/.well-known/nostr.json
{
  "names": {
    "lockers": "<your_pubkey_hex>"
  },
  "relays": {
    "<your_pubkey_hex>": [
      "wss://relay.ditto.pub"
    ]
  }
}
```

Then access: `https://nsite.lol/lockers@yourdomain.com`

### Self-Hosted Gateway

If you want your own gateway (faster, more control):

```bash
npm install -g nsite-gateway

# Run gateway
nsite-gateway --port 3000 --relays wss://relay.ditto.pub

# Access
http://localhost:3000/<npub>
```

---

## How It Works

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   dist/     │────▶│  nsite-cli  │────▶│ NIP-94      │
│   files     │     │  (upload)   │     │   events    │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                              ┌────────────────┘
                              ▼
                    ┌─────────────────────┐
                    │  Nostr Relays       │
                    │  (store events)     │
                    └──────────┬──────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
     ┌──────────┐      ┌──────────┐      ┌──────────┐
     │  nsite   │      │  nsite   │      │  self    │
     │ .lol     │      │ .run     │      │ hosted   │
     │ gateway  │      │ gateway  │      │ gateway  │
     └──────────┘      └──────────┘      └──────────┘
```

1. **nsite-cli** reads your files
2. Creates NIP-94 events with file metadata
3. Optionally uploads binaries to Blossom servers
4. Publishes to Nostr relays
5. **nsite gateways** query relays and serve files

---

## Pros & Cons

### ✅ Pros
- **Truly decentralized** - no domain, no hosting provider
- **Censorship-resistant** - files spread across relays
- **Versioned** - every update is a new event, history preserved
- **No cost** - just relay fees (often free)
- **Nostr-native** - fits the ethos of your project

### ❌ Cons
- **Slower than HTTP** - relay latency
- **Size limits** - relays may reject large files (use Blossom)
- **Availability** - depends on relays staying up
- **New** - still experimental

---

## Recommendation for Dead Drop Lockers

### Hybrid Deployment Strategy

```bash
#!/bin/bash
# deploy.sh

echo "Building..."
npm run build

echo "Deploying to nsite (Nostr-native)..."
nsite publish dist/ \
  --title "Dead Drop Lockers" \
  --description "Decentralized smart locker marketplace" \
  --tag "dead-drop-lockers" \
  --tag "v1.0.0" \
  --use-blossom

echo "Deploying to IPFS (fast fallback)..."
ipfs add -r dist/ --quieter | tail -1 > ipfs_hash.txt
pinata pin add --id=dead-drop-lockers $(cat ipfs_hash.txt)

echo "Publishing update to Nostr..."
nak event \
  --kind 1 \
  --content "🚀 Dead Drop Lockers v1.0.0 deployed!\n\nNostr: https://nsite.lol/<npub>\nIPFS: https://ipfs.io/ipfs/$(cat ipfs_hash.txt)" \
  --tag t dead-drop-lockers \
  --tag t deployment \
  --tag nsite <npub> \
  --tag ipfs $(cat ipfs_hash.txt)

echo "Done!"
```

### Why This Works

1. **nsite** = Source of truth, uncensorable, Nostr-native
2. **IPFS** = Fast loading for most users
3. **Both** = Redundancy if one goes down
4. **Nostr announcement** = Users discover updates naturally

---

## Testing Locally

Before deploying, test with a local gateway:

```bash
# Terminal 1: Start local gateway
nsite-gateway --port 3000 --relays wss://relay.ditto.pub

# Terminal 2: Publish
nsite publish dist/ --relays wss://relay.ditto.pub

# Browser: Open
http://localhost:3000/<your_npub>
```

---

## Troubleshooting

### "Relay rejected event"
- File too large → Use `--use-blossom`
- Rate limited → Wait and retry, or use different relays

### "Site not found"
- Relays haven't propagated yet → Wait 30-60 seconds
- Wrong npub → Check your public key

### "Gateway timeout"
- Relays are slow → Try different relays in config
- Self-host gateway for better performance

---

## Next Steps

1. **Install**: `npm install -g nsite-cli`
2. **Configure**: Set up `~/.nsite.json` with your relays
3. **Test**: Deploy a small test file first
4. **Deploy**: `nsite publish dist/`
5. **Share**: Post the nsite.lol URL on Nostr

Want me to help you set up the config and do a test deploy?