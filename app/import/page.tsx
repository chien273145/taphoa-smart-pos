"use client";

import React, { useState, useEffect, useRef } from "react";
import { ImportService, ImportHistory } from "@/lib/import";
import { useImportVoiceAssistant } from "@/hooks/useImportVoiceAssistant";
import { ProductStorage, ImportedProduct } from "@/lib/productStorage";
import MainBottomNavigation from "@/components/MainBottomNavigation";
import VoiceInput from "@/components/VoiceInput";
import VoiceRecorder from "@/components/VoiceRecorder";
import BarcodeScanner from "@/components/BarcodeScanner";
import { Camera, Upload, CheckCircle, AlertCircle } from "lucide-react";

interface ImportItem {
  product_name: string;
  barcode?: string;
  quantity: number;
  import_price: number;
  supplier_name?: string;
  image_url?: string;
  notes?: string;
}

export default function ImportPage() {
  // Form states
  const [currentItem, setCurrentItem] = useState<ImportItem>({
    product_name: "",
    quantity: 1,
    import_price: 0,
    supplier_name: "",
    notes: ""
  });

  // UI states
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [productImageCheck, setProductImageCheck] = useState<{
    hasImage: boolean;
    imageUrl?: string;
    product?: any;
  }>({ hasImage: false });
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [barcodeError, setBarcodeError] = useState<string | null>(null);

  // Refs for auto-focus
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);
  const supplierInputRef = useRef<HTMLInputElement>(null);
  const notesInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice assistant
  const {
    speak,
    welcomeMessage,
    productHasImageMessage,
    productNeedsImageMessage,
    quantityGuidanceMessage,
    priceGuidanceMessage,
    successMessage,
    errorMessage
  } = useImportVoiceAssistant();

  // Welcome message on mount
  useEffect(() => {
    welcomeMessage();
  }, [welcomeMessage]);

  // Smart Image Check - Trigger when product name or barcode changes
  useEffect(() => {
    const checkProductImage = async () => {
      if (currentItem.product_name.trim() || currentItem.barcode?.trim()) {
        try {
          const result = await ImportService.checkProductImage(
            currentItem.product_name,
            currentItem.barcode
          );

          setProductImageCheck(result);

          // Voice guidance based on image check
          if (result.hasImage) {
            productHasImageMessage();
            // Auto-focus to quantity if image exists
            setTimeout(() => quantityInputRef.current?.focus(), 1000);
          } else {
            productNeedsImageMessage();
            // Don't auto-focus, wait for image capture
          }
        } catch (error) {
          console.error('Error checking product image:', error);
        }
      }
    };

    const debounceTimer = setTimeout(checkProductImage, 500);
    return () => clearTimeout(debounceTimer);
  }, [currentItem.product_name, currentItem.barcode, productHasImageMessage, productNeedsImageMessage]);

  // Handle file capture
  const handleFileCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCapturedImage(result);
        setCurrentItem(prev => ({ ...prev, image_url: result }));

        // Auto-focus to quantity after image capture
        setTimeout(() => quantityInputRef.current?.focus(), 500);
        speak('Đã chụp ảnh xong, bác nhập số lượng nhé.');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle input changes with auto-focus logic
  const handleProductNameChange = (value: string) => {
    setCurrentItem(prev => ({ ...prev, product_name: value }));
  };

  const handleQuantityChange = (value: string) => {
    const quantity = parseInt(value) || 0;
    setCurrentItem(prev => ({ ...prev, quantity }));

    // Auto-focus to price when quantity is entered
    if (quantity > 0) {
      setTimeout(() => priceInputRef.current?.focus(), 200);
      quantityGuidanceMessage();
    }
  };

  const handlePriceChange = (value: string) => {
    const price = parseInt(value) || 0;
    setCurrentItem(prev => ({ ...prev, import_price: price }));

    // Auto-focus to supplier when price is entered
    if (price > 0) {
      setTimeout(() => supplierInputRef.current?.focus(), 200);
      priceGuidanceMessage();
    }
  };

  // Handle voice transcript data
  const handleVoiceData = (data: {
    product_name: string;
    quantity: number;
    unit: string;
    import_price: number;
    note: string;
  }) => {
    // Auto-fill form with voice data
    setCurrentItem(prev => ({
      ...prev,
      product_name: data.product_name,
      quantity: data.quantity,
      import_price: data.import_price,
      notes: data.note ? `${data.note} (${data.unit})` : data.unit
    }));

    setVoiceError(null);

    // Trigger image check for the new product name
    setTimeout(() => {
      if (data.product_name.trim()) {
        const checkImage = async () => {
          try {
            const result = await ImportService.checkProductImage(data.product_name);
            setProductImageCheck(result);

            if (result.hasImage) {
              productHasImageMessage();
              setTimeout(() => quantityInputRef.current?.focus(), 1000);
            } else {
              productNeedsImageMessage();
            }
          } catch (error) {
            console.error('Error checking product image:', error);
          }
        };
        checkImage();
      }
    }, 100);
  };

  // Handle voice error
  const handleVoiceError = (error: string) => {
    setVoiceError(error);
    errorMessage();
    setTimeout(() => setVoiceError(null), 5000);
  };

  // Handle save
  const handleSave = async () => {
    // Validation
    if (!currentItem.product_name.trim()) {
      speak('Bác phải nhập tên sản phẩm nhé.');
      return;
    }

    if (currentItem.quantity <= 0) {
      speak('Bác phải nhập số lượng lớn hơn 0 nhé.');
      return;
    }

    if (currentItem.import_price <= 0) {
      speak('Bác phải nhập giá nhập lớn hơn 0 nhé.');
      return;
    }

    // Check if image is required but not provided
    if (!productImageCheck.hasImage && !capturedImage) {
      speak('Bác cần chụp ảnh cho sản phẩm này nhé.');
      return;
    }

    setIsProcessing(true);

    try {
      const totalCost = currentItem.quantity * currentItem.import_price;

      const importData: Omit<ImportHistory, 'id' | 'created_at'> = {
        product_name: currentItem.product_name,
        barcode: currentItem.barcode,
        quantity: currentItem.quantity,
        import_price: currentItem.import_price,
        total_cost: totalCost,
        supplier_name: currentItem.supplier_name || undefined,
        image_url: capturedImage || productImageCheck.imageUrl || undefined,
        notes: currentItem.notes || undefined,
        status: 'completed'
      };

      await ImportService.saveImport(importData);

      // === THÊM SẢN PHẨM VÀO KHO BÁN HÀNG ===
      const sellPrice = Math.round(currentItem.import_price * 1.3); // Giá bán = giá nhập + 30%

      const newProduct: ImportedProduct = {
        id: `imported-${Date.now()}`,
        name: currentItem.product_name,
        price: sellPrice,
        barcode: currentItem.barcode || null,
        image_url: capturedImage || productImageCheck.imageUrl || null,
        category: 'Hàng mới nhập',
        importDate: new Date().toISOString(),
        importPrice: currentItem.import_price,
        quantity: currentItem.quantity
      };

      ProductStorage.addProduct(newProduct);
      console.log('✅ Đã thêm sản phẩm vào kho bán hàng:', newProduct.name, 'Giá bán:', sellPrice);

      // Success feedback
      successMessage(currentItem.product_name, currentItem.quantity);

      // Reset form
      setCurrentItem({
        product_name: "",
        quantity: 1,
        import_price: 0,
        supplier_name: "",
        notes: ""
      });
      setCapturedImage(null);
      setProductImageCheck({ hasImage: false });

      // Focus back to product name for next entry
      setTimeout(() => {
        const productInput = document.getElementById('product-name-input') as HTMLInputElement;
        productInput?.focus();
      }, 1000);

    } catch (error) {
      console.error('Error saving import:', error);
      errorMessage();
    } finally {
      setIsProcessing(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📦 NHẬP HÀNG</h1>
          <p className="text-lg text-gray-600">Bác nói tên sản phẩm hoặc quét mã vạch để bắt đầu</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Product Name Input */}
          <div className="mb-6">
            <label className="block text-lg font-bold text-gray-800 mb-3">
              TÊN SẢN PHẨM
            </label>
            <div className="flex gap-3 mb-3">
              <div className="flex-1">
                <VoiceInput
                  onTranscript={handleProductNameChange}
                  placeholder="Bác nói tên sản phẩm hoặc nhập tay..."
                />
              </div>
              <div className="flex items-center justify-center">
                <VoiceRecorder
                  onTranscript={handleVoiceData}
                  onError={handleVoiceError}
                />
              </div>
            </div>

            {/* Voice error display */}
            {voiceError && (
              <div className="mb-3 p-3 bg-red-100 border border-red-300 rounded-lg">
                <div className="flex items-center text-red-700">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">{voiceError}</span>
                </div>
              </div>
            )}

            <input
              id="product-name-input"
              type="text"
              value={currentItem.product_name}
              onChange={(e) => handleProductNameChange(e.target.value)}
              className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Hoặc nhập tay tại đây..."
              autoFocus
            />
          </div>

          {/* Barcode Scanner */}
          <div className="mb-6">
            <label className="block text-lg font-bold text-gray-800 mb-3">
              MÃ VẠCH (Không bắt buộc)
            </label>
            <BarcodeScanner
              onBarcodeDetected={(barcode) => {
                if (barcode) {
                  setCurrentItem(prev => ({ ...prev, barcode }));
                  setBarcodeError(null);
                  speak(`Đã quét được mã vạch: ${barcode}`);
                }
              }}
              onError={(error) => {
                setBarcodeError(error);
                setTimeout(() => setBarcodeError(null), 5000);
              }}
              className="mb-3"
            />

            {/* Barcode error display */}
            {barcodeError && (
              <div className="mb-3 p-3 bg-orange-100 border border-orange-300 rounded-lg">
                <div className="flex items-center text-orange-700">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">{barcodeError}</span>
                </div>
              </div>
            )}
            <input
              type="text"
              value={currentItem.barcode || ""}
              onChange={(e) => setCurrentItem(prev => ({ ...prev, barcode: e.target.value }))}
              className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Hoặc nhập mã tay tại đây..."
            />
          </div>

          {/* Smart Image Check Display */}
          {(currentItem.product_name.trim() || currentItem.barcode?.trim()) && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              {productImageCheck.hasImage ? (
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={productImageCheck.imageUrl}
                      alt="Product"
                      className="w-20 h-20 object-cover rounded-lg border-2 border-green-300"
                    />
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-bold text-green-600 mb-1">
                      ✅ SẢN PHẨM CÓ ẢNH RỒI
                    </div>
                    <div className="text-gray-600">
                      Không cần chụp ảnh nữa ạ
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-orange-500 mr-2" />
                    <div className="text-lg font-bold text-orange-600">
                      CHƯA CÓ ẢNH SẢN PHẨM
                    </div>
                  </div>

                  {/* Large Capture Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-1/2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-6 px-8 rounded-lg text-xl shadow-lg transform transition-all hover:scale-105 animate-pulse"
                  >
                    📷 CHỤP ẢNH MẪU
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileCapture}
                    className="hidden"
                  />

                  <div className="text-gray-600 mt-3">
                    Bác chụp giúp cháu một tấm ảnh nhé
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Captured Image Preview */}
          {capturedImage && (
            <div className="mb-6">
              <label className="block text-lg font-bold text-gray-800 mb-3">
                ẢNH ĐÃ CHỤP
              </label>
              <div className="relative">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-48 object-cover rounded-lg border-2 border-blue-300"
                />
                <button
                  onClick={() => {
                    setCapturedImage(null);
                    setCurrentItem(prev => ({ ...prev, image_url: undefined }));
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Quantity Input */}
          <div className="mb-6">
            <label className="block text-lg font-bold text-gray-800 mb-3">
              SỐ LƯỢNG
            </label>
            <input
              ref={quantityInputRef}
              type="number"
              value={currentItem.quantity || ""}
              onChange={(e) => handleQuantityChange(e.target.value)}
              className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Nhập số lượng..."
              min="1"
            />
          </div>

          {/* Import Price Input */}
          <div className="mb-6">
            <label className="block text-lg font-bold text-gray-800 mb-3">
              GIÁ NHẬP (MỖI SẢN PHẨM)
            </label>
            <input
              ref={priceInputRef}
              type="number"
              value={currentItem.import_price || ""}
              onChange={(e) => handlePriceChange(e.target.value)}
              className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Nhập giá nhập..."
              min="0"
            />
            {currentItem.import_price > 0 && (
              <div className="mt-2 text-lg font-semibold text-green-600">
                Tổng chi phí: {formatCurrency(currentItem.quantity * currentItem.import_price)}
              </div>
            )}
          </div>

          {/* Supplier Input */}
          <div className="mb-6">
            <label className="block text-lg font-bold text-gray-800 mb-3">
              NHÀ CUNG CẤP (Không bắt buộc)
            </label>
            <input
              ref={supplierInputRef}
              type="text"
              value={currentItem.supplier_name || ""}
              onChange={(e) => setCurrentItem(prev => ({ ...prev, supplier_name: e.target.value }))}
              className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Nhập tên nhà cung cấp..."
            />
          </div>

          {/* Notes Input */}
          <div className="mb-8">
            <label className="block text-lg font-bold text-gray-800 mb-3">
              GHI CHÚ (Không bắt buộc)
            </label>
            <textarea
              ref={notesInputRef}
              value={currentItem.notes || ""}
              onChange={(e) => setCurrentItem(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none h-24 resize-none"
              placeholder="Nhập ghi chú..."
            />
          </div>
        </div>
      </div>

      {/* Sticky Save Button */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <button
          onClick={handleSave}
          disabled={isProcessing}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-6 px-8 rounded-lg text-xl shadow-lg transform transition-all hover:scale-105 disabled:scale-100"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent border-solid animate-spin rounded-full mr-3"></div>
              ĐANG LƯU...
            </div>
          ) : (
            "💾 LƯU VÀO KHO"
          )}
        </button>
      </div>

      {/* Bottom Navigation */}
      <MainBottomNavigation />
    </div>
  );
}