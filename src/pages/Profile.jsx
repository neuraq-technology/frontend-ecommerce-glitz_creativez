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
    FiEye,
    FiCalendar,
    FiShare2,
    FiX,
    FiCheckCircle,
    FiNavigation
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import placeholderImg from '../assets/images/PNG.png';
import { useGetMeQuery, useUpdateProfileMutation, useGetWishlistQuery, useToggleWishlistMutation } from '../store/api/authApi';
import { useGetMyOrdersQuery } from '../store/api/ordersApi';
import { selectCurrentUser, selectIsAuthenticated, logout } from '../store/slices/authSlice';
import { addItem } from '../store/slices/cartSlice';
import { addToast } from '../store/slices/uiSlice';
import Button from '../components/common/Button';
import BackButton from '../components/common/BackButton';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { fetchLocationDetails, lookupPincode } from '../utils/locationService';

const Profile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectCurrentUser);

    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddAddress, setShowAddAddress] = useState(false);
    const [showAddReminder, setShowAddReminder] = useState(false);

    // Form data for profile & address
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
        country: 'India',
        recipientName: '',
        recipientPhone: '',
        addressLabel: 'Home'
    });

    // Occasion Reminders state (saved to localStorage for instant gift shop feature)
    const [reminders, setReminders] = useState(() => {
        try {
            const saved = localStorage.getItem('glitz_occasion_reminders');
            return saved ? JSON.parse(saved) : [
                { id: 1, title: "Mom's Birthday", occasion: "Birthday", recipient: "Mom", date: "2026-11-14" },
                { id: 2, title: "Wedding Anniversary", occasion: "Anniversary", recipient: "Partner", date: "2026-12-05" }
            ];
        } catch {
            return [];
        }
    });

    const [newReminder, setNewReminder] = useState({
        title: '',
        occasion: 'Birthday',
        recipient: '',
        date: ''
    });

    const handleAddReminder = (e) => {
        e.preventDefault();
        if (!newReminder.title || !newReminder.date) return;
        const updated = [...reminders, { ...newReminder, id: Date.now() }];
        setReminders(updated);
        try {
            localStorage.setItem('glitz_occasion_reminders', JSON.stringify(updated));
        } catch (err) {
            console.error('Error saving reminders:', err);
        }
        setNewReminder({ title: '', occasion: 'Birthday', recipient: '', date: '' });
        setShowAddReminder(false);
        dispatch(addToast({ type: 'success', message: 'Occasion reminder saved!' }));
    };

    const handleDeleteReminder = (id) => {
        const updated = reminders.filter(r => r.id !== id);
        setReminders(updated);
        try {
            localStorage.setItem('glitz_occasion_reminders', JSON.stringify(updated));
        } catch (err) {
            console.error('Error deleting reminder:', err);
        }
        dispatch(addToast({ type: 'success', message: 'Reminder removed' }));
    };

    const { data: profileData, isLoading } = useGetMeQuery(undefined, {
        skip: !isAuthenticated,
    });
    const [updateProfile, { isLoading: updating }] = useUpdateProfileMutation();

    const { data: ordersData } = useGetMyOrdersQuery(undefined, {
        skip: !isAuthenticated,
    });

    const { data: wishlistData } = useGetWishlistQuery(undefined, {
        skip: !isAuthenticated,
    });
    const [toggleWishlist] = useToggleWishlistMutation();

    const orders = ordersData?.data || [];
    const wishlistItems = wishlistData?.data || [];
    const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status?.toLowerCase()));

    useEffect(() => {
        if (profileData?.data) {
            const profile = profileData.data;
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
                phone: sanitizePhone(profile.phone || profile.address?.phone),
                gender: profile.gender || '',
                dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '',
                fullName: profile.address?.fullName || profile.name || '',
                houseNo: profile.address?.houseNo || '',
                roadArea: profile.address?.roadArea || '',
                street: profile.address?.street || '',
                district: profile.address?.district || profile.address?.city || '',
                city: profile.address?.city || profile.address?.district || '',
                state: profile.address?.state || '',
                zipCode: profile.address?.zipCode || '',
                country: profile.address?.country || 'India',
                recipientName: profile.address?.fullName || profile.name || '',
                recipientPhone: sanitizePhone(profile.address?.phone || profile.phone),
                addressLabel: 'Home'
            });
        }
    }, [profileData]);

    const [isDetectingLocation, setIsDetectingLocation] = useState(false);

    const handleUseMyLocation = async () => {
        setIsDetectingLocation(true);
        try {
            const loc = await fetchLocationDetails();
            setFormData(prev => ({
                ...prev,
                state: loc.state || prev.state,
                district: loc.district || prev.district,
                city: loc.city || loc.district || prev.city,
                zipCode: loc.pincode || prev.zipCode,
                roadArea: loc.roadArea || prev.roadArea,
            }));
            dispatch(addToast({
                type: 'success',
                message: `Location detected: ${loc.district ? loc.district + ', ' : ''}${loc.state || 'India'}!`
            }));
        } catch (err) {
            dispatch(addToast({
                type: 'error',
                message: err.message || 'Could not fetch location'
            }));
        } finally {
            setIsDetectingLocation(false);
        }
    };

    const handlePincodeChange = async (e) => {
        const pin = e.target.value.replace(/\D/g, '').slice(0, 6);
        setFormData(prev => ({ ...prev, zipCode: pin }));
        if (pin.length === 6) {
            const info = await lookupPincode(pin);
            if (info) {
                setFormData(prev => ({
                    ...prev,
                    state: info.state || prev.state,
                    district: info.district || prev.district,
                    city: info.district || prev.city,
                    roadArea: prev.roadArea || info.area || ''
                }));
                dispatch(addToast({
                    type: 'success',
                    message: `Pincode recognized: ${info.district}, ${info.state}`
                }));
            }
        }
    };

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
                    fullName: formData.fullName || formData.name,
                    phone: formData.recipientPhone || formData.phone,
                    houseNo: formData.houseNo,
                    roadArea: formData.roadArea,
                    street: [formData.houseNo, formData.roadArea].filter(Boolean).join(', ') || formData.street,
                    district: formData.district,
                    city: formData.city || formData.district,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    country: formData.country || 'India',
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

    const handleUpdateAddress = async () => {
        if (!formData.fullName?.trim() && !formData.name?.trim()) {
            dispatch(addToast({ type: 'error', message: 'Please enter recipient Full Name' }));
            return;
        }
        if (!formData.recipientPhone?.trim() && !formData.phone?.trim()) {
            dispatch(addToast({ type: 'error', message: 'Please enter a valid Phone Number' }));
            return;
        }
        if (!formData.zipCode?.trim()) {
            dispatch(addToast({ type: 'error', message: 'Please enter a valid Pincode' }));
            return;
        }
        if (!formData.state?.trim()) {
            dispatch(addToast({ type: 'error', message: 'Please enter your State' }));
            return;
        }
        if (!formData.district?.trim()) {
            dispatch(addToast({ type: 'error', message: 'Please enter your District / City' }));
            return;
        }
        if (!formData.houseNo?.trim()) {
            dispatch(addToast({ type: 'error', message: 'Please enter House No. / Building Name' }));
            return;
        }
        if (!formData.roadArea?.trim()) {
            dispatch(addToast({ type: 'error', message: 'Please enter Road Name / Area / Colony' }));
            return;
        }

        try {
            await updateProfile({
                name: formData.name,
                phone: formData.recipientPhone || formData.phone,
                address: {
                    fullName: formData.fullName || formData.recipientName || formData.name,
                    phone: formData.recipientPhone || formData.phone,
                    houseNo: formData.houseNo,
                    roadArea: formData.roadArea,
                    street: [formData.houseNo, formData.roadArea].filter(Boolean).join(', ') || formData.street,
                    district: formData.district,
                    city: formData.district || formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    country: 'India',
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

    const handleShareWishlist = () => {
        const shareUrl = window.location.origin + '/products';
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareUrl);
            dispatch(addToast({
                type: 'success',
                message: 'Wishlist link copied to clipboard!',
            }));
        } else {
            dispatch(addToast({
                type: 'success',
                message: 'Share link ready!',
            }));
        }
    };

    const getStatusStep = (status) => {
        const s = status?.toLowerCase() || 'pending';
        if (s === 'delivered') return 4;
        if (s === 'shipped') return 3;
        if (s === 'processing' || s === 'packing') return 2;
        return 1;
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const tabs = [
        { id: 'overview', label: 'Dashboard', icon: <FiUser size={18} /> },
        { id: 'orders', label: 'My Orders & Gifts', icon: <FiPackage size={18} />, count: orders.length },
        { id: 'reminders', label: 'Occasion Reminders', icon: <FiCalendar size={18} />, count: reminders.length },
        { id: 'wishlist', label: 'My Wishlist', icon: <FiHeart size={18} />, count: wishlistItems.length },
        { id: 'addresses', label: 'Recipient Address Book', icon: <FiMapPin size={18} /> },
        { id: 'settings', label: 'Security & Settings', icon: <FiSettings size={18} /> },
    ];

    return (
        <div className="min-h-screen pt-44 md:pt-32 pb-12 bg-[#FAF9FC]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Navigation Breadcrumb with BackButton */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6"
                >
                    <BackButton to="/" />
                    <Breadcrumbs items={[{ label: 'User Account' }]} />
                </motion.div>

                {/* VIP Header Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-primary-100/70 mb-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#FF64B4]/10 via-[#4cc9f0]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            {/* Avatar with Brand Gradient Ring */}
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-[#FF64B4] to-[#4cc9f0] shadow-gold">
                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-2xl font-black text-[#FF64B4]">
                                        {profile?.name ? profile.name.charAt(0).toUpperCase() : 'G'}
                                    </div>
                                </div>
                                <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" title="Active Account" />
                            </div>

                            <div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-serif">
                                        {getGreeting()}, {profile?.name || 'Celebration Lover'}
                                    </h1>
                                    <span className="px-3 py-1 bg-primary-50 text-[#FF64B4] border border-primary-200/60 rounded-full text-xs font-bold uppercase tracking-wider">
                                        Glitz VIP Circle
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    {profile?.email} • Member since {profile?.createdAt ? new Date(profile.createdAt).getFullYear() : '2025'}
                                </p>
                            </div>
                        </div>

                        {/* Metric Chips */}
                        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-2 md:pb-0">
                            <div className="flex-1 md:flex-none px-4 py-3 bg-[#FAF9FC] rounded-2xl border border-gray-100 flex items-center gap-3 min-w-[130px]">
                                <div className="w-10 h-10 rounded-xl bg-primary-100 text-[#FF64B4] flex items-center justify-center font-bold">
                                    <FiGift size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Gifts Sent</p>
                                    <p className="text-lg font-black text-gray-900">{orders.length}</p>
                                </div>
                            </div>

                            <div className="flex-1 md:flex-none px-4 py-3 bg-[#FAF9FC] rounded-2xl border border-gray-100 flex items-center gap-3 min-w-[130px]">
                                <div className="w-10 h-10 rounded-xl bg-pink-100 text-[#FF64B4] flex items-center justify-center font-bold">
                                    <FiHeart size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Saved Items</p>
                                    <p className="text-lg font-black text-gray-900">{wishlistItems.length}</p>
                                </div>
                            </div>

                            <div className="flex-1 md:flex-none px-4 py-3 bg-[#FAF9FC] rounded-2xl border border-gray-100 flex items-center gap-3 min-w-[130px]">
                                <div className="w-10 h-10 rounded-xl bg-secondary-100 text-[#4cc9f0] flex items-center justify-center font-bold">
                                    <FiTruck size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">In Transit</p>
                                    <p className="text-lg font-black text-gray-900">{activeOrders.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Main Content Layout with Sidebar */}
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    {/* Left Sidebar (Navigation Tabs) */}
                    <div className="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-28 lg:self-start space-y-4">
                        <div className="bg-white rounded-3xl p-4 shadow-card border border-gray-100">
                            <div className="flex flex-col gap-1.5">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                                            activeTab === tab.id
                                                ? 'bg-gradient-to-r from-[#FF64B4] to-[#ff389a] text-white shadow-gold'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span>{tab.icon}</span>
                                            <span>{tab.label}</span>
                                        </div>
                                        {tab.count !== undefined && tab.count > 0 && (
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                activeTab === tab.id
                                                    ? 'bg-white/25 text-white'
                                                    : 'bg-primary-50 text-[#FF64B4]'
                                            }`}>
                                                {tab.count}
                                            </span>
                                        )}
                                    </button>
                                ))}

                                <div className="h-px bg-gray-100 my-2" />

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
                                >
                                    <FiLogOut size={18} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>

                        {/* Customer Care Concierge Card */}
                        <div className="bg-gradient-to-br from-[#FF64B4]/10 via-[#4cc9f0]/10 to-transparent rounded-3xl p-5 border border-primary-100 text-center">
                            <div className="w-12 h-12 mx-auto rounded-2xl bg-white shadow-sm flex items-center justify-center text-green-500 mb-3">
                                <FaWhatsapp size={24} />
                            </div>
                            <h4 className="font-bold text-gray-900 text-sm">Gifting Concierge</h4>
                            <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">
                                Need custom engraving, midnight delivery, or order support?
                            </p>
                            <a
                                href="https://wa.me/919999999999?text=Hello%20Glitz%20Creativez%20Team%2C%20I%20need%20help%20with%20my%20gifting%20order."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white text-gray-800 rounded-xl font-bold text-xs shadow-sm hover:shadow-md transition-all hover:text-green-600"
                            >
                                <FaWhatsapp className="text-green-500" />
                                <span>Chat with Us</span>
                            </a>
                        </div>
                    </div>

                    {/* Right Tab Content */}
                    <div className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            {/* 1. Overview Tab */}
                            {activeTab === 'overview' && (
                                <motion.div
                                    key="overview"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    className="space-y-6"
                                >
                                    {/* Active Order Card (If any) */}
                                    {activeOrders.length > 0 && (
                                        <div className="bg-white rounded-3xl border border-primary-100 shadow-card p-6 relative overflow-hidden">
                                            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                                                <div>
                                                    <span className="text-xs font-bold uppercase tracking-wider text-[#FF64B4] bg-primary-50 px-3 py-1 rounded-full">
                                                        Active Delivery in Transit
                                                    </span>
                                                    <h3 className="text-lg font-bold text-gray-900 mt-2 font-serif">
                                                        Order #{activeOrders[0].orderNumber || activeOrders[0]._id?.slice(-8)}
                                                    </h3>
                                                </div>
                                                <Link to={`/order-success/${activeOrders[0]._id}`}>
                                                    <Button size="sm" variant="secondary" icon={<FiEye />}>
                                                        Track Details
                                                    </Button>
                                                </Link>
                                            </div>

                                            {/* Stepper */}
                                            <div className="py-4">
                                                <div className="flex items-center justify-between relative">
                                                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 z-0" />
                                                    <div
                                                        className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-[#FF64B4] to-[#4cc9f0] -translate-y-1/2 z-0 transition-all duration-500"
                                                        style={{ width: `${((getStatusStep(activeOrders[0].status) - 1) / 3) * 100}%` }}
                                                    />

                                                    {['Confirmed', 'Handcrafted', 'Out for Delivery', 'Delivered'].map((step, idx) => {
                                                        const current = getStatusStep(activeOrders[0].status);
                                                        const isDone = idx + 1 <= current;
                                                        return (
                                                            <div key={idx} className="relative z-10 flex flex-col items-center">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                                                    isDone
                                                                        ? 'bg-[#FF64B4] text-white shadow-gold'
                                                                        : 'bg-white border-2 border-gray-200 text-gray-400'
                                                                }`}>
                                                                    {isDone ? <FiCheck size={14} /> : idx + 1}
                                                                </div>
                                                                <span className="text-[10px] md:text-xs font-semibold text-gray-600 mt-2 text-center whitespace-nowrap">
                                                                    {step}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Personal Profile Summary Card */}
                                    <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 sm:p-8">
                                        <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6">
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900 font-serif">Personal Details</h2>
                                                <p className="text-xs text-gray-500 mt-0.5">Your contact and delivery identity</p>
                                            </div>
                                            <Button
                                                onClick={() => setShowEditModal(true)}
                                                size="sm"
                                                icon={<FiEdit />}
                                            >
                                                Edit Profile
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            <div className="p-4 rounded-2xl bg-[#FAF9FC] border border-gray-100/70">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Full Name</p>
                                                <p className="text-gray-900 font-bold">{formData.name || 'Not provided'}</p>
                                            </div>

                                            <div className="p-4 rounded-2xl bg-[#FAF9FC] border border-gray-100/70">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email Address</p>
                                                <p className="text-gray-900 font-bold truncate">{formData.email || 'Not provided'}</p>
                                            </div>

                                            <div className="p-4 rounded-2xl bg-[#FAF9FC] border border-gray-100/70">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Mobile Contact</p>
                                                <p className="text-gray-900 font-bold">{formData.phone || 'Not provided'}</p>
                                            </div>

                                            <div className="p-4 rounded-2xl bg-[#FAF9FC] border border-gray-100/70">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Gender</p>
                                                <p className="text-gray-900 font-bold">{formData.gender || 'Not specified'}</p>
                                            </div>

                                            <div className="p-4 rounded-2xl bg-[#FAF9FC] border border-gray-100/70">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date of Birth</p>
                                                <p className="text-gray-900 font-bold">{formData.dob || 'Not set'}</p>
                                            </div>

                                            <div className="p-4 rounded-2xl bg-[#FAF9FC] border border-gray-100/70">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">City</p>
                                                <p className="text-gray-900 font-bold">{formData.city || 'Not provided'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* 2. Orders Tab with Stepper */}
                            {activeTab === 'orders' && (
                                <motion.div
                                    key="orders"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 sm:p-8"
                                >
                                    <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 font-serif flex items-center gap-2">
                                                <FiPackage className="text-[#FF64B4]" />
                                                Order & Gift History
                                            </h2>
                                            <p className="text-xs text-gray-500 mt-1">Track your past and ongoing celebratory deliveries</p>
                                        </div>
                                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                            {orders.length} Total Orders
                                        </span>
                                    </div>

                                    {orders.length === 0 ? (
                                        <div className="text-center py-16">
                                            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-primary-50 flex items-center justify-center text-[#FF64B4]">
                                                <FiPackage size={36} />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">No celebratory orders yet</h3>
                                            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                                                Surprise your loved ones with our signature handcrafted hampers and gifts.
                                            </p>
                                            <Link to="/products">
                                                <Button icon={<FiGift />}>Explore Gift Boutique</Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {orders.map((order) => {
                                                const currentStep = getStatusStep(order.status);
                                                return (
                                                    <div
                                                        key={order._id}
                                                        className="border border-gray-100 rounded-3xl p-6 bg-[#FAF9FC] hover:border-primary-200 hover:shadow-card-gold transition-all"
                                                    >
                                                        {/* Order Header */}
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/60">
                                                            <div>
                                                                <div className="flex items-center gap-3">
                                                                    <p className="font-bold text-gray-900 text-base">
                                                                        #{order.orderNumber || order._id?.slice(-8)}
                                                                    </p>
                                                                    <span className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                                        order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                                                                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                                                        'bg-pink-100 text-[#FF64B4]'
                                                                    }`}>
                                                                        {order.status}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                                        day: 'numeric',
                                                                        month: 'short',
                                                                        year: 'numeric'
                                                                    })}
                                                                </p>
                                                            </div>

                                                            <div className="text-left sm:text-right">
                                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Amount</p>
                                                                <p className="text-xl font-black text-gray-900">₹{order.totalPrice?.toFixed(2)}</p>
                                                            </div>
                                                        </div>

                                                        {/* Visual Progress Stepper */}
                                                        <div className="py-6 px-2">
                                                            <div className="flex items-center justify-between relative">
                                                                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0" />
                                                                <div
                                                                    className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-[#FF64B4] to-[#4cc9f0] -translate-y-1/2 z-0 transition-all duration-500"
                                                                    style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                                                                />

                                                                {['Confirmed', 'Handcrafted', 'Out for Delivery', 'Delivered'].map((step, idx) => {
                                                                    const isDone = idx + 1 <= currentStep;
                                                                    return (
                                                                        <div key={idx} className="relative z-10 flex flex-col items-center">
                                                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                                                                                isDone
                                                                                    ? 'bg-[#FF64B4] text-white shadow-gold'
                                                                                    : 'bg-white border-2 border-gray-300 text-gray-400'
                                                                            }`}>
                                                                                {isDone ? <FiCheck size={12} /> : idx + 1}
                                                                            </div>
                                                                            <span className="text-[10px] md:text-xs font-semibold text-gray-600 mt-1.5 text-center whitespace-nowrap">
                                                                                {step}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>

                                                        {/* Items Preview */}
                                                        <div className="flex flex-wrap gap-4 py-3 border-t border-gray-200/60">
                                                            {order.orderItems?.map((item, idx) => (
                                                                <div key={idx} className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-gray-100">
                                                                    <img
                                                                        src={item.image}
                                                                        alt={item.name}
                                                                        className="w-12 h-12 rounded-xl object-cover"
                                                                    />
                                                                    <div>
                                                                        <p className="text-xs font-bold text-gray-900 line-clamp-1">{item.name}</p>
                                                                        <p className="text-[11px] text-gray-500">Qty: {item.quantity || 1} • ₹{item.price}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200/60">
                                                            <Link to={`/order-success/${order._id}`}>
                                                                <Button variant="secondary" size="sm" icon={<FiEye />}>
                                                                    Order Receipt & Tracking
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* 3. Occasion Reminders Tab (Retention Engine) */}
                            {activeTab === 'reminders' && (
                                <motion.div
                                    key="reminders"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 sm:p-8"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 font-serif flex items-center gap-2">
                                                <FiCalendar className="text-[#FF64B4]" />
                                                Occasion Reminders
                                            </h2>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Never miss a birthday, anniversary, or special milestone again
                                            </p>
                                        </div>
                                        <Button
                                            onClick={() => setShowAddReminder(true)}
                                            size="sm"
                                            icon={<FiPlus />}
                                        >
                                            Add Milestone
                                        </Button>
                                    </div>

                                    {/* Add Reminder Modal / Inline Form */}
                                    {showAddReminder && (
                                        <motion.form
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            onSubmit={handleAddReminder}
                                            className="bg-[#FAF9FC] rounded-3xl p-6 border border-primary-100 mb-6"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-bold text-gray-900 text-sm">Add New Celebration Milestone</h3>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAddReminder(false)}
                                                    className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
                                                >
                                                    <FiX size={18} />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Title</label>
                                                    <input
                                                        type="text"
                                                        value={newReminder.title}
                                                        onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                                                        placeholder="e.g. Mom's 50th Birthday"
                                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-900 focus:outline-none focus:border-[#FF64B4]"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Occasion</label>
                                                    <select
                                                        value={newReminder.occasion}
                                                        onChange={(e) => setNewReminder({ ...newReminder, occasion: e.target.value })}
                                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-900 focus:outline-none focus:border-[#FF64B4]"
                                                    >
                                                        <option value="Birthday">Birthday</option>
                                                        <option value="Anniversary">Anniversary</option>
                                                        <option value="Valentine's">Valentine's</option>
                                                        <option value="Diwali / Festive">Diwali / Festive</option>
                                                        <option value="Achievement">Job / Achievement</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Celebrant Name</label>
                                                    <input
                                                        type="text"
                                                        value={newReminder.recipient}
                                                        onChange={(e) => setNewReminder({ ...newReminder, recipient: e.target.value })}
                                                        placeholder="e.g. Sarah"
                                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-900 focus:outline-none focus:border-[#FF64B4]"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Date</label>
                                                    <input
                                                        type="date"
                                                        value={newReminder.date}
                                                        onChange={(e) => setNewReminder({ ...newReminder, date: e.target.value })}
                                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-900 focus:outline-none focus:border-[#FF64B4]"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-3 mt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAddReminder(false)}
                                                    className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-200 rounded-xl transition-all"
                                                >
                                                    Cancel
                                                </button>
                                                <Button size="sm" type="submit">
                                                    Save Milestone
                                                </Button>
                                            </div>
                                        </motion.form>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {reminders.map((item) => (
                                            <div
                                                key={item.id}
                                                className="p-5 rounded-3xl bg-[#FAF9FC] border border-gray-100 flex items-center justify-between hover:border-primary-200 transition-all"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF64B4] to-[#ff389a] text-white flex items-center justify-center font-bold shadow-gold">
                                                        <FiGift size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            {item.occasion} • {item.recipient ? `For ${item.recipient}` : 'Special Day'}
                                                        </p>
                                                        <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-100 text-[#FF64B4]">
                                                            📅 {new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Link to={`/products?search=${encodeURIComponent(item.occasion)}`}>
                                                        <button className="px-3 py-1.5 bg-white text-gray-800 text-xs font-bold rounded-xl shadow-sm hover:text-[#FF64B4] transition-all">
                                                            Curate Gift
                                                        </button>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDeleteReminder(item.id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-white transition-all"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* 4. Wishlist Tab */}
                            {activeTab === 'wishlist' && (
                                <motion.div
                                    key="wishlist"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 sm:p-8"
                                >
                                    <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 font-serif flex items-center gap-2">
                                                <FiHeart className="text-[#FF64B4]" />
                                                My Wishlist & Registry
                                            </h2>
                                            <p className="text-xs text-gray-500 mt-1">Keepsakes you love and hope to receive</p>
                                        </div>
                                        {wishlistItems.length > 0 && (
                                            <Button
                                                onClick={handleShareWishlist}
                                                size="sm"
                                                variant="secondary"
                                                icon={<FiShare2 />}
                                            >
                                                Share Wishlist
                                            </Button>
                                        )}
                                    </div>

                                    {wishlistItems.length === 0 ? (
                                        <div className="text-center py-16">
                                            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-pink-50 flex items-center justify-center text-[#FF64B4]">
                                                <FiHeart size={36} />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">Your wishlist is empty</h3>
                                            <p className="text-gray-500 text-sm mb-6">Save items you love for your next celebration.</p>
                                            <Link to="/products">
                                                <Button>Discover Gifts</Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                            {wishlistItems.map((product) => (
                                                <div
                                                    key={product._id}
                                                    className="bg-[#FAF9FC] rounded-3xl border border-gray-100 overflow-hidden hover:shadow-card-gold hover:border-primary-200 transition-all flex flex-col justify-between"
                                                >
                                                    <Link to={`/products/${product._id}`}>
                                                        <div className="relative aspect-square overflow-hidden bg-white">
                                                            <img
                                                                src={product.images?.[0] || placeholderImg}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                                            />
                                                        </div>
                                                    </Link>

                                                    <div className="p-4">
                                                        <Link to={`/products/${product._id}`}>
                                                            <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1 hover:text-[#FF64B4] transition-colors">
                                                                {product.name}
                                                            </h3>
                                                        </Link>
                                                        <p className="text-base font-black text-gray-900 mb-3">
                                                            ₹{product.price?.toFixed(2)}
                                                        </p>
                                                        <div className="flex items-center gap-2">
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
                                                                className="p-2.5 rounded-xl bg-white text-red-500 hover:bg-red-50 border border-gray-100 transition-all"
                                                                title="Remove"
                                                            >
                                                                <FiTrash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* 5. Recipient Address Book Tab */}
                            {activeTab === 'addresses' && (
                                <motion.div
                                    key="addresses"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 sm:p-8"
                                >
                                    <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 font-serif flex items-center gap-2">
                                                <FiMapPin className="text-[#FF64B4]" />
                                                Recipient Address Book
                                            </h2>
                                            <p className="text-xs text-gray-500 mt-1">Saved destinations for seamless gift dispatch</p>
                                        </div>
                                        {!showAddAddress && (
                                            <Button
                                                onClick={() => setShowAddAddress(true)}
                                                size="sm"
                                                icon={<FiPlus />}
                                            >
                                                {profile?.address?.street || profile?.address?.houseNo || profile?.address?.district ? 'Edit Address' : 'Add Recipient'}
                                            </Button>
                                        )}
                                    </div>

                                    {showAddAddress && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-[#FAF9FC] rounded-3xl p-6 border border-primary-100 mb-6"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-200/60">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-sm">
                                                        {profile?.address?.street || profile?.address?.houseNo ? 'Update Delivery Destination' : 'Add Delivery Destination'}
                                                    </h3>
                                                    <p className="text-[11px] text-gray-400">Complete recipient details for delivery & admin dispatch</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={handleUseMyLocation}
                                                        disabled={isDetectingLocation}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-[#FF64B4] text-[#FF64B4] hover:text-white border border-[#FF64B4]/20 text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                                                    >
                                                        {isDetectingLocation ? (
                                                            <>
                                                                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                                <span>Detecting GPS...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FiNavigation className="text-xs" />
                                                                <span>📍 Use My Location</span>
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => setShowAddAddress(false)}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200/50"
                                                    >
                                                        <FiX size={18} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                                                    <input
                                                        type="text"
                                                        value={formData.fullName}
                                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                        placeholder="e.g. Rahul Sharma"
                                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-900 focus:outline-none focus:border-[#FF64B4]"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number</label>
                                                    <input
                                                        type="tel"
                                                        value={formData.recipientPhone}
                                                        onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                                        placeholder="10-digit mobile number"
                                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-900 focus:outline-none focus:border-[#FF64B4]"
                                                    />
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">House No. / Building Name</label>
                                                    <input
                                                        type="text"
                                                        value={formData.houseNo}
                                                        onChange={(e) => setFormData({ ...formData, houseNo: e.target.value })}
                                                        placeholder="Flat / House No., Floor, Apartment Name"
                                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-900 focus:outline-none focus:border-[#FF64B4]"
                                                    />
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Road Name / Area / Colony</label>
                                                    <input
                                                        type="text"
                                                        value={formData.roadArea}
                                                        onChange={(e) => setFormData({ ...formData, roadArea: e.target.value })}
                                                        placeholder="Street Name, Landmark, Sector, Colony"
                                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-900 focus:outline-none focus:border-[#FF64B4]"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">PIN Code (Auto-fills District & State)</label>
                                                    <input
                                                        type="text"
                                                        value={formData.zipCode}
                                                        onChange={handlePincodeChange}
                                                        placeholder="6-digit PIN code (e.g. 682001)"
                                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-900 focus:outline-none focus:border-[#FF64B4]"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">District / City</label>
                                                    <input
                                                        type="text"
                                                        value={formData.district}
                                                        onChange={(e) => setFormData({ ...formData, district: e.target.value, city: e.target.value })}
                                                        placeholder="e.g. Ernakulam, Bangalore, Mumbai"
                                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-900 focus:outline-none focus:border-[#FF64B4]"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">State</label>
                                                    <input
                                                        type="text"
                                                        value={formData.state}
                                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                        placeholder="e.g. Kerala, Karnataka, Maharashtra"
                                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-900 focus:outline-none focus:border-[#FF64B4]"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Country</label>
                                                    <input
                                                        type="text"
                                                        value="India"
                                                        disabled
                                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-xs text-gray-500 cursor-not-allowed"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-3 mt-6">
                                                <button
                                                    onClick={() => setShowAddAddress(false)}
                                                    className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-200 rounded-xl transition-all"
                                                >
                                                    Cancel
                                                </button>
                                                <Button
                                                    onClick={handleUpdateAddress}
                                                    isLoading={updating}
                                                    icon={<FiCheck />}
                                                >
                                                    Save Address
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {(profile?.address?.street || profile?.address?.houseNo || profile?.address?.district) && !showAddAddress ? (
                                        <div className="p-6 rounded-3xl bg-[#FAF9FC] border border-primary-100 flex items-start justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white text-[#FF64B4] flex items-center justify-center shadow-sm font-bold shrink-0">
                                                    <FiHome size={22} />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-gray-900 text-base">
                                                            {profile.address.fullName || profile.name || 'Primary Delivery Address'}
                                                        </h4>
                                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-100 text-[#FF64B4]">
                                                            Default
                                                        </span>
                                                    </div>
                                                    {(profile.address.phone || profile.phone) && (
                                                        <p className="text-xs text-gray-500 font-mono font-medium">
                                                            📞 {profile.address.phone || profile.phone}
                                                        </p>
                                                    )}
                                                    <div className="text-gray-600 text-xs leading-relaxed pt-1">
                                                        {profile.address.houseNo && <p className="font-medium text-gray-800">{profile.address.houseNo}</p>}
                                                        {profile.address.roadArea && <p className="text-gray-600">{profile.address.roadArea}</p>}
                                                        {profile.address.street && !profile.address.houseNo && <p>{profile.address.street}</p>}
                                                        <p className="font-semibold text-gray-900 mt-1">
                                                            {profile.address.district || profile.address.city ? `${profile.address.district || profile.address.city}, ` : ''}
                                                            {profile.address.state || ''} {profile.address.zipCode ? `— ${profile.address.zipCode}` : ''}
                                                        </p>
                                                        <p className="text-gray-400 text-[11px]">{profile.address.country || 'India'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setShowAddAddress(true)}
                                                className="p-2.5 rounded-xl text-gray-400 hover:text-gray-800 hover:bg-white transition-all shadow-sm"
                                            >
                                                <FiEdit size={18} />
                                            </button>
                                        </div>
                                    ) : !showAddAddress && (
                                        <div className="text-center py-16">
                                            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-primary-50 flex items-center justify-center text-[#FF64B4]">
                                                <FiMapPin size={36} />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">No address saved</h3>
                                            <p className="text-gray-500 text-sm mb-6">Add an address for lightning-fast checkout and gift dispatch.</p>
                                            <Button onClick={() => setShowAddAddress(true)} icon={<FiPlus />}>
                                                Add Address
                                            </Button>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* 6. Settings Tab */}
                            {activeTab === 'settings' && (
                                <motion.div
                                    key="settings"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 sm:p-8 space-y-6"
                                >
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 font-serif flex items-center gap-2">
                                            <FiSettings className="text-[#FF64B4]" />
                                            Security & Account Settings
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-1">Manage credentials and authentication preferences</p>
                                    </div>

                                    <div className="p-6 rounded-3xl bg-[#FAF9FC] border border-gray-100 space-y-4">
                                        <h3 className="font-bold text-gray-900 text-sm">Account Overview</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                            <div className="p-3 bg-white rounded-xl border border-gray-100">
                                                <p className="text-gray-400 font-semibold mb-1">Registered Email</p>
                                                <p className="text-gray-900 font-bold">{profile?.email}</p>
                                            </div>
                                            <div className="p-3 bg-white rounded-xl border border-gray-100">
                                                <p className="text-gray-400 font-semibold mb-1">Account Creation Date</p>
                                                <p className="text-gray-900 font-bold">
                                                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Danger Zone */}
                                    <div className="p-6 rounded-3xl bg-red-50/50 border border-red-100">
                                        <h3 className="text-sm font-bold text-red-600 flex items-center gap-2 mb-2">
                                            <FiShield /> Danger Zone
                                        </h3>
                                        <p className="text-xs text-gray-500 mb-4">
                                            Once deleted, all your celebratory order receipts, saved milestones, and personalized gift notes will be wiped.
                                        </p>
                                        <Button
                                            className="!bg-red-600 !text-white hover:!bg-red-700 !shadow-none"
                                            size="sm"
                                        >
                                            Delete Account
                                        </Button>
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
                                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 font-serif">Edit Profile</h2>
                                        <p className="text-xs text-gray-500 mt-0.5">Update your personal details</p>
                                    </div>
                                    <button
                                        onClick={() => setShowEditModal(false)}
                                        className="p-2 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <FiX size={20} />
                                    </button>
                                </div>

                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        const success = await handleSubmit(e);
                                        if (success) setShowEditModal(false);
                                    }}
                                    className="p-8 space-y-4"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Enter full name"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF64B4] focus:outline-none transition-all text-sm"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">Gender</label>
                                            <select
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF64B4] focus:outline-none transition-all text-sm"
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile Contact</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="Enter phone number"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF64B4] focus:outline-none transition-all text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">Date of Birth</label>
                                            <input
                                                type="date"
                                                name="dob"
                                                value={formData.dob}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF64B4] focus:outline-none transition-all text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-400 mb-1">Email (Registered)</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                disabled
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                placeholder="Enter city"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF64B4] focus:outline-none transition-all text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-8 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                        <button
                                            type="button"
                                            onClick={() => setShowEditModal(false)}
                                            className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition-all uppercase tracking-wider"
                                        >
                                            Cancel
                                        </button>
                                        <Button
                                            type="submit"
                                            isLoading={updating}
                                            className="px-8 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs"
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
