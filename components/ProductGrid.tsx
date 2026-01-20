"use client";

import { useState, useEffect } from "react";
import { Product } from "@/lib/types";
import { useProducts } from "@/lib/products";

interface ProductGridProps {
  products: Product[];
  onAddToCart: (productId: string) => void;
}

export default function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  const [mounted, setMounted] = useState(false);
  const { products: dbProducts, loading, error } = useProducts();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state while fetching products
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent border-solid animate-spin rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <div className="text-lg font-bold mb-2">⚠️ Lỗi tải sản phẩm</div>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Show products grid when loaded
  const displayProducts = dbProducts.length > 0 ? dbProducts : products;
  
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 lg:gap-4">
      {displayProducts.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-lg shadow-sm p-3 cursor-pointer hover:shadow-md transition-shadow active:scale-95 transform"
          onClick={() => {
            console.log('Adding to cart:', product.name);
            onAddToCart(product.id);
          }}
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