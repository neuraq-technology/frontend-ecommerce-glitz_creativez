import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
    FiHeart,
    FiShoppingCart,
    FiMinus,
    FiPlus,
    FiStar,
    FiTruck,
    FiShield,
    FiChevronRight,
    FiUser,
    FiSend,
    FiArrowLeft,
    FiGift,
} from 'react-icons/fi';
import placeholderImg from '../assets/images/PNG.png';
import { useGetProductByIdQuery, useGetRelatedProductsQuery, useCreateReviewMutation } from '../store/api/productsApi';
import { useToggleWishlistMutation, useGetWishlistQuery } from '../store/api/authApi';
import { addItem, openCart } from '../store/slices/cartSlice';
import { addToast } from '../store/slices/uiSlice';
import { selectIsAuthenticated, selectCurrentUser } from '../store/slices/authSlice';
import { ProductDetailSkeleton } from '../components/common/Skeleton';
import ProductGrid from '../components/products/ProductGrid';
import Button from '../components/common/Button';
import BackButton from '../components/common/BackButton';
import SizeSelector from '../components/products/SizeSelector';

const ProductDetail = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    // State for star rating hover effect
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [selectedSize, setSelectedSize] = useState(null);
    const features = [
        { icon: <FiGift size={28} />, title: 'Gift Wrapping', desc: 'Complimentary elegant wrapping' },
        { icon: <FiTruck size={28} />, title: 'Fast Delivery', desc: 'Same day local delivery' },
        { icon: <FiHeart size={28} />, title: 'Personal Touch', desc: 'Custom gift messages' },
        { icon: <FiShield size={28} />, title: 'Quality Promise', desc: '100% satisfaction guaranteed' },
    ];


    const isAuthenticated = useSelector(selectIsAuthenticated);
    const currentUser = useSelector(selectCurrentUser);
    const { data: productData, isLoading, refetch } = useGetProductByIdQuery(id);
    const { data: relatedData, isLoading: relatedLoading } = useGetRelatedProductsQuery(id);
    const [toggleWishlist] = useToggleWishlistMutation();

    // Fetch wishlist to check status
    const { data: wishlistData } = useGetWishlistQuery(undefined, {
        skip: !isAuthenticated,
    });

    // Check if current product is in wishlist
    const isInWishlist = wishlistData?.data?.some(item =>
        (typeof item === 'object' ? item._id : item) === id
    );

    const [createReview, { isLoading: isSubmittingReview }] = useCreateReviewMutation();

    const product = productData?.data;

    useEffect(() => {
        if (product?.sizes?.length > 0 && !selectedSize) {
            setSelectedSize(product.sizes[0]);
        }
    }, [product, selectedSize]);

    const handleAddToCart = () => {
        if (!product) return;

        if (!isAuthenticated) {
            navigate('/auth');
            return;
        }

        dispatch(addItem({
            product: {
                _id: product._id,
                name: product.name,
                price: selectedSize ? selectedSize.price : product.price,
                images: selectedSize?.image ? [selectedSize.image, ...(product.images || [])] : product.images,
                size: selectedSize?.name
            },
            quantity,
        }));

        // dispatch(openCart());
        dispatch(addToast({
            type: 'success',
            message: `${product.name} added to cart!`,
        }));
        navigate('/cart');
    };

    const handleWishlist = async () => {
        if (!isAuthenticated) {
            navigate('/auth');
            return;
        }

        try {
            await toggleWishlist(id).unwrap();
            // dispatch(addToast({
            //     type: 'success',
            //     message: 'Wishlist updated!',
            // }));
        } catch {
            dispatch(addToast({
                type: 'error',
                message: 'Failed to update wishlist',
            }));
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            dispatch(addToast({
                type: 'warning',
                message: 'Please login to write a review',
            }));
            navigate('/auth');
            return;
        }

        if (!reviewComment.trim()) {
            dispatch(addToast({
                type: 'error',
                message: 'Please write a comment',
            }));
            return;
        }

        try {
            await createReview({
                productId: id,
                rating: reviewRating,
                comment: reviewComment.trim(),
            }).unwrap();

            dispatch(addToast({
                type: 'success',
                message: 'Review submitted successfully!',
            }));

            // Reset form
            setShowReviewForm(false);
            setReviewRating(5);
            setReviewComment('');

            // Refetch product to show new review
            refetch();
        } catch (error) {
            dispatch(addToast({
                type: 'error',
                message: error?.data?.message || 'Failed to submit review',
            }));
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${diffDays >= 14 ? 's' : ''} ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${diffDays >= 60 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    // Check if current user has already reviewed
    const hasUserReviewed = product?.reviews?.some(
        (review) => review.user?._id === currentUser?._id || review.user === currentUser?._id
    );

    if (isLoading) {
        return (
            <div className="min-h-screen pt-24 pb-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ProductDetailSkeleton />
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
                    <Link to="/products">
                        <Button>Back to Products</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    // Limit related products to 4
    const limitedRelatedProducts = relatedData?.data?.slice(0, 4) || [];

    // Get reviews from product
    const reviews = product.reviews || [];

    return (
        <div className="min-h-screen pt-24 pb-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Navigation & Breadcrumbs - hidden on mobile */}
                <div className="hidden sm:flex items-center gap-4 mb-6 sm:mb-8 w-full">
                    <BackButton />

                    <motion.nav
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 overflow-x-auto pb-2 scrollbar-hide shrink-0"
                    >
                        <Link to="/" className="hover:text-primary-600 transition-colors flex-shrink-0">Home</Link>
                        <FiChevronRight size={12} className="flex-shrink-0" />
                        <Link to="/products" className="hover:text-primary-600 transition-colors flex-shrink-0">Products</Link>
                        <FiChevronRight size={12} className="flex-shrink-0" />
                        {product.category && (
                            <>
                                <Link to={`/products?category=${product.category._id}`} className="hover:text-primary-600 transition-colors flex-shrink-0 max-w-[80px] sm:max-w-none truncate">
                                    {product.category.name}
                                </Link>
                                <FiChevronRight size={12} className="flex-shrink-0" />
                            </>
                        )}
                        <span className="text-gray-900 truncate max-w-[100px] sm:max-w-xs flex-shrink-0">{product.name}</span>
                    </motion.nav>
                </div>

                {/* Main Product Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-12 mt-6 lg:mt-0 items-start">
                    {/* Image Gallery */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4 lg:col-span-5 max-w-xl mx-auto w-full"
                    >
                        {/* Main Image */}
                        <div className="relative aspect-square rounded-[32px] overflow-hidden bg-white/50 backdrop-blur-3xl border border-white/60 shadow-[0_20px_40px_rgb(0,0,0,0.06)]">
                            <AnimatePresence mode="wait">
                                {(() => {
                                    const currentDisplayImage = product.images?.[selectedImage];

                                    return (
                                        <motion.img
                                            key={selectedImage}
                                            initial={{ opacity: 0, scale: 1.05 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            src={currentDisplayImage?.startsWith('http') ? currentDisplayImage : `http://localhost:5000${currentDisplayImage}`}
                                            onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                                            alt={product.name}
                                            className={`w-full h-full object-cover ${product.stock <= 0 ? 'grayscale' : ''}`}
                                        />
                                    );
                                })()}
                            </AnimatePresence>

                            {product.featured && (
                                <div className="absolute top-4 left-4 z-20 px-3 py-1.5 bg-gradient-to-r from-amber-200 to-yellow-200 text-amber-900 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm flex items-center gap-1.5">
                                    <span>Best Selling</span>
                                </div>
                            )}
                        </div>

                        {/* Removed duplicate size selector from top */}

                        {/* Thumbnails */}
                        {product.images?.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {product.images.map((image, index) => (
                                    <motion.button
                                        key={index}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedImage(index)}
                                        className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === index
                                            ? 'border-primary-500 shadow-glow'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <img
                                            src={image?.startsWith('http') ? image : `http://localhost:5000${image}`}
                                            alt=""
                                            className={`w-full h-full object-cover ${product.stock <= 0 ? 'grayscale' : ''}`}
                                            onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                                        />
                                    </motion.button>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Product Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-5 lg:col-span-7"
                    >
                        {/* Category & Brand */}
                        <div className="flex items-center gap-3">

                        </div>

                        {/* Title & Rating */}
                        <div className="space-y-2 mb-4">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 leading-tight tracking-tight">
                                {product.name}
                            </h1>

                            {/* Badge style rating */}
                            {product.numReviews > 0 && (
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[#2e7d32] text-white rounded-[4px] shadow-sm">
                                        <span className="text-[13px] font-bold leading-none">{product.rating > 0 ? product.rating.toFixed(1) : '0'}</span>
                                        <FiStar size={12} className="fill-current" />
                                    </div>
                                    <span className="text-[14px] text-[#666666] font-medium">
                                        ({product.numReviews} Reviews)
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Price */}
                        <div className="flex flex-wrap items-end gap-2 mb-4">
                            <span className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                                ₹{selectedSize ? selectedSize.price?.toFixed(2) : product.price?.toFixed(2)}
                            </span>
                            {product.originalPrice > product.price && (
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-base text-gray-400 line-through">
                                        ₹{product.originalPrice?.toFixed(2)}
                                    </span>
                                    <span className="text-[13px] font-bold text-green-600 uppercase tracking-tight">
                                        ({discount}% OFF)
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Stock Status */}
                        <div className={`flex items-center gap-2 text-sm font-medium mb-6 ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                            <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                            {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                        </div>

                        <div className="w-full h-px bg-gray-100 my-6"></div>

                        {/* Size Selector - Integrated here */}
                        <div className="mb-6">
                            <SizeSelector
                                sizes={product.sizes}
                                selectedSize={selectedSize}
                                onSelectSize={(size) => {
                                    setSelectedSize(size);
                                    if (size.image) setSelectedImage(0);
                                }}
                            />
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center gap-4 sm:gap-6 mb-8">
                            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Quantity</span>
                            <div className="flex items-center gap-1 p-1 rounded-lg border border-gray-200 bg-white shadow-sm">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="p-1.5 sm:p-2 rounded-md hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    <FiMinus size={16} />
                                </motion.button>
                                <span className="w-10 sm:w-12 text-center text-gray-900 font-semibold">
                                    {quantity}
                                </span>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    className="p-1.5 sm:p-2 rounded-md hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    <FiPlus size={16} />
                                </motion.button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                            <Button
                                size="lg"
                                className="flex-1 flex justify-center py-4 text-lg !bg-gradient-to-r from-primary-500 to-primary-600 !text-white border-none shadow-[0_8px_20px_rgba(244,63,94,0.3)] hover:shadow-[0_12px_25px_rgba(244,63,94,0.4)] hover:-translate-y-1 transition-all duration-300 font-bold"
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                icon={<FiShoppingCart />}
                            >
                                Add to Cart
                            </Button>
                            <button
                                onClick={handleWishlist}
                                className={`flex-shrink-0 w-[58px] h-[58px] flex items-center justify-center rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 ${isInWishlist
                                    ? 'bg-[#FFF1F2] text-rose-500 border-rose-100 shadow-[0_8px_20px_rgba(244,63,94,0.15)]'
                                    : 'bg-white text-gray-400 border-gray-200 hover:border-rose-200 hover:text-rose-400 hover:shadow-md'
                                    }`}
                            >
                                <FiHeart size={24} className={isInWishlist ? "fill-current" : ""} />
                            </button>
                        </div>

                        {/* WhatsApp Urgent Order Link */}
                        <div className="pt-4">
                            <a
                                href={`https://wa.me/919567924716?text=${encodeURIComponent("I'm interested in urgent ordering for: " + product.name)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366]/10 text-[#075E54] hover:bg-[#25D366]/20 font-bold rounded-xl transition-colors shadow-sm border border-[#25D366]/30"
                            >
                                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-[#25D366]" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11.97 3c-4.962 0-8.99 4.027-8.99 8.99a8.962 8.962 0 0 0 1.258 4.604l-1.325 4.842 4.957-1.3a8.949 8.949 0 0 0 4.099.982h.004c4.96 0 8.988-4.027 8.988-8.991C20.95 7.164 16.927 3 11.97 3zm0 14.802h-.003a7.468 7.468 0 0 1-3.811-1.049l-.273-.162-2.834.743.755-2.763-.178-.283a7.447 7.447 0 0 1-1.144-4.004c0-4.135 3.364-7.499 7.498-7.499 4.133 0 7.497 3.364 7.497 7.5S16.104 17.802 11.97 17.802zm4.11-5.618c-.225-.113-1.334-.658-1.54-.733-.207-.075-.357-.112-.507.112-.15.225-.583.733-.715.883-.131.15-.262.169-.487.056-.225-.113-.952-.351-1.814-1.121-.67-.599-1.123-1.338-1.254-1.563-.131-.225-.014-.347.099-.46.101-.101.225-.262.338-.393.112-.132.15-.226.225-.376.074-.15.037-.282-.019-.395-.056-.113-.507-1.223-.695-1.675-.183-.441-.368-.381-.506-.388-.131-.006-.281-.006-.431-.006a.82.82 0 0 0-.592.274c-.207.225-.79.771-.79 1.88 0 1.109.808 2.181.92 2.332.113.15 1.589 2.427 3.847 3.402.538.233.957.373 1.284.477.54.172 1.032.148 1.419.09.431-.065 1.334-.545 1.521-1.071.188-.526.188-.977.132-1.071-.057-.094-.207-.15-.432-.263z" />
                                </svg>
                                Urgent orders click here
                            </a>
                        </div>
                    </motion.div>
                </div>

                {/* Content Sections */}
                <div className="space-y-12 mb-12">
                    {/* Features Section */}
                    <section className="py-12 bg-white border-y border-gray-100 rounded-2xl shadow-sm">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {features.map((feature, index) => (
                                    <div className="flex items-center gap-4 p-6 rounded-2xl bg-white border border-gray-200 hover:border-[#4cc9f0]/40 hover:shadow-card transition-all duration-300">
                                        <div className="p-3 rounded-xl bg-gradient-to-br from-[#4cc9f0]/80 to-[#4cc9f0] text-white shadow-[0_8px_16px_rgba(76,201,240,0.25)]">
                                            {feature.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-gray-900 font-semibold">{feature.title}</h3>
                                            <p className="text-gray-500 text-sm">{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Description Section */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-card">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Product Description</h2>
                        <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed">
                            {product.description || 'No description available for this product.'}
                        </div>

                        {/* Specifications */}
                        {product.specifications?.length > 0 && (
                            <div className="mt-8 pt-8 border-t border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Specifications</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                    {product.specifications.map((spec, index) => (
                                        <div key={index} className="flex justify-between border-b border-gray-50 pb-2">
                                            <span className="text-gray-500 font-medium">{spec.key}</span>
                                            <span className="text-gray-900">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Reviews Section - Always show to allow adding reviews */}
                    <div className="space-y-12">
                        {/* Customer Ratings Section */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-900">Customer Ratings</h2>

                            {/* Rating Summary & Photos */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-card">
                                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                                    {/* Left: Rating Score */}
                                    <div className="flex-shrink-0 text-center lg:text-left">
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Ratings <FiStar className="inline mb-1" /></h3>
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className="text-5xl font-bold text-gray-900">{product.rating?.toFixed(1) || '0.0'}</span>
                                            <FiStar className="text-yellow-400 fill-yellow-400" size={28} />
                                        </div>
                                        <p className="text-gray-500 text-sm">{product.numReviews || 0} Verified Buyers</p>
                                    </div>

                                    {/* Middle: Rating Bars */}
                                    <div className="flex-1 space-y-2 lg:border-l lg:border-r border-gray-100 lg:px-12">
                                        {[5, 4, 3, 2, 1].map((star) => {
                                            const count = reviews.filter(r => Math.round(r.rating) === star).length;
                                            const percentage = product.numReviews ? (count / product.numReviews) * 100 : 0;
                                            return (
                                                <div key={star} className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1 w-12 flex-shrink-0">
                                                        <span className="text-sm font-medium text-gray-600">{star}</span>
                                                        <FiStar className="text-gray-300" size={12} />
                                                    </div>
                                                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-500 bg-yellow-400"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-gray-400 w-8 text-right flex-shrink-0">{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>


                                </div>

                                {/* Write Review Action */}
                                <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-gray-900">Review this product</p>
                                        <p className="text-sm text-gray-500">Share your thoughts with other customers</p>
                                    </div>
                                    {!showReviewForm && !hasUserReviewed && (
                                        <Button
                                            variant="outline"
                                            className="!border-yellow-400 !text-yellow-600 hover:!bg-yellow-50"
                                            onClick={() => {
                                                if (!isAuthenticated) {
                                                    dispatch(addToast({
                                                        type: 'warning',
                                                        message: 'Please login to write a review',
                                                    }));
                                                    navigate('/auth');
                                                } else {
                                                    setShowReviewForm(true);
                                                }
                                            }}
                                        >
                                            Write a Review
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Review Form */}
                            <AnimatePresence>
                                {showReviewForm && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-white rounded-2xl border border-primary-100 p-8 shadow-card-gold overflow-hidden"
                                    >
                                        <h3 className="text-lg font-bold text-gray-900 mb-6">Write Your Review</h3>
                                        <form onSubmit={handleSubmitReview} className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                                <div className="flex items-center gap-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            onClick={() => setReviewRating(star)}
                                                            onMouseEnter={() => setHoverRating(star)}
                                                            onMouseLeave={() => setHoverRating(0)}
                                                            className="focus:outline-none transition-transform hover:scale-110"
                                                        >
                                                            <FiStar
                                                                size={32}
                                                                className={`transition-colors ${star <= (hoverRating || reviewRating)
                                                                    ? 'text-amber-400 fill-amber-400'
                                                                    : 'text-gray-300'
                                                                    }`}
                                                            />
                                                        </button>
                                                    ))}
                                                    <span className="ml-3 text-sm font-medium px-3 py-1 bg-gray-100 rounded-full text-gray-600">
                                                        {reviewRating === 1 && 'Poor'}
                                                        {reviewRating === 2 && 'Fair'}
                                                        {reviewRating === 3 && 'Good'}
                                                        {reviewRating === 4 && 'Very Good'}
                                                        {reviewRating === 5 && 'Excellent'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                                                <textarea
                                                    value={reviewComment}
                                                    onChange={(e) => setReviewComment(e.target.value)}
                                                    placeholder="What did you like or dislike? What did you use this product for?"
                                                    rows={4}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all resize-none"
                                                    required
                                                />
                                            </div>

                                            <div className="flex items-center justify-end gap-3 pt-2">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setShowReviewForm(false);
                                                        setReviewRating(5);
                                                        setReviewComment('');
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={isSubmittingReview}
                                                    icon={<FiSend />}
                                                >
                                                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                                                </Button>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Customer Reviews Section - Only show if there are reviews to display */}
                        {reviews.length > 0 && (
                            <div className="space-y-8">
                                <h2 className="text-xl font-bold text-gray-900">Customer Reviews ({product.numReviews})</h2>

                                {/* Display subset or all reviews */}
                                {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review, index) => (
                                    <motion.div
                                        key={review._id || index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="border-y border-gray-300 py-8"
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Rating Badge */}
                                            <div className={`
                                            px-2 py-1 rounded text-white text-xs font-bold flex items-center gap-1 h-fit
                                            ${review.rating >= 4 ? 'bg-green-500' : review.rating >= 2 ? 'bg-yellow-400' : 'bg-red-500'}
                                        `}>
                                                {review.rating} <FiStar size={10} className="fill-current" />
                                            </div>

                                            <div className="flex-1">
                                                {/* Review Content */}
                                                <p className="text-gray-700 leading-relaxed mb-4 text-sm sm:text-base">
                                                    {review.comment}
                                                </p>

                                                {/* Footer: User Info & Actions */}
                                                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400">
                                                    <div className="flex items-center gap-2 sm:gap-4">
                                                        <span className="font-medium text-gray-900 border-r border-gray-200 pr-4">
                                                            {review.name || review.user?.name || 'Anonymous'}
                                                        </span>
                                                        <span>{formatDate(review.createdAt)}</span>
                                                    </div>
                                                </div>

                                                {/* Verified Badge */}
                                                <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                                                    <div className="w-3 h-3 rounded-full bg-gray-200 flex items-center justify-center">✓</div>
                                                    <span>Verified Buyer</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                {/* View All Button */}
                                {!showAllReviews && reviews.length > 3 && (
                                    <div className="pt-8 text-center border-t border-gray-100">
                                        <button
                                            onClick={() => setShowAllReviews(true)}
                                            className="text-primary-600 font-bold hover:text-primary-700 transition-colors text-sm uppercase tracking-wide flex items-center justify-center gap-2 mx-auto"
                                        >
                                            View All {product.numReviews} Reviews <FiChevronRight />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Related Products Section */}
                    {limitedRelatedProducts.length > 0 && (
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Related Products</h2>
                                {relatedData?.data?.length > 4 && (
                                    <Link to={`/products?category=${product.category?._id}`}>
                                        <Button variant="ghost" size="sm" icon={<FiChevronRight />} iconPosition="right">
                                            View All
                                        </Button>
                                    </Link>
                                )}
                            </div>
                            <ProductGrid
                                products={limitedRelatedProducts}
                                isLoading={relatedLoading}
                                columns={4}
                            />
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
