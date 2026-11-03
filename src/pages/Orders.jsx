import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { FiPackage, FiEye, FiCheckCircle, FiClock, FiTruck, FiChevronRight } from 'react-icons/fi';
import { useGetMyOrdersQuery } from '../store/api/ordersApi';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import placeholderImg from '../assets/images/PNG.png';
import Loader from '../components/common/Loader';
import BackButton from '../components/common/BackButton';

const Orders = () => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const { data: ordersData, isLoading } = useGetMyOrdersQuery(undefined, {
        skip: !isAuthenticated,
    });

    const orders = ordersData?.data || [];

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-amber-50 text-amber-800 border-amber-200',
            processing: 'bg-blue-50 text-blue-800 border-blue-200',
            shipped: 'bg-purple-50 text-purple-800 border-purple-200',
            delivered: 'bg-emerald-50 text-emerald-800 border-emerald-200',
            cancelled: 'bg-rose-50 text-rose-800 border-rose-200',
        };
        return colors[status?.toLowerCase()] || colors.pending;
    };

    const getStatusDotColor = (status) => {
        const dots = {
            pending: 'bg-amber-500',
            processing: 'bg-blue-500',
            shipped: 'bg-purple-500',
            delivered: 'bg-emerald-500',
            cancelled: 'bg-rose-500',
        };
        return dots[status?.toLowerCase()] || dots.pending;
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen pt-28 pb-16 bg-[#fafcff] flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-md border border-gray-200 shadow-2xs p-8 max-w-md w-full text-center"
                >
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-pink-50 flex items-center justify-center text-[#FF64B4]">
                        <FiPackage size={36} />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Sign in to view your orders</h1>
                    <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                        Track your purchases, view order history, and access delivery details.
                    </p>
                    <Link
                        to="/auth"
                        className="inline-block w-full py-2.5 bg-[#FF64B4] hover:bg-[#e61d7e] text-white text-xs font-bold rounded-xs shadow-sm hover:shadow-md transition-colors"
                    >
                        Sign In
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (isLoading) {
        return <Loader fullScreen text="Loading your orders..." />;
    }

    if (orders.length === 0) {
        return (
            <div className="min-h-screen pt-44 md:pt-32 pb-16 bg-[#fafcff]">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3 mb-6">
                        <BackButton />
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Link to="/" className="hover:text-[#FF64B4]">Home</Link>
                            <FiChevronRight size={10} />
                            <span className="text-gray-900 font-medium">My Orders</span>
                        </div>
                    </div>
                    <div className="bg-white rounded-md border border-gray-200 shadow-2xs p-10 text-center max-w-lg mx-auto">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                            <FiPackage size={36} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No orders placed yet</h2>
                        <p className="text-xs text-gray-500 mb-6">
                            Explore our collection of handcrafted gifts and find something special!
                        </p>
                        <Link
                            to="/products"
                            className="inline-block px-6 py-2.5 bg-[#FF64B4] hover:bg-[#e61d7e] text-white text-xs font-bold rounded-xs shadow-sm hover:shadow-md transition-colors"
                        >
                            Start Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-44 md:pt-32 pb-16 bg-[#fafcff] text-gray-900">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumbs with BackButton */}
                <div className="flex items-center gap-3 mb-4">
                    <BackButton />
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Link to="/" className="hover:text-[#FF64B4]">Home</Link>
                        <FiChevronRight size={10} />
                        <span className="text-gray-900 font-medium">My Orders</span>
                    </div>
                </div>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">My Orders</h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                            {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
                        </p>
                    </div>
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF64B4] hover:underline"
                    >
                        Continue Shopping →
                    </Link>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {orders.map((order, index) => {
                        const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                        });

                        return (
                            <motion.div
                                key={order._id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-md border border-gray-200 shadow-2xs overflow-hidden hover:border-gray-300 transition-all"
                            >
                                {/* Order Header Strip */}
                                <div className="bg-gray-50 px-4 sm:px-6 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                                    <div className="flex flex-wrap items-center gap-6 sm:gap-8">
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">ORDER PLACED</span>
                                            <span className="font-semibold text-gray-900">{formattedDate}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">TOTAL</span>
                                            <span className="font-bold text-gray-900 text-sm">
                                                ₹{order.totalPrice?.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="hidden sm:block">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">SHIP TO</span>
                                            <span className="font-medium text-gray-800">
                                                {order.shippingAddress?.fullName || 'Customer'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">ORDER #</span>
                                            <span className="font-mono text-xs font-bold text-gray-900">
                                                {order.orderNumber || order._id?.slice(-8)}
                                            </span>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(order.status)}`} />
                                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                                        </span>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="p-4 sm:p-6 divide-y divide-gray-100">
                                    {order.orderItems?.map((item, itemIdx) => {
                                        const imgUrl = item.image?.startsWith('http')
                                            ? item.image
                                            : (item.image ? `http://localhost:5000${item.image}` : placeholderImg);
                                        const productId = item.product?._id || item.product;
                                        const itemTotal = (item.price || (order.totalPrice / (item.quantity || 1))) * (item.quantity || 1);

                                        return (
                                            <div
                                                key={item._id || itemIdx}
                                                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${itemIdx > 0 ? 'pt-4' : ''}`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <img
                                                        src={imgUrl}
                                                        alt={item.name}
                                                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-md object-cover border border-gray-200 bg-gray-50 shrink-0"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = placeholderImg;
                                                        }}
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        {productId ? (
                                                            <Link
                                                                to={`/products/${productId}`}
                                                                className="text-sm sm:text-base font-semibold text-gray-900 hover:text-[#FF64B4] line-clamp-2 transition-colors"
                                                            >
                                                                {item.name}
                                                            </Link>
                                                        ) : (
                                                            <p className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2">
                                                                {item.name}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                                            <span>Qty: <strong className="text-gray-800">{item.quantity}</strong></span>
                                                            {item.size && <span>• Size: {item.size}</span>}
                                                        </div>
                                                        <p className="text-sm sm:text-base font-bold text-gray-900 mt-1.5">
                                                            ₹{itemTotal.toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Delivery / Status Note */}
                                                <div className="sm:text-right shrink-0">
                                                    {order.status?.toLowerCase() === 'delivered' ? (
                                                        <div className="flex items-center sm:justify-end gap-1.5 text-xs font-semibold text-emerald-700">
                                                            <FiCheckCircle size={14} className="text-emerald-600" />
                                                            <span>Delivered</span>
                                                        </div>
                                                    ) : order.status?.toLowerCase() === 'shipped' ? (
                                                        <div className="flex items-center sm:justify-end gap-1.5 text-xs font-semibold text-blue-700">
                                                            <FiTruck size={14} className="text-blue-600" />
                                                            <span>Package in transit</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center sm:justify-end gap-1.5 text-xs font-semibold text-amber-700">
                                                            <FiClock size={14} className="text-amber-500 animate-pulse" />
                                                            <span>Order Confirmed</span>
                                                        </div>
                                                    )}
                                                    <p className="text-[11px] text-gray-500 mt-0.5 capitalize">
                                                        {order.paymentMethod ? `${order.paymentMethod} Payment` : 'Prepaid'}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Order Action Strip */}
                                <div className="bg-gray-50/70 px-4 sm:px-6 py-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>Need help with this order?</span>
                                        <Link to="/contact" className="text-[#FF64B4] hover:underline font-semibold">
                                            Contact Support
                                        </Link>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Link
                                            to={`/order-success/${order._id}`}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF64B4] hover:bg-[#e61d7e] text-white text-xs font-bold rounded-xs shadow-sm hover:shadow-md transition-colors"
                                        >
                                            <FiEye size={13} />
                                            <span>View Details</span>
                                        </Link>
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

export default Orders;
