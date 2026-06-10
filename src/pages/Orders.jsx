import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { FiPackage, FiEye } from 'react-icons/fi';
import { useGetMyOrdersQuery } from '../store/api/ordersApi';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import Button from '../components/common/Button';
import BackButton from '../components/common/BackButton';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Loader from '../components/common/Loader';

const Orders = () => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const { data: ordersData, isLoading } = useGetMyOrdersQuery(undefined, {
        skip: !isAuthenticated,
    });

    const orders = ordersData?.data || [];

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            processing: 'bg-blue-100 text-blue-800 border-blue-200',
            shipped: 'bg-purple-100 text-purple-800 border-purple-200',
            delivered: 'bg-green-100 text-green-800 border-green-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200',
        };
        return colors[status] || colors.pending;
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-[calc(100vh-100px)] pt-20 flex items-center justify-center bg-white">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center px-4"
                >
                    <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <FiPackage size={40} className="text-gray-400" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Sign in to view your orders</h1>
                    <p className="text-gray-500 mb-6 sm:mb-8">Track your purchases and order history</p>
                    <Link to="/auth">
                        <Button size="lg">Sign In</Button>
                    </Link>
                </motion.div>
            </div>
        );
    }


    if (orders.length === 0) {
        return (
            <div className="min-h-[calc(100vh-100px)] pt-20 flex items-center justify-center bg-white">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center px-4"
                >
                    <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <FiPackage size={40} className="text-gray-400" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">No orders yet</h1>
                    <p className="text-gray-500 mb-6 sm:mb-8">Start shopping to see your orders here</p>
                    <Link to="/products">
                        <Button size="lg">Start Shopping</Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-100px)] pt-20 sm:pt-24 pb-20 sm:pb-16 bg-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="hidden sm:flex items-center gap-4 mb-6">
                        <BackButton to="/products" />
                        <Breadcrumbs items={[{ label: 'Orders' }]} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
                    <p className="text-gray-500">{orders.length} orders placed</p>
                </motion.div>

                {/* Orders List */}
                <div className="space-y-4">
                    {orders.map((order, index) => (
                        <motion.div
                            key={order._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 hover:shadow-soft-lg hover:border-gray-200 transition-all duration-300"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-200">
                                <div>
                                    <p className="text-sm text-gray-500">Order Number</p>
                                    <p className="text-lg font-bold text-gray-900">{order.orderNumber || order._id?.slice(-8)}</p>
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
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                                    </span>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="flex flex-wrap gap-4 mb-4">
                                {order.orderItems?.slice(0, 3).map((item) => (
                                    <div key={item._id} className="flex items-center gap-3">
                                        <img
                                            src={item.image?.startsWith('http') ? item.image : (item.image ? `http://localhost:5000${item.image}` : placeholderImg)}
                                            alt={item.name}
                                            className="w-12 h-12 rounded-lg object-cover"
                                            onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                                        />
                                        <div>
                                            <p className="text-gray-900 text-sm line-clamp-1">{item.name}</p>
                                            <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                                {order.orderItems?.length > 3 && (
                                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 text-gray-500 text-sm font-medium">
                                        +{order.orderItems.length - 3}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <div>
                                    <p className="text-sm text-gray-500">Total</p>
                                    <p className="text-2xl font-bold gradient-text">₹{order.totalPrice?.toFixed(2)}</p>
                                </div>
                                <Link to={`/order-success/${order._id}`}>
                                    <Button variant="secondary" size="sm" icon={<FiEye />}>
                                        View Details
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Orders;
