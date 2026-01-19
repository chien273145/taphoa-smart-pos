"use client";

import { useState, useRef } from "react";
import { X } from "lucide-react";

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBarcodeDetected: (barcode: string) => void;
}

export default function BarcodeScannerModal({ isOpen, onClose, onBarcodeDetected }: BarcodeScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Play beep sound
  const playBeep = () => {
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
  };

  const startScanning = async () => {
    try {
      setIsScanning(true);
      setError(null);

      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Initialize ZXing barcode scanner
      const { BrowserMultiFormatReader } = await import('@zxing/library');
      const codeReader = new BrowserMultiFormatReader();
      
      // Start continuous scanning
      try {
        codeReader.decodeFromVideoDevice(undefined, 'video', (result: any) => {
        if (result) {
          playBeep();
          onBarcodeDetected(result.text);
          
          // Stop camera
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
          
          setIsScanning(false);
          onClose();
        }
      }, (err) => {
        console.error('Barcode scanning error:', err);
        setError('Không thể quét mã vạch. Vui lòng thử lại.');
        setIsScanning(false);
      });

    } catch (err) {
      console.error('Camera access error:', err);
      setError('Không thể truy cập camera. Vui lòng kiểm tra quyền.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    // Stop video stream
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsScanning(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-lg font-bold">Quét Mã Vạch</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera View */}
        <div className="flex-1 relative bg-black">
          {!isScanning && !error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <svg className="w-16 h-16 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <p className="mb-4">Bấm nút bên dưới để bắt đầu quét</p>
                <button
                  onClick={startScanning}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                >
                  Bắt đầu quét
                </button>
              </div>
            </div>
          )}

          {isScanning && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          )}

          {isScanning && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-64 h-32 border-2 border-yellow-400 rounded-lg">
                  <div className="w-full h-0.5 bg-yellow-400 animate-pulse"></div>
                </div>
              </div>
              <p className="absolute bottom-4 left-0 right-0 text-center text-white">
                Đưa mã vạch vào khung vàng
              </p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white p-4">
                <svg className="w-16 h-16 mb-4 mx-auto text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M12 8h.01" />
                </svg>
                <p className="mb-4">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    startScanning();
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-4 rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-bold transition-colors"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}