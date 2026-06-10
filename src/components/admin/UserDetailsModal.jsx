import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiMapPin, FiShoppingBag, FiClock, FiMail, FiPhone, FiCalendar, FiShield } from 'react-icons/fi';

const UserDetailsModal = ({ isOpen, onClose, user, orders = [] }) => {
    const [activeTab, setActiveTab] = useState('profile');

    if (!isOpen || !user) return null;

    // Filter orders for this user
    const userOrders = orders.filter(order => order.user?._id === user._id || order.user === user._id);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: <FiUser /> },
        { id: 'orders', label: `Orders (${userOrders.length})`, icon: <FiShoppingBag /> },
        { id: 'addresses', label: 'Addresses', icon: <FiMapPin /> },
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
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xl">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                                <p className="text-sm text-gray-500">Customer ID: {user._id.slice(-6)}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
                        >
                            <FiX size={24} />
                        </button>
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
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                                        <div className="flex items-center gap-3 mb-2 text-gray-500">
                                            <FiMail className="shrink-0" />
                                            <span className="text-xs uppercase font-bold tracking-wider">Email</span>
                                        </div>
                                        <p className="font-medium text-gray-900 truncate" title={user.email}>{user.email}</p>
                                    </div>
                                    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                                        <div className="flex items-center gap-3 mb-2 text-gray-500">
                                            <FiPhone className="shrink-0" />
                                            <span className="text-xs uppercase font-bold tracking-wider">Phone</span>
                                        </div>
                                        <p className="font-medium text-gray-900">
                                            {user.countryCode} {user.phone || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                                        <div className="flex items-center gap-3 mb-2 text-gray-500">
                                            <FiCalendar className="shrink-0" />
                                            <span className="text-xs uppercase font-bold tracking-wider">Joined</span>
                                        </div>
                                        <p className="font-medium text-gray-900">{formatDate(user.createdAt)}</p>
                                    </div>
                                    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                                        <div className="flex items-center gap-3 mb-2 text-gray-500">
                                            <FiShield className="shrink-0" />
                                            <span className="text-xs uppercase font-bold tracking-wider">Role</span>
                                        </div>
                                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {user.isAdmin ? 'Admin' : 'Customer'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className="space-y-4">
                                {userOrders.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <FiShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
                                        <p>No orders found for this user</p>
                                    </div>
                                ) : (
                                    userOrders.map((order) => (
                                        <div key={order._id} className="p-4 rounded-xl border border-gray-100 hover:border-primary-100 transition-colors bg-white">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="font-bold text-gray-900">Order #{order._id.slice(-6)}</p>
                                                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                                                </div>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">{order.orderItems?.length || 0} items</span>
                                                <span className="font-bold text-gray-900">${order.totalPrice?.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'addresses' && (
                            <div className="space-y-4">
                                {user.address && (user.address.street || user.address.city) ? (
                                    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                                        <div className="flex items-start gap-3">
                                            <FiMapPin className="mt-1 text-gray-400" />
                                            <div>
                                                <p className="font-medium text-gray-900 mb-1">Saved Address</p>
                                                <p className="text-sm text-gray-600">
                                                    {user.address.street || ''}<br />
                                                    {user.address.city || ''}{user.address.city && user.address.state ? ', ' : ''}{user.address.state || ''} {user.address.zipCode || ''}<br />
                                                    {user.address.country || ''}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : userOrders.length > 0 && userOrders[0].shippingAddress ? (
                                    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                                        <div className="flex items-start gap-3">
                                            <FiMapPin className="mt-1 text-gray-400" />
                                            <div>
                                                <p className="font-medium text-gray-900 mb-1">Latest Shipping Address (from Orders)</p>
                                                <p className="text-sm text-gray-600">
                                                    {userOrders[0].shippingAddress.address}<br />
                                                    {userOrders[0].shippingAddress.city}, {userOrders[0].shippingAddress.state} {userOrders[0].shippingAddress.postalCode}<br />
                                                    {userOrders[0].shippingAddress.country}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <FiMapPin size={48} className="mx-auto mb-4 text-gray-300" />
                                        <p>No address info available</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default UserDetailsModal;
