"use client";

"use client";

import { useState, useRef } from "react";
import { Camera, Scan, X } from "lucide-react";

interface CameraViewProps {
  mode: "barcode" | "vision";
  onCapture: (data: string) => void;
  onClose: () => void;
}

export default function CameraView({ mode, onCapture, onClose }: CameraViewProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setIsScanning(true);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCapturedImage(result);
        
        // Simulate processing delay
        setTimeout(() => {
          // Send image data to parent (for future AI processing)
          onCapture(result);
          setIsScanning(false);
        }, 1500);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const clearImage = () => {
    setCapturedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
        <h2 className="text-lg font-bold">
          {mode === "barcode" ? "Quét Mã Vạch" : "Chụp Ảnh AI"}
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Camera/Captured Image Area */}
      <div className="flex-1 relative bg-gray-800 flex items-center justify-center p-4">
        {capturedImage ? (
          // Show captured image with preview
          <div className="relative w-full h-full flex items-center justify-center">
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            
            {/* Clear image button */}
            <button
              onClick={clearImage}
              className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {isScanning && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-white">Đang xử lý...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Show camera placeholder
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
            
            <p className="text-gray-400 text-sm">Bấm nút bên dưới để mở camera</p>
          </div>
        )}

        {/* Scan overlay for barcode mode */}
        {mode === "barcode" && !capturedImage && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-32 border-2 border-green-400 rounded-lg">
              <div className="w-full h-0.5 bg-green-400 animate-pulse"></div>
            </div>
          </div>
        )}
      </div>

      {/* Capture Button */}
      <div className="bg-gray-900 p-4 flex justify-center">
        <button
          onClick={triggerCamera}
          disabled={isScanning}
          className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {capturedImage ? (
            // Show retake icon when image is captured
            <svg className="w-10 h-10 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ) : (
            // Show camera icon when no image
            <Camera className="w-10 h-10 text-gray-800" />
          )}
        </button>
      </div>
    </div>
  );
}