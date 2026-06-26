import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchOrders } from '../store/orderSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { LuShoppingBag, LuChevronRight } from 'react-icons/lu';

const STATUS_COLOR = {
  Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
  Confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500',
  Packed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500',
  Shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500',
  Delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
  Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
};

function MyOrders() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((state) => state.order);

  useEffect(() => { dispatch(fetchOrders()); }, [dispatch]);

  return (
    <>
      <Helmet><title>My Orders – SD COLLECTIONS</title></Helmet>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Orders</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View and track your recent purchases.</p>
      </div>

      {loading && <LoadingSpinner />}
      
      {!loading && list.length === 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-12 shadow-sm text-center">
          <EmptyState message="You have no orders yet." icon={LuShoppingBag} />
        </div>
      )}
      
      {!loading && list.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {list.map((order) => (
              <Link key={order._id} to={`/orders/${order._id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl flex items-center justify-center">
                    <LuShoppingBag className="text-gray-500 dark:text-gray-400" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">Order #{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} · {order.items?.length || 0} item(s)
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end mt-4 sm:mt-0 space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">₹{order.totalAmount?.toLocaleString()}</p>
                    <span className={`inline-block text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded mt-1 ${STATUS_COLOR[order.orderStatus] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <LuChevronRight className="text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" size={20} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default MyOrders;
