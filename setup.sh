#!/bin/bash

echo "========================================"
echo "MariThon One-Click Setup"
echo "========================================"
echo
echo "This will set up your entire MariThon project"
echo "including backend, frontend, and configuration."
echo
echo "Press Enter to continue..."
read

echo
echo "Running Python setup script..."
python3 setup.py

echo
echo "Setup complete! Press Enter to exit..."
read
