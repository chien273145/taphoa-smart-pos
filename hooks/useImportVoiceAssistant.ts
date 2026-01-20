import { useCallback } from 'react';

export const useImportVoiceAssistant = () => {
  // Text-to-Speech function
  const speak = useCallback((text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.9; // Slightly slower for elderly users
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      // Find Vietnamese voice
      const voices = window.speechSynthesis.getVoices();
      const vietnameseVoice = voices.find(voice => 
        voice.lang.includes('vi') || voice.name.includes('Vietnamese')
      );
      
      if (vietnameseVoice) {
        utterance.voice = vietnameseVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Welcome message
  const welcomeMessage = useCallback(() => {
    speak('Chào mừng bác đến trang nhập hàng. Bác có thể nói tên sản phẩm hoặc quét mã vạch để bắt đầu.');
  }, [speak]);

  // Product found with image
  const productHasImageMessage = useCallback(() => {
    speak('Món này có ảnh rồi, không cần chụp nữa ạ.');
  }, [speak]);

  // Product needs image
  const productNeedsImageMessage = useCallback(() => {
    speak('Món này chưa có hình, bác chụp giúp cháu một tấm nhé.');
  }, [speak]);

  // Guidance for quantity input
  const quantityGuidanceMessage = useCallback(() => {
    speak('Bác nhập số lượng sản phẩm cần nhập nhé.');
  }, [speak]);

  // Guidance for price input
  const priceGuidanceMessage = useCallback(() => {
    speak('Bác nhập giá nhập cho mỗi sản phẩm nhé.');
  }, [speak]);

  // Success message
  const successMessage = useCallback((productName: string, quantity: number) => {
    speak(`Đã lưu thành công! Nhập ${quantity} ${productName} vào kho.`);
  }, [speak]);

  // Error message
  const errorMessage = useCallback(() => {
    speak('Có lỗi xảy ra, bác vui lòng thử lại nhé.');
  }, [speak]);

  return {
    speak,
    welcomeMessage,
    productHasImageMessage,
    productNeedsImageMessage,
    quantityGuidanceMessage,
    priceGuidanceMessage,
    successMessage,
    errorMessage
  };
};