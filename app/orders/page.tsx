"use client";

import { useState, useEffect } from "react";
import { OrderService, Order } from "@/lib/orders";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [revenueStats, setRevenueStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    cashRevenue: 0,
    qrRevenue: 0,
    debtRevenue: 0,
    pendingDebt: 0
  });

  useEffect(() => {
    loadOrders();
  }, [selectedDateRange]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const [ordersData, stats] = await Promise.all([
        selectedDateRange.startDate && selectedDateRange.endDate
          ? OrderService.getOrdersByDateRange(selectedDateRange.startDate, selectedDateRange.endDate)
          : OrderService.getOrders(),
        OrderService.getRevenueStats(selectedDateRange.startDate, selectedDateRange.endDate)
      ]);
      
      setOrders(ordersData);
      setRevenueStats(stats);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: 'completed' | 'pending') => {
    try {
      await OrderService.updateOrderStatus(orderId, status);
      loadOrders(); // Refresh orders
      alert(`✅ Đã cập nhật trạng thái đơn hàng!`);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('❌ Lỗi cập nhật trạng thái đơn hàng!');
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'CASH': return '💵';
      case 'QR_TRANSFER': return '📱';
      case 'DEBT': return '📝';
      default: return '💰';
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'CASH': return 'Tiền mặt';
      case 'QR_TRANSFER': return 'Chuyển khoản';
      case 'DEBT': return 'Ghi nợ';
      default: return 'Khác';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'completed' ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100';
  };

  const getStatusName = (status: string) => {
    return status === 'completed' ? 'Hoàn thành' : 'Chờ thanh toán';
  };

  // Set default date range to today
  const setTodayRange = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDateRange({ startDate: today, endDate: today });
  };

  const setWeekRange = () => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    setSelectedDateRange({
      startDate: weekAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    });
  };

  const setMonthRange = () => {
    const today = new Date();
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    setSelectedDateRange({
      startDate: monthAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent border-solid animate-spin rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📊 Lịch sử đơn hàng</h1>
          <p className="text-gray-600">Quản lý đơn hàng và xem doanh thu</p>
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(revenueStats.totalRevenue)}</div>
            <div className="text-sm text-gray-600">Tổng doanh thu</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-blue-600">{revenueStats.totalOrders}</div>
            <div className="text-sm text-gray-600">Tổng đơn hàng</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-green-500">{formatCurrency(revenueStats.cashRevenue)}</div>
            <div className="text-sm text-gray-600">Tiền mặt</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-blue-500">{formatCurrency(revenueStats.qrRevenue)}</div>
            <div className="text-sm text-gray-600">Chuyển khoản</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(revenueStats.debtRevenue)}</div>
            <div className="text-sm text-gray-600">Ghi nợ</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-red-600">{formatCurrency(revenueStats.pendingDebt)}</div>
            <div className="text-sm text-gray-600">Nợ chưa trả</div>
          </div>
        </div>

        {/* Date Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3">Lọc theo ngày:</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={setTodayRange}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              Hôm nay
            </button>
            <button
              onClick={setWeekRange}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              7 ngày
            </button>
            <button
              onClick={setMonthRange}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
            >
              30 ngày
            </button>
            <button
              onClick={() => setSelectedDateRange({ startDate: '', endDate: '' })}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Tất cả
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              value={selectedDateRange.startDate}
              onChange={(e) => setSelectedDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-3 py-2 border rounded-lg text-sm"
              placeholder="Từ ngày"
            />
            <span className="self-center">-</span>
            <input
              type="date"
              value={selectedDateRange.endDate}
              onChange={(e) => setSelectedDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="px-3 py-2 border rounded-lg text-sm"
              placeholder="Đến ngày"
            />
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Danh sách đơn hàng ({orders.length})</h2>
          </div>
          
          {orders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-6xl mb-4">📋</div>
              <p>Chưa có đơn hàng nào</p>
            </div>
          ) : (
            <div className="divide-y">
              {orders.map((order) => (
                <div key={order.id} className="p-4 hover:bg-gray-50">
                  {/* Order Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-lg">#{order.id}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusName(order.status)}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {getPaymentMethodIcon(order.payment_method)} {getPaymentMethodName(order.payment_method)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(order.created_at)}
                        {order.customer_name && order.customer_name !== 'Khách hàng' && (
                          <span className="ml-3">👤 {order.customer_name}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">{formatCurrency(order.total_amount)}</div>
                      {order.payment_method === 'DEBT' && order.status === 'pending' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                          className="mt-1 px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                        >
                          Đã thu tiền
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm font-medium mb-2">Sản phẩm:</div>
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>
                            {item.product_name} x {item.quantity}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(item.total_price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Notes */}
                  {order.notes && (
                    <div className="mt-2 text-sm text-gray-600">
                      📝 {order.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}