/**
 * ESP32 Nostr Lock Controller - NIP-17 Gift-Wrapped Unlock Commands
 * 
 * This template demonstrates how an ESP32 can:
 * 1. Connect to a Nostr relay via WebSocket
 * 2. Subscribe to kind 1059 (gift-wrapped) events addressed to its pubkey
 * 3. Decrypt NIP-17 messages (gift wrap -> seal -> inner message)
 * 4. Verify payment preimage (sha256(preimage) == payment_hash)
 * 5. Trigger GPIO to unlock a solenoid lock
 * 
 * SECURITY NOTES:
 * - DO NOT store private keys in plaintext on production devices
 * - Use secure element (e.g., ATECC608A) or encrypted flash for key storage
 * - Use TLS (wss://) connections only
 * - Implement rate limiting to prevent unlock command spam
 * - Consider adding nonce/timestamp checks to prevent replay attacks
 * 
 * HARDWARE SETUP:
 * - ESP32 GPIO pin connected to relay module or TIP120 transistor
 * - Relay/transistor controls 12V solenoid lock
 * - ESP32 cannot directly drive 12V solenoids - use proper driver circuit!
 */

#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
// You'll need a crypto library for NIP-44 decryption, e.g.:
// #include <secp256k1.h>
// #include <ChaCha20Poly1305.h>
// #include <mbedtls/sha256.h>

// ============================================================================
// Configuration
// ============================================================================

const char* ssid = "YOUR_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Nostr relay - use wss:// for production
const char* relayHost = "relay.ditto.pub";
const uint16_t relayPort = 443;
const char* relayPath = "/";

// Hardware configuration
const int LOCK_PIN = 23;           // GPIO for relay/transistor control
const int UNLOCK_DURATION_MS = 5000; // How long to keep lock open

// Device Nostr identity (MUST be stored securely in production!)
// Generate with: openssl rand -hex 32
const char* devicePrivKeyHex = "<YOUR_32_BYTE_HEX_PRIVATE_KEY>";
const char* devicePubKeyHex = "<CORRESPONDING_HEX_PUBKEY>";

// Expected locker ID (from your NIP-99 listing d-tag)
const char* expectedLockerId = "<YOUR_LOCKER_D_TAG>";

WebSocketsClient webSocket;

// ============================================================================
// Crypto Helpers (Pseudocode - implement with real crypto library)
// ============================================================================

/**
 * NIP-44 Decryption (pseudocode)
 * 
 * Real implementation requires:
 * 1. ECDH shared secret derivation using secp256k1
 * 2. HKDF key derivation
 * 3. ChaCha20-Poly1305 decryption
 * 
 * Libraries needed:
 * - secp256k1 for ECDH
 * - mbedtls or similar for ChaCha20-Poly1305
 */
String nip44Decrypt(const char* ciphertext, const char* senderPubkey, const char* recipientPrivkey) {
  // PSEUDOCODE - Replace with actual NIP-44 implementation
  // 
  // 1. Decode base64 ciphertext
  // 2. Extract version byte, nonce, ciphertext, and MAC
  // 3. Compute ECDH shared point: shared = senderPubkey * recipientPrivkey
  // 4. Derive conversation key using HKDF
  // 5. Derive message keys from conversation key and nonce
  // 6. Verify MAC
  // 7. Decrypt with ChaCha20-Poly1305
  // 8. Unpad plaintext
  //
  // For now, return empty string (implement with real crypto!)
  Serial.println("[CRYPTO] NIP-44 decryption not yet implemented");
  return "";
}

/**
 * Verify payment preimage
 * 
 * Lightning payments use: payment_hash = sha256(preimage)
 * To verify: compute sha256(preimage) and compare with expected payment_hash
 */
bool verifyPreimage(const char* preimageHex, const char* expectedPaymentHashHex) {
  // Convert hex preimage to bytes
  uint8_t preimage[32];
  for (int i = 0; i < 32; i++) {
    sscanf(&preimageHex[i * 2], "%2hhx", &preimage[i]);
  }
  
  // Compute SHA256 of preimage
  uint8_t hash[32];
  // mbedtls_sha256(preimage, 32, hash, 0);
  // OR use ESP32's built-in SHA:
  // esp_sha(SHA2_256, preimage, 32, hash);
  
  // For now, just log (implement with real crypto!)
  Serial.println("[CRYPTO] Preimage verification not yet implemented");
  Serial.print("Received preimage: ");
  Serial.println(preimageHex);
  
  // In production: compare computed hash with expectedPaymentHashHex
  // return memcmp(hash, expectedHash, 32) == 0;
  
  // For testing, accept all preimages (REMOVE IN PRODUCTION!)
  return true;
}

/**
 * Extract payment hash from bolt11 invoice
 * 
 * In production, parse the bolt11 invoice to extract the payment hash
 * for verification against the preimage
 */
String extractPaymentHashFromInvoice(const char* bolt11Invoice) {
  // PSEUDOCODE - Implement bolt11 parsing
  // The payment hash is in the invoice after the "1" separator
  // and before the signature
  Serial.println("[INVOICE] Bolt11 parsing not yet implemented");
  return "";
}

// ============================================================================
// NIP-17 Message Processing
// ============================================================================

/**
 * Process a NIP-17 gift-wrapped message
 * 
 * Structure:
 * - Kind 1059 (gift wrap): encrypted with random ephemeral key -> our pubkey
 * - Kind 13 (seal): encrypted with sender key -> our pubkey
 * - Kind 14 (private message): contains the actual unlock command
 */
void processGiftWrap(JsonObject& giftWrap) {
  // Step 1: Extract gift wrap content and decrypt
  String giftWrapContent = giftWrap["content"].as<String>();
  String giftWrapPubkey = giftWrap["pubkey"].as<String>();
  
  Serial.println("[NIP-17] Processing gift wrap from ephemeral key");
  
  // Decrypt gift wrap using our private key and the gift wrap's pubkey
  String sealJson = nip44Decrypt(giftWrapContent.c_str(), giftWrapPubkey.c_str(), devicePrivKeyHex);
  if (sealJson.isEmpty()) {
    Serial.println("[NIP-17] Failed to decrypt gift wrap");
    return;
  }
  
  // Step 2: Parse the seal (kind 13)
  DynamicJsonDocument sealDoc(4096);
  DeserializationError err = deserializeJson(sealDoc, sealJson);
  if (err) {
    Serial.println("[NIP-17] Failed to parse seal JSON");
    return;
  }
  
  int sealKind = sealDoc["kind"].as<int>();
  if (sealKind != 13) {
    Serial.println("[NIP-17] Invalid seal kind");
    return;
  }
  
  String sealPubkey = sealDoc["pubkey"].as<String>();
  String sealContent = sealDoc["content"].as<String>();
  
  Serial.print("[NIP-17] Seal from sender: ");
  Serial.println(sealPubkey);
  
  // Step 3: Decrypt the seal to get inner message (kind 14)
  String innerMessageJson = nip44Decrypt(sealContent.c_str(), sealPubkey.c_str(), devicePrivKeyHex);
  if (innerMessageJson.isEmpty()) {
    Serial.println("[NIP-17] Failed to decrypt seal");
    return;
  }
  
  // Step 4: Parse the inner message
  DynamicJsonDocument innerDoc(2048);
  err = deserializeJson(innerDoc, innerMessageJson);
  if (err) {
    Serial.println("[NIP-17] Failed to parse inner message JSON");
    return;
  }
  
  int innerKind = innerDoc["kind"].as<int>();
  if (innerKind != 14) {
    Serial.println("[NIP-17] Invalid inner message kind");
    return;
  }
  
  // Verify sender pubkey matches across seal and inner message
  String innerPubkey = innerDoc["pubkey"].as<String>();
  if (innerPubkey != sealPubkey) {
    Serial.println("[NIP-17] SECURITY: Sender pubkey mismatch!");
    return;
  }
  
  // Step 5: Parse the unlock command from content
  String commandContent = innerDoc["content"].as<String>();
  
  DynamicJsonDocument cmdDoc(1024);
  err = deserializeJson(cmdDoc, commandContent);
  if (err) {
    Serial.println("[NIP-17] Failed to parse unlock command JSON");
    return;
  }
  
  const char* action = cmdDoc["action"];
  const char* lockerId = cmdDoc["locker_id"];
  const char* preimage = cmdDoc["payment_preimage"];
  const char* invoice = cmdDoc["rental_invoice"];
  
  Serial.println("[UNLOCK] Command received:");
  Serial.print("  Action: "); Serial.println(action);
  Serial.print("  Locker ID: "); Serial.println(lockerId);
  Serial.print("  From sender: "); Serial.println(sealPubkey);
  
  // Step 6: Validate unlock command
  if (String(action) != "unlock") {
    Serial.println("[UNLOCK] Invalid action");
    return;
  }
  
  if (String(lockerId) != expectedLockerId) {
    Serial.println("[UNLOCK] Locker ID mismatch - ignoring");
    return;
  }
  
  // Step 7: Verify payment preimage
  // In production: extract payment_hash from invoice and verify preimage
  // String expectedHash = extractPaymentHashFromInvoice(invoice);
  // if (!verifyPreimage(preimage, expectedHash.c_str())) {
  //   Serial.println("[UNLOCK] INVALID PREIMAGE - refusing to unlock");
  //   return;
  // }
  
  // For testing only (REMOVE IN PRODUCTION)
  if (!verifyPreimage(preimage, "")) {
    Serial.println("[UNLOCK] Preimage verification failed");
    return;
  }
  
  // Step 8: UNLOCK THE LOCKER!
  Serial.println("[UNLOCK] *** UNLOCKING SOLENOID ***");
  digitalWrite(LOCK_PIN, HIGH);
  delay(UNLOCK_DURATION_MS);
  digitalWrite(LOCK_PIN, LOW);
  Serial.println("[UNLOCK] Solenoid re-locked");
  
  // Optional: Publish confirmation event back to relay
  // publishConfirmation(sealPubkey, lockerId);
}

// ============================================================================
// WebSocket Event Handler
// ============================================================================

void onWebSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_CONNECTED:
      Serial.println("[WS] Connected to relay");
      {
        // Subscribe to kind 1059 (gift wrap) events addressed to our pubkey
        // This is the NIP-17 way - gift wraps hide sender identity
        String filter = String("{\"kinds\":[1059],\"#p\":[\"") + devicePubKeyHex + "\"],\"limit\":50}";
        String req = String("[\"REQ\",\"nip17-unlock\",") + filter + "]";
        webSocket.sendTXT(req);
        Serial.println("[WS] Subscribed to kind 1059 gift wraps");
      }
      break;
      
    case WStype_DISCONNECTED:
      Serial.println("[WS] Disconnected from relay");
      break;
      
    case WStype_TEXT:
      {
        DynamicJsonDocument doc(16384);
        DeserializationError err = deserializeJson(doc, payload, length);
        if (err) {
          Serial.println("[WS] Failed to parse message");
          return;
        }
        
        if (!doc.is<JsonArray>()) return;
        
        String msgType = doc[0].as<String>();
        if (msgType == "EVENT") {
          JsonObject event = doc[2].as<JsonObject>();
          int kind = event["kind"].as<int>();
          
          if (kind == 1059) {
            // NIP-17 gift-wrapped message
            processGiftWrap(event);
          }
        } else if (msgType == "EOSE") {
          Serial.println("[WS] End of stored events");
        } else if (msgType == "NOTICE") {
          Serial.print("[WS] Relay notice: ");
          Serial.println(doc[1].as<String>());
        }
      }
      break;
      
    default:
      break;
  }
}

// ============================================================================
// Setup and Loop
// ============================================================================

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n=== ESP32 Nostr Lock Controller ===");
  Serial.println("NIP-17 Gift-Wrapped Unlock Commands");
  Serial.println();
  
  // Initialize lock pin
  pinMode(LOCK_PIN, OUTPUT);
  digitalWrite(LOCK_PIN, LOW);
  Serial.print("Lock pin configured on GPIO ");
  Serial.println(LOCK_PIN);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("WiFi connected. IP: ");
  Serial.println(WiFi.localIP());
  
  // Connect to Nostr relay
  Serial.print("Connecting to relay: ");
  Serial.println(relayHost);
  webSocket.beginSSL(relayHost, relayPort, relayPath);
  webSocket.onEvent(onWebSocketEvent);
  webSocket.setReconnectInterval(5000);
  
  Serial.println("\nListening for unlock commands...");
}

void loop() {
  webSocket.loop();
  
  // Optional: Add watchdog, status LED blink, etc.
}

/**
 * IMPLEMENTATION CHECKLIST:
 * 
 * [ ] Install required libraries:
 *     - WebSocketsClient
 *     - ArduinoJson
 *     - secp256k1 (for ECDH)
 *     - mbedtls (for ChaCha20-Poly1305, SHA256)
 * 
 * [ ] Implement nip44Decrypt() with real NIP-44 cryptography
 * 
 * [ ] Implement verifyPreimage() with SHA256
 * 
 * [ ] Implement extractPaymentHashFromInvoice() for bolt11 parsing
 * 
 * [ ] Set up secure key storage (secure element or encrypted flash)
 * 
 * [ ] Add rate limiting to prevent unlock spam
 * 
 * [ ] Add timestamp/nonce validation to prevent replay attacks
 * 
 * [ ] Configure proper hardware driver circuit for solenoid
 * 
 * [ ] Test thoroughly before production deployment!
 */
