"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, MicOff } from "lucide-react";

interface VoiceRecorderProps {
  onTranscript: (data: {
    product_name: string;
    quantity: number;
    unit: string;
    import_price: number;
    note: string;
  }) => void;
  onError: (error: string) => void;
  className?: string;
}

interface VoiceData {
  product_name: string;
  quantity: number;
  unit: string;
  import_price: number;
  note: string;
}

export default function VoiceRecorder({ onTranscript, onError, className = "" }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Initialize MediaRecorder
  const initializeRecorder = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
          channelCount: 1
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg'
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mediaRecorder.mimeType 
        });
        
        // Send to API
        await sendAudioToAPI(audioBlob);
        
        // Clean up
        audioChunksRef.current = [];
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current = mediaRecorder;
      return mediaRecorder;
    } catch (error) {
      console.error('Error initializing recorder:', error);
      onError('Không thể truy cập micro. Bác vui lòng cấp quyền micro nhé.');
      return null;
    }
  }, [onError]);

  // Send audio to API
  const sendAudioToAPI = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/voice-import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.data) {
        onTranscript(result.data);
        showToast('Đã điền thông tin từ giọng nói!', 'success');
      } else {
        onError(result.error || 'Không nghe rõ, bác nói lại giúp cháu nhé');
      }
    } catch (error) {
      console.error('Error sending audio:', error);
      onError('Lỗi kết nối. Bác thử lại giúp cháu nhé');
    } finally {
      setIsProcessing(false);
    }
  };

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg text-white font-medium shadow-lg transition-all ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      toast.classList.add('opacity-0', 'scale-95');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };

  // Start recording
  const startRecording = async () => {
    const recorder = await initializeRecorder();
    if (recorder) {
      audioChunksRef.current = [];
      recorder.start();
      setIsRecording(true);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsHolding(false);
    }
  };

  // Mouse/Touch events
  const handleMouseDown = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isRecording && !isProcessing) {
      setIsHolding(true);
      await startRecording();
    }
  };

  const handleMouseUp = () => {
    if (isRecording) {
      stopRecording();
    }
  };

  const handleTouchStart = async (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isRecording && !isProcessing) {
      setIsHolding(true);
      await startRecording();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (isRecording) {
      stopRecording();
    }
  };

  // Prevent context menu on long press
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onContextMenu={handleContextMenu}
        disabled={isProcessing}
        className={`relative p-6 rounded-full transition-all transform ${
          isProcessing 
            ? 'bg-yellow-500 scale-95' 
            : isRecording 
              ? 'bg-red-500 scale-110 animate-pulse' 
              : isHolding
                ? 'bg-red-600 scale-105'
                : 'bg-gray-400 hover:bg-gray-500 hover:scale-105'
        } text-white shadow-lg`}
      >
        {isProcessing ? (
          <div className="w-8 h-8">
            <div className="w-full h-full border-2 border-white border-t-transparent border-solid animate-spin rounded-full"></div>
          </div>
        ) : isRecording ? (
          <MicOff className="w-8 h-8" />
        ) : (
          <Mic className="w-8 h-8" />
        )}
        
        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full animate-ping"></div>
        )}
      </button>
      
      {/* Instructions */}
      <div className="mt-3 text-center">
        {isProcessing ? (
          <div className="text-sm text-yellow-600 font-medium">
            🤖 AI đang xử lý...
          </div>
        ) : isRecording ? (
          <div className="text-sm text-red-600 font-medium animate-pulse">
            🎤 Đang ghi âm... Nhả ra để dừng
          </div>
        ) : (
          <div className="text-sm text-gray-600">
            👆 Giữ để ghi âm giọng nói
          </div>
        )}
      </div>

      {/* Recording timer */}
      {isRecording && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
          {Math.floor((Date.now() % 60000) / 1000)}s
        </div>
      )}
    </div>
  );
}