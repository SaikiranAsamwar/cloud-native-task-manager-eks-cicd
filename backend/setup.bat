@echo off
REM Setup script for Windows
REM This script sets up the development environment

echo.
echo ========================================
echo   Task Manager - Setup Script
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    exit /b 1
)

echo [1/4] Creating virtual environment...
python -m venv venv
if errorlevel 1 (
    echo ERROR: Failed to create virtual environment
    exit /b 1
)

echo [2/4] Activating virtual environment...
call venv\Scripts\activate.bat

echo [3/4] Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    exit /b 1
)

echo [4/4] Setup complete!
echo.
echo ========================================
echo   Setup Successful!
echo ========================================
echo.
echo To start the application, run:
echo   1. .\venv\Scripts\activate.bat
echo   2. python run.py
echo.
echo Then open http://localhost:5000 in your browser
echo.
