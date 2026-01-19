"use client";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4">
        <h1 className="text-xl font-bold text-center">Cài đặt</h1>
      </div>

      {/* Settings Content */}
      <div className="p-4 space-y-4">
        {/* Store Settings */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4">Cửa hàng</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Tên cửa hàng</label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg"
                defaultValue="Tạp Hóa Smart POS"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Địa chỉ</label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg"
                placeholder="Nhập địa chỉ cửa hàng"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Số điện thoại</label>
              <input
                type="tel"
                className="w-full p-3 border rounded-lg"
                placeholder="Nhập số điện thoại"
              />
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4">Thanh toán</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Mã ngân hàng</label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg"
                defaultValue="970422"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Số tài khoản</label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg"
                defaultValue="123456789"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Chủ tài khoản</label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg"
                placeholder="Nhập tên chủ tài khoản"
              />
            </div>
          </div>
        </div>

        {/* Voice Settings */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4">Giọng nói</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Bật phản hồi giọng nói</span>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-500">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tốc độ nói</span>
              <select className="p-2 border rounded-lg" defaultValue="Bình thường">
                <option>Chậm</option>
                <option>Bình thường</option>
                <option>Nhanh</option>
              </select>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4">Về ứng dụng</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Phiên bản: 1.0.0</p>
            <p>Tạp Hóa Smart POS</p>
            <p>Hệ thống POS thông minh cho cửa hàng tạp hóa</p>
          </div>
        </div>
      </div>
    </div>
  );
}