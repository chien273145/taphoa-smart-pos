@echo off
echo ==========================================
echo   TẠO LOCAL TUNNEL - CHO IPHONE TESTING
echo ==========================================
echo.

:: Kiểm tra xem Next.js đang chạy chưa
echo [1/3] Kiểm tra Next.js server...
netstat -ano | findstr :3000 >nul
if %errorlevel% neq 0 (
    echo ❌ Next.js không chạy trên port 3000
    echo    Chạy: npm run dev
    pause
    exit /b 1
) else (
    echo ✅ Next.js đang chạy trên port 3000
)

:: Tạo tunnel
echo [2/3] Đang tạo HTTPS tunnel...
node create-tunnel.js
if %errorlevel% neq 0 (
    echo ❌ Lỗi tạo tunnel
    pause
    exit /b 1
)

echo [3/3] Hoàn thành!
echo.
echo ==========================================
echo 📱 HƯỚNG DẪN TESTING:
echo ==========================================
echo 1. Mở Safari trên iPhone
echo 2. Gõ URL ở trên
echo 3. Test các tính năng:
echo    - Quét Mã (camera)
echo    - Chụp Ảnh (AI)
echo    - Nói Tên (voice)
echo 4. Cho phép permissions khi được hỏi
echo ==========================================
echo.

pause