import React from "react";
import { CartItem } from "@/lib/types";

// LocalStorage keys
const CART_STORAGE_KEY = 'taphoa_cart_items';

// Cart persistence utilities
export const CartPersistence = {
  // Save cart to localStorage
  saveCart(cart: CartItem[]): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        console.log('Cart saved to localStorage:', cart.length, 'items');
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  },

  // Load cart from localStorage
  loadCart(): CartItem[] {
    if (typeof window !== 'undefined') {
      try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          console.log('Cart loaded from localStorage:', parsedCart.length, 'items');
          return parsedCart;
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
    return [];
  },

  // Clear cart from localStorage
  clearCart(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(CART_STORAGE_KEY);
        console.log('Cart cleared from localStorage');
      } catch (error) {
        console.error('Error clearing cart from localStorage:', error);
      }
    }
  },

  // Get cart summary for debugging
  getCartSummary(cart: CartItem[]): string {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    return `${totalItems} items, ${totalAmount.toLocaleString()}đ`;
  }
};

// Hook for cart persistence
export const useCartPersistence = (cart: CartItem[], setCart: (cart: CartItem[]) => void) => {
  // Load cart on mount
  React.useEffect(() => {
    const savedCart = CartPersistence.loadCart();
    if (savedCart.length > 0) {
      setCart(savedCart);
    }
  }, [setCart]);

  // Save cart whenever it changes
  React.useEffect(() => {
    CartPersistence.saveCart(cart);
  }, [cart]);

  // Clear cart utility
  const clearCart = () => {
    setCart([]);
    CartPersistence.clearCart();
  };

  return { clearCart };
};