@echo off
echo ========================================
echo   Clean Build and Restart
echo ========================================
echo.

echo Step 1: Killing processes on ports 3000 and 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    taskkill /PID %%a /F 2>nul
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /PID %%a /F 2>nul
)
echo Ports cleared!
echo.

echo Step 2: Cleaning Next.js build cache...
if exist "client\.next" (
    echo Deleting client\.next folder...
    rmdir /s /q "client\.next"
    echo Build cache deleted!
) else (
    echo No build cache found.
)
echo.

echo Step 3: Cleaning node_modules cache (optional)...
echo Skipping node_modules deletion (takes too long)
echo If you want to clean node_modules, run: npm run clean-all
echo.

echo ========================================
echo   Starting Application...
echo ========================================
echo.

npm run dev

