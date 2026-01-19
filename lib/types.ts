export interface Product {
  id: string;
  name: string;
  price: number;
  barcode: string | null;
  image_url: string | null;
  category: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}