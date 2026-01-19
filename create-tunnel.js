const localtunnel = require('localtunnel');

async function createTunnel() {
    try {
        console.log('🔄 Đang tạo tunnel...');
        
        const tunnel = await localtunnel({ 
            port: 3000,
            subdomain: 'taphoa-pos-' + Math.floor(Math.random() * 10000)
        });
        
        console.log('✅ Tunnel đã tạo thành công!');
        console.log('🔗 URL:', tunnel.url);
        console.log('');
        console.log('📱 Dùng URL này trên iPhone Safari:');
        console.log('   ' + tunnel.url);
        console.log('');
        console.log('💡 Nếu có password, nó sẽ hiển thị ở trên');
        
        // Keep tunnel open
        tunnel.on('close', () => {
            console.log('❌ Tunnel đã đóng');
        });
        
    } catch (error) {
        console.error('❌ Lỗi tạo tunnel:', error.message);
    }
}

createTunnel();