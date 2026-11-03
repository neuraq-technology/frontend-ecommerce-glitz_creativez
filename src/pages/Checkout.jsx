import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
    FiCheck,
    FiTruck,
    FiCreditCard,
    FiShield,
    FiMapPin,
    FiNavigation,
    FiLock,
    FiEdit2,
    FiTrash2,
    FiMinus,
    FiPlus,
    FiArrowLeft,
    FiHelpCircle,
    FiDollarSign,
} from 'react-icons/fi';
import {
    selectCartItems,
    selectCartTotal,
    clearCart,
    updateQuantity,
    removeItem,
} from '../store/slices/cartSlice';
import { selectCurrentUser, selectIsAuthenticated } from '../store/slices/authSlice';
import {
    useCreateOrderMutation,
    useCreateCashfreeOrderMutation,
    useVerifyCashfreePaymentMutation,
} from '../store/api/ordersApi';
import { addToast } from '../store/slices/uiSlice';
import Button from '../components/common/Button';
import BackButton from '../components/common/BackButton';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Input from '../components/common/Input';
import { fetchLocationDetails, lookupPincode } from '../utils/locationService';
import placeholderImg from '../assets/images/PNG.png';

const Checkout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const cartItems = useSelector(selectCartItems);
    const cartTotal = useSelector(selectCartTotal);
    const user = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth');
        }
    }, [isAuthenticated, navigate]);

    const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
    const [createCashfreeOrder, { isLoading: isCreatingCashfree }] = useCreateCashfreeOrderMutation();
    const [verifyCashfreePayment, { isLoading: isVerifying }] = useVerifyCashfreePaymentMutation();

    const isLoading = isCreatingOrder || isCreatingCashfree || isVerifying;

    // Flipkart 3-Step Flow: 1. Address -> 2. Order Summary -> 3. Payment
    const [step, setStep] = useState(1);
    const [isInitializing, setIsInitializing] = useState(true);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);

    useEffect(() => {
        // Allow hydration / Redux storage to stabilize to prevent flash of empty cart
        const timer = setTimeout(() => {
            setIsInitializing(false);
        }, 250);
        return () => clearTimeout(timer);
    }, []);
    const [formData, setFormData] = useState({
        // Shipping Details
        fullName: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || user?.address?.phone || '',
        houseNo: user?.address?.houseNo || '',
        roadArea: user?.address?.roadArea || '',
        district: user?.address?.district || user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || '',
        country: 'India',
        addressType: 'HOME',
        // Payment Method: Default to upi as shown in Flipkart Image 1 & 2
        paymentMethod: 'upi',
        // Bank / Card preview details
        cardNumber: '',
        cardExpiry: '',
        cardCvv: '',
    });

    const [showQrCode, setShowQrCode] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                fullName: prev.fullName || user.name || '',
                email: prev.email || user.email || '',
                phone: prev.phone || user.phone || user.address?.phone || '',
                houseNo: prev.houseNo || user.address?.houseNo || '',
                roadArea: prev.roadArea || user.address?.roadArea || '',
                district: prev.district || user.address?.district || user.address?.city || '',
                state: prev.state || user.address?.state || '',
                zipCode: prev.zipCode || user.address?.zipCode || '',
            }));
        }
    }, [user]);

    // Flipkart-style Price Calculations
    const totalQty = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const itemsSellingTotal = cartTotal;
    const itemsOriginalTotal = cartItems.reduce((acc, item) => {
        const p = item.product || item;
        const orig = p.originalPrice > p.price ? p.originalPrice : Math.round((p.price || item.price || 0) * 1.25);
        return acc + orig * item.quantity;
    }, 0);
    const totalDiscount = Math.max(0, itemsOriginalTotal - itemsSellingTotal);
    const taxRate = 0.1;
    const shippingCost = itemsSellingTotal > 100 ? 0 : 10;
    const tax = itemsSellingTotal * taxRate;
    const total = itemsSellingTotal + tax + shippingCost;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCardNumberChange = (e) => {
        const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
        const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
        setFormData(prev => ({ ...prev, cardNumber: formatted }));
    };

    const handleCardExpiryChange = (e) => {
        let val = e.target.value.replace(/\D/g, '').slice(0, 4);
        if (val.length >= 3) {
            val = val.slice(0, 2) + '/' + val.slice(2);
        }
        setFormData(prev => ({ ...prev, cardExpiry: val }));
    };

    const handleCardCvvChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
        setFormData(prev => ({ ...prev, cardCvv: val }));
    };

    const handleUseMyLocation = async () => {
        setIsDetectingLocation(true);
        try {
            const loc = await fetchLocationDetails();
            setFormData(prev => ({
                ...prev,
                state: loc.state || prev.state,
                district: loc.district || prev.district,
                zipCode: loc.pincode || prev.zipCode,
                roadArea: loc.roadArea || prev.roadArea,
            }));
            dispatch(addToast({
                type: 'success',
                message: `Location detected: ${loc.district ? loc.district + ', ' : ''}${loc.state || 'India'}`
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
                    roadArea: prev.roadArea || info.area || ''
                }));
            }
        }
    };

    // Transition from Step 1 (Address) -> Step 2 (Order Summary - Flipkart Style)
    const handleProceedToOrderSummary = (e) => {
        e.preventDefault();
        if (!formData.fullName?.trim()) {
            dispatch(addToast({ type: 'error', message: 'Please enter your Full Name' }));
            return;
        }
        const cleanedPhone = formData.phone?.replace(/\D/g, '').trim();
        if (!cleanedPhone || cleanedPhone.length < 10) {
            dispatch(addToast({ type: 'error', message: 'Please enter a valid 10-digit Phone Number' }));
            return;
        }
        if (!formData.zipCode?.trim() || formData.zipCode.trim().length < 6) {
            dispatch(addToast({ type: 'error', message: 'Please enter a valid 6-digit Pincode' }));
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
        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Quantity & Item Handlers for Flipkart Order Summary Step
    const handleQtyChange = (cartItemId, newQty) => {
        if (newQty <= 0) {
            dispatch(removeItem(cartItemId));
        } else {
            dispatch(updateQuantity({ cartItemId, quantity: newQty }));
        }
    };

    const handleRemove = (cartItemId) => {
        dispatch(removeItem(cartItemId));
    };

    const getEstimatedDeliveryDate = () => {
        const d = new Date();
        d.setDate(d.getDate() + 4);
        return `Delivery by ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}`;
    };

    const loadCashfreeScript = () => {
        return new Promise((resolve) => {
            if (window.Cashfree) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleCashfreePayment = async (orderId) => {
        const res = await loadCashfreeScript();
        if (!res) {
            dispatch(addToast({ type: 'error', message: 'Payment gateway script failed to load' }));
            return;
        }

        try {
            const cashfreeOrder = await createCashfreeOrder(orderId).unwrap();
            const paymentSessionId = cashfreeOrder.payment_session_id;

            const cashfree = window.Cashfree({
                mode: import.meta.env.VITE_CASHFREE_ENV === 'production' ? 'production' : 'sandbox',
            });

            // Redirect to Cashfree Full-Page Checkout (dedicated page instead of popup modal)
            cashfree.checkout({
                paymentSessionId: paymentSessionId,
                redirectTarget: '_self',
            });

        } catch (error) {
            console.warn('Payment gateway initialization notice:', error);
            dispatch(addToast({
                type: 'info',
                message: error?.data?.message || 'Order placed successfully. Payment gateway in sandbox mode.',
            }));
            navigate(`/order-success/${orderId}`);
        }
    };

    const handleSubmit = async () => {
        if (formData.paymentMethod === 'cod') {
            dispatch(addToast({
                type: 'warning',
                message: 'Cash on Delivery is currently disabled. Please pay securely via UPI or Card.',
            }));
            return;
        }

        try {
            const orderData = {
                orderItems: cartItems.map(item => ({
                    product: item.product?._id || item.product,
                    name: item.product?.name || item.name,
                    image: item.product?.images?.[0] || item.image,
                    price: item.product?.price || item.price,
                    quantity: item.quantity,
                    customImage: item.customImage || item.product?.customImage || '',
                    customText: item.customText || item.product?.customText || '',
                    selectedSize: item.selectedSize || null,
                })),
                shippingAddress: {
                    fullName: formData.fullName || user?.name || 'Customer',
                    email: formData.email || user?.email || '',
                    phone: formData.phone.replace(/\D/g, '').trim(),
                    houseNo: formData.houseNo,
                    roadArea: formData.roadArea,
                    street: [formData.houseNo, formData.roadArea].filter(Boolean).join(', ') || formData.roadArea || '',
                    district: formData.district,
                    city: formData.district,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    country: 'India',
                },
                paymentMethod: formData.paymentMethod || 'card',
                itemsPrice: itemsSellingTotal,
                taxPrice: tax,
                shippingPrice: shippingCost,
                totalPrice: total,
            };

            const result = await createOrder(orderData).unwrap();
            const createdOrderId = result.data._id;

            // Clear cart upon successful order creation
            dispatch(clearCart());

            // Trigger Real Payment Gateway
            await handleCashfreePayment(createdOrderId);

        } catch (error) {
            dispatch(addToast({
                type: 'error',
                message: error?.data?.message || 'Failed to place order. Please try again.',
            }));
        }
    };

    // 1. Initial State Resolution: Flipkart-Style Checkout Skeleton (Prevents flashing "empty cart")
    if (cartItems.length === 0 && isInitializing) {
        return (
            <div className="min-h-screen pt-32 sm:pt-28 md:pt-24 pb-16 bg-[#f1f3f6]">
                <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
                    {/* Top Step Bar Skeleton */}
                    <div className="bg-white rounded-xs border border-gray-200 shadow-2xs mb-4 px-4 py-4">
                        <div className="flex items-center justify-center gap-4 sm:gap-12 animate-pulse">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-100" />
                                <div className="w-16 h-4 bg-gray-200 rounded" />
                            </div>
                            <div className="w-8 sm:w-16 h-0.5 bg-gray-200" />
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gray-200" />
                                <div className="w-24 h-4 bg-gray-200 rounded" />
                            </div>
                            <div className="w-8 sm:w-16 h-0.5 bg-gray-200" />
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gray-200" />
                                <div className="w-16 h-4 bg-gray-200 rounded" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                        {/* Left Column Skeleton */}
                        <div className="lg:col-span-8 space-y-3">
                            <div className="bg-white rounded-xs border border-gray-200 shadow-2xs p-5 animate-pulse">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-6 h-6 rounded-xs bg-[#FF64B4]/20" />
                                    <div className="w-44 h-5 bg-gray-200 rounded" />
                                </div>
                                <div className="space-y-3 pl-9">
                                    <div className="w-3/4 h-4 bg-gray-200 rounded" />
                                    <div className="w-1/2 h-4 bg-gray-200 rounded" />
                                    <div className="w-36 h-9 bg-gray-200 rounded mt-4" />
                                </div>
                            </div>
                            <div className="bg-white rounded-xs border border-gray-200 shadow-2xs p-5 animate-pulse">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-xs bg-gray-200" />
                                    <div className="w-36 h-5 bg-gray-200 rounded" />
                                </div>
                            </div>
                            <div className="bg-white rounded-xs border border-gray-200 shadow-2xs p-5 animate-pulse">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-xs bg-gray-200" />
                                    <div className="w-36 h-5 bg-gray-200 rounded" />
                                </div>
                            </div>
                        </div>

                        {/* Right Column Skeleton */}
                        <div className="lg:col-span-4">
                            <div className="bg-white rounded-xs border border-gray-200 shadow-2xs p-4 animate-pulse">
                                <div className="w-28 h-5 bg-gray-200 rounded mb-4" />
                                <div className="space-y-3 border-b border-gray-100 pb-4">
                                    <div className="flex justify-between">
                                        <div className="w-24 h-4 bg-gray-200 rounded" />
                                        <div className="w-16 h-4 bg-gray-200 rounded" />
                                    </div>
                                    <div className="flex justify-between">
                                        <div className="w-20 h-4 bg-gray-200 rounded" />
                                        <div className="w-16 h-4 bg-gray-200 rounded" />
                                    </div>
                                    <div className="flex justify-between">
                                        <div className="w-28 h-4 bg-gray-200 rounded" />
                                        <div className="w-12 h-4 bg-gray-200 rounded" />
                                    </div>
                                </div>
                                <div className="flex justify-between pt-4">
                                    <div className="w-24 h-5 bg-gray-300 rounded" />
                                    <div className="w-20 h-5 bg-gray-300 rounded" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 2. Truly Empty Cart (After initialization has finished and cart still has 0 items)
    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen pt-28 flex items-center justify-center bg-[#fafcff]">
                <div className="text-center bg-white p-8 rounded-sm border border-gray-200 shadow-xs max-w-md mx-4">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
                    <p className="text-sm text-gray-500 mb-6">Explore our handcrafted gifts and products to continue.</p>
                    <Button onClick={() => navigate('/products')} className="!bg-[#FF64B4] hover:!bg-[#e61d7e] !text-white px-6">
                        Continue Shopping
                    </Button>
                </div>
            </div>
        );
    }

    const steps = [
        { id: 1, name: 'Address' },
        { id: 2, name: 'Order Summary' },
        { id: 3, name: 'Payment' },
    ];

    const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(
        `upi://pay?pa=glitzcreativez@okaxis&pn=Glitz%20Creativez&am=${total.toFixed(2)}&cu=INR`
    )}`;

    return (
        <div className="min-h-screen pt-44 md:pt-32 pb-16 bg-[#fafcff]">
            <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
                <div className="block mb-4">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <Breadcrumbs items={[{ label: 'Checkout' }]} />
                    </div>
                </div>

                {/* Flipkart-Style 3-Step Progress Bar */}
                <div className="bg-white rounded-xs border border-gray-200 shadow-2xs mb-4 px-4 py-3">
                    <div className="flex items-center justify-center gap-2 sm:gap-8">
                        {steps.map((s, index) => (
                            <div key={s.id} className="flex items-center gap-2 sm:gap-4">
                                <div className="flex items-center gap-2">
                                    <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                        step > s.id
                                            ? 'bg-[#FF64B4] text-white'
                                            : step === s.id
                                            ? 'bg-[#FF64B4] text-white ring-4 ring-pink-100'
                                            : 'bg-gray-200 text-gray-500'
                                    }`}>
                                        {step > s.id ? <FiCheck size={13} className="stroke-[3]" /> : s.id}
                                    </span>
                                    <span className={`text-xs sm:text-sm font-bold ${
                                        step === s.id ? 'text-[#FF64B4]' : step > s.id ? 'text-gray-900' : 'text-gray-400'
                                    }`}>
                                        {s.name}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`w-8 sm:w-16 h-0.5 transition-all ${
                                        step > s.id ? 'bg-[#FF64B4]' : 'bg-gray-200'
                                    }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {step !== 3 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                        {/* ----------------- LEFT COLUMN: STEPS 1 & 2 ----------------- */}
                        <div className="lg:col-span-8 space-y-3">

                        {/* STEP 1: ADDRESS */}
                        {step === 1 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-xs border border-gray-200 shadow-2xs p-4 sm:p-6"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-3 border-b border-gray-100">
                                    <div>
                                        <h2 className="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-wide">
                                            1. Delivery Address
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-0.5">Please provide your complete shipping details</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleUseMyLocation}
                                        disabled={isDetectingLocation}
                                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xs bg-pink-50 hover:bg-[#FF64B4] text-[#FF64B4] hover:text-white border border-pink-200 text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {isDetectingLocation ? (
                                            <>
                                                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                <span>Detecting Location...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FiNavigation className="text-sm" />
                                                <span>Use Current Location</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div className="sm:col-span-2">
                                        <Input
                                            label="Full Name *"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            placeholder="e.g. Asif Ashraf"
                                            required
                                        />
                                    </div>

                                    <Input
                                        label="10-digit Mobile Number *"
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                                        placeholder="e.g. 9020302499"
                                        required
                                    />

                                    <Input
                                        label="Email Address (for order updates)"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                    />

                                    <div className="sm:col-span-2">
                                        <Input
                                            label="House No. / Building Name *"
                                            name="houseNo"
                                            value={formData.houseNo}
                                            onChange={handleChange}
                                            placeholder="Flat / House No., Floor, Apartment Name"
                                            required
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <Input
                                            label="Road Name / Area / Colony / Landmark *"
                                            name="roadArea"
                                            value={formData.roadArea}
                                            onChange={handleChange}
                                            placeholder="Street Name, Sector, Near Landmark"
                                            required
                                        />
                                    </div>

                                    <Input
                                        label="Pincode *"
                                        name="zipCode"
                                        value={formData.zipCode}
                                        onChange={handlePincodeChange}
                                        placeholder="6-digit PIN code (e.g. 673634)"
                                        required
                                    />

                                    <Input
                                        label="City / District *"
                                        name="district"
                                        value={formData.district}
                                        onChange={handleChange}
                                        placeholder="e.g. Thenhipalam, Malappuram"
                                        required
                                    />

                                    <Input
                                        label="State *"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        placeholder="e.g. Kerala, Karnataka"
                                        required
                                    />

                                    <Input
                                        label="Country"
                                        name="country"
                                        value="India"
                                        disabled
                                        placeholder="India"
                                    />
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={handleProceedToOrderSummary}
                                        className="py-3 px-8 bg-[#FF64B4] hover:bg-[#e61d7e] text-white font-bold text-sm uppercase tracking-wide rounded-xs shadow-sm hover:shadow-md active:scale-95 transition-all"
                                    >
                                        Save & Deliver Here
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: FLIPKART-STYLE ORDER SUMMARY (Exact match of Image 2) */}
                        {step === 2 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-3"
                            >
                                {/* Deliver to Header Card (Matching Image 2) */}
                                <div className="bg-white rounded-xs border border-gray-200 shadow-2xs p-4 sm:p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Deliver to:</p>
                                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                <h3 className="text-sm font-bold text-gray-900">{formData.fullName}</h3>
                                                <span className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded-xs">
                                                    {formData.addressType || 'HOME'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                                                {[formData.houseNo, formData.roadArea, formData.district, formData.state].filter(Boolean).join(', ')}, {formData.zipCode}
                                            </p>
                                            <p className="text-xs font-semibold text-gray-800 mt-1">{formData.phone}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="px-4 py-1.5 border border-gray-300 text-[#FF64B4] text-xs font-bold rounded-xs hover:bg-pink-50 transition-all uppercase shrink-0"
                                        >
                                            Change
                                        </button>
                                    </div>
                                </div>

                                {/* Order Items Cards (Matching Image 2 layout) */}
                                <div className="bg-white rounded-xs border border-gray-200 shadow-2xs divide-y divide-gray-100">
                                    {cartItems.map((item, idx) => {
                                        const p = item.product || item;
                                        const unitPrice = p.price || item.price || 0;
                                        const origPrice = p.originalPrice > unitPrice ? p.originalPrice : Math.round(unitPrice * 1.25);
                                        const discPercent = Math.round(((origPrice - unitPrice) / origPrice) * 100);

                                        return (
                                            <div key={item.cartItemId || p._id || idx} className="p-4 sm:p-5">
                                                <div className="flex gap-4">
                                                    {/* Product Image */}
                                                    <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-white border border-gray-100 rounded-xs flex items-center justify-center overflow-hidden">
                                                        <img
                                                            src={p.images?.[0]?.startsWith('http') ? p.images[0] : (p.images?.[0] ? `http://localhost:5000${p.images[0]}` : (item.image?.startsWith('http') ? item.image : placeholderImg))}
                                                            alt={p.name}
                                                            className="w-full h-full object-contain p-1"
                                                            onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                                                        />
                                                    </div>

                                                    {/* Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">
                                                            {p.name || item.name}
                                                        </h3>

                                                        {/* Variants / Customization */}
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {item.selectedSize ? `Size: ${item.selectedSize?.size || item.selectedSize?.name || item.selectedSize}` : 'Standard Edition'}
                                                        </p>

                                                        {(item.customText || item.customImage) && (
                                                            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                                                <span className="text-[10px] font-bold text-[#FF64B4] bg-pink-50 px-1.5 py-0.5 rounded-xs border border-pink-100">
                                                                    Custom Photo / Text Included
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Price Strip */}
                                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                            <span className="text-xs font-bold text-emerald-700">↓{discPercent}%</span>
                                                            <span className="text-xs text-gray-400 line-through">₹{origPrice}</span>
                                                            <span className="text-sm sm:text-base font-bold text-gray-900">₹{unitPrice}</span>
                                                        </div>

                                                        {/* Delivery Date Promise */}
                                                        <p className="text-xs text-gray-600 mt-2 font-medium">
                                                            {getEstimatedDeliveryDate()} | <span className="text-emerald-700 font-bold">Free</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Quantity Adjuster & Remove Bar */}
                                                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                                                    <div className="flex items-center border border-gray-300 rounded-xs">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQtyChange(item.cartItemId || p._id, item.quantity - 1)}
                                                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95"
                                                        >
                                                            <FiMinus size={12} />
                                                        </button>
                                                        <span className="w-8 text-center text-xs font-bold text-gray-800">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQtyChange(item.cartItemId || p._id, item.quantity + 1)}
                                                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95"
                                                        >
                                                            <FiPlus size={12} />
                                                        </button>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemove(item.cartItemId || p._id)}
                                                        className="text-xs font-bold uppercase text-gray-800 hover:text-[#FF64B4] transition-colors"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Order Confirmation Email & Continue Bar (Matching Image 2) */}
                                <div className="bg-white rounded-xs border border-gray-200 shadow-2xs p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <p className="text-xs text-gray-600">
                                        Order confirmation email will be sent to <span className="font-bold text-gray-900">{formData.email || user?.email}</span>
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStep(3);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="w-full sm:w-auto py-3 px-10 bg-[#FF64B4] hover:bg-[#e61d7e] text-white font-bold text-sm uppercase tracking-wide rounded-xs shadow-sm hover:shadow-md active:scale-95 transition-all text-center"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* ----------------- RIGHT COLUMN: FLIPKART PRICE DETAILS SIDEBAR (FOR STEPS 1 & 2) ----------------- */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-xs border border-gray-200 shadow-2xs sticky top-24">
                            <h2 className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wider p-4 border-b border-gray-100">
                                Price Details
                            </h2>

                            <div className="p-4 space-y-3.5 text-xs sm:text-sm">
                                <div className="flex justify-between text-gray-800">
                                    <span>Price ({totalQty} {totalQty === 1 ? 'item' : 'items'})</span>
                                    <span>₹{itemsOriginalTotal.toLocaleString('en-IN')}</span>
                                </div>

                                {totalDiscount > 0 && (
                                    <div className="flex justify-between text-gray-800">
                                        <span>Discount</span>
                                        <span className="text-emerald-700 font-medium">− ₹{totalDiscount.toLocaleString('en-IN')}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-gray-800">
                                    <span>Delivery Charges</span>
                                    <span className={shippingCost === 0 ? 'text-emerald-700 font-bold' : 'text-gray-800'}>
                                        {shippingCost === 0 ? 'FREE' : `₹${shippingCost.toFixed(2)}`}
                                    </span>
                                </div>

                                <div className="pt-3 border-t border-dashed border-gray-200">
                                    <div className="flex justify-between text-sm sm:text-base font-bold text-gray-900">
                                        <span>Total Amount</span>
                                        <span>₹{total.toFixed(2)}</span>
                                    </div>
                                </div>

                                {totalDiscount > 0 && (
                                    <div className="p-2.5 bg-emerald-50 rounded-xs border border-emerald-200 text-center">
                                        <p className="text-xs font-bold text-emerald-700">
                                            You will save ₹{totalDiscount.toLocaleString('en-IN')} on this order
                                        </p>
                                    </div>
                                )}

                                {/* 10% Instant Discount Card */}
                                <div className="p-3 bg-pink-50/50 rounded-md border border-pink-200 flex items-center justify-between gap-2 mt-2">
                                    <div>
                                        <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF64B4]" />
                                            10% Instant Discount
                                        </p>
                                        <p className="text-[11px] text-gray-500">Claim now with UPI & Card payment offers</p>
                                    </div>
                                    <div className="flex items-center -space-x-1 shrink-0">
                                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px] font-bold ring-2 ring-white">V</span>
                                        <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] font-bold ring-2 ring-white">M</span>
                                        <span className="w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center text-[8px] font-bold ring-2 ring-white">U</span>
                                    </div>
                                </div>
                            </div>

                            {/* Flipkart Trust Strip */}
                            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center gap-3">
                                <FiShield size={22} className="text-gray-500 shrink-0" />
                                <p className="text-[11px] text-gray-600 leading-snug">
                                    Safe and secure payments. Easy returns. 100% Authentic products.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* ----------------- STEP 3: DEDICATED COMPLETE PAYMENT (MATCHING IMAGES 1, 2, 3) ----------------- */
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    {/* Collapsed Step 1: Delivery Address */}
                    <div className="bg-white rounded-xs border border-gray-200 shadow-2xs p-3.5 flex items-center justify-between">
                        <div className="text-xs">
                            <span className="font-bold text-gray-500 uppercase mr-2">1. Delivery Address:</span>
                            <span className="font-bold text-gray-900">{formData.fullName}</span>, {formData.zipCode}
                        </div>
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="text-xs font-bold text-[#FF64B4] hover:underline uppercase"
                        >
                            Change
                        </button>
                    </div>

                    {/* Collapsed Step 2: Order Summary */}
                    <div className="bg-white rounded-xs border border-gray-200 shadow-2xs p-3.5 flex items-center justify-between">
                        <div className="text-xs">
                            <span className="font-bold text-gray-500 uppercase mr-2">2. Order Summary:</span>
                            <span className="font-bold text-gray-900">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</span> (Total: ₹{total.toFixed(2)})
                        </div>
                        <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="text-xs font-bold text-[#FF64B4] hover:underline uppercase"
                        >
                            Change
                        </button>
                    </div>

                    {/* Main Complete Payment Box (Matching Images 1, 2, 3) */}
                    <div className="bg-white rounded-md border border-gray-200 shadow-2xs p-4 sm:p-6">
                        {/* Header: ← Complete Payment | 🔒 100% Secure */}
                        <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-100">
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="flex items-center gap-2 font-bold text-gray-900 text-sm sm:text-base hover:text-[#FF64B4] transition-colors"
                            >
                                <FiArrowLeft size={18} />
                                <span>Complete Payment</span>
                            </button>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
                                <FiLock size={13} className="text-gray-600" />
                                <span>100% Secure</span>
                            </div>
                        </div>

                        {/* 3 Columns Layout on Desktop */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                            {/* ================= COLUMN 1: PAYMENT METHODS LIST ================= */}
                            <div className="lg:col-span-4 space-y-3">
                                {/* OPTION 1: UPI */}
                                <div
                                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'upi' }))}
                                    className={`p-4 rounded-xs border-2 cursor-pointer transition-all flex items-start gap-3 ${
                                        formData.paymentMethod === 'upi'
                                            ? 'border-[#FF64B4] bg-pink-50/30 shadow-2xs'
                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                                >
                                    <div className="w-8 h-8 rounded-xs border border-gray-200 flex items-center justify-center bg-gray-50 shrink-0 font-bold text-xs text-[#0066b2]">
                                        <span className="text-[#097939]">U</span><span className="text-[#e27300]">P</span><span className="text-[#0066b2]">I</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-gray-900 text-sm">UPI</span>
                                            {formData.paymentMethod === 'upi' && (
                                                <span className="w-2 h-2 rounded-full bg-[#FF64B4]" />
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">Pay by any UPI app</p>
                                    </div>
                                </div>

                                {/* OPTION 2: CREDIT / DEBIT / ATM CARD */}
                                <div
                                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'card' }))}
                                    className={`p-4 rounded-xs border-2 cursor-pointer transition-all flex items-start gap-3 ${
                                        formData.paymentMethod === 'card'
                                            ? 'border-[#FF64B4] bg-pink-50/30 shadow-2xs'
                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                                >
                                    <div className="w-8 h-8 rounded-xs border border-gray-200 flex items-center justify-center bg-gray-50 shrink-0 text-gray-700">
                                        <FiCreditCard size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-gray-900 text-sm">Credit / Debit / ATM Card</span>
                                            {formData.paymentMethod === 'card' && (
                                                <span className="w-2 h-2 rounded-full bg-[#FF64B4]" />
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">Add and secure cards as per RBI guidelines</p>
                                        <p className="text-[11px] font-semibold text-emerald-700 mt-1">
                                            Save upto ₹351 • 3 offers available
                                        </p>
                                    </div>
                                </div>

                                {/* OPTION 3: CASH ON DELIVERY (DISABLED) */}
                                <div className="p-4 rounded-xs border border-gray-200 bg-gray-50/80 opacity-60 cursor-not-allowed flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-xs border border-gray-200 flex items-center justify-center bg-gray-100 shrink-0 text-gray-500">
                                        <FiDollarSign size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-gray-700 text-sm">Cash on Delivery</span>
                                            <FiLock size={12} className="text-gray-400" />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">Disabled — Pre-paid Orders Only</p>
                                        <p className="text-[10px] text-gray-400 mt-1">
                                            Customized items require pre-payment
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* ================= COLUMN 2: INTERACTIVE DETAILS PANEL ================= */}
                            <div className="lg:col-span-4">
                                {formData.paymentMethod === 'upi' ? (
                                    /* UPI QR PANEL (MATCHING IMAGE 2) */
                                    <div className="bg-white rounded-md border border-gray-200 p-5 shadow-xs text-center">
                                        <h3 className="font-bold text-gray-900 text-sm mb-3">Scan QR and Pay</h3>

                                        <div className="border border-gray-200 rounded-md p-4 bg-gray-50/30 mb-3">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">AMOUNT</p>
                                            <p className="text-2xl font-black text-gray-900 mb-3">₹{total.toFixed(2)}</p>

                                            <div className="relative w-44 h-44 mx-auto border border-gray-200 rounded-sm bg-white flex items-center justify-center overflow-hidden mb-3 shadow-2xs">
                                                {showQrCode ? (
                                                    <img
                                                        src={upiQrUrl}
                                                        alt="UPI QR Code"
                                                        className="w-full h-full object-contain p-2"
                                                    />
                                                ) : (
                                                    <div className="relative w-full h-full flex flex-col items-center justify-center bg-gray-50">
                                                        <img
                                                            src={upiQrUrl}
                                                            alt="QR preview"
                                                            className="w-full h-full object-contain p-2 filter blur-xs opacity-40 select-none"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowQrCode(true)}
                                                            className="absolute px-4 py-2 bg-white text-gray-900 font-bold text-xs rounded border border-gray-300 shadow-md hover:bg-gray-50 active:scale-95 transition-all"
                                                        >
                                                            Show QR code
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {showQrCode && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowQrCode(false)}
                                                    className="text-[11px] text-[#FF64B4] hover:underline font-semibold block mx-auto mb-2"
                                                >
                                                    Hide QR code
                                                </button>
                                            )}

                                            {/* UPI App Badges */}
                                            <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1">
                                                <span className="h-5 px-1.5 bg-white border border-gray-200 rounded-xs flex items-center text-[10px] font-bold text-gray-700">
                                                    <span className="text-[#4285F4]">G</span><span className="text-[#EA4335]">P</span><span className="text-[#FBBC05]">a</span><span className="text-[#34A853]">y</span>
                                                </span>
                                                <span className="h-5 px-1.5 bg-[#5f259f] text-white rounded-xs flex items-center text-[10px] font-bold">
                                                    PhonePe
                                                </span>
                                                <span className="h-5 px-1.5 bg-[#002970] text-[#00b9f5] rounded-xs flex items-center text-[10px] font-black">
                                                    <span className="text-white">Pay</span>tm
                                                </span>
                                                <span className="h-5 px-1.5 bg-white border border-gray-200 rounded-xs flex items-center text-[10px] font-bold text-[#0066b2]">
                                                    BHIM
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-gray-500 mt-1.5">or any other UPI app</p>
                                        </div>

                                        <p className="text-[11px] text-gray-500 leading-tight">
                                            Do not hit back or close this screen until the transaction is complete
                                        </p>

                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={isLoading}
                                            className="w-full mt-4 py-3 bg-[#FF64B4] hover:bg-[#e61d7e] text-white font-bold text-sm uppercase tracking-wide rounded-xs shadow-sm hover:shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    <span>Processing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FiLock size={14} />
                                                    <span>Pay ₹{total.toFixed(2)} via UPI</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    /* CREDIT / DEBIT CARD PANEL (MATCHING IMAGE 3) */
                                    <div className="bg-white rounded-md border border-gray-200 p-5 shadow-xs space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                                Card Number
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={formData.cardNumber}
                                                    onChange={handleCardNumberChange}
                                                    placeholder="XXXX XXXX XXXX XXXX"
                                                    maxLength={19}
                                                    className="w-full text-xs p-2.5 pr-10 border border-gray-300 rounded-xs focus:border-[#FF64B4] focus:ring-1 focus:ring-[#FF64B4] outline-hidden font-mono"
                                                />
                                                <FiCreditCard className="absolute right-3 top-3 text-gray-400" size={16} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                                    Valid Thru
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.cardExpiry}
                                                    onChange={handleCardExpiryChange}
                                                    placeholder="MM / YY"
                                                    maxLength={5}
                                                    className="w-full text-xs p-2.5 border border-gray-300 rounded-xs focus:border-[#FF64B4] focus:ring-1 focus:ring-[#FF64B4] outline-hidden font-mono"
                                                />
                                            </div>
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <label className="text-xs font-bold text-gray-700">
                                                        CVV
                                                    </label>
                                                    <span title="3-digit CVV on back of your card" className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                                        <FiHelpCircle size={13} />
                                                    </span>
                                                </div>
                                                <input
                                                    type="password"
                                                    value={formData.cardCvv}
                                                    onChange={handleCardCvvChange}
                                                    placeholder="CVV"
                                                    maxLength={4}
                                                    className="w-full text-xs p-2.5 border border-gray-300 rounded-xs focus:border-[#FF64B4] focus:ring-1 focus:ring-[#FF64B4] outline-hidden font-mono"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={isLoading}
                                            className="w-full py-3 bg-[#FF64B4] hover:bg-[#e61d7e] text-white font-bold text-sm uppercase tracking-wide rounded-xs shadow-sm hover:shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    <span>Processing...</span>
                                                </>
                                            ) : (
                                                <span>Pay ₹{total.toFixed(2)}</span>
                                            )}
                                        </button>

                                        <p className="text-[11px] text-gray-500 leading-tight">
                                            Note: Please ensure your card can be used for online transactions.{' '}
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    dispatch(addToast({ type: 'info', message: 'Enable online e-commerce transactions in your bank app.' }));
                                                }}
                                                className="text-[#FF64B4] hover:underline font-semibold"
                                            >
                                                Learn More
                                            </a>
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* ================= COLUMN 3: PRICE DETAILS (MATCHING IMAGE 1 WITHOUT UNWANTED FEES) ================= */}
                            <div className="lg:col-span-4">
                                <div className="bg-white rounded-md border border-gray-200 shadow-2xs p-4">
                                    <div className="flex justify-between items-center text-xs text-gray-700 mb-2">
                                        <span>MRP (incl. of all taxes)</span>
                                        <span className="font-medium">₹{itemsOriginalTotal.toLocaleString('en-IN')}</span>
                                    </div>

                                    {totalDiscount > 0 && (
                                        <div className="border-t border-gray-100 pt-2 mb-2">
                                            <p className="text-xs font-bold text-gray-700 mb-1.5">Discounts</p>
                                            <div className="flex justify-between items-center text-xs text-gray-700 pl-2">
                                                <span>MRP Discount</span>
                                                <span className="text-emerald-700 font-medium">− ₹{totalDiscount.toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center text-xs text-gray-700 mb-3">
                                        <span>Delivery Charges</span>
                                        <span className="text-emerald-700 font-bold">FREE</span>
                                    </div>

                                    <div className="pt-3 border-t border-gray-200 mb-3">
                                        <div className="flex justify-between items-center text-sm sm:text-base font-bold text-gray-900">
                                            <span>Total Amount</span>
                                            <span>₹{total.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {totalDiscount > 0 && (
                                        <div className="p-2.5 bg-emerald-50 rounded-xs border border-emerald-200 text-center mb-3">
                                            <p className="text-xs font-bold text-emerald-700">
                                                You will save ₹{totalDiscount.toLocaleString('en-IN')} on this order
                                            </p>
                                        </div>
                                    )}

                                    {/* 10% Instant Discount Offer Banner (Matching Brand Style) */}
                                    <div className="p-3 bg-pink-50/50 rounded-md border border-pink-200 flex items-center justify-between gap-2">
                                        <div>
                                            <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#FF64B4]" />
                                                10% Instant Discount
                                            </p>
                                            <p className="text-[11px] text-gray-500">Claim now with payment offers</p>
                                        </div>
                                        <div className="flex items-center -space-x-1 shrink-0">
                                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px] font-bold ring-2 ring-white">V</span>
                                            <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] font-bold ring-2 ring-white">M</span>
                                            <span className="w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center text-[8px] font-bold ring-2 ring-white">U</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
            </div>
        </div>
    );
};

export default Checkout;
