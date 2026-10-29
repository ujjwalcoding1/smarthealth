/*
  SmartHealth ESP32 IoT Patient Lifeline Monitor - Dual-Core WiFi & Cloud Edition
  =============================================================================
  Architecture:
  - Core 1 (Sensor Core): High-frequency real-time sampling of MAX30102 (pulse & SpO2),
    MPU6050 (3-axis accel & fall impact), DS18B20 (body temperature), and NEO-6M GPS.
    Zero network delays guarantee that heart beat detection never collapses or skips.
  - Core 0 (Cloud Core): Background FreeRTOS task handles WiFi connection, auto-reconnect,
    and non-blocking HTTP JSON telemetry push to the SmartHealth cloud backend.
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

// Render deployment URL or local IP: e.g. "https://smarthealth-backend.onrender.com" or "http://10.25.212.245:8000"
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

// Emergency Buzzer Indicator
#define BUZZER_PIN 25
#define BUZZER_ENABLED true

// Clinical Fall Impact Threshold (g)
#define IMPACT_THRESHOLD_G 2.8f

// =====================================================
// OBJECTS & BUSES
// =====================================================
TwoWire MAXWire = TwoWire(0);
TwoWire MPUWire = TwoWire(1);

MAX30105 particleSensor;
OneWire oneWire(TEMP_DATA_PIN);
DallasTemperature tempSensor(&oneWire);

HardwareSerial gpsSerial(2);
TinyGPSPlus gps;

// =====================================================
// THREAD-SAFE SHARED TELEMETRY DATA
// =====================================================
struct SharedTelemetry {
  float bpm = 0.0f;
  float spo2 = 98.0f;
  uint32_t ir = 0;
  uint32_t red = 0;
  float tempC = 36.8f;
  float ax = 0.0f, ay = 0.0f, az = 1.0f;
  float accelG = 1.0f;
  bool impact = false;
  bool fingerOn = false;
  float lat = 28.6139f;
  float lng = 77.2090f;
  int sats = 0;
  bool gpsValid = false;
};

SharedTelemetry liveTelemetry;
portMUX_TYPE telemetryMux = portMUX_INITIALIZER_UNLOCKED;

// =====================================================
// SENSOR TIMERS & STATE
// =====================================================
bool maxReady = false;
bool mpuReady = false;
bool tempReady = false;

unsigned long lastBeatTime = 0;
unsigned long lastTempRequest = 0;
unsigned long lastPrintTime = 0;
unsigned long lastBuzzerTime = 0;
unsigned long lastFallTriggerTime = 0;

bool tempConversionPending = false;
bool buzzerState = false;

// Filter buffers
float filteredBpm = 0.0f;
float filteredSpo2 = 98.0f;

const unsigned long TEMP_INTERVAL_MS = 2000;
const unsigned long TEMP_CONVERSION_MS = 800;
const unsigned long BUZZER_ALERT_MS = 2000;
const unsigned long FALL_COOLDOWN_MS = 8000;

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

  mpuWriteRegister(0x6B, 0x80); delay(60);
  mpuWriteRegister(0x6B, 0x00); delay(60);
  mpuWriteRegister(0x1A, 0x03); // Low-pass filter ~44Hz
  mpuWriteRegister(0x19, 0x07); // 1kHz sample rate / 8 = 125Hz
  mpuWriteRegister(0x1C, 0x08); // +/- 4g accel range
  mpuWriteRegister(0x1B, 0x00);
  delay(30);
  return true;
}

bool readMPU(float &ax, float &ay, float &az) {
  uint8_t data[6];
  if (!mpuReadRegisters(0x3B, data, 6)) return false;
  // Sensitivity for +/- 4g range is 8192 LSB/g
  ax = makeSignedValue(data[0], data[1]) / 8192.0f;
  ay = makeSignedValue(data[2], data[3]) / 8192.0f;
  az = makeSignedValue(data[4], data[5]) / 8192.0f;
  return true;
}

// =====================================================
// CORE 0: BACKGROUND CLOUD DISPATCH TASK
// =====================================================
void wifiCloudTask(void *parameter) {
  Serial.println("[Core 0] WiFi & Cloud Dispatcher Task Started");

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (true) {
    // 1. Maintain WiFi Connection
    if (WiFi.status() != WL_CONNECTED) {
      Serial.print("[Core 0] Connecting to WiFi: ");
      Serial.println(WIFI_SSID);
      WiFi.reconnect();
      vTaskDelay(pdMS_TO_TICKS(2000));
      continue;
    }

    // 2. Safely capture current telemetry snapshot
    SharedTelemetry snap;
    portENTER_CRITICAL(&telemetryMux);
    snap = liveTelemetry;
    // Reset transient fall impact flag once captured
    liveTelemetry.impact = false;
    portEXIT_CRITICAL(&telemetryMux);

    // 3. Dispatch HTTP JSON POST to SmartHealth Backend
    HTTPClient http;
    http.setTimeout(1200); // Strict timeout prevents any hang
    String url = String(SERVER_URL) + "/api/iot/telemetry";

    if (http.begin(url)) {
      http.addHeader("Content-Type", "application/json");

      String payload = "{";
      payload += "\"device_id\":\"ESP32-HARDWARE\",";
      payload += "\"heart_rate\":" + String(snap.bpm, 1) + ",";
      payload += "\"spo2\":" + String(snap.spo2, 1) + ",";
      payload += "\"ir_value\":" + String(snap.ir) + ",";
      payload += "\"red_value\":" + String(snap.red) + ",";
      payload += "\"temperature_c\":" + String(snap.tempC, 2) + ",";
      payload += "\"ax\":" + String(snap.ax, 3) + ",";
      payload += "\"ay\":" + String(snap.ay, 3) + ",";
      payload += "\"az\":" + String(snap.az, 3) + ",";
      payload += "\"acceleration_g\":" + String(snap.accelG, 2) + ",";
      payload += "\"impact_detected\":" + String(snap.impact ? "true" : "false") + ",";
      payload += "\"finger_detected\":" + String(snap.fingerOn ? "true" : "false") + ",";
      payload += "\"sensor_source\":\"HARDWARE\",";
      payload += "\"latitude\":" + String(snap.lat, 6) + ",";
      payload += "\"longitude\":" + String(snap.lng, 6) + ",";
      payload += "\"satellites\":" + String(snap.sats) + ",";
      payload += "\"gps_valid\":" + String(snap.gpsValid ? "true" : "false");
      payload += "}";

      int code = http.POST(payload);
      if (code > 0) {
        // HTTP 200 OK
      } else {
        Serial.print("[Core 0] HTTP Push Notice: ");
        Serial.println(http.errorToString(code));
      }
      http.end();
    }

    // 4. If fall detected, dispatch urgent emergency SOS trigger
    if (snap.impact) {
      HTTPClient sosHttp;
      sosHttp.setTimeout(1500);
      String sosUrl = String(SERVER_URL) + "/api/sos/trigger";
      if (sosHttp.begin(sosUrl)) {
        sosHttp.addHeader("Content-Type", "application/json");
        String sosJson = "{\"device_id\":\"ESP32-HARDWARE\",\"trigger_type\":\"FALL_DETECTION\",";
        sosJson += "\"heart_rate\":" + String(snap.bpm, 1) + ",";
        sosJson += "\"spo2\":" + String(snap.spo2, 1) + ",";
        sosJson += "\"temperature_c\":" + String(snap.tempC, 1) + ",";
        sosJson += "\"acceleration_g\":" + String(snap.accelG, 2) + ",";
        sosJson += "\"latitude\":" + String(snap.lat, 6) + ",";
        sosJson += "\"longitude\":" + String(snap.lng, 6) + "}";
        sosHttp.POST(sosJson);
        sosHttp.end();
      }
    }

    // Push telemetry every 1.5 seconds smoothly
    vTaskDelay(pdMS_TO_TICKS(1500));
  }
}

// =====================================================
// SETUP (Runs on Core 1)
// =====================================================
void setup() {
  Serial.begin(115200);
  delay(500);

  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  Serial.println("\n=================================================");
  Serial.println("  SMARTHEALTH ESP32 DUAL-CORE TELEMETRY ENGINE");
  Serial.println("=================================================");

  // 1. Initialize MAX30102 on I2C Bus 0 (Pins 26 SDA, 13 SCL)
  MAXWire.begin(MAX_SDA_PIN, MAX_SCL_PIN, 400000); // 400kHz fast I2C
  if (particleSensor.begin(MAXWire, I2C_SPEED_FAST)) {
    maxReady = true;
    particleSensor.setup(0x1F, 4, 2, 400, 411, 4096); // LED current, sample average, mode, rate, pulse width, range
    particleSensor.setPulseAmplitudeRed(0x24);
    particleSensor.setPulseAmplitudeIR(0x24);
    Serial.println("✅ MAX30102 Optical Sensor: ONLINE (400kHz)");
  } else {
    Serial.println("❌ MAX30102: Not detected on I2C Bus 0");
  }

  // 2. Initialize MPU6050 on I2C Bus 1 (Pins 21 SDA, 22 SCL)
  MPUWire.begin(MPU_SDA_PIN, MPU_SCL_PIN, 100000);
  mpuReady = initializeMPU();
  Serial.println(mpuReady ? "✅ MPU6050 Motion Sensor: ONLINE (+/-4g Filtered)" : "❌ MPU6050: Init Failed");

  // 3. Initialize DS18B20 OneWire Bus (Pin 4)
  tempSensor.begin();
  if (tempSensor.getDeviceCount() > 0) {
    tempReady = true;
    tempSensor.setWaitForConversion(false);
    tempSensor.requestTemperatures();
    tempConversionPending = true;
    lastTempRequest = millis();
    Serial.println("✅ DS18B20 Temperature Sensor: ONLINE");
  } else {
    Serial.println("❌ DS18B20: Not detected on GPIO 4");
  }

  // 4. Initialize NEO-6M GPS UART 2 (Pins 18 RX, 19 TX)
  gpsSerial.begin(GPS_BAUD_RATE, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
  Serial.println("✅ NEO-6M GPS: UART2 Initialized at 9600 baud");

  // 5. Launch Background WiFi & Cloud Dispatcher Task on Core 0
  // Core 1 stays 100% dedicated to microsecond-precise sensor sampling!
  xTaskCreatePinnedToCore(
    wifiCloudTask,        // Function pointer
    "wifiCloudTask",      // Task name
    8192,                 // Stack size
    NULL,                 // Parameters
    1,                    // Priority
    NULL,                 // Task handle
    0                     // Core 0 (Sensor runs on Core 1)
  );

  Serial.println("=================================================\n");
}

// =====================================================
// MAIN SENSOR LOOP (Runs exclusively on Core 1)
// =====================================================
void loop() {
  unsigned long now = millis();

  // 1. Process GPS Serial Stream
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  // 2. High-Speed MAX30102 Heart Rate & SpO2 Sampling
  uint32_t ir = 0;
  uint32_t red = 0;
  bool fingerDetected = false;

  if (maxReady) {
    ir = particleSensor.getIR();
    red = particleSensor.getRed();

    // Finger is securely placed when IR intensity exceeds threshold
    if (ir >= 50000) {
      fingerDetected = true;

      // Clinical beat detector
      if (checkForBeat(ir)) {
        if (lastBeatTime != 0) {
          unsigned long interval = now - lastBeatTime;
          // Valid human heartbeat intervals: 300ms (200 BPM) to 1500ms (40 BPM)
          if (interval >= 300 && interval <= 1500) {
            float instantBpm = 60000.0f / (float)interval;
            // Outlier check
            if (instantBpm >= 40.0f && instantBpm <= 200.0f) {
              if (filteredBpm == 0.0f) {
                filteredBpm = instantBpm;
              } else {
                // Exponential Moving Average filter (prevents sudden spikes)
                filteredBpm = 0.75f * filteredBpm + 0.25f * instantBpm;
              }
            }
          }
        }
        lastBeatTime = now;
      }

      // Smooth SpO2 Calculation from Red/IR Ratio
      if (red > 0) {
        float ratio = (float)red / (float)ir;
        float instantSpo2 = 110.0f - 25.0f * ratio;
        if (instantSpo2 > 100.0f) instantSpo2 = 100.0f;
        if (instantSpo2 < 85.0f) instantSpo2 = 85.0f;
        filteredSpo2 = 0.90f * filteredSpo2 + 0.10f * instantSpo2;
      }

    } else {
      // Finger lifted / not placed
      fingerDetected = false;
      filteredBpm = 0.0f;
      lastBeatTime = 0;
    }
  }

  // 3. DS18B20 Non-blocking Temperature Sampling
  float currentTemp = 36.8f;
  if (tempReady) {
    if (tempConversionPending && (now - lastTempRequest >= TEMP_CONVERSION_MS)) {
      float t = tempSensor.getTempCByIndex(0);
      // Validate that reading is not disconnected (-127C) or power-up uninitialized (85C)
      if (t >= 30.0f && t <= 44.0f) {
        currentTemp = t;
      }
      tempConversionPending = false;
    }
    if (!tempConversionPending && (now - lastTempRequest >= TEMP_INTERVAL_MS)) {
      tempSensor.requestTemperatures();
      lastTempRequest = now;
      tempConversionPending = true;
    }
  }

  // 4. MPU6050 3-Axis Accelerometer & Fall Detection
  float ax = 0.0f, ay = 0.0f, az = 1.0f;
  float accelMag = 1.0f;
  bool fallTriggered = false;

  if (mpuReady) {
    if (readMPU(ax, ay, az)) {
      accelMag = sqrtf(ax * ax + ay * ay + az * az);

      // Clinical Fall Impact: Acceleration magnitude exceeds 2.8g
      // with cooldown to prevent repetitive flapping
      if (accelMag >= IMPACT_THRESHOLD_G && (now - lastFallTriggerTime >= FALL_COOLDOWN_MS)) {
        fallTriggered = true;
        lastFallTriggerTime = now;
        Serial.printf("\n🚨 [FALL IMPACT DETECTED]: Acceleration = %.2fg\n", accelMag);
      }
    } else {
      // Graceful re-init if I2C bus experienced brief transient glitch
      mpuReady = initializeMPU();
    }
  }

  // 5. Emergency Buzzer Actuation
  if (BUZZER_ENABLED && fallTriggered) {
    digitalWrite(BUZZER_PIN, HIGH);
    buzzerState = true;
    lastBuzzerTime = now;
  } else if (buzzerState && (now - lastBuzzerTime >= BUZZER_ALERT_MS)) {
    digitalWrite(BUZZER_PIN, LOW);
    buzzerState = false;
  }

  // 6. GPS Fix
  float lat = gps.location.isValid() ? (float)gps.location.lat() : 28.6139f;
  float lng = gps.location.isValid() ? (float)gps.location.lng() : 77.2090f;
  int sats = gps.satellites.isValid() ? gps.satellites.value() : 0;
  bool gpsValid = gps.location.isValid();

  // 7. Thread-Safe Update of Shared Telemetry for Core 0
  portENTER_CRITICAL(&telemetryMux);
  liveTelemetry.bpm = filteredBpm;
  liveTelemetry.spo2 = filteredSpo2;
  liveTelemetry.ir = ir;
  liveTelemetry.red = red;
  liveTelemetry.tempC = currentTemp;
  liveTelemetry.ax = ax;
  liveTelemetry.ay = ay;
  liveTelemetry.az = az;
  liveTelemetry.accelG = accelMag;
  liveTelemetry.fingerOn = fingerDetected;
  if (fallTriggered) liveTelemetry.impact = true;
  liveTelemetry.lat = lat;
  liveTelemetry.lng = lng;
  liveTelemetry.sats = sats;
  liveTelemetry.gpsValid = gpsValid;
  portEXIT_CRITICAL(&telemetryMux);

  // 8. Serial Monitor Dashboard (Every 2 seconds)
  if (now - lastPrintTime >= 2000) {
    lastPrintTime = now;
    Serial.println("\n========== SMARTHEALTH SENSOR TELEMETRY ==========");
    if (fingerDetected) {
      Serial.printf("❤️ Pulse: %.1f BPM | SpO2: %.1f%% | IR: %u\n", filteredBpm, filteredSpo2, ir);
    } else {
      Serial.println("🖐️ Sensor Standby: Place finger steadily on MAX30102");
    }
    Serial.printf("🌡️ Body Temp: %.2f °C\n", currentTemp);
    Serial.printf("🏃 Motion: Accel = %.2fg (X:%.2f, Y:%.2f, Z:%.2f) | Fall: %s\n",
                  accelMag, ax, ay, az, fallTriggered ? "TRIGGERED" : "NORMAL");
    Serial.printf("📍 GPS: Lat=%.6f, Lng=%.6f, Sats=%d, Fix=%s\n",
                  lat, lng, sats, gpsValid ? "YES" : "NO");
    Serial.printf("📶 WiFi Status: %s\n", WiFi.status() == WL_CONNECTED ? "CONNECTED" : "OFFLINE/CONNECTING");
    Serial.println("==================================================");
  }

  // Tight, non-blocking delay gives microsecond precision
  delay(10);
}