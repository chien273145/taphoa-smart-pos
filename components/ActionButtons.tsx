"use client";

import React, { useState } from "react";
import { Scan, Camera, CreditCard } from "lucide-react";
import CameraView from "./CameraView";
import VoiceSearch from "./VoiceSearch";

interface ActionButtonsProps {
  onAddToCart: (productId: string) => void;
  onPayment: () => void;
  isPriceCheckMode: boolean;
}

export default function ActionButtons({ onAddToCart, onPayment, isPriceCheckMode }: ActionButtonsProps) {
  const [cameraMode, setCameraMode] = useState<"barcode" | "vision" | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleBarcodeScan = () => {
    setCameraMode("barcode");
    setShowCamera(true);
  };

  const handleVisionCapture = () => {
    setCameraMode("vision");
    setShowCamera(true);
  };

  const handleCameraResult = (data: string) => {
    setShowCamera(false);
    
    if (cameraMode === "barcode") {
      // Handle barcode scan result
      console.log("Barcode scanned:", data);
      // Here you would find product by barcode and add to cart
    } else {
      // Handle AI vision result
      console.log("AI vision result:", data);
      // Here you would find product by name and add to cart
    }
    
    setCameraMode(null);
  };

  return (
    <>
      <div className="bg-white border-t p-4">
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Quét mã vạch */}
          <button 
            onClick={handleBarcodeScan}
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

      {/* Camera View Modal */}
      {showCamera && cameraMode && (
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