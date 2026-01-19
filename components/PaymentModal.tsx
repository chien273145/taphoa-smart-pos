"use client";

import { useState } from "react";
import { CartItem } from "@/lib/types";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onPaymentComplete: () => void;
}

export default function PaymentModal({ isOpen, onClose, items, onPaymentComplete }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { speak } = useVoiceAssistant();

  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // VietQR API - Using demo bank info (replace with real bank info)
  const bankId = "970422"; // Example: TPBank
  const accountNo = "123456789"; // Replace with real account number
  const qrCodeUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact.png?amount=${totalAmount}`;

  const handlePayment = () => {
    setIsProcessing(true);
    
    // Speak payment amount
    speak(`Tổng thanh toán ${totalAmount.toLocaleString()} đồng. Vui lòng quét mã QR`);

    // Auto complete after 5 seconds
    setTimeout(() => {
      speak("Cảm ơn quý khách");
      onPaymentComplete();
      setIsProcessing(false);
      onClose();
    }, 5000);
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

        {/* Order Summary */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Đơn hàng:</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
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
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-400 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="flex-1 bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {isProcessing ? "Đang xử lý..." : "Xác nhận thanh toán"}
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