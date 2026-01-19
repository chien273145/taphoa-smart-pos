@echo off
echo ========================================
echo   Tạp Hóa Smart POS - Development Server
echo ========================================
echo.

:: Kill any existing Node.js processes
echo [1/3] Cleaning up existing processes...
tasklist | findstr node >nul
if %errorlevel% == 0 (
    echo     Killing existing Node.js processes...
    for /f "tokens=2" %%i in ('tasklist /fi "imagename eq node.exe" /fo csv ^| findstr node') do (
        taskkill /f /pid %%i >nul 2>&1
    )
) else (
    echo     No Node.js processes found
)

:: Remove .next directory
echo [2/3] Cleaning build cache...
if exist ".next" (
    rmdir /s /q .next >nul 2>&1
    echo     Build cache cleared
) else (
    echo     No build cache to clear
)

:: Start development server
echo [3/3] Starting development server...
echo.
echo     Server URLs:
echo     Local:    http://localhost:3000
echo     Network:  http://192.168.0.171:3000
echo.
echo     For iPhone testing: npx localtunnel --port 3000
echo.
echo     Press Ctrl+C to stop server
echo ========================================
echo.

npm run dev

pause