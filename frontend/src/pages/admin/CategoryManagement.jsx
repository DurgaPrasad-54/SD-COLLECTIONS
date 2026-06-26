import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../store/categorySlice';
import { useForm } from 'react-hook-form';
import Modal from '../../components/Modal';
import ConfirmationModal from '../../components/ConfirmationModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

function CategoryManagement() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((s) => s.category);
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  const openAdd = () => { setEditCat(null); reset(); setShowModal(true); };
  const openEdit = (c) => { setEditCat(c); setValue('name', c.name); setValue('description', c.description); setShowModal(true); };

  const onSubmit = async (data) => {
    const result = editCat
      ? await dispatch(updateCategory({ id: editCat._id, payload: data }))
      : await dispatch(createCategory(data));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success(editCat ? 'Category updated!' : 'Category created!');
      setShowModal(false);
    }
  };

  const handleDelete = async () => {
    const result = await dispatch(deleteCategory(deleteId));
    if (result.meta.requestStatus === 'fulfilled') toast.success('Category deleted!');
    setDeleteId(null);
  };

  const inputClass = (err) => `w-full px-3 py-2 border ${err ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg text-sm bg-transparent outline-none`;

  return (
    <>
      <Helmet><title>Categories – SD COLLECTIONS Admin</title></Helmet>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Category Management</h1>
        <button onClick={openAdd} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <FiPlus /><span>Add Category</span>
        </button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {list.map((cat) => (
            <div key={cat._id} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <img src={(typeof cat.image === 'string' ? cat.image : cat.image?.url) || `https://placehold.co/48x48?text=${encodeURIComponent(cat.name)}`} alt={cat.name}
                  className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{cat.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{cat.description || 'No description'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button onClick={() => openEdit(cat)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded" aria-label="Edit"><FiEdit2 size={15} /></button>
                <button onClick={() => setDeleteId(cat._id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" aria-label="Delete"><FiTrash2 size={15} /></button>
              </div>
            </div>
          ))}
          {list.length === 0 && <p className="text-gray-400 col-span-3 text-center py-8">No categories yet</p>}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editCat ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Name *</label>
            <input {...register('name', { required: true })} className={inputClass(errors.name)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Description</label>
            <textarea {...register('description')} rows={2} className={`${inputClass(false)} resize-none`} />
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">{editCat ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Category" message="Delete this category? Products in this category may be affected." />
    </>
  );
}

export default CategoryManagement;
