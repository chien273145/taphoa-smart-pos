@echo off
echo ========================================
echo   TẠP HÓA SMART POS - SECURE TUNNEL
echo ========================================
echo.

:: Kiểm tra Next.js
echo [1/3] Kiểm tra Next.js server...
netstat -ano | findstr :3000 >nul
if %errorlevel% neq 0 (
    echo    ❌ Next.js không chạy trên port 3000
    echo    💡 Chạy trước: npm run dev
    echo    Hoặc chạy: start-dev.bat
    pause
    exit /b 1
) else (
    echo    ✅ Next.js đang chạy trên port 3000
)

:: Tạo tunnel
echo [2/3] Đang tạo HTTPS tunnel...
node secure-tunnel.js
if %errorlevel% neq 0 (
    echo    ❌ Lỗi tạo tunnel
    pause
    exit /b 1
)

echo [3/3] Hoàn thành!
echo.
echo ========================================
echo 🎉 ĐÃ SẴN SÀNG ĐỂ TEST IPHONE!
echo ========================================
pause