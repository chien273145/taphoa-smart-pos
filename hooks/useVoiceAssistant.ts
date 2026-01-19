"use client";

import { useState, useEffect, useRef } from "react";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

// Type declarations are now in types/global.d.ts

export interface UseVoiceAssistantReturn {
  isListening: boolean;
  isSupported: boolean;
  isSpeaking: boolean;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
  transcript: string;
}

export function useVoiceAssistant(): UseVoiceAssistantReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const speechQueueRef = useRef<string[]>([]);
  const isProcessingSpeechRef = useRef(false);

  useEffect(() => {
    // Check if browser supports speech recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        recognitionRef.current = new SpeechRecognition();
        
        // Configure recognition
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "vi-VN"; // Vietnamese language
        
        // Handle results
        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = "";
          let interimTranscript = "";
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          setTranscript(finalTranscript || interimTranscript);
        };
        
        // Handle errors with better iOS compatibility
        recognitionRef.current.onerror = (event: any) => {
          console.log("Speech recognition error:", event.error);
          
          // Handle different error types
          switch (event.error) {
            case 'aborted':
              console.log('Recognition was aborted - this is normal on iOS');
              break;
            case 'no-speech':
              console.log('No speech detected');
              break;
            case 'not-allowed':
              console.error('Microphone permission denied');
              break;
            case 'network':
              console.error('Network error for speech recognition');
              break;
            case 'service-not-allowed':
              console.error('Speech recognition service not allowed');
              break;
            default:
              console.error('Unknown speech recognition error:', event.error);
          }
          
          setIsListening(false);
          setIsStarting(false);
        };
        
        // Handle end
        recognitionRef.current.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
          setIsStarting(false);
          
          // Clear any pending timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        };
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore abort errors
        }
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Clear speech queue and cancel ongoing speech
      speechQueueRef.current = [];
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      isProcessingSpeechRef.current = false;
      setIsSpeaking(false);
    };
  }, []);
  
  const startListening = () => {
    if (!recognitionRef.current) {
      console.error('Speech recognition not initialized');
      return;
    }

    if (isStarting || isListening) {
      console.log('Speech recognition already starting or running');
      return;
    }

      // Check HTTPS requirement - allow localtunnel domains for testing
      const isLocalhost = location.hostname === 'localhost';
      const isLocalTunnel = location.hostname.includes('.loca.lt') || 
                           location.hostname.includes('.ngrok.io') ||
                           location.hostname.includes('.ngrok-free.app') ||
                           location.hostname.includes('.tunnelto.dev');
      
      if (location.protocol !== 'https:' && !isLocalhost && !isLocalTunnel) {
        console.error('Speech recognition requires HTTPS or localhost');
        console.log('Current:', location.protocol, location.hostname);
        console.log('Solutions:');
        console.log('1. Use: https://taphoa-pos-3973.loca.lt');
        console.log('2. Or: http://localhost:3000');
        return;
      }

    try {
      setIsStarting(true);
      setTranscript("");
      
      // Force stop any existing recognition
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // Ignore abort errors
      }
      
      // Start new recognition
      recognitionRef.current.start();
      setIsListening(true);
      
      // Add timeout to handle iOS edge cases
      timeoutRef.current = setTimeout(() => {
        if (isListening) {
          console.log('Recognition timeout - force stopping');
          try {
            recognitionRef.current?.stop();
          } catch (e) {
            // Ignore stop errors
          }
        }
      }, 10000); // 10 second timeout
      
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setIsStarting(false);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && (isListening || isStarting)) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        // Try to abort if stop fails
        try {
          recognitionRef.current.abort();
        } catch (abortError) {
          console.log('Could not abort recognition:', abortError);
        }
      }
      setIsListening(false);
      setIsStarting(false);
      
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  };

  const speak = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      // Add to speech queue to prevent interruptions
      speechQueueRef.current.push(text);
      processSpeechQueue();
    }
  };

  const processSpeechQueue = () => {
    if (isProcessingSpeechRef.current || speechQueueRef.current.length === 0) {
      return;
    }

    const text = speechQueueRef.current.shift();
    if (!text) return;

    isProcessingSpeechRef.current = true;
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "vi-VN"; // Vietnamese language
    utterance.rate = 0.9; // Slightly slower for better comprehension
    utterance.volume = 1.0;
    utterance.pitch = 1.0;
    
    // Enhanced error handling for speech synthesis
    utterance.onerror = (event) => {
      // Handle different synthesis errors gracefully
      switch (event.error) {
        case 'interrupted':
          console.log('Speech synthesis was interrupted - this is normal');
          break;
        case 'network':
          console.log('Speech synthesis network error');
          break;
        case 'synthesis-unavailable':
          console.log('Speech synthesis not available on this device');
          break;
        case 'synthesis-failed':
          console.log('Speech synthesis failed');
          break;
        case 'language-unavailable':
          console.log('Vietish language not available - using default');
          break;
        case 'voice-unavailable':
          console.log('Voice not available - using default voice');
          break;
        case 'text-too-long':
          console.log('Text too long for speech synthesis');
          break;
        default:
          console.log('Speech synthesis error:', event.error);
      }
      
      // Continue processing queue even on error
      isProcessingSpeechRef.current = false;
      setIsSpeaking(false);
      setTimeout(() => processSpeechQueue(), 100);
    };
    
    utterance.onend = () => {
      console.log('Speech synthesis completed');
      isProcessingSpeechRef.current = false;
      setIsSpeaking(false);
      
      // Process next speech in queue
      setTimeout(() => processSpeechQueue(), 50);
    };
    
    // iOS-compatible speech synthesis with better error handling
    const speakWithRetry = (retryCount = 0) => {
      try {
        // Check if synthesis is available
        if (!window.speechSynthesis) {
          console.log('Speech synthesis not available');
          isProcessingSpeechRef.current = false;
          setIsSpeaking(false);
          setTimeout(() => processSpeechQueue(), 100);
          return;
        }
        
        // Don't cancel if there's ongoing speech to prevent interruptions
        if (window.speechSynthesis.speaking && retryCount === 0) {
          // Wait for current speech to finish
          setTimeout(() => speakWithRetry(retryCount + 1), 100);
          return;
        }
        
        // Small delay for iOS compatibility
        setTimeout(() => {
          try {
            // Check if still available after delay
            if (window.speechSynthesis && !window.speechSynthesis.speaking) {
              window.speechSynthesis.speak(utterance);
            } else if (retryCount < 5) {
              // Retry with exponential backoff
              setTimeout(() => speakWithRetry(retryCount + 1), 200 * (retryCount + 1));
            } else {
              // Give up and continue queue
              isProcessingSpeechRef.current = false;
              setIsSpeaking(false);
              setTimeout(() => processSpeechQueue(), 100);
            }
          } catch (error) {
            console.log('Speech synthesis failed after delay:', error);
            
            // Retry logic for iOS
            if (retryCount < 2) {
              setTimeout(() => speakWithRetry(retryCount + 1), 500);
            } else {
              isProcessingSpeechRef.current = false;
              setIsSpeaking(false);
              setTimeout(() => processSpeechQueue(), 100);
            }
          }
        }, 150); // Slightly longer delay for iOS
        
      } catch (error) {
        console.log('Speech synthesis error:', error);
        
        // Retry for iOS devices
        const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
        if (isIOS && retryCount < 3) {
          setTimeout(() => speakWithRetry(retryCount + 1), 300);
        } else {
          isProcessingSpeechRef.current = false;
          setIsSpeaking(false);
          setTimeout(() => processSpeechQueue(), 100);
        }
      }
    };
    
    speakWithRetry();
  };

  return {
    isListening,
    isSupported,
    isSpeaking,
    startListening,
    stopListening,
    speak,
    transcript,
  };
}