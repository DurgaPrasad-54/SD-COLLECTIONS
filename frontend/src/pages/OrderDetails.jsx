import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { fetchOrderById, cancelOrder, clearCurrent } from '../store/orderSlice';
import Breadcrumb from '../components/Breadcrumb';
import OrderTracker from '../components/OrderTracker';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const STATUS_COLOR = {
  Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
  Confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500',
  Packed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500',
  Shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500',
  Delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
  Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
};

function OrderDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current: order, loading } = useSelector((state) => state.order);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    dispatch(fetchOrderById(id));
    return () => {
      dispatch(clearCurrent());
    };
  }, [dispatch, id]);

  const handleCancelClick = () => {
    setCancelReason('');
    setIsCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    setIsCancelModalOpen(false);
    const result = await dispatch(cancelOrder({ id: order._id, reason: cancelReason || 'Cancelled by user' }));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Order cancelled successfully!');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!order) return <p className="text-gray-500 dark:text-gray-400">Order not found.</p>;

  return (
    <>
      <Helmet><title>{`Order #${order._id.slice(-8).toUpperCase()} – SD COLLECTIONS`}</title></Helmet>
      
      {/* We use standard gray colors for Breadcrumb wrapper outside but inside text to #6B7280 */}
      <div className="mb-4">
        <Breadcrumb crumbs={[{ to: '/orders', label: 'My Orders' }, { label: `Order #${order._id.slice(-8).toUpperCase()}` }]} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order #{order._id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Placed on: {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${STATUS_COLOR[order.orderStatus] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
            {order.orderStatus}
          </span>
          {['Pending', 'Confirmed'].includes(order.orderStatus) && (
            <button
              onClick={handleCancelClick}
              className="px-4 py-1.5 border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Order Status</h2>
        <OrderTracker status={order.orderStatus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Items Ordered</h2>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {order.items?.map((item, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 py-4 first:pt-0 last:pb-0">
                  <img src={item.image || `https://placehold.co/56x56/png`} alt={item.name} className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                  <div className="flex-1">
                    <Link to={`/product/${item.product}`} className="font-medium text-sm text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">{item.name}</Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Qty: {item.quantity}{item.size ? ` | Size: ${item.size}` : ''}{item.color ? ` | Color: ${item.color}` : ''}</p>
                  </div>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">₹{(item.price * item.quantity)?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Shipping Address</h2>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{order.shippingAddress?.fullName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{order.shippingAddress?.addressLine1}</p>
            {order.shippingAddress?.addressLine2 && <p className="text-sm text-gray-500 dark:text-gray-400">{order.shippingAddress?.addressLine2}</p>}
            <p className="text-sm text-gray-500 dark:text-gray-400">{order.shippingAddress?.city}, {order.shippingAddress?.state} – {order.shippingAddress?.pincode}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Ph: {order.shippingAddress?.phone}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm h-fit">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Payment Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Subtotal</span><span className="text-gray-900 dark:text-white">₹{order.subtotal?.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Shipping</span><span className="text-gray-900 dark:text-white">{order.shippingCharge === 0 ? 'FREE' : `₹${order.shippingCharge}`}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-green-600 dark:text-green-400"><span className="font-medium">Discount</span><span className="font-medium">-₹{order.discount?.toLocaleString()}</span></div>}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-bold text-base text-gray-900 dark:text-white">
              <span>Total</span><span>₹{order.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 flex justify-between"><span className="font-medium text-gray-900 dark:text-white">Method:</span> {order.paymentMethod}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex justify-between mt-2"><span className="font-medium text-gray-900 dark:text-white">Date:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} title="Cancel Order">
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Are you sure you want to cancel this order? This action cannot be undone.
          </p>
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 block">
              Reason for Cancellation (Optional)
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Changed my mind, Ordered by mistake..."
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-red-500 h-24 resize-none transition-colors"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCancelModalOpen(false)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Keep Order
            </button>
            <button
              type="button"
              onClick={confirmCancel}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Cancel Order
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default OrderDetails;
