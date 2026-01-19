const ngrok = require('ngrok');
const fs = require('fs');

async function createNgrokTunnel() {
    try {
        console.log('🔄 Đang tạo Ngrok tunnel (KHÔNG CẦN PASSWORD)...');
        
        // Tạo tunnel với port 3000
        const url = await ngrok.connect({
            proto: 'http',
            addr: 3000,
            region: 'ap', // Asia region cho speed tốt hơn
            authtoken: null // Free tier
        });
        
        console.log('✅ NGROK TUNNEL ĐÃ SẴN SÀNG!');
        console.log('================================');
        console.log('🔗 URL KHÔNG CẦN PASSWORD:');
        console.log('   ' + url);
        console.log('');
        console.log('📱 HƯỚNG DẪN:');
        console.log('   1. Mở Safari trên iPhone');
        console.log('   2. Gõ: ' + url);
        console.log('   3. Test: Quét Mã, Chụp Ảnh, Nói Tên');
        console.log('   4. Cho phép permissions khi được hỏi');
        console.log('');
        console.log('✨ ƯU ĐIỂM NGROK:');
        console.log('   ✅ KHÔNG CẦN PASSWORD');
        console.log('   ✅ HTTPS tự động');
        console.log('   ✅ Ổn định hơn LocalTunnel');
        console.log('   ✅ Speed tốt (Asia region)');
        console.log('================================');
        
        // Lưu URL vào file để dễ truy cập
        fs.writeFileSync('ngrok-url.txt', url);
        console.log('📝 URL đã lưu vào: ngrok-url.txt');
        
        // Keep tunnel open
        process.on('SIGINT', () => {
            console.log('Đang đóng tunnel...');
            ngrok.kill();
            process.exit(0);
        });
        
    } catch (error) {
        console.error('❌ Lỗi tạo Ngrok tunnel:', error.message);
        console.log('');
        console.log('💡 Giải pháp:');
        console.log('   1. Cài đặt Ngrok: npm install -g ngrok');
        console.log('   2. Kiểm tra port 3000 có trống không');
        console.log('   3. Thử lại sau vài giây');
    }
}

createNgrokTunnel();