@echo off
echo Starting setup...
echo Checking for Python3 installation...
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed. Please install Python3 and try again.
    exit /b 1
)
echo Python3 is installed. Proceeding with setup...
echo Creating virtual environment...
if not exist venv (
    python -m venv venv
)
if %errorlevel% neq 0 (
    echo Failed to create virtual environment
    exit /b %errorlevel%
)   
echo Virtual environment created successfully
echo Activating virtual environment...
if not exist venv\Scripts\activate.bat (
    echo Activation script not found. Please ensure you are running this on Windows.
    exit /b 1
)
call venv\Scripts\activate.bat

echo Succesfully activated virtual environment

pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Failed to install required packages
    exit /b %errorlevel%
)
echo Required packages installed successfully
echo Clearing cache...

python clearCache.py

echo Cache cleared

echo Starting the application...

echo ========================================================
echo =========!!!   IMPORTANT NOTICE   !!!====================
echo ========================================================
echo When you're done using the application, type 'n' and press Enter when you see 'Terminate Batch Job'.
echo Otherwise, some applications may encounter issues. For more information, refer to the documentation.
echo ========================================================
echo ========================================================
echo =========!!!   IMPORTANT NOTICE   !!!====================
echo ========================================================

python app.py
if %errorlevel% neq 0 (
    echo Failed to start the application
    exit /b %errorlevel%
)
echo Application started successfully
call venv\Scripts\deactivate.bat
echo Virtual environment deactivated

echo Clearing cache...
python clearCache.py
echo Cache cleared

pause