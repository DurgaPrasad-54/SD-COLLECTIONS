import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

function NotFound() {
  return (
    <>
      <Helmet><title>404 – Page Not Found | SD COLLECTIONS</title></Helmet>
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 120 }}
        >
          <p className="text-8xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">404</p>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">Page Not Found</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
              Go Home
            </Link>
            <Link to="/shop" className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
              Browse Shop
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default NotFound;
