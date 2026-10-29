import time
import math
import random
from typing import Dict, Any

class BiologicalSimulator:
    def __init__(self):
        self.mode = "NORMAL"  # "NORMAL", "YELLOW_FEVER", "YELLOW_TACHY", "YELLOW_SPO2", "RED_CRITICAL", "RED_FALL"
        self.step = 0
        self.base_hr = 74.0
        self.base_temp = 36.7
        self.base_spo2 = 98.5
        self.lat = 28.6139
        self.lng = 77.2090
        self.fall_triggered_until = 0

    def set_mode(self, mode: str):
        self.mode = mode.upper()
        if self.mode == "RED_FALL":
            # Keep fall active for 15 seconds
            self.fall_triggered_until = time.time() + 15
        return {"status": "success", "mode": self.mode}

    def get_reading(self) -> Dict[str, Any]:
        self.step += 1
        now = time.time()

        # GPS slight drift (walking simulation)
        lat_drift = math.sin(self.step * 0.05) * 0.0003
        lng_drift = math.cos(self.step * 0.05) * 0.0003

        # Default normal ranges
        if self.mode == "YELLOW_FEVER":
            target_hr = 88.0 + random.uniform(-2, 3)
            target_temp = 38.3 + random.uniform(-0.2, 0.3)
            target_spo2 = 97.0 + random.uniform(-1, 1)
            ax, ay, az = 0.04, -0.06, 0.98
            impact = False

        elif self.mode == "YELLOW_TACHY":
            target_hr = 114.0 + random.uniform(-3, 4)
            target_temp = 37.1 + random.uniform(-0.1, 0.2)
            target_spo2 = 96.0 + random.uniform(-1, 1)
            ax, ay, az = 0.08, -0.05, 0.97
            impact = False

        elif self.mode == "YELLOW_SPO2":
            target_hr = 82.0 + random.uniform(-2, 2)
            target_temp = 36.8 + random.uniform(-0.1, 0.1)
            target_spo2 = 92.5 + random.uniform(-0.8, 0.8)
            ax, ay, az = 0.02, -0.03, 0.99
            impact = False

        elif self.mode == "RED_CRITICAL":
            target_hr = 142.0 + random.uniform(-4, 5)
            target_temp = 39.9 + random.uniform(-0.2, 0.3)
            target_spo2 = 87.0 + random.uniform(-1.5, 1.0)
            ax, ay, az = 0.15, -0.2, 0.94
            impact = False

        elif self.mode == "RED_FALL" or now < self.fall_triggered_until:
            target_hr = 118.0 + random.uniform(-3, 3)
            target_temp = 36.9 + random.uniform(-0.1, 0.1)
            target_spo2 = 96.0 + random.uniform(-1, 1)
            # Sudden high acceleration spike > 2.5g
            ax = random.uniform(1.8, 2.5)
            ay = random.uniform(1.2, 2.1)
            az = random.uniform(0.5, 1.2)
            impact = True

        else: # NORMAL
            # Natural HRV (Heart Rate Variability) oscillation
            target_hr = 72.0 + 4.0 * math.sin(self.step * 0.1) + random.uniform(-1.5, 1.5)
            target_temp = 36.7 + 0.15 * math.sin(self.step * 0.02) + random.uniform(-0.05, 0.05)
            target_spo2 = 98.4 + random.uniform(-0.5, 0.5)
            ax = 0.02 + random.uniform(-0.02, 0.02)
            ay = -0.03 + random.uniform(-0.02, 0.02)
            az = 0.99 + random.uniform(-0.02, 0.02)
            impact = False

        accel_magnitude = math.sqrt(ax * ax + ay * ay + az * az)
        ir_val = int(62000 + target_hr * 120 + random.randint(-500, 500))
        red_val = int(60000 + target_hr * 110 + random.randint(-400, 400))

        return {
            "device_id": "ESP32-PATIENT-01",
            "heart_rate": round(target_hr, 1),
            "spo2": round(min(100.0, max(80.0, target_spo2)), 1),
            "ir_value": ir_val,
            "red_value": red_val,
            "temperature_c": round(target_temp, 2),
            "temperature_f": round(target_temp * 9 / 5 + 32, 2),
            "ax": round(ax, 3),
            "ay": round(ay, 3),
            "az": round(az, 3),
            "acceleration_g": round(accel_magnitude, 2),
            "impact_detected": impact or (accel_magnitude >= 2.5),
            "latitude": round(self.lat + lat_drift, 6),
            "longitude": round(self.lng + lng_drift, 6),
            "satellites": 8,
            "gps_valid": True,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }

simulator = BiologicalSimulator()
