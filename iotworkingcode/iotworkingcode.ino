
#include <Wire.h>
#include <MAX30105.h>
#include "heartRate.h"
#include <OneWire.h>
#include <DallasTemperature.h>
#include <TinyGPS++.h>
#include <HardwareSerial.h>
#include <math.h>

// =====================================================
// PIN CONFIGURATION - CHANGE THESE IF NEEDED
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

// Impact threshold (basic indicator only)
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

float temperatureC = NAN;
float bpm = 0.0f;
float accelerationG = 0.0f;

uint32_t irValue = 0;
uint32_t redValue = 0;

unsigned long lastPrintTime = 0;
unsigned long lastTempRequest = 0;
unsigned long lastBeatTime = 0;
unsigned long lastBuzzerTime = 0;

bool tempConversionPending = false;
bool buzzerState = false;
bool impactDetected = false;

const unsigned long PRINT_INTERVAL_MS = 2000;
const unsigned long TEMP_INTERVAL_MS = 2000;
const unsigned long TEMP_CONVERSION_MS = 800;
const unsigned long BUZZER_ALERT_MS = 1500;

// =====================================================
// MPU6050 FUNCTIONS - DEFINED ONLY ONCE
// =====================================================

bool mpuWriteRegister(uint8_t reg, uint8_t value) {
  MPUWire.beginTransmission(MPU_ADDRESS);
  MPUWire.write(reg);
  MPUWire.write(value);

  return MPUWire.endTransmission() == 0;
}

bool mpuReadRegisters(uint8_t reg, uint8_t *data,
                      uint8_t length) {
  MPUWire.beginTransmission(MPU_ADDRESS);
  MPUWire.write(reg);

  // Repeated-start read
  if (MPUWire.endTransmission(false) != 0) {
    return false;
  }

  size_t received = MPUWire.requestFrom(
    (uint8_t)MPU_ADDRESS,
    length,
    (bool)true
  );

  if (received != length) {
    while (MPUWire.available()) {
      MPUWire.read();
    }
    return false;
  }

  for (uint8_t i = 0; i < length; i++) {
    data[i] = MPUWire.read();
  }

  return true;
}

int16_t makeSignedValue(uint8_t highByte,
                        uint8_t lowByte) {
  return (int16_t)(
    ((uint16_t)highByte << 8) | lowByte
  );
}

bool initializeMPU() {
  uint8_t whoAmI = 0;

  if (!mpuReadRegisters(0x75, &whoAmI, 1)) {
    Serial.println("MPU6050: WHO_AM_I read failed");
    return false;
  }

  Serial.print("MPU6050 WHO_AM_I: 0x");
  Serial.println(whoAmI, HEX);

  if (whoAmI != 0x68 && whoAmI != 0x69) {
    Serial.println("MPU6050: Unexpected identity");
    return false;
  }

  // Reset the device
  if (!mpuWriteRegister(0x6B, 0x80)) {
    Serial.println("MPU6050: Reset failed");
    return false;
  }

  delay(100);

  // Wake up the sensor
  if (!mpuWriteRegister(0x6B, 0x00)) {
    Serial.println("MPU6050: Wake-up failed");
    return false;
  }

  delay(100);

  // Clock source: internal oscillator
  if (!mpuWriteRegister(0x6B, 0x00)) {
    return false;
  }

  // Digital low-pass filter
  if (!mpuWriteRegister(0x1A, 0x03)) {
    return false;
  }

  // Sample-rate divider
  if (!mpuWriteRegister(0x19, 0x07)) {
    return false;
  }

  // Accelerometer range: +/- 2g
  if (!mpuWriteRegister(0x1C, 0x00)) {
    return false;
  }

  // Gyroscope range: +/- 250 degrees/second
  if (!mpuWriteRegister(0x1B, 0x00)) {
    return false;
  }

  // Enable all sensor axes
  if (!mpuWriteRegister(0x6C, 0x00)) {
    return false;
  }

  delay(50);

  // Verify that the device can return acceleration data
  uint8_t testData[6];

  if (!mpuReadRegisters(0x3B, testData, 6)) {
    Serial.println("MPU6050: Data read test failed");
    return false;
  }

  Serial.println("MPU6050: Configuration successful");
  return true;
}

bool readMPU(float &axG, float &ayG, float &azG) {
  uint8_t data[6];

  if (!mpuReadRegisters(0x3B, data, 6)) {
    return false;
  }

  int16_t ax = makeSignedValue(data[0], data[1]);
  int16_t ay = makeSignedValue(data[2], data[3]);
  int16_t az = makeSignedValue(data[4], data[5]);

  // +/- 2g range: 16384 LSB per g
  axG = ax / 16384.0f;
  ayG = ay / 16384.0f;
  azG = az / 16384.0f;

  return true;
}

// =====================================================
// SETUP
// =====================================================

void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  Serial.println();
  Serial.println("=================================");
  Serial.println(" ESP32 HEALTH MONITOR STARTING");
  Serial.println("=================================");

  // ---------------------------------------------------
  // MAX30102
  // ---------------------------------------------------

  Serial.println("Starting MAX30102...");

  MAXWire.begin(
    MAX_SDA_PIN,
    MAX_SCL_PIN,
    100000
  );

  if (particleSensor.begin(
        MAXWire,
        I2C_SPEED_STANDARD
      )) {

    maxReady = true;

    particleSensor.setup();
    particleSensor.setPulseAmplitudeRed(0x1F);
    particleSensor.setPulseAmplitudeIR(0x1F);
    particleSensor.setPulseAmplitudeGreen(0);

    Serial.println("MAX30102: CONNECTED");

  } else {
    Serial.println("MAX30102: NOT DETECTED");
  }

  // ---------------------------------------------------
  // MPU6050
  // ---------------------------------------------------

  Serial.println("Starting MPU6050...");

  MPUWire.begin(
    MPU_SDA_PIN,
    MPU_SCL_PIN,
    100000
  );

  if (initializeMPU()) {
    mpuReady = true;
    Serial.println("MPU6050: CONNECTED");
  } else {
    mpuReady = false;
    Serial.println("MPU6050: NOT DETECTED");
  }

  // ---------------------------------------------------
  // DS18B20
  // ---------------------------------------------------

  Serial.println("Starting DS18B20...");

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

  // ---------------------------------------------------
  // GPS NEO-6M
  // ---------------------------------------------------

  gpsSerial.begin(
    GPS_BAUD_RATE,
    SERIAL_8N1,
    GPS_RX_PIN,
    GPS_TX_PIN
  );

  Serial.println("GPS: UART STARTED");
  Serial.println("Waiting for satellite fix...");
  Serial.println("Serial Monitor: 115200 baud");
  Serial.println("=================================");
}

// =====================================================
// LOOP
// =====================================================

void loop() {
  unsigned long now = millis();

  // ---------------------------------------------------
  // GPS DATA
  // ---------------------------------------------------

  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  // ---------------------------------------------------
  // MAX30102 HEART RATE ESTIMATE
  // ---------------------------------------------------

  if (maxReady) {
    irValue = particleSensor.getIR();
    redValue = particleSensor.getRed();

    if (irValue > 50000 && checkForBeat(irValue)) {
      if (lastBeatTime != 0) {
        unsigned long beatInterval = now - lastBeatTime;

        if (beatInterval > 0) {
          float newBpm = 60000.0f / beatInterval;

          if (newBpm >= 30.0f && newBpm <= 220.0f) {
            if (bpm == 0.0f) {
              bpm = newBpm;
            } else {
              bpm = 0.7f * bpm + 0.3f * newBpm;
            }
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

  // ---------------------------------------------------
  // DS18B20 TEMPERATURE
  // ---------------------------------------------------

  if (tempReady) {
    if (tempConversionPending &&
        now - lastTempRequest >= TEMP_CONVERSION_MS) {

      float t = tempSensor.getTempCByIndex(0);

      if (t != DEVICE_DISCONNECTED_C &&
          t >= -55.0f &&
          t <= 125.0f) {
        temperatureC = t;
      } else {
        temperatureC = NAN;
      }

      tempConversionPending = false;
    }

    if (!tempConversionPending &&
        now - lastTempRequest >= TEMP_INTERVAL_MS) {

      tempSensor.requestTemperatures();
      lastTempRequest = now;
      tempConversionPending = true;
    }
  }

  // ---------------------------------------------------
  // MPU6050 ACCELERATION
  // ---------------------------------------------------

  impactDetected = false;

  if (mpuReady) {
    float ax, ay, az;

    if (readMPU(ax, ay, az)) {
      accelerationG = sqrtf(
        ax * ax + ay * ay + az * az
      );

      // Basic impact indicator only
      if (accelerationG >= IMPACT_THRESHOLD_G) {
        impactDetected = true;
      }
    } else {
      mpuReady = false;
      Serial.println(
        "WARNING: MPU6050 data read failed"
      );
    }
  }

  // ---------------------------------------------------
  // BUZZER
  // ---------------------------------------------------

  if (BUZZER_ENABLED && impactDetected) {
    digitalWrite(BUZZER_PIN, HIGH);
    buzzerState = true;
    lastBuzzerTime = now;

  } else if (
    buzzerState &&
    now - lastBuzzerTime >= BUZZER_ALERT_MS
  ) {
    digitalWrite(BUZZER_PIN, LOW);
    buzzerState = false;
  }

  // ---------------------------------------------------
  // SERIAL MONITOR DASHBOARD
  // ---------------------------------------------------

  if (now - lastPrintTime >= PRINT_INTERVAL_MS) {
    lastPrintTime = now;

    Serial.println();
    Serial.println("========== HEALTH MONITOR ==========");

    // MAX30102
    Serial.print("MAX30102 status: ");
    Serial.println(
      maxReady ? "CONNECTED" : "NOT CONNECTED"
    );

    if (maxReady) {
      Serial.print("IR: ");
      Serial.print(irValue);

      Serial.print(" | Red: ");
      Serial.println(redValue);

      Serial.print("Heart rate estimate: ");

      if (bpm > 0) {
        Serial.print(bpm, 1);
        Serial.println(" BPM");
      } else if (irValue < 50000) {
        Serial.println("Place finger steadily");
      } else {
        Serial.println("Detecting pulse...");
      }
    }

    // DS18B20
    Serial.print("DS18B20 status: ");
    Serial.println(
      tempReady ? "CONNECTED" : "NOT CONNECTED"
    );

    Serial.print("Temperature: ");

    if (!isnan(temperatureC)) {
      Serial.print(temperatureC, 2);
      Serial.println(" C");
    } else {
      Serial.println("Unavailable");
    }

    // MPU6050
    Serial.print("MPU6050 status: ");
    Serial.println(
      mpuReady ? "CONNECTED" : "NOT CONNECTED"
    );

    if (mpuReady) {
      float ax, ay, az;

      if (readMPU(ax, ay, az)) {
        Serial.print("Acceleration X: ");
        Serial.print(ax, 2);
        Serial.println(" g");

        Serial.print("Acceleration Y: ");
        Serial.print(ay, 2);
        Serial.println(" g");

        Serial.print("Acceleration Z: ");
        Serial.print(az, 2);
        Serial.println(" g");

        Serial.print("Acceleration magnitude: ");
        Serial.print(accelerationG, 2);
        Serial.println(" g");
      }
    }

    Serial.print("Impact indicator: ");
    Serial.println(
      impactDetected ? "TRIGGERED" : "No trigger"
    );

    // GPS
    Serial.print("GPS: ");

    if (gps.location.isValid()) {
      Serial.println("FIX");

      Serial.print("Satellites: ");
      if (gps.satellites.isValid()) {
        Serial.println(gps.satellites.value());
      } else {
        Serial.println("Unknown");
      }

      Serial.print("Latitude: ");
      Serial.println(gps.location.lat(), 6);

      Serial.print("Longitude: ");
      Serial.println(gps.location.lng(), 6);

      Serial.print("Google Maps: https://maps.google.com/?q=");
      Serial.print(gps.location.lat(), 6);
      Serial.print(",");
      Serial.println(gps.location.lng(), 6);

    } else {
      Serial.print("Waiting for fix | Satellites: ");

      if (gps.satellites.isValid()) {
        Serial.println(gps.satellites.value());
      } else {
        Serial.println("0 / unavailable");
      }
    }

    Serial.println("====================================");
  }
}
