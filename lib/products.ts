import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// Product types
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  barcode: string;
  image_url: string | null;
  category: string;
  stock: number;
  created_at: string;
  updated_at: string;
}

// Lazy Supabase client initialization
let supabaseClient: any = null;

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Validate that we have proper Supabase credentials (not placeholder values)
    if (supabaseUrl && 
        supabaseAnonKey && 
        supabaseUrl !== 'your_supabase_project_url' && 
        supabaseAnonKey !== 'your_supabase_anon_key' &&
        supabaseUrl.startsWith('http')) {
      try {
        supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
      } catch (error) {
        console.warn('Failed to create Supabase client:', error);
      }
    }
  }
  return supabaseClient;
};

export const supabase = getSupabaseClient();

// Product management hooks
export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const client = getSupabaseClient();
      if (!client) {
        // Use fallback mock data when Supabase is not configured
        console.warn('Using mock products - Supabase not configured');
        const mockProducts: Product[] = [
          {
            id: '1',
            name: 'Cà Phê Đen',
            description: 'Cà phê đen truyền thống',
            price: 25000,
            barcode: '4901085000001',
            image_url: null,
            category: 'Cà Phê',
            stock: 100,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Cà Phê Sữa',
            description: 'Cà phê sữa tươi',
            price: 30000,
            barcode: '4901085000002',
            image_url: null,
            category: 'Cà Phê',
            stock: 50,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Trà Trân Châu',
            description: 'Trà trân châu đường đen',
            price: 35000,
            barcode: '4901085000003',
            image_url: null,
            category: 'Trà',
            stock: 30,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        setProducts(mockProducts);
        setError(null);
        setLoading(false);
        return;
      }

      const { data, error } = await client
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching products:', error);
        setError(error.message);
      } else {
        setProducts(data || []);
        setError(null);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error in fetchProducts:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
};

// Product management functions
export const ProductService = supabase ? {
  // Get all products
  async getProducts() {
    try {
      const client = getSupabaseClient();
      if (!client) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await client
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in ProductService.getProducts:', error);
      throw error;
    }
  },

  // Search products by name or barcode
  async searchProducts(query: string) {
    try {
      const client = getSupabaseClient();
      if (!client) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await client
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%, barcode.ilike.%${query}%`)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error searching products:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in ProductService.searchProducts:', error);
      throw error;
    }
  },

  // Get product by barcode
  async getProductByBarcode(barcode: string) {
    try {
      const client = getSupabaseClient();
      if (!client) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await client
        .from('products')
        .select('*')
        .eq('barcode', barcode)
        .single();

      if (error) {
        console.error('Error fetching product by barcode:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in ProductService.getProductByBarcode:', error);
      throw error;
    }
  },

  // Add new product
  async addProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const client = getSupabaseClient();
      if (!client) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await client
        .from('products')
        .insert([{
          ...product,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding product:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in ProductService.addProduct:', error);
      throw error;
    }
  },

  // Update product stock
  async updateStock(productId: string, quantity: number) {
    try {
      const client = getSupabaseClient();
      if (!client) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await client
        .from('products')
        .update({ stock: quantity })
        .eq('id', productId)
        .select()
        .single();

      if (error) {
        console.error('Error updating product stock:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in ProductService.updateStock:', error);
      throw error;
    }
  }
} : {
  // Fallback functions when Supabase is not configured
  getProducts: async () => {
    console.warn('Using mock products - Supabase not configured');
    return [];
  },
  searchProducts: async () => [],
  getProductByBarcode: async () => {
    throw new Error('Supabase not configured for barcode scanning');
  },
  addProduct: async () => {
    throw new Error('Supabase not configured for product management');
  },
  updateStock: async () => {
    throw new Error('Supabase not configured for stock management');
  }
};