import { getSupabaseClient } from './products';

// Product types
export interface Product {
  id: string;
  name: string;
  barcode?: string;
  unit: string;
  price_in: number; // Giá nhập vốn
  price_out: number; // Giá bán lãi
  margin_percentage: number;
  quantity: number;
  min_stock: number;
  last_import_date?: string;
  image_url?: string;
  notes?: string;
  category: string;
  supplier_name?: string;
  status: 'active' | 'inactive' | 'discontinued';
  created_at: string;
  updated_at: string;
}

export interface ImportLog {
  id: string;
  created_at: string;
  product_id: string;
  barcode_scanned: string;
  quantity_added: number;
  import_price: number;
  total_cost: number;
  import_method: 'barcode' | 'voice' | 'manual';
  notes?: string;
  operator_name?: string;
}

export interface ImportHistory {
  id: string;
  created_at: string;
  product_name: string;
  barcode_scanned: string;
  quantity_added: number;
  import_price: number;
  total_cost: number;
  import_method: 'barcode' | 'voice' | 'manual';
  image_url?: string;
}

// Product Service
export const ProductService = {
  // Tìm sản phẩm theo barcode
  async findByBarcode(barcode: string): Promise<Product | null> {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return null;
      }

      const { data, error } = await client
        .from('products')
        .select('*')
        .eq('barcode', barcode)
        .single();

      if (error) {
        console.error('Error finding product by barcode:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in ProductService.findByBarcode:', error);
      return null;
    }
  },

  // Tìm sản phẩm theo tên
  async findByName(name: string): Promise<Product[]> {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return [];
      }

      const { data, error } = await client
        .from('products')
        .select('*')
        .ilike('name', `%${name}%`)
        .limit(10);

      if (error) {
        console.error('Error finding products by name:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in ProductService.findByName:', error);
      return [];
    }
  },

  // Thêm sản phẩm mới
  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    try {
      const client = getSupabaseClient();
      if (!client) {
        throw new Error('Supabase not configured');
      }

      // Tự động tính margin_percentage
      const marginPercentage = product.price_in > 0 
        ? Math.round(((product.price_out - product.price_in) / product.price_in) * 100)
        : 0;

      const { data, error } = await client
        .from('products')
        .insert([{
          ...product,
          margin_percentage: marginPercentage
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating product:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in ProductService.create:', error);
      throw error;
    }
  },

  // Cập nhật sản phẩm
  async update(id: string, updates: Partial<Product>): Promise<Product> {
    try {
      const client = getSupabaseClient();
      if (!client) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await client
        .from('products')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating product:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in ProductService.update:', error);
      throw error;
    }
  }
};

// Import Service
export const ImportService = {
  // Ghi nhận hàng
  async logImport(importData: Omit<ImportLog, 'id' | 'created_at'>): Promise<ImportLog> {
    try {
      const client = getSupabaseClient();
      if (!client) {
        throw new Error('Supabase not configured');
      }

      const { data, error } = await client
        .from('import_logs')
        .insert([importData])
        .select()
        .single();

      if (error) {
        console.error('Error logging import:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in ImportService.logImport:', error);
      throw error;
    }
  },

  // Lấy lịch sử nhập hàng gần đây
  async getRecentImports(daysBack: number = 7): Promise<ImportHistory[]> {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return [];
      }

      const { data, error } = await client
        .from('import_logs')
        .select(`
          id,
          created_at,
          barcode_scanned,
          quantity_added,
          import_price,
          total_cost,
          import_method,
          notes
        `)
        .gte('created_at', new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error getting recent imports:', error);
        return [];
      }

      // Join với products để lấy tên và ảnh
      const importsWithProductInfo = await Promise.all(
        (data || []).map(async (import_) => {
          const { data: product } = await client
            .from('products')
            .select('name, image_url')
            .eq('id', import_.product_id)
            .single();

          return {
            ...import_,
            product_name: product?.name || 'Sản phẩm không xác định',
            image_url: product?.image_url
          };
        })
      );

      return importsWithProductInfo;
    } catch (error) {
      console.error('Error in ImportService.getRecentImports:', error);
      return [];
    }
  },

  // Thống kê nhập hàng
  async getImportStats(daysBack: number = 30): Promise<{
    totalImports: number;
    totalItems: number;
    totalCost: number;
    methodBreakdown: {
      barcode: number;
      voice: number;
      manual: number;
    };
  }> {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return {
          totalImports: 0,
          totalItems: 0,
          totalCost: 0,
          methodBreakdown: { barcode: 0, voice: 0, manual: 0 }
        };
      }

      const { data, error } = await client
        .from('import_logs')
        .select('quantity_added, total_cost, import_method')
        .gte('created_at', new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        console.error('Error getting import stats:', error);
        return {
          totalImports: 0,
          totalItems: 0,
          totalCost: 0,
          methodBreakdown: { barcode: 0, voice: 0, manual: 0 }
        };
      }

      const stats = (data || []).reduce((acc, item) => {
        acc.totalImports += 1;
        acc.totalItems += item.quantity_added;
        acc.totalCost += item.total_cost;
        acc.methodBreakdown[item.import_method] += 1;
        return acc;
      }, {
        totalImports: 0,
        totalItems: 0,
        totalCost: 0,
        methodBreakdown: { barcode: 0, voice: 0, manual: 0 }
      });

      return stats;
    } catch (error) {
      console.error('Error in ImportService.getImportStats:', error);
      return {
        totalImports: 0,
        totalItems: 0,
        totalCost: 0,
        methodBreakdown: { barcode: 0, voice: 0, manual: 0 }
      };
    }
  }
};