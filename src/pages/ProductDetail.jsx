import { useState, useEffect, useRef } from 'react';
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
    FiChevronLeft,
    FiChevronRight,
    FiSend,
    FiGift,
    FiUploadCloud,
    FiTag,
    FiZap,
    FiCheck,
    FiMapPin,
    FiRefreshCw,
    FiCheckCircle,
    FiShare2,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import placeholderImg from '../assets/images/PNG.png';
import {
    useGetProductByIdQuery,
    useGetRelatedProductsQuery,
    useGetBestSellingProductsQuery,
    useCreateReviewMutation,
} from '../store/api/productsApi';
import { useToggleWishlistMutation, useGetWishlistQuery } from '../store/api/authApi';
import { addItem } from '../store/slices/cartSlice';
import { addToast } from '../store/slices/uiSlice';
import { selectIsAuthenticated, selectCurrentUser } from '../store/slices/authSlice';
import { ProductDetailSkeleton } from '../components/common/Skeleton';
import ProductGrid from '../components/products/ProductGrid';
import ProductCard from '../components/products/ProductCard';
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
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [selectedSize, setSelectedSize] = useState(null);
    const [customImage, setCustomImage] = useState('');
    const [customText, setCustomText] = useState('');
    const [isUploadingCustom, setIsUploadingCustom] = useState(false);

    // Pincode Delivery Checker State (Flipkart UX)
    const [pincode, setPincode] = useState('560001');
    const [pincodeInput, setPincodeInput] = useState('560001');
    const [pincodeChecked, setPincodeChecked] = useState(true);
    const [pincodeError, setPincodeError] = useState('');

    // Carousel refs, boundary states & smooth scroll handler for bottom recommendation sections
    const row1Ref = useRef(null);
    const row2Ref = useRef(null);
    const [canScrollLeft1, setCanScrollLeft1] = useState(false);
    const [canScrollRight1, setCanScrollRight1] = useState(true);
    const [canScrollLeft2, setCanScrollLeft2] = useState(false);
    const [canScrollRight2, setCanScrollRight2] = useState(true);

    const checkScroll1 = () => {
        if (row1Ref.current) {
            const { scrollLeft, scrollWidth, clientWidth } = row1Ref.current;
            setCanScrollLeft1(scrollLeft > 8);
            setCanScrollRight1(scrollLeft + clientWidth < scrollWidth - 8);
        }
    };

    const checkScroll2 = () => {
        if (row2Ref.current) {
            const { scrollLeft, scrollWidth, clientWidth } = row2Ref.current;
            setCanScrollLeft2(scrollLeft > 8);
            setCanScrollRight2(scrollLeft + clientWidth < scrollWidth - 8);
        }
    };

    const scrollRow = (ref, direction) => {
        if (ref.current) {
            const distance = Math.max(ref.current.clientWidth * 0.75, 260);
            ref.current.scrollBy({
                left: direction === 'left' ? -distance : distance,
                behavior: 'smooth'
            });
            setTimeout(() => {
                if (ref === row1Ref) checkScroll1();
                if (ref === row2Ref) checkScroll2();
            }, 350);
        }
    };

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const isAuthenticated = useSelector(selectIsAuthenticated);
    const currentUser = useSelector(selectCurrentUser);
    const { data: productData, isLoading, refetch } = useGetProductByIdQuery(id);
    const { data: relatedData, isLoading: relatedLoading } = useGetRelatedProductsQuery(id);
    const { data: bestSellingData } = useGetBestSellingProductsQuery(20);
    const [toggleWishlist] = useToggleWishlistMutation();

    const { data: wishlistData } = useGetWishlistQuery(undefined, {
        skip: !isAuthenticated,
    });

    const isInWishlist = wishlistData?.data?.some(item =>
        (typeof item === 'object' ? item._id : item) === id
    );

    const [createReview, { isLoading: isSubmittingReview }] = useCreateReviewMutation();

    const product = productData?.data;

    // ----------------- 2-ROW RECOMMENDATION LOGIC -----------------
    // Candidate pool of store products excluding current item
    const candidatePool = (bestSellingData?.data || []).filter(p => p._id !== id);

    // Row 1: Prioritize same category products; gracefully backfill up to 8 if category has fewer
    const exactCategoryRelated = (relatedData?.data || []).filter(p => p._id !== id);
    const hasCategoryRelated = exactCategoryRelated.length > 0;

    const row1Products = [...exactCategoryRelated];
    for (const p of candidatePool) {
        if (row1Products.length >= 8) break;
        if (!row1Products.some(item => item._id === p._id)) {
            row1Products.push(p);
        }
    }

    // Row 2: Up to 8 unique items from candidatePool that are NOT in Row 1
    const row2Products = candidatePool
        .filter(p => !row1Products.some(item => item._id === p._id))
        .slice(0, 8);

    useEffect(() => {
        // Initial scroll boundary evaluation
        const timer = setTimeout(() => {
            checkScroll1();
            checkScroll2();
        }, 100);
        window.addEventListener('resize', checkScroll1);
        window.addEventListener('resize', checkScroll2);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', checkScroll1);
            window.removeEventListener('resize', checkScroll2);
        };
    }, [row1Products.length, row2Products.length]);

    // Check customizable product type
    const isCustomizableProduct = () => {
        if (!product) return false;
        if (product.isCustomizable === true) return true;
        if (product.isCustomizable === false && product.hasOwnProperty('isCustomizable')) return false;

        const catName = typeof product.category === 'object' ? product.category?.name || '' : '';
        const searchable = `${product.name || ''} ${catName} ${(product.tags || []).join(' ')}`.toLowerCase();

        const customKeywords = ['photo', 'caricature', 'engraved', 'personalised', 'personalized', 'lamp', 'mug', 'frame', 'plaque', 'portrait', 'spotify', 'acrylic', 'keychain'];
        const nonCustomKeywords = ['flower', 'bouquet', 'chocolate', 'cake', 'plant', 'perfume', 'sweet'];

        const hasCustom = customKeywords.some(kw => searchable.includes(kw));
        const hasNonCustom = nonCustomKeywords.some(kw => searchable.includes(kw));

        if (hasNonCustom && !searchable.includes('photo') && !searchable.includes('caricature')) {
            return false;
        }

        return hasCustom;
    };

    const handleCustomImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            dispatch(addToast({ type: 'error', message: 'Image size should be less than 10MB' }));
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            setIsUploadingCustom(true);
            const res = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.image) {
                setCustomImage(data.image);
                dispatch(addToast({ type: 'success', message: 'Photo uploaded successfully!' }));
            } else {
                dispatch(addToast({ type: 'error', message: data.message || 'Failed to upload photo' }));
            }
        } catch (err) {
            console.error('Error uploading custom image:', err);
            dispatch(addToast({ type: 'error', message: 'Failed to upload photo. You can also send via WhatsApp.' }));
        } finally {
            setIsUploadingCustom(false);
        }
    };

    const handleAddToCart = () => {
        if (!product || product.stock === 0) return;

        if (product.sizes?.length > 0 && !selectedSize) {
            dispatch(addToast({
                type: 'warning',
                message: 'Please select an available size',
            }));
            return;
        }

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
                size: selectedSize?.name,
                customImage,
                customText
            },
            customImage,
            customText,
            quantity,
        }));

        dispatch(addToast({
            type: 'success',
            message: `${product.name} added to cart!`,
        }));
    };

    const handleBuyNow = () => {
        if (!product || product.stock === 0) return;

        if (product.sizes?.length > 0 && !selectedSize) {
            dispatch(addToast({
                type: 'warning',
                message: 'Please select an available size',
            }));
            return;
        }

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
                size: selectedSize?.name,
                customImage,
                customText
            },
            customImage,
            customText,
            quantity,
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
        } catch {
            dispatch(addToast({
                type: 'error',
                message: 'Failed to update wishlist',
            }));
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: product?.name || 'Glitz Product',
            text: `Check out ${product?.name || 'this gift'} on Glitz!`,
            url: window.location.href,
        };

        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    navigator.clipboard.writeText(window.location.href);
                    dispatch(addToast({
                        type: 'success',
                        message: 'Product link copied to clipboard!',
                    }));
                }
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            dispatch(addToast({
                type: 'success',
                message: 'Product link copied to clipboard!',
            }));
        }
    };

    const handleCheckPincode = (e) => {
        e.preventDefault();
        const trimmed = pincodeInput.trim();
        if (!trimmed || trimmed.length !== 6 || isNaN(trimmed)) {
            setPincodeError('Please enter a valid 6-digit delivery pincode');
            setPincodeChecked(false);
            return;
        }
        setPincode(trimmed);
        setPincodeError('');
        setPincodeChecked(true);
    };

    const getEstimatedDeliveryDate = () => {
        const date = new Date();
        date.setDate(date.getDate() + 4);
        return date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
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

            setShowReviewForm(false);
            setReviewRating(5);
            setReviewComment('');
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
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen pt-44 md:pt-32 pb-16 bg-[#fafcff]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ProductDetailSkeleton />
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen pt-44 md:pt-32 flex items-center justify-center bg-[#fafcff]">
                <div className="bg-white p-8 rounded-sm border border-gray-200 text-center max-w-md shadow-xs">
                    <h1 className="text-xl font-bold text-gray-900 mb-3">Product not found</h1>
                    <p className="text-sm text-gray-500 mb-6">The product you are looking for is unavailable or has moved.</p>
                    <Link to="/products">
                        <Button className="!bg-[#FF64B4] !text-white">Back to Products</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Realistic Pricing Calculation
    const displayPrice = selectedSize ? selectedSize.price : product.price;
    const originalPrice = product.originalPrice > displayPrice
        ? product.originalPrice
        : Math.round(displayPrice * 1.6);
    const discount = Math.round(((originalPrice - displayPrice) / originalPrice) * 100);

    const reviews = product.reviews || [];

    // Calculate REAL rating stats (strictly real data, no dummy values)
    const totalReviews = reviews.length || product.numReviews || 0;
    const averageRating = product.rating > 0
        ? product.rating
        : (reviews.length > 0
            ? reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0) / reviews.length
            : 0);

    return (
        <div className="min-h-screen pt-44 md:pt-32 pb-16 lg:pb-8 bg-[#fafcff] text-gray-900">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">

                {/* Back button & Breadcrumbs */}
                <div className="py-2.5 px-1 flex items-center gap-3">
                    <BackButton onClick={() => navigate(-1)} />
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto scrollbar-hide py-1">
                        <Link to="/" className="hover:text-[#FF64B4] transition-colors shrink-0">Home</Link>
                        <FiChevronRight size={10} className="shrink-0 text-gray-400" />
                        <Link to="/products" className="hover:text-[#FF64B4] transition-colors shrink-0">Products</Link>
                        {product.category && (
                            <>
                                <FiChevronRight size={10} className="shrink-0 text-gray-400" />
                                <Link
                                    to={`/products?category=${product.category._id}`}
                                    className="hover:text-[#FF64B4] transition-colors shrink-0 max-w-[120px] truncate"
                                >
                                    {product.category.name}
                                </Link>
                            </>
                        )}
                        <FiChevronRight size={10} className="shrink-0 text-gray-400" />
                        <span className="text-gray-900 font-medium truncate max-w-[160px] sm:max-w-md shrink-0">
                            {product.name}
                        </span>
                    </div>
                </div>

                {/* Main 2-Column Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 items-start">

                    {/* ----------------- LEFT COLUMN: GALLERY & DUAL ACTION BUTTONS ----------------- */}
                    <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-3">
                        <div className="bg-white p-3 sm:p-4 rounded-xs border border-gray-200 shadow-2xs">
                            <div className="flex flex-col sm:flex-row gap-3">

                                {/* Thumbnails Strip (Desktop left column / Mobile bottom) */}
                                {product.images?.length > 1 && (
                                    <div className="flex sm:flex-col gap-2 order-2 sm:order-1 overflow-x-auto sm:overflow-y-auto max-h-[420px] scrollbar-hide py-1">
                                        {product.images.map((image, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedImage(index)}
                                                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xs overflow-hidden border-2 transition-all shrink-0 bg-gray-50 flex items-center justify-center ${selectedImage === index
                                                    ? 'border-[#FF64B4] shadow-sm ring-1 ring-[#FF64B4]'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <img
                                                    src={image?.startsWith('http') ? image : `http://localhost:5000${image}`}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Main Image Preview Box */}
                                <div className="relative flex-1 aspect-square rounded-xs overflow-hidden bg-white border border-gray-100 flex items-center justify-center order-1 sm:order-2 group">
                                    <AnimatePresence mode="wait">
                                        {(() => {
                                            const currentDisplayImage = product.images?.[selectedImage] || product.images?.[0];
                                            return (
                                                <motion.img
                                                    key={selectedImage}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    src={currentDisplayImage?.startsWith('http') ? currentDisplayImage : `http://localhost:5000${currentDisplayImage}`}
                                                    onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                                                    alt={product.name}
                                                    className={`w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105 ${product.stock <= 0 ? 'grayscale' : ''}`}
                                                />
                                            );
                                        })()}
                                    </AnimatePresence>

                                    {/* Quick Action Floating Buttons (Wishlist & Share) */}
                                    <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
                                        {/* Wishlist Heart Button */}
                                        <button
                                            onClick={handleWishlist}
                                            aria-label="Save to Wishlist"
                                            title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                                            className="w-9 h-9 rounded-full bg-white/95 hover:bg-white border border-gray-300 shadow-sm flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
                                        >
                                            <FiHeart
                                                size={18}
                                                className={isInWishlist ? 'text-[#e53935] fill-[#e53935]' : 'text-black stroke-[2.2]'}
                                            />
                                        </button>

                                        {/* Share Button (Below Wishlist Button) */}
                                        <button
                                            onClick={handleShare}
                                            aria-label="Share Product"
                                            title="Share this product"
                                            className="w-9 h-9 rounded-full bg-white/95 hover:bg-white border border-gray-300 shadow-sm flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
                                        >
                                            <FiShare2
                                                size={17}
                                                className="text-black stroke-[2.2]"
                                            />
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </div>

                    </div>

                    {/* ----------------- RIGHT COLUMN: PRODUCT DETAILS & SPECS ----------------- */}
                    <div className="lg:col-span-7 space-y-3">

                        {/* Product Details Wrapper: Controls sticky boundary for dual CTA buttons */}
                        <div className="relative space-y-3">

                            {/* Main Info Card */}
                            <div className="bg-white p-4 sm:p-5 rounded-xs border border-gray-200 shadow-2xs space-y-3.5">

                            {/* Title */}
                            <div>
                                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 leading-snug">
                                    {product.name}
                                </h1>
                            </div>

                            {/* Rating & Review Count (Real data only) */}
                            {totalReviews > 0 ? (
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-600 text-white rounded-[3px] text-xs font-bold leading-none shadow-2xs">
                                        <span>{averageRating.toFixed(1)}</span>
                                        <FiStar size={10} className="fill-current" />
                                    </div>
                                    <span className="text-xs sm:text-sm text-gray-500 font-medium">
                                        {totalReviews} {totalReviews === 1 ? 'Rating & Review' : 'Ratings & Reviews'}
                                    </span>
                                </div>
                            ) : (
                                <div className="text-xs text-gray-500 font-medium">
                                    No ratings yet
                                </div>
                            )}

                            {/* Pricing Section */}
                            <div className="pt-1">
                                <span className="text-xs font-bold text-[#FF64B4] block mb-0.5 uppercase tracking-wide">Special Price</span>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                                        ₹{displayPrice.toFixed(0)}
                                    </span>
                                    <span className="text-sm sm:text-base text-gray-400 line-through font-medium">
                                        ₹{originalPrice.toFixed(0)}
                                    </span>
                                    <span className="text-sm sm:text-base font-bold text-emerald-700">
                                        {discount}% off
                                    </span>
                                </div>
                                <p className="text-[11px] text-gray-500 mt-1">
                                    Inclusive of all taxes • Free Delivery on prepaid orders
                                </p>
                            </div>

                            {/* Stock Status */}
                            <div className="text-xs font-semibold">
                                {product.stock > 0 ? (
                                    <span className="text-emerald-700 flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                                        In Stock ({product.stock} available)
                                    </span>
                                ) : (
                                    <span className="text-rose-600 flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                        Currently Out of Stock
                                    </span>
                                )}
                            </div>

                            {/* Pincode & Delivery Section - currently hidden */}
                            {/* 
                            <div className="pt-3 border-t border-gray-100">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#878787] w-24">
                                        <FiMapPin size={14} className="text-gray-400" />
                                        <span>Delivery</span>
                                    </div>
                                    <form onSubmit={handleCheckPincode} className="flex items-center gap-2">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                maxLength={6}
                                                value={pincodeInput}
                                                onChange={(e) => setPincodeInput(e.target.value)}
                                                placeholder="Enter Delivery Pincode"
                                                className="border-b-2 border-[#FF64B4] bg-transparent py-1 px-1 text-xs font-semibold text-gray-900 focus:outline-none w-40 tracking-wider"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="text-xs font-bold text-[#FF64B4] hover:text-[#e61d7e] uppercase tracking-wide px-2 py-1"
                                        >
                                            Check
                                        </button>
                                    </form>
                                </div>
                                {pincodeError && (
                                    <p className="text-[11px] text-[#d32f2f] font-medium pl-0 sm:pl-28">{pincodeError}</p>
                                )}
                                {pincodeChecked && (
                                    <div className="pl-0 sm:pl-28 space-y-1 text-xs">
                                        <div className="flex items-center gap-2 text-gray-900">
                                            <span className="font-bold text-[#212121]">Delivery by {getEstimatedDeliveryDate()}</span>
                                            <span className="text-[#388e3c] font-bold">Free</span>
                                            <span className="text-gray-400 line-through">₹40</span>
                                        </div>
                                        <p className="text-[11px] text-[#878787]">
                                            If ordered before 5:00 PM today • Cash on Delivery also available
                                        </p>
                                    </div>
                                )}
                            </div>
                            */}

                            {/* Size / Variant Selector (if available) */}
                            {product.sizes?.length > 0 && (
                                <div className="pt-3 border-t border-gray-100">
                                    <SizeSelector
                                        sizes={product.sizes}
                                        selectedSize={selectedSize}
                                        onSelectSize={(size) => {
                                            setSelectedSize(size);
                                            if (size.image) setSelectedImage(0);
                                        }}
                                    />
                                </div>
                            )}

                            {/* Personalisation Box (Flipkart Style Clean Add-on Box) */}
                            <div className="pt-3 border-t border-gray-100">
                                <div className="p-3.5 rounded-xs bg-[#fbfbfb] border border-gray-200 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-wide">
                                            <HiSparkles className="text-[#FF64B4]" size={16} />
                                            Personalise This Order
                                        </span>
                                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                            ₹0 Free Included
                                        </span>
                                    </div>

                                    {/* Photo Upload */}
                                    {isCustomizableProduct() && (
                                        <div>
                                            <label className="block text-[11px] font-medium text-gray-600 mb-1">
                                                Upload Photo <span className="text-gray-400">(for charm engraving / photo plaque)</span>
                                            </label>
                                            {customImage ? (
                                                <div className="flex items-center gap-3 p-2 bg-white rounded-xs border border-gray-200">
                                                    <img
                                                        src={customImage.startsWith('http') ? customImage : `${API_URL}${customImage}`}
                                                        alt="Custom preview"
                                                        className="w-12 h-12 object-cover rounded-xs border border-gray-200 shrink-0"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-semibold text-gray-900 truncate">Photo Attached</p>
                                                        <p className="text-[11px] text-[#388e3c] font-medium">✓ Ready for artisan crafting</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setCustomImage('')}
                                                        className="text-xs text-red-600 hover:text-red-700 font-bold px-2 py-1"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleCustomImageUpload}
                                                        disabled={isUploadingCustom}
                                                        className="hidden"
                                                        id="custom-gift-upload"
                                                    />
                                                    <label
                                                        htmlFor="custom-gift-upload"
                                                        className={`flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-white hover:bg-gray-50 border border-dashed border-gray-300 rounded-xs cursor-pointer text-xs font-semibold text-[#FF64B4] transition-colors ${isUploadingCustom ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                    >
                                                        <FiUploadCloud size={16} />
                                                        <span>{isUploadingCustom ? 'Uploading photo...' : 'Click to Upload Your Photo (JPG, PNG)'}</span>
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Custom Inscription / Greeting Note */}
                                    <div>
                                        <label className="block text-[11px] font-medium text-gray-600 mb-1">
                                            Custom Name / Gift Inscription <span className="text-gray-400">(Optional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={customText}
                                            onChange={(e) => setCustomText(e.target.value)}
                                            placeholder="e.g. Best Teacher Ever • With Love from Sarah"
                                            maxLength={100}
                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xs text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#FF64B4]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Quantity Selector */}
                            <div className="pt-2 flex items-center gap-4 text-xs">
                                <span className="font-semibold text-gray-700 uppercase tracking-wide">Quantity:</span>
                                <div className="flex items-center border border-gray-300 rounded-xs bg-white">
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="p-1.5 hover:bg-gray-100 text-gray-700 transition-colors"
                                    >
                                        <FiMinus size={14} />
                                    </button>
                                    <span className="w-10 text-center font-bold text-gray-900">{quantity}</span>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                        className="p-1.5 hover:bg-gray-100 text-gray-700 transition-colors"
                                    >
                                        <FiPlus size={14} />
                                    </button>
                                </div>
                            </div>


                        </div>

                        {/* Product Specifications Table */}
                        <div className="bg-white p-4 sm:p-5 rounded-xs border border-gray-200 shadow-2xs">
                            <h2 className="text-base sm:text-lg font-bold text-gray-900 pb-3 border-b border-gray-100">
                                Specifications
                            </h2>

                            <div className="pt-3 space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                    General Details
                                </h3>

                                <div className="divide-y divide-gray-100 text-xs">
                                    <div className="py-2.5 flex items-start">
                                        <span className="w-1/3 text-gray-500 font-medium">In The Box</span>
                                        <span className="w-2/3 text-gray-900 font-medium">1 Complete 3-Charm Set with Ring</span>
                                    </div>
                                    <div className="py-2.5 flex items-start">
                                        <span className="w-1/3 text-gray-500 font-medium">Product Name</span>
                                        <span className="w-2/3 text-gray-900 font-medium">{product.name}</span>
                                    </div>
                                    <div className="py-2.5 flex items-start">
                                        <span className="w-1/3 text-gray-500 font-medium">Category</span>
                                        <span className="w-2/3 text-gray-900 font-medium">{product.category?.name || 'Personalised Gifts'}</span>
                                    </div>
                                    <div className="py-2.5 flex items-start">
                                        <span className="w-1/3 text-gray-500 font-medium">Material</span>
                                        <span className="w-2/3 text-gray-900 font-medium">High-Grade Cast Acrylic & Stainless Keyring</span>
                                    </div>
                                    <div className="py-2.5 flex items-start">
                                        <span className="w-1/3 text-gray-500 font-medium">Finish</span>
                                        <span className="w-2/3 text-gray-900 font-medium">Laser Engraved High-Gloss Acrylic</span>
                                    </div>
                                    <div className="py-2.5 flex items-start">
                                        <span className="w-1/3 text-gray-500 font-medium">Suitable For</span>
                                        <span className="w-2/3 text-gray-900 font-medium">Car Keys, Bags, Backpacks, Milestone Gifting</span>
                                    </div>
                                    <div className="py-2.5 flex items-start">
                                        <span className="w-1/3 text-gray-500 font-medium">Country of Origin</span>
                                        <span className="w-2/3 text-gray-900 font-medium">India</span>
                                    </div>

                                    {/* Additional dynamic specs if stored in DB */}
                                    {product.specifications?.map((spec, idx) => (
                                        <div key={idx} className="py-2.5 flex items-start">
                                            <span className="w-1/3 text-gray-500 font-medium">{spec.key}</span>
                                            <span className="w-2/3 text-gray-900 font-medium">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                            {/* Product Description */}
                            <div className="bg-white p-4 sm:p-5 rounded-xs border border-gray-200 shadow-2xs">
                                <h2 className="text-base sm:text-lg font-bold text-gray-900 pb-3 border-b border-gray-100">
                                    Product Description
                                </h2>
                                <div className="pt-3 text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                    {product.description || 'No detailed description available.'}
                                </div>
                            </div>

                            {/* STICKY ACTION BUTTONS BAR (Right Column Sticky) */}
                            {/* Stays pinned to the bottom of the screen while reading product details & description, then scrolls up when finished */}
                            <div className="hidden lg:block sticky bottom-0 z-30 bg-white/95 backdrop-blur-md p-3 border border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.1)] rounded-xs">
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={product.stock === 0}
                                        className="w-full py-3.5 px-4 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 hover:border-gray-500 font-bold text-sm uppercase tracking-wide rounded-xs shadow-2xs transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FiShoppingCart size={18} />
                                        <span>Add to Cart</span>
                                    </button>

                                    <button
                                        onClick={handleBuyNow}
                                        disabled={product.stock === 0}
                                        className="w-full py-3.5 px-4 bg-[#FF64B4] hover:bg-[#e0529f] text-white font-bold text-sm uppercase tracking-wide rounded-xs shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FiZap size={18} />
                                        <span>Buy Now</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ----------------- SECTION 2: RATINGS & REVIEWS (FULL WIDTH) ----------------- */}
                <div className="mt-3 sm:mt-4 bg-white p-4 sm:p-5 rounded-xs border border-gray-200 shadow-2xs space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-gray-900">Ratings & Reviews</h2>
                            <p className="text-xs text-gray-500 mt-0.5">{reviews.length > 0 ? `${reviews.length} Verified Reviews` : 'No customer reviews yet'}</p>
                        </div>

                        {!showReviewForm && (
                            <button
                                onClick={() => {
                                    if (!isAuthenticated) {
                                        dispatch(addToast({
                                            type: 'warning',
                                            message: 'Please login to rate this product',
                                        }));
                                        navigate('/auth');
                                    } else {
                                        setShowReviewForm(true);
                                    }
                                }}
                                className="px-3 py-1.5 border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-800 rounded-xs shadow-2xs transition-colors"
                            >
                                Rate Product
                            </button>
                        )}
                    </div>

                    {/* Score & Breakdown Bars (Only rendered when real reviews exist) */}
                    {reviews.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-center gap-6 pb-4 border-b border-gray-100">
                            <div className="text-center sm:text-left shrink-0">
                                <div className="flex items-baseline justify-center sm:justify-start gap-1.5">
                                    <span className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</span>
                                    <FiStar size={24} className="text-emerald-600 fill-emerald-600" />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{reviews.length} {reviews.length === 1 ? 'Rating & Review' : 'Ratings & Reviews'}</p>
                            </div>

                            {/* Real Rating Distribution Bars */}
                            <div className="flex-1 w-full space-y-1.5">
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const count = reviews.filter(r => Math.round(r.rating) === star).length;
                                    const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                                    const color = star >= 4 ? 'bg-emerald-600' : star === 3 ? 'bg-amber-500' : 'bg-rose-500';
                                    return (
                                        <div key={star} className="flex items-center gap-2 text-xs">
                                            <span className="w-6 text-gray-600 font-medium flex items-center gap-0.5">
                                                {star} <FiStar size={9} className="fill-current text-gray-400" />
                                            </span>
                                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${color}`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <span className="w-8 text-right text-gray-500 text-[11px]">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Write Review Form */}
                    <AnimatePresence>
                        {showReviewForm && (
                            <motion.form
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                onSubmit={handleSubmitReview}
                                className="p-4 bg-gray-50 border border-gray-200 rounded-xs space-y-3 overflow-hidden"
                            >
                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Write Your Review</h3>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewRating(star)}
                                                    onMouseEnter={() => setHoverRating(star)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                >
                                                    <FiStar
                                                        size={22}
                                                        className={`transition-colors ${star <= (hoverRating || reviewRating)
                                                            ? 'text-[#388e3c] fill-[#388e3c]'
                                                            : 'text-gray-300'
                                                            }`}
                                                    />
                                                </button>
                                            ))}
                                </div>

                                <textarea
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    placeholder="Write your review here... Mention material quality, shipping speed, and finish."
                                    rows={3}
                                    className="w-full p-2.5 text-xs bg-white border border-gray-300 rounded-xs focus:outline-none focus:border-[#FF64B4]"
                                    required
                                />

                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowReviewForm(false)}
                                        className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmittingReview}
                                        className="px-4 py-1.5 bg-[#FF64B4] hover:bg-[#e61d7e] text-white text-xs font-bold rounded-xs flex items-center gap-1.5 transition-colors"
                                    >
                                        <FiSend size={12} />
                                        <span>{isSubmittingReview ? 'Submitting...' : 'Submit Review'}</span>
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {/* Reviews List */}
                    <div className="space-y-4">
                        {reviews.length > 0 ? (
                            <>
                                {(showAllReviews ? reviews : reviews.slice(0, 3)).map((rev, index) => (
                                    <div key={rev._id || index} className="border-b border-gray-100 pb-3 last:border-b-0 space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="px-1.5 py-0.5 bg-emerald-600 text-white rounded-[2px] text-[11px] font-bold flex items-center gap-1">
                                                {rev.rating} <FiStar size={9} className="fill-current" />
                                            </span>
                                            <span className="text-xs font-bold text-gray-900">
                                                {rev.rating >= 4 ? 'Verified Purchase' : 'Review'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-700 leading-relaxed">
                                            {rev.comment}
                                        </p>
                                        <div className="flex items-center gap-2 text-[11px] text-gray-500">
                                            <span className="font-semibold text-gray-700">{rev.name || rev.user?.name || 'Verified Buyer'}</span>
                                            <span>•</span>
                                            <span>{formatDate(rev.createdAt || new Date())}</span>
                                            <span>•</span>
                                            <span className="text-emerald-700 font-medium flex items-center gap-0.5">
                                                <FiCheck size={11} /> Certified Buyer
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                {!showAllReviews && reviews.length > 3 && (
                                    <div className="pt-2">
                                        <button
                                            onClick={() => setShowAllReviews(true)}
                                            className="text-xs font-bold text-[#FF64B4] hover:underline flex items-center gap-1"
                                        >
                                            All {reviews.length} reviews <FiChevronRight />
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="py-6 text-center text-gray-500">
                                <p className="text-sm font-semibold text-gray-800">No customer reviews yet</p>
                                <p className="text-xs text-gray-500 mt-1">Be the first to review this product!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ----------------- SECTION 3: ROW 1 - SIMILAR / RECOMMENDED PRODUCTS ----------------- */}
                {row1Products.length > 0 && (
                    <div className="mt-3 sm:mt-4 bg-white p-4 sm:p-5 rounded-xs border border-gray-200 shadow-2xs">
                        <div className="flex items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4 pb-2 border-b border-gray-100">
                            <div className="min-w-0 flex-1">
                                <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 truncate">
                                    {hasCategoryRelated && product.category?.name
                                        ? `Similar Products in ${product.category.name}`
                                        : 'Similar & Recommended Products'}
                                </h2>
                                <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 line-clamp-1">
                                    {hasCategoryRelated
                                        ? 'Explore more products tailored to this style'
                                        : 'Curated gift picks handpicked for you'}
                                </p>
                            </div>
                            <Link
                                to={hasCategoryRelated && product.category?._id ? `/products?category=${product.category._id}` : '/products'}
                                className="text-xs font-bold text-[#FF64B4] hover:text-[#e0529f] px-2 py-1 rounded-md hover:bg-pink-50 flex items-center gap-0.5 shrink-0 whitespace-nowrap transition-colors"
                            >
                                <span>View All</span>
                                <FiChevronRight size={14} />
                            </Link>
                        </div>

                        {/* Relative Carousel Container with Left/Right Buttons flanking the product cards */}
                        <div className="relative">
                            {/* Left Scroll Button: Only on smaller devices and tablets (< lg) */}
                            <button
                                type="button"
                                onClick={() => scrollRow(row1Ref, 'left')}
                                disabled={!canScrollLeft1}
                                className={`lg:hidden absolute -left-2 sm:-left-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full shadow-md flex items-center justify-center transition-all ${
                                    canScrollLeft1
                                        ? 'bg-white border border-gray-300 text-gray-800 hover:bg-pink-50 hover:border-pink-300 hover:text-[#FF64B4] active:scale-90 cursor-pointer opacity-95'
                                        : 'bg-gray-100 border border-gray-200 text-gray-300 opacity-40 cursor-not-allowed pointer-events-none'
                                }`}
                                title="Scroll left"
                                aria-label="Scroll left"
                            >
                                <FiChevronLeft size={18} />
                            </button>

                            {/* Cards Container: Horizontal Scroll on Mobile/Tablet (< lg), Clean 4-card 1-row Grid on Laptop/Desktop (>= lg) */}
                            <div
                                ref={row1Ref}
                                onScroll={checkScroll1}
                                className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-3 sm:gap-4 pb-2 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-none px-1"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                {row1Products.map((p, idx) => (
                                    <div
                                        key={p._id}
                                        className={`${idx >= 4 ? 'lg:hidden' : ''} w-[160px] sm:w-[210px] md:w-[240px] lg:w-auto shrink-0 lg:shrink snap-start flex flex-col`}
                                    >
                                        <ProductCard
                                            product={p}
                                            index={idx}
                                            wishlist={wishlistData?.data || []}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Right Scroll Button: Only on smaller devices and tablets (< lg) */}
                            <button
                                type="button"
                                onClick={() => scrollRow(row1Ref, 'right')}
                                disabled={!canScrollRight1}
                                className={`lg:hidden absolute -right-2 sm:-right-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full shadow-md flex items-center justify-center transition-all ${
                                    canScrollRight1
                                        ? 'bg-white border border-gray-300 text-gray-800 hover:bg-pink-50 hover:border-pink-300 hover:text-[#FF64B4] active:scale-90 cursor-pointer opacity-95'
                                        : 'bg-gray-100 border border-gray-200 text-gray-300 opacity-40 cursor-not-allowed pointer-events-none'
                                }`}
                                title="Scroll right"
                                aria-label="Scroll right"
                            >
                                <FiChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* ----------------- SECTION 4: ROW 2 - CUSTOMERS ALSO VIEWED ----------------- */}
                {row2Products.length > 0 && (
                    <div className="mt-3 sm:mt-4 bg-white p-4 sm:p-5 rounded-xs border border-gray-200 shadow-2xs">
                        <div className="flex items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4 pb-2 border-b border-gray-100">
                            <div className="min-w-0 flex-1">
                                <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 truncate">
                                    Customers Also Viewed
                                </h2>
                                <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 line-clamp-1">
                                    Most loved gifts & trending picks across our store
                                </p>
                            </div>
                            <Link
                                to="/products"
                                className="text-xs font-bold text-[#FF64B4] hover:text-[#e0529f] px-2 py-1 rounded-md hover:bg-pink-50 flex items-center gap-0.5 shrink-0 whitespace-nowrap transition-colors"
                            >
                                <span>Explore All</span>
                                <FiChevronRight size={14} />
                            </Link>
                        </div>

                        {/* Relative Carousel Container with Left/Right Buttons flanking the product cards */}
                        <div className="relative">
                            {/* Left Scroll Button: Only on smaller devices and tablets (< lg) */}
                            <button
                                type="button"
                                onClick={() => scrollRow(row2Ref, 'left')}
                                disabled={!canScrollLeft2}
                                className={`lg:hidden absolute -left-2 sm:-left-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full shadow-md flex items-center justify-center transition-all ${
                                    canScrollLeft2
                                        ? 'bg-white border border-gray-300 text-gray-800 hover:bg-pink-50 hover:border-pink-300 hover:text-[#FF64B4] active:scale-90 cursor-pointer opacity-95'
                                        : 'bg-gray-100 border border-gray-200 text-gray-300 opacity-40 cursor-not-allowed pointer-events-none'
                                }`}
                                title="Scroll left"
                                aria-label="Scroll left"
                            >
                                <FiChevronLeft size={18} />
                            </button>

                            {/* Cards Container: Horizontal Scroll on Mobile/Tablet (< lg), Clean 4-card 1-row Grid on Laptop/Desktop (>= lg) */}
                            <div
                                ref={row2Ref}
                                onScroll={checkScroll2}
                                className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-3 sm:gap-4 pb-2 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-none px-1"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                {row2Products.map((p, idx) => (
                                    <div
                                        key={p._id}
                                        className={`${idx >= 4 ? 'lg:hidden' : ''} w-[160px] sm:w-[210px] md:w-[240px] lg:w-auto shrink-0 lg:shrink snap-start flex flex-col`}
                                    >
                                        <ProductCard
                                            product={p}
                                            index={idx}
                                            wishlist={wishlistData?.data || []}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Right Scroll Button: Only on smaller devices and tablets (< lg) */}
                            <button
                                type="button"
                                onClick={() => scrollRow(row2Ref, 'right')}
                                disabled={!canScrollRight2}
                                className={`lg:hidden absolute -right-2 sm:-right-3.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full shadow-md flex items-center justify-center transition-all ${
                                    canScrollRight2
                                        ? 'bg-white border border-gray-300 text-gray-800 hover:bg-pink-50 hover:border-pink-300 hover:text-[#FF64B4] active:scale-90 cursor-pointer opacity-95'
                                        : 'bg-gray-100 border border-gray-200 text-gray-300 opacity-40 cursor-not-allowed pointer-events-none'
                                }`}
                                title="Scroll right"
                                aria-label="Scroll right"
                            >
                                <FiChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ----------------- MOBILE & TABLET STICKY FIXED BOTTOM BAR ----------------- */}
            {/* Pinned to bottom on screens < 1024px with high z-index and 50/50 split (Option B) */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.12)] flex items-center gap-2">
                <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 py-3 px-3 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 hover:border-gray-500 font-bold text-xs sm:text-sm uppercase tracking-wide rounded-xs shadow-2xs flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FiShoppingCart size={16} />
                    <span>Add to Cart</span>
                </button>

                <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className="flex-1 py-3 px-3 bg-[#FF64B4] hover:bg-[#e0529f] text-white font-bold text-xs sm:text-sm uppercase tracking-wide rounded-xs shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FiZap size={16} />
                    <span>Buy Now</span>
                </button>
            </div>
        </div>
    );
};

export default ProductDetail;
