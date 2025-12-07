#!/bin/bash
# Setup script for Linux/macOS
# This script sets up the development environment

echo ""
echo "========================================"
echo "  Task Manager - Setup Script"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    exit 1
fi

echo "[1/4] Creating virtual environment..."
python3 -m venv venv
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to create virtual environment"
    exit 1
fi

echo "[2/4] Activating virtual environment..."
source venv/bin/activate

echo "[3/4] Installing dependencies..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

echo "[4/4] Setup complete!"
echo ""
echo "========================================"
echo "  Setup Successful!"
echo "========================================"
echo ""
echo "To start the application, run:"
echo "  1. source venv/bin/activate"
echo "  2. python run.py"
echo ""
echo "Then open http://localhost:5000 in your browser"
echo ""
