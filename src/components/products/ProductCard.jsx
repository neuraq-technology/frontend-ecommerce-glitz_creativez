import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { FiHeart, FiShoppingBag, FiStar } from 'react-icons/fi';
import placeholderImg from '../../assets/images/PNG.png';
import { addItem, openCart } from '../../store/slices/cartSlice';
import { addToast } from '../../store/slices/uiSlice';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import { useToggleWishlistMutation } from '../../store/api/authApi';

const ProductCard = ({ product, index = 0, wishlist = [] }) => {
    const dispatch = useDispatch();
    const [isHovered, setIsHovered] = useState(false);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    // Toggle logic remains
    const [toggleWishlist] = useToggleWishlistMutation();

    // Check if current product is in wishlist using the passed prop
    const isInWishlist = wishlist?.some(item =>
        (typeof item === 'object' ? item._id : item) === product._id
    );

    const navigate = useNavigate();
    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            navigate('/auth');
            return;
        }

        dispatch(addItem({
            product: {
                _id: product._id,
                name: product.name,
                price: product.price,
                images: product.images,
            },
            quantity: 1,
        }));
        dispatch(openCart());
        dispatch(addToast({ type: 'success', message: `Added to bag` }));
    };

    const handleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            navigate('/auth');
            return;
        }
        try {
            await toggleWishlist(product._id).unwrap();
            // Toast handled by mutation typically or add specific message here
            if (isInWishlist) {
                dispatch(addToast({ type: 'info', message: 'Removed from wishlist' }));
            } else {
                dispatch(addToast({ type: 'success', message: 'Added to wishlist' }));
            }
        } catch {
            dispatch(addToast({ type: 'error', message: 'Failed to update wishlist' }));
        }
    };

    const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return (
        <motion.div
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="group relative h-full"
        >
            <Link to={`/products/${product._id}`} className="block h-full">
                {/* Main Card Container */}
                <div className="relative bg-white h-full overflow-hidden flex flex-col border border-gray-100/50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 ease-out rounded-xl sm:rounded-2xl">

                    {/* Image Section - Square on mobile, shorter on desktop (4:3) */}
                    <div className="relative aspect-square sm:aspect-[4/3] bg-white overflow-hidden">

                        {/* Product Image */}
                        <motion.img
                            src={product.images?.[0]?.startsWith('http') ? product.images[0] : (product.images?.[0] ? `http://localhost:5000${product.images[0]}` : placeholderImg)}
                            alt={product.name}
                            className={`w-full h-full object-cover ${product.stock <= 0 ? 'grayscale' : ''}`}
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                        />

                        {/* Gradient Overlay for Better Badge Visibility */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none" />

                        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1.5 sm:gap-2">
                            {product.stock <= 0 ? (
                                <span className="px-1.5 sm:px-2.5 py-1 bg-[#e0218a] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-sm shadow-sm">
                                    Out of Stock
                                </span>
                            ) : product.featured ? (
                                <span className="px-1.5 sm:px-2.5 py-1 bg-[#00c3e3] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-sm shadow-sm">
                                    Best Selling
                                </span>
                            ) : null}
                        </div>

                        {/* Wishlist Heart Icon - Top Right */}
                        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10">
                            <button
                                onClick={handleWishlist}
                                className="p-2 bg-white/90 hover:bg-white backdrop-blur-md rounded-full shadow-[0_4px_12px_rgb(0,0,0,0.08)] hover:shadow-[0_4px_15px_rgba(244,63,94,0.2)] hover:scale-110 transition-all duration-300 group/wishlist"
                                aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                            >
                                <FiHeart
                                    className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${isInWishlist
                                        ? 'text-rose-500 fill-rose-500 scale-110'
                                        : 'text-gray-400 group-hover/wishlist:text-rose-400'
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Mobile: Rating Badge on Image (Myntra Style) */}
                        {product.rating > 0 && (
                            <div className="sm:hidden absolute bottom-2 left-2">
                                <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-sm">
                                    <span className="text-[10px] font-bold text-gray-800">
                                        {product.rating.toFixed(1)}
                                    </span>
                                    <FiStar className="w-2.5 h-2.5 text-primary-500 fill-primary-500" />
                                    <span className="text-[9px] text-gray-400 border-l border-gray-200 pl-1">
                                        {product.numReviews || 0}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="p-2 sm:p-4 flex-1 flex flex-col relative">
                        {/* Product Name */}
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 capitalize text-left leading-tight line-clamp-1 sm:line-clamp-2 mb-1 sm:mb-2 group-hover:text-primary-600 transition-colors pr-6">
                            {product.name}
                        </h3>
                        {product.rating > 0 && (
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[#2e7d32] text-white rounded-[4px] shadow-sm">
                                    <span className="text-[11px] font-bold leading-none">{product.rating}</span>
                                    <FiStar size={10} className="fill-current" />
                                </div>
                                <span className="text-[12px] text-[#666666] font-medium">
                                    ({product.numReviews?.toLocaleString() || 0})
                                </span>
                            </div>
                        )}

                        {/* Price Section Area */}
                        <div className="flex flex-col gap-3 mt-auto pt-2">
                            <div className="flex flex-col gap-0.5">
                                {/* Price Section */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-lg sm:text-xl font-black bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                                        ₹{product.price?.toFixed(2)}
                                    </span>

                                    {/* Original Price & Discount */}
                                    {product.originalPrice > product.price && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-[12px] text-gray-400 line-through font-medium">
                                                ₹{product.originalPrice?.toFixed(0)}
                                            </span>
                                            <span className="text-[11px] font-bold text-green-600 uppercase tracking-tight">
                                                ({discount}% OFF)
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Add to Cart Button */}
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock <= 0}
                                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold transition-all duration-300 ${
                                    product.stock <= 0 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                                    : 'bg-primary-50 text-primary-600 hover:bg-gradient-to-r hover:from-primary-500 hover:to-primary-600 hover:text-white shadow-sm hover:shadow-[0_6px_16px_rgba(244,63,94,0.3)] hover:-translate-y-0.5'
                                }`}
                            >
                                <FiShoppingBag size={18} />
                                {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default ProductCard;
