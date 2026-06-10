import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { FiCheck, FiTruck, FiCreditCard, FiShield } from 'react-icons/fi';
import { selectCartItems, selectCartTotal, clearCart } from '../store/slices/cartSlice';
import { selectCurrentUser, selectIsAuthenticated } from '../store/slices/authSlice';
import {
    useCreateOrderMutation,
    useCreateRazorpayOrderMutation,
    useVerifyRazorpayPaymentMutation
} from '../store/api/ordersApi';
import { addToast } from '../store/slices/uiSlice';
import Button from '../components/common/Button';
import BackButton from '../components/common/BackButton';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Input from '../components/common/Input';

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
    const [createRazorpayOrder, { isLoading: isCreatingRazorpay }] = useCreateRazorpayOrderMutation();
    const [verifyRazorpayPayment, { isLoading: isVerifying }] = useVerifyRazorpayPaymentMutation();

    const isLoading = isCreatingOrder || isCreatingRazorpay || isVerifying;

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        // Shipping
        firstName: user?.name?.split(' ')[0] || '',
        lastName: user?.name?.split(' ').slice(1).join(' ') || '',
        email: user?.email || '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        // Payment
        paymentMethod: 'card',
    });

    const taxRate = 0.1;
    const shippingCost = cartTotal > 100 ? 0 : 10;
    const tax = cartTotal * taxRate;
    const total = cartTotal + tax + shippingCost;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleRazorpayPayment = async (orderId) => {
        const res = await loadRazorpayScript();
        if (!res) {
            dispatch(addToast({ type: 'error', message: 'Razorpay UI failed to load' }));
            return;
        }

        try {
            // Get Razorpay Order ID from backend
            const razorpayOrder = await createRazorpayOrder(orderId).unwrap();

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: 'Glitz Creativez',
                description: 'Order Payment',
                order_id: razorpayOrder.id,
                prefill: {
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    contact: formData.phone,
                },
                handler: async function (response) {
                    try {
                        await verifyRazorpayPayment({
                            id: orderId,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        }).unwrap();

                        dispatch(clearCart());
                        dispatch(addToast({ type: 'success', message: 'Payment successful! Order placed.' }));
                        navigate(`/order-success/${orderId}`);
                    } catch (err) {
                        dispatch(addToast({ type: 'error', message: 'Payment verification failed' }));
                        navigate(`/orders`);
                    }
                },
                theme: { color: '#f59e0b' },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                dispatch(addToast({ type: 'error', message: 'Payment failed! Order created as pending.' }));
                navigate(`/orders`);
            });
            rzp.open();

        } catch (error) {
            dispatch(addToast({ type: 'error', message: 'Failed to initialize payment' }));
        }
    };

    const handleSubmit = async () => {
        try {
            const orderData = {
                orderItems: cartItems.map(item => ({
                    product: item.product._id,
                    name: item.product.name,
                    image: item.product.images?.[0],
                    price: item.product.price,
                    quantity: item.quantity,
                })),
                shippingAddress: {
                    fullName: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    phone: formData.phone,
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    country: formData.country,
                },
                paymentMethod: formData.paymentMethod,
                itemsPrice: cartTotal,
                taxPrice: tax,
                shippingPrice: shippingCost,
                totalPrice: total,
            };

            const result = await createOrder(orderData).unwrap();

            if (formData.paymentMethod === 'razorpay') {
                // Initialize Razorpay UI
                await handleRazorpayPayment(result.data._id);
            } else {
                dispatch(clearCart());
                dispatch(addToast({
                    type: 'success',
                    message: 'Order placed successfully!',
                }));
                navigate(`/order-success/${result.data._id}`);
            }

        } catch (error) {
            dispatch(addToast({
                type: 'error',
                message: error?.data?.message || 'Failed to place order',
            }));
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center bg-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
                    <Button onClick={() => navigate('/products')}>
                        Continue Shopping
                    </Button>
                </div>
            </div>
        );
    }

    const steps = [
        { id: 1, name: 'Shipping', icon: <FiTruck /> },
        { id: 2, name: 'Payment', icon: <FiCreditCard /> },
        { id: 3, name: 'Review', icon: <FiShield /> },
    ];

    return (
        <div className="min-h-screen pt-24 pb-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="hidden sm:block mb-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <Breadcrumbs items={[{ label: 'Checkout' }]} />
                    </div>
                </div>
                {/* Progress Steps */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="flex items-center justify-center">
                        {steps.map((s, index) => (
                            <div key={s.id} className="flex items-center">
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${step >= s.id
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-gray-100 text-gray-400'
                                    }`}>
                                    {step > s.id ? <FiCheck /> : s.icon}
                                    <span className="hidden sm:inline font-medium">{s.name}</span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`w-12 sm:w-24 h-0.5 mx-2 ${step > s.id ? 'bg-primary-500' : 'bg-gray-200'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Step 1: Shipping */}
                        {step === 1 && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white rounded-2xl border border-gray-100 shadow-card p-8"
                            >
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Information</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        label="First Name"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="John"
                                    />
                                    <Input
                                        label="Last Name"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Doe"
                                    />
                                    <Input
                                        label="Email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                    />
                                    <Input
                                        label="Phone"
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+1 (234) 567-890"
                                    />
                                    <div className="sm:col-span-2">
                                        <Input
                                            label="Street Address"
                                            name="street"
                                            value={formData.street}
                                            onChange={handleChange}
                                            placeholder="123 Main Street"
                                        />
                                    </div>
                                    <Input
                                        label="City"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="New York"
                                    />
                                    <Input
                                        label="State"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        placeholder="NY"
                                    />
                                    <Input
                                        label="ZIP Code"
                                        name="zipCode"
                                        value={formData.zipCode}
                                        onChange={handleChange}
                                        placeholder="10001"
                                    />
                                    <Input
                                        label="Country"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        placeholder="United States"
                                    />
                                </div>
                                <div className="mt-8 flex justify-end">
                                    <Button size="lg" onClick={() => setStep(2)}>
                                        Continue to Payment
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Payment */}
                        {step === 2 && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white rounded-2xl border border-gray-100 shadow-card p-8"
                            >
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>
                                <div className="space-y-4">
                                    {[
                                        { id: 'card', label: 'Credit/Debit Card', icon: '💳' },
                                        { id: 'razorpay', label: 'Razorpay', icon: '💳' },
                                        { id: 'cod', label: 'Cash on Delivery', icon: '💵' },
                                    ].map(method => (
                                        <label
                                            key={method.id}
                                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMethod === method.id
                                                ? 'border-primary-500 bg-primary-50'
                                                : 'border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value={method.id}
                                                checked={formData.paymentMethod === method.id}
                                                onChange={handleChange}
                                                className="sr-only"
                                            />
                                            <span className="text-2xl">{method.icon}</span>
                                            <span className="text-gray-900 font-medium">{method.label}</span>
                                            {formData.paymentMethod === method.id && (
                                                <FiCheck className="ml-auto text-primary-500" size={24} />
                                            )}
                                        </label>
                                    ))}
                                </div>
                                <div className="mt-8 flex justify-between">
                                    <Button variant="ghost" onClick={() => setStep(1)}>
                                        Back
                                    </Button>
                                    <Button size="lg" onClick={() => setStep(3)}>
                                        Review Order
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Review */}
                        {step === 3 && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                {/* Order Items */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Order</h2>
                                    <div className="space-y-4">
                                        {cartItems.map(item => (
                                            <div key={item.product._id} className="flex gap-4 p-4 rounded-xl bg-gray-50">
                                                <img
                                                    src={item.product.images?.[0]?.startsWith('http') ? item.product.images[0] : (item.product.images?.[0] ? `http://localhost:5000${item.product.images[0]}` : placeholderImg)}
                                                    alt={item.product.name}
                                                    className="w-16 h-16 rounded-lg object-cover"
                                                />
                                                <div className="flex-1">
                                                    <h3 className="text-gray-900 font-medium">{item.product.name}</h3>
                                                    <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                                                </div>
                                                <span className="text-gray-900 font-semibold">
                                                    ₹{(item.product.price * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Shipping & Payment Summary */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                                        <h3 className="text-gray-900 font-semibold mb-3">Shipping Address</h3>
                                        <p className="text-gray-600 text-sm">
                                            {formData.firstName} {formData.lastName}<br />
                                            {formData.street}<br />
                                            {formData.city}, {formData.state} {formData.zipCode}<br />
                                            {formData.country}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                                        <h3 className="text-gray-900 font-semibold mb-3">Payment Method</h3>
                                        <p className="text-gray-600">
                                            {formData.paymentMethod === 'card' && '💳 Credit/Debit Card'}
                                            {formData.paymentMethod === 'razorpay' && '💳 Razorpay'}
                                            {formData.paymentMethod === 'cod' && '💵 Cash on Delivery'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-between">
                                    <Button variant="ghost" onClick={() => setStep(2)}>
                                        Back
                                    </Button>
                                    <Button size="lg" onClick={handleSubmit} isLoading={isLoading}>
                                        Place Order
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 sticky top-28">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal ({cartItems.length} items)</span>
                                    <span>₹{cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className={shippingCost === 0 ? 'text-green-600' : ''}>
                                        {shippingCost === 0 ? 'Free' : `₹${shippingCost.toFixed(2)}`}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax</span>
                                    <span>₹{tax.toFixed(2)}</span>
                                </div>
                                <div className="pt-4 border-t border-gray-200">
                                    <div className="flex justify-between text-xl font-bold text-gray-900">
                                        <span>Total</span>
                                        <span>₹{total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                                <p className="text-sm text-green-700 flex items-center gap-2">
                                    <FiShield />
                                    Secure checkout powered by SSL encryption
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
