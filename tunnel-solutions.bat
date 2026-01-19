@echo off
echo =========================================
echo   CÁC GIẢI PHÁP KHÔNG CẦN PASSWORD
echo =========================================
echo.

echo 🔗 GIẢI PHÁP 1: LOCAL NETWORK (ĐƠN GIẢN NHẤT)
echo    URL: http://192.168.0.171:3000
echo    Điều kiện: iPhone và PC cùng WiFi
echo    Testing: Camera OK, Speech có thể không hoạt động
echo.

echo 🔗 GIẢI PHÁP 2: CLOUDFLARE TUNNEL (KHUYẾN NGHỊ)
echo    Lệnh: cloudflared tunnel --url http://localhost:3000
echo    Đặc điểm: Miễn phí, không password, ổn định
echo.

echo 🔗 GIẢI PHÁP 3: NGROK CLI
echo    Lệnh: ngrok http 3000
echo    Đặc điểm: Popular, dễ dùng
echo.

echo =========================================
echo CHỌN GIẢI PHÁP BẠN MUỐN:
echo =========================================
echo.
echo [1] Test local network (nhanh nhất)
echo [2] Tạo Cloudflare tunnel (khuyên dùng)  
echo [3] Tạo Ngrok tunnel
echo [4] Manual - tự chọn
echo.
set /p choice=Chọn số (1-4): 

if "%choice%"=="1" goto localnet
if "%choice%"=="2" goto cloudflare
if "%choice%"=="3" goto ngrok
if "%choice%"=="4" goto manual
goto end

:localnet
echo.
echo ✅ LOCAL NETWORK SOLUTION:
echo    URL: http://192.168.0.171:3000
echo    Mở Safari trên iPhone và gõ URL trên
echo    Lưu ý: Speech recognition có thể không hoạt động qua HTTP
goto end

:cloudflare
echo.
echo 🔄 Đang tạo Cloudflare tunnel...
cloudflared tunnel --url http://localhost:3000
goto end

:ngrok
echo.
echo 🔄 Đang tạo Ngrok tunnel...
ngrok http 3000
goto end

:manual
echo.
echo 💡 CÁC LỆNH MANUAL:
echo    Cloudflare: cloudflared tunnel --url http://localhost:3000
echo    Ngrok:      ngrok http 3000
echo    Local net:   http://192.168.0.171:3000
goto end

:end
echo.
echo 📱 TESTING GUIDE:
echo    1. Quét Mã → Test camera
echo    2. Chụp Ảnh → Test AI camera  
echo    3. Nói Tên → Test microphone (cần HTTPS)
pause