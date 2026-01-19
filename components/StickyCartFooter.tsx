"use client";

import { CartItem } from "@/lib/types";

interface StickyCartFooterProps {
  items: CartItem[];
  onOpenCart: () => void;
}

export default function StickyCartFooter({ items, onOpenCart }: StickyCartFooterProps) {
  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const totalItems = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 z-30 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{totalItems} món</span>
            <span className="text-gray-400">•</span>
            <span className="text-xl font-bold text-gray-800">
              {totalAmount.toLocaleString()}đ
            </span>
          </div>
        </div>
        
        <button
          onClick={onOpenCart}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold text-lg transition-colors flex items-center space-x-2"
        >
          <span>THANH TOÁN</span>
          {totalItems > 0 && (
            <span className="bg-white text-green-500 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}