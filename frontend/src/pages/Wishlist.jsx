import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { removeFromWishlist } from '../store/wishlistSlice';
import { addToCart } from '../store/cartSlice';
import EmptyState from '../components/EmptyState';
import { LuHeart, LuTrash2, LuShoppingCart } from 'react-icons/lu';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

function Wishlist() {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.wishlist);

  const handleMoveToCart = (product) => {
    dispatch(addToCart({ productId: product._id, name: product.name, price: product.price, image: product.images?.[0]?.url || '', quantity: 1 }));
    dispatch(removeFromWishlist(product._id));
    toast.success('Moved to cart!');
  };

  if (items.length === 0) {
    return (
      <>
        <Helmet><title>Wishlist – SD COLLECTIONS</title></Helmet>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wishlist</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Items you've saved for later.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-12 shadow-sm text-center">
          <EmptyState message="Your wishlist is empty." icon={LuHeart} />
          <div className="flex justify-center mt-6">
            <Link to="/shop" className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Browse Products
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet><title>{`Wishlist (${items.length}) – SD COLLECTIONS`}</title></Helmet>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wishlist ({items.length})</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Items you've saved for later.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((product) => {
          const img = product.images?.[0]?.url || `https://placehold.co/300x300/png`;
          return (
            <motion.div key={product._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col h-full"
            >
              <Link to={`/product/${product._id}`} className="block h-48 overflow-hidden bg-gray-50 dark:bg-gray-900">
                <img src={img} alt={product.name} className="w-full h-full object-cover" />
              </Link>
              <div className="p-4 flex flex-col flex-1">
                <Link to={`/product/${product._id}`}>
                  <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate hover:text-blue-600">{product.name}</h3>
                </Link>
                <p className="text-gray-900 dark:text-white font-bold text-sm mt-1">₹{product.price?.toLocaleString()}</p>
                <div className="mt-auto pt-4 flex space-x-2">
                  <button onClick={() => handleMoveToCart(product)} className="flex-1 flex items-center justify-center space-x-1.5 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors">
                    <LuShoppingCart size={14} /><span>Add to Cart</span>
                  </button>
                  <button onClick={() => { dispatch(removeFromWishlist(product._id)); toast.success('Removed'); }}
                    className="p-2 border border-gray-100 dark:border-gray-700 text-red-500 bg-white dark:bg-gray-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-800 transition-colors" aria-label="Remove">
                    <LuTrash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}

export default Wishlist;
