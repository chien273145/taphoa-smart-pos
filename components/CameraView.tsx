"use client";

import React, { useState } from "react";
import { Camera, Scan } from "lucide-react";

interface CameraViewProps {
  mode: "barcode" | "vision";
  onCapture: (data: string) => void;
  onClose: () => void;
}

export default function CameraView({ mode, onCapture, onClose }: CameraViewProps) {
  const [isScanning, setIsScanning] = useState(false);

  // Simulate camera capture
  const handleCapture = () => {
    setIsScanning(true);
    
    setTimeout(() => {
      // Simulate different results based on mode
      if (mode === "barcode") {
        onCapture("8938501012345"); // Simulate barcode
      } else {
        onCapture("Bia 333"); // Simulate AI vision result
      }
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
        <h2 className="text-lg font-bold">
          {mode === "barcode" ? "Quét Mã Vạch" : "Chụp Ảnh AI"}
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded-full"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Camera Preview */}
      <div className="flex-1 relative bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          {mode === "barcode" ? (
            <Scan className="w-24 h-24 text-white mb-4 mx-auto" />
          ) : (
            <Camera className="w-24 h-24 text-white mb-4 mx-auto" />
          )}
          
          <p className="text-white mb-4">
            {mode === "barcode" 
              ? "Đưa mã vạch vào khung hình" 
              : "Chụp ảnh sản phẩm để AI nhận diện"
            }
          </p>

          {isScanning && (
            <div className="animate-pulse">
              <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto"></div>
              <p className="text-white mt-2">Đang xử lý...</p>
            </div>
          )}
        </div>

        {/* Scan Overlay */}
        {mode === "barcode" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-32 border-2 border-green-400 rounded-lg">
              <div className="w-full h-0.5 bg-green-400 animate-pulse"></div>
            </div>
          </div>
        )}
      </div>

      {/* Capture Button */}
      <div className="bg-gray-900 p-4 flex justify-center">
        <button
          onClick={handleCapture}
          disabled={isScanning}
          className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {mode === "barcode" ? (
            <Scan className="w-10 h-10 text-gray-800" />
          ) : (
            <Camera className="w-10 h-10 text-gray-800" />
          )}
        </button>
      </div>
    </div>
  );
}