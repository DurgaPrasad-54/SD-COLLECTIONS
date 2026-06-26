import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { addAddress, updateAddress, deleteAddress } from '../store/authSlice';
import { LuPlus, LuTrash2, LuPencil } from 'react-icons/lu';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';

function Addresses() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const handleOpenAdd = () => {
    setEditingAddress(null);
    reset({
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingAddress(addr);
    reset({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: addr.isDefault || false,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    const payload = {
      fullName: data.fullName,
      phone: data.phone,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2 || '',
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      isDefault: data.isDefault || false,
    };

    if (editingAddress) {
      const result = await dispatch(updateAddress({ addressId: editingAddress._id, payload }));
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('Address updated successfully!');
        setIsModalOpen(false);
      }
    } else {
      const result = await dispatch(addAddress(payload));
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('Address added successfully!');
        setIsModalOpen(false);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      const result = await dispatch(deleteAddress(id));
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('Address deleted successfully!');
      }
    }
  };

  const inputClass = (err) =>
    `w-full px-3 py-2 border ${
      err ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
    } rounded-lg text-sm bg-transparent outline-none focus:border-blue-500 transition-all`;

  return (
    <>
      <Helmet><title>Address Book – SD COLLECTIONS</title></Helmet>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Address Book</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your shipping addresses.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center space-x-1 px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <LuPlus size={16} />
          <span>Add New Address</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {user?.addresses?.map((addr) => (
          <div key={addr._id} className={`bg-white dark:bg-gray-800 border rounded-xl p-5 shadow-sm relative flex flex-col justify-between ${addr.isDefault ? 'border-blue-600' : 'border-gray-200 dark:border-gray-700'}`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900 dark:text-white">{addr.fullName}</span>
                {addr.isDefault && (
                  <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                    Default
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{addr.addressLine1}</p>
              {addr.addressLine2 && <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{addr.addressLine2}</p>}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{addr.city}, {addr.state} – {addr.pincode}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-mono">Ph: {addr.phone}</p>
            </div>
            
            <div className="flex items-center space-x-2 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => handleOpenEdit(addr)}
                className="flex-1 flex justify-center items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <LuPencil size={14} />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(addr._id)}
                className="flex-1 flex justify-center items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-800 transition-colors"
              >
                <LuTrash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}

        {(!user?.addresses || user.addresses.length === 0) && (
          <div className="col-span-full py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">No saved addresses found. Add one to get started!</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingAddress ? 'Edit Address' : 'Add New Address'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Recipient Full Name *</label>
              <input {...register('fullName', { required: 'Name is required' })} className={inputClass(errors.fullName)} />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Phone Number *</label>
              <input {...register('phone', { required: 'Phone is required', pattern: { value: /^[6-9]\d{9}$/, message: '10-digit phone required' } })} className={inputClass(errors.phone)} />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Address Line 1 *</label>
            <input {...register('addressLine1', { required: 'Address is required' })} className={inputClass(errors.addressLine1)} />
            {errors.addressLine1 && <p className="text-red-500 text-xs mt-1">{errors.addressLine1.message}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Address Line 2 (Optional)</label>
            <input {...register('addressLine2')} className={inputClass()} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">City *</label>
              <input {...register('city', { required: 'City is required' })} className={inputClass(errors.city)} />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">State *</label>
              <input {...register('state', { required: 'State is required' })} className={inputClass(errors.state)} />
              {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Pincode *</label>
              <input {...register('pincode', { required: 'Pincode is required', pattern: { value: /^\d{6}$/, message: '6 digits required' } })} className={inputClass(errors.pincode)} />
              {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode.message}</p>}
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input type="checkbox" id="isDefault" {...register('isDefault')} className="accent-blue-600 w-4 h-4" />
            <label htmlFor="isDefault" className="text-sm font-medium text-gray-900 dark:text-white select-none">Set as default shipping address</label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default Addresses;
