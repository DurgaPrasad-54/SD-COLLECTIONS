import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchProducts } from '../store/productSlice';
import { fetchCategories } from '../store/categorySlice';
import ProductGrid from '../components/ProductGrid';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';

function Shop() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { list, total, loading } = useSelector((state) => state.product);
  const { list: categories } = useSelector((state) => state.category);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [showFilters, setShowFilters] = useState(false);
  const LIMIT = 12;

  const fetchData = useCallback(() => {
    const params = { page, limit: LIMIT };
    if (search) params.keyword = search;
    if (category) params.category = category;
    if (minPrice) params['price[gte]'] = minPrice;
    if (maxPrice) params['price[lte]'] = maxPrice;
    
    // Map sort values to MongoDB sort fields
    if (sort === 'newest') params.sort = '-createdAt';
    else if (sort === 'oldest') params.sort = 'createdAt';
    else if (sort === 'price-asc') params.sort = 'price';
    else if (sort === 'price-desc') params.sort = '-price';
    else if (sort === 'rating') params.sort = '-ratings';
    
    dispatch(fetchProducts(params));
  }, [dispatch, page, search, category, minPrice, maxPrice, sort]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  // Sync state with URL search params changes (e.g. from header search bar redirection)
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCategory(searchParams.get('category') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setSort(searchParams.get('sort') || 'newest');
    setPage(parseInt(searchParams.get('page') || '1', 10));
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchParams({ search, category, minPrice, maxPrice, sort, page: 1 });
  };

  const handleClear = () => {
    setSearch(''); setCategory(''); setMinPrice(''); setMaxPrice(''); setSort('newest'); setPage(1);
    setSearchParams({});
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <>
      <Helmet>
        <title>Shop – SD COLLECTIONS</title>
        <meta name="description" content="Browse our complete collection of premium clothing for men and women." />
      </Helmet>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters Sidebar */}
        <motion.aside
          className={`w-full md:w-64 bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 h-fit ${showFilters ? 'block' : 'hidden md:block'}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 dark:text-gray-100">Filters</h2>
            <button onClick={handleClear} className="text-xs text-blue-600 hover:underline">Clear All</button>
          </div>

          {/* Category Filter */}
          <div className="mb-5">
            <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200 mb-2">Category</h3>
            <div className="space-y-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="cat" value="" checked={!category} onChange={() => setCategory('')} className="accent-blue-600" />
                <span className="text-sm text-gray-600 dark:text-gray-300">All</span>
              </label>
              {categories.map((c) => (
                <label key={c._id} className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="cat" value={c._id} checked={category === c._id} onChange={() => setCategory(c._id)} className="accent-blue-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{c.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="mb-5">
            <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200 mb-2">Price Range</h3>
            <div className="flex items-center space-x-2">
              <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-transparent" />
              <span className="text-gray-400">–</span>
              <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-transparent" />
            </div>
          </div>

          {/* Apply Filters */}
          <button onClick={handleSearch} className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
            Apply Filters
          </button>
        </motion.aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Sort Bar */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none"
            >
              <FiFilter />
              <span>Filters</span>
            </button>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{total} products found</p>

          {loading ? <LoadingSpinner /> : <ProductGrid products={list} />}

          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => { setPage(p); window.scrollTo(0, 0); }}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default Shop;
