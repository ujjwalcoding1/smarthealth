/*
  SmartHealth ESP32 IoT Patient Monitor - WiFi & Cloud Edition
  Features:
  - MAX30102: Heart rate & pulse reading
  - DS18B20: Body temperature
  - MPU6050: 3-Axis Accelerometer & Fall / Impact Detection (>= 2.5g)
  - NEO-6M GPS: Satellite location & Coordinates
  - Buzzer: Local emergency acoustic indicator
  - WiFi & HTTP Client: Transmits JSON telemetry to Render Backend / Local Server
  - Instant Emergency SOS HTTP POST on Fall Detection
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <MAX30105.h>
#include "heartRate.h"
#include <OneWire.h>
#include <DallasTemperature.h>
#include <TinyGPS++.h>
#include <HardwareSerial.h>
#include <math.h>

// =====================================================
// WIFI & BACKEND CONFIGURATION
// =====================================================
const char* WIFI_SSID = "Ujjwal Mehta";
const char* WIFI_PASSWORD = "Ujjwal@1856";

// Render deployment URL or local IP: e.g. "https://smarthealth-backend.onrender.com" or "http://192.168.1.100:8000"
const char* SERVER_URL = "http:// 10.25.212.245:8000";

// =====================================================
// PIN CONFIGURATION
// =====================================================
// MAX30102 - I2C BUS 0
#define MAX_SDA_PIN 26
#define MAX_SCL_PIN 13

// MPU6050 - I2C BUS 1
#define MPU_SDA_PIN 21
#define MPU_SCL_PIN 22
#define MPU_ADDRESS 0x68

// DS18B20
#define TEMP_DATA_PIN 4

// NEO-6M GPS
#define GPS_RX_PIN 18
#define GPS_TX_PIN 19
#define GPS_BAUD_RATE 9600

// Buzzer
#define BUZZER_PIN 25
#define BUZZER_ENABLED true

// Impact threshold for fall detection
#define IMPACT_THRESHOLD_G 2.5f

// =====================================================
// OBJECTS
// =====================================================
TwoWire MAXWire = TwoWire(0);
TwoWire MPUWire = TwoWire(1);

MAX30105 particleSensor;
OneWire oneWire(TEMP_DATA_PIN);
DallasTemperature tempSensor(&oneWire);

HardwareSerial gpsSerial(2);
TinyGPSPlus gps;

// =====================================================
// STATUS AND VARIABLES
// =====================================================
bool maxReady = false;
bool mpuReady = false;
bool tempReady = false;

float temperatureC = 36.8f;
float bpm = 0.0f;
float accelerationG = 0.0f;
float axG = 0.0f, ayG = 0.0f, azG = 1.0f;

uint32_t irValue = 0;
uint32_t redValue = 0;

unsigned long lastPrintTime = 0;
unsigned long lastSendTime = 0;
unsigned long lastTempRequest = 0;
unsigned long lastBeatTime = 0;
unsigned long lastBuzzerTime = 0;

bool tempConversionPending = false;
bool buzzerState = false;
bool impactDetected = false;

const unsigned long PRINT_INTERVAL_MS = 2000;
const unsigned long SEND_INTERVAL_MS = 2000;
const unsigned long TEMP_INTERVAL_MS = 2000;
const unsigned long TEMP_CONVERSION_MS = 800;
const unsigned long BUZZER_ALERT_MS = 2000;

// =====================================================
// MPU6050 FUNCTIONS
// =====================================================
bool mpuWriteRegister(uint8_t reg, uint8_t value) {
  MPUWire.beginTransmission(MPU_ADDRESS);
  MPUWire.write(reg);
  MPUWire.write(value);
  return MPUWire.endTransmission() == 0;
}

bool mpuReadRegisters(uint8_t reg, uint8_t *data, uint8_t length) {
  MPUWire.beginTransmission(MPU_ADDRESS);
  MPUWire.write(reg);
  if (MPUWire.endTransmission(false) != 0) return false;

  size_t received = MPUWire.requestFrom((uint8_t)MPU_ADDRESS, length, (bool)true);
  if (received != length) {
    while (MPUWire.available()) MPUWire.read();
    return false;
  }
  for (uint8_t i = 0; i < length; i++) data[i] = MPUWire.read();
  return true;
}

int16_t makeSignedValue(uint8_t highByte, uint8_t lowByte) {
  return (int16_t)(((uint16_t)highByte << 8) | lowByte);
}

bool initializeMPU() {
  uint8_t whoAmI = 0;
  if (!mpuReadRegisters(0x75, &whoAmI, 1)) return false;
  if (whoAmI != 0x68 && whoAmI != 0x69) return false;

  mpuWriteRegister(0x6B, 0x80); delay(100);
  mpuWriteRegister(0x6B, 0x00); delay(100);
  mpuWriteRegister(0x1A, 0x03);
  mpuWriteRegister(0x19, 0x07);
  mpuWriteRegister(0x1C, 0x00);
  mpuWriteRegister(0x1B, 0x00);
  mpuWriteRegister(0x6C, 0x00);
  delay(50);
  return true;
}

bool readMPU(float &ax, float &ay, float &az) {
  uint8_t data[6];
  if (!mpuReadRegisters(0x3B, data, 6)) return false;
  ax = makeSignedValue(data[0], data[1]) / 16384.0f;
  ay = makeSignedValue(data[2], data[3]) / 16384.0f;
  az = makeSignedValue(data[4], data[5]) / 16384.0f;
  return true;
}

// =====================================================
// TRANSMIT TO CLOUD BACKEND
// =====================================================
void sendTelemetryToCloud() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected. Skipping cloud push.");
    return;
  }

  HTTPClient http;
  String url = String(SERVER_URL) + "/api/iot/telemetry";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  // Calculate SpO2 approximation from red/IR ratio
  float spo2Estimate = 98.0f;
  if (irValue > 50000 && redValue > 0) {
    float ratio = (float)redValue / (float)irValue;
    spo2Estimate = 110.0f - 25.0f * ratio;
    if (spo2Estimate > 100.0f) spo2Estimate = 100.0f;
    if (spo2Estimate < 85.0f) spo2Estimate = 85.0f;
  }

  float lat = gps.location.isValid() ? gps.location.lat() : 28.6139f;
  float lng = gps.location.isValid() ? gps.location.lng() : 77.2090f;
  int sats = gps.satellites.isValid() ? gps.satellites.value() : 0;

  String jsonPayload = "{";
  jsonPayload += "\"device_id\":\"ESP32-HARDWARE\",";
  jsonPayload += "\"heart_rate\":" + String(bpm > 0 ? bpm : 72.0f, 1) + ",";
  jsonPayload += "\"spo2\":" + String(spo2Estimate, 1) + ",";
  jsonPayload += "\"ir_value\":" + String(irValue) + ",";
  jsonPayload += "\"red_value\":" + String(redValue) + ",";
  jsonPayload += "\"temperature_c\":" + String(!isnan(temperatureC) ? temperatureC : 36.8f, 2) + ",";
  jsonPayload += "\"ax\":" + String(axG, 3) + ",";
  jsonPayload += "\"ay\":" + String(ayG, 3) + ",";
  jsonPayload += "\"az\":" + String(azG, 3) + ",";
  jsonPayload += "\"acceleration_g\":" + String(accelerationG, 2) + ",";
  jsonPayload += "\"impact_detected\":" + String(impactDetected ? "true" : "false") + ",";
  jsonPayload += "\"latitude\":" + String(lat, 6) + ",";
  jsonPayload += "\"longitude\":" + String(lng, 6) + ",";
  jsonPayload += "\"satellites\":" + String(sats) + ",";
  jsonPayload += "\"gps_valid\":" + String(gps.location.isValid() ? "true" : "false");
  jsonPayload += "}";

  int httpCode = http.POST(jsonPayload);
  if (httpCode > 0) {
    Serial.print("HTTP Cloud Response: ");
    Serial.println(httpCode);
  } else {
    Serial.print("HTTP Error: ");
    Serial.println(http.errorToString(httpCode));
  }
  http.end();
}

void triggerEmergencyCloudSOS() {
  if (WiFi.status() != WL_CONNECTED) return;
  HTTPClient http;
  String url = String(SERVER_URL) + "/api/sos/trigger";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  float lat = gps.location.isValid() ? gps.location.lat() : 28.6139f;
  float lng = gps.location.isValid() ? gps.location.lng() : 77.2090f;

  String jsonPayload = "{";
  jsonPayload += "\"device_id\":\"ESP32-HARDWARE\",";
  jsonPayload += "\"patient_name\":\"Rajesh Sharma\",";
  jsonPayload += "\"trigger_type\":\"FALL_DETECTION\",";
  jsonPayload += "\"heart_rate\":" + String(bpm, 1) + ",";
  jsonPayload += "\"spo2\":97.0,";
  jsonPayload += "\"temperature_c\":" + String(temperatureC, 1) + ",";
  jsonPayload += "\"acceleration_g\":" + String(accelerationG, 2) + ",";
  jsonPayload += "\"latitude\":" + String(lat, 6) + ",";
  jsonPayload += "\"longitude\":" + String(lng, 6) + ",";
  jsonPayload += "\"status\":\"TRIGGERED\",";
  jsonPayload += "\"dial_number\":\"112\"";
  jsonPayload += "}";

  http.POST(jsonPayload);
  http.end();
}

// =====================================================
// SETUP
// =====================================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  Serial.println("\n=================================");
  Serial.println(" SMART HEALTH MONITOR (WIFI/CLOUD)");
  Serial.println("=================================");

  // Connect to WiFi
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int retry = 0;
  while (WiFi.status() != WL_CONNECTED && retry < 20) {
    delay(500);
    Serial.print(".");
    retry++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected! IP: " + WiFi.localIP().toString());
  } else {
    Serial.println("\n⚠️ WiFi not connected. Operating in Serial-only mode.");
  }

  // MAX30102
  MAXWire.begin(MAX_SDA_PIN, MAX_SCL_PIN, 100000);
  if (particleSensor.begin(MAXWire, I2C_SPEED_STANDARD)) {
    maxReady = true;
    particleSensor.setup();
    particleSensor.setPulseAmplitudeRed(0x1F);
    particleSensor.setPulseAmplitudeIR(0x1F);
    Serial.println("MAX30102: CONNECTED");
  } else {
    Serial.println("MAX30102: NOT DETECTED");
  }

  // MPU6050
  MPUWire.begin(MPU_SDA_PIN, MPU_SCL_PIN, 100000);
  mpuReady = initializeMPU();
  Serial.println(mpuReady ? "MPU6050: CONNECTED" : "MPU6050: NOT DETECTED");

  // DS18B20
  tempSensor.begin();
  if (tempSensor.getDeviceCount() > 0) {
    tempReady = true;
    tempSensor.setWaitForConversion(false);
    tempSensor.requestTemperatures();
    tempConversionPending = true;
    lastTempRequest = millis();
    Serial.println("DS18B20: CONNECTED");
  } else {
    Serial.println("DS18B20: NOT DETECTED");
  }

  // GPS
  gpsSerial.begin(GPS_BAUD_RATE, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
  Serial.println("GPS: UART STARTED");
}

// =====================================================
// LOOP
// =====================================================
void loop() {
  unsigned long now = millis();

  // Read GPS
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  // Read Heart Rate
  if (maxReady) {
    irValue = particleSensor.getIR();
    redValue = particleSensor.getRed();
    if (irValue > 50000 && checkForBeat(irValue)) {
      if (lastBeatTime != 0) {
        unsigned long beatInterval = now - lastBeatTime;
        if (beatInterval > 0) {
          float newBpm = 60000.0f / beatInterval;
          if (newBpm >= 30.0f && newBpm <= 220.0f) {
            bpm = (bpm == 0.0f) ? newBpm : (0.7f * bpm + 0.3f * newBpm);
          }
        }
      }
      lastBeatTime = now;
    }
    if (irValue < 50000) {
      bpm = 0.0f;
      lastBeatTime = 0;
    }
  }

  // Read Temperature
  if (tempReady) {
    if (tempConversionPending && now - lastTempRequest >= TEMP_CONVERSION_MS) {
      float t = tempSensor.getTempCByIndex(0);
      if (t != DEVICE_DISCONNECTED_C && t >= -55.0f && t <= 125.0f) {
        temperatureC = t;
      }
      tempConversionPending = false;
    }
    if (!tempConversionPending && now - lastTempRequest >= TEMP_INTERVAL_MS) {
      tempSensor.requestTemperatures();
      lastTempRequest = now;
      tempConversionPending = true;
    }
  }

  // Read Acceleration & Fall
  impactDetected = false;
  if (mpuReady) {
    if (readMPU(axG, ayG, azG)) {
      accelerationG = sqrtf(axG * axG + ayG * ayG + azG * azG);
      if (accelerationG >= IMPACT_THRESHOLD_G) {
        impactDetected = true;
        triggerEmergencyCloudSOS();
      }
    }
  }

  // Buzzer on Impact
  if (BUZZER_ENABLED && impactDetected) {
    digitalWrite(BUZZER_PIN, HIGH);
    buzzerState = true;
    lastBuzzerTime = now;
  } else if (buzzerState && now - lastBuzzerTime >= BUZZER_ALERT_MS) {
    digitalWrite(BUZZER_PIN, LOW);
    buzzerState = false;
  }

  // Periodic Telemetry Cloud Dispatch
  if (now - lastSendTime >= SEND_INTERVAL_MS) {
    lastSendTime = now;
    sendTelemetryToCloud();
  }
}
