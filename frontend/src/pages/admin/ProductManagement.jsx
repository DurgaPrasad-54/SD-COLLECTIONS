import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../../store/productSlice';
import { fetchCategories } from '../../store/categorySlice';
import { useForm } from 'react-hook-form';
import Modal from '../../components/Modal';
import ConfirmationModal from '../../components/ConfirmationModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

function ProductManagement() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((state) => state.product);
  const { list: categories } = useSelector((state) => state.category);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  
  // Image handling states
  const [existingImages, setExistingImages] = useState([]);
  const [newImageUploaders, setNewImageUploaders] = useState([{ id: Date.now(), file: null, preview: null }]);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => { dispatch(fetchProducts({ limit: 100 })); dispatch(fetchCategories()); }, [dispatch]);

  const openAdd = () => { 
    setEditProduct(null); 
    reset(); 
    setExistingImages([]);
    setNewImageUploaders([{ id: Date.now(), file: null, preview: null }]);
    setShowModal(true); 
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setValue('name', p.name);
    setValue('price', p.price);
    setValue('originalPrice', p.originalPrice);
    setValue('description', p.description);
    setValue('category', p.category?._id || p.category);
    setValue('stock', p.stock);
    setValue('sizes', p.sizes?.join(','));
    setValue('colors', p.colors?.join(','));
    
    // Set existing images
    setExistingImages(p.images || []);
    // Reset new uploaders
    setNewImageUploaders([]);
    
    setShowModal(true);
  };

  // Image uploader handlers
  const handleAddUploader = () => {
    setNewImageUploaders([...newImageUploaders, { id: Date.now(), file: null, preview: null }]);
  };

  const handleRemoveUploader = (id) => {
    setNewImageUploaders(newImageUploaders.filter(u => u.id !== id));
  };

  const handleFileChange = (id, file) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setNewImageUploaders(newImageUploaders.map(u => 
      u.id === id ? { ...u, file, preview: previewUrl } : u
    ));
  };

  const handleRemoveExistingImage = (publicId) => {
    setExistingImages(existingImages.filter(img => img.publicId !== publicId));
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('price', Number(data.price));
    formData.append('originalPrice', Number(data.originalPrice) || Number(data.price));
    formData.append('stock', Number(data.stock));
    formData.append('category', data.category);
    formData.append('description', data.description);

    if (data.sizes) {
      const sizesArray = data.sizes.split(',').map((s) => s.trim()).filter(Boolean);
      formData.append('sizes', JSON.stringify(sizesArray));
    }
    if (data.colors) {
      const colorsArray = data.colors.split(',').map((c) => c.trim()).filter(Boolean);
      formData.append('colors', JSON.stringify(colorsArray));
    }

    if (editProduct) {
      formData.append('existingImages', JSON.stringify(existingImages));
    }

    // Append all selected valid files from the dynamic uploaders
    const filesToUpload = newImageUploaders.map(u => u.file).filter(Boolean);
    filesToUpload.forEach(file => {
      formData.append('images', file);
    });

    if (!editProduct && filesToUpload.length === 0) {
      return toast.error('Please upload at least one image.');
    }

    if (editProduct && filesToUpload.length === 0 && existingImages.length === 0) {
      return toast.error('Product must have at least one image.');
    }

    const result = editProduct
      ? await dispatch(updateProduct({ id: editProduct._id, payload: formData }))
      : await dispatch(createProduct(formData));
      
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success(editProduct ? 'Product updated!' : 'Product created!');
      
      // Cleanup object URLs to avoid memory leaks
      newImageUploaders.forEach(u => {
        if (u.preview) URL.revokeObjectURL(u.preview);
      });
      
      setShowModal(false);
    }
  };

  const handleDelete = async () => {
    const result = await dispatch(deleteProduct(deleteId));
    if (result.meta.requestStatus === 'fulfilled') toast.success('Product deleted!');
    setDeleteId(null);
  };

  const filtered = list.filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()));
  const inputClass = (err) => `w-full px-3 py-2 border ${err ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg text-sm bg-transparent outline-none`;

  return (
    <>
      <Helmet><title>Products – SD COLLECTIONS Admin</title></Helmet>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Product Management</h1>
        <button onClick={openAdd} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <FiPlus /><span>Add Product</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."
          className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 outline-none" />
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                {['Product', 'Category', 'Price', 'Stock', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <img src={p.images?.[0]?.url || p.image?.url || `https://placehold.co/40x40/png`} alt={p.name}
                        className="w-10 h-10 object-cover rounded-lg" />
                      <span className="font-medium text-gray-800 dark:text-gray-100">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.category?.name || '—'}</td>
                  <td className="px-4 py-3 font-semibold text-blue-600">₹{p.price?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.stock > 0 ? p.stock : 'Out'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded" aria-label="Edit">
                        <FiEdit2 size={15} />
                      </button>
                      <button onClick={() => setDeleteId(p._id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" aria-label="Delete">
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editProduct ? 'Edit Product' : 'Add Product'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Product Name *</label>
            <input {...register('name', { required: true })} className={inputClass(errors.name)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Price (₹) *</label>
            <input {...register('price', { required: true })} type="number" className={inputClass(errors.price)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Original Price (₹)</label>
            <input {...register('originalPrice')} type="number" className={inputClass(false)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Category *</label>
            <select {...register('category', { required: true })} className={inputClass(errors.category)}>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Stock *</label>
            <input {...register('stock', { required: true })} type="number" className={inputClass(errors.stock)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Sizes (comma-separated)</label>
            <input {...register('sizes')} placeholder="S,M,L,XL" className={inputClass(false)} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Colors (comma-separated)</label>
            <input {...register('colors')} placeholder="Red,Blue,Black" className={inputClass(false)} />
          </div>
          
          <div className="sm:col-span-2 mt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Images *</label>
              <button 
                type="button" 
                onClick={handleAddUploader}
                className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                <FiPlus size={14}/><span>Add More</span>
              </button>
            </div>
            
            <div className="flex flex-wrap gap-4">
              {/* Existing Images (Edit Mode) */}
              {editProduct && existingImages.map((img) => (
                <div key={img.publicId} className="relative w-24 h-24 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden group">
                  <img src={img.url} alt="Existing" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                    <span className="text-[10px] text-white font-bold mb-1">Existing</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveExistingImage(img.publicId)}
                      className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      <FiTrash2 size={12}/>
                    </button>
                  </div>
                </div>
              ))}

              {/* Dynamic Uploaders */}
              {newImageUploaders.map((uploader) => (
                <div key={uploader.id} className="relative w-24 h-24 border border-dashed border-gray-400 dark:border-gray-500 rounded-lg flex flex-col items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors overflow-hidden group">
                  {uploader.preview ? (
                    <>
                      <img src={uploader.preview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                        <span className="text-[10px] text-white font-bold mb-1">New</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveUploader(uploader.id)}
                          className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                        >
                          <FiTrash2 size={12}/>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                        <FiPlus className="text-gray-400 mb-1" size={20} />
                        <span className="text-[10px] text-gray-500">Upload</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleFileChange(uploader.id, e.target.files[0])}
                        />
                      </label>
                      {newImageUploaders.length > 1 && (
                        <button 
                          type="button"
                          onClick={() => handleRemoveUploader(uploader.id)}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-md z-10"
                        >
                          <FiX size={12}/>
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
            {newImageUploaders.length === 0 && existingImages.length === 0 && (
              <p className="text-red-500 text-xs mt-2">Please add at least one image.</p>
            )}
          </div>
          
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 block">Description *</label>
            <textarea {...register('description', { required: 'Description is required' })} rows={3} className={inputClass(errors.description) + " resize-none"} />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>
          <div className="sm:col-span-2 flex justify-end space-x-3 mt-4">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
              {editProduct ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This will permanently remove all associated images from Cloudinary. This action cannot be undone."
      />
    </>
  );
}

export default ProductManagement;
