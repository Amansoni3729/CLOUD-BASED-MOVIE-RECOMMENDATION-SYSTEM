@echo off
REM MongoDB Connection Setup Script for Windows
REM This script helps troubleshoot and fix MongoDB connection issues

echo.
echo ==========================================
echo MongoDB Connection Setup & Troubleshooting
echo ==========================================
echo.

REM Check if venv exists
if not exist "venv" (
    echo [!] Virtual environment not found. Creating...
    python -m venv venv
    call venv\Scripts\activate.bat
) else (
    echo [*] Activating virtual environment...
    call venv\Scripts\activate.bat
)

echo.
echo [*] Installing/updating dependencies...
pip install -r requirements.txt

echo.
echo ==========================================
echo Running MongoDB Connection Diagnostics
echo ==========================================
echo.

python test_mongo_connection.py

echo.
echo ==========================================
echo Setup Complete
echo ==========================================
echo.
echo Next steps:
echo 1. Review the diagnostic output above
echo 2. Follow troubleshooting steps if needed
echo 3. Run: python app.py
echo.
pause
