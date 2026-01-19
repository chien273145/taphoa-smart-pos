// Global type declarations for browser APIs
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    speechSynthesis: SpeechSynthesis;
    AudioContext: any;
    webkitAudioContext: any;
  }
  
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    grammars: any;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    serviceURI: string;
    
    // Methods
    start(): void;
    stop(): void;
    abort(): void;
    
    // Event handlers
    onaudioend: ((event: Event) => void) | null;
    onaudiostart: ((event: Event) => void) | null;
    onend: ((event: Event) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onnomatch: ((event: SpeechRecognitionEvent) => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onsoundend: ((event: Event) => void) | null;
    onsoundstart: ((event: Event) => void) | null;
    onspeechend: ((event: Event) => void) | null;
    onspeechstart: ((event: Event) => void) | null;
    onstart: ((event: Event) => void) | null;
  }
  
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
  
  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message?: string;
  }
}