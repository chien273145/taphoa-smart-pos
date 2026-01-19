// Global type declarations for browser APIs
declare global {
  interface IWindow extends Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}