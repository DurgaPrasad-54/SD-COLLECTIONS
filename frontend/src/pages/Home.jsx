import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchProducts } from '../store/productSlice';
import { fetchCategories } from '../store/categorySlice';
import { motion } from 'framer-motion';
import ProductGrid from '../components/ProductGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiChevronRight, FiShoppingBag, FiTruck, FiRefreshCw, FiShield } from 'react-icons/fi';

const HERO_SLIDES = [
  { id: 1, title: 'Summer Collection 2024', subtitle: 'Discover the latest trends in fashion', cta: 'Shop Now', bg: 'from-blue-600 to-purple-700' },
  { id: 2, title: 'New Arrivals Are Here', subtitle: 'Exclusive styles just landed', cta: 'Explore', bg: 'from-rose-500 to-orange-500' },
  { id: 3, title: 'Up to 50% Off', subtitle: 'Limited time sale on premium brands', cta: 'Grab Deal', bg: 'from-emerald-500 to-teal-600' },
];

const FEATURES = [
  { icon: FiTruck, label: 'Free Shipping', desc: 'On orders above ₹499' },
  { icon: FiRefreshCw, label: 'Easy Returns', desc: '30-day return policy' },
  { icon: FiShield, label: 'Secure Payment', desc: '100% safe transactions' },
  { icon: FiShoppingBag, label: 'Premium Quality', desc: 'Curated collections' },
];

const TESTIMONIALS = [
  { name: 'Priya S.', rating: 5, text: 'Amazing quality and super fast delivery. Highly recommend SD COLLECTIONS!' },
  { name: 'Rahul M.', rating: 5, text: 'The best online clothing store. Great prices and excellent customer service.' },
  { name: 'Anjali K.', rating: 4, text: 'Love the variety and the fabric quality is top-notch.' },
];

function Home() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((state) => state.product);
  const { list: categories } = useSelector((state) => state.category);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 12 }));
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const timer = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const current = HERO_SLIDES[slide];

  return (
    <>
      <Helmet>
        <title>SD COLLECTIONS – Fashion Forward</title>
        <meta name="description" content="Shop the latest fashion collections at SD COLLECTIONS – premium quality clothing for men and women." />
      </Helmet>

      {/* Hero Banner */}
      <section className={`-mx-4 -mt-6 bg-gradient-to-br ${current.bg} text-white py-24 px-6 text-center relative overflow-hidden mb-10`}>
        <motion.div key={slide} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="text-sm uppercase tracking-widest mb-2 opacity-80">SD COLLECTIONS</p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4">{current.title}</h1>
          <p className="text-lg sm:text-xl opacity-90 mb-8">{current.subtitle}</p>
          <Link to="/shop" className="inline-block bg-white text-blue-700 font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg">
            {current.cta} <FiChevronRight className="inline" />
          </Link>
        </motion.div>
        {/* Slide indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} className={`w-2 h-2 rounded-full transition-colors ${i === slide ? 'bg-white' : 'bg-white/40'}`} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      </section>

      {/* Feature Badges */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {FEATURES.map(({ icon: Icon, label, desc }) => (
          <div key={label} className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600">
              <Icon size={20} />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Shop by Category</h2>
            <Link to="/shop" className="text-blue-600 text-sm hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.slice(0, 5).map((cat) => (
              <Link
                key={cat._id}
                to={`/shop?category=${cat._id}`}
                className="group flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-500 hover:shadow-md transition-all"
              >
                <img
                  src={(typeof cat.image === 'string' ? cat.image : cat.image?.url) || `https://placehold.co/80x80?text=${encodeURIComponent(cat.name)}`}
                  alt={cat.name}
                  className="w-16 h-16 object-cover rounded-full mb-2 group-hover:scale-110 transition-transform"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Featured Products</h2>
          <Link to="/shop" className="text-blue-600 text-sm hover:underline">View All</Link>
        </div>
        {loading ? <LoadingSpinner /> : <ProductGrid products={list.slice(0, 8)} />}
      </section>

      {/* New Arrivals */}
      {list.length > 8 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">New Arrivals</h2>
            <Link to="/shop?sort=newest" className="text-blue-600 text-sm hover:underline">View All</Link>
          </div>
          <ProductGrid products={list.slice(8, 12)} />
        </section>
      )}

      {/* Testimonials */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ name, rating, text }) => (
            <div key={name} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex mb-2">
                {Array.from({ length: rating }).map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{text}</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">— {name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-white text-center mb-4">
        <h2 className="text-2xl font-bold mb-2">Get 10% Off Your First Order</h2>
        <p className="text-blue-100 mb-6">Subscribe to our newsletter and receive exclusive deals.</p>
        <form className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3 max-w-md mx-auto" onSubmit={(e) => { e.preventDefault(); }}>
          <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-lg text-gray-900 outline-none w-full sm:w-auto" required />
          <button type="submit" className="px-6 py-3 bg-white text-blue-700 font-bold rounded-lg hover:bg-gray-100 transition-colors w-full sm:w-auto">
            Subscribe
          </button>
        </form>
      </section>
    </>
  );
}

export default Home;
