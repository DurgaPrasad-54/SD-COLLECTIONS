import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { placeOrder } from '../store/orderSlice';
import { clearCart } from '../store/cartSlice';
import { clearAppliedCoupon } from '../store/couponSlice';
import { fetchProfile } from '../store/authSlice';
import api from '../services/api';
import { FiMapPin, FiCreditCard, FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';

const STEPS = ['Address', 'Payment', 'Review'];

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // If already loaded, resolve immediately
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((state) => state.cart);
  const { appliedCoupon, discount } = useSelector((state) => state.coupon);
  const { loading } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.auth);
  const [step, setStep] = useState(0);
  const [addressData, setAddressData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      country: 'India',
    }
  });

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        phone: user.phone || '',
        country: 'India',
      });
    }
  }, [user, reset]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal >= 500 ? 0 : 40;
  const discountAmount = appliedCoupon ? (discount / 100) * subtotal : 0;
  const total = subtotal + shipping - discountAmount;

  const onAddressSubmit = (data) => {
    setAddressData(data);
    setStep(1);
  };

  const handlePlaceOrder = async () => {
    const orderPayload = {
      items: items.map((i) => ({
        product: i.productId,
        quantity: i.quantity,
        size: i.size || '',
        color: i.color || '',
      })),
      shippingAddress: {
        fullName: addressData.name,
        phone: addressData.phone,
        addressLine1: addressData.address,
        city: addressData.city,
        state: addressData.state,
        pincode: addressData.pincode,
      },
      paymentMethod: paymentMethod === 'Online' ? 'Razorpay' : 'COD',
      couponCode: appliedCoupon?.code || '',
    };

    const result = await dispatch(placeOrder(orderPayload));
    if (result.meta.requestStatus === 'fulfilled') {
      const order = result.payload;

      if (orderPayload.paymentMethod === 'Razorpay') {
        try {
          const isScriptLoaded = await loadRazorpayScript();
          if (!isScriptLoaded) {
            toast.error('Razorpay SDK failed to load. Please check your internet connection.');
            return;
          }

          // Create Razorpay payment order on the backend
          const { data: orderRes } = await api.post('/payments/create-order', { orderId: order._id });
          const { keyId, razorpayOrderId, amount, currency } = orderRes.data;

          const options = {
            key: keyId,
            amount: amount,
            currency: currency,
            name: 'SD COLLECTIONS',
            description: `Payment for Order #${order._id.slice(-8).toUpperCase()}`,
            order_id: razorpayOrderId,
            handler: async (response) => {
              try {
                // Verify signature on backend
                const verifyPayload = {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                };
                const verifyRes = await api.post('/payments/verify', verifyPayload);
                if (verifyRes.data.success) {
                  dispatch(clearCart());
                  dispatch(clearAppliedCoupon());
                  toast.success('Payment successful!');
                  navigate('/order-success', { state: { order: verifyRes.data.data } });
                } else {
                  toast.error('Payment verification failed.');
                }
              } catch (err) {
                toast.error('Error verifying payment.');
              }
            },
            prefill: {
              name: addressData.name,
              contact: addressData.phone,
              email: user?.email || '',
            },
            theme: {
              color: '#2563EB',
            },
            modal: {
              ondismiss: () => {
                toast.error('Payment cancelled. You can complete it later from your orders list.');
                navigate('/orders');
              }
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        } catch (err) {
          console.error(err);
          toast.error(err.response?.data?.message || 'Error processing online payment.');
        }
      } else {
        // COD
        dispatch(clearCart());
        dispatch(clearAppliedCoupon());
        navigate('/order-success', { state: { order } });
      }
    }
  };

  const inputClass = (error) =>
    `w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg text-sm bg-transparent outline-none focus:border-blue-500`;

  return (
    <>
      <Helmet><title>Checkout – SD COLLECTIONS</title></Helmet>
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {/* Step Indicator */}
      <div className="flex items-center space-x-2 mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center space-x-2 ${i <= step ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i < step ? 'bg-blue-600 text-white' : i === step ? 'border-2 border-blue-600 text-blue-600' : 'border-2 border-gray-300 text-gray-400'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className="text-sm font-medium hidden sm:block">{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step 0: Address */}
          {step === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center space-x-2 mb-5">
                <FiMapPin className="text-blue-600" />
                <h2 className="font-semibold text-lg">Shipping Address</h2>
              </div>

              {/* Saved Address List */}
              {user?.addresses && user.addresses.length > 0 && (
                <div className="mb-6 border-b border-gray-100 dark:border-gray-700 pb-6">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Deliver to a Saved Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.addresses.map((addr) => (
                      <div
                        key={addr._id}
                        onClick={() => {
                          onAddressSubmit({
                            name: addr.fullName,
                            phone: addr.phone,
                            address: addr.addressLine1 + (addr.addressLine2 ? ', ' + addr.addressLine2 : ''),
                            city: addr.city,
                            state: addr.state,
                            pincode: addr.pincode,
                          });
                        }}
                        className={`cursor-pointer border rounded-xl p-4 transition-all flex flex-col justify-between text-sm hover:border-blue-500 hover:shadow-sm ${addr.isDefault ? 'border-blue-400 bg-blue-50/10 dark:bg-blue-900/5' : 'border-gray-200 dark:border-gray-700'}`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-800 dark:text-gray-100">{addr.fullName}</span>
                            {addr.isDefault && (
                              <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xxs font-bold px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{addr.addressLine1}</p>
                          {addr.addressLine2 && <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{addr.addressLine2}</p>}
                          <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{addr.city}, {addr.state} – {addr.pincode}</p>
                          <p className="text-gray-400 text-xs font-mono mt-2">{addr.phone}</p>
                        </div>
                        <button
                          type="button"
                          className="mt-4 w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Ship Here
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center my-6">
                    <div className="flex-grow border-t border-gray-100 dark:border-gray-700"></div>
                    <span className="mx-4 text-xxs text-gray-400 uppercase font-bold tracking-wider">Or Use A New Address</span>
                    <div className="flex-grow border-t border-gray-100 dark:border-gray-700"></div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onAddressSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Full Name *</label>
                    <input {...register('name', { required: 'Full name is required' })} className={inputClass(errors.name)} placeholder="John Doe" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Phone *</label>
                    <input {...register('phone', { required: 'Phone is required' })} className={inputClass(errors.phone)} placeholder="9876543210" />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Address Line *</label>
                  <input {...register('address', { required: 'Address is required' })} className={inputClass(errors.address)} placeholder="123 Main Street, Apt 4" />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">City *</label>
                    <input {...register('city', { required: 'City is required' })} className={inputClass(errors.city)} placeholder="Mumbai" />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">State *</label>
                    <input {...register('state', { required: 'State is required' })} className={inputClass(errors.state)} placeholder="Maharashtra" />
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Pincode *</label>
                    <input {...register('pincode', { required: 'Pincode is required', pattern: { value: /^\d{6}$/, message: 'Invalid pincode' } })} className={inputClass(errors.pincode)} placeholder="400001" />
                    {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Country</label>
                  <input {...register('country')} defaultValue="India" className={inputClass()} />
                </div>
                <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                  Continue to Payment
                </button>
              </form>
            </div>
          )}

          {/* Step 1: Payment */}
          {step === 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center space-x-2 mb-5">
                <FiCreditCard className="text-blue-600" />
                <h2 className="font-semibold text-lg">Payment Method</h2>
              </div>
              <div className="space-y-3 mb-6">
                {[['COD', 'Cash on Delivery'], ['Online', 'Online Payment (UPI / Card / Net Banking)']].map(([val, label]) => (
                  <label key={val} className={`flex items-center space-x-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${paymentMethod === val ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                    <input type="radio" name="payment" value={val} checked={paymentMethod === val} onChange={() => setPaymentMethod(val)} className="accent-blue-600" />
                    <span className="font-medium text-sm">{label}</span>
                  </label>
                ))}
              </div>
              <div className="flex space-x-3">
                <button onClick={() => setStep(0)} className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700">
                  Back
                </button>
                <button onClick={() => setStep(2)} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">
                  Review Order
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center space-x-2 mb-5">
                <FiPackage className="text-blue-600" />
                <h2 className="font-semibold text-lg">Review Your Order</h2>
              </div>

              {/* Address Summary */}
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
                <p className="font-medium mb-1">Shipping to:</p>
                <p>{addressData?.name}, {addressData?.phone}</p>
                <p>{addressData?.address}, {addressData?.city}, {addressData?.state} – {addressData?.pincode}</p>
              </div>

              {/* Payment Summary */}
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
                <p className="font-medium">Payment: <span className="text-blue-600">{paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</span></p>
              </div>

              {/* Items */}
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.key} className="flex items-center space-x-3">
                    <img src={item.image || `https://placehold.co/48x48?text=P`} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}{item.size ? ` | ${item.size}` : ''}{item.color ? ` | ${item.color}` : ''}</p>
                    </div>
                    <p className="font-bold text-sm text-blue-600">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="flex space-x-3 mt-6">
                <button onClick={() => setStep(1)} className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700">
                  Back
                </button>
                <button onClick={handlePlaceOrder} disabled={loading} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50">
                  {loading ? 'Placing...' : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Price Summary Sidebar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm h-fit">
          <h3 className="font-bold mb-4">Price Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Subtotal ({items.length} items)</span><span>₹{subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Shipping</span><span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
            {discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Coupon Discount</span><span>-₹{discountAmount.toFixed(0)}</span></div>}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-bold text-base">
              <span>Total</span><span>₹{total.toFixed(0)}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">Free shipping on orders of ₹500 and above</p>
        </div>
      </div>
    </>
  );
}

export default Checkout;
