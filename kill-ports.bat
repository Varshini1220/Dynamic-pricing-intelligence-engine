@echo off
echo ========================================
echo   Killing Processes on Ports 3000 & 3001
echo ========================================
echo.

echo Checking port 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    echo Killing process %%a on port 3001...
    taskkill /PID %%a /F
)

echo.
echo Checking port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Killing process %%a on port 3000...
    taskkill /PID %%a /F
)

echo.
echo ========================================
echo   Ports 3000 and 3001 are now free!
echo ========================================
echo.
echo You can now run: npm run dev
echo.
pause

