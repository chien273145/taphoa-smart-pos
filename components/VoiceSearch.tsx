"use client";

import React, { useState } from "react";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { findProductByName } from "@/lib/mockData";
import { Mic } from "lucide-react";

interface VoiceSearchProps {
  onProductFound: (productId: string) => void;
  isPriceCheckMode: boolean;
}

export default function VoiceSearch({ onProductFound, isPriceCheckMode }: VoiceSearchProps) {
  const { isListening, isSupported, startListening, stopListening, speak, transcript } = useVoiceAssistant();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Process transcript when voice input ends
  React.useEffect(() => {
    if (transcript && !isListening) {
      setIsProcessing(true);
      
      // Search for product by name
      const product = findProductByName(transcript);
      
      if (product) {
        const message = isPriceCheckMode 
          ? `${product.name}, giá ${product.price.toLocaleString()} đồng`
          : `Đã thêm ${product.name}, ${product.price.toLocaleString()} đồng`;
        
        speak(message);
        
        if (!isPriceCheckMode) {
          onProductFound(product.id);
        }
      } else {
        speak(`Không tìm thấy sản phẩm ${transcript}`);
      }
      
      setIsProcessing(false);
    }
  }, [transcript, isListening, isPriceCheckMode, speak, onProductFound]);

  if (!isSupported) {
    return (
      <button 
        disabled
        className="bg-gray-400 text-white py-6 px-4 rounded-lg font-bold text-lg opacity-50 cursor-not-allowed flex flex-col items-center space-y-2"
      >
        <Mic className="w-8 h-8" />
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
        } text-white py-6 px-4 rounded-lg font-bold text-lg transition-colors flex flex-col items-center space-y-2`}
      >
        <Mic className="w-8 h-8" />
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
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 text-white p-2 rounded-lg text-center">
          <p className="text-sm">{transcript}</p>
        </div>
      )}
    </div>
  );
}