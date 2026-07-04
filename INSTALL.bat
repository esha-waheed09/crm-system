@echo off
title CRMdb - Full Installation
color 0A
cls
echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║      CRMdb - Full Stack CRM System           ║
echo  ║      CSE-403L DBMS Lab - Group 14            ║
echo  ║      React + Laravel + MySQL                 ║
echo  ╚══════════════════════════════════════════════╝
echo.

REM ── Add XAMPP PHP to PATH ────────────────────────
set PATH=%PATH%;C:\xampp\php;C:\xampp\mysql\bin

REM ── Check PHP ────────────────────────────────────
echo  [1/7] Checking PHP...
php -v >nul 2>&1
if errorlevel 1 (
    echo  ERROR: PHP not found!
    echo  Make sure XAMPP is installed at C:\xampp
    pause & exit
)
echo        PHP OK

REM ── Check Composer ───────────────────────────────
echo  [2/7] Checking Composer...
composer -V >nul 2>&1
if errorlevel 1 (
    echo  ERROR: Composer not found!
    echo  Download: https://getcomposer.org/Composer-Setup.exe
    echo  Install it then run this file again.
    pause & exit
)
echo        Composer OK

REM ── Check Node ───────────────────────────────────
echo  [3/7] Checking Node.js...
node -v >nul 2>&1
if errorlevel 1 (
    echo  ERROR: Node.js not found!
    echo  Download: https://nodejs.org  (click LTS)
    pause & exit
)
echo        Node.js OK

REM ── Create Laravel project ───────────────────────
echo  [4/7] Creating Laravel backend (takes 2-3 mins)...
if exist "%~dp0laravel-api" (
    echo        Already exists, skipping...
) else (
    cd "%~dp0"
    composer create-project laravel/laravel laravel-api --quiet
    if errorlevel 1 (
        echo  ERROR creating Laravel project!
        pause & exit
    )
)
echo        Laravel created

REM ── Run setup script ─────────────────────────────
echo  [5/7] Writing all Laravel files...
cd "%~dp0laravel-api"
php "%~dp0backend\setup.php"
php artisan key:generate --force --quiet
php artisan optimize:clear --quiet
echo        All files written

REM ── Install frontend ─────────────────────────────
echo  [6/7] Installing React frontend...
cd "%~dp0frontend"
call npm install --silent
if errorlevel 1 (
    echo  ERROR installing frontend!
    pause & exit
)
echo        Frontend installed

REM ── Done ─────────────────────────────────────────
echo  [7/7] Installation complete!
echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║  INSTALLATION DONE!                          ║
echo  ║                                              ║
echo  ║  Now run START.bat to launch the app         ║
echo  ╚══════════════════════════════════════════════╝
echo.
pause
