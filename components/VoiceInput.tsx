"use client";

import { useState, useEffect } from "react";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { mockProducts, findProductByName } from "@/lib/mockData";

interface VoiceInputProps {
  onProductFound: (productId: string) => void;
}

"use client";

export default function VoiceInput({ onProductFound }: VoiceInputProps) {
  const { isListening, isSupported, startListening, stopListening, speak, transcript } = useVoiceAssistant();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedTranscript, setProcessedTranscript] = useState("");

  useEffect(() => {
    if (transcript && !isListening && transcript !== processedTranscript) {
      setIsProcessing(true);
      setProcessedTranscript(transcript); // Mark as processed
      
      // Search for product by name
      const product = findProductByName(transcript);
      
      if (product) {
        speak(`Đã thêm ${product.name}, ${product.price.toLocaleString()} đồng`);
        onProductFound(product.id);
      } else {
        speak(`Không tìm thấy sản phẩm ${transcript}`);
      }
      
      setIsProcessing(false);
    }
  }, [transcript, isListening, onProductFound, speak, processedTranscript]);

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <button 
        disabled
        className="bg-gray-400 text-white py-6 px-4 rounded-lg font-bold text-lg opacity-50 cursor-not-allowed flex flex-col items-center space-y-2"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        <span>NÓI</span>
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
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        <span>NÓI</span>
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