-- Bảng products - Quản lý sản phẩm tạp hóa
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- Thông tin cơ bản
  name TEXT NOT NULL,
  barcode TEXT UNIQUE, -- Mã vạch duy nhất
  unit TEXT DEFAULT 'cái', -- Đơn vị tính (thùng, két, gói, chai, cái)
  
  -- Giá cả
  price_in INTEGER DEFAULT 0, -- Giá nhập vốn
  price_out INTEGER DEFAULT 0, -- Giá bán lãi
  margin_percentage INTEGER DEFAULT 0, -- % lãi (price_out - price_in) / price_in * 100
  
  -- Tồn kho
  quantity INTEGER DEFAULT 0, -- Số lượng hiện tại
  min_stock INTEGER DEFAULT 0, -- Tồn kho tối thiểu
  last_import_date TIMESTAMPTZ, -- Ngày nhập hàng cuối
  
  -- Media
  image_url TEXT, -- URL ảnh sản phẩm
  notes TEXT, -- Ghi chú
  
  -- Metadata
  category TEXT DEFAULT 'khác', -- Danh mục (nước giải khát, bia, mì, đồ ăn vặt, v.v.)
  supplier_name TEXT, -- Nhà cung cấp chính
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
  
  -- Constraints
  CONSTRAINT products_barcode_check CHECK (
    barcode IS NULL OR 
    (LENGTH(barcode) >= 8 AND LENGTH(barcode) <= 13)
  ),
  CONSTRAINT products_price_check CHECK (price_in >= 0 AND price_out >= 0),
  CONSTRAINT products_quantity_check CHECK (quantity >= 0)
);

-- Bảng import_logs - Lịch sử nhập hàng
CREATE TABLE IF NOT EXISTS import_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- Sản phẩm liên quan
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  barcode_scanned TEXT NOT NULL, -- Mã vạch khi nhập
  
  -- Thông tin nhập hàng
  quantity_added INTEGER NOT NULL, -- Số lượng nhập thêm
  import_price INTEGER NOT NULL, -- Giá nhập tại thời điểm nhập
  total_cost INTEGER NOT NULL, -- Tổng chi phí = quantity_added * import_price
  
  -- Metadata
  import_method TEXT DEFAULT 'barcode' CHECK (import_method IN ('barcode', 'voice', 'manual')),
  notes TEXT, -- Ghi chú khi nhập
  operator_name TEXT, -- Người nhập hàng
  
  -- Constraints
  CONSTRAINT import_logs_quantity_check CHECK (quantity_added > 0),
  CONSTRAINT import_logs_price_check CHECK (import_price >= 0)
);

-- Bảng import_batches - Batch hàng nhập (cho cùng lúc nhập nhiều sản phẩm)
CREATE TABLE IF NOT EXISTS import_batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  batch_name TEXT, -- Tên batch (ví dụ: "Nhập hàng ngày 20/01")
  supplier_name TEXT, -- Nhà cung cấp cho cả batch
  total_cost INTEGER DEFAULT 0, -- Tổng chi phí batch
  total_items INTEGER DEFAULT 0, -- Tổng số sản phẩm trong batch
  operator_name TEXT, -- Người thực hiện
  notes TEXT
);

-- Indexes cho performance
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_import_logs_created_at ON import_logs(created_at DESC);
CREATE INDEX idx_import_logs_product_id ON import_logs(product_id);
CREATE INDEX idx_import_batches_created_at ON import_batches(created_at DESC);

-- Trigger: Tự động cập nhật quantity và price_in khi có nhập hàng mới
CREATE OR REPLACE FUNCTION update_product_after_import()
RETURNS TRIGGER AS $$
BEGIN
  -- Cập nhật quantity (cộng dồn)
  UPDATE products 
  SET 
    quantity = quantity + NEW.quantity_added,
    price_in = NEW.import_price,
    last_import_date = NEW.created_at,
    updated_at = now()
  WHERE id = NEW.product_id;
  
  -- Nếu sản phẩm chưa có, tạo mới
  INSERT INTO products (
    id, name, barcode, unit, price_in, price_out, quantity, 
    created_at, updated_at, last_import_date
  )
  SELECT 
    NEW.product_id,
    COALESCE(p.name, 'Sản phẩm mới'),
    NEW.barcode_scanned,
    DEFAULT,
    NEW.import_price,
    NEW.import_price, -- Ban đầu giá nhập = giá bán
    NEW.quantity_added,
    NEW.created_at,
    NEW.created_at,
    NEW.created_at
  FROM (SELECT * FROM products p WHERE id = NEW.product_id) p
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger tự động kích hoạt
CREATE TRIGGER trigger_update_product_after_import
  AFTER INSERT ON import_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_product_after_import();

-- Trigger: Cập nhật updated_at khi sửa sản phẩm
CREATE OR REPLACE FUNCTION update_product_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products 
  SET updated_at = now() 
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_timestamp
  AFTER UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_timestamp();

-- Views cho dễ query
CREATE VIEW product_summary AS
SELECT 
  p.id,
  p.name,
  p.barcode,
  p.category,
  p.quantity,
  p.price_in,
  p.price_out,
  p.margin_percentage,
  p.image_url,
  p.supplier_name,
  p.last_import_date,
  COALESCE(il.total_imported, 0) as total_imported,
  COALESCE(il.total_cost_spent, 0) as total_cost_spent,
  p.updated_at
FROM products p
LEFT JOIN (
  SELECT 
    product_id,
    SUM(quantity_added) as total_imported,
    SUM(total_cost) as total_cost_spent
  FROM import_logs 
  GROUP BY product_id
) il ON p.id = il.product_id;

-- Function lấy lịch sử nhập hàng gần đây
CREATE OR REPLACE FUNCTION get_recent_imports(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  id UUID,
  created_at TIMESTAMPTZ,
  product_name TEXT,
  barcode_scanned TEXT,
  quantity_added INTEGER,
  import_price INTEGER,
  total_cost INTEGER,
  import_method TEXT,
  image_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    il.id,
    il.created_at,
    p.name as product_name,
    il.barcode_scanned,
    il.quantity_added,
    il.import_price,
    il.total_cost,
    il.import_method,
    p.image_url
  FROM import_logs il
  JOIN products p ON il.product_id = p.id
  WHERE il.created_at >= now() - (days_back || ' days')::interval
  ORDER BY il.created_at DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Comments cho tables
COMMENT ON TABLE products IS 'Bảng sản phẩm tạp hóa';
COMMENT ON TABLE import_logs IS 'Lịch sử nhập hàng';
COMMENT ON TABLE import_batches IS 'Batch nhập hàng';

COMMENT ON COLUMN products.barcode IS 'Mã vạch duy nhất, có thể null cho hàng không có mã';
COMMENT ON COLUMN products.price_in IS 'Giá nhập vốn (giá gốc)';
COMMENT ON COLUMN products.price_out IS 'Giá bán lãi (giá sàn)';
COMMENT ON COLUMN products.margin_percentage IS 'Phần trăm lãi: (price_out - price_in) / price_in * 100';
COMMENT ON COLUMN import_logs.import_method IS 'Phương thức nhập: barcode, voice, manual';