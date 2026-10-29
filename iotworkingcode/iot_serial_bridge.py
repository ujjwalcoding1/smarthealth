"""
SmartHealth ESP32 Serial to Cloud Bridge
Reads serial output from iotworkingcode.ino and forwards telemetry to the backend server in real-time.
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
    print("=" * 60)
    print("🏥 SmartHealth ESP32 Serial Bridge starting...")
    print(f"Connecting to Serial Port: {args.port} at {args.baud} baud")
    print(f"Forwarding to Server: {args.url}")
    print("=" * 60)

    try:
        import serial
        ser = serial.Serial(args.port, args.baud, timeout=1)
        print(f"✅ Connected to {args.port} successfully!")
    except Exception as e:
        print(f"❌ Could not open serial port {args.port}: {e}")
        print("💡 Hint: Verify your ESP32 COM port in Device Manager or specify --port COMx")
        sys.exit(1)

    # Current telemetry accumulator
    current_data = {
        "device_id": "ESP32-HARDWARE",
        "heart_rate": 0.0,
        "spo2": 98.0,
        "ir_value": 0,
        "red_value": 0,
        "temperature_c": 36.8,
        "ax": 0.0,
        "ay": 0.0,
        "az": 1.0,
        "acceleration_g": 1.0,
        "impact_detected": False,
        "latitude": 28.6139,
        "longitude": 77.2090,
        "satellites": 0,
        "gps_valid": False
    }

    last_send_time = 0

    try:
        while True:
            if ser.in_waiting > 0:
                line = ser.readline().decode('utf-8', errors='ignore').strip()
                if not line:
                    continue
                print(f"[ESP32] {line}")

                # Parse Heart Rate
                hr_match = re.search(r"Heart rate estimate:\s*([\d\.]+)\s*BPM", line)
                if hr_match:
                    current_data["heart_rate"] = float(hr_match.group(1))

                # Parse IR & Red
                ir_match = re.search(r"IR:\s*(\d+)\s*\|\s*Red:\s*(\d+)", line)
                if ir_match:
                    current_data["ir_value"] = int(ir_match.group(1))
                    current_data["red_value"] = int(ir_match.group(2))
                    if current_data["ir_value"] > 50000 and current_data["red_value"] > 0:
                        ratio = current_data["red_value"] / current_data["ir_value"]
                        current_data["spo2"] = round(max(85.0, min(100.0, 110 - 25 * ratio)), 1)

                # Parse Temperature
                temp_match = re.search(r"Temperature:\s*([\d\.]+)\s*C", line)
                if temp_match:
                    current_data["temperature_c"] = float(temp_match.group(1))

                # Parse Accelerations
                ax_match = re.search(r"Acceleration X:\s*([\-\d\.]+)\s*g", line)
                if ax_match:
                    current_data["ax"] = float(ax_match.group(1))

                ay_match = re.search(r"Acceleration Y:\s*([\-\d\.]+)\s*g", line)
                if ay_match:
                    current_data["ay"] = float(ay_match.group(1))

                az_match = re.search(r"Acceleration Z:\s*([\-\d\.]+)\s*g", line)
                if az_match:
                    current_data["az"] = float(az_match.group(1))

                mag_match = re.search(r"Acceleration magnitude:\s*([\d\.]+)\s*g", line)
                if mag_match:
                    current_data["acceleration_g"] = float(mag_match.group(1))

                # Parse Impact
                if "Impact indicator: TRIGGERED" in line:
                    current_data["impact_detected"] = True
                    print("🚨 IMPACT / FALL DETECTED ON HARDWARE! Dispatched urgent trigger!")
                    try:
                        requests.post(f"{args.url}/api/sos/trigger", json={
                            "device_id": "ESP32-HARDWARE",
                            "patient_name": "Rajesh Sharma",
                            "trigger_type": "FALL_DETECTION",
                            "heart_rate": current_data["heart_rate"],
                            "spo2": current_data["spo2"],
                            "temperature_c": current_data["temperature_c"],
                            "acceleration_g": current_data["acceleration_g"],
                            "latitude": current_data["latitude"],
                            "longitude": current_data["longitude"],
                            "status": "TRIGGERED",
                            "dial_number": "112"
                        }, timeout=2)
                    except Exception as err:
                        print(f"SOS post error: {err}")
                elif "Impact indicator: No trigger" in line:
                    current_data["impact_detected"] = False

                # Parse GPS
                lat_match = re.search(r"Latitude:\s*([\-\d\.]+)", line)
                if lat_match:
                    current_data["latitude"] = float(lat_match.group(1))
                    current_data["gps_valid"] = True

                lng_match = re.search(r"Longitude:\s*([\-\d\.]+)", line)
                if lng_match:
                    current_data["longitude"] = float(lng_match.group(1))
                    current_data["gps_valid"] = True

                sat_match = re.search(r"Satellites:\s*(\d+)", line)
                if sat_match:
                    current_data["satellites"] = int(sat_match.group(1))

                # Transmit telemetry every 2 seconds
                now = time.time()
                if now - last_send_time >= 2.0:
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
                            print(f"📡 Telemetry sent -> Server Zone: [{zone}]")
                    except Exception as e:
                        print(f"⚠️ Could not reach server {args.url}: {e}")

    except KeyboardInterrupt:
        print("\nStopping bridge. Exiting.")
        ser.close()

if __name__ == "__main__":
    main()
