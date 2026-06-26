import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../../services/api';
import { useForm } from 'react-hook-form';
import Modal from '../../components/Modal';
import ConfirmationModal from '../../components/ConfirmationModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

function BannerManagement() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editBanner, setEditBanner] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchBanners = async () => {
    try { const { data } = await api.get('/banners'); setBanners(data.data || []); }
    catch (_) { } finally { setLoading(false); }
  };

  useEffect(() => { fetchBanners(); }, []);

  const openAdd = () => { setEditBanner(null); reset(); setImageFile(null); setShowModal(true); };
  const openEdit = (b) => {
    setEditBanner(b);
    setValue('title', b.title);
    setValue('redirectUrl', b.redirectUrl || '');
    setValue('order', b.order || 0);
    setValue('active', b.active);
    setImageFile(null);
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      if (data.redirectUrl) formData.append('redirectUrl', data.redirectUrl);
      if (data.order) formData.append('order', Number(data.order));
      formData.append('active', data.active);
      if (imageFile) formData.append('image', imageFile);

      if (editBanner) { 
        const r = await api.put(`/banners/${editBanner._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }); 
        setBanners((prev) => prev.map((b) => b._id === editBanner._id ? r.data.data : b)); 
        toast.success('Banner updated!'); 
      }
      else { 
        if (!imageFile) return toast.error('Please upload an image');
        const r = await api.post('/banners', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); 
        setBanners((prev) => [...prev, r.data.data]); 
        toast.success('Banner created!'); 
      }
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving banner'); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/banners/${deleteId}`); setBanners((prev) => prev.filter((b) => b._id !== deleteId)); toast.success('Banner deleted!'); }
    catch (_) { } finally { setDeleteId(null); }
  };

  const inputClass = (err) => `w-full px-3 py-2 border ${err ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg text-sm bg-transparent outline-none`;

  return (
    <>
      <Helmet><title>Banners – SD COLLECTIONS Admin</title></Helmet>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Banner Management</h1>
        <button onClick={openAdd} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <FiPlus /><span>Add Banner</span>
        </button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {banners.map((b) => (
            <div key={b._id} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white p-4 relative">
                {b.image?.url ? (
                  <img src={b.image.url} alt={b.title} className="w-full h-full object-cover absolute inset-0" />
                ) : (
                  <div className="text-center z-10">
                    <p className="font-bold">{b.title}</p>
                    <p className="text-xs opacity-80">{b.subtitle}</p>
                  </div>
                )}
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{b.title}</p>
                  <span className={`text-xs ${b.active ? 'text-green-600' : 'text-red-500'}`}>
                    {b.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => openEdit(b)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"><FiEdit2 size={15} /></button>
                  <button onClick={() => setDeleteId(b._id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><FiTrash2 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
          {banners.length === 0 && <p className="text-gray-400 col-span-3 text-center py-8">No banners yet</p>}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editBanner ? 'Edit Banner' : 'Add Banner'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Title *</label>
            <input {...register('title', { required: true })} className={inputClass(errors.title)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Banner Image {editBanner ? '' : '*'}</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className={inputClass(false)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Redirect URL</label>
            <input {...register('redirectUrl')} placeholder="/shop?category=XYZ" className={inputClass(false)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Order / Sequence</label>
            <input {...register('order')} type="number" defaultValue={0} className={inputClass(false)} />
          </div>
          <div className="flex items-center space-x-2">
            <input {...register('active')} type="checkbox" id="bActive" className="accent-blue-600" />
            <label htmlFor="bActive" className="text-sm text-gray-700 dark:text-gray-200">Active</label>
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">{editBanner ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Banner" message="Delete this banner?" />
    </>
  );
}

export default BannerManagement;
