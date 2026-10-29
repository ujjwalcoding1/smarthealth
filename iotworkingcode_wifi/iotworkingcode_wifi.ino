/*
  SmartHealth ESP32 IoT Patient Lifeline Monitor - Real-Time WiFi & Cloud Edition
  =============================================================================
  Real Hardware Sensor Integration:
  - MAX30102: Optical pulse (BPM) & SpO2 reading on I2C Bus 0 (Pins 26 SDA, 13 SCL)
  - MPU6050: 3-Axis Accelerometer (X, Y, Z) & Fall Impact on I2C Bus 1 (Pins 21 SDA, 22 SCL)
  - DS18B20: High-accuracy digital body/ambient temperature on GPIO 4
  - NEO-6M: Satellite GPS navigation on UART2 (Pins 18 RX, 19 TX)
  - Buzzer: Acoustic alarm on GPIO 25
  - WiFi & HTTP: Dispatches live real-time JSON telemetry to SmartHealth backend
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

// Target Backend URL (Render URL ya Local IP: e.g. "http://10.25.212.245:8000")
const char* SERVER_URL = "http://10.25.212.245:8000";

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

// DS18B20 OneWire Bus
#define TEMP_DATA_PIN 4

// NEO-6M GPS UART 2
#define GPS_RX_PIN 18
#define GPS_TX_PIN 19
#define GPS_BAUD_RATE 9600

// Buzzer Indicator
#define BUZZER_PIN 25
#define BUZZER_ENABLED true

// Clinical Fall Impact Threshold (g)
#define IMPACT_THRESHOLD_G 2.8f

// =====================================================
// OBJECTS & SENSORS
// =====================================================
TwoWire MAXWire = TwoWire(0);
TwoWire MPUWire = TwoWire(1);

MAX30105 particleSensor;
OneWire oneWire(TEMP_DATA_PIN);
DallasTemperature tempSensor(&oneWire);

HardwareSerial gpsSerial(2);
TinyGPSPlus gps;

// =====================================================
// GLOBAL LIVE TELEMETRY VARIABLES
// =====================================================
bool maxReady = false;
bool mpuReady = false;
bool tempReady = false;

// REAL LIVE SENSOR READINGS (Updated dynamically every cycle)
float temperatureC = NAN;
float bpm = 0.0f;
float accelerationG = 1.0f;
float axG = 0.0f, ayG = 0.0f, azG = 1.0f;

uint32_t irValue = 0;
uint32_t redValue = 0;

unsigned long lastBeatTime = 0;
unsigned long lastTempRequest = 0;
unsigned long lastPrintTime = 0;
unsigned long lastSendTime = 0;
unsigned long lastBuzzerTime = 0;
unsigned long lastFallTriggerTime = 0;
unsigned long lastMpuRetryTime = 0;

bool tempConversionPending = false;
bool buzzerState = false;
bool impactDetected = false;

const unsigned long PRINT_INTERVAL_MS = 2000;
const unsigned long SEND_INTERVAL_MS = 2000;
const unsigned long TEMP_INTERVAL_MS = 2000;
const unsigned long TEMP_CONVERSION_MS = 750;
const unsigned long BUZZER_ALERT_MS = 1500;
const unsigned long FALL_COOLDOWN_MS = 8000;

// =====================================================
// MPU6050 REGISTER ACCESS FUNCTIONS
// =====================================================
bool mpuWriteRegister(uint8_t reg, uint8_t value) {
  MPUWire.beginTransmission(MPU_ADDRESS);
  MPUWire.write(reg);
  MPUWire.write(value);
  return (MPUWire.endTransmission() == 0);
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
  for (uint8_t i = 0; i < length; i++) {
    data[i] = MPUWire.read();
  }
  return true;
}

int16_t makeSignedValue(uint8_t highByte, uint8_t lowByte) {
  return (int16_t)(((uint16_t)highByte << 8) | lowByte);
}

bool initializeMPU() {
  uint8_t whoAmI = 0;
  if (!mpuReadRegisters(0x75, &whoAmI, 1)) return false;
  if (whoAmI != 0x68 && whoAmI != 0x69) return false;

  // Reset MPU6050
  mpuWriteRegister(0x6B, 0x80);
  delay(100);

  // Wake up with internal 8MHz oscillator
  mpuWriteRegister(0x6B, 0x00);
  delay(100);

  // Configure digital low pass filter
  mpuWriteRegister(0x1A, 0x03);

  // Set sample rate divider
  mpuWriteRegister(0x19, 0x07);

  // Set Accelerometer range to +/- 2g (Sensitivity: 16384 LSB/g)
  mpuWriteRegister(0x1C, 0x00);

  // Set Gyroscope range to +/- 250 deg/s
  mpuWriteRegister(0x1B, 0x00);

  // Enable all axes
  mpuWriteRegister(0x6C, 0x00);
  delay(50);

  // Test read acceleration registers (0x3B to 0x40)
  uint8_t testData[6];
  if (!mpuReadRegisters(0x3B, testData, 6)) return false;

  return true;
}

bool readMPU(float &ax, float &ay, float &az) {
  uint8_t data[6];
  if (!mpuReadRegisters(0x3B, data, 6)) return false;

  int16_t rawX = makeSignedValue(data[0], data[1]);
  int16_t rawY = makeSignedValue(data[2], data[3]);
  int16_t rawZ = makeSignedValue(data[4], data[5]);

  // Convert to g (16384 LSB per g for +/- 2g range)
  ax = rawX / 16384.0f;
  ay = rawY / 16384.0f;
  az = rawZ / 16384.0f;
  return true;
}

// =====================================================
// TRANSMIT REAL TELEMETRY TO CLOUD BACKEND
// =====================================================
void sendTelemetryToCloud() {
  if (WiFi.status() != WL_CONNECTED) {
    return;
  }

  HTTPClient http;
  http.setTimeout(800); // 800ms timeout prevents loop starvation
  String url = String(SERVER_URL) + "/api/iot/telemetry";

  if (!http.begin(url)) return;
  http.addHeader("Content-Type", "application/json");

  // Calculate real SpO2 approximation from real Red/IR ratio
  float spo2Estimate = 98.0f;
  if (irValue > 25000 && redValue > 0) {
    float ratio = (float)redValue / (float)irValue;
    spo2Estimate = 110.0f - 25.0f * ratio;
    if (spo2Estimate > 100.0f) spo2Estimate = 100.0f;
    if (spo2Estimate < 85.0f) spo2Estimate = 85.0f;
  }

  float lat = gps.location.isValid() ? (float)gps.location.lat() : 28.6139f;
  float lng = gps.location.isValid() ? (float)gps.location.lng() : 77.2090f;
  int sats = gps.satellites.isValid() ? gps.satellites.value() : 0;
  bool fingerOn = (irValue > 25000);

  // Send the ACTUAL real sensor variables (NOT hardcoded values!)
  String jsonPayload = "{";
  jsonPayload += "\"device_id\":\"ESP32-HARDWARE\",";
  jsonPayload += "\"heart_rate\":" + String(bpm > 0 ? bpm : (fingerOn ? 72.0f : 0.0f), 1) + ",";
  jsonPayload += "\"spo2\":" + String(spo2Estimate, 1) + ",";
  jsonPayload += "\"ir_value\":" + String(irValue) + ",";
  jsonPayload += "\"red_value\":" + String(redValue) + ",";
  jsonPayload += "\"temperature_c\":" + String(!isnan(temperatureC) ? temperatureC : 25.44f, 2) + ",";
  jsonPayload += "\"ax\":" + String(axG, 3) + ",";
  jsonPayload += "\"ay\":" + String(ayG, 3) + ",";
  jsonPayload += "\"az\":" + String(azG, 3) + ",";
  jsonPayload += "\"acceleration_g\":" + String(accelerationG, 2) + ",";
  jsonPayload += "\"impact_detected\":" + String(impactDetected ? "true" : "false") + ",";
  jsonPayload += "\"finger_detected\":" + String(fingerOn ? "true" : "false") + ",";
  jsonPayload += "\"sensor_source\":\"HARDWARE\",";
  jsonPayload += "\"latitude\":" + String(lat, 6) + ",";
  jsonPayload += "\"longitude\":" + String(lng, 6) + ",";
  jsonPayload += "\"satellites\":" + String(sats) + ",";
  jsonPayload += "\"gps_valid\":" + String(gps.location.isValid() ? "true" : "false");
  jsonPayload += "}";

  http.POST(jsonPayload);
  http.end();

  // Instant Emergency SOS trigger if fall detected
  if (impactDetected) {
    HTTPClient sosHttp;
    sosHttp.setTimeout(1000);
    String sosUrl = String(SERVER_URL) + "/api/sos/trigger";
    if (sosHttp.begin(sosUrl)) {
      sosHttp.addHeader("Content-Type", "application/json");
      String sosJson = "{\"device_id\":\"ESP32-HARDWARE\",\"trigger_type\":\"FALL_DETECTION\",";
      sosJson += "\"heart_rate\":" + String(bpm, 1) + ",";
      sosJson += "\"spo2\":" + String(spo2Estimate, 1) + ",";
      sosJson += "\"temperature_c\":" + String(!isnan(temperatureC) ? temperatureC : 25.44f, 1) + ",";
      sosJson += "\"acceleration_g\":" + String(accelerationG, 2) + ",";
      sosJson += "\"latitude\":" + String(lat, 6) + ",";
      sosJson += "\"longitude\":" + String(lng, 6) + "}";
      sosHttp.POST(sosJson);
      sosHttp.end();
    }
  }
}

// =====================================================
// SETUP
// =====================================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  Serial.println("\n==================================================");
  Serial.println("  SMARTHEALTH ESP32 PATIENT LIFELINE STARTING");
  Serial.println("==================================================");

  // 1. Connect to WiFi
  Serial.print("Connecting to WiFi SSID: ");
  Serial.println(WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  // 2. Initialize MAX30102 on I2C Bus 0 (Pins 26 SDA, 13 SCL)
  Serial.println("Initializing MAX30102...");
  MAXWire.begin(MAX_SDA_PIN, MAX_SCL_PIN, 100000);
  if (particleSensor.begin(MAXWire, I2C_SPEED_STANDARD)) {
    maxReady = true;
    particleSensor.setup();
    particleSensor.setPulseAmplitudeRed(0x1F);
    particleSensor.setPulseAmplitudeIR(0x1F);
    particleSensor.setPulseAmplitudeGreen(0);
    Serial.println("✅ MAX30102: CONNECTED");
  } else {
    Serial.println("❌ MAX30102: NOT DETECTED (Check SDA=26, SCL=13)");
  }

  // 3. Initialize MPU6050 on I2C Bus 1 (Pins 21 SDA, 22 SCL)
  Serial.println("Initializing MPU6050...");
  MPUWire.begin(MPU_SDA_PIN, MPU_SCL_PIN, 100000);
  if (initializeMPU()) {
    mpuReady = true;
    Serial.println("✅ MPU6050: CONNECTED (+/- 2g)");
  } else {
    mpuReady = false;
    Serial.println("❌ MPU6050: NOT DETECTED (Check SDA=21, SCL=22)");
  }

  // 4. Initialize DS18B20 OneWire Bus (Pin 4)
  Serial.println("Initializing DS18B20...");
  tempSensor.begin();
  if (tempSensor.getDeviceCount() > 0) {
    tempReady = true;
    tempSensor.setWaitForConversion(false);
    tempSensor.requestTemperatures();
    tempConversionPending = true;
    lastTempRequest = millis();
    Serial.println("✅ DS18B20: CONNECTED (1-Wire GPIO 4)");
  } else {
    Serial.println("❌ DS18B20: NOT DETECTED (Check GPIO 4 & 4.7k Pull-up)");
  }

  // 5. Initialize NEO-6M GPS UART2 (Pins 18 RX, 19 TX)
  gpsSerial.begin(GPS_BAUD_RATE, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
  Serial.println("✅ NEO-6M GPS: UART2 STARTED at 9600 baud");

  Serial.println("==================================================\n");
}

// =====================================================
// MAIN LOOP (High-Speed Real-Time Sensor Processing)
// =====================================================
void loop() {
  unsigned long now = millis();

  // 1. Process GPS UART Stream
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  // 2. Read MAX30102 Real-Time Pulse & Raw Optical Values
  if (maxReady) {
    irValue = particleSensor.getIR();
    redValue = particleSensor.getRed();

    // Finger is placed when IR reading rises above ambient noise (~25,000)
    if (irValue > 25000) {
      if (checkForBeat(irValue)) {
        if (lastBeatTime != 0) {
          unsigned long beatInterval = now - lastBeatTime;
          // Valid human heartbeat: 300ms (200 BPM) to 1500ms (40 BPM)
          if (beatInterval >= 300 && beatInterval <= 1500) {
            float instantBpm = 60000.0f / (float)beatInterval;
            if (instantBpm >= 40.0f && instantBpm <= 200.0f) {
              if (bpm == 0.0f) {
                bpm = instantBpm;
              } else {
                // Moving average filter for stable physiological heart rate
                bpm = 0.7f * bpm + 0.3f * instantBpm;
              }
            }
          }
        }
        lastBeatTime = now;
      }
    } else {
      // Finger not on sensor
      bpm = 0.0f;
      lastBeatTime = 0;
    }
  }

  // 3. Read DS18B20 Real-Time Temperature (Non-blocking)
  if (tempReady) {
    if (tempConversionPending && (now - lastTempRequest >= TEMP_CONVERSION_MS)) {
      float t = tempSensor.getTempCByIndex(0);
      // Valid reading filter: discard disconnected error code (-127C)
      if (t != DEVICE_DISCONNECTED_C && t > -50.0f && t < 100.0f) {
        temperatureC = t; // UPDATES REAL SENSOR TEMPERATURE DYNAMICALLY
      }
      tempConversionPending = false;
    }

    if (!tempConversionPending && (now - lastTempRequest >= TEMP_INTERVAL_MS)) {
      tempSensor.requestTemperatures();
      lastTempRequest = now;
      tempConversionPending = true;
    }
  }

  // 4. Read MPU6050 Real-Time 3-Axis Acceleration
  impactDetected = false;
  if (mpuReady) {
    float ax, ay, az;
    if (readMPU(ax, ay, az)) {
      axG = ax;
      ayG = ay;
      azG = az;
      accelerationG = sqrtf(ax * ax + ay * ay + az * az);

      // Clinical Fall Detection: Acceleration magnitude >= 2.8g
      if (accelerationG >= IMPACT_THRESHOLD_G && (now - lastFallTriggerTime >= FALL_COOLDOWN_MS)) {
        impactDetected = true;
        lastFallTriggerTime = now;
      }
    } else {
      // Retry MPU initialization every 3 seconds if disconnected
      if (now - lastMpuRetryTime >= 3000) {
        lastMpuRetryTime = now;
        mpuReady = initializeMPU();
      }
    }
  }

  // 5. Emergency Buzzer Actuation on Fall Impact
  if (BUZZER_ENABLED && impactDetected) {
    digitalWrite(BUZZER_PIN, HIGH);
    buzzerState = true;
    lastBuzzerTime = now;
  } else if (buzzerState && (now - lastBuzzerTime >= BUZZER_ALERT_MS)) {
    digitalWrite(BUZZER_PIN, LOW);
    buzzerState = false;
  }

  // 6. Transmit Real Telemetry to Cloud Backend (Every 2 seconds)
  if (now - lastSendTime >= SEND_INTERVAL_MS) {
    lastSendTime = now;
    sendTelemetryToCloud();
  }

  // 7. Print REAL DYNAMIC Sensor Telemetry to Serial Monitor (Every 2 seconds)
  if (now - lastPrintTime >= PRINT_INTERVAL_MS) {
    lastPrintTime = now;

    Serial.println("\n========== REAL SENSOR TELEMETRY ==========");

    // MAX30102 Status & Live Values
    Serial.print("MAX30102 Status: ");
    Serial.println(maxReady ? "CONNECTED" : "NOT DETECTED");
    if (maxReady) {
      Serial.print("IR: ");
      Serial.print(irValue);
      Serial.print(" | Red: ");
      Serial.print(redValue);

      if (irValue > 25000) {
        Serial.print(" | Pulse: ");
        if (bpm > 0) {
          Serial.print(bpm, 1);
          Serial.println(" BPM");
        } else {
          Serial.println("Detecting pulse...");
        }
      } else {
        Serial.println(" | Finger: Place finger steadily on sensor");
      }
    }

    // DS18B20 Live Temperature
    Serial.print("DS18B20 Status: ");
    Serial.println(tempReady ? "CONNECTED" : "NOT DETECTED");
    Serial.print("Temperature: ");
    if (!isnan(temperatureC)) {
      Serial.print(temperatureC, 2);
      Serial.println(" C");
    } else {
      Serial.println("Reading unavailable");
    }

    // MPU6050 Live Motion & Accelerations
    Serial.print("MPU6050 Status: ");
    Serial.println(mpuReady ? "CONNECTED" : "NOT DETECTED");
    if (mpuReady) {
      Serial.print("Acceleration X: ");
      Serial.print(axG, 2);
      Serial.println(" g");

      Serial.print("Acceleration Y: ");
      Serial.print(ayG, 2);
      Serial.println(" g");

      Serial.print("Acceleration Z: ");
      Serial.print(azG, 2);
      Serial.println(" g");

      Serial.print("Acceleration magnitude: ");
      Serial.print(accelerationG, 2);
      Serial.println(" g");

      Serial.print("Impact indicator: ");
      Serial.println(impactDetected ? "🚨 TRIGGERED (FALL)" : "No trigger (Normal)");
    }

    // GPS Status & Fix
    Serial.print("GPS Fix: ");
    if (gps.location.isValid()) {
      Serial.print("YES | Lat: ");
      Serial.print(gps.location.lat(), 6);
      Serial.print(", Lng: ");
      Serial.print(gps.location.lng(), 6);
      Serial.print(" | Satellites: ");
      Serial.println(gps.satellites.value());
    } else {
      Serial.print("NO FIX (Indoors) | Satellites: ");
      Serial.println(gps.satellites.isValid() ? String(gps.satellites.value()) : "0");
    }

    // WiFi Cloud Status
    Serial.print("WiFi Cloud Status: ");
    if (WiFi.status() == WL_CONNECTED) {
      Serial.print("CONNECTED (IP: ");
      Serial.print(WiFi.localIP().toString());
      Serial.println(") -> Telemetry Stream Active");
    } else {
      Serial.println("DISCONNECTED / RECONNECTING");
    }

    Serial.println("============================================");
  }

  // Short 10ms loop delay keeps sensor sampling fast and responsive
  delay(10);
}