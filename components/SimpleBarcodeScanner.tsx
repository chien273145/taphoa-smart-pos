"use client";

import { useState, useEffect } from "react";
import { Scan } from "lucide-react";

interface SimpleBarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
}

export default function SimpleBarcodeScanner({ onBarcodeDetected }: SimpleBarcodeScannerProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Play beep sound when barcode detected
  const playBeep = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 1000; // 1000Hz beep
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1); // 100ms beep
    } catch (err) {
      console.log('Could not play beep sound:', err);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCapturedImage(result);
        
        // Simulate barcode detection after 2 seconds
        setTimeout(() => {
          const mockBarcode = "8938501012345"; // Simulate detected barcode
          playBeep();
          onBarcodeDetected(mockBarcode);
          
          alert('Đã quét mã vạch: 8938501012345');
        }, 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerCamera = () => {
    const input = document.getElementById('camera-input') as HTMLInputElement;
    if (input) {
      input.click();
    }
  };

  return (
    <div className="relative">
      {/* Hidden file input for camera */}
      <input
        id="camera-input"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Camera/Preview area */}
      {capturedImage ? (
        <div className="space-y-4">
          <div className="relative bg-gray-900 rounded-lg p-4">
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="w-full h-48 object-contain rounded-lg mb-3"
            />
            
            <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-lg">
              <div className="flex items-center space-x-2">
                <Scan className="w-4 h-4" />
                <span className="text-sm font-bold">Đã quét mã vạch</span>
              </div>
            </div>

            <p className="text-white text-center text-lg mb-3">
              8938501012345
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setCapturedImage(null)}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-bold transition-colors"
            >
              Chụp lại
            </button>
            
            <button
              onClick={triggerCamera}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-bold transition-colors"
            >
              Quét mã khác
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Scan className="w-16 h-16 text-gray-600 mb-2" />
          </div>
          
          <p className="text-gray-600 mb-4">
            Bấm nút bên dưới để mở camera
          </p>
          
          <button
            onClick={triggerCamera}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
          >
            Mở Camera
          </button>
        </div>
      )}
    </div>
  );
}