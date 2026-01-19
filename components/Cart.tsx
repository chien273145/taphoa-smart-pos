"use client";

import { useState, useEffect } from "react";
import { CartItem } from "@/lib/types";

interface CartProps {
  items: CartItem[];
  onRemoveFromCart: (productId: string) => void;
  onAddToCart: (productId: string) => void;
  onClearCart: () => void;
}

export default function Cart({ items, onRemoveFromCart, onAddToCart, onClearCart }: CartProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render until client-side hydration is complete
  if (!isMounted) {
    return (
      <div className="h-full flex flex-col">
        <div className="bg-green-600 text-white p-4">
          <h2 className="text-xl font-bold">Giỏ hàng</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      </div>
    );
  }

  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const totalItems = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div className="h-full flex flex-col">
      {/* Cart Header */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Giỏ hàng ({totalItems})</h2>
          {items.length > 0 && (
            <button
              onClick={onClearCart}
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors flex items-center space-x-1"
              title="Xóa giỏ hàng"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="text-sm font-medium">Xóa</span>
            </button>
          )}
        </div>
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
                    className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    -
                  </button>
                  
                  <span className="font-bold text-lg w-8 text-center">
                    {item.quantity}
                  </span>
                  
                  <button
                    onClick={() => onAddToCart(item.product.id)}
                    className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
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
        
        {items.length > 0 && (
          <div className="flex space-x-2">
            <button
              onClick={onClearCart}
              className="flex-1 bg-red-500 text-white py-3 rounded-lg font-bold hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Xóa giỏ hàng</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}