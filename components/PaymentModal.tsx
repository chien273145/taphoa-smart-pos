"use client";

import { useState } from "react";
import { CartItem } from "@/lib/types";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { OrderService, Order, OrderItem } from "@/lib/supabase";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onPaymentComplete: () => void;
}

export default function PaymentModal({ isOpen, onClose, items, onPaymentComplete }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });
  const { speak } = useVoiceAssistant();

  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // VietQR API - Using demo bank info (replace with real bank info)
  const bankId = "970422"; // Example: TPBank
  const accountNo = "123456789"; // Replace with real account number
  const qrCodeUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact.png?amount=${totalAmount}`;

  const handlePayment = async () => {
    if (items.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Speak payment amount
      speak(`Tổng thanh toán ${totalAmount.toLocaleString()} đồng. Vui lòng quét mã QR`);

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
          name: customerInfo.name || 'Khách vãng lai',
          phone: customerInfo.phone || '',
          address: customerInfo.address || '',
          notes: customerInfo.notes || ''
        },
        status: 'completed',
        notes: customerInfo.notes || ''
      };

      // Save order to Supabase
      const savedOrder = await OrderService.saveOrder(orderData);

      // Show success message
      alert(`✅ Đã lưu đơn hàng #${savedOrder.id?.slice(0, 8)} thành công!\n💰 Tổng: ${totalAmount.toLocaleString()}đ`);

      // Call onPaymentComplete to clear cart
      speak("Cảm ơn quý khách. Đơn hàng đã được lưu.");
      onPaymentComplete();
      onClose();

    } catch (error) {
      console.error('Payment error:', error);
      alert('❌ Lỗi lưu đơn hàng. Vui lòng thử lại!');
      speak('Lỗi lưu đơn hàng. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickPayment = () => {
    // Quick payment without customer info
    setCustomerInfo({
      name: 'Khách vãng lai',
      phone: '',
      address: '',
      notes: ''
    });
    handlePayment();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Thanh Toán</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
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
          <h3 className="text-lg font-semibold mb-3">Đơn hàng:</h3>
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

        {/* QR Code */}
        <div className="text-center mb-6">
          <div className="bg-gray-100 p-4 rounded-lg inline-block">
            <img 
              src={qrCodeUrl} 
              alt="VietQR Payment Code" 
              className="w-48 h-48 mx-auto"
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Quét mã QR để thanh toán
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="bg-gray-300 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-400 transition-colors disabled:opacity-50 text-sm"
          >
            Hủy
          </button>
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="bg-blue-500 text-white py-2 rounded-lg font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm"
          >
            {isProcessing ? "Đang lưu..." : "Lưu đơn"}
          </button>
          <button
            onClick={handleQuickPayment}
            disabled={isProcessing}
            className="bg-green-500 text-white py-2 rounded-lg font-bold hover:bg-green-600 transition-colors disabled:opacity-50 text-sm"
          >
            {isProcessing ? "Đang xử lý..." : "Khách lala"}
          </button>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
              <span className="text-sm text-gray-600">Chờ thanh toán...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}