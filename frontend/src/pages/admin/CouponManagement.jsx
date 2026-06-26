import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { fetchCoupons, createCoupon, updateCoupon, deleteCoupon } from '../../store/couponSlice';
import { useForm } from 'react-hook-form';
import Modal from '../../components/Modal';
import ConfirmationModal from '../../components/ConfirmationModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

function CouponManagement() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((s) => s.coupon);
  const [showModal, setShowModal] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => { dispatch(fetchCoupons()); }, [dispatch]);

  const openAdd = () => { setEditCoupon(null); reset(); setShowModal(true); };
  const openEdit = (c) => {
    setEditCoupon(c);
    setValue('code', c.code);
    setValue('discountType', c.discountType || 'percentage');
    setValue('discountValue', c.discountValue);
    setValue('minOrderAmount', c.minOrderAmount || '');
    setValue('maxDiscountAmount', c.maxDiscountAmount || '');
    setValue('usageLimit', c.usageLimit || '');
    setValue('expiryDate', c.expiryDate?.split('T')[0] || '');
    setValue('active', c.active);
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    const payload = { 
      ...data, 
      discountValue: Number(data.discountValue), 
      minOrderAmount: Number(data.minOrderAmount) || 0,
      maxDiscountAmount: data.maxDiscountAmount ? Number(data.maxDiscountAmount) : null,
      usageLimit: data.usageLimit ? Number(data.usageLimit) : null
    };
    const result = editCoupon
      ? await dispatch(updateCoupon({ id: editCoupon._id, payload }))
      : await dispatch(createCoupon(payload));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success(editCoupon ? 'Coupon updated!' : 'Coupon created!');
      setShowModal(false);
    }
  };

  const handleDelete = async () => {
    const result = await dispatch(deleteCoupon(deleteId));
    if (result.meta.requestStatus === 'fulfilled') toast.success('Coupon deleted!');
    setDeleteId(null);
  };

  const inputClass = (err) => `w-full px-3 py-2 border ${err ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg text-sm bg-transparent outline-none`;

  return (
    <>
      <Helmet><title>Coupons – SD COLLECTIONS Admin</title></Helmet>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Coupon Management</h1>
        <button onClick={openAdd} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <FiPlus /><span>Add Coupon</span>
        </button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50">
                {['Code', 'Discount', 'Min Order', 'Expires', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((coupon) => (
                <tr key={coupon._id} className="border-b border-gray-50 dark:border-gray-700">
                  <td className="px-4 py-3 font-mono font-semibold text-blue-600">{coupon.code}</td>
                  <td className="px-4 py-3 font-semibold">{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}</td>
                  <td className="px-4 py-3">₹{coupon.minOrderAmount?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${coupon.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {coupon.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => openEdit(coupon)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded" aria-label="Edit"><FiEdit2 size={15} /></button>
                      <button onClick={() => setDeleteId(coupon._id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" aria-label="Delete"><FiTrash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-gray-400">No coupons yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editCoupon ? 'Edit Coupon' : 'Add Coupon'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Coupon Code *</label>
            <input {...register('code', { required: true })} className={inputClass(errors.code)} placeholder="SAVE10" style={{ textTransform: 'uppercase' }} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Discount Type *</label>
              <select {...register('discountType', { required: true })} className={inputClass(errors.discountType)}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Discount Value *</label>
              <input {...register('discountValue', { required: true, min: 1 })} type="number" className={inputClass(errors.discountValue)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Min Order (₹)</label>
              <input {...register('minOrderAmount')} type="number" className={inputClass(false)} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Max Discount (₹)</label>
              <input {...register('maxDiscountAmount')} type="number" placeholder="Optional" className={inputClass(false)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Usage Limit</label>
              <input {...register('usageLimit')} type="number" placeholder="Optional" className={inputClass(false)} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Expiry Date *</label>
              <input {...register('expiryDate', { required: true })} type="date" className={inputClass(errors.expiryDate)} />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input {...register('active')} type="checkbox" id="active" className="accent-blue-600" />
            <label htmlFor="active" className="text-sm text-gray-700 dark:text-gray-200">Active</label>
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">{editCoupon ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Coupon" message="Delete this coupon permanently?" />
    </>
  );
}

export default CouponManagement;
