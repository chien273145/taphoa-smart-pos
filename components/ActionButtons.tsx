"use client";

import React, { useState } from "react";
import { Scan, Camera, CreditCard } from "lucide-react";
import CameraView from "./CameraView";
import VoiceSearch from "./VoiceSearch";
import SimpleBarcodeScanner from "./SimpleBarcodeScanner";

interface ActionButtonsProps {
  onAddToCart: (productId: string) => void;
  onPayment: () => void;
  isPriceCheckMode: boolean;
}

export default function ActionButtons({ onAddToCart, onPayment, isPriceCheckMode }: ActionButtonsProps) {
  const [cameraMode, setCameraMode] = useState<"barcode" | "vision" | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleVisionCapture = () => {
    setCameraMode("vision");
    setShowCamera(true);
  };

  const handleCameraResult = (data: string) => {
    setShowCamera(false);
    
    if (cameraMode === "vision") {
      // Handle AI vision result
      console.log("👁️ AI vision result:", data);
      // TODO: Find product by name and add to cart
      // const product = findProductByName(data);
      // if (product) onAddToCart(product.id);
    }
    
    setCameraMode(null);
  };

  return (
    <>
      <div className="bg-white border-t p-4">
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Quét mã vạch */}
          <button 
            onClick={() => {
              const input = document.getElementById('barcode-scanner-input') as HTMLInputElement;
              if (input) input.click();
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white py-6 px-4 rounded-lg font-bold text-lg transition-colors flex flex-col items-center space-y-2"
          >
            <Scan className="w-8 h-8" />
            <span>QUÉT MÃ VẠCH</span>
            <span className="text-xs opacity-75">Hàng có mã</span>
          </button>

          {/* Chụp ảnh AI */}
          <button 
            onClick={handleVisionCapture}
            className="bg-purple-500 hover:bg-purple-600 text-white py-6 px-4 rounded-lg font-bold text-lg transition-colors flex flex-col items-center space-y-2"
          >
            <Camera className="w-8 h-8" />
            <span>CHỤP ẢNH AI</span>
            <span className="text-xs opacity-75">Rau, củ, không mã</span>
          </button>

          {/* Nói tên */}
          <div className="bg-orange-500 hover:bg-orange-600 text-white py-6 px-4 rounded-lg font-bold text-lg transition-colors flex flex-col items-center space-y-2">
            <VoiceSearch 
              onProductFound={onAddToCart} 
              isPriceCheckMode={isPriceCheckMode}
            />
          </div>
        </div>

        {/* Thanh toán button */}
        <button
          onClick={onPayment}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-bold text-lg transition-colors flex items-center justify-center space-x-3"
        >
          <CreditCard className="w-6 h-6" />
          <span>THANH TOÁN</span>
        </button>
      </div>

      {/* Hidden Barcode Scanner with iOS-compatible input */}
      <div style={{ opacity: 0, position: 'absolute', zIndex: -1, width: '1px', height: '1px', overflow: 'hidden' }}>
        <input
          id="barcode-scanner-input"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && file.type.startsWith('image/')) {
              // Simulate barcode detection
              setTimeout(() => {
                const mockBarcode = "8938501012345";
                console.log("🔍 Barcode scanned:", mockBarcode);
                
                // Try to find product by barcode (mock implementation)
                const mockProductId = "prod-001"; // This would be found by barcode lookup
                onAddToCart(mockProductId);
                
                // Show success message
                const successMsg = document.createElement('div');
                successMsg.textContent = '✅ Đã quét mã vạch: ' + mockBarcode;
                Object.assign(successMsg.style, {
                  position: 'fixed',
                  top: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#10b981',
                  color: 'white',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  zIndex: '9999',
                  fontSize: '16px'
                });
                document.body.appendChild(successMsg);
                
                setTimeout(() => {
                  if (successMsg.parentNode) {
                    successMsg.parentNode.removeChild(successMsg);
                  }
                }, 3000);
              }, 1500);
            }
          }}
        />
      </div>

      {/* Camera View Modal */}
      {showCamera && cameraMode && cameraMode === "vision" && (
        <CameraView
          mode={cameraMode}
          onCapture={handleCameraResult}
          onClose={() => {
            setShowCamera(false);
            setCameraMode(null);
          }}
        />
      )}
    </>
  );
}