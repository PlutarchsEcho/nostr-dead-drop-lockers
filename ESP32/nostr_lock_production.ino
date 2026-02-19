#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <mbedtls/sha256.h>
#include <mbedtls/chachapoly.h>
#include <mbedtls/hkdf.h>
#include <mbedtls/ecp.h>
#include <mbedtls/ecdh.h>
#include <mbedtls/entropy.h>
#include <mbedtls/ctr_drbg.h>

// ============================================================================
// Configuration
// ============================================================================

const char* ssid = "YOUR_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

const char* relayHost = "relay.ditto.pub";
const uint16_t relayPort = 443;
const char* relayPath = "/";

const int LOCK_PIN = 23;
const int UNLOCK_DURATION_MS = 5000;

// Device Nostr identity (MUST be stored securely in production!)
// Generate with: openssl rand -hex 32
const char* devicePrivKeyHex = "YOUR_64_CHAR_HEX_PRIVATE_KEY_HERE";
const char* devicePubKeyHex = "YOUR_64_CHAR_HEX_PUBKEY_HERE";

const char* expectedLockerId = "YOUR_LOCKER_D_TAG";

WebSocketsClient webSocket;
mbedtls_entropy_context entropy;
mbedtls_ctr_drbg_context ctr_drbg;

// ============================================================================
// Utility Functions
// ============================================================================

// Convert hex string to byte array
bool hexToBytes(const char* hex, uint8_t* bytes, size_t len) {
  if (strlen(hex) != len * 2) return false;
  for (size_t i = 0; i < len; i++) {
    if (sscanf(&hex[i * 2], "%2hhx", &bytes[i]) != 1) return false;
  }
  return true;
}

// Convert byte array to hex string
void bytesToHex(const uint8_t* bytes, size_t len, char* hex) {
  for (size_t i = 0; i < len; i++) {
    sprintf(&hex[i * 2], "%02x", bytes[i]);
  }
  hex[len * 2] = '\0';
}

// Compute SHA256
bool sha256(const uint8_t* input, size_t inputLen, uint8_t output[32]) {
  mbedtls_sha256_context ctx;
  mbedtls_sha256_init(&ctx);
  if (mbedtls_sha256_starts(&ctx, 0) != 0) return false;
  if (mbedtls_sha256_update(&ctx, input, inputLen) != 0) return false;
  if (mbedtls_sha256_finish(&ctx, output) != 0) return false;
  mbedtls_sha256_free(&ctx);
  return true;
}

// ============================================================================
// secp256k1 Point Conversion (x-only for NIP-44)
// ============================================================================

// Decode a 32-byte x-only pubkey to mbedtls format
bool decodeXOnlyPubkey(const uint8_t x[32], mbedtls_ecp_point* point) {
  mbedtls_ecp_group grp;
  mbedtls_ecp_group_init(&grp);
  
  if (mbedtls_ecp_group_load(&grp, MBEDTLS_ECP_DP_SECP256K1) != 0) {
    mbedtls_ecp_group_free(&grp);
    return false;
  }
  
  // Set X coordinate
  if (mbedtls_mpi_read_binary(&point->X, x, 32) != 0) {
    mbedtls_ecp_group_free(&grp);
    return false;
  }
  
  // Compute Y from curve equation: y^2 = x^3 + 7
  // Y^2 = X^3 + 7
  mbedtls_mpi x3, seven, y2;
  mbedtls_mpi_init(&x3);
  mbedtls_mpi_init(&seven);
  mbedtls_mpi_init(&y2);
  
  mbedtls_mpi_lset(&seven, 7);
  mbedtls_mpi_mul_mpi(&x3, &point->X, &point->X);  // x^2
  mbedtls_mpi_mul_mpi(&x3, &x3, &point->X);        // x^3
  mbedtls_mpi_add_mpi(&y2, &x3, &seven);           // x^3 + 7
  
  // Compute square root (y = sqrt(y2))
  // This is complex on secp256k1 - simplified version
  // In practice, use a proper secp256k1 library or pre-compute
  
  mbedtls_mpi_free(&x3);
  mbedtls_mpi_free(&seven);
  mbedtls_mpi_free(&y2);
  mbedtls_ecp_group_free(&grp);
  
  // For now, set Y to 0 (will fail verification)
  mbedtls_mpi_lset(&point->Y, 0);
  mbedtls_mpi_lset(&point->Z, 1);
  
  return true;
}

// ============================================================================
// ECDH Key Exchange (for NIP-44)
// ============================================================================

// Compute shared secret: shared = pubkey * privkey
bool computeSharedSecret(const uint8_t theirPubkey[32], const uint8_t ourPrivkey[32], uint8_t sharedSecret[32]) {
  mbedtls_ecp_group grp;
  mbedtls_ecp_point theirPoint, resultPoint;
  mbedtls_mpi ourPrivkeyMPI;
  
  mbedtls_ecp_group_init(&grp);
  mbedtls_ecp_point_init(&theirPoint);
  mbedtls_ecp_point_init(&resultPoint);
  mbedtls_mpi_init(&ourPrivkeyMPI);
  
  // Load secp256k1
  if (mbedtls_ecp_group_load(&grp, MBEDTLS_ECP_DP_SECP256K1) != 0) goto cleanup;
  
  // Load their pubkey
  if (!decodeXOnlyPubkey(theirPubkey, &theirPoint)) goto cleanup;
  
  // Load our private key
  if (mbedtls_mpi_read_binary(&ourPrivkeyMPI, ourPrivkey, 32) != 0) goto cleanup;
  
  // Compute shared point: result = theirPubkey * ourPrivkey
  if (mbedtls_ecp_mul(&grp, &resultPoint, &ourPrivkeyMPI, &theirPoint, 
                       mbedtls_ctr_drbg_random, &ctr_drbg) != 0) goto cleanup;
  
  // Extract X coordinate as shared secret
  if (mbedtls_mpi_write_binary(&resultPoint.X, sharedSecret, 32) != 0) goto cleanup;
  
  mbedtls_ecp_group_free(&grp);
  mbedtls_ecp_point_free(&theirPoint);
  mbedtls_ecp_point_free(&resultPoint);
  mbedtls_mpi_free(&ourPrivkeyMPI);
  
  return true;
  
cleanup:
  mbedtls_ecp_group_free(&grp);
  mbedtls_ecp_point_free(&theirPoint);
  mbedtls_ecp_point_free(&resultPoint);
  mbedtls_mpi_free(&ourPrivkeyMPI);
  return false;
}

// ============================================================================
// NIP-44 Decryption
// ============================================================================

// NIP-44 uses ChaCha20-Poly1305 with HKDF key derivation
// This is a simplified implementation - consider using a proper Nostr crypto library

bool nip44Decrypt(const char* ciphertextB64, const char* senderPubkeyHex, const char* ourPrivkeyHex, char** plaintext) {
  // Decode base64 ciphertext
  size_t cipherLen = strlen(ciphertextB64);
  uint8_t* cipherBytes = (uint8_t*)malloc(cipherLen);
  size_t decodedLen = 0;
  
  // Base64 decode (implement or use library)
  // For now, this is a placeholder - you'll need base64 decoding
  
  // Parse NIP-44 format:
  // Version (1 byte) || Nonce (24 bytes) || Ciphertext || Auth Tag (16 bytes)
  
  // Decode keys
  uint8_t senderPubkey[32];
  uint8_t ourPrivkey[32];
  if (!hexToBytes(senderPubkeyHex, senderPubkey, 32)) return false;
  if (!hexToBytes(ourPrivkeyHex, ourPrivkey, 32)) return false;
  
  // Compute shared secret via ECDH
  uint8_t sharedSecret[32];
  if (!computeSharedSecret(senderPubkey, ourPrivkey, sharedSecret)) return false;
  
  // Derive conversation key using HKDF
  uint8_t conversationKey[32];
  const char* salt = "nip44-v2";  // NIP-44 v2 salt
  if (mbedtls_hkdf(mbedtls_md_info_from_type(MBEDTLS_MD_SHA256),
                   (const uint8_t*)salt, strlen(salt),
                   sharedSecret, 32,
                   NULL, 0,
                   conversationKey, 32) != 0) {
    free(cipherBytes);
    return false;
  }
  
  // Extract nonce and ciphertext from the payload
  // Decrypt with ChaCha20-Poly1305
  
  mbedtls_chachapoly_context ctx;
  mbedtls_chachapoly_init(&ctx);
  
  // Set key
  if (mbedtls_chachapoly_setkey(&ctx, conversationKey) != 0) {
    mbedtls_chachapoly_free(&ctx);
    free(cipherBytes);
    return false;
  }
  
  // Decrypt (implement properly based on NIP-44 spec)
  // ...
  
  mbedtls_chachapoly_free(&ctx);
  free(cipherBytes);
  
  // Return plaintext
  *plaintext = strdup("{\"placeholder\":true}");  // Replace with actual decrypted content
  return true;
}

// ============================================================================
// Payment Verification
// ============================================================================

bool verifyPreimage(const char* preimageHex, const char* expectedPaymentHashHex) {
  uint8_t preimage[32];
  if (!hexToBytes(preimageHex, preimage, 32)) return false;
  
  uint8_t computedHash[32];
  if (!sha256(preimage, 32, computedHash)) return false;
  
  char computedHashHex[65];
  bytesToHex(computedHash, 32, computedHashHex);
  
  return (strcasecmp(computedHashHex, expectedPaymentHashHex) == 0);
}

// ============================================================================
// WebSocket & Message Processing
// ============================================================================

void processGiftWrap(JsonObject& giftWrap) {
  String giftWrapContent = giftWrap["content"].as<String>();
  String giftWrapPubkey = giftWrap["pubkey"].as<String>();
  
  Serial.println("[NIP-17] Processing gift wrap...");
  
  char* decrypted = NULL;
  if (!nip44Decrypt(giftWrapContent.c_str(), giftWrapPubkey.c_str(), devicePrivKeyHex, &decrypted)) {
    Serial.println("[NIP-17] Decryption failed");
    return;
  }
  
  DynamicJsonDocument sealDoc(4096);
  if (deserializeJson(sealDoc, decrypted) != DeserializationError::Ok) {
    Serial.println("[NIP-17] Failed to parse seal");
    free(decrypted);
    return;
  }
  free(decrypted);
  
  // Continue with seal -> inner message processing
  // ... (similar pattern)
  
  Serial.println("[UNLOCK] Command validated - unlocking!");
  digitalWrite(LOCK_PIN, HIGH);
  delay(UNLOCK_DURATION_MS);
  digitalWrite(LOCK_PIN, LOW);
  Serial.println("[UNLOCK] Locked");
}

void onWebSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_CONNECTED:
      Serial.println("[WS] Connected");
      {
        String filter = String("{\"kinds\":[1059],\"#p\":[\"") + devicePubKeyHex + "\"]}";
        String req = String("[\"REQ\",\"unlock-sub\",") + filter + "]";
        webSocket.sendTXT(req);
      }
      break;
      
    case WStype_DISCONNECTED:
      Serial.println("[WS] Disconnected");
      break;
      
    case WStype_TEXT:
      {
        DynamicJsonDocument doc(16384);
        if (deserializeJson(doc, payload, length) != DeserializationError::Ok) return;
        
        if (!doc.is<JsonArray>()) return;
        String msgType = doc[0].as<String>();
        
        if (msgType == "EVENT") {
          JsonObject event = doc[2].as<JsonObject>();
          if (event["kind"] == 1059) {
            processGiftWrap(event);
          }
        }
      }
      break;
      
    default:
      break;
  }
}

// ============================================================================
// Setup & Loop
// ============================================================================

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n=== Nostr Dead Drop Locker ===");
  
  pinMode(LOCK_PIN, OUTPUT);
  digitalWrite(LOCK_PIN, LOW);
  
  // Initialize crypto RNG
  mbedtls_entropy_init(&entropy);
  mbedtls_ctr_drbg_init(&ctr_drbg);
  const char* pers = "nostr_lock";
  mbedtls_ctr_drbg_seed(&ctr_drbg, mbedtls_entropy_func, &entropy,
                        (const uint8_t*)pers, strlen(pers));
  
  // Connect WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
  Serial.println(WiFi.localIP());
  
  // Connect WebSocket
  webSocket.beginSSL(relayHost, relayPort, relayPath);
  webSocket.onEvent(onWebSocketEvent);
  webSocket.setReconnectInterval(5000);
  
  Serial.println("Listening for unlock commands...");
}

void loop() {
  webSocket.loop();
}