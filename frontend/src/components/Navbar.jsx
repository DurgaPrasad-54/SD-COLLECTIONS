import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../store/themeSlice';
import { logout } from '../store/authSlice';
import { FiSun, FiMoon, FiShoppingCart, FiUser, FiMenu, FiX, FiHeart, FiSearch } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user } = useSelector((state) => state.auth);
  const { mode } = useSelector((state) => state.theme);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [activeInput, setActiveInput] = useState(null); // 'desktop' or 'mobile'

  // Sync search state with URL query search param
  const urlSearchParam = new URLSearchParams(location.search).get('search') || '';
  useEffect(() => {
    setHeaderSearch(urlSearchParam);
  }, [urlSearchParam]);

  // Fetch search suggestions with 300ms debounce
  useEffect(() => {
    if (headerSearch.trim().length <= 1) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get('/products', {
          params: { keyword: headerSearch.trim(), limit: 5 }
        });
        if (data && data.data) {
          setSuggestions(data.data);
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [headerSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSuggestions([]);
    if (headerSearch.trim()) {
      navigate(`/shop?search=${encodeURIComponent(headerSearch.trim())}`);
      setMenuOpen(false);
    } else {
      navigate('/shop');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const navLinks = [
    { to: '/', label: 'Home', end: true },
    { to: '/shop', label: 'Shop' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-xl sm:text-2xl font-extrabold text-blue-600 dark:text-blue-500 shrink-0">
            SD COLLECTIONS
          </Link>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:block flex-1 max-w-xs lg:max-w-md mx-4 lg:mx-8 relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={headerSearch}
                onFocus={() => setActiveInput('desktop')}
                onChange={(e) => setHeaderSearch(e.target.value)}
                className="w-full pl-4 pr-10 py-1.5 border border-gray-300 dark:border-gray-700 rounded-full text-sm bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors">
                <FiSearch size={16} />
              </button>
            </form>

            {/* Desktop Suggestions */}
            {activeInput === 'desktop' && suggestions.length > 0 && (
              <>
                <div onClick={() => { setSuggestions([]); setActiveInput(null); }} className="fixed inset-0 z-40" />
                <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-150 dark:border-gray-700 overflow-hidden z-50 max-h-80 overflow-y-auto">
                  {suggestions.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => {
                        navigate(`/product/${product._id}`);
                        setSuggestions([]);
                        setHeaderSearch('');
                        setActiveInput(null);
                      }}
                      className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                      <img
                        src={product.images?.[0]?.url || 'https://placehold.co/40x40'}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{product.name}</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">₹{product.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {mode === 'dark' ? <FiSun className="text-yellow-400" size={20} /> : <FiMoon size={20} />}
            </button>

            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              <FiHeart size={20} />
              {wishlistItems.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              <FiShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-blue-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {token ? (
              <div className="hidden md:flex items-center space-x-2">
                {user?.role === 'admin' && (
                  <Link to="/admin" className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700">
                    Admin
                  </Link>
                )}
                <Link to="/profile" className="flex items-center space-x-1 text-sm hover:text-blue-600">
                  <FiUser size={18} />
                  <span>{user?.name?.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                <FiUser size={16} />
                <span>Login</span>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-2">
              {/* Mobile Search Bar */}
              <div className="relative mb-3">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={headerSearch}
                    onFocus={() => setActiveInput('mobile')}
                    onChange={(e) => setHeaderSearch(e.target.value)}
                    className="w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-full text-sm bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors">
                    <FiSearch size={18} />
                  </button>
                </form>

                {/* Mobile Suggestions */}
                {activeInput === 'mobile' && suggestions.length > 0 && (
                  <>
                    <div onClick={() => { setSuggestions([]); setActiveInput(null); }} className="fixed inset-0 z-40" />
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-150 dark:border-gray-700 overflow-hidden z-50 max-h-60 overflow-y-auto">
                      {suggestions.map((product) => (
                        <div
                          key={product._id}
                          onClick={() => {
                            navigate(`/product/${product._id}`);
                            setSuggestions([]);
                            setHeaderSearch('');
                            setActiveInput(null);
                            setMenuOpen(false);
                          }}
                          className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0"
                        >
                          <img
                            src={product.images?.[0]?.url || 'https://placehold.co/40x40'}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{product.name}</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">₹{product.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              {navLinks.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-sm font-medium ${
                      isActive ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-200'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
              {token ? (
                <>
                  <Link to="/profile" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm">Profile</Link>
                  <Link to="/orders" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm">My Orders</Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-purple-600">Admin Panel</Link>
                  )}
                  <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-sm text-red-500">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm">Login</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm">Register</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;
