import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { FiCheck, FiPackage, FiTruck, FiHome, FiShoppingBag } from 'react-icons/fi';
import { useGetOrderByIdQuery } from '../store/api/ordersApi';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import BackButton from '../components/common/BackButton';
import Breadcrumbs from '../components/common/Breadcrumbs';

const OrderSuccess = () => {
    const { orderId } = useParams();
    const [showConfetti, setShowConfetti] = useState(true);
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const { data: orderData, isLoading } = useGetOrderByIdQuery(orderId);
    const order = orderData?.data;

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);

        // Stop confetti after 5 seconds
        const timer = setTimeout(() => setShowConfetti(false), 5000);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timer);
        };
    }, []);

    if (isLoading) {
        return <Loader fullScreen text="Loading order details..." />;
    }

    if (!order) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h1>
                    <Link to="/products">
                        <Button>Continue Shopping</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-16 bg-white">
            {/* Confetti */}
            {showConfetti && (
                <Confetti
                    width={windowSize.width}
                    height={windowSize.height}
                    recycle={false}
                    numberOfPieces={500}
                    colors={['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b']}
                />
            )}

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <Breadcrumbs items={[{ label: 'Order Confirmed' }]} />
                    </div>
                </div>

                {/* Success Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                    className="text-center mb-8"
                >
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-200">
                        <FiCheck size={48} className="text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        Order Placed Successfully!
                    </h1>
                    <p className="text-gray-600">
                        Thank you for your purchase. We&apos;ve sent a confirmation to your email.
                    </p>
                </motion.div>

                {/* Order Details Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-card p-8 mb-6"
                >
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
                        <div>
                            <p className="text-sm text-gray-500">Order Number</p>
                            <p className="text-2xl font-bold text-gray-900">
                                #{order.orderNumber || order._id?.slice(-8)}
                            </p>
                        </div>
                        <div className={`px-4 py-2 rounded-full text-sm font-medium ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                    'bg-gray-100 text-gray-800'
                            }`}>
                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                        <div>
                            <p className="text-sm text-gray-500">Order Date</p>
                            <p className="text-gray-900 font-medium">
                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Payment Method</p>
                            <p className="text-gray-900 font-medium capitalize">{order.paymentMethod}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Amount</p>
                            <p className="text-gray-900 font-bold text-xl">₹{order.totalPrice?.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Payment Status</p>
                            <p className={`font-medium ${order.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                                {order.isPaid ? 'Paid' : 'Pending'}
                            </p>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-gray-900 font-semibold mb-4">Order Items</h3>
                        <div className="space-y-4">
                            {order.orderItems?.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-gray-50"
                                >
                                    <img
                                        src={item.image?.startsWith('http') ? item.image : (item.image ? `http://localhost:5000${item.image}` : `http://localhost:5000/placeholderImg.png`)} // Safe fallback
                                        alt={item.name}
                                        className="w-16 h-16 rounded-lg object-cover"
                                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/150"; }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-gray-900 font-medium truncate">{item.name}</h4>
                                        <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                                    </div>
                                    <span className="text-gray-900 font-semibold">
                                        ₹{(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Timeline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-card p-8 mb-6"
                >
                    <h3 className="text-gray-900 font-semibold mb-6">Order Timeline</h3>
                    <div className="flex items-center justify-between">
                        {[
                            { icon: <FiPackage />, label: 'Order Placed', active: true },
                            { icon: <FiCheck />, label: 'Confirmed', active: order.status !== 'pending' },
                            { icon: <FiTruck />, label: 'Shipped', active: order.status === 'shipped' || order.status === 'delivered' },
                            { icon: <FiHome />, label: 'Delivered', active: order.status === 'delivered' },
                        ].map((step, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step.active
                                    ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white'
                                    : 'bg-gray-100 text-gray-400'
                                    }`}>
                                    {step.icon}
                                </div>
                                <span className={`text-sm mt-2 ${step.active ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {step.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    <Link to="/orders" className="flex-1">
                        <Button variant="secondary" fullWidth icon={<FiPackage />}>
                            View All Orders
                        </Button>
                    </Link>
                    <Link to="/products" className="flex-1">
                        <Button fullWidth icon={<FiShoppingBag />}>
                            Continue Shopping
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default OrderSuccess;
