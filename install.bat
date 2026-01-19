@echo off
echo ========================================
echo Installing Dependencies
echo ========================================
echo.

echo [1/2] Installing backend dependencies...
call npm install --no-optional

echo.
echo [2/2] Installing frontend dependencies...
cd client
call npm install
cd ..

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo To start the application, run:
echo   start.bat
echo.
echo Or manually:
echo   npm run dev
echo.
pause

