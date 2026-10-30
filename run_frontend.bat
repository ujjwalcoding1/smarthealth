@echo off
title SmartHealth Web App Dashboard (Vite :5173)
cd /d "%~dp0frontend"
echo ========================================================
echo  Starting SmartHealth Web App Dashboard
echo  Local: http://localhost:5173
echo  LAN:   http://172.28.28.245:5173
echo ========================================================
npm run dev -- --host 0.0.0.0
pause
