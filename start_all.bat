@echo off
title SmartHealth Platform Launcher
echo ========================================================
echo  Launching SmartHealth Platform (Backend + Frontend)
echo ========================================================
start "SmartHealth Backend (:8000)" "%~dp0run_backend.bat"
timeout /t 3 /nobreak >nul
start "SmartHealth Frontend (:5173)" "%~dp0run_frontend.bat"
echo Done! Both services are running in separate windows.
