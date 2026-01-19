"use client";

import React, { useState } from "react";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import MainBottomNavigation from "@/components/MainBottomNavigation";

interface ImportItem {
  name: string;
  importPrice: number;
  sellPrice: number;
  quantity: number;
}

export default function ImportPage() {
  const [items, setItems] = useState<ImportItem[]>([]);
  const [currentItem, setCurrentItem] = useState<ImportItem>({
    name: "",
    importPrice: 0,
    sellPrice: 0,
    quantity: 1,
  });
  const { isListening, transcript, startListening, stopListening, speak } = useVoiceAssistant();

  // Parse voice command for import
  const parseImportCommand = (command: string): ImportItem | null => {
    try {
      // Regex patterns for different command formats
      const patterns = [
        // "Nhập 10 thùng bia Tiger giá bán 320 nghìn"
        /nhập\s+(\d+)\s*(?:thùng|chai|cái|lon|hộp)?\s*([^\d]+?)\s*giá\s*bán\s*(\d+(?:\.\d+)?)\s*(?:nghìn|ngàn|k|đ)?/i,
        // "Bia Tiger 10 cái giá bán 320"
        /([^\d]+?)\s*(\d+)\s*(?:thùng|chai|cái|lon|hộp)?\s*giá\s*bán\s*(\d+(?:\.\d+)?)/i,
        // "Nhập bia Tiger số lượng 10 giá 320"
        /nhập\s*([^\d]+?)\s*số\s*lượng\s*(\d+)\s*giá\s*(\d+(?:\.\d+)?)/i,
      ];

      for (const pattern of patterns) {
        const match = command.toLowerCase().match(pattern);
        if (match) {
          let quantity = parseInt(match[1]) || parseInt(match[2]) || 1;
          let name = match[2] || match[1];
          let price = parseFloat(match[3] || match[4]) || 0;

          // Clean up product name
          name = name.trim().replace(/\s+/g, ' ');
          
          // Handle price units
          if (command.toLowerCase().includes('nghìn') || command.toLowerCase().includes('ngàn') || command.toLowerCase().includes('k')) {
            price = price * 1000;
          }

          return {
            name: name.charAt(0).toUpperCase() + name.slice(1),
            importPrice: Math.round(price * 0.7), // Assume import price is 70% of sell price
            sellPrice: Math.round(price),
            quantity: quantity,
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error parsing import command:", error);
      return null;
    }
  };

  // Handle voice input
  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Process transcript when voice input ends
  React.useEffect(() => {
    if (transcript && !isListening) {
      const parsed = parseImportCommand(transcript);
      
      if (parsed) {
        setCurrentItem(parsed);
        speak(`Đã nhập ${parsed.name}, số lượng ${parsed.quantity}, giá bán ${parsed.sellPrice.toLocaleString()} đồng`);
      } else {
        speak("Không hiểu lệnh. Vui lòng thử lại.");
      }
    }
  }, [transcript, isListening, speak]);

  const addItem = () => {
    if (currentItem.name && currentItem.sellPrice > 0) {
      setItems([...items, { ...currentItem }]);
      setCurrentItem({
        name: "",
        importPrice: 0,
        sellPrice: 0,
        quantity: 1,
      });
      speak(`Đã thêm ${currentItem.name} vào danh sách nhập hàng`);
    }
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const saveImport = () => {
    if (items.length > 0) {
      speak(`Đã lưu ${items.length} sản phẩm nhập hàng`);
      // Here you would normally save to database
      console.log("Import items:", items);
      setItems([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-purple-600 text-white p-4">
        <h1 className="text-2xl font-bold text-center">Nhập Hàng Thông Minh</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 pb-20">
        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-lg font-bold mb-4">Nhập sản phẩm mới</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tên sản phẩm</label>
              <input
                type="text"
                value={currentItem.name}
                onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                className="w-full p-3 border rounded-lg text-lg"
                placeholder="Nhập tên sản phẩm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Giá nhập</label>
                <input
                  type="number"
                  value={currentItem.importPrice}
                  onChange={(e) => setCurrentItem({ ...currentItem, importPrice: parseInt(e.target.value) || 0 })}
                  className="w-full p-3 border rounded-lg text-lg"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Giá bán</label>
                <input
                  type="number"
                  value={currentItem.sellPrice}
                  onChange={(e) => setCurrentItem({ ...currentItem, sellPrice: parseInt(e.target.value) || 0 })}
                  className="w-full p-3 border rounded-lg text-lg"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Số lượng</label>
              <input
                type="number"
                value={currentItem.quantity}
                onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 1 })}
                className="w-full p-3 border rounded-lg text-lg"
                placeholder="1"
                min="1"
              />
            </div>

            {/* Voice Input Button */}
            <button
              onClick={handleVoiceInput}
              className={`w-full ${
                isListening 
                  ? "bg-red-500 animate-pulse" 
                  : "bg-purple-500 hover:bg-purple-600"
              } text-white py-6 rounded-lg font-bold text-lg transition-colors flex items-center justify-center space-x-3`}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span>{isListening ? "ĐANG NGHE..." : "BẬT MIC NÓI ĐỂ NHẬP"}</span>
            </button>

            {transcript && (
              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Đã nghe thấy:</p>
                <p className="font-medium">{transcript}</p>
              </div>
            )}

            <button
              onClick={addItem}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold text-lg transition-colors"
            >
              Thêm vào danh sách
            </button>
          </div>
        </div>

        {/* Import List */}
        {items.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-bold mb-4">Danh sách nhập hàng ({items.length})</h2>
            
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="border rounded-lg p-3 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      SL: {item.quantity} | Nhập: {item.importPrice.toLocaleString()}đ | Bán: {item.sellPrice.toLocaleString()}đ
                    </p>
                    <p className="text-sm font-medium text-green-600">
                      Lợi nhuận: {((item.sellPrice - item.importPrice) * item.quantity).toLocaleString()}đ
                    </p>
                  </div>
                  
                  <button
                    onClick={() => removeItem(index)}
                    className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={saveImport}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-bold text-lg transition-colors mt-4"
            >
              Lưu nhập hàng
            </button>
          </div>
        )}
      </div>

      {/* Main Bottom Navigation */}
      <MainBottomNavigation />
    </div>
  );
}