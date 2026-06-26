import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { fetchAllOrders, updateOrderStatus } from '../../store/orderSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

const STATUSES = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

const STATUS_COLOR = {
  Pending: 'text-yellow-700 bg-yellow-100',
  Confirmed: 'text-blue-700 bg-blue-100',
  Packed: 'text-blue-700 bg-blue-100',
  Shipped: 'text-purple-700 bg-purple-100',
  Delivered: 'text-green-700 bg-green-100',
  Cancelled: 'text-red-700 bg-red-100',
};

function OrderManagement() {
  const dispatch = useDispatch();
  const { adminList: orders, loading } = useSelector((s) => s.order);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => { dispatch(fetchAllOrders({ limit: 100 })); }, [dispatch]);

  const handleStatusChange = async (id, status) => {
    const result = await dispatch(updateOrderStatus({ id, orderStatus: status }));
    if (result.meta.requestStatus === 'fulfilled') toast.success(`Status updated to ${status}`);
  };

  const filtered = orders.filter((o) => {
    const matchSearch = o._id.slice(-8).toLowerCase().includes(search.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? o.orderStatus === filterStatus : true;
    return matchSearch && matchStatus;
  });

  return (
    <>
      <Helmet><title>Orders – SD COLLECTIONS Admin</title></Helmet>
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Order Management</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order ID or customer..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 outline-none" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 outline-none"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Update Status'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order._id} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-4 py-3 font-mono text-xs text-blue-600">#{order._id.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3">{order.user?.name || 'N/A'}</td>
                  <td className="px-4 py-3 text-center">{order.items?.length || 0}</td>
                  <td className="px-4 py-3 font-semibold">₹{order.totalAmount?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800 outline-none"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-gray-400">No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default OrderManagement;
