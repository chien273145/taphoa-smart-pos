# Tạp Hóa Smart POS

Hệ thống POS (Point of Sale) thông minh dành cho cửa hàng tạp hóa, được thiết kế đặc biệt cho người lớn tuổi và người không rành công nghệ.

## 🚀 Tính năng chính

### 📱 Mobile-First Design
- Giao diện tối ưu cho smartphone với nút bấm lớn
- Responsive layout cho desktop và mobile
- Touch targets tối thiểu 48px cho trải nghiệm tốt nhất

### 🎤 AI & Voice Commands
- **Voice Search**: Tìm sản phẩm bằng giọng nói tiếng Việt
- **Smart Import**: Nhập hàng bằng lệnh giọng nói tự nhiên
- **Voice Feedback**: Tự động đọc thông tin sản phẩm và giá tiền

### 📷 Multi-Method Product Lookup
- **Barcode Scanner**: Quét mã vạch cho hàng có bao bì
- **AI Vision**: Chụp ảnh sản phẩm → AI nhận diện (rau, củ, hàng không mã)
- **Voice Search**: Tìm kiếm theo tên sản phẩm

### 💳 Smart Payment
- QR Code động với VietQR API
- Tự động tính tổng tiền
- Voice confirmation khi thanh toán

### 🛒 Cart Management
- Drawer giỏ hàng mobile-friendly
- Tăng/giảm số lượng dễ dàng
- Mode "Xem giá" tra cứu không thêm vào giỏ

## 🛠️ Công nghệ

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: Lucide React icons
- **Voice**: Web Speech API (Speech Recognition & Speech Synthesis)
- **AI Vision**: Google Gemini 1.5 Flash (ready to integrate)
- **Barcode**: React-ZXing (ready to integrate)
- **Database**: Supabase (ready to integrate)

## 📦 Cài đặt

```bash
# Clone repository
git clone https://github.com/yourusername/taphoa-smart-pos.git

# Install dependencies
cd taphoa-smart-pos
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 🎯 Sử dụng

### Bán hàng
1. Chọn phương thức tra cứu:
   - 🟦 Quét mã vạch (hàng có bao bì)
   - 🟪 Chụp ảnh AI (rau, củ, hàng không mã)  
   - 🟧 Nói tên sản phẩm
2. Bấm sản phẩm để thêm vào giỏ hàng
3. Chuyển đổi mode "Bán" ↔ "Xem giá" nếu chỉ muốn tra cứu
4. Bấm "THANH TOÁN" để tạo QR code

### Nhập hàng
1. Vào tab "Nhập hàng"
2. Bấm "BẬT MIC NÓI ĐỂ NHẬP"
3. Nói lệnh: *"Nhập 10 thùng bia Tiger giá bán 320 nghìn"*
4. Kiểm tra và lưu

## 🔧 Cấu hình

### Cài đặt ngân hàng (VietQR)
- Truy cập tab "Cài đặt"
- Cập nhật thông tin tài khoản ngân hàng
- Mã ngân hàng, số tài khoản, chủ tài khoản

### Cài đặt giọng nói
- Bật/tắt phản hồi giọng nói
- Điều chỉnh tốc độ nói

## 🌟 Điểm nổi bật

- **Dễ sử dụng**: Giao diện đơn giản, font chữ lớn, màu tương phản cao
- **Đa phương thức**: Voice, Camera, Barcode - lựa chọn tùy tình huống
- **Thông minh**: AI tự động parse lệnh tự nhiên
- **Mobile-first**: Tối ưu hoàn hảo cho smartphone
- **Tiếng Việt**: Hỗ trợ 100% tiếng Việt

## 📱 Demo

- **Bán hàng**: `https://your-app.vercel.app`
- **Nhập hàng**: `https://your-app.vercel.app/import`
- **Cài đặt**: `https://your-app.vercel.app/settings`

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

MIT License - feel free to use this project for your store!

---

Made with ❤️ cho các cửa hàng tạp hóa Việt Nam