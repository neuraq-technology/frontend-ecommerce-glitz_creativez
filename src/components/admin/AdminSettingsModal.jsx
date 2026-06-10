import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiLock, FiUser, FiMail, FiPhone, FiAlertCircle, FiBell, FiShield, FiSmartphone } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../common/Button';
import Input from '../common/Input';
import { updateProfile, selectCurrentUser } from '../../store/slices/authSlice';
import { addToast } from '../../store/slices/uiSlice';

const AdminSettingsModal = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        notifications: {
            newOrderAlerts: true,
            lowStockWarnings: true,
            newUserSignups: true,
            weeklyAnalytics: true
        }
    });

    useEffect(() => {
        if (user && isOpen) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
                notifications: user.notifications || {
                    newOrderAlerts: true,
                    lowStockWarnings: true,
                    newUserSignups: true,
                    weeklyAnalytics: true
                }
            });
        }
    }, [user, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            dispatch(addToast({
                type: 'error',
                message: 'New passwords do not match'
            }));
            return;
        }

        // Only require current password if changing password
        if ((formData.newPassword || formData.confirmPassword) && !formData.currentPassword) {
            dispatch(addToast({
                type: 'error',
                message: 'Current password is required to change password'
            }));
            return;
        }

        setLoading(true);
        try {
            const updateData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                // Only send password fields if we are changing them
                ...(formData.newPassword ? {
                    currentPassword: formData.currentPassword,
                    password: formData.newPassword
                } : {}),
                notifications: formData.notifications
            };

            const resultAction = await dispatch(updateProfile(updateData));

            if (updateProfile.fulfilled.match(resultAction)) {
                dispatch(addToast({
                    type: 'success',
                    message: 'Profile updated successfully'
                }));
                // Clear password fields on success
                setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                }));
                onClose();
            } else {
                dispatch(addToast({
                    type: 'error',
                    message: resultAction.payload || 'Failed to update profile'
                }));
            }
        } catch (error) {
            console.error('Update profile error:', error);
            dispatch(addToast({
                type: 'error',
                message: 'An unexpected error occurred'
            }));
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationChange = (key) => {
        setFormData(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: !prev.notifications[key]
            }
        }));
    };

    if (!isOpen) return null;

    const tabs = [
        { id: 'general', label: 'General', icon: <FiUser /> },
        { id: 'security', label: 'Security', icon: <FiShield /> },
        { id: 'notifications', label: 'Notifications', icon: <FiBell /> },
    ];

    const notificationItems = [
        { key: 'newOrderAlerts', label: 'New Order Alerts' },
        { key: 'lowStockWarnings', label: 'Low Stock Warnings' },
        { key: 'newUserSignups', label: 'New User Signups' },
        { key: 'weeklyAnalytics', label: 'Weekly Analytics Report' }
    ];

    // Calculate if there are changes
    const hasChanges = () => {
        if (!user) return false;

        const isEmailChanged = formData.email !== user.email;
        const isPasswordChanged = formData.newPassword.length > 0;

        // Compare notifications
        const currentNotifs = formData.notifications || {};
        const originalNotifs = user.notifications || {};

        const isNotifChanged =
            (currentNotifs.newOrderAlerts !== originalNotifs.newOrderAlerts) ||
            (currentNotifs.lowStockWarnings !== originalNotifs.lowStockWarnings) ||
            (currentNotifs.newUserSignups !== originalNotifs.newUserSignups) ||
            (currentNotifs.weeklyAnalytics !== originalNotifs.weeklyAnalytics);

        return isEmailChanged || isPasswordChanged || isNotifChanged;
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="relative p-6 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-white flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Admin Settings</h2>
                                <p className="text-sm text-gray-500">Manage your account preferences</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-all"
                            >
                                <FiX size={24} />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                        {/* Tabs */}
                        <div className="flex border-b border-gray-100 px-6 pt-2 shrink-0 overflow-x-auto">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id
                                        ? 'border-primary-500 text-primary-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {activeTab === 'general' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    {/* Avatar Placeholder */}
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                            {formData.name?.charAt(0).toUpperCase() || 'A'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">Profile Picture</h3>
                                            <p className="text-xs text-gray-500 mt-1">Managed automatically via your Google account or Gravatar.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="Full Name"
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="Enter full name"
                                            icon={<FiUser />}
                                            required
                                            disabled
                                        />
                                        <Input
                                            label="Email Address"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                            placeholder="admin@example.com"
                                            icon={<FiMail />}
                                            disabled
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'security' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                                        <FiShield className="text-blue-500 mt-1" />
                                        <div>
                                            <h4 className="font-bold text-blue-900 text-sm">Secure Your Account</h4>
                                            <p className="text-xs text-blue-700 mt-1">Use a strong password to keep your admin access safe.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <Input
                                            label="Change Email Address"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                            placeholder="admin@example.com"
                                            icon={<FiMail />}
                                        />
                                        <Input
                                            label="Current Password"
                                            type="password"
                                            value={formData.currentPassword}
                                            onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                            placeholder="Required to change password"
                                            icon={<FiLock />}
                                        />
                                        <Input
                                            label="New Password"
                                            type="password"
                                            value={formData.newPassword}
                                            onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                                            placeholder="Leave blank to keep current"
                                            icon={<FiLock />}
                                        />
                                        <Input
                                            label="Confirm New Password"
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            placeholder="Re-enter new password"
                                            icon={<FiLock />}
                                            error={formData.newPassword !== formData.confirmPassword && formData.confirmPassword ? "Passwords do not match" : ""}
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'notifications' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-4"
                                    data-testid="notifications-tab"
                                >
                                    {notificationItems.map((item) => (
                                        <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-lg border border-gray-100 text-gray-500">
                                                    <FiBell size={18} />
                                                </div>
                                                <span className="font-medium text-gray-700">{item.label}</span>
                                            </div>
                                            <div className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.notifications?.[item.key] ?? true}
                                                    onChange={() => handleNotificationChange(item.key)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                                            </div>
                                        </div>
                                    ))}
                                    <p className="text-xs text-green-600 text-center pt-4 flex items-center justify-center gap-1">
                                        <FiCheck size={12} /> Syncing with your secure profile.
                                    </p>
                                </motion.div>
                            )}
                        </div>

                        {/* Persistent Footer - BUT Hidden for General Tab */}
                        {activeTab !== 'general' && (
                            <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0">
                                <div className="flex flex-col gap-4">
                                    <div className="flex justify-end gap-3">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={onClose}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            isLoading={loading}
                                            icon={<FiCheck />}
                                            disabled={!hasChanges()}
                                        >
                                            Save Changes
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AdminSettingsModal;
