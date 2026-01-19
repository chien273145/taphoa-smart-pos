const localtunnel = require('localtunnel');

async function createTunnel() {
    try {
        console.log('🔄 Đang tạo HTTPS tunnel cho iPhone testing...');
        console.log('');
        
        // Tạo tunnel với subdomain cố định để dễ nhớ
        const tunnel = await localtunnel({ 
            port: 3000,
            subdomain: 'taphoa-pos-iphone'
        });
        
        console.log('✅ TUNNEL ĐÃ SẴN SÀNG!');
        console.log('================================');
        console.log('🔗 URL CHO IPHONE:');
        console.log('   ' + tunnel.url);
        console.log('');
        console.log('📱 HƯỚNG DẪN TESTING:');
        console.log('   1. Mở Safari trên iPhone');
        console.log('   2. Gõ URL: ' + tunnel.url);
        console.log('   3. Test: Quét Mã, Chụp Ảnh, Nói Tên');
        console.log('   4. Cho phép Camera/Microphone permissions');
        console.log('');
        console.log('✨ TÍNH NĂNG ĐÃ SẴN SÀNG:');
        console.log('   ✅ HTTPS (bắt buộc cho iOS)');
        console.log('   ✅ Speech Recognition');
        console.log('   ✅ Camera/Microphone');
        console.log('   ✅ No password required');
        console.log('================================');
        
        // Keep tunnel open
        tunnel.on('close', () => {
            console.log('❌ Tunnel đã đóng');
            console.log('Chạy lại: node secure-tunnel.js');
        });
        
    } catch (error) {
        console.error('❌ Lỗi tạo tunnel:', error.message);
        console.log('');
        console.log('💡 Giải pháp:');
        console.log('   1. Đảm bảo Next.js đang chạy (npm run dev)');
        console.log('   2. Kiểm tra port 3000 có trống không');
        console.log('   3. Thử lại sau vài giây');
    }
}

createTunnel();