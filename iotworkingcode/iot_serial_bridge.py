"""
SmartHealth ESP32 Serial to Cloud Bridge
=========================================
Reads serial telemetry output from iotworkingcode.ino or iotworkingcode_wifi.ino,
validates physiological parameters to prevent collapsing, and forwards clean
real-time data to the SmartHealth cloud backend.

Usage:
    python iot_serial_bridge.py --port COM3 --baud 115200 --url http://localhost:8000
"""

import sys
import time
import re
import argparse
import requests

def parse_args():
    parser = argparse.ArgumentParser(description="ESP32 Serial to SmartHealth Cloud Bridge")
    parser.add_argument("--port", default="COM3", help="Serial port (e.g. COM3, COM4, /dev/ttyUSB0)")
    parser.add_argument("--baud", type=int, default=115200, help="Baud rate (default: 115200)")
    parser.add_argument("--url", default="http://localhost:8000", help="SmartHealth backend URL")
    return parser.parse_args()

def main():
    args = parse_args()
    print("=" * 65)
    print("🏥 SmartHealth ESP32 Serial Bridge (Production Filter)")
    print(f"Connecting to Port: {args.port} at {args.baud} baud")
    print(f"Target Backend URL: {args.url}")
    print("=" * 65)

    try:
        import serial
        ser = serial.Serial(args.port, args.baud, timeout=1)
        print(f"✅ Serial connected successfully to {args.port}!")
    except Exception as e:
        print(f"❌ Could not open serial port {args.port}: {e}")
        print("💡 Hint: Check Device Manager for your ESP32 COM port and pass --port COMx")
        sys.exit(1)

    # Validated telemetry accumulator
    current_data = {
        "device_id": "ESP32-HARDWARE",
        "heart_rate": 72.0,
        "spo2": 98.0,
        "ir_value": 65000,
        "red_value": 62000,
        "temperature_c": 36.8,
        "ax": 0.0,
        "ay": 0.0,
        "az": 1.0,
        "acceleration_g": 1.0,
        "impact_detected": False,
        "finger_detected": True,
        "sensor_source": "HARDWARE",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "satellites": 0,
        "gps_valid": False
    }

    last_send_time = 0
    smooth_bpm = 72.0
    smooth_spo2 = 98.0

    try:
        while True:
            if ser.in_waiting > 0:
                line = ser.readline().decode('utf-8', errors='ignore').strip()
                if not line:
                    continue
                print(f"[ESP32] {line}")

                # 1. Parse Heart Rate (BPM)
                hr_match = re.search(r"(?:Heart rate estimate:|Pulse:)\s*([\d\.]+)\s*BPM", line, re.IGNORECASE)
                if hr_match:
                    raw_bpm = float(hr_match.group(1))
                    if 40.0 <= raw_bpm <= 200.0:
                        smooth_bpm = 0.75 * smooth_bpm + 0.25 * raw_bpm
                        current_data["heart_rate"] = round(smooth_bpm, 1)
                        current_data["finger_detected"] = True

                # Check Standby
                if "Place finger steadily" in line or "Sensor Standby" in line:
                    current_data["finger_detected"] = False

                # 2. Parse SpO2
                spo2_match = re.search(r"SpO2:\s*([\d\.]+)\s*%", line, re.IGNORECASE)
                if spo2_match:
                    raw_spo2 = float(spo2_match.group(1))
                    if 85.0 <= raw_spo2 <= 100.0:
                        smooth_spo2 = 0.85 * smooth_spo2 + 0.15 * raw_spo2
                        current_data["spo2"] = round(smooth_spo2, 1)

                # 3. Parse IR & Red
                ir_match = re.search(r"IR:\s*(\d+)(?:\s*\|\s*Red:\s*(\d+))?", line)
                if ir_match:
                    ir_val = int(ir_match.group(1))
                    current_data["ir_value"] = ir_val
                    if ir_match.group(2):
                        current_data["red_value"] = int(ir_match.group(2))
                    if ir_val >= 50000:
                        current_data["finger_detected"] = True
                    else:
                        current_data["finger_detected"] = False

                # 4. Parse Body Temperature
                temp_match = re.search(r"(?:Temperature:|Body Temp:)\s*([\d\.]+)\s*°?C", line, re.IGNORECASE)
                if temp_match:
                    raw_temp = float(temp_match.group(1))
                    # Human physiological boundary filter
                    if 30.0 <= raw_temp <= 44.0:
                        current_data["temperature_c"] = round(raw_temp, 2)

                # 5. Parse Motion & Acceleration
                accel_match = re.search(r"(?:Acceleration magnitude:|Accel\s*=)\s*([\d\.]+)\s*g", line, re.IGNORECASE)
                if accel_match:
                    current_data["acceleration_g"] = round(float(accel_match.group(1)), 2)

                ax_match = re.search(r"(?:Acceleration X:|X:)\s*([\-\d\.]+)", line)
                if ax_match:
                    current_data["ax"] = float(ax_match.group(1))

                ay_match = re.search(r"(?:Acceleration Y:|Y:)\s*([\-\d\.]+)", line)
                if ay_match:
                    current_data["ay"] = float(ay_match.group(1))

                az_match = re.search(r"(?:Acceleration Z:|Z:)\s*([\-\d\.]+)", line)
                if az_match:
                    current_data["az"] = float(az_match.group(1))

                # 6. Parse Fall Trigger
                if "FALL IMPACT DETECTED" in line or "Impact indicator: TRIGGERED" in line:
                    current_data["impact_detected"] = True
                    print("🚨 [CRITICAL ALERT]: Fall Impact Confirmed from Hardware!")
                    try:
                        requests.post(f"{args.url}/api/sos/trigger", json={
                            "device_id": "ESP32-HARDWARE",
                            "trigger_type": "FALL_DETECTION",
                            "heart_rate": current_data["heart_rate"],
                            "spo2": current_data["spo2"],
                            "temperature_c": current_data["temperature_c"],
                            "acceleration_g": current_data["acceleration_g"],
                            "latitude": current_data["latitude"],
                            "longitude": current_data["longitude"]
                        }, timeout=2)
                    except Exception as err:
                        print(f"SOS trigger dispatch error: {err}")
                elif "Impact indicator: No trigger" in line or "Fall: NORMAL" in line:
                    current_data["impact_detected"] = False

                # 7. Parse GPS
                lat_match = re.search(r"(?:Latitude:|Lat=)\s*([\-\d\.]+)", line)
                if lat_match:
                    current_data["latitude"] = float(lat_match.group(1))
                    current_data["gps_valid"] = True

                lng_match = re.search(r"(?:Longitude:|Lng=)\s*([\-\d\.]+)", line)
                if lng_match:
                    current_data["longitude"] = float(lng_match.group(1))
                    current_data["gps_valid"] = True

                sat_match = re.search(r"(?:Satellites:|Sats=)\s*(\d+)", line)
                if sat_match:
                    current_data["satellites"] = int(sat_match.group(1))

            # Transmit steady validated packet every 1.5 seconds
            now = time.time()
            if now - last_send_time >= 1.5:
                last_send_time = now
                try:
                    resp = requests.post(
                        f"{args.url}/api/iot/telemetry",
                        json=current_data,
                        timeout=2
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        zone = data.get("zone", "GREEN")
                        print(f"📡 Telemetry Stream Active -> Zone: [{zone}] | HR: {current_data['heart_rate']} | Temp: {current_data['temperature_c']}°C")
                except Exception as e:
                    print(f"⚠️ Server {args.url} communication notice: {e}")

    except KeyboardInterrupt:
        print("\nStopping SmartHealth serial bridge. Exiting gracefully.")
        ser.close()

if __name__ == "__main__":
    main()
