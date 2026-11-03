import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { FiHeart, FiShoppingCart, FiTrash2, FiArrowRight, FiCheck } from 'react-icons/fi';
import placeholderImg from '../assets/images/PNG.png';
import { useGetWishlistQuery, useToggleWishlistMutation } from '../store/api/authApi';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { addItem, openCart } from '../store/slices/cartSlice';
import { addToast } from '../store/slices/uiSlice';
import { ProductGridSkeleton } from '../components/common/Skeleton';
import BackButton from '../components/common/BackButton';
import Breadcrumbs from '../components/common/Breadcrumbs';

const Wishlist = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const { data: wishlistData, isLoading } = useGetWishlistQuery(undefined, {
        skip: !isAuthenticated,
    });
    const [toggleWishlist] = useToggleWishlistMutation();

    const [removingId, setRemovingId] = useState(null);
    const [addingId, setAddingId] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Filter out potential null or invalid products from deleted items
    const wishlistItems = (wishlistData?.data || []).filter(item => item && item._id);

    const handleBackNavigation = () => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate('/products');
        }
    };

    const handleAddToCart = (e, product, isOutOfStock, hasOptions) => {
        e.preventDefault();
        e.stopPropagation();

        if (isOutOfStock) {
            dispatch(addToast({
                type: 'error',
                message: 'This item is currently out of stock',
            }));
            return;
        }

        // If product has sizes or requires customization, navigate to detail page to select options
        if (hasOptions) {
            navigate(`/products/${product._id}`);
            return;
        }

        setAddingId(product._id);
        dispatch(addItem({
            product: {
                _id: product._id,
                name: product.name,
                price: product.price,
                images: product.images,
                stock: product.stock,
            },
            quantity: 1,
        }));
        dispatch(openCart());
        dispatch(addToast({
            type: 'success',
            message: `${product.name} added to cart!`,
        }));

        setTimeout(() => {
            setAddingId(null);
        }, 1200);
    };

    const handleRemove = async (e, productId) => {
        e.preventDefault();
        e.stopPropagation();

        setRemovingId(productId);
        try {
            await toggleWishlist(productId).unwrap();
            dispatch(addToast({
                type: 'success',
                message: 'Removed from wishlist',
            }));
        } catch {
            dispatch(addToast({
                type: 'error',
                message: 'Failed to remove item',
            }));
        } finally {
            setRemovingId(null);
        }
    };

    // 1. Unauthenticated State
    if (!isAuthenticated) {
        return (
            <div className="min-h-[calc(100vh-100px)] pt-44 md:pt-32 pb-24 md:pb-16 bg-[#fafcff]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 mb-6">
                        <BackButton onClick={handleBackNavigation} />
                        <Breadcrumbs items={[{ label: 'Wishlist' }]} />
                    </div>

                    <div className="min-h-[50vh] flex items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="text-center px-4 max-w-md mx-auto"
                        >
                            <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-6 rounded-full bg-pink-50 border border-pink-200/60 flex items-center justify-center shadow-xs">
                                <FiHeart size={44} className="text-[#FF64B4]" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
                                Sign in to view your wishlist
                            </h1>
                            <p className="text-sm sm:text-base text-gray-500 mb-8 leading-relaxed">
                                Save your favorite items in one place and access them across all your devices.
                            </p>
                            <Link
                                to="/auth"
                                className="inline-flex items-center justify-center w-full sm:w-auto bg-[#FF64B4] hover:bg-[#e0529f] text-white font-bold px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                            >
                                Sign In Now
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        );
    }

    // 2. Loading State
    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-100px)] pt-44 md:pt-32 pb-24 md:pb-16 bg-[#fafcff]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 mb-6">
                        <BackButton onClick={handleBackNavigation} />
                        <Breadcrumbs items={[{ label: 'Wishlist' }]} />
                    </div>
                    <div className="mb-6 sm:mb-8">
                        <div className="h-8 w-44 bg-gray-200 rounded-lg animate-pulse mb-2" />
                        <div className="h-4 w-28 bg-gray-100 rounded animate-pulse" />
                    </div>
                    <ProductGridSkeleton count={8} className="gap-3 sm:gap-6" />
                </div>
            </div>
        );
    }

    // 3. Empty Wishlist State
    if (wishlistItems.length === 0) {
        return (
            <div className="min-h-[calc(100vh-100px)] pt-44 md:pt-32 pb-24 md:pb-16 bg-[#fafcff]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 mb-6">
                        <BackButton onClick={handleBackNavigation} />
                        <Breadcrumbs items={[{ label: 'Wishlist' }]} />
                    </div>

                    <div className="min-h-[50vh] flex items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="text-center px-4 max-w-md mx-auto"
                        >
                            <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-6 rounded-full bg-pink-50 border border-pink-200/60 flex items-center justify-center shadow-xs">
                                <FiHeart size={44} className="text-[#FF64B4]" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                                Your wishlist is empty
                            </h1>
                            <p className="text-sm sm:text-base text-gray-500 mb-8 leading-relaxed">
                                Explore our collection and tap the heart icon on any product to save your favorites here.
                            </p>
                            <Link
                                to="/products"
                                className="inline-flex items-center justify-center w-full sm:w-auto bg-[#FF64B4] hover:bg-[#e0529f] text-white font-bold px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                            >
                                Explore Products
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        );
    }

    // 4. Populated Wishlist State
    return (
        <div className="min-h-[calc(100vh-100px)] pt-44 md:pt-32 pb-24 md:pb-16 bg-[#fafcff]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-6 sm:mb-8"
                >
                    <div className="flex items-center gap-4 mb-4 sm:mb-6">
                        <BackButton onClick={handleBackNavigation} />
                        <Breadcrumbs items={[{ label: 'Wishlist' }]} />
                    </div>
                    <div className="flex items-baseline justify-between">
                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-1">
                                My Wishlist
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500 font-medium">
                                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Wishlist Responsive Grid: 2 columns on mobile, 2 sm, 3 lg, 4 xl */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                    {wishlistItems.map((product, index) => {
                        const rawPrice = typeof product.price === 'number'
                            ? product.price
                            : parseFloat(String(product.price).replace(/[^0-9.]/g, '')) || 0;
                        const formattedPrice = `₹ ${Math.round(rawPrice).toLocaleString('en-IN')}`;

                        const rawOriginalPrice = product.originalPrice
                            ? (typeof product.originalPrice === 'number'
                                ? product.originalPrice
                                : parseFloat(String(product.originalPrice).replace(/[^0-9.]/g, '')) || 0)
                            : 0;
                        const formattedOriginalPrice = rawOriginalPrice > rawPrice
                            ? `₹ ${Math.round(rawOriginalPrice).toLocaleString('en-IN')}`
                            : null;

                        const discount = rawOriginalPrice > rawPrice
                            ? Math.round(((rawOriginalPrice - rawPrice) / rawOriginalPrice) * 100)
                            : 0;

                        const imageSrc = product.images?.[0]?.startsWith('http')
                            ? product.images[0]
                            : (product.images?.[0] ? `${API_URL}${product.images[0]}` : placeholderImg);

                        const isOutOfStock = typeof product.stock === 'number' ? product.stock <= 0 : false;
                        const hasOptions = (product.sizes && product.sizes.length > 0) || Boolean(product.isCustomizable);
                        const isRemoving = removingId === product._id;
                        const isAdded = addingId === product._id;

                        return (
                            <motion.div
                                key={product._id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
                                className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 hover:border-gray-400 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between h-full group relative"
                            >
                                {/* Top Image Area with Badges & Floating Remove Button */}
                                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                                    <Link to={`/products/${product._id}`} className="block w-full h-full">
                                        <img
                                            src={imageSrc}
                                            alt={product.name}
                                            className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${
                                                isOutOfStock ? 'grayscale opacity-75' : ''
                                            }`}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = placeholderImg;
                                            }}
                                        />
                                    </Link>

                                    {/* Top-Left Status Badges */}
                                    <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
                                        {isOutOfStock ? (
                                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-full shadow-2xs border border-rose-200">
                                                Out of Stock
                                            </span>
                                        ) : discount > 0 ? (
                                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-900 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-full shadow-2xs">
                                                {discount}% OFF
                                            </span>
                                        ) : null}
                                    </div>

                                    {/* Top-Right Floating Remove Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        disabled={isRemoving}
                                        onClick={(e) => handleRemove(e, product._id)}
                                        title="Remove from Wishlist"
                                        aria-label="Remove from Wishlist"
                                        className={`absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 hover:bg-rose-50 text-gray-400 hover:text-rose-500 shadow-xs border border-gray-200/80 flex items-center justify-center transition-colors ${
                                            isRemoving ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {isRemoving ? (
                                            <span className="w-3.5 h-3.5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <FiTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        )}
                                    </motion.button>
                                </div>

                                {/* Content Area */}
                                <div className="p-2.5 sm:p-4 flex flex-col flex-1 justify-between">
                                    <div>
                                        <Link to={`/products/${product._id}`}>
                                            <h3 className="font-bold text-gray-900 text-xs sm:text-base line-clamp-1 hover:underline">
                                                {product.name}
                                            </h3>
                                        </Link>
                                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 line-clamp-1">
                                            {product.description || (typeof product.category === 'object' ? product.category?.name : '') || 'Exclusive Glitz Collection'}
                                        </p>
                                    </div>

                                    {/* Price & Add to Cart Section */}
                                    <div className="mt-2 sm:mt-3 pt-2 sm:pt-2.5 border-t border-gray-100">
                                        <div className="flex items-baseline gap-1.5 flex-wrap mb-2 sm:mb-2.5">
                                            <span className="text-sm sm:text-lg font-black text-gray-900">
                                                {formattedPrice}
                                            </span>
                                            {formattedOriginalPrice && (
                                                <span className="text-[10px] sm:text-xs text-gray-400 line-through font-medium">
                                                    {formattedOriginalPrice}
                                                </span>
                                            )}
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: isOutOfStock ? 1 : 1.02 }}
                                            whileTap={{ scale: isOutOfStock ? 1 : 0.98 }}
                                            disabled={isOutOfStock}
                                            onClick={(e) => handleAddToCart(e, product, isOutOfStock, hasOptions)}
                                            className={`w-full py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl sm:rounded-2xl text-[11px] sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs ${
                                                isOutOfStock
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                                    : 'bg-white text-gray-900 border border-gray-300 hover:border-gray-900 hover:bg-gray-50 active:bg-gray-100'
                                            }`}
                                        >
                                            {isOutOfStock ? (
                                                <span>Out of Stock</span>
                                            ) : isAdded ? (
                                                <>
                                                    <FiCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 flex-shrink-0" />
                                                    <span className="text-emerald-700 truncate">Added!</span>
                                                </>
                                            ) : hasOptions ? (
                                                <>
                                                    <span className="truncate">Select Options</span>
                                                    <FiArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                                </>
                                            ) : (
                                                <>
                                                    <FiShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                                    <span className="truncate">Add to Cart</span>
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Wishlist;
