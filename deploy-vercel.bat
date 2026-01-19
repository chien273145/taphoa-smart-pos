@echo off
echo ========================================
echo   TẠP HÓA SMART POS - VERCEL DEPLOY
echo ========================================
echo.

echo [1/4] Kiểm tra git status...
git status
if %errorlevel% neq 0 (
    echo ❌ Git repository error
    pause
    exit /b 1
)

echo [2/4] Commit các thay đổi...
git add .
set /p commit_msg=Nhập commit message (hoặc Enter để dùng default): 
if "%commit_msg%"=="" set commit_msg=Update mobile compatibility and bug fixes
git commit -m "%commit_msg%"

echo [3/4] Push lên GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo ❌ Push thất bại
    pause
    exit /b 1
)

echo [4/4] Deploy lên Vercel...
echo 🌐 Vercel sẽ tự động deploy từ GitHub
echo    URL: https://taphoa-smart-pos.vercel.app
echo    Chờ 2-3 phút để deploy hoàn tất
echo.

echo ========================================
echo 📱 TESTING SAU KHI DEPLOY:
echo ========================================
echo 1. Mở Safari trên iPhone
echo 2. Gõ: https://taphoa-smart-pos.vercel.app
echo 3. Test: Quét Mã, Chụp Ảnh, Nói Tên
echo 4. Tất cả sẽ hoạt động với HTTPS
echo ========================================
echo.

echo 🔗 Mở Vercel dashboard để theo dõi:
echo    https://vercel.com/dashboard
echo.

pause