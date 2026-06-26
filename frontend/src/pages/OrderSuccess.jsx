import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiCheckCircle } from 'react-icons/fi';

function OrderSuccess() {
  const { state } = useLocation();
  const order = state?.order;

  return (
    <>
      <Helmet><title>Order Placed – SD COLLECTIONS</title></Helmet>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center py-12">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <FiCheckCircle className="text-green-500 w-20 h-20 mx-auto mb-4" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-2">Thank you for shopping with SD COLLECTIONS.</p>
          {order?._id && (
            <p className="text-sm text-gray-400 mb-6">
              Order ID: <span className="font-mono font-semibold text-blue-600">#{order._id.slice(-8).toUpperCase()}</span>
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-4">
            {order?._id && (
              <Link to={`/orders/${order._id}`} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                Track Order
              </Link>
            )}
            <Link to="/orders" className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
              My Orders
            </Link>
            <Link to="/" className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default OrderSuccess;
