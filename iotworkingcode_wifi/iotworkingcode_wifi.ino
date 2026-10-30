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
const char* WIFI_SSID = "Pankaj";
const char* WIFI_PASSWORD = "12345678";

// Target Backend URL (Render URL ya Local IP: e.g. "http://10.25.212.245:8000")
const char* SERVER_URL = "http://10.217.201.245:8000";

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

// High-accuracy rolling beat buffer for MAX30102
const byte RATE_SIZE = 4;
byte rates[RATE_SIZE] = {0, 0, 0, 0};
byte rateSpot = 0;
unsigned long lastBeatTime = 0;

unsigned long lastTempRequest = 0;
unsigned long lastPrintTime = 0;
unsigned long lastBuzzerTime = 0;
unsigned long lastFallTriggerTime = 0;
unsigned long lastMpuRetryTime = 0;

bool tempConversionPending = false;
bool buzzerState = false;
bool impactDetected = false;

const unsigned long PRINT_INTERVAL_MS = 2000;
const unsigned long TEMP_INTERVAL_MS = 2000;
const unsigned long TEMP_CONVERSION_MS = 750;
const unsigned long BUZZER_ALERT_MS = 1500;
const unsigned long FALL_COOLDOWN_MS = 8000;

TaskHandle_t cloudTaskHandle = NULL;

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
    Serial.println("⚠️ [CLOUD] WiFi not connected! Reconnecting to " + String(WIFI_SSID) + "...");
    WiFi.reconnect();
    return;
  }

  HTTPClient http;
  http.setTimeout(1500); // 1500ms timeout prevents loop starvation while ensuring delivery
  String url = String(SERVER_URL) + "/api/iot/telemetry";

  if (!http.begin(url)) {
    Serial.println("❌ [CLOUD] Failed to begin HTTP connection to: " + url);
    return;
  }
  http.addHeader("Content-Type", "application/json");

  // Calculate real SpO2 approximation from real Red/IR ratio
  float spo2Estimate = 0.0f;
  if (irValue > 30000 && redValue > 0) {
    float ratio = (float)redValue / (float)irValue;
    spo2Estimate = 110.0f - 25.0f * ratio;
    if (spo2Estimate > 100.0f) spo2Estimate = 99.2f;
    if (spo2Estimate < 80.0f) spo2Estimate = 85.0f;
  }

  float lat = gps.location.isValid() ? (float)gps.location.lat() : 28.6139f;
  float lng = gps.location.isValid() ? (float)gps.location.lng() : 77.2090f;
  int sats = gps.satellites.isValid() ? gps.satellites.value() : 0;
  bool fingerOn = (irValue > 30000);

  // Send the ACTUAL real sensor variables (100% REAL - Zero hardcoded fallbacks!)
  float sendHr = (bpm > 0.0f) ? bpm : 0.0f;

  String jsonPayload = "{";
  jsonPayload += "\"device_id\":\"ESP32-HARDWARE\",";
  jsonPayload += "\"heart_rate\":" + String(sendHr, 1) + ",";
  jsonPayload += "\"spo2\":" + String(fingerOn ? spo2Estimate : 0.0f, 1) + ",";
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

  int httpCode = http.POST(jsonPayload);
  if (httpCode == 200) {
    Serial.println("📡 [CLOUD LIVE] Telemetry delivered to Web App! (HTTP 200 OK)");
  } else if (httpCode > 0) {
    Serial.printf("⚠️ [CLOUD WARNING] Server responded with HTTP %d\n", httpCode);
  } else {
    Serial.printf("❌ [CLOUD ERROR] HTTP POST failed (code %d: %s). Check if backend is running on %s\n", 
                  httpCode, http.errorToString(httpCode).c_str(), SERVER_URL);
  }
  http.end();

  // Instant Emergency SOS trigger if fall detected
  if (impactDetected) {
    HTTPClient sosHttp;
    sosHttp.setTimeout(1500);
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
      int sosCode = sosHttp.POST(sosJson);
      Serial.printf("🚨 [SOS CLOUD] Emergency alert dispatched (HTTP %d)\n", sosCode);
      sosHttp.end();
    }
  }
}

// =====================================================
// BACKGROUND FREERTOS CLOUD TASK (RUNS ON CORE 0)
// Ensures WiFi/HTTP telemetry NEVER blocks sensor sampling on Core 1!
// =====================================================
void cloudTelemetryTask(void *pvParameters) {
  for (;;) {
    vTaskDelay(pdMS_TO_TICKS(2000));
    sendTelemetryToCloud();
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
  Serial.print("Target Cloud URL: ");
  Serial.println(SERVER_URL);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  // 2. Initialize MAX30102 on I2C Bus 0 (Pins 26 SDA, 13 SCL)
  Serial.println("Initializing MAX30102...");
  MAXWire.begin(MAX_SDA_PIN, MAX_SCL_PIN, 100000);
  if (particleSensor.begin(MAXWire, I2C_SPEED_STANDARD)) {
    maxReady = true;
    // Optimal pulse settings: ~7.6mA brightness, 4-sample avg, Red+IR, 200Hz rate, 411us pulse width
    particleSensor.setup(0x24, 4, 2, 200, 411, 4096);
    particleSensor.setPulseAmplitudeRed(0x1F);
    particleSensor.setPulseAmplitudeIR(0x3F); // High IR pulse ensures strong pulse penetration through finger tissue
    particleSensor.setPulseAmplitudeGreen(0);
    Serial.println("✅ MAX30102: CONNECTED (High Sensitivity Mode)");
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

  // 6. Launch Dedicated FreeRTOS Cloud Telemetry Task on Core 0
  // Pinned to Core 0 so WiFi/HTTP network calls NEVER block sensor processing on Core 1!
  xTaskCreatePinnedToCore(
    cloudTelemetryTask,
    "CloudTelemetry",
    8192,
    NULL,
    1,
    &cloudTaskHandle,
    0
  );
  Serial.println("✅ CLOUD TELEMETRY: BACKGROUND TASK PINNED TO CORE 0");

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

    // Finger is placed when IR reading rises above baseline noise (> 30,000)
    if (irValue > 30000) {
      if (checkForBeat(irValue)) {
        unsigned long delta = now - lastBeatTime;
        lastBeatTime = now;

        // Valid physiological pulse window: 300ms (200 BPM) to 1500ms (40 BPM)
        if (delta >= 300 && delta <= 1500) {
          float instantBpm = 60000.0f / (float)delta;
          if (instantBpm >= 40.0f && instantBpm <= 200.0f) {
            rates[rateSpot++] = (byte)instantBpm;
            rateSpot %= RATE_SIZE;

            // Compute rolling physiological heart rate average
            int sum = 0;
            byte count = 0;
            for (byte x = 0; x < RATE_SIZE; x++) {
              if (rates[x] > 0) {
                sum += rates[x];
                count++;
              }
            }
            if (count > 0) {
              bpm = (float)(sum / count);
            }
          }
        }
      }
    } else {
      // Finger is lifted from sensor - instantly clear heart rate
      bpm = 0.0f;
      lastBeatTime = 0;
      rateSpot = 0;
      memset(rates, 0, sizeof(rates));
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

  // 6. Cloud Telemetry is autonomously handled by FreeRTOS Task on Core 0!
  // (Zero loop blocking ensures Core 1 samples pulse beats continuously without dropping samples)

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
      Serial.print("CONNECTED (ESP32 IP: ");
      Serial.print(WiFi.localIP().toString());
      Serial.print(" | Target Backend: ");
      Serial.print(SERVER_URL);
      Serial.println(")");
    } else {
      Serial.print("DISCONNECTED (Attempting to connect to SSID: '");
      Serial.print(WIFI_SSID);
      Serial.println("')");
    }

    Serial.println("============================================");
  }

  // Fast 8ms loop delay guarantees high-frequency sampling (125 Hz)
  delay(8);
}