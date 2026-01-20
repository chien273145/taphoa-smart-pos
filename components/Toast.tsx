"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 border-green-600 text-white';
      case 'error':
        return 'bg-red-500 border-red-600 text-white';
      default:
        return 'bg-blue-500 border-blue-600 text-white';
    }
  };

  return (
    <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-lg shadow-xl border-2 flex items-center space-x-3 transition-all animate-in ${getColors()}`}>
      {getIcon()}
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-4 hover:opacity-80 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Toast container and manager
let toastId = 0;
const toasts: { id: number; message: string; type: 'success' | 'error' | 'info' }[] = [];

export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  const id = ++toastId;
  toasts.push({ id, message, type });
  
  // Create toast element
  const toastElement = document.createElement('div');
  toastElement.id = `toast-${id}`;
  document.body.appendChild(toastElement);
  
  // This will be handled by the ToastProvider component
  window.dispatchEvent(new CustomEvent('showToast', { detail: { id, message, type } }));
};

export function ToastProvider() {
  const [currentToasts, setCurrentToasts] = useState(toasts);

  useEffect(() => {
    const handleShowToast = (event: CustomEvent) => {
      const { id, message, type } = event.detail;
      setCurrentToasts(prev => [...prev, { id, message, type }]);
    };

    window.addEventListener('showToast', handleShowToast as EventListener);
    return () => window.removeEventListener('showToast', handleShowToast as EventListener);
  }, []);

  const removeToast = (id: number) => {
    setCurrentToasts(prev => prev.filter(toast => toast.id !== id));
    // Remove DOM element
    const element = document.getElementById(`toast-${id}`);
    if (element) {
      element.remove();
    }
  };

  if (typeof window === 'undefined') return null;

  return createPortal(
    <>
      {currentToasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>,
    document.body
  );
}