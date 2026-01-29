// Hardware template for ESP32 to listen for unlock commands and control a GPIO for a solenoid lock.
// This sketch uses WebSockets to connect to a Nostr relay's WebSocket endpoint and listens for
// encrypted DM events that contain an unlock command. It assumes the hardware has a stored
// private key for the lock's Nostr identity (unsafe to store long-term in plaintext on real devices).

#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

// Replace with your WiFi
const char* ssid = "YOUR_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Relay websocket (wss) - you may need to use plain ws if the board doesn't support TLS
const char* relayHost = "relay.ditto.pub";
const uint16_t relayPort = 443;
const char* relayPath = "/"; // will be upgraded to wss://relay.ditto.pub/

WebSocketsClient webSocket;

const int LOCK_PIN = 23; // GPIO pin connected to relay/transistor controlling solenoid

// Example private key (hex) - DO NOT use this in production. Store securely.
const char* devicePrivKeyHex = "<32_byte_hex_private_key_here>";
const char* devicePubKeyHex = "<corresponding_pubkey_hex>";

void onWebSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_CONNECTED:
      Serial.println("Connected to relay");
      // Subscribe to kind 4 (encrypted DM) events addressed to this pubkey
      {
        DynamicJsonDocument doc(512);
        // Use nostr filter: { "kinds": [4], "#p": [devicePubKeyHex] }
        String filter = "[{\"kinds\":[4],\"#p\":[\"" + String(devicePubKeyHex) + "\"] , \"limit\": 25}]";
        String req = String("[\"REQ\",\"sub1\",") + filter + "]";
        webSocket.sendTXT(req);
        Serial.println("Sent subscription request");
      }
      break;
    case WStype_DISCONNECTED:
      Serial.println("Disconnected from relay");
      break;
    case WStype_TEXT:
      Serial.printf("Received: %s\n", payload);
      // Expect messages like: ["EVENT","sub1",{...event...}]
      {
        DynamicJsonDocument json(8192);
        DeserializationError err = deserializeJson(json, payload);
        if (err) {
          Serial.println("Failed to parse incoming message");
          return;
        }

        if (!json.is<Array>()) return;
        String type = json[0].as<String>();
        if (type != "EVENT") return;

        JsonObject ev = json[2].as<JsonObject>();
        int kind = ev["kind"].as<int>();
        if (kind != 4 && kind != 14) return; // ignore other kinds

        String content = ev["content"].as<String>();
        // In a real implementation decrypt content using NIP-04/NIP-44 with the device private key.
        // For this template we assume content is plaintext JSON for simplicity.

        DynamicJsonDocument payloadDoc(1024);
        DeserializationError perr = deserializeJson(payloadDoc, content);
        if (perr) {
          Serial.println("Could not parse content JSON (encrypted in real world)");
          return;
        }

        const char* action = payloadDoc["action"];
        const char* locker_id = payloadDoc["locker_id"];
        const char* preimage = payloadDoc["payment_preimage"];

        Serial.println("Unlock command received for locker:");
        Serial.println(locker_id);

        // TODO: Verify payment preimage via NWC or another mechanism.
        // For the template, we'll accept any command.

        if (String(action) == "unlock") {
          digitalWrite(LOCK_PIN, HIGH);
          delay(5000);
          digitalWrite(LOCK_PIN, LOW);

          Serial.println("Unlocked solenoid for 5 seconds");

          // Optionally publish status back to a relay via REST or another websocket connection.
        }
      }
      break;
    default:
      break;
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(LOCK_PIN, OUTPUT);
  digitalWrite(LOCK_PIN, LOW);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print('.');
  }
  Serial.println("\nWiFi connected");

  // websocket init
  webSocket.beginSSL(relayHost, relayPort, relayPath);
  webSocket.onEvent(onWebSocketEvent);
  webSocket.setReconnectInterval(5000);
}

void loop() {
  webSocket.loop();
}
