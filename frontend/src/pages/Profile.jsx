import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { fetchProfile, updateProfile } from '../store/authSlice';
import { LuSave } from 'react-icons/lu';
import toast from 'react-hot-toast';

function Profile() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { name: user?.name || '', email: user?.email || '', phone: user?.phone || '' },
  });

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    const result = await dispatch(updateProfile({ name: data.name, phone: data.phone }));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Profile updated successfully!');
    }
  };

  const inputClass = (err) =>
    `w-full px-3 py-2 border ${
      err ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
    } rounded-lg text-sm bg-transparent outline-none focus:border-blue-500 transition-all`;

  return (
    <>
      <Helmet><title>Account Overview – SD COLLECTIONS</title></Helmet>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Overview</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your personal information and preferences.</p>
      </div>

      <div className="max-w-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="flex items-center space-x-4 mb-2">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.role === 'admin' ? 'Administrator' : 'Customer'}</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Full Name *</label>
            <input {...register('name', { required: 'Name is required' })} className={inputClass(errors.name)} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Email * (Read-only)</label>
            <input {...register('email')} type="email" disabled className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed outline-none" />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Phone (10-Digit)</label>
            <input {...register('phone', { pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid phone number' } })} className={inputClass(errors.phone)} />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
            <button type="submit" disabled={loading} className="flex items-center space-x-2 px-5 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
              <LuSave size={16} /><span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default Profile;
