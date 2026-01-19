import { createClient } from '@supabase/supabase-js'

// Lazy initialization - only create client when needed
let supabaseClient: any = null;

const getSupabaseClient = () => {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseAnonKey) {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    }
  }
  return supabaseClient;
};

export const supabase = getSupabaseClient();

// Order types
export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface CustomerInfo {
  name?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface Order {
  id?: string;
  created_at?: string;
  total_amount: number;
  items: OrderItem[];
  payment_method: 'QR_TRANSFER' | 'CASH' | 'BANK_TRANSFER' | 'OTHER';
  customer_info?: CustomerInfo;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  updated_at?: string;
}

// Order management functions
export const OrderService = {
  // Helper to get client
  getClient: () => {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
    }
    return client;
  },
  // Save new order
  async saveOrder(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const client = this.getClient();
      const { data, error } = await client
        .from('orders')
        .insert([{
          ...orderData,
          status: 'completed', // Default to completed for POS
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error saving order:', error);
        throw error;
      }

      console.log('Order saved successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in OrderService.saveOrder:', error);
      throw error;
    }
  },

  // Get all orders with pagination
  async getOrders(limit: number = 50, offset: number = 0) {
    try {
      const { data, error } = await client
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in OrderService.getOrders:', error);
      throw error;
    }
  },

  // Get orders by date range
  async getOrdersByDateRange(startDate: string, endDate: string) {
    try {
      const { data, error } = await client
        .from('orders')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders by date range:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in OrderService.getOrdersByDateRange:', error);
      throw error;
    }
  },

  // Get today's orders
  async getTodayOrders() {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    
    return this.getOrdersByDateRange(today, tomorrow);
  },

  // Calculate daily revenue
  async getDailyRevenue(date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const nextDay = new Date(new Date(targetDate).getTime() + 86400000).toISOString();
    
    try {
      const { data, error } = await client
        .from('orders')
        .select('total_amount')
        .gte('created_at', targetDate)
        .lt('created_at', nextDay)
        .eq('status', 'completed');

      if (error) {
        console.error('Error calculating daily revenue:', error);
        throw error;
      }

      const totalRevenue = (data || []).reduce((sum, order) => sum + order.total_amount, 0);
      const orderCount = (data || []).length;
      
      return {
        date: targetDate,
        totalRevenue,
        orderCount,
        avgOrderValue: orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0
      };
    } catch (error) {
      console.error('Error in OrderService.getDailyRevenue:', error);
      throw error;
    }
  },

  // Search orders
  async searchOrders(query: string) {
    try {
      const { data, error } = await client
        .from('orders')
        .select('*')
        .or(`notes.ilike.%${query}%, customer_info->>name.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error searching orders:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in OrderService.searchOrders:', error);
      throw error;
    }
  }
};