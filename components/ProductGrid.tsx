"use client";

import { useState, useEffect } from "react";
import { Product } from "@/lib/types";

interface ProductGridProps {
  products: Product[];
  onAddToCart: (productId: string) => void;
}

export default function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 lg:gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-sm p-3 cursor-pointer hover:shadow-md transition-shadow active:scale-95 transform"
          >
            {/* Product Image Placeholder */}
            <div className="w-full h-24 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
              <span className="text-gray-500 text-xs">Ảnh</span>
            </div>
            
            {/* Product Info */}
            <h3 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-2 min-h-[2.5rem]">
              {product.name}
            </h3>
            
            <p className="text-xl font-bold text-green-600 mb-1">
              {product.price}đ
            </p>
            
            <p className="text-xs text-gray-600 mb-1">
              {product.category}
            </p>
            
            {product.barcode && (
              <p className="text-xs text-gray-500 truncate">
                {product.barcode}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 lg:gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-lg shadow-sm p-3 cursor-pointer hover:shadow-md transition-shadow active:scale-95 transform"
          onClick={() => onAddToCart(product.id)}
        >
          {/* Product Image Placeholder */}
          <div className="w-full h-24 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
            <span className="text-gray-500 text-xs">Ảnh</span>
          </div>
          
          {/* Product Info */}
          <h3 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          
          <p className="text-xl font-bold text-green-600 mb-1">
            {mounted ? product.price.toLocaleString() : product.price}đ
          </p>
          
          <p className="text-xs text-gray-600 mb-1">
            {product.category}
          </p>
          
          {product.barcode && (
            <p className="text-xs text-gray-500 truncate">
              {product.barcode}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}