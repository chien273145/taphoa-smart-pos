-- Tạo bảng import_history để lưu lịch sử nhập hàng
CREATE TABLE IF NOT EXISTS import_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  product_name TEXT NOT NULL,
  barcode TEXT,
  quantity INTEGER NOT NULL,
  import_price INTEGER NOT NULL,
  total_cost INTEGER NOT NULL,
  supplier_name TEXT,
  image_url TEXT,
  notes TEXT,
  status TEXT DEFAULT 'completed' NOT NULL,
  -- Constraint để đảm bảo status hợp lệ
  CONSTRAINT status_check CHECK (status IN ('completed', 'pending', 'cancelled'))
);

-- Tạo index để tăng performance khi query
CREATE INDEX idx_import_history_created_at ON import_history(created_at DESC);
CREATE INDEX idx_import_history_barcode ON import_history(barcode);
CREATE INDEX idx_import_history_status ON import_history(status);

-- Thêm comment cho bảng
COMMENT ON TABLE import_history IS 'Lịch sử nhập hàng tạp hóa';
COMMENT ON COLUMN import_history.import_price IS 'Giá nhập mỗi sản phẩm';
COMMENT ON COLUMN import_history.total_cost IS 'Tổng chi phí = quantity * import_price';
COMMENT ON COLUMN import_history.image_url IS 'Ảnh sản phẩm (nếu có)';