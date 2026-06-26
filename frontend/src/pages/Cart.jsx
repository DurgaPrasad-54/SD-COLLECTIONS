import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { removeFromCart, updateQuantity, clearCart } from '../store/cartSlice';
import { applyCoupon, clearAppliedCoupon } from '../store/couponSlice';
import EmptyState from '../components/EmptyState';
import { FiShoppingCart, FiTrash2, FiMinus, FiPlus, FiTag } from 'react-icons/fi';
import toast from 'react-hot-toast';

function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((state) => state.cart);
  const { appliedCoupon, discount, loading: couponLoading } = useSelector((state) => state.coupon);
  const [couponCode, setCouponCode] = useState('');

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal >= 500 ? 0 : 40;
  const discountAmount = appliedCoupon ? (discount / 100) * subtotal : 0;
  const total = subtotal + shipping - discountAmount;

  const handleQty = (key, qty) => {
    if (qty < 1) return;
    dispatch(updateQuantity({ key, quantity: qty }));
  };

  const handleRemove = (key) => {
    dispatch(removeFromCart(key));
    toast.success('Item removed');
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    dispatch(applyCoupon({ code: couponCode, orderAmount: subtotal }));
  };

  const handleClearCoupon = () => {
    dispatch(clearAppliedCoupon());
    setCouponCode('');
  };

  if (items.length === 0) {
    return (
      <>
        <Helmet><title>Cart – SD COLLECTIONS</title></Helmet>
        <EmptyState message="Your cart is empty." icon={FiShoppingCart} />
        <div className="flex justify-center mt-4">
          <Link to="/shop" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Continue Shopping
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet><title>{`Cart (${items.length}) – SD COLLECTIONS`}</title></Helmet>
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.key} className="flex items-center space-x-4 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
              <img src={item.image || `https://placehold.co/80x80?text=${item.name}`} alt={item.name}
                className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.productId}`} className="font-semibold text-gray-800 dark:text-gray-100 hover:text-blue-600 block truncate">
                  {item.name}
                </Link>
                {item.size && <p className="text-xs text-gray-500 mt-0.5">Size: {item.size}</p>}
                {item.color && <p className="text-xs text-gray-500">Color: {item.color}</p>}
                <p className="text-blue-600 font-bold mt-1">₹{(item.price * item.quantity).toLocaleString()}</p>
              </div>
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button onClick={() => handleQty(item.key, item.quantity - 1)} className="px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"><FiMinus size={14} /></button>
                <span className="px-3 text-sm">{item.quantity}</span>
                <button onClick={() => handleQty(item.key, item.quantity + 1)} className="px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"><FiPlus size={14} /></button>
              </div>
              <button onClick={() => handleRemove(item.key)} className="text-red-400 hover:text-red-600 p-1" aria-label="Remove">
                <FiTrash2 size={18} />
              </button>
            </div>
          ))}

          <div className="flex justify-between items-center pt-2">
            <button onClick={() => { dispatch(clearCart()); toast.success('Cart cleared'); }} className="text-sm text-red-500 hover:underline">
              Clear Cart
            </button>
            <Link to="/shop" className="text-sm text-blue-600 hover:underline">Continue Shopping</Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm h-fit">
          <h2 className="font-bold text-lg mb-5">Order Summary</h2>

          {/* Coupon */}
          <div className="mb-5">
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg px-3 py-2">
                <span className="text-green-700 dark:text-green-400 text-sm font-medium flex items-center">
                  <FiTag className="mr-1" /> {appliedCoupon.code} ({discount}% off)
                </span>
                <button onClick={handleClearCoupon} className="text-red-500 text-xs hover:underline">Remove</button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Coupon code"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent outline-none"
                />
                <button onClick={handleApplyCoupon} disabled={couponLoading} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  Apply
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2 text-sm mb-5">
            <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Shipping</span><span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
            {discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{discountAmount.toFixed(0)}</span></div>}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-bold text-lg">
              <span>Total</span><span>₹{total.toFixed(0)}</span>
            </div>
          </div>

          <button onClick={() => navigate('/checkout')} className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </>
  );
}

export default Cart;
