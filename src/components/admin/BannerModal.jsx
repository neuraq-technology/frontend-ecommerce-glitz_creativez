import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiUpload, FiImage, FiHash, FiLink, FiAlertCircle } from 'react-icons/fi';
import Button from '../common/Button';
import Input from '../common/Input';
import axios from 'axios';

const BannerModal = ({ isOpen, onClose, onSubmit, banner = null, banners = [] }) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    const [formData, setFormData] = useState({
        image: '',
        link: '/products',
        sequence: 0,
        isActive: true
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (banner) {
            setFormData({
                image: banner.image || '',
                link: banner.link || '/products',
                sequence: banner.sequence !== undefined ? banner.sequence : 0,
                isActive: banner.isActive !== false
            });
        } else {
            // Auto-suggest next sequence
            const maxSequence = banners.reduce((max, b) => ((b.sequence || 0) > max ? b.sequence : max), 0);
            setFormData({
                image: '',
                link: '/products',
                sequence: maxSequence + 1,
                isActive: true
            });
        }
        setError('');
    }, [banner?._id, isOpen, banners.length]);

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const data = new FormData();
        data.append('image', file);
        setUploading(true);
        setError('');

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            const res = await axios.post(`${API_URL}/api/upload`, data, config);
            setFormData(prev => ({ ...prev, image: res.data.image }));
        } catch (err) {
            setError('Failed to upload image. Please try again.');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.image) {
            setError('Poster banner graphic is required');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const seqNum = Number(formData.sequence) || 0;
            await onSubmit({
                ...formData,
                title: banner?.title || `Slot ${seqNum || 1} Banner`,
                sequence: seqNum
            });
            onClose();
        } catch (err) {
            setError(err.message || 'An error occurred. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-100 my-auto"
                >
                    {/* Header */}
                    <div className="px-6 sm:px-7 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                {banner ? 'Edit Banner' : 'Add New Banner'}
                            </h2>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Upload a full promotional graphic for your homepage hero slider
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col flex-1">
                        <div className="p-5 sm:p-6 space-y-4">
                            {error && (
                                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                                    <FiAlertCircle size={15} className="shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Section 1: Poster Graphic Dropzone */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-bold text-gray-700">
                                        Poster Graphic Image <span className="text-rose-500">*</span>
                                    </label>
                                    <span className="text-[11px] text-gray-400">Recommended 21:9 Widescreen (1920 × 800 px)</span>
                                </div>

                                <div className="w-full aspect-[21/9] rounded-2xl border-2 border-dashed border-gray-200 bg-[#FAF9FC] flex items-center justify-center overflow-hidden relative group hover:border-[#FF64B4]/60 transition-colors shadow-2xs">
                                    {formData.image ? (
                                        <div className="relative w-full h-full">
                                            <img
                                                src={formData.image.startsWith('http') ? formData.image : `${API_URL}${formData.image}`}
                                                alt="Banner Preview"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <label className="px-3 py-1.5 bg-white text-gray-900 text-xs font-bold rounded-xl shadow-md hover:bg-gray-100 transition-colors cursor-pointer flex items-center gap-1.5">
                                                    <FiUpload size={13} />
                                                    <span>Replace Image</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        disabled={uploading}
                                                        onChange={handleImageUpload}
                                                    />
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                                    className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-rose-700 transition-colors flex items-center gap-1.5"
                                                >
                                                    <FiX size={14} /> Remove
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer p-4 text-center">
                                            <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 mb-2 group-hover:text-[#FF64B4] group-hover:border-pink-200 transition-all shadow-2xs">
                                                {uploading ? (
                                                    <div className="w-5 h-5 border-2 border-[#FF64B4] border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <FiUpload size={22} />
                                                )}
                                            </div>
                                            <p className="text-xs font-bold text-gray-700">
                                                {uploading ? 'Uploading Graphic...' : 'Click to Upload Poster Graphic'}
                                            </p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">JPG, PNG or WebP • Full designed creative</p>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                disabled={uploading}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Section 2: Settings Row (Target Link + Sequence & Status) */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 pt-1 items-end">
                                {/* Target Redirect Link (7 of 12 cols) */}
                                <div className="md:col-span-7">
                                    <Input
                                        label="Target Redirect Link"
                                        icon={<FiLink className="text-gray-400" />}
                                        value={formData.link}
                                        onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                                        placeholder="e.g. /products or /categories/flowers"
                                        helpText="Opens when shoppers tap anywhere on the poster"
                                    />
                                </div>

                                {/* Sequence & Active Status (5 of 12 cols) */}
                                <div className="md:col-span-5 grid grid-cols-2 gap-2.5 items-end">
                                    <div>
                                        <Input
                                            label="Slot #"
                                            type="number"
                                            icon={<FiHash className="text-gray-400" />}
                                            value={formData.sequence}
                                            onChange={(e) => setFormData(prev => ({ ...prev, sequence: e.target.value }))}
                                            placeholder="0"
                                            required
                                            helpText="Order #"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <div className="bg-gray-50/90 px-3 py-2 rounded-xl border-2 border-gray-200 flex items-center justify-between gap-2 h-[50px]">
                                            <div className="min-w-0">
                                                <span className="text-xs font-bold text-gray-800 block leading-tight truncate">
                                                    {formData.isActive ? 'Active' : 'Off'}
                                                </span>
                                                <span className="text-[10px] text-gray-500 block truncate">
                                                    {formData.isActive ? '● Live' : '○ Hidden'}
                                                </span>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isActive}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF64B4]"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pinned Bottom Actions Bar */}
                        <div className="px-6 sm:px-7 py-3.5 border-t border-gray-100 bg-[#FAF9FC] flex items-center justify-between shrink-0">
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
                                {banner ? 'Update Banner' : 'Add Banner'}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default BannerModal;


