-- Create orders table for storing payment history
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    total_amount INTEGER NOT NULL,
    items JSONB NOT NULL,
    payment_method TEXT DEFAULT 'QR_TRANSFER',
    customer_info JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'completed',
    notes TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);

-- Add comments for documentation
COMMENT ON TABLE orders IS 'Lịch sử đơn hàng đã thanh toán';
COMMENT ON COLUMN orders.id IS 'ID duy nhất của đơn hàng';
COMMENT ON COLUMN orders.created_at IS 'Thời gian tạo đơn hàng';
COMMENT ON COLUMN orders.total_amount IS 'Tổng tiền đơn hàng (đồng)';
COMMENT ON COLUMN orders.items IS 'Danh sách sản phẩm trong đơn hàng (JSON)';
COMMENT ON COLUMN orders.payment_method IS 'Phương thức thanh toán (QR_TRANSFER, CASH, etc)';
COMMENT ON COLUMN orders.customer_info IS 'Thông tin khách hàng (tên, SĐT, địa chỉ - JSON)';
COMMENT ON COLUMN orders.status IS 'Trạng thái đơn hàng (pending, completed, cancelled)';
COMMENT ON COLUMN orders.notes IS 'Ghi chú đơn hàng';
COMMENT ON COLUMN orders.updated_at IS 'Thời gian cập nhật cuối cùng';

-- Enable Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to manage their orders
CREATE POLICY "Users can manage their orders" ON orders
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Optional: Create view for order statistics
CREATE OR REPLACE VIEW order_summary AS
SELECT 
    DATE_TRUNC('day', created_at) as order_date,
    COUNT(*) as order_count,
    SUM(total_amount) as daily_revenue,
    AVG(total_amount) as avg_order_value
FROM orders 
WHERE status = 'completed'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY order_date DESC;