"use client";

import { useState, useEffect } from 'react';

export default function MobileDebugInfo() {
  const [debugInfo, setDebugInfo] = useState({
    isMobile: false,
    isSecure: false,
    userAgent: "",
    hasCamera: false,
    hasMicrophone: false,
    hasSpeechRecognition: false,
    permissions: {
      camera: "unknown",
      microphone: "unknown"
    }
  });

  const checkPermissions = async () => {
    try {
      // Check if mediaDevices is available
      if (!navigator.mediaDevices) {
        alert('❌ Trình duyệt không hỗ trợ camera/microphone.\n📝 Gợi ý: Dùng Chrome, Firefox, hoặc Safari trên iOS 13+');
        return;
      }

      // Check if getUserMedia is available
      if (!navigator.mediaDevices.getUserMedia) {
        alert('❌ getUserMedia không khả dụng.\n📝 Gợi ý: Cần kết nối HTTPS và trình duyệt hiện đại');
        return;
      }

      // Check HTTPS requirement (crucial for iOS) - allow tunnel domains
      const isLocalhost = location.hostname === 'localhost';
      const isLocalTunnel = location.hostname.includes('.loca.lt') || 
                           location.hostname.includes('.ngrok.io') ||
                           location.hostname.includes('.ngrok-free.app') ||
                           location.hostname.includes('.tunnelto.dev');
      const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
      
      if (location.protocol !== 'https:' && !isLocalhost && !isLocalTunnel) {
        const alertMsg = isIOS 
          ? '❌ iPhone/iPad CẦN HTTPS để truy cập camera/microphone.\n\n📝 Giải pháp:\n1. Dùng: https://taphoa-pos-3973.loca.lt\n2. Hoặc: http://localhost:3000\n3. Hoặc tạo tunnel: create-tunnel.bat'
          : '❌ Cần kết nối HTTPS để truy cập camera/microphone.\n📝 Giải pháp: Dùng HTTPS tunnel hoặc localhost';
        alert(alertMsg);
        return;
      }

      // Request camera permission
      console.log('Requesting camera permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false 
      });
      stream.getTracks().forEach(track => track.stop());
      
      // Request microphone permission
      console.log('Requesting microphone permission...');
      const audioStream = await navigator.mediaDevices.getUserMedia({ 
        video: false,
        audio: true 
      });
      audioStream.getTracks().forEach(track => track.stop());
      
      // Check permissions status (if available)
      let cameraState = "granted";
      let micState = "granted";
      
      try {
        if (navigator.permissions) {
          const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
          const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          
          cameraState = cameraPermission?.state || "granted";
          micState = micPermission?.state || "granted";
        }
      } catch (permError) {
        console.log('Permission API not available, but getUserMedia worked');
      }
      
      setDebugInfo(prev => ({
        ...prev,
        permissions: {
          camera: cameraState,
          microphone: micState
        }
      }));
      
      alert('✅ Camera và Microphone đã được cấp quyền!');
    } catch (err: any) {
      console.error('Permission error:', err);
      
      let errorMessage = err.message || 'Unknown error';
      let suggestion = '';
      
      if (errorMessage.includes('denied')) {
        suggestion = 'Vui lòng vào Settings > Privacy & Security > Camera/Microphone và cho phép truy cập';
      } else if (errorMessage.includes('not allowed')) {
        suggestion = 'Vui lòng vào Cài đặt > Quyền riêng tư & Bảo mật > Camera/Microphone và cấp quyền';
      } else if (errorMessage.includes('not secure')) {
        suggestion = 'Ứng dụng cần chạy trên HTTPS để truy cập Camera/Microphone';
      } else {
        suggestion = 'Vui lòng làm mới trang và thử lại';
      }
      
      alert('❌ Permission error: ' + errorMessage + '\n📝 Gợi ý:\n' + suggestion);
    }
  };

  useEffect(() => {
    // Basic mobile detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isSecure = location.protocol === 'https:';
    
    // Camera support - check if mediaDevices and getUserMedia exist
    const hasCamera = !!(navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function');
    
    // Microphone support - check if mediaDevices and getUserMedia exist
    const hasMicrophone = !!(navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function');
    
    // Speech recognition support
    const hasSpeechRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    
    // Set debug info
    setDebugInfo({
      isMobile,
      isSecure,
      userAgent: navigator.userAgent,
      hasCamera,
      hasMicrophone,
      hasSpeechRecognition,
      permissions: {
        camera: "unknown",
        microphone: "unknown"
      }
    });
  }, []);

  // Check permissions on mount
  useEffect(() => {
    const checkInitialPermissions = async () => {
      try {
        const cameraPermission = await navigator.permissions.query({ name: 'camera' });
        const micPermission = await navigator.permissions.query({ name: 'microphone' });
        
        setDebugInfo(prev => ({
          ...prev,
          permissions: {
            camera: cameraPermission?.state,
            microphone: micPermission?.state
          }
        }));
      } catch (err) {
        console.error('Permission check error:', err);
      }
    };
    
    checkInitialPermissions();
  }, []);

  return (
    <div className="fixed top-4 right-4 bg-yellow-100 border-2 border-yellow-300 rounded-lg p-4 max-w-sm z-50">
      <h3 className="font-bold text-sm mb-2">🔍 Mobile Debug Info</h3>
      
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Mobile:</span>
          <span className={debugInfo.isMobile ? "text-green-600 font-bold" : "text-red-600"}>
            {debugInfo.isMobile ? "✅" : "❌"}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>HTTPS:</span>
          <span className={debugInfo.isSecure ? "text-green-600 font-bold" : "text-red-600"}>
            {debugInfo.isSecure ? "✅" : "❌"}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Camera:</span>
          <span className={debugInfo.hasCamera ? "text-green-600 font-bold" : "text-red-600"}>
            {debugInfo.hasCamera ? "✅" : "❌"}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Microphone:</span>
          <span className={debugInfo.hasMicrophone ? "text-green-600 font-bold" : "text-red-600"}>
            {debugInfo.hasMicrophone ? "✅" : "❌"}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Speech API:</span>
          <span className={debugInfo.hasSpeechRecognition ? "text-green-600 font-bold" : "text-red-600"}>
            {debugInfo.hasSpeechRecognition ? "✅" : "❌"}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Camera Permission:</span>
          <span className={debugInfo.permissions.camera === "granted" ? "text-green-600 font-bold" : "text-red-600"}>
            {debugInfo.permissions.camera === "granted" ? "✅" : "❌"}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Mic Permission:</span>
          <span className={debugInfo.permissions.microphone === "granted" ? "text-green-600 font-bold" : "text-red-600"}>
            {debugInfo.permissions.microphone === "granted" ? "✅" : "❌"}
          </span>
        </div>
      </div>
      
      <div className="text-center mt-2 mb-2">
        <p className="text-xs text-gray-600 truncate">{debugInfo.userAgent}</p>
      </div>
      
      {/* Request permissions button */}
      <button
        onClick={checkPermissions}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg font-bold text-sm"
      >
        Request Permissions
      </button>
    </div>
  );
}