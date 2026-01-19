"use client";

import { useState, useEffect } from "react";
import { Mic } from "lucide-react";

interface VoiceSearchMobileProps {
  onProductFound: (productId: string) => void;
}

export default function VoiceSearchMobile({ onProductFound }: VoiceSearchMobileProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Check if browser supports speech recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        const recognition = new SpeechRecognition();
        
        // Configure recognition
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "vi-VN"; // Vietnamese language
        
        // Handle results
        recognition.onresult = (event: any) => {
          let finalTranscript = "";
          let interimTranscript = "";
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0] ? result[0].transcript : "";
            
            if (result.isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          setTranscript(finalTranscript || interimTranscript);
        };
        
        // Handle errors
        recognition.onerror = (event: any) => {
          console.log("Speech recognition event:", event.error);
          
          // Don't show error for "no-speech" - it's normal when user doesn't speak
          if (event.error === "no-speech") {
            console.log("No speech detected - user didn't speak or microphone issue");
          } else {
            console.error("Speech recognition error:", event.error);
          }
          
          setIsListening(false);
        };
        
        // Handle end
        recognition.onend = () => {
          setIsListening(false);
        };
        
        // Store recognition in ref for cleanup
        (window as any).voiceRecognitionInstance = recognition;
      } else {
        setIsSupported(false);
        // iOS Safari specific error
        alert("Lỗi: iPhone của bạn không hỗ trợ tính năng này. Vui lòng dùng tính năng gõ tay hoặc Quét mã vạch.");
      }
    }
  }, []);

  const handleVoiceInput = () => {
    if (!isSupported) {
      alert("Lỗi: Trình duyệt của bạn không hỗ trợ nhận diện giọng nói. Vui lòng dùng Chrome hoặc Android.");
      return;
    }

    if (isListening) {
      // Stop listening
      if ((window as any).voiceRecognitionInstance) {
        (window as any).voiceRecognitionInstance.stop();
      }
      setIsListening(false);
    } else {
      // Start listening
      setTranscript("");
      if ((window as any).voiceRecognitionInstance) {
        (window as any).voiceRecognitionInstance.start();
        setIsListening(true);
      }
    }
  };

  // Process transcript when voice input ends
  useEffect(() => {
    if (transcript && !isListening && !isProcessing && transcript.trim().length > 0) {
      setIsProcessing(true);
      
      // Search for product by name (mock data)
      const products = [
        { id: "1", name: "Bia 333", price: 12000 },
        { id: "2", name: "Bia Tiger", price: 14000 },
        { id: "3", name: "Coca Cola 330ml", price: 8000 },
        { id: "4", name: "Pepsi 330ml", price: 8000 },
        { id: "5", name: "Nước đóng chai Lavie 1.5L", price: 10000 },
      ];
      
      const product = products.find(p => 
        p.name.toLowerCase().includes(transcript.toLowerCase()) ||
        transcript.toLowerCase().includes(p.name.toLowerCase())
      );
      
      if (product) {
        console.log("Tìm thấy sản phẩm:", product.name);
        onProductFound(product.id);
        
        // Fill search box with result
        const searchBox = document.getElementById("search-box") as HTMLInputElement;
        if (searchBox) {
          searchBox.value = product.name;
          searchBox.focus();
        }
      } else {
        console.log("Không tìm thấy sản phẩm:", transcript);
      }
      
      // Reset after processing
      setTimeout(() => {
        setIsProcessing(false);
        setTranscript("");
      }, 2000);
    }
  }, [transcript, isListening, isProcessing, onProductFound]);

  const getButtonClass = () => {
    if (!isSupported) {
      return "bg-gray-400 text-white opacity-50 cursor-not-allowed";
    }
    if (isListening) {
      return "bg-red-500 animate-pulse text-white";
    }
    if (isProcessing) {
      return "bg-yellow-500 text-white";
    }
    return "bg-orange-500 hover:bg-orange-600 text-white";
  };

  const getButtonText = () => {
    if (!isSupported) {
      return "Không hỗ trợ";
    }
    if (isSupported && !isListening && !isProcessing) {
      return "NÓI TÊN";
    }
    if (isListening) {
      return "🔴 Đang nghe...";
    }
    return "🔄 Đang xử lý...";
  };

  return (
    <div className="relative">
      {/* Search box for result display */}
      <div className="mb-4">
        <input
          id="search-box"
          type="text"
          placeholder="Tìm sản phẩm..."
          className="w-full p-3 border rounded-lg text-lg"
          readOnly
          value={transcript ? `Đã nghe: "${transcript}" : ""}
        />
      </div>

      {/* Voice button */}
      <button
        onClick={handleVoiceInput}
        className={
          getButtonClass() + " w-full transition-colors flex items-center justify-center space-x-3 p-4 rounded-lg font-bold text-lg"
        }
        disabled={!isSupported}
      >
        <Mic className="w-6 h-6" />
        <span>{getButtonText()}</span>
      </button>
      
      {/* Visual transcript feedback */}
      {transcript && transcript.trim() && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 text-white p-2 rounded-lg text-center z-50">
          <p className="text-sm">Đã nghe: "{transcript}"</p>
        </div>
      )}
    </div>
  );
}