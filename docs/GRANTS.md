# OpenSats Grant Application Template

## Project Information

**Project Name:** DeadDropstr  
**Requested Amount:** $50,000  
**Project Duration:** 12 months  
**Applicant:** [Your name/handle]  
**Contact:** [Your email]  
**GitHub:** https://github.com/PlutarchsEcho/nostr-dead-drop-lockers  

---

## Executive Summary

DeadDropstr is an open-source, Nostr-native dead drop network built on Bitcoin. We combine physical IoT lockers with Lightning payments to create a peer-to-peer exchange layer outside traditional financial rails.

The project consists of:
1. **Open hardware locker controllers** (ESP32-based, sub-$30 cost)
2. **Nostr marketplace** for discovering and renting lockers
3. **Lightning payment integration** for trustless rentals
4. **Proxy service protocol** for third-party delivery

Our goal: Enable permissionless, censorship-resistant physical exchange at the community level.

---

## The Problem

Peer-to-peer trade faces friction:
- Meeting strangers is risky
- Shipping requires trust/identity
- Cash is geographically limited
- Digital surveillance is ubiquitous

Current solutions (mail, meetups, escrow services) either compromise privacy, require trusted intermediaries, or expose users to surveillance.

---

## Our Solution

**Smart Lockers + Bitcoin + Nostr**

Users can:
- Deploy a low-cost IoT locker anywhere with power/WiFi
- List it on the Nostr network (no central server)
- Accept Lightning payments autonomously
- Enable proxy delivery (someone else handles the drop)
- Exchange goods without meeting or sharing identity

**Key Innovation:** The locker validates codes locally using Nostr events. No cloud dependency. Even if the internet is spotty, rentals remain valid.

---

## Technical Architecture

### Hardware
- **Controller:** ESP32-C3 ($3) + NFC reader ($3) + relay ($3)
- **Starter Pack Cost:** ~$25 total build
- **Power:** USB power bank or 12V supply
- **Connectivity:** WiFi (with 4G upgrade path)
- **Enclosure:** Repurposed toolbox/ammo can or custom

### Software Stack
- **Firmware:** C++ (Arduino/PlatformIO)
- **Marketplace:** React + TypeScript + Nostr (kind 30402 events)
- **Payments:** Lightning invoices + BTCPay/LNDhub
- **Sync:** Nostr relay communication (offline-capable)

### Security Model
- Codes validated locally (SHA256 + salt + expiry)
- Access logs signed by device key
- Optional: Secure element (ATECC608A) for high-security deploys
- Tamper detection with alerts

---

## Milestones & Deliverables

### Phase 1: MVP Firmware (Months 1-3) - $10,000
- [ ] Working NFC unlock with local validation
- [ ] Nostr event parsing (rental creation/cancellation)
- [ ] WiFi + relay sync implementation
- [ ] Access logging to SD card
- [ ] 5 alpha test deployments
**Deliverable:** Functional starter pack firmware, documentation, 5 working lockers

### Phase 2: Network Integration (Months 4-6) - $15,000
- [ ] Lightning payment verification
- [ ] Automatic code generation on payment
- [ ] Marketplace sync (bidirectional)
- [ ] BLE phone app for backup access
- [ ] 20 beta deployments in 5 cities
**Deliverable:** Production firmware v1.0, documented deployment guides

### Phase 3: Scale & Proxy (Months 7-9) - $15,000
- [ ] Multi-lock controller support (RS-485 bus)
- [ ] Proxy service protocol (third-party delivery)
- [ ] OTA firmware updates
- [ ] Battery/solar power optimization
- [ ] 50+ lockers deployed globally
**Deliverable:** Multi-lock firmware, proxy protocol spec, deployment network

### Phase 4: Ecosystem (Months 10-12) - $10,000
- [ ] Mobile app for renters
- [ ] Analytics dashboard for locker owners
- [ ] Community documentation & workshops
- [ ] Hardware kit distribution
- [ ] 100+ active lockers
**Deliverable:** Complete ecosystem, sustainable community

---

## Use of Funds

| Category | Amount | Purpose |
|----------|--------|---------|
| Hardware R&D | $15,000 | Component testing, PCB design, 50 dev kits |
| Firmware Development | $20,000 | 12 months dev time (part-time) |
| Documentation | $5,000 | Video tutorials, build guides, workshops |
| Test Deployments | $5,000 | Ship kits to 20+ test locations globally |
| Infrastructure | $5,000 | Relays, domains, hosting for 2 years |
| **Total** | **$50,000** | |

---

## Why OpenSats?

1. **Aligned Mission:** We're building open-source Bitcoin infrastructure that benefits the entire ecosystem
2. **Proven Track Record:** [If you have prior FOSS contributions, mention them]
3. **Pure FOSS:** No platform fees. Locker owners keep 100% of revenue. We charge nothing.
4. **No Vendor Lock-in:** Pure FOSS, no proprietary hardware or services
5. **Sustainable:** Grant funds development only; protocol remains free forever

---

## Traction & Evidence

- **Working MVP:** https://plutarchsecho.github.io/nostr-dead-drop-lockers/
- **Hardware Spec:** Complete modular architecture designed
- **Community:** [Add any existing interest/feedback]
- **Prototype:** First build in progress

---

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Hardware supply chain | Multiple suppliers, generic components only |
| Regulatory (physical drop boxes) | Terms of service, user certification, legal review in Phase 2 |
| Security vulnerabilities | Open audit process, bug bounty program |
| Adoption | Target Bitcoin communities first (aligned users) |

---

## Long-term Vision

> "A global mesh of peer-to-peer exchange points, powered by Bitcoin, discoverable via Nostr, accessible to anyone with $25 and an internet connection."

After 12 months, DeadDropstr will be:
- A thriving open hardware project with 100+ active contributors
- Deployed in 20+ countries
- Processing regular Lightning payments
- Enabling circular economies in underserved communities

---

## Submission Checklist

- [ ] Project description complete
- [ ] Budget breakdown detailed
- [ ] GitHub repo public
- [ ] Demo video recorded
- [ ] Social media links provided
- [ ] Reference contacts (if any)

---

**Submit to:** grants@opensats.org  
**Format:** Email or apply via OpenSats website  
**Response Time:** Typically 4-8 weeks

---

## Post-Submission

After applying:
1. Tweet about it: "Just applied for @OpenSats grant to build [brief description]"
2. Join OpenSats Discord, introduce project
3. Continue building (momentum matters)
4. Document progress publicly
