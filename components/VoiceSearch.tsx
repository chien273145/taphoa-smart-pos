"use client";

import { useState, useEffect } from "react";
import { Mic } from "lucide-react";
import { mockProducts } from "@/lib/mockData";

interface VoiceSearchProps {
  onProductFound: (productId: string) => void;
  isPriceCheckMode?: boolean;
}

// iOS-compatible interface for Speech Recognition
declare global {
  interface IWindow extends Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default function VoiceSearch({ onProductFound, isPriceCheckMode = false }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // iOS-compatible Speech Recognition initialization
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognitionAPI) {
        setIsSupported(true);
        const recognitionInstance = new SpeechRecognitionAPI();
        setRecognition(recognitionInstance);
        
        // Configure for iOS Safari compatibility
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = "vi-VN";
        recognitionInstance.maxAlternatives = 1;
        
        recognitionInstance.onresult = (event: any) => {
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
        
        recognitionInstance.onerror = (event: any) => {
          console.log("Speech recognition error:", event.error);
          
          if (event.error === "no-speech") {
            console.log("No speech detected - user didn't speak or microphone issue");
          } else if (event.error === "not-allowed") {
            alert("❌ Microphone bị từ chối. Vui lòng vào Settings > Safari > Microphone và cho phép truy cập.");
          } else if (event.error === "network") {
            alert("❌ Lỗi mạng. Vui lòng kiểm tra kết nối internet và thử lại.");
          } else {
            alert("❌ Lỗi nhận diện giọng nói: " + event.error);
          }
          
          setIsListening(false);
        };
        
        recognitionInstance.onend = () => {
          setIsListening(false);
        };
      } else {
        setIsSupported(false);
        // More helpful error message for iOS users
        if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
          alert("⚠️ Trình duyệt không hỗ trợ nhận diện giọng nói.\n📝 Gợi ý: Dùng Safari trên iOS 13+ và đảm bảo đã cấp quyền Microphone.");
        } else {
          alert("Lỗi: Trình duyệt của bạn không hỗ trợ nhận diện giọng nói. Vui lòng dùng Chrome hoặc Android.");
        }
      }
    }
  }, []);

  const handleVoiceInput = () => {
    if (!isSupported) {
      alert("Trình duyệt không hỗ trợ nhận diện giọng nói. Vui lòng dùng Safari trên iOS 13+ hoặc Chrome trên Android.");
      return;
    }

    if (isListening && recognition) {
      // Use abort instead of stop for better error handling
      try {
        recognition.abort();
      } catch (e) {
        // Ignore abort errors
      }
      setIsListening(false);
    } else {
      // Check if we have HTTPS (required for iOS) - allow tunnel domains
      const isLocalhost = location.hostname === 'localhost';
      const isLocalTunnel = location.hostname.includes('.loca.lt') || 
                           location.hostname.includes('.ngrok.io') ||
                           location.hostname.includes('.ngrok-free.app') ||
                           location.hostname.includes('.tunnelto.dev');
      
      if (location.protocol !== 'https:' && !isLocalhost && !isLocalTunnel) {
        alert("❌ Cần kết nối HTTPS để sử dụng micro trên iOS.\n\n📝 Giải pháp:\n1. Dùng: https://taphoa-pos-3973.loca.lt\n2. Hoặc: http://localhost:3000");
        return;
      }
      
      // Force cleanup any existing recognition
      try {
        if (recognition) {
          recognition.abort();
        }
      } catch (e) {
        // Ignore abort errors
      }
      
      setTranscript("");
      try {
        // Small delay to ensure clean state
        setTimeout(() => {
          try {
            recognition.start();
            setIsListening(true);
          } catch (error) {
            console.error("Failed to start recognition:", error);
            setIsListening(false);
            alert("❌ Không thể khởi động nhận diện giọng nói. Vui lòng làm mới trang và thử lại.");
          }
        }, 100);
      } catch (error) {
        console.error("Failed to prepare recognition:", error);
        alert("❌ Không thể khởi động nhận diện giọng nói. Vui lòng làm mới trang và thử lại.");
      }
    }
  };

  useEffect(() => {
    if (transcript && !isListening && !isProcessing && transcript.trim().length > 0) {
      setIsProcessing(true);
      
      const product = mockProducts.find(p => 
        p.name.toLowerCase().includes(transcript.toLowerCase()) ||
        transcript.toLowerCase().includes(p.name.toLowerCase())
      );
      
      if (product) {
        console.log("Tìm thấy sản phẩm:", product.name);
        onProductFound(product.id);
      } else {
        console.log("Không tìm thấy sản phẩm:", transcript);
      }
      
      setTimeout(() => {
        setIsProcessing(false);
        setTranscript("");
      }, 2000);
    }
  }, [transcript, isListening, isProcessing, onProductFound]);

  const getButtonClass = () => {
    if (!isSupported) {
      return "bg-gray-400 text-white opacity-50 cursor-not-allowed w-full transition-colors flex items-center justify-center space-x-3 p-4 rounded-lg font-bold text-lg";
    }
    if (isListening) {
      return "bg-red-500 animate-pulse text-white w-full transition-colors flex items-center justify-center space-x-3 p-4 rounded-lg font-bold text-lg";
    }
    if (isProcessing) {
      return "bg-yellow-500 text-white w-full transition-colors flex items-center justify-center space-x-3 p-4 rounded-lg font-bold text-lg";
    }
    return "bg-orange-500 hover:bg-orange-600 text-white w-full transition-colors flex items-center justify-center space-x-3 p-4 rounded-lg font-bold text-lg";
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
      <div className="mb-4">
        <input
          id="search-box"
          type="text"
          placeholder="Tìm sản phẩm..."
          className="w-full p-3 border rounded-lg text-lg"
          readOnly
          value={transcript ? "Đã nghe: " + transcript + '"' : ""}
        />
      </div>

      <button
        onClick={handleVoiceInput}
        className={getButtonClass()}
        disabled={!isSupported}
        data-voice-trigger="true"
      >
        <Mic className="w-6 h-6" />
        <span>{getButtonText()}</span>
      </button>
      
      {transcript && transcript.trim() && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 text-white p-2 rounded-lg text-center z-50">
          <p className="text-sm">Đã nghe: "{transcript}"</p>
        </div>
      )}
    </div>
  );
}