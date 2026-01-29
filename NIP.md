# Dead Drop Locker Network Protocol

This document describes the Nostr protocol extensions used by the Dead Drop Locker Network - a decentralized marketplace for autonomous physical lockers.

## Overview

The Dead Drop Network enables:
- **Box Owners**: Deploy and manage physical smart lockers
- **Buyers**: Find available lockers and rent them for dead-drop exchanges
- **Sellers**: Use lockers to facilitate anonymous P2P trades

## Event Kinds Used

### Kind 30402: Locker Listing (NIP-99 Classified Listing)

Locker listings use the standard NIP-99 classified listing format with specific tags for locker metadata.

```jsonc
{
  "kind": 30402,
  "content": "Secure smart locker located in downtown area. 24/7 access. Weather-protected.",
  "tags": [
    ["d", "<unique-locker-id>"],
    ["title", "Downtown Dead Drop Box #42"],
    ["t", "locker"],
    ["t", "dead-drop"],
    ["g", "<geohash>"],
    ["location", "123 Main St, City"],
    ["price", "1000", "SATS"],
    ["status", "available"],
    ["image", "<url>", "256x256"],
    
    // Locker-specific metadata
    ["dimensions", "30x30x45"],
    ["overdue-fee", "10"],
    ["overdue-days", "7"],
    ["proxy-mode", "false"],
    ["proxy-fee", "500"],
    ["abandon-days", "30"]
  ],
  "pubkey": "<box-owner-pubkey>",
  // ...
}
```

#### Required Tags

| Tag | Description |
|-----|-------------|
| `d` | Unique identifier for the locker |
| `title` | Human-readable name for the locker |
| `t` | Must include `locker` tag for filtering |
| `g` | Geohash for location (enables geographic queries) |
| `price` | Base rental fee in SATS |
| `status` | One of: `available`, `occupied`, `maintenance` |

#### Optional Tags

| Tag | Description |
|-----|-------------|
| `location` | Human-readable address |
| `dimensions` | Box dimensions in cm (WxHxD) |
| `overdue-fee` | Percentage fee increase per overdue period |
| `overdue-days` | Days before overdue fee applies |
| `proxy-mode` | If `true`, owner manually handles item |
| `proxy-fee` | Additional SATS fee for proxy service |
| `abandon-days` | Days until abandoned property rules apply |
| `image` | Photo of the locker |

### Kind 30403: Draft Locker Listing

Same structure as 30402, used for unpublished drafts.

## Unlock Commands

### Kind 4 (NIP-04) or Kind 14 (NIP-17): Encrypted Unlock Command

Sent from a buyer/renter to the locker's hardware bridge after payment is verified.

```jsonc
{
  "kind": 4,
  "content": "<encrypted JSON>",
  "tags": [
    ["p", "<locker-pubkey>"]
  ]
}
```

Decrypted content:
```jsonc
{
  "action": "unlock",
  "locker_id": "<d-tag of locker listing>",
  "payment_preimage": "<lightning preimage>",
  "rental_invoice": "<original bolt11 invoice>"
}
```

## Hardware Bridge Events

The ESP32 hardware controller listens for encrypted DMs containing unlock commands. Upon receiving a valid command with verified payment preimage, it triggers the GPIO to unlock the solenoid.

### Verification Flow

1. Hardware receives kind 4/14 DM addressed to its pubkey
2. Decrypts message using its private key
3. Verifies `payment_preimage` corresponds to a paid invoice
4. If valid, sets GPIO HIGH for 5 seconds to unlock solenoid
5. Optionally publishes status update

## Trust Score Calculation

Trust scores are calculated from NIP-25 reactions (kind 7) received by the box owner:

- `+` reactions: +1 point
- `-` reactions: -1 point
- Zaps: +1 point per 1000 sats received

Score = (positive_reactions + zap_points) / total_reactions * 100

## Payment Flow

1. **Rental Fee**: Paid via NIP-47 (NWC) or WebLN to box owner's Lightning address
2. **Goods Payment**: Direct P2P zaps between buyer and seller (separate from rental)
3. **Unlock**: After rental payment confirmation, unlock command is sent

## Relay Recommendations

Lockers should publish to geographically relevant relays and general-purpose relays for discoverability. The `g` (geohash) tag enables efficient geographic queries.
