import { getSupabaseClient } from './products';

// Order types
export interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  items: OrderItem[];
  payment_method: 'CASH' | 'QR_TRANSFER' | 'DEBT';
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  notes?: string;
  status: 'completed' | 'pending';
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// Order management service
export const OrderService = {
  // Save new order
  async saveOrder(orderData: Omit<Order, 'id' | 'created_at'>) {
    try {
      const client = getSupabaseClient();
      if (!client) {
        console.warn('Using mock order save - Supabase not configured');
        return await this.mockSaveOrder(orderData);
      }

      const { data, error } = await client
        .from('orders')
        .insert([{
          total_amount: orderData.total_amount,
          items: orderData.items,
          payment_method: orderData.payment_method,
          customer_name: orderData.customer_name,
          customer_phone: orderData.customer_phone,
          customer_address: orderData.customer_address,
          notes: orderData.notes,
          status: orderData.status
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
      // Fallback to mock save if Supabase fails
      return await this.mockSaveOrder(orderData);
    }
  },

  // Mock save for when Supabase is not configured
  async mockSaveOrder(orderData: any) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockOrder = {
      id: `DH${Date.now().toString(36).toUpperCase()}`,
      created_at: new Date().toISOString(),
      ...orderData
    };
    
    console.log('Mock order saved:', mockOrder);
    
    // Store in localStorage for persistence
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    existingOrders.push(mockOrder);
    localStorage.setItem('orders', JSON.stringify(existingOrders));
    
    return mockOrder;
  },

  // Get all orders
  async getOrders(): Promise<Order[]> {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return await this.getMockOrders();
      }

      const { data, error } = await client
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      return data || [];

    } catch (error) {
      console.error('Error in OrderService.getOrders:', error);
      return await this.getMockOrders();
    }
  },

  // Get mock orders from localStorage
  async getMockOrders(): Promise<Order[]> {
    try {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      return orders.sort((a: Order, b: Order) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (error) {
      console.error('Error getting mock orders:', error);
      return [];
    }
  },

  // Get orders by date range
  async getOrdersByDateRange(startDate: string, endDate: string): Promise<Order[]> {
    try {
      const client = getSupabaseClient();
      if (!client) {
        const orders = await this.getMockOrders();
        return orders.filter(order => {
          const orderDate = new Date(order.created_at).toISOString().split('T')[0];
          return orderDate >= startDate && orderDate <= endDate;
        });
      }

      const { data, error } = await client
        .from('orders')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate + 'T23:59:59.999Z')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders by date range:', error);
        throw error;
      }

      return data || [];

    } catch (error) {
      console.error('Error in OrderService.getOrdersByDateRange:', error);
      return [];
    }
  },

  // Get revenue statistics
  async getRevenueStats(startDate?: string, endDate?: string): Promise<{
    totalRevenue: number;
    totalOrders: number;
    cashRevenue: number;
    qrRevenue: number;
    debtRevenue: number;
    pendingDebt: number;
  }> {
    try {
      const orders = startDate && endDate 
        ? await this.getOrdersByDateRange(startDate, endDate)
        : await this.getOrders();

      const stats = orders.reduce((acc, order) => {
        acc.totalRevenue += order.total_amount;
        acc.totalOrders += 1;

        switch (order.payment_method) {
          case 'CASH':
            acc.cashRevenue += order.total_amount;
            break;
          case 'QR_TRANSFER':
            acc.qrRevenue += order.total_amount;
            break;
          case 'DEBT':
            acc.debtRevenue += order.total_amount;
            if (order.status === 'pending') {
              acc.pendingDebt += order.total_amount;
            }
            break;
        }

        return acc;
      }, {
        totalRevenue: 0,
        totalOrders: 0,
        cashRevenue: 0,
        qrRevenue: 0,
        debtRevenue: 0,
        pendingDebt: 0
      });

      return stats;

    } catch (error) {
      console.error('Error calculating revenue stats:', error);
      return {
        totalRevenue: 0,
        totalOrders: 0,
        cashRevenue: 0,
        qrRevenue: 0,
        debtRevenue: 0,
        pendingDebt: 0
      };
    }
  },

  // Update order status (useful for debt payments)
  async updateOrderStatus(orderId: string, status: 'completed' | 'pending') {
    try {
      const client = getSupabaseClient();
      if (!client) {
        // Update mock order in localStorage
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const orderIndex = orders.findIndex((order: Order) => order.id === orderId);
        if (orderIndex !== -1) {
          orders[orderIndex].status = status;
          localStorage.setItem('orders', JSON.stringify(orders));
          return orders[orderIndex];
        }
        throw new Error('Order not found');
      }

      const { data, error } = await client
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('Error updating order status:', error);
        throw error;
      }

      return data;

    } catch (error) {
      console.error('Error in OrderService.updateOrderStatus:', error);
      throw error;
    }
  }
};