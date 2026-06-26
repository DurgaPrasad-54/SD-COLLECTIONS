import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { fetchDashboardStats, fetchSalesAnalytics } from '../../store/adminSlice';
import { fetchAllOrders } from '../../store/orderSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FiShoppingBag, FiUsers, FiDollarSign, FiPackage } from 'react-icons/fi';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';

const STATUS_COLOR = {
  Pending: 'text-yellow-600 bg-yellow-50',
  Processing: 'text-blue-600 bg-blue-50',
  Shipped: 'text-purple-600 bg-purple-50',
  Delivered: 'text-green-600 bg-green-50',
  Cancelled: 'text-red-600 bg-red-50',
};

function Dashboard() {
  const dispatch = useDispatch();
  const { stats, statsLoading, salesAnalytics } = useSelector((state) => state.admin);
  const { adminList: orders } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchSalesAnalytics());
    dispatch(fetchAllOrders({ limit: 10 }));
  }, [dispatch]);

  const kpis = [
    { icon: FiDollarSign, label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
    { icon: FiShoppingBag, label: 'Total Orders', value: stats?.totalOrders || 0, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
    { icon: FiUsers, label: 'Total Users', value: stats?.totalUsers || 0, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
    { icon: FiPackage, label: 'Total Products', value: stats?.totalProducts || 0, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
  ];

  const salesData = salesAnalytics?.monthlySales?.map((item) => ({
    month: item.month,
    sales: item.totalSales,
    orders: item.totalOrders,
  })) || Array.from({ length: 6 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
    sales: Math.floor(Math.random() * 50000 + 10000),
    orders: Math.floor(Math.random() * 100 + 20),
  }));

  if (statsLoading) return <LoadingSpinner />;

  return (
    <>
      <Helmet><title>Dashboard – SD COLLECTIONS Admin</title></Helmet>

      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${color}`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Line Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="font-semibold mb-4 text-gray-800 dark:text-gray-100">Monthly Sales (₹)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
              <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="font-semibold mb-4 text-gray-800 dark:text-gray-100">Monthly Orders</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
        <h2 className="font-semibold mb-4 text-gray-800 dark:text-gray-100">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {['Order ID', 'Customer', 'Amount', 'Status', 'Date'].map((h) => (
                  <th key={h} className="text-left pb-3 font-medium text-gray-500 dark:text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 8).map((order) => (
                <tr key={order._id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="py-3 font-mono text-xs text-blue-600">#{order._id.slice(-8).toUpperCase()}</td>
                  <td className="py-3">{order.user?.name || 'N/A'}</td>
                  <td className="py-3 font-semibold">₹{order.totalAmount?.toLocaleString()}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="py-3 text-gray-400 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-gray-400">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
