import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiUpload, FiImage, FiHash, FiStar, FiAlertCircle } from 'react-icons/fi';
import Button from '../common/Button';
import Input from '../common/Input';
import axios from 'axios';

const CategoryModal = ({ isOpen, onClose, onSubmit, category = null, categories = [] }) => {
    const [formData, setFormData] = useState({
        name: '',
        icon: '',
        description: '',
        image: '',
        sequence: 0,
        showOnHome: false,
        isActive: true
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                icon: category.icon || '',
                description: category.description || '',
                image: category.image || '',
                sequence: category.sequence || 0,
                showOnHome: category.showOnHome === true,
                isActive: category.isActive !== false
            });
        } else {
            // Auto-suggest next sequence
            const maxSequence = categories.reduce((max, cat) => (cat.sequence > max ? cat.sequence : max), 0);
            setFormData({
                name: '',
                icon: '',
                description: '',
                image: '',
                sequence: maxSequence + 1,
                showOnHome: false,
                isActive: true
            });
        }
        setError('');
    }, [category?._id, isOpen, categories.length]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (!formData.image) {
            setError('Category image is required');
            setLoading(false);
            return;
        }

        try {
            const submitData = {
                ...formData,
                image: formData.image
            };
            await onSubmit(submitData);
            onClose();
        } catch (err) {
            let msg = err.message || 'An error occurred. Please try again.';
            if (msg.includes('Duplicate field value')) {
                msg = 'same sequence number cant add';
            }
            setError(msg);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const sequenceError = error === 'same sequence number cant add' ? error : '';
    const generalError = error && error !== 'same sequence number cant add' ? error : '';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-7 border border-gray-100 my-auto overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                {category ? 'Edit Category' : 'Add New Category'}
                            </h2>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Manage storefront gift collections and category navigation
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* 2-Column Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                            
                            {/* Left Column: Form Details (7 of 12 cols) */}
                            <div className="md:col-span-7 space-y-3.5">
                                {/* Category Name */}
                                <Input
                                    label="Category Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g. Birthday Gifts, Photo Frames"
                                    required
                                />

                                {/* Description */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Description <span className="text-gray-400 font-normal">(Optional)</span>
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Brief description for SEO and storefront..."
                                        rows={2}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9FC] border border-gray-200 focus:bg-white focus:border-[#FF64B4] transition-all outline-none resize-none text-xs text-gray-800"
                                    />
                                </div>

                                {/* Sequence Number */}
                                <div>
                                    <Input
                                        label="Display Sequence Order"
                                        type="number"
                                        icon={<FiHash className="text-gray-400" />}
                                        value={formData.sequence}
                                        onChange={(e) => setFormData(prev => ({ ...prev, sequence: e.target.value }))}
                                        placeholder="0"
                                        required
                                        error={sequenceError}
                                        helpText="Lower numbers appear first on storefront"
                                    />
                                </div>

                                {/* Storefront Display Toggles */}
                                <div className="space-y-2 pt-1">
                                    {/* Top 10 Home Nav Toggle */}
                                    <div className="bg-pink-50/50 p-3 rounded-2xl border border-pink-200/70 flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <span className="text-xs font-bold text-gray-900 flex items-center gap-1">
                                                <FiStar className="text-[#FF64B4] fill-current" size={13} />
                                                Show in Top 10 Home Nav
                                            </span>
                                            <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                                                Feature in circular nav bar on storefront homepage
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={formData.showOnHome}
                                                onChange={(e) => setFormData(prev => ({ ...prev, showOnHome: e.target.checked }))}
                                            />
                                            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF64B4]"></div>
                                        </label>
                                    </div>

                                    {/* Active Status Toggle */}
                                    <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 flex items-center justify-between gap-3">
                                        <div>
                                            <span className="text-xs font-bold text-gray-900">
                                                Active Storefront Status
                                            </span>
                                            <p className="text-[11px] text-gray-500 mt-0.5">
                                                {formData.isActive ? '● Live & accessible to shoppers' : '○ Hidden from store catalog'}
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={formData.isActive}
                                                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                            />
                                            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF64B4]"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Category Visual (5 of 12 cols) */}
                            <div className="md:col-span-5 flex flex-col justify-center items-center h-full py-1">
                                <div className="w-full max-w-[240px] flex flex-col items-center">
                                    <div className="w-full flex items-center justify-between mb-1.5 px-0.5">
                                        <label className="block text-xs font-bold text-gray-700">
                                            Category Image <span className="text-rose-500">*</span>
                                        </label>
                                        <span className="text-[10px] text-gray-400 font-medium">1:1 Square</span>
                                    </div>

                                    {/* Dropzone (Square 1:1) */}
                                    <div className="w-full aspect-square rounded-2xl border-2 border-dashed border-gray-200 bg-[#FAF9FC] flex items-center justify-center overflow-hidden relative group hover:border-[#FF64B4]/60 transition-colors shadow-2xs">
                                        {formData.image ? (
                                            <div className="relative w-full h-full">
                                                <img
                                                    src={formData.image?.startsWith('http') ? formData.image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${formData.image}`}
                                                    alt="Category Preview"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                                        className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-rose-700 transition-colors flex items-center gap-1"
                                                    >
                                                        <FiX size={14} /> Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer p-4 text-center">
                                                <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 mb-2 group-hover:text-[#FF64B4] group-hover:border-pink-200 transition-all shadow-2xs">
                                                    {uploading ? (
                                                        <div className="w-5 h-5 border-2 border-[#FF64B4] border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <FiUpload size={20} />
                                                    )}
                                                </div>
                                                <p className="text-xs font-bold text-gray-700">
                                                    {uploading ? 'Uploading...' : 'Click to Upload Image'}
                                                </p>
                                                <p className="text-[10px] text-gray-400 mt-1">PNG, JPG or WebP (1:1)</p>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    disabled={uploading}
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const data = new FormData();
                                                            data.append('image', file);
                                                            setUploading(true);
                                                            try {
                                                                const config = { headers: { 'Content-Type': 'multipart/form-data' } };
                                                                const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload`, data, config);
                                                                setFormData(prev => ({ ...prev, image: res.data.image }));
                                                                setError('');
                                                            } catch (error) {
                                                                console.error('Image upload failed:', error);
                                                                setError('Failed to upload image. Please try again.');
                                                            } finally {
                                                                setUploading(false);
                                                            }
                                                        }
                                                    }}
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Error Banner */}
                        {generalError && (
                            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                                <FiAlertCircle size={15} className="shrink-0" />
                                <span>{generalError}</span>
                            </div>
                        )}

                        {/* Pinned Bottom Actions Bar */}
                        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                disabled={loading || uploading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                isLoading={loading}
                                disabled={uploading}
                                icon={<FiCheck />}
                            >
                                {category ? 'Update Category' : 'Add Category'}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CategoryModal;
