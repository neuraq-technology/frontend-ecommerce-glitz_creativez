import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiUser,
    FiMail,
    FiPhone,
    FiShield,
    FiLock,
    FiBell,
    FiBellOff,
    FiCheck,
    FiAlertCircle,
    FiCheckCircle,
    FiSettings,
    FiSliders,
    FiKey,
    FiEdit2
} from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../common/Button';
import Input from '../common/Input';
import { updateProfile, selectCurrentUser } from '../../store/slices/authSlice';
import { addToast } from '../../store/slices/uiSlice';

const AdminSettingsTab = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser);
    const [subTab, setSubTab] = useState('general');
    const [loading, setLoading] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        supportEmail: '',
        phone: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        notifications: {
            newOrderAlerts: false,
            lowStockWarnings: false,
            newUserSignups: false,
            weeklyAnalytics: false
        }
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || 'Master Administrator',
                email: user.email || '',
                supportEmail: user.supportEmail || 'support@gmail.com',
                phone: user.phone || user.address?.phone || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
                // All notifications default to false (disabled) per request
                notifications: {
                    newOrderAlerts: user.notifications?.newOrderAlerts ?? false,
                    lowStockWarnings: user.notifications?.lowStockWarnings ?? false,
                    newUserSignups: user.notifications?.newUserSignups ?? false,
                    weeklyAnalytics: user.notifications?.weeklyAnalytics ?? false
                }
            });
        }
    }, [user]);

    const handleSaveGeneral = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updateData = {
                name: formData.name,
                supportEmail: formData.supportEmail,
                phone: formData.phone
            };
            const resultAction = await dispatch(updateProfile(updateData));
            if (updateProfile.fulfilled.match(resultAction)) {
                setIsEditingEmail(false);
                dispatch(addToast({
                    type: 'success',
                    message: 'Master administrator profile & contact details updated!'
                }));
            } else {
                dispatch(addToast({
                    type: 'error',
                    message: resultAction.payload || 'Failed to update profile'
                }));
            }
        } catch (err) {
            dispatch(addToast({ type: 'error', message: 'Failed to update admin profile' }));
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSecurity = async (e) => {
        e.preventDefault();
        if (!formData.email) {
            dispatch(addToast({ type: 'error', message: 'Administrator login email is required' }));
            return;
        }
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            dispatch(addToast({ type: 'error', message: 'New passwords do not match' }));
            return;
        }
        if (formData.newPassword && !formData.currentPassword) {
            dispatch(addToast({ type: 'error', message: 'Current password is required to set a new password' }));
            return;
        }

        setLoading(true);
        try {
            const updateData = {
                email: formData.email,
                ...(formData.newPassword ? {
                    currentPassword: formData.currentPassword,
                    password: formData.newPassword
                } : {})
            };

            const resultAction = await dispatch(updateProfile(updateData));
            if (updateProfile.fulfilled.match(resultAction)) {
                dispatch(addToast({
                    type: 'success',
                    message: 'Admin login credentials updated successfully!'
                }));
                setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                }));
            } else {
                dispatch(addToast({
                    type: 'error',
                    message: resultAction.payload || 'Failed to update security credentials'
                }));
            }
        } catch (err) {
            dispatch(addToast({ type: 'error', message: 'Security update failed' }));
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationToggle = (key) => {
        setFormData(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: !prev.notifications[key]
            }
        }));
    };

    const handleDisableAllNotifications = () => {
        setFormData(prev => ({
            ...prev,
            notifications: {
                newOrderAlerts: false,
                lowStockWarnings: false,
                newUserSignups: false,
                weeklyAnalytics: false
            }
        }));
        dispatch(addToast({
            type: 'info',
            message: 'All notifications muted/disabled.'
        }));
    };

    const handleSaveNotifications = async () => {
        setLoading(true);
        try {
            const resultAction = await dispatch(updateProfile({
                notifications: formData.notifications
            }));
            if (updateProfile.fulfilled.match(resultAction)) {
                dispatch(addToast({
                    type: 'success',
                    message: 'Notification preferences saved successfully!'
                }));
            } else {
                dispatch(addToast({
                    type: 'error',
                    message: resultAction.payload || 'Failed to save notifications'
                }));
            }
        } catch (err) {
            dispatch(addToast({ type: 'error', message: 'Failed to update notifications' }));
        } finally {
            setLoading(false);
        }
    };

    const navItems = [
        {
            id: 'general',
            label: 'General Profile',
            subtitle: 'Master administrator & support contact',
            icon: <FiUser size={18} />
        },
        {
            id: 'security',
            label: 'Security & Access',
            subtitle: 'Admin login email & credentials',
            icon: <FiShield size={18} />
        },
        {
            id: 'notifications',
            label: 'Notifications & Alerts',
            subtitle: 'Currently disabled / inactive',
            icon: <FiBellOff size={18} />
        }
    ];

    const notificationList = [
        {
            key: 'newOrderAlerts',
            label: 'New Order Alerts',
            description: 'Receive real-time alerts when shoppers place celebratory gift orders'
        },
        {
            key: 'lowStockWarnings',
            label: 'Low Stock Warnings',
            description: 'Automated warnings when products drop below the minimum inventory threshold'
        },
        {
            key: 'newUserSignups',
            label: 'New User Signups',
            description: 'Notifications when new customers create verified gift shopping accounts'
        },
        {
            key: 'weeklyAnalytics',
            label: 'Weekly Analytics Digest',
            description: 'Weekly gross revenue, best-sellers, and conversion trend summary'
        }
    ];

    const allNotificationsOff = Object.values(formData.notifications).every(val => !val);

    return (
        <div className="space-y-6">
            {/* Header Banner (Standardized with other dashboard tabs) */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 text-lg">
                    Admin Account Settings
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                    Manage your administrator profile, security credentials, and store alert preferences
                </p>
            </div>

            {/* Split Two-Column Layout (Option 2) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Sub-navigation Menu */}
                <div className="lg:col-span-4 bg-white rounded-3xl p-4 sm:p-5 border border-gray-200 shadow-sm space-y-2">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">
                        Settings Categories
                    </p>
                    {navItems.map((item) => {
                        const isActive = subTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setSubTab(item.id)}
                                className={`w-full flex items-start gap-3.5 p-3.5 rounded-2xl text-left transition-all ${isActive
                                        ? 'bg-gradient-to-r from-[#FF64B4] to-[#ff389a] text-white shadow-gold'
                                        : 'hover:bg-gray-50 text-gray-700'
                                    }`}
                            >
                                <span className={`p-2 rounded-xl shrink-0 ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {item.icon}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="font-bold text-sm leading-snug">{item.label}</p>
                                        {item.id === 'notifications' && (
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500 border border-gray-200'
                                                }`}>
                                                DISABLED
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-xs mt-0.5 truncate ${isActive ? 'text-pink-100' : 'text-gray-400'
                                        }`}>
                                        {item.subtitle}
                                    </p>
                                </div>
                            </button>
                        );
                    })}

                    {/* Quick System Badge */}
                    <div className="pt-4 mt-2 border-t border-gray-100 px-3">
                        <div className="p-3.5 rounded-2xl bg-[#FAF9FC] border border-gray-200/70 text-xs space-y-1">
                            <p className="font-bold text-gray-800">Glitz Creativez E-Commerce</p>
                            <p className="text-[11px] text-gray-500">Luxury Gifting Platform v2.0</p>
                            <p className="text-[10px] text-gray-400">Environment: Production Ready</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Active Sub-tab Panel */}
                <div className="lg:col-span-8 space-y-6">
                    {/* 1. General Profile Tab */}
                    {subTab === 'general' && (
                        <motion.div
                            key="general"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6"
                        >
                            <div className="pb-4 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900">Master Administrator & Store Contact</h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Manage store identity, official contact email, and support helpline
                                </p>
                            </div>

                            {/* Admin Info Banner */}
                            <div className="p-4 rounded-2xl bg-[#FAF9FC] border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-gray-900 text-sm">Administrator :</h4>
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                            Master Administrator
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Store Support: <span className="font-semibold text-gray-700">{formData.supportEmail || 'support@gmail.com'}</span>
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSaveGeneral} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        label="Master Administrator Name"
                                        name="name"
                                        value={formData.name || 'Master Administrator'}
                                        placeholder="Master Administrator"
                                        icon={<FiUser />}
                                        disabled
                                    />

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Contact Us & Support Email
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setIsEditingEmail(prev => !prev)}
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                                    isEditingEmail
                                                        ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                                        : 'bg-pink-50 text-[#FF64B4] hover:bg-pink-100'
                                                }`}
                                            >
                                                <FiEdit2 size={12} />
                                                <span>{isEditingEmail ? 'Cancel' : 'Edit'}</span>
                                            </button>
                                        </div>
                                        <Input
                                            name="supportEmail"
                                            type="email"
                                            value={formData.supportEmail}
                                            onChange={(e) => setFormData(prev => ({ ...prev, supportEmail: e.target.value }))}
                                            placeholder="support@gmail.com"
                                            icon={<FiMail />}
                                            disabled={!isEditingEmail}
                                            required
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <Input
                                            label="Customer Support Helpline / Phone"
                                            name="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                            placeholder="Direct helpline or WhatsApp contact (e.g. +91 98765 43210)"
                                            icon={<FiPhone />}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex justify-end">
                                    <Button
                                        type="submit"
                                        isLoading={loading}
                                        icon={<FiCheck />}
                                    >
                                        Save Profile & Support Details
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {/* 2. Security Tab */}
                    {subTab === 'security' && (
                        <motion.div
                            key="security"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6"
                        >
                            <div className="pb-4 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900">Security & Access Credentials</h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Manage your primary administrator login email and account access password
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-red-50/80 border border-red-100 flex items-start gap-3">
                                <FiShield className="text-red-500 mt-0.5 shrink-0" size={18} />
                                <div className="text-xs text-red-900 leading-relaxed">
                                    <p className="font-bold text-red-800">Admin Credential Protection</p>
                                    <p className="text-red-600 mt-0.5">
                                        This email and password are used to authenticate your access to this administrative control panel.<br /> Ensure your password has at least 8 characters.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSaveSecurity} className="space-y-5">
                                <div className="space-y-4">
                                    <Input
                                        label="Administrator Login Email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        placeholder="admin@gmail.com"
                                        icon={<FiMail />}
                                        required
                                    />

                                    <Input
                                        label="Current Password"
                                        type="password"
                                        value={formData.currentPassword}
                                        onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                        placeholder="Required to set new password"
                                        icon={<FiLock />}
                                    />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input
                                            label="New Password"
                                            type="password"
                                            value={formData.newPassword}
                                            onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                                            placeholder="Leave blank to keep current"
                                            icon={<FiKey />}
                                        />

                                        <Input
                                            label="Confirm New Password"
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            placeholder="Re-enter new password"
                                            icon={<FiKey />}
                                            error={formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword ? 'Passwords do not match' : ''}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex justify-end">
                                    <Button
                                        type="submit"
                                        isLoading={loading}
                                        icon={<FiCheck />}
                                    >
                                        Update Security Credentials
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {/* 3. Notifications Tab (Hard Disabled: Features Not Currently Active) */}
                    {subTab === 'notifications' && (
                        <motion.div
                            key="notifications"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Notifications & Alerts</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        System alerts and background notification preferences
                                    </p>
                                </div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                                    Service Inactive
                                </span>
                            </div>

                            {/* Prominent Disabled Banner */}
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-xl bg-gray-200/80 text-gray-600 shrink-0">
                                        <FiBellOff size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-xs">All Notification Features are Disabled</h4>
                                        <p className="text-[11px] text-gray-500 mt-0.5">
                                            Automated order emails, low stock warnings, and sound chimes are currently disabled in this version.
                                        </p>
                                    </div>
                                </div>
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-200 text-gray-700 shrink-0 border border-gray-300/60">
                                    Disabled
                                </span>
                            </div>

                            {/* Notification List Toggles (All Hard Disabled) */}
                            <div className="space-y-3">
                                {notificationList.map((item) => (
                                    <div
                                        key={item.key}
                                        className="p-4 rounded-2xl bg-[#FAF9FC] border border-gray-200/60 flex items-center justify-between gap-4 opacity-75"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-gray-800 text-xs">{item.label}</p>
                                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 border border-gray-300/40">
                                                    Disabled
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>

                                        {/* Disabled Toggle Switch */}
                                        <div
                                            className="relative inline-flex items-center cursor-not-allowed opacity-50 shrink-0"
                                            title="Feature is currently disabled"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={false}
                                                disabled={true}
                                                readOnly
                                                className="sr-only"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 rounded-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                <p className="text-xs text-gray-400">
                                    ✓ All notification features are currently disabled
                                </p>
                                <button
                                    type="button"
                                    disabled
                                    className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-400 font-bold text-xs border border-gray-200 cursor-not-allowed inline-flex items-center gap-2"
                                >
                                    <FiCheck size={14} />
                                    <span>Features Disabled</span>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSettingsTab;
