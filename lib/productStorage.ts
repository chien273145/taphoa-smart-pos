"use client";

import { Product } from './types';
import { mockProducts } from './mockData';

const STORAGE_KEY = 'imported_products';

export interface ImportedProduct extends Product {
    importDate: string;
    importPrice: number;
    quantity: number;
}

/**
 * ProductStorage - Quản lý sản phẩm với localStorage
 * Kết hợp mockProducts + imported products
 */
export const ProductStorage = {
    /**
     * Lấy tất cả sản phẩm đã import từ localStorage
     */
    getImportedProducts(): ImportedProduct[] {
        if (typeof window === 'undefined') return [];

        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading imported products:', error);
            return [];
        }
    },

    /**
     * Lấy tất cả sản phẩm (mockProducts + imported)
     */
    getAllProducts(): Product[] {
        const importedProducts = this.getImportedProducts();

        // Map imported products to Product format
        const importedAsProducts: Product[] = importedProducts.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            barcode: p.barcode,
            image_url: p.image_url,
            category: p.category
        }));

        // Merge: imported products first, then mock products
        return [...importedAsProducts, ...mockProducts];
    },

    /**
     * Thêm sản phẩm mới sau khi import
     */
    addProduct(product: ImportedProduct): void {
        if (typeof window === 'undefined') return;

        const products = this.getImportedProducts();

        // Kiểm tra xem sản phẩm đã tồn tại chưa (theo tên hoặc barcode)
        const existingIndex = products.findIndex(p =>
            p.name.toLowerCase() === product.name.toLowerCase() ||
            (p.barcode && product.barcode && p.barcode === product.barcode)
        );

        if (existingIndex >= 0) {
            // Cập nhật số lượng và giá nếu đã tồn tại
            products[existingIndex].quantity += product.quantity;
            products[existingIndex].importPrice = product.importPrice;
            products[existingIndex].price = product.price;
            console.log('📦 Updated existing product:', products[existingIndex].name);
        } else {
            // Thêm mới
            products.unshift(product); // Thêm vào đầu danh sách
            console.log('📦 Added new product:', product.name);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));

        // Dispatch custom event để các component khác biết có thay đổi
        window.dispatchEvent(new CustomEvent('productsUpdated'));
    },

    /**
     * Xóa sản phẩm đã import
     */
    removeProduct(productId: string): void {
        if (typeof window === 'undefined') return;

        const products = this.getImportedProducts();
        const filtered = products.filter(p => p.id !== productId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

        window.dispatchEvent(new CustomEvent('productsUpdated'));
    },

    /**
     * Xóa tất cả sản phẩm đã import
     */
    clearImportedProducts(): void {
        if (typeof window === 'undefined') return;

        localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new CustomEvent('productsUpdated'));
    },

    /**
     * Tìm sản phẩm theo tên
     */
    findByName(name: string): Product | undefined {
        const allProducts = this.getAllProducts();
        return allProducts.find(p =>
            p.name.toLowerCase().includes(name.toLowerCase())
        );
    },

    /**
     * Tìm sản phẩm theo barcode
     */
    findByBarcode(barcode: string): Product | undefined {
        const allProducts = this.getAllProducts();
        return allProducts.find(p => p.barcode === barcode);
    }
};
