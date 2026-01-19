"use client";

import { useState, useEffect } from "react";
import { Mic } from "lucide-react";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { findProductByName } from "@/lib/mockData";

interface VoiceSearchProps {
  onProductFound: (productId: string) => void;
  isPriceCheckMode?: boolean;
}

export default function VoiceSearch({ onProductFound, isPriceCheckMode = false }: VoiceSearchProps) {
  const { isListening, isSupported, transcript, startListening, stopListening, resetTranscript } = useVoiceInput();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Process transcript when voice input ends
  useEffect(() => {
    if (transcript && !isListening && !isProcessing) {
      setIsProcessing(true);
      
      // Search for product by name
      const product = findProductByName(transcript);
      
      if (product) {
        console.log(`Tìm thấy sản phẩm: ${product.name}`);
        onProductFound(product.id);
      } else {
        console.log(`Không tìm thấy sản phẩm: ${transcript}`);
      }
      
      // Reset after processing
      setTimeout(() => {
        setIsProcessing(false);
        resetTranscript();
      }, 1000);
    }
  }, [transcript, isListening, isProcessing, onProductFound, resetTranscript]);

  if (!isSupported) {
    return (
      <button 
        disabled
        className="bg-gray-400 text-white py-6 px-4 rounded-lg font-bold text-lg opacity-50 cursor-not-allowed flex flex-col items-center space-y-2 h-12 min-h-[48px]"
      >
        <Mic className="w-6 h-6" />
        <span>NÓI TÊN</span>
        <span className="text-xs">Không hỗ trợ</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleVoiceInput}
        className={`${
          isListening 
            ? "bg-red-500 animate-pulse" 
            : isProcessing 
              ? "bg-yellow-500" 
              : "bg-orange-500 hover:bg-orange-600"
        } text-white py-6 px-4 rounded-lg font-bold text-lg transition-colors flex flex-col items-center space-y-2 h-12 min-h-[48px]`}
      >
        <Mic className="w-6 h-6" />
        <span>NÓI TÊN</span>
        {isListening && (
          <span className="text-xs animate-pulse">Đang nghe...</span>
        )}
        {isProcessing && (
          <span className="text-xs">Đang xử lý...</span>
        )}
      </button>
      
      {/* Show transcript when listening */}
      {transcript && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 text-white p-2 rounded-lg text-center z-50">
          <p className="text-sm">Đã nghe thấy: "{transcript}"</p>
        </div>
      )}
    </div>
  );
}