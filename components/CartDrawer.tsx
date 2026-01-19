"use client";

import { useState, useEffect } from "react";
import { CartItem } from "@/lib/types";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveFromCart: (productId: string) => void;
  onAddToCart: (productId: string) => void;
  onClearCart: () => void;
  onPayment: () => void;
}

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  items, 
  onRemoveFromCart, 
  onAddToCart, 
  onClearCart, 
  onPayment 
}: CartDrawerProps) {
  const { speak } = useVoiceAssistant();
  const [isMounted, setIsMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const totalItems = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  if (!isOpen || !isMounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div className="relative bg-white h-full flex flex-col mt-auto">
        {/* Header */}
        <div className="bg-green-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Giỏ hàng ({totalItems})</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-green-700 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p className="text-lg">Giỏ hàng trống</p>
              <p className="text-sm mt-2">Nhấn vào sản phẩm để thêm</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-gray-50 rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">
                      {item.product.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {item.product.price.toLocaleString()}đ x {item.quantity}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onRemoveFromCart(item.product.id)}
                      className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      -
                    </button>
                    
                    <span className="font-bold text-lg w-8 text-center">
                      {item.quantity}
                    </span>
                    
                    <button
                      onClick={() => onAddToCart(item.product.id)}
                      className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        <div className="border-t p-4 bg-white">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-bold">Tổng cộng:</span>
            <span className="text-3xl font-bold text-green-600">
              {totalAmount.toLocaleString()}đ
            </span>
          </div>
          
          <div className="space-y-3">
            {items.length > 0 && (
              <button
                onClick={onClearCart}
                className="w-full bg-red-500 text-white py-3 rounded-lg font-bold hover:bg-red-600 transition-colors"
              >
                Xóa giỏ hàng
              </button>
            )}
            
            <button
              onClick={() => {
                onPayment();
                onClose();
              }}
              disabled={items.length === 0}
              className="w-full bg-green-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              THANH TOÁN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}