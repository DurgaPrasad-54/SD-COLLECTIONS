import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { fetchProductById, fetchProducts, clearCurrent } from '../store/productSlice';
import { addToCart } from '../store/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/wishlistSlice';
import api from '../services/api';
import Breadcrumb from '../components/Breadcrumb';
import Rating from '../components/Rating';
import Review from '../components/Review';
import ProductGrid from '../components/ProductGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiHeart, FiShoppingCart, FiShare2, FiMinus, FiPlus } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: product, list, loading } = useSelector((state) => state.product);
  const { token } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const isWishlisted = wishlistItems.some((i) => i._id === id);

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    dispatch(fetchProductById(id));
    return () => dispatch(clearCurrent());
  }, [dispatch, id]);

  useEffect(() => {
    if (product) {
      setActiveImg(0);
      dispatch(fetchProducts({ category: product.category?._id, limit: 4 }));
    }
  }, [product, dispatch]);

  useEffect(() => {
    const getReviews = async () => {
      try {
        const { data } = await api.get(`/reviews/${id}`);
        setReviews(data.data || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };
    getReviews();
  }, [id]);

  const handleAddCart = () => {
    if (!size && product?.sizes?.length > 0) return toast.error('Please select a size');
    if (!color && product?.colors?.length > 0) return toast.error('Please select a color');
    dispatch(addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url || '',
      quantity: qty,
      size,
      color,
    }));
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    if (!size && product?.sizes?.length > 0) return toast.error('Please select a size');
    if (!color && product?.colors?.length > 0) return toast.error('Please select a color');

    const buyNowItem = {
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url || '',
      quantity: qty,
      size,
      color,
    };

    navigate('/checkout', { state: { buyNowItem } });
  };

  const handleWishlist = () => {
    if (isWishlisted) { dispatch(removeFromWishlist(product._id)); toast.success('Removed from wishlist'); }
    else { dispatch(addToWishlist(product)); toast.success('Added to wishlist!'); }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) return toast.error('Please login to review');
    if (userRating === 0) return toast.error('Please select a rating');
    try {
      setSubmittingReview(true);
      const { data } = await api.post(`/reviews/${id}`, { rating: userRating, comment: userComment });
      setReviews((prev) => [data.data, ...prev]);
      setUserRating(0);
      setUserComment('');
      toast.success('Review submitted!');
    } catch (_) { /* error toast handled in interceptor */ }
    finally { setSubmittingReview(false); }
  };

  const images = product?.images?.length ? product.images : [{ url: `https://placehold.co/600x600?text=${encodeURIComponent(product?.name || 'Product')}` }];
  const related = list.filter((p) => p._id !== id).slice(0, 4);

  if (loading) return <LoadingSpinner />;
  if (!product) return null;

  return (
    <>
      <Helmet>
        <title>{`${product.name} – SD COLLECTIONS`}</title>
        <meta name="description" content={product.description?.slice(0, 150)} />
      </Helmet>

      <Breadcrumb crumbs={[{ to: '/', label: 'Home' }, { to: '/shop', label: 'Shop' }, { label: product.name }]} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 mb-12">
        {/* Image Gallery */}
        <div className="flex flex-col">
          <div
            className={`relative overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 cursor-zoom-in mb-4 ${zoomed ? 'cursor-zoom-out' : ''}`}
            onClick={() => setZoomed(!zoomed)}
          >
            <motion.img
              key={activeImg}
              src={images[activeImg]?.url}
              alt={product.name}
              className={`w-full object-cover transition-transform duration-300 ${zoomed ? 'scale-150' : 'scale-100'}`}
              style={{ aspectRatio: '1/1', maxHeight: '500px' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-full aspect-square rounded-xl overflow-hidden border-2 transition-colors ${i === activeImg ? 'border-blue-600' : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'}`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover bg-gray-50 dark:bg-gray-900" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <p className="text-sm text-blue-600 font-medium mb-1">{product.category?.name || 'Clothing'}</p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{product.name}</h1>
          <div className="flex items-center space-x-2 mb-3">
            <Rating value={product.rating || 0} readOnly />
            <span className="text-sm text-gray-500">({product.numReviews || 0} reviews)</span>
          </div>
          <div className="flex items-baseline space-x-3 mb-4">
            <span className="text-3xl font-extrabold text-blue-600">₹{product.price?.toLocaleString()}</span>
            {product.originalPrice > product.price && (
              <span className="text-lg text-gray-400 line-through">₹{product.originalPrice?.toLocaleString()}</span>
            )}
            {product.discount > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded">{product.discount}% OFF</span>
            )}
          </div>

          <p className="text-gray-600 dark:text-gray-300 text-sm mb-5 leading-relaxed">{product.description}</p>

          {/* Size Selector */}
          {product.sizes?.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-sm mb-2">Size</h4>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button key={s} onClick={() => setSize(s)}
                    className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${size === s ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {product.colors?.length > 0 && (
            <div className="mb-5">
              <h4 className="font-semibold text-sm mb-2">Color</h4>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button key={c} onClick={() => setColor(c)}
                    className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${color === c ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center space-x-3 mb-6">
            <span className="text-sm font-medium">Quantity:</span>
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"><FiMinus size={14} /></button>
              <span className="px-4 py-2 text-sm font-medium">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(q + 1, product.stock || 99))} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"><FiPlus size={14} /></button>
            </div>
            <span className="text-sm text-gray-400">{product.stock} in stock</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-4">
            <button onClick={handleAddCart} className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
              <FiShoppingCart />
              <span>Add to Cart</span>
            </button>
            <button onClick={handleBuyNow} className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              Buy Now
            </button>
            <button onClick={handleWishlist} className={`p-3 rounded-xl border-2 transition-colors ${isWishlisted ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-500' : 'border-gray-300 dark:border-gray-600 hover:border-red-400'}`} aria-label="Wishlist">
              <FiHeart size={20} style={{ fill: isWishlisted ? 'currentColor' : 'none' }} />
            </button>
            <button onClick={() => navigator.share?.({ title: product.name, url: window.location.href })} className="p-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400" aria-label="Share">
              <FiShare2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Reviews ({reviews.length})</h2>

        {/* Submit Review */}
        {token && (
          <form onSubmit={handleReviewSubmit} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 mb-6">
            <h3 className="font-semibold mb-3">Write a Review</h3>
            <div className="mb-3">
              <Rating value={userRating} onChange={setUserRating} />
            </div>
            <textarea
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              placeholder="Share your experience..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm bg-transparent outline-none resize-none h-24"
              required
            />
            <button type="submit" disabled={submittingReview} className="mt-3 px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {reviews.length > 0 ? reviews.map((r, i) => <Review key={i} review={r} />) : <p className="text-gray-400">No reviews yet.</p>}
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </>
  );
}

export default ProductDetails;
