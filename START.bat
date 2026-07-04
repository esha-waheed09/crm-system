@echo off
title CRMdb - Starting
color 0A
cls
echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║      CRMdb - Starting Application            ║
echo  ╚══════════════════════════════════════════════╝
echo.

REM Add XAMPP to PATH
set PATH=%PATH%;C:\xampp\php;C:\xampp\mysql\bin

REM Check laravel-api exists
if not exist "%~dp0laravel-api" (
    echo  ERROR: laravel-api not found!
    echo  Please run INSTALL.bat first.
    pause & exit
)

echo  Starting Laravel API on http://localhost:8000
start "Laravel API - CRMdb" cmd /k "cd /d %~dp0laravel-api && php artisan serve"

echo  Waiting for API to start...
timeout /t 3 /nobreak >nul

echo  Starting React Frontend on http://localhost:5173
start "React Frontend - CRMdb" cmd /k "cd /d %~dp0frontend && npx vite"

echo  Waiting for frontend to start...
timeout /t 4 /nobreak >nul

echo  Opening browser...
start http://localhost:5173

echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║  App running!                                ║
echo  ║  Frontend : http://localhost:5173            ║
echo  ║  API      : http://localhost:8000/api/health ║
echo  ║                                              ║
echo  ║  Keep both black windows open               ║
echo  ║  Close them to stop the app                 ║
echo  ╚══════════════════════════════════════════════╝
echo.
pause
