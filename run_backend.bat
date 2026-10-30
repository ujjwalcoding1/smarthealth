@echo off
title SmartHealth Cloud Backend (FastAPI :8000)
cd /d "%~dp0backend"
echo ========================================================
echo  Starting SmartHealth FastAPI Backend on 0.0.0.0:8000
echo  Active WiFi IP: 172.28.28.245
echo  ESP32 Endpoint: http://172.28.28.245:8000/api/iot/telemetry
echo ========================================================
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
