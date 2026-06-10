import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPackage, FiMapPin, FiUser, FiCreditCard, FiCalendar, FiTruck, FiBox, FiClock } from 'react-icons/fi';

const OrderDetailsModal = ({ isOpen, onClose, order }) => {
    const [activeTab, setActiveTab] = useState('items');

    if (!isOpen || !order) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const tabs = [
        { id: 'items', label: 'Order Items', icon: <FiBox /> },
        { id: 'timeline', label: 'Timeline', icon: <FiClock /> },
        { id: 'customer', label: 'Customer', icon: <FiUser /> },
        { id: 'shipping', label: 'Shipping', icon: <FiTruck /> },
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-2xl bg-white rounded-2xl shadow-gold overflow-hidden flex flex-col h-[600px]"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10 shrink-0">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Order #{order._id.slice(-6)}</h2>
                            <p className="text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                {order.status}
                            </span>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
                            >
                                <FiX size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-100 shrink-0 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-primary-500 text-primary-600 bg-primary-50/50'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {activeTab === 'items' && (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    {order.orderItems?.map((item, index) => (
                                        <div key={index} className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-primary-100 transition-colors bg-white shadow-sm">
                                            <div className="w-20 h-20 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden shrink-0">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                                                <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity || item.qty}</p>
                                                <p className="font-bold text-primary-600 mt-2">${item.price?.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Payment Summary in Items Tab */}
                                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm border border-gray-100">
                                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                        <FiCreditCard /> Payment Summary
                                    </h4>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>${order.itemsPrice?.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Shipping</span>
                                        <span>${order.shippingPrice?.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Tax</span>
                                        <span>${order.taxPrice?.toFixed(2)}</span>
                                    </div>
                                    <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-lg text-gray-900">
                                        <span>Total</span>
                                        <span>${order.totalPrice?.toFixed(2)}</span>
                                    </div>
                                    <div className="pt-2 mt-2 border-t border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500">Method</span>
                                            <span className="uppercase font-medium">{order.paymentMethod}</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-gray-500">Status</span>
                                            <span className={`font-medium ${order.isPaid ? 'text-green-600' : 'text-orange-500'}`}>
                                                {order.isPaid ? 'Paid' : 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'timeline' && (
                            <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                                <div className="relative">
                                    <div className="absolute -left-[29px] top-1 w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center ring-4 ring-white">
                                        <FiBox size={14} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Order Placed</p>
                                        <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                                    </div>
                                </div>

                                {order.isPaid && (
                                    <div className="relative">
                                        <div className="absolute -left-[29px] top-1 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center ring-4 ring-white">
                                            <FiCreditCard size={14} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Payment Confirmed</p>
                                            <p className="text-sm text-gray-500">{formatDate(order.paidAt)}</p>
                                        </div>
                                    </div>
                                )}

                                {order.isDelivered && (
                                    <div className="relative">
                                        <div className="absolute -left-[29px] top-1 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center ring-4 ring-white">
                                            <FiTruck size={14} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Delivered</p>
                                            <p className="text-sm text-gray-500">{formatDate(order.deliveredAt)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'customer' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xl font-bold">
                                        {order.user?.name?.charAt(0) || 'G'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">{order.user?.name || 'Guest User'}</h3>
                                        <p className="text-gray-500">Customer</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl border border-gray-100">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Email Address</p>
                                        <p className="font-medium text-gray-900">{order.user?.email || order.shippingAddress?.email || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 rounded-xl border border-gray-100">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Phone Number</p>
                                        <p className="font-medium text-gray-900">{order.user?.countryCode} {order.user?.phone || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 rounded-xl border border-gray-100">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">User ID</p>
                                        <p className="font-medium text-gray-900 text-sm font-mono">{order.user?._id || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 rounded-xl border border-gray-100">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Joined Date</p>
                                        <p className="font-medium text-gray-900">{order.user?.createdAt ? new Date(order.user.createdAt).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'shipping' && (
                            <div className="space-y-6">
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600 shrink-0">
                                        <FiMapPin size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Shipping Address</h3>
                                        <p className="text-sm text-blue-600/80 mt-1">This is where the package will be delivered.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="p-4 rounded-xl border border-gray-100">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Recipient Name</p>
                                        <p className="font-medium text-gray-900">{order.shippingAddress?.fullName || order.user?.name}</p>
                                    </div>
                                    <div className="p-4 rounded-xl border border-gray-100">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Address Line 1</p>
                                        <p className="font-medium text-gray-900">{order.shippingAddress?.address}</p>
                                    </div>
                                    <div className="p-4 rounded-xl border border-gray-100">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Address Line 2 (Street)</p>
                                        <p className="font-medium text-gray-900">{order.shippingAddress?.street || '-'}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl border border-gray-100">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">City</p>
                                            <p className="font-medium text-gray-900">{order.shippingAddress?.city}</p>
                                        </div>
                                        <div className="p-4 rounded-xl border border-gray-100">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">State</p>
                                            <p className="font-medium text-gray-900">{order.shippingAddress?.state}</p>
                                        </div>
                                        <div className="p-4 rounded-xl border border-gray-100">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Zip Code</p>
                                            <p className="font-medium text-gray-900">{order.shippingAddress?.zipCode || order.shippingAddress?.postalCode}</p>
                                        </div>
                                        <div className="p-4 rounded-xl border border-gray-100">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Country</p>
                                            <p className="font-medium text-gray-900">{order.shippingAddress?.country}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default OrderDetailsModal;
