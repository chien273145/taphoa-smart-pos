"use client";

import { useState } from "react";
import { CartItem } from "@/lib/types";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { OrderService, Order, OrderItem } from "@/lib/supabase";

// QR Code Configuration
const BANK_ID = "MB"; // Ngân hàng MB Bank (có thể đổi)
const ACCOUNT_NO = "0123456789"; // Số tài khoản (có thể đổi)

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onPaymentComplete: () => void;
}

export default function PaymentModal({ isOpen, onClose, items, onPaymentComplete }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSaved, setOrderSaved] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });
  const { speak } = useVoiceAssistant();

  // Calculate total amount
  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Generate QR code URL dynamically
  const orderId = `DH${Date.now().toString(36).toUpperCase().slice(0, 8).toUpperCase()}`;
  const qrContent = `TAPHOA DH ${orderId}`;
  const qrCodeUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact.png?amount=${totalAmount}&addInfo=${encodeURIComponent(qrContent)}`;

  const handlePayment = async () => {
    if (isProcessing || orderSaved || items.length === 0) {
      if (items.length === 0) {
        alert('Giỏ hàng trống!');
        return;
      }
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Speak payment instructions
      speak(`Tổng thanh toán ${totalAmount.toLocaleString()} đồng. Vui lòng quét mã QR để hoàn tất.`);

      // Convert cart items to order items format
      const orderItems: OrderItem[] = items.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity
      }));

      // Prepare order data
      const orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'> = {
        total_amount: totalAmount,
        items: orderItems,
        payment_method: 'QR_TRANSFER',
        customer_info: {
          name: customerInfo.name || 'Khách hàng',
          phone: customerInfo.phone || '',
          address: customerInfo.address || '',
          notes: customerInfo.notes || ''
        },
        status: 'completed',
        notes: `QR Transfer - Mã đơn: ${orderId}`
      };

      // Save order to Supabase
      const savedOrder = await OrderService.saveOrder(orderData);

      // Show success message
      alert(`✅ Đã lưu đơn hàng #${savedOrder.id?.slice(0, 8)} thành công!\n💰 Tổng: ${totalAmount.toLocaleString()}đ\n📱 Mã QR: ${orderId}`);
      
      setOrderSaved(true);
      setIsProcessing(false);
      speak("Đã nhận tiền. Cảm ơn quý khách!");

    } catch (error) {
      console.error('Payment error:', error);
      alert('❌ Lỗi lưu đơn hàng. Vui lòng thử lại!');
      speak('Lỗi lưu đơn hàng. Vui lòng thử lại.');
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (orderSaved) {
      onPaymentComplete();
    }
    onClose();
    setIsProcessing(false);
    setOrderSaved(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Thanh Toán</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
            disabled={isProcessing}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Customer Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Thông tin khách hàng:</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Tên khách hàng"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 border rounded-lg text-sm"
              disabled={isProcessing}
            />
            <input
              type="tel"
              placeholder="Số điện thoại"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full p-2 border rounded-lg text-sm"
              disabled={isProcessing}
            />
            <textarea
              placeholder="Địa chỉ (không bắt buộc)"
              value={customerInfo.address}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
              className="w-full p-2 border rounded-lg text-sm h-16 resize-none"
              disabled={isProcessing}
            />
            <textarea
              placeholder="Ghi chú"
              value={customerInfo.notes}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full p-2 border rounded-lg text-sm h-16 resize-none"
              disabled={isProcessing}
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Đơn hàng #{orderId}</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto border rounded-lg p-3 bg-gray-50">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span>{item.product.name} x {item.quantity}</span>
                <span className="font-semibold">
                  {(item.product.price * item.quantity).toLocaleString()}đ
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total Amount */}
        <div className="border-t pt-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">Tổng cộng:</span>
            <span className="text-3xl font-bold text-green-600">
              {totalAmount.toLocaleString()}đ
            </span>
          </div>
        </div>

        {/* QR Code Display */}
        <div className="text-center mb-6">
          <div className="bg-gray-100 p-4 rounded-lg inline-block">
            {/* QR Code Image */}
            <div className="mb-3">
              <img 
                src={qrCodeUrl} 
                alt="VietQR Payment Code" 
                className="w-64 h-64 mx-auto border-2 border-gray-300 rounded-lg bg-white"
                onError={(e) => {
                  console.error('QR Code image failed to load:', e);
                  e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`
                    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                      <rect width="200" height="200" fill="#f0f0f0"/>
                      <text x="100" y="100" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="14" fill="#666">QR Error</text>
                    </svg>
                  `)}`;
                }}
              />
            </div>
            
            {/* QR Code Info */}
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Ngân hàng:</strong> {BANK_ID} Bank</p>
              <p><strong>Số tài khoản:</strong> {ACCOUNT_NO}</p>
              <p><strong>Số tiền:</strong> {totalAmount.toLocaleString()}đ</p>
              <p><strong>Nội dung:</strong> {qrContent}</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mt-2">
            Quét mã QR bằng ứng dụng ngân hàng
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="bg-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-400 transition-colors disabled:opacity-50"
          >
            Đóng
          </button>
          
          <button
            onClick={handlePayment}
            disabled={isProcessing || orderSaved}
            className="bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent border-solid animate-spin rounded-full"></div>
                <span>Đang xử lý...</span>
              </>
            ) : orderSaved ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L2 17l7-4V6a1 1 0 011-1h4a1 1 0 011 1v4M3 5H2a1 1 0 00-1 1h2a2 2 0 002 2v6a2 2 0 002 2h6a2 2 0 002-2v-4" />
                </svg>
                <span>Đã nhận tiền</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4V9a2 2 0 012-2h4a2 2 0 012-2v2" />
                </svg>
                <span>Quét mã QR</span>
              </>
            )}
          </button>
        </div>

        {/* Payment Success Message */}
        {orderSaved && (
          <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg text-center">
            <div className="text-green-800">
              <div className="text-lg font-bold mb-2">✅ Thanh toán thành công!</div>
              <div className="text-sm">
                <p>Mã đơn hàng: <strong>#{orderId}</strong></p>
                <p>Số tiền: <strong>{totalAmount.toLocaleString()}đ</strong></p>
                <p>Đã lưu vào hệ thống thành công</p>
                <p className="text-xs text-gray-600 mt-2">
                  *Sẵn sàng phục vụ khách hàng tiếp theo
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && !orderSaved && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
              <span className="text-sm text-gray-600">Đang xử lý thanh toán...</span>
              <div className="text-xs text-gray-500 mt-2">
                Vui lòng quét mã QR bằng ứng dụng ngân hàng
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}