"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff } from "lucide-react";

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
  placeholder?: string;
  className?: string;
}

export default function VoiceInput({ onTranscript, placeholder = "Nhấn nút mic để nói...", className = "" }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognition = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'vi-VN';

      recognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
        onTranscript(transcript);
        setIsListening(false);
      };

      recognition.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognition.current) {
      alert('Trình duyệt của bác không hỗ trợ nhận diện giọng nói. Bác vui lòng dùng Chrome nhé.');
      return;
    }

    if (isListening) {
      recognition.current.stop();
      setIsListening(false);
    } else {
      recognition.current.start();
      setIsListening(true);
      setTranscript("");
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center space-x-3">
        <input
          type="text"
          value={transcript}
          onChange={(e) => {
            setTranscript(e.target.value);
            onTranscript(e.target.value);
          }}
          placeholder={placeholder}
          className="flex-1 px-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
        />
        
        <button
          onClick={toggleListening}
          disabled={!recognition.current}
          className={`p-4 rounded-full transition-all ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          } ${!recognition.current ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isListening ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </button>
      </div>
      
      {isListening && (
        <div className="mt-2 text-sm text-red-600 font-medium animate-pulse">
          🎤 Đang nghe... Bác nói rõ ràng nhé
        </div>
      )}
    </div>
  );
}