import { Product } from './types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Bia 333',
    price: 12000,
    barcode: '8938501012345',
    image_url: null,
    category: 'Đồ uống có cồn'
  },
  {
    id: '2',
    name: 'Bia Tiger',
    price: 14000,
    barcode: '8938501023456',
    image_url: null,
    category: 'Đồ uống có cồn'
  },
  {
    id: '3',
    name: 'Coca Cola 330ml',
    price: 8000,
    barcode: '8938501034567',
    image_url: null,
    category: 'Nước ngọt'
  },
  {
    id: '4',
    name: 'Pepsi 330ml',
    price: 8000,
    barcode: '8938501045678',
    image_url: null,
    category: 'Nước ngọt'
  },
  {
    id: '5',
    name: 'Nước đóng chai Lavie 1.5L',
    price: 10000,
    barcode: '8938501056789',
    image_url: null,
    category: 'Nước uống'
  },
  {
    id: '6',
    name: 'Sữa tươi Vinamilk 1L',
    price: 32000,
    barcode: '8938501067890',
    image_url: null,
    category: 'Sữa'
  },
  {
    id: '7',
    name: 'Mì Hảo Hảo Tôm Chua Cay',
    price: 4500,
    barcode: '8938501078901',
    image_url: null,
    category: 'Mì ăn liền'
  },
  {
    id: '8',
    name: 'Mì Omachi Hải Sản',
    price: 8500,
    barcode: '8938501089012',
    image_url: null,
    category: 'Mì ăn liền'
  },
  {
    id: '9',
    name: 'Bánh mì tươi',
    price: 5000,
    barcode: '8938501090123',
    image_url: null,
    category: 'Bánh mì'
  },
  {
    id: '10',
    name: 'Dầu ăn Neptune 1L',
    price: 48000,
    barcode: '8938501101234',
    image_url: null,
    category: 'Dầu ăn'
  },
  {
    id: '11',
    name: 'Rau muống 500g',
    price: 15000,
    barcode: null,
    image_url: null,
    category: 'Rau củ'
  },
  {
    id: '12',
    name: 'Cà chua 500g',
    price: 18000,
    barcode: null,
    image_url: null,
    category: 'Rau củ'
  },
  {
    id: '13',
    name: 'Trứng gà 10 quả',
    price: 35000,
    barcode: null,
    image_url: null,
    category: 'Trứng'
  },
  {
    id: '14',
    name: 'Thịt heo ba chỉ 500g',
    price: 85000,
    barcode: null,
    image_url: null,
    category: 'Thịt'
  },
  {
    id: '15',
    name: 'Cá basa 500g',
    price: 55000,
    barcode: null,
    image_url: null,
    category: 'Cá'
  },
  {
    id: '16',
    name: 'Tỏi 200g',
    price: 12000,
    barcode: null,
    image_url: null,
    category: 'Gia vị'
  },
  {
    id: '17',
    name: 'Hành tây 300g',
    price: 8000,
    barcode: null,
    image_url: null,
    category: 'Rau củ'
  },
  {
    id: '18',
    name: 'Chuối chín 1kg',
    price: 25000,
    barcode: null,
    image_url: null,
    category: 'Trái cây'
  },
  {
    id: '19',
    name: 'Cơm trắng phần',
    price: 10000,
    barcode: null,
    image_url: null,
    category: 'Cơm'
  },
  {
    id: '20',
    name: 'Canh rau muống phần',
    price: 15000,
    barcode: null,
    image_url: null,
    category: 'Canh'
  }
];

export const findProductByBarcode = (barcode: string): Product | undefined => {
  return mockProducts.find(p => p.barcode === barcode);
};

export const findProductByName = (name: string): Product | undefined => {
  return mockProducts.find(p => p.name.toLowerCase().includes(name.toLowerCase()));
};

export const findProductById = (id: string): Product | undefined => {
  return mockProducts.find(p => p.id === id);
};