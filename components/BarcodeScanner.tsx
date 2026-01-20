"use client";

import { useState, useRef } from "react";
import { Camera, Upload, CheckCircle } from "lucide-react";

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
  className?: string;
}

export default function BarcodeScanner({ onBarcodeDetected, className = "" }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setIsScanning(true);
      setCapturedImage(URL.createObjectURL(file));
      
      // Simulate barcode scanning
      setTimeout(() => {
        // Generate mock barcode for demo
        const mockBarcode = "8901234567890";
        onBarcodeDetected(mockBarcode);
        setIsScanning(false);
        
        // Play beep sound
        playBeep();
      }, 1500);
    }
  };

  const playBeep = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 1000;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (err) {
      console.log('Could not play beep sound:', err);
    }
  };

  const triggerScan = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <button
        onClick={triggerScan}
        disabled={isScanning}
        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg text-lg flex items-center justify-center space-x-3 transition-all"
      >
        {isScanning ? (
          <>
            <div className="w-6 h-6 border-2 border-white border-t-transparent border-solid animate-spin rounded-full"></div>
            <span>ĐANG QUÉT...</span>
          </>
        ) : (
          <>
            <Camera className="w-6 h-6" />
            <span>📷 QUÉT MÃ VẠCH</span>
          </>
        )}
      </button>
      
      {capturedImage && (
        <div className="mt-3 relative">
          <img 
            src={capturedImage} 
            alt="Scanned barcode" 
            className="w-full h-32 object-cover rounded-lg border-2 border-green-300"
          />
          <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      )}
    </div>
  );
}