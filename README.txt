╔══════════════════════════════════════════════════════╗
║  CRMdb - Customer Relationship Management System     ║
║  CSE-403L DBMS Lab Project - Group 14                ║
║  Stack: React + Tailwind + Laravel + MySQL           ║
╚══════════════════════════════════════════════════════╝

REQUIREMENTS (install these first if not already):
───────────────────────────────────────────────────
  1. XAMPP    → https://www.apachefriends.org
  2. Composer → https://getcomposer.org/Composer-Setup.exe
  3. Node.js  → https://nodejs.org (click LTS button)

SETUP (run once):
───────────────────────────────────────────────────
  1. Start XAMPP → Start MySQL → Start Apache
  2. Open http://localhost/phpmyadmin
     → Import → choose backend/crm_database.sql → Go
  3. Double-click INSTALL.bat
     (takes 3-5 minutes, installs Laravel + React)

START THE APP (every time):
───────────────────────────────────────────────────
  1. Start XAMPP → Start MySQL
  2. Double-click START.bat
  3. Browser opens automatically at http://localhost:5173

FOLDER STRUCTURE:
───────────────────────────────────────────────────
  CRMdb/
  ├── INSTALL.bat          ← Run once to set up
  ├── START.bat            ← Run every time to start
  ├── README.txt           ← This file
  ├── frontend/            ← React + Tailwind source
  │   ├── src/
  │   │   ├── api.js       ← All Laravel API calls
  │   │   ├── App.jsx      ← Main app + routing
  │   │   ├── components/  ← Sidebar, Table, Modal...
  │   │   └── pages/       ← Dashboard, Leads, SQL...
  │   └── package.json
  ├── backend/
  │   ├── setup.php        ← Writes all Laravel files
  │   ├── crm_database.sql ← Your MySQL database
  │   └── stored_procedures.sql
  └── laravel-api/         ← Created by INSTALL.bat
      ├── routes/api.php
      └── app/Http/Controllers/Api/

WHAT IT DOES:
───────────────────────────────────────────────────
  ✓ Reads/writes directly from crm_db MySQL database
  ✓ Shows MySQL Connected (green) / Disconnected (red)
  ✓ Full CRUD: Add leads, convert to customer, etc.
  ✓ 8 SQL queries execute against real database
  ✓ Stored procedures: sp_CampaignROI, sp_LeadFunnel
  ✓ Laravel REST API on http://localhost:8000
  ✓ React frontend on http://localhost:5173
