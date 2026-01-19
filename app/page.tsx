"use client";

import { useState, useEffect } from "react";
import { mockProducts } from "@/lib/mockData";
import { CartItem } from "@/lib/types";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { CartPersistence } from "@/lib/cartPersistence";
import ProductGrid from "@/components/ProductGrid";
import Cart from "@/components/Cart";
import ActionButtons from "@/components/ActionButtons";
import PaymentModal from "@/components/PaymentModal";
import CartDrawer from "@/components/CartDrawer";
import StickyCartFooter from "@/components/StickyCartFooter";
import MainBottomNavigation from "@/components/MainBottomNavigation";
import MobileDebugInfo from "@/components/MobileDebugInfo";
import VoiceSearch from "@/components/VoiceSearch";

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPriceCheckMode, setIsPriceCheckMode] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { speak } = useVoiceAssistant();

  // Handle hydration and load cart from localStorage
  useEffect(() => {
    setIsMounted(true);
    const savedCart = CartPersistence.loadCart();
    if (savedCart.length > 0) {
      setCart(savedCart);
      console.log('Cart loaded from localStorage:', CartPersistence.getCartSummary(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isMounted) {
      CartPersistence.saveCart(cart);
      console.log('Cart saved to localStorage:', CartPersistence.getCartSummary(cart));
    }
  }, [cart, isMounted]);

  const addToCart = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId);
    if (product) {
      if (isPriceCheckMode) {
        // Price check mode - only speak price, don't add to cart
        speak(`${product.name}, giá ${product.price.toLocaleString()} đồng`);
      } else {
        // Normal mode - add to cart
        setCart(prevCart => {
          const existingItem = prevCart.find(item => item.product.id === productId);
          
          if (existingItem) {
            return prevCart.map(item =>
              item.product.id === productId
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          }
          
          speak(`Đã thêm ${product.name}, ${product.price.toLocaleString()} đồng`);
          return [...prevCart, { product, quantity: 1 }];
        });
      }
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === productId);
      
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      
      return prevCart.filter(item => item.product.id !== productId);
    });
  };

  const clearCart = () => {
    setCart([]);
    CartPersistence.clearCart();
    console.log('Cart cleared from localStorage');
  };

  const handlePayment = () => {
    if (cart.length > 0) {
      setIsPaymentModalOpen(true);
    }
  };

  const handleFloatingPayment = () => {
    if (cart.length > 0) {
      setIsPaymentModalOpen(true);
    }
  };

  const handlePaymentComplete = () => {
    setCart([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Tạp Hóa Smart POS</h1>
          
          {/* Mode Switch */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium">Bán</span>
            <button
              onClick={() => setIsPriceCheckMode(!isPriceCheckMode)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                isPriceCheckMode ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  isPriceCheckMode ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-xs font-medium">Xem giá</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Product Grid - Full width on mobile, sidebar on desktop */}
        <div className="flex-1 p-4 pb-24 lg:pb-4">
          <ProductGrid products={mockProducts} onAddToCart={addToCart} />
        </div>

        {/* Cart Sidebar - Desktop only */}
        <div className="hidden lg:block lg:w-96 bg-white border-l">
          <Cart 
            items={cart} 
            onRemoveFromCart={removeFromCart}
            onAddToCart={addToCart}
            onClearCart={clearCart}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="hidden lg:block">
        <ActionButtons 
          onAddToCart={addToCart} 
          onPayment={handlePayment}
          isPriceCheckMode={isPriceCheckMode}
        />
      </div>

      {/* Mobile Action Buttons */}
      <div className="lg:hidden fixed bottom-32 left-0 right-0 bg-white border-t p-4">
        <div className="grid grid-cols-3 gap-2">
          {/* Quét mã vạch */}
          <button 
            onClick={() => {
              const input = document.getElementById('mobile-barcode-input') as HTMLInputElement;
              if (input) input.click();
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-bold text-sm transition-colors flex flex-col items-center space-y-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span>QUÉT MÃ</span>
          </button>

          {/* Chụp ảnh AI */}
          <button 
            onClick={() => {
              const input = document.getElementById('mobile-camera-input') as HTMLInputElement;
              if (input) input.click();
            }}
            className="bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg font-bold text-sm transition-colors flex flex-col items-center space-y-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>CHỤP ẢNH</span>
          </button>

          {/* Nói tên */}
          <button 
            onClick={() => {
              // Trigger voice recognition
              const voiceButton = document.querySelector('[data-voice-trigger]') as HTMLButtonElement;
              if (voiceButton) voiceButton.click();
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-bold text-sm transition-colors flex flex-col items-center space-y-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span>NÓI TÊN</span>
          </button>
        </div>
      </div>

      {/* Sticky Cart Footer - Mobile only */}
      <div className="lg:hidden">
        <StickyCartFooter 
          items={cart} 
          onOpenCart={() => setIsCartDrawerOpen(true)} 
          onPayment={handleFloatingPayment} 
        />
      </div>

      {/* Cart Drawer - Mobile only */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        items={cart}
        onRemoveFromCart={removeFromCart}
        onAddToCart={addToCart}
        onClearCart={clearCart}
        onPayment={handlePayment}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        items={cart}
        onPaymentComplete={handlePaymentComplete}
      />

      {/* Main Bottom Navigation */}
      <MainBottomNavigation />
      
      {/* Mobile Debug Info */}
      <MobileDebugInfo />
      
      {/* Hidden VoiceSearch for mobile triggers */}
      <div style={{ opacity: 0, position: 'absolute', zIndex: -1, width: '1px', height: '1px', overflow: 'hidden' }}>
        <VoiceSearch 
          onProductFound={addToCart} 
          isPriceCheckMode={isPriceCheckMode}
        />
      </div>
      
      {/* Hidden mobile inputs for iOS compatibility */}
      <div style={{ opacity: 0, position: 'absolute', zIndex: -1, width: '1px', height: '1px', overflow: 'hidden' }}>
        <input
          id="mobile-barcode-input"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && file.type.startsWith('image/')) {
              setTimeout(() => {
                const mockBarcode = "8938501012345";
                console.log("🔍 Mobile barcode scanned:", mockBarcode);
                const mockProductId = "prod-001";
                addToCart(mockProductId);
                
                const successMsg = document.createElement('div');
                successMsg.textContent = '✅ Đã quét mã: ' + mockBarcode;
                Object.assign(successMsg.style, {
                  position: 'fixed',
                  top: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#10b981',
                  color: 'white',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  zIndex: '9999',
                  fontSize: '16px'
                });
                document.body.appendChild(successMsg);
                setTimeout(() => {
                  if (successMsg.parentNode) {
                    successMsg.parentNode.removeChild(successMsg);
                  }
                }, 3000);
              }, 1500);
            }
          }}
        />
        
        <input
          id="mobile-camera-input"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && file.type.startsWith('image/')) {
              const reader = new FileReader();
              reader.onload = (event) => {
                console.log("📷 Mobile image captured for AI vision");
                // TODO: Process image with AI vision
                const successMsg = document.createElement('div');
                successMsg.textContent = '📷 Đã chụp ảnh - AI đang xử lý...';
                Object.assign(successMsg.style, {
                  position: 'fixed',
                  top: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#8b5cf6',
                  color: 'white',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  zIndex: '9999',
                  fontSize: '16px'
                });
                document.body.appendChild(successMsg);
                setTimeout(() => {
                  if (successMsg.parentNode) {
                    successMsg.parentNode.removeChild(successMsg);
                  }
                }, 3000);
              };
              reader.readAsDataURL(file);
            }
          }}
        />
      </div>
    </div>
  );
}