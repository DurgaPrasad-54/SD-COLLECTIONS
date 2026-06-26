import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/productSlice';
import { motion, AnimatePresence } from 'framer-motion';

function ProductCarousel() {
  const dispatch = useDispatch();
  const { list } = useSelector((state) => state.product);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Grab first 5 products for carousel
    dispatch(fetchProducts({ limit: 5 }));
  }, [dispatch]);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % list.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [list]);

  if (!list.length) return null;

  const current = list[index];

  return (
    <div className="relative w-full h-64 sm:h-80 overflow-hidden rounded-lg shadow-lg">
      <AnimatePresence>
        <motion.img
          key={current._id}
          src={current.image?.url || '/placeholder.png'}
          alt={current.name}
          className="w-full h-full object-cover"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.8 }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
        <h2 className="text-2xl sm:text-4xl font-bold text-white">
          {current.name}
        </h2>
      </div>
    </div>
  );
}

export default ProductCarousel;
