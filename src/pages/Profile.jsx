import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
    FiUser,
    FiMail,
    FiPhone,
    FiMapPin,
    FiSettings,
    FiPackage,
    FiLogOut,
    FiEdit,
    FiHeart,
    FiStar,
    FiGift,
    FiShield,
    FiChevronRight,
    FiClock,
    FiTruck,
    FiCheck,
    FiShoppingCart,
    FiTrash2,
    FiPlus,
    FiHome,
    FiLock,
    FiEye,
    FiEyeOff,
    FiAward,
    FiTrendingUp,
    FiX,
} from 'react-icons/fi';
import placeholderImg from '../assets/images/PNG.png';
import { useGetMeQuery, useUpdateProfileMutation, useGetWishlistQuery, useToggleWishlistMutation } from '../store/api/authApi';
import { useGetMyOrdersQuery } from '../store/api/ordersApi';
import { selectCurrentUser, selectIsAuthenticated, logout } from '../store/slices/authSlice';
import { addItem } from '../store/slices/cartSlice';
import { addToast } from '../store/slices/uiSlice';
import Button from '../components/common/Button';
import BackButton from '../components/common/BackButton';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Loader from '../components/common/Loader';

const Profile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectCurrentUser);

    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddAddress, setShowAddAddress] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        gender: '',
        dob: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
    });

    const { data: profileData, isLoading } = useGetMeQuery(undefined, {
        skip: !isAuthenticated,
    });
    const [updateProfile, { isLoading: updating }] = useUpdateProfileMutation();

    // Fetch orders for overview
    const { data: ordersData } = useGetMyOrdersQuery(undefined, {
        skip: !isAuthenticated,
    });

    // Fetch wishlist
    const { data: wishlistData } = useGetWishlistQuery(undefined, {
        skip: !isAuthenticated,
    });
    const [toggleWishlist] = useToggleWishlistMutation();

    const orders = ordersData?.data || [];
    const wishlistItems = wishlistData?.data || [];

    // Initialize form data when profile loads
    useEffect(() => {
        if (profileData?.data) {
            const profile = profileData.data;

            // Robust sanitization for phone placeholder text
            const sanitizePhone = (val) => {
                if (!val) return '';
                const clean = val.toString().toLowerCase().trim();
                const hasLetters = /[a-z]/.test(clean);
                const isPlaceholder = hasLetters && (
                    clean.includes('mobile') ||
                    clean.includes('number') ||
                    clean.includes('value') ||
                    clean.includes('no v') ||
                    ['undefined', 'null', 'none'].includes(clean)
                );
                if (isPlaceholder) return '';
                return val;
            };

            setFormData({
                name: profile.name || '',
                email: profile.email || '',
                phone: sanitizePhone(profile.phone),
                gender: profile.gender || '',
                dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '',
                street: profile.address?.street || '',
                city: profile.address?.city || '',
                state: profile.address?.state || '',
                zipCode: profile.address?.zipCode || '',
                country: profile.address?.country || '',
            });
        }
    }, [profileData]);

    if (!isAuthenticated) {
        navigate('/auth');
        return null;
    }

    const profile = profileData?.data;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateProfile({
                name: formData.name,
                phone: formData.phone,
                gender: formData.gender,
                dob: formData.dob,
                address: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    country: formData.country,
                },
            }).unwrap();

            dispatch(addToast({
                type: 'success',
                message: 'Profile updated successfully!',
            }));
            setIsEditing(false);
            return true;
        } catch (error) {
            dispatch(addToast({
                type: 'error',
                message: error?.data?.message || 'Failed to update profile',
            }));
            return false;
        }
    };

    const handleUpdateProfile = async () => {
        try {
            await updateProfile({
                name: formData.name,
                phone: formData.phone,
                address: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    country: formData.country,
                },
            }).unwrap();

            dispatch(addToast({
                type: 'success',
                message: 'Address saved successfully!',
            }));
            setShowAddAddress(false);
        } catch (error) {
            dispatch(addToast({
                type: 'error',
                message: error?.data?.message || 'Failed to save address',
            }));
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
        dispatch(addToast({
            type: 'success',
            message: 'Logged out successfully',
        }));
    };

    const handleAddToCart = (product) => {
        dispatch(addItem({
            product: {
                _id: product._id,
                name: product.name,
                price: product.price,
                images: product.images,
            },
            quantity: 1,
        }));
        dispatch(addToast({
            type: 'success',
            message: `${product.name} added to cart!`,
        }));
    };

    const handleRemoveFromWishlist = async (productId) => {
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
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-amber-100 text-amber-700 border-amber-200',
            processing: 'bg-blue-100 text-blue-700 border-blue-200',
            shipped: 'bg-purple-100 text-purple-700 border-purple-200',
            delivered: 'bg-green-100 text-green-700 border-green-200',
            cancelled: 'bg-red-100 text-red-700 border-red-200',
        };
        return colors[status] || colors.pending;
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: <FiClock size={14} />,
            processing: <FiPackage size={14} />,
            shipped: <FiTruck size={14} />,
            delivered: <FiCheck size={14} />,
        };
        return icons[status] || icons.pending;
    };

    // Get greeting based on time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Calculate member duration
    const getMemberDuration = () => {
        if (!profile?.createdAt) return 'New Member';
        const created = new Date(profile.createdAt);
        const now = new Date();
        const months = Math.floor((now - created) / (1000 * 60 * 60 * 24 * 30));
        if (months < 1) return 'New Member';
        if (months < 12) return `${months} month${months > 1 ? 's' : ''}`;
        const years = Math.floor(months / 12);
        return `${years} year${years > 1 ? 's' : ''}`;
    };

    const tabs = [
        { id: 'overview', label: 'My Account', icon: <FiUser size={18} /> },
        { id: 'orders', label: 'My Orders', icon: <FiPackage size={18} />, count: orders.length },
        { id: 'wishlist', label: 'Wishlist', icon: <FiHeart size={18} />, count: wishlistItems.length },
        { id: 'addresses', label: 'Addresses', icon: <FiMapPin size={18} /> },
        { id: 'settings', label: 'Settings', icon: <FiSettings size={18} /> },
    ];


    return (
        <div className="min-h-screen pt-20 sm:pt-32 pb-8 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button and Breadcrumbs - hidden on mobile */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hidden sm:flex items-center gap-4 mb-6"
                >
                    <BackButton to="/" />
                    <Breadcrumbs items={[{ label: 'Profile' }]} />
                </motion.div>

                {/* Main Content Layout with Sidebar */}
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    {/* Left Sidebar (User Info & Tabs) */}
                    <div className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-28 lg:self-start space-y-4 sm:space-y-6">
                        {/* User Profile Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl p-6 shadow-card border border-gray-100 relative overflow-hidden group"
                        >
                            {/* Sidebar Tab Navigation */}
                            <div className="w-full flex flex-col gap-2 relative z-10">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all shadow-sm ${activeTab === tab.id
                                            ? 'bg-primary-600 text-white border-primary-600 shadow-primary-200'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-gray-100/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`}>
                                                {tab.icon}
                                            </span>
                                            <span className={`${activeTab === tab.id ? 'font-bold' : ''}`}>{tab.label}</span>
                                        </div>
                                        {tab.count !== undefined && tab.count > 0 && (
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === tab.id
                                                ? 'bg-primary-100 text-primary-600'
                                                : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                {tab.count}
                                            </span>
                                        )}
                                    </button>
                                ))}

                                <div className="h-px bg-gray-100 my-2" />

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all border border-transparent"
                                >
                                    <FiLogOut size={18} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    <div className="flex-1 min-w-0">


                        {/* Tab Content */}
                        <AnimatePresence mode="wait">
                            {/* Overview Tab */}
                            {activeTab === 'overview' && (
                                <motion.div
                                    key="overview"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-6"
                                >
                                    {/* My Account Profile Form */}
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Row 1: Full Name and Gender */}
                                            <div className="p-4 rounded-xl bg-gray-50 border border-transparent hover:border-primary-100 transition-all">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic mb-1">Fullname</p>
                                                <p className="text-gray-900 font-bold min-h-[1.5rem]">{formData.name || ''}</p>
                                            </div>
                                            <div className="p-4 rounded-xl bg-gray-50 border border-transparent hover:border-primary-100 transition-all">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic mb-1">Gender</p>
                                                <p className="text-gray-900 font-bold min-h-[1.5rem]">{formData.gender || ''}</p>
                                            </div>

                                            {/* Row 2: Mobile Number and Date of Birth */}
                                            <div className="p-4 rounded-xl bg-gray-50 border border-transparent hover:border-primary-100 transition-all">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic mb-1">Mobile Number</p>
                                                <p className="text-gray-900 font-bold min-h-[1.5rem]">{formData.phone || ''}</p>
                                            </div>
                                            <div className="p-4 rounded-xl bg-gray-50 border border-transparent hover:border-primary-100 transition-all">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic mb-1">Date of Birth</p>
                                                <p className="text-gray-900 font-bold min-h-[1.5rem]">{formData.dob || ''}</p>
                                            </div>

                                            {/* Row 3: Email and City */}
                                            <div className="p-4 rounded-xl bg-gray-50 border border-transparent hover:border-primary-100 transition-all">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic mb-1">Email Address</p>
                                                <p className="text-gray-900 font-bold min-h-[1.5rem]">{formData.email || ''}</p>
                                            </div>
                                            <div className="p-4 rounded-xl bg-gray-50 border border-transparent hover:border-primary-100 transition-all">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic mb-1">City</p>
                                                <p className="text-gray-900 font-bold min-h-[1.5rem]">{formData.city || ''}</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-center mt-6 pt-5 border-t border-gray-50">
                                            <Button
                                                onClick={() => setShowEditModal(true)}
                                                className="px-12 py-3.5 rounded-2xl shadow-xl shadow-primary-50 transition-all hover:shadow-primary-100 font-bold tracking-widest uppercase text-xs border-2 border-primary-500 hover:bg-primary-600 hover:border-primary-600"
                                            >
                                                Edit Profile
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Orders Tab */}
                            {activeTab === 'orders' && (
                                <motion.div
                                    key="orders"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-card p-6"
                                >
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                                        <FiPackage className="text-primary-500" />
                                        Order History
                                    </h2>

                                    {orders.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                                <FiPackage size={32} className="text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                                            <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
                                            <Link to="/products">
                                                <Button>Browse Products</Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {orders.map((order) => (
                                                <div
                                                    key={order._id}
                                                    className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 hover:shadow-md transition-all"
                                                >
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
                                                        <div>
                                                            <p className="text-sm text-gray-500">Order Number</p>
                                                            <p className="font-bold text-gray-900">#{order.orderNumber || order._id?.slice(-8)}</p>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-right">
                                                                <p className="text-sm text-gray-500">Order Date</p>
                                                                <p className="text-gray-900">
                                                                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                    })}
                                                                </p>
                                                            </div>
                                                            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                                                                {getStatusIcon(order.status)}
                                                                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-3 mb-4">
                                                        {order.orderItems?.slice(0, 4).map((item) => (
                                                            <div key={item._id} className="flex items-center gap-3">
                                                                <img
                                                                    src={item.image}
                                                                    alt={item.name}
                                                                    className="w-12 h-12 rounded-lg object-cover"
                                                                />
                                                                <div>
                                                                    <p className="text-sm text-gray-900 line-clamp-1">{item.name}</p>
                                                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {order.orderItems?.length > 4 && (
                                                            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 text-sm font-medium text-gray-600">
                                                                +{order.orderItems.length - 4}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                        <div>
                                                            <p className="text-sm text-gray-500">Total</p>
                                                            <p className="text-xl font-bold text-gray-900">₹{order.totalPrice?.toFixed(2)}</p>
                                                        </div>
                                                        <Link to={`/order-success/${order._id}`}>
                                                            <Button variant="secondary" size="sm" icon={<FiEye />}>
                                                                View Details
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Wishlist Tab */}
                            {activeTab === 'wishlist' && (
                                <motion.div
                                    key="wishlist"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                <FiHeart className="text-pink-500" />
                                                My Wishlist
                                            </h2>
                                            <p className="text-gray-500 text-sm">{wishlistItems.length} items</p>
                                        </div>

                                        {wishlistItems.length === 0 ? (
                                            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-12 text-center">
                                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-pink-50 flex items-center justify-center">
                                                    <FiHeart size={32} className="text-pink-300" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
                                                <p className="text-gray-500 mb-6">Save items you love for later</p>
                                                <Link to="/products">
                                                    <Button>Browse Products</Button>
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                {wishlistItems.map((product) => (
                                                    <motion.div
                                                        key={product._id}
                                                        layout
                                                        className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden group hover:shadow-card-gold hover:border-gray-200 transition-all"
                                                    >
                                                        <Link to={`/products/${product._id}`}>
                                                            <div className="relative aspect-square overflow-hidden">
                                                                <img
                                                                    src={product.images?.[0] || placeholderImg}
                                                                    alt={product.name}
                                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                                />
                                                            </div>
                                                        </Link>
                                                        <div className="p-4">
                                                            <Link to={`/products/${product._id}`}>
                                                                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 hover:text-primary-600 transition-colors">
                                                                    {product.name}
                                                                </h3>
                                                            </Link>
                                                            <p className="text-lg font-bold text-primary-600 mb-3">
                                                                ₹{product.price?.toFixed(2)}
                                                            </p>
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    fullWidth
                                                                    size="sm"
                                                                    onClick={() => handleAddToCart(product)}
                                                                    icon={<FiShoppingCart size={14} />}
                                                                >
                                                                    Add to Cart
                                                                </Button>
                                                                <button
                                                                    onClick={() => handleRemoveFromWishlist(product._id)}
                                                                    className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                                                >
                                                                    <FiTrash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* Addresses Tab */}
                            {activeTab === 'addresses' && (
                                <motion.div
                                    key="addresses"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                <FiMapPin className="text-primary-500" />
                                                Address
                                            </h2>
                                            {profile?.address?.street && !showAddAddress && (
                                                <Button
                                                    onClick={() => setShowAddAddress(true)}
                                                    size="sm"
                                                    icon={<FiPlus />}
                                                >
                                                    Edit Address
                                                </Button>
                                            )}
                                        </div>

                                        {/* Add/Edit Address Form */}
                                        {showAddAddress && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 mb-6"
                                            >
                                                <div className="flex items-center justify-between mb-6">
                                                    <h3 className="text-lg font-bold text-gray-900">
                                                        {profile?.address?.street ? 'Edit Address' : 'Add New Address'}
                                                    </h3>
                                                    <button
                                                        onClick={() => setShowAddAddress(false)}
                                                        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                                    >
                                                        <FiX size={20} />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Street Address - Full Width Textarea */}
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                                                        <textarea
                                                            value={formData.street}
                                                            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                                            placeholder="Enter your street address"
                                                            rows={3}
                                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-300 focus:outline-none transition-all resize-none"
                                                        />
                                                    </div>
                                                    {/* State */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                                                        <input
                                                            type="text"
                                                            value={formData.state}
                                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                            placeholder="Kerala"
                                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-300 focus:outline-none transition-all"
                                                        />
                                                    </div>
                                                    {/* City */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                                        <input
                                                            type="text"
                                                            value={formData.city}
                                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                            placeholder="City Name"
                                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-300 focus:outline-none transition-all"
                                                        />
                                                    </div>
                                                    {/* ZIP Code / Pincode */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code</label>
                                                        <input
                                                            type="text"
                                                            value={formData.zipCode}
                                                            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                                            placeholder="Pincode"
                                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-300 focus:outline-none transition-all"
                                                        />
                                                    </div>
                                                    {/* Country - Disabled with India */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                                                        <input
                                                            type="text"
                                                            value="India"
                                                            disabled
                                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-3 mt-6">
                                                    <Button
                                                        onClick={handleUpdateProfile}
                                                        isLoading={updating}
                                                        icon={<FiCheck />}
                                                    >
                                                        Save Address
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        onClick={() => setShowAddAddress(false)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}

                                        {profile?.address?.street && !showAddAddress ? (
                                            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                            <FiHome className="text-primary-600" size={18} />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <h3 className="font-semibold text-gray-900">Home</h3>
                                                                <span className="px-2 py-0.5 bg-primary-100 text-primary-600 text-xs font-medium rounded-full">Default</span>
                                                            </div>
                                                            <p className="text-gray-600">
                                                                {profile.address.street}<br />
                                                                {profile.address.city}, {profile.address.state} {profile.address.zipCode}<br />
                                                                {profile.address.country}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setShowAddAddress(true)}
                                                        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                                    >
                                                        <FiEdit size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : !showAddAddress && (
                                            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-12 text-center">
                                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                                    <FiMapPin size={32} className="text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No addresses saved</h3>
                                                <p className="text-gray-500 mb-6">Add an address for faster checkout</p>
                                                <Button
                                                    onClick={() => setShowAddAddress(true)}
                                                    icon={<FiPlus />}
                                                >
                                                    Add Address
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* Settings Tab */}
                            {activeTab === 'settings' && (
                                <motion.div
                                    key="settings"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-6"
                                >
                                    {/* Profile Information */}
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                <FiUser className="text-primary-500" />
                                                Profile Information
                                            </h2>
                                            <Button
                                                variant={isEditing ? 'secondary' : 'ghost'}
                                                size="sm"
                                                onClick={() => setIsEditing(!isEditing)}
                                                icon={<FiEdit />}
                                            >
                                                {isEditing ? 'Cancel' : 'Edit'}
                                            </Button>
                                        </div>

                                        {isEditing ? (
                                            <form onSubmit={handleSubmit} className="space-y-5">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                                    <input
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-300 transition-all"
                                                        placeholder="John Doe"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                                    <input
                                                        name="phone"
                                                        value={formData.phone}
                                                        disabled
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                                                        placeholder="+91 1234567890"
                                                    />
                                                </div>
                                                <Button type="submit" isLoading={updating}>
                                                    Save Changes
                                                </Button>
                                            </form>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {profile?.name && (
                                                    <div className="p-4 rounded-xl bg-gray-50">
                                                        <p className="text-sm text-gray-500 mb-1">Full Name</p>
                                                        <p className="text-gray-900 font-medium">{profile.name}</p>
                                                    </div>
                                                )}
                                                <div className="p-4 rounded-xl bg-gray-50">
                                                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                                                    <p className="text-gray-900 font-medium">{profile?.phoneNumber || 'Not set'}</p>
                                                </div>
                                                <div className="p-4 rounded-xl bg-gray-50">
                                                    <p className="text-sm text-gray-500 mb-1">Member Since</p>
                                                    <p className="text-gray-900 font-medium">
                                                        {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        }) : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Danger Zone */}
                                    <div className="bg-white rounded-2xl border border-red-100 shadow-card p-6">
                                        <h2 className="text-lg font-bold text-red-600 flex items-center gap-2 mb-4">
                                            <FiTrash2 />
                                            Danger Zone
                                        </h2>
                                        <p className="text-gray-500 text-sm mb-4">Permanently delete your account and all associated data</p>
                                        <Button className="!bg-red-600 !text-white hover:!bg-red-700 !shadow-none" size="sm">Delete Account</Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Edit Profile Modal */}
                <AnimatePresence>
                    {showEditModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowEditModal(false)}
                                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
                            >
                                {/* Modal Header */}
                                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
                                        <p className="text-sm text-gray-500 mt-0.5">Update your personal information</p>
                                    </div>
                                    <button
                                        onClick={() => setShowEditModal(false)}
                                        className="p-2 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <FiX size={24} />
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        const success = await handleSubmit(e);
                                        if (success) setShowEditModal(false);
                                    }}
                                    className="p-8"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-gray-700 ml-1 italic">Fullname</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Enter full name"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:outline-none transition-all"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-gray-700 ml-1 italic">Gender</label>
                                            <select
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:outline-none transition-all"
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-gray-700 ml-1 italic">Mobile Number</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="Enter phone number"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:outline-none transition-all"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-gray-700 ml-1 italic">Date of Birth</label>
                                            <input
                                                type="date"
                                                name="dob"
                                                value={formData.dob}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:outline-none transition-all"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-gray-700 ml-1 italic text-gray-400">Email (Disabled)</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                disabled
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed italic"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-gray-700 ml-1 italic">City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                placeholder="Enter city"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-10 flex items-center justify-end gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowEditModal(false)}
                                            className="px-6 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all uppercase tracking-widest"
                                        >
                                            Cancel
                                        </button>
                                        <Button
                                            type="submit"
                                            loading={updating}
                                            className="px-10 py-3.5 rounded-xl shadow-lg shadow-primary-50 font-bold tracking-widest uppercase text-xs"
                                        >
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Profile;
