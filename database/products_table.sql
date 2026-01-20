-- Create products table for real product management
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    barcode VARCHAR(255) UNIQUE NOT NULL,
    image_url TEXT,
    category VARCHAR(100) DEFAULT 'uncategorized',
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Add comments for documentation
COMMENT ON TABLE products IS 'Danh sách sản phẩm cho Tạp Hóa Smart POS';
COMMENT ON COLUMN products.id IS 'ID duy nhất của sản phẩm (UUID tự động sinh)';
COMMENT ON COLUMN products.name IS 'Tên sản phẩm';
COMMENT ON COLUMN products.description IS 'Mô tả chi tiết sản phẩm';
COMMENT ON COLUMN products.price IS 'Giá bán (đồng)';
COMMENT ON COLUMN products.barcode IS 'Mã vạch sản phẩm (duy nhất)';
COMMENT ON COLUMN products.image_url IS 'URL hình ảnh sản phẩm';
COMMENT ON COLUMN products.category IS 'Danh mục sản phẩm';
COMMENT ON COLUMN products.stock IS 'Số lượng tồn kho';
COMMENT ON COLUMN products.created_at IS 'Thời gian tạo sản phẩm';
COMMENT ON COLUMN products.updated_at IS 'Thời gian cập nhật sản phẩm';

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to manage products
CREATE POLICY "Users can manage products" ON products
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Optional: Create view for product statistics
CREATE OR REPLACE VIEW product_summary AS
SELECT 
    category,
    COUNT(*) as product_count,
    SUM(stock) as total_stock,
    AVG(price) as avg_price
FROM products 
GROUP BY category
ORDER BY total_stock DESC;

-- Insert some sample products for testing
INSERT INTO products (name, description, price, barcode, category, stock) VALUES
('Cà phốt', 'Cà phốt Sài Gòn ngon', 15000, '8901234567890', 'vegetables', 50),
('Trứng trứng', 'Trứng tươi gà taây', 3500, '8901234567891', 'protein', 100),
('Tôm sú', 'Tôm sú tươi size vừa', 80000, '8901234567892', 'seafood', 75),
('Nước suối', 'Nước suối đóng chai 500ml', 10000, '8901234567893', 'beverages', 200),
('Bánh mì', 'Bánh mì Hảo Hảo ly', 5000, '8901234567894', 'instant', 150),
('Sữa tươi', 'Sữa tươi Vinamil 1L', 25000, '8901234567895', 'dairy', 80),
('Gạo', 'Gạo ST25 5kg', 120000, '8901234567896', 'grains', 60),
('Dầu ăn', 'Dầu hào 1L', 45000, '8901234567897', 'cooking', 40),
('Mì chính', 'Mì chính Apollo 500g', 15000, '8901234567898', 'instant', 120),
('Kem đánh răng', 'Kem đánh răng Colgate 100g', 30000, '8901234567899', 'hygiene', 60),
('Xà phòng', 'Xà phòng Comfort 500ml', 85000, '8901234567900', 'hygiene', 30),
('Giấy ăn', 'Giấy ăn 5 cuộn', 45000, '8901234567901', 'household', 25),
('Dầu gội', 'Dầu gội Sunsilk 700ml', 120000, '8901234567902', 'cooking', 50),
('Bia', 'Bia Tiger 330ml lon', 25000, '8901234567903', 'beverages', 100),
('Nước ngọt', 'Nước ngọt Coca Cola 330ml', 12000, '8901234567904', 'beverages', 150),
('Khăn giấy', 'Khăn giấy 10 cuộn', 35000, '8901234567905', 'household', 50),
('Xà bông', 'Xà bông Comfort 200g', 25000, '8901234567906', 'hygiene', 40),
('Chân gà', 'Chân gà tươi 1kg', 150000, '8901234567907', 'protein', 30),
('Thịt đông lạnh', 'Thịt ba chỉ đông lạnh 1kg', 250000, '8901234567908', 'protein', 20);