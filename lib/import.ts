import { getSupabaseClient } from './products';
import { Product } from './products';

// Import types
export interface ImportHistory {
  id: string;
  created_at: string;
  product_name: string;
  barcode?: string;
  quantity: number;
  import_price: number;
  total_cost: number;
  supplier_name?: string;
  image_url?: string;
  notes?: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export interface ImportItem {
  product_name: string;
  barcode?: string;
  quantity: number;
  import_price: number;
  supplier_name?: string;
  image_url?: string;
  notes?: string;
}

// Import management service
export const ImportService = {
  // Save import record
  async saveImport(importData: Omit<ImportHistory, 'id' | 'created_at'>) {
    try {
      const client = getSupabaseClient();
      if (!client) {
        console.warn('Using mock import save - Supabase not configured');
        return await this.mockSaveImport(importData);
      }

      const { data, error } = await client
        .from('import_history')
        .insert([{
          product_name: importData.product_name,
          barcode: importData.barcode,
          quantity: importData.quantity,
          import_price: importData.import_price,
          total_cost: importData.total_cost,
          supplier_name: importData.supplier_name,
          image_url: importData.image_url,
          notes: importData.notes,
          status: importData.status
        }])
        .select()
        .single();

      if (error) {
        console.error('Error saving import:', error);
        throw error;
      }

      console.log('Import saved successfully:', data);
      return data;

    } catch (error) {
      console.error('Error in ImportService.saveImport:', error);
      // Fallback to mock save if Supabase fails
      return await this.mockSaveImport(importData);
    }
  },

  // Mock save for when Supabase is not configured
  async mockSaveImport(importData: any) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockImport = {
      id: `NH${Date.now().toString(36).toUpperCase()}`,
      created_at: new Date().toISOString(),
      ...importData
    };
    
    console.log('Mock import saved:', mockImport);
    
    // Store in localStorage for persistence
    const existingImports = JSON.parse(localStorage.getItem('import_history') || '[]');
    existingImports.push(mockImport);
    localStorage.setItem('import_history', JSON.stringify(existingImports));
    
    return mockImport;
  },

  // Get all import records
  async getImports(): Promise<ImportHistory[]> {
    try {
      const client = getSupabaseClient();
      if (!client) {
        return await this.getMockImports();
      }

      const { data, error } = await client
        .from('import_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching imports:', error);
        throw error;
      }

      return data || [];

    } catch (error) {
      console.error('Error in ImportService.getImports:', error);
      return await this.getMockImports();
    }
  },

  // Get mock imports from localStorage
  async getMockImports(): Promise<ImportHistory[]> {
    try {
      const imports = JSON.parse(localStorage.getItem('import_history') || '[]');
      return imports.sort((a: ImportHistory, b: ImportHistory) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (error) {
      console.error('Error getting mock imports:', error);
      return [];
    }
  },

  // Check if product has image in database
  async checkProductImage(productName: string, barcode?: string): Promise<{
    hasImage: boolean;
    imageUrl?: string;
    product?: Product;
  }> {
    try {
      const client = getSupabaseClient();
      if (!client) {
        // Fallback to mock check
        return await this.mockCheckProductImage(productName, barcode);
      }

      let query = client.from('products').select('*');
      
      if (barcode) {
        query = query.eq('barcode', barcode);
      } else {
        query = query.ilike('name', `%${productName}%`);
      }

      const { data, error } = await query.limit(1);

      if (error) {
        console.error('Error checking product image:', error);
        return { hasImage: false };
      }

      const product = data?.[0];
      return {
        hasImage: !!product?.image_url,
        imageUrl: product?.image_url,
        product
      };

    } catch (error) {
      console.error('Error in ImportService.checkProductImage:', error);
      return { hasImage: false };
    }
  },

  // Mock check for when Supabase is not configured
  async mockCheckProductImage(productName: string, barcode?: string): Promise<{
    hasImage: boolean;
    imageUrl?: string;
    product?: Product;
  }> {
    // Simulate some products having images
    const productsWithImages = ['Cà Phê Đen', 'Cà Phê Sữa', 'Trà Trân Châu'];
    const hasImage = productsWithImages.some(name => 
      productName.toLowerCase().includes(name.toLowerCase())
    );

    if (hasImage) {
      return {
        hasImage: true,
        imageUrl: `https://picsum.photos/seed/${productName}/200/200.jpg`,
        product: {
          id: 'mock-' + Date.now(),
          name: productName,
          description: 'Mock product',
          price: 25000,
          barcode: barcode || 'MOCK' + Date.now(),
          image_url: `https://picsum.photos/seed/${productName}/200/200.jpg`,
          category: 'Mock',
          stock: 100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
    }

    return { hasImage: false };
  },

  // Get import statistics
  async getImportStats(startDate?: string, endDate?: string): Promise<{
    totalImports: number;
    totalCost: number;
    totalItems: number;
  }> {
    try {
      const imports = startDate && endDate 
        ? await this.getImportsByDateRange(startDate, endDate)
        : await this.getImports();

      const stats = imports.reduce((acc, import_) => {
        acc.totalImports += 1;
        acc.totalCost += import_.total_cost;
        acc.totalItems += import_.quantity;
        return acc;
      }, {
        totalImports: 0,
        totalCost: 0,
        totalItems: 0
      });

      return stats;

    } catch (error) {
      console.error('Error calculating import stats:', error);
      return {
        totalImports: 0,
        totalCost: 0,
        totalItems: 0
      };
    }
  },

  // Get imports by date range
  async getImportsByDateRange(startDate: string, endDate: string): Promise<ImportHistory[]> {
    try {
      const client = getSupabaseClient();
      if (!client) {
        const imports = await this.getMockImports();
        return imports.filter(import_ => {
          const importDate = new Date(import_.created_at).toISOString().split('T')[0];
          return importDate >= startDate && importDate <= endDate;
        });
      }

      const { data, error } = await client
        .from('import_history')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate + 'T23:59:59.999Z')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching imports by date range:', error);
        throw error;
      }

      return data || [];

    } catch (error) {
      console.error('Error in ImportService.getImportsByDateRange:', error);
      return [];
    }
  }
};