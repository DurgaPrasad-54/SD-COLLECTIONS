import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/wishlistSlice';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ProductCard = memo(function ProductCard({ product }) {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const isWishlisted = wishlistItems.some((i) => i._id === product._id);

  const handleAddCart = (e) => {
    e.preventDefault();
    dispatch(addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url || product.image?.url || '',
      quantity: 1,
    }));
    toast.success('Added to cart!');
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    if (isWishlisted) {
      dispatch(removeFromWishlist(product._id));
      toast.success('Removed from wishlist');
    } else {
      dispatch(addToWishlist(product));
      toast.success('Added to wishlist!');
    }
  };

  const imgSrc = product.images?.[0]?.url || product.image?.url || `https://placehold.co/300x300?text=${encodeURIComponent(product.name)}`;

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.12)' }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 group"
    >
      <Link to={`/product/${product._id}`} className="block relative overflow-hidden h-40 sm:h-52">
        <img
          src={imgSrc}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-colors ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'}`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <FiHeart size={16} style={{ fill: isWishlisted ? 'currentColor' : 'none' }} />
        </button>
        {product.discount > 0 && (
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
            -{product.discount}%
          </span>
        )}
      </Link>
      <div className="p-3 sm:p-4 flex flex-col justify-between h-[130px] sm:h-auto">
        <div>
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1 truncate">{product.category?.name || 'Clothing'}</p>
          <Link to={`/product/${product._id}`}>
            <h3 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-100 line-clamp-1 hover:text-blue-600 leading-tight">{product.name}</h3>
          </Link>
          <div className="flex items-center space-x-1 mt-1 mb-2">
            <FiStar className="text-yellow-400 fill-yellow-400 w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ fill: 'currentColor' }} />
            <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">{product.rating?.toFixed(1) || '0.0'} ({product.numReviews || 0})</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:space-x-2">
            <span className="text-sm sm:text-lg font-bold text-blue-600">₹{product.price?.toLocaleString()}</span>
            {product.originalPrice > product.price && (
              <span className="text-[10px] sm:text-xs text-gray-400 line-through">₹{product.originalPrice?.toLocaleString()}</span>
            )}
          </div>
          <button
            onClick={handleAddCart}
            className="p-1.5 sm:p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            aria-label="Add to cart"
          >
            <FiShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
});

export default ProductCard;
