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
                    className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[600px] border border-gray-100"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-[#FF64B4] font-bold text-xl">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Customer ID: {user._id.slice(-6)}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-100 shrink-0 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-[#FF64B4] text-[#FF64B4] bg-pink-50/50'
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
                                            {user.phone || user.address?.phone || userOrders[0]?.shippingAddress?.phone || 'N/A'}
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
                                        <div key={order._id} className="p-4 rounded-xl border border-gray-100 hover:border-pink-200 transition-colors bg-white">
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
                                                <span className="font-bold text-gray-900">₹{order.totalPrice?.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'addresses' && (
                            <div className="space-y-4">
                                {user.address && (user.address.street || user.address.city || user.address.state || user.address.houseNo) ? (
                                    <div className="p-5 rounded-2xl border border-primary-100 bg-white shadow-sm">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#FF64B4] flex items-center justify-center shrink-0">
                                                <FiMapPin size={20} />
                                            </div>
                                            <div className="space-y-1.5 flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-bold text-gray-900 text-sm">{user.address.fullName || user.name}</p>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        Saved Profile Address
                                                    </span>
                                                </div>
                                                {user.address.phone && (
                                                    <p className="text-xs text-gray-500 font-mono">📞 {user.address.phone}</p>
                                                )}
                                                <div className="text-xs text-gray-700 leading-relaxed pt-1 border-t border-gray-100">
                                                    {user.address.houseNo && <p><span className="font-semibold text-gray-500">House/Building:</span> {user.address.houseNo}</p>}
                                                    {user.address.roadArea && <p><span className="font-semibold text-gray-500">Road/Colony:</span> {user.address.roadArea}</p>}
                                                    {user.address.street && !user.address.houseNo && <p>{user.address.street}</p>}
                                                    <p className="font-semibold text-gray-900 mt-1">
                                                        {user.address.district || user.address.city ? `${user.address.district || user.address.city}, ` : ''}
                                                        {user.address.state || ''} {user.address.zipCode ? `— ${user.address.zipCode}` : ''}
                                                    </p>
                                                    <p className="text-gray-500">{user.address.country || 'India'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : userOrders.length > 0 && userOrders[0].shippingAddress ? (
                                    <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50/70">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gray-200 text-gray-600 flex items-center justify-center shrink-0">
                                                <FiMapPin size={20} />
                                            </div>
                                            <div className="space-y-1.5 flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-bold text-gray-900 text-sm">
                                                        {userOrders[0].shippingAddress.fullName || user.name}
                                                    </p>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                                        Latest Order Address
                                                    </span>
                                                </div>
                                                {userOrders[0].shippingAddress.phone && (
                                                    <p className="text-xs text-gray-500 font-mono">📞 {userOrders[0].shippingAddress.phone}</p>
                                                )}
                                                <div className="text-xs text-gray-700 leading-relaxed pt-1 border-t border-gray-200/60">
                                                    {userOrders[0].shippingAddress.houseNo && (
                                                        <p><span className="font-semibold text-gray-500">House/Building:</span> {userOrders[0].shippingAddress.houseNo}</p>
                                                    )}
                                                    {userOrders[0].shippingAddress.roadArea && (
                                                        <p><span className="font-semibold text-gray-500">Road/Colony:</span> {userOrders[0].shippingAddress.roadArea}</p>
                                                    )}
                                                    {userOrders[0].shippingAddress.street && !userOrders[0].shippingAddress.houseNo && (
                                                        <p>{userOrders[0].shippingAddress.street}</p>
                                                    )}
                                                    <p className="font-semibold text-gray-900 mt-1">
                                                        {userOrders[0].shippingAddress.district || userOrders[0].shippingAddress.city ? `${userOrders[0].shippingAddress.district || userOrders[0].shippingAddress.city}, ` : ''}
                                                        {userOrders[0].shippingAddress.state || ''} {userOrders[0].shippingAddress.zipCode ? `— ${userOrders[0].shippingAddress.zipCode}` : ''}
                                                    </p>
                                                    <p className="text-gray-500">{userOrders[0].shippingAddress.country || 'India'}</p>
                                                </div>
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
