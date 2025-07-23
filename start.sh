#!/bin/bash

echo "Starting setup..."

# Python3 kontrolü
echo "Checking for Python3 installation..."
if ! command -v python3 &> /dev/null; then
    echo "Python3 is not installed. Please install Python3 and try again."
    exit 1
fi

# Python sürüm kontrolü (en az 3.6 önerilir)
PYTHON_VERSION=$(python3 --version | grep -oE '[0-9]+\.[0-9]+')
MIN_VERSION="3.6"
if [[ $(echo -e "$PYTHON_VERSION\n$MIN_VERSION" | sort -V | head -n1) != "$MIN_VERSION" ]]; then
    echo "Python 3.6 or higher is required. Please update Python."
    exit 1
fi

# Python sürümüne göre venv paketini kontrol etme ve yükleme
echo "Checking for python3-venv package..."
if ! python3 -m venv --help &> /dev/null; then
    echo "python3-venv is not installed. Attempting to install..."
    PY_MAJOR_MINOR=$(python3 --version | grep -oE '[0-9]+\.[0-9]+')
    VENV_PACKAGE="python${PY_MAJOR_MINOR}-venv"
    
    if command -v apt-get &> /dev/null; then
        echo "Detected Debian/Ubuntu-based system. Installing $VENV_PACKAGE..."
        sudo apt-get update
        sudo apt-get install -y "$VENV_PACKAGE"
        if [ $? -ne 0 ]; then
            echo "Failed to install $VENV_PACKAGE. Please install it manually with:"
            echo "  sudo apt-get install $VENV_PACKAGE"
            exit 1
        fi
    elif command -v dnf &> /dev/null; then
        echo "Detected Fedora-based system. Installing $VENV_PACKAGE..."
        sudo dnf install -y "$VENV_PACKAGE"
        if [ $? -ne 0 ]; then
            echo "Failed to install $VENV_PACKAGE. Please install it manually with:"
            echo "  sudo dnf install $VENV_PACKAGE"
            exit 1
        fi
    elif command -v yum &> /dev/null; then
        echo "Detected CentOS/RHEL-based system. Installing $VENV_PACKAGE..."
        sudo yum install -y "$VENV_PACKAGE"
        if [ $? -ne 0 ]; then
            echo "Failed to install $VENV_PACKAGE. Please install it manually with:"
            echo "  sudo yum install $VENV_PACKAGE"
            exit 1
        fi
    elif command -v brew &> /dev/null; then
        echo "Detected macOS with Homebrew. Installing python3..."
        brew install python3
        if [ $? -ne 0 ]; then
            echo "Failed to install python3 via Homebrew. Please install it manually with:"
            echo "  brew install python3"
            exit 1
        fi
    else
        echo "Unsupported package manager. Please install $VENV_PACKAGE manually."
        echo "For Debian/Ubuntu, run: sudo apt-get install $VENV_PACKAGE"
        echo "For Fedora, run: sudo dnf install $VENV_PACKAGE"
        echo "For CentOS/RHEL, run: sudo yum install $VENV_PACKAGE"
        exit 1
    fi
    echo "$VENV_PACKAGE installed successfully."
fi

# Mevcut venv klasörünü silme
echo "Attempting to remove existing virtual environment..."
if [ -d "venv" ]; then
    rm -rf venv
    if [ $? -ne 0 ]; then
        echo "Warning: Failed to remove existing virtual environment. Continuing anyway..."
    else
        echo "Existing virtual environment removed successfully."
    fi
else
    echo "No existing virtual environment found. Proceeding..."
fi

# Sanal ortam oluşturma
echo "Creating virtual environment..."
python3 -m venv venv
if [ $? -ne 0 ]; then
    echo "Failed to create virtual environment. Please ensure $VENV_PACKAGE is installed correctly."
    exit $?
fi

# Sanal ortam aktivasyonu
echo "Activating virtual environment..."
if [ ! -f "venv/bin/activate" ]; then
    echo "Activation script not found. Please ensure you are running this on Linux/macOS."
    exit 1
fi
source venv/bin/activate
echo "Successfully activated virtual environment"

# Gerekli paketlerin kurulumu
echo "Installing required packages..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "Failed to install required packages."
    exit $?
fi
echo "Required packages installed successfully"

# Cache temizleme
echo "Clearing cache..."
python3 clearCache.py
if [ $? -ne 0 ]; then
    echo "Failed to clear cache."
    exit $?
fi
echo "Cache cleared"

# Uygulama başlatma
echo "Starting the application..."
echo "========================================================"
echo "=========!!!   IMPORTANT NOTICE   !!!===================="
echo "========================================================"
echo "When you're done using the application, press Ctrl+C to exit."
echo "If you can't start the app, make sure you are starting the app with sudo."
echo "========================================================"
python3 app.py
if [ $? -ne 0 ]; then
    echo "Failed to start the application."
    exit $?
fi
echo "Application started successfully"

# Sanal ortam kapatma
deactivate
echo "Virtual environment deactivated"

# Cache tekrar temizleme
echo "Clearing cache..."
python3 clearCache.py
if [ $? -ne 0 ]; then
    echo "Failed to clear cache."
    exit $?
fi
echo "Cache cleared"

read -p "Press Enter to continue..."