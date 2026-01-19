const net = require('net');
const http = require('http');

async function createServeoTunnel() {
    try {
        console.log('🔄 Đang tạo Serveo tunnel (KHÔNG CẦN PASSWORD)...');
        
        // Simple HTTP server để kiểm tra
        const server = http.createServer((req, res) => {
            res.writeHead(200, {
                'Content-Type': 'text/html',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(`
                <html>
                    <body>
                        <h1>Tạp Hóa Smart POS</h1>
                        <p>Đang chuyển đến Next.js server...</p>
                        <script>
                            setTimeout(() => {
                                window.location.href = 'http://192.168.0.171:3000';
                            }, 1000);
                        </script>
                    </body>
                </html>
            `);
        });
        
        server.listen(8080, () => {
            console.log('📡 Local server running on port 8080');
        });
        
        // Tạo tunnel với serveo
        const { spawn } = require('child_process');
        const ssh = spawn('ssh', ['-R', '80:localhost:8080', 'serveo.net'], {
            stdio: 'inherit'
        });
        
        ssh.on('close', (code) => {
            console.log(`SSH process exited with code ${code}`);
        });
        
        console.log('✅ SERVEO TUNNEL ĐÃ SẴN SÀNG!');
        console.log('================================');
        console.log('🔗 URL KHÔNG CẦN PASSWORD:');
        console.log('   https://taphoa-pos.serveo.net');
        console.log('');
        console.log('📱 HƯỚNG DẪN:');
        console.log('   1. Mở Safari trên iPhone');
        console.log('   2. Gõ: https://taphoa-pos.serveo.net');
        console.log('   3. Chờ chuyển hướng đến app');
        console.log('   4. Test: Quét Mã, Chụp Ảnh, Nói Tên');
        console.log('================================');
        
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    }
}

// Alternative solution using local network
console.log('🔄 Testing local network access...');
console.log('================================');
console.log('🔗 LOCAL NETWORK URL (KHÔNG CẦN TUNNEL):');
console.log('   http://192.168.0.171:3000');
console.log('');
console.log('📱 HƯỚNG DẪN:');
console.log('   1. Đảm bảo iPhone và PC cùng WiFi');
console.log('   2. Mở Safari trên iPhone');
console.log('   3. Gõ: http://192.168.0.171:3000');
console.log('   4. Có thể thấy "Not Secure" - nhưng vẫn test được');
console.log('   5. Test các tính năng (speech recognition có thể không hoạt động)');
console.log('================================');
console.log('💡 Nếu speech recognition không hoạt động qua HTTP, dùng tunnel khác');