import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiUpload, FiGift, FiTag } from 'react-icons/fi';
import Button from '../common/Button';
import Input from '../common/Input';
import axios from 'axios';

const BADGE_PRESETS = [
    'Bestselling Pair',
    'Most Loved',
    'Popular Pick',
    'Everlasting Love',
    'Signature Gift',
    'Festive Special'
];

const ComboModal = ({ isOpen, onClose, onSubmit, combo = null, combos = [] }) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        badge: 'Bestselling Pair',
        image: '',
        link: '/products',
        sequence: 1,
        isActive: true
    });
    const [activeTab, setActiveTab] = useState('basic');
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setActiveTab('basic');
        }
        if (combo) {
            setFormData({
                title: combo.title || '',
                description: combo.description || '',
                price: combo.price !== undefined ? combo.price : '',
                badge: combo.badge || 'Bestselling Pair',
                image: combo.image || '',
                link: combo.link || '/products',
                sequence: combo.sequence !== undefined ? combo.sequence : 1,
                isActive: combo.isActive !== false
            });
        } else {
            const maxSeq = combos.reduce((max, c) => ((c.sequence || 0) > max ? c.sequence : max), 0);
            setFormData({
                title: '',
                description: '',
                price: '',
                badge: 'Bestselling Pair',
                image: '',
                link: '/products',
                sequence: maxSeq + 1,
                isActive: true
            });
        }
        setError('');
    }, [combo, isOpen, combos.length]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);

        setUploadingImage(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/upload`, uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            const imgPath = res.data.image || res.data.url || res.data.secure_url;
            setFormData(prev => ({ ...prev, image: imgPath }));
        } catch (err) {
            console.error('Image upload failed:', err);
            setError('Failed to upload image. Please try again or paste an image URL.');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!combo && combos.length >= 8) {
            const limitMsg = 'Maximum 8 combo cards allowed (2 rows of 4). Please edit or delete an existing combo.';
            setError(limitMsg);
            alert(limitMsg);
            return;
        }

        if (!formData.title.trim()) {
            setActiveTab('basic');
            setError('Please enter a combo title');
            return;
        }
        if (!formData.description.trim()) {
            setActiveTab('basic');
            setError('Please enter included items description');
            return;
        }
        if (!formData.price || Number(formData.price) <= 0) {
            setActiveTab('basic');
            setError('Please enter a valid starting price');
            return;
        }
        if (!formData.image.trim()) {
            setActiveTab('media');
            setError('Please upload or enter a combo image');
            return;
        }

        setLoading(true);
        try {
            await onSubmit({
                ...formData,
                price: Number(formData.price),
                sequence: Number(formData.sequence) || 0
            });
            onClose();
        } catch (err) {
            setError(err.message || 'An error occurred while saving combo');
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
                    className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-100 my-auto"
                >
                    {/* Header */}
                    <div className="px-6 sm:px-7 pt-5 pb-3.5 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                {combo ? 'Edit Celebration Combo' : 'Add New Celebration Combo'}
                            </h2>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Configure paired gift bundles shown on the storefront
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

                    {/* Tabs Navigation */}
                    <div className="flex border-b border-gray-100 px-6 sm:px-7 gap-3 sm:gap-6 bg-gray-50/60 shrink-0">
                        <button
                            type="button"
                            onClick={() => setActiveTab('basic')}
                            className={`py-2.5 px-1 font-medium text-xs sm:text-sm transition-all border-b-2 whitespace-nowrap ${
                                activeTab === 'basic'
                                    ? 'border-[#FF64B4] text-[#FF64B4]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${activeTab === 'basic' ? 'bg-[#FF64B4]' : 'bg-gray-300'}`}></div>
                                <span>Combo Details & Pricing</span>
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('media')}
                            className={`py-2.5 px-1 font-medium text-xs sm:text-sm transition-all border-b-2 whitespace-nowrap ${
                                activeTab === 'media'
                                    ? 'border-[#FF64B4] text-[#FF64B4]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${activeTab === 'media' ? 'bg-[#FF64B4]' : 'bg-gray-300'}`}></div>
                                <span>Combo Image</span>
                                {formData.image && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Image uploaded"></span>
                                )}
                            </div>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col flex-1">
                        {/* Tab Content Area */}
                        <div className="p-5 sm:p-6 space-y-3.5">
                            {error && (
                                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                                    <span>⚠️ {error}</span>
                                </div>
                            )}

                            {/* TAB 1: COMBO DETAILS (2-Column Grid) */}
                            {activeTab === 'basic' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-3"
                                >
                                    {/* ROW 1: Title (Left) + Price & Sequence (Right) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-start">
                                        <Input
                                            label="Combo Name / Headline"
                                            value={formData.title}
                                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                            placeholder="e.g. Artisan LED Glow & Mug Pair"
                                            required
                                        />
                                        <div className="grid grid-cols-2 gap-2.5">
                                            <Input
                                                label="Starting Price (₹)"
                                                type="number"
                                                value={formData.price}
                                                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                                placeholder="e.g. 1199"
                                                required
                                            />
                                            <Input
                                                label="Display Sequence"
                                                type="number"
                                                value={formData.sequence}
                                                onChange={(e) => setFormData(prev => ({ ...prev, sequence: e.target.value }))}
                                                placeholder="1, 2, 3..."
                                            />
                                        </div>
                                    </div>

                                    {/* ROW 2: Included Items (Left) + Card Badge Pill with chips (Right) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-start">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                                Included Items Description <span className="text-rose-500">*</span>
                                            </label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                                placeholder="e.g. Wooden LED Photo Lamp + Custom Ceramic Mug"
                                                rows={2}
                                                className="w-full px-3 py-2 rounded-xl bg-[#FAF9FC] border border-gray-200 text-xs text-gray-800 focus:bg-white focus:border-[#FF64B4] transition-all outline-none resize-none"
                                                required
                                            />
                                            <span className="text-[10px] text-gray-400 mt-0.5 block">
                                                Shown as "Includes: [Your text]" on storefront
                                            </span>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                                Card Badge Pill
                                            </label>
                                            <Input
                                                value={formData.badge}
                                                onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                                                placeholder="e.g. Bestselling Pair"
                                            />
                                            <div className="flex flex-wrap gap-1 mt-1.5">
                                                {BADGE_PRESETS.map((preset) => (
                                                    <button
                                                        type="button"
                                                        key={preset}
                                                        onClick={() => setFormData(prev => ({ ...prev, badge: preset }))}
                                                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                                                            formData.badge === preset
                                                                ? 'bg-[#FF64B4] text-white border-[#FF64B4] font-bold shadow-2xs'
                                                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-pink-50 hover:border-pink-200 hover:text-[#FF64B4]'
                                                        }`}
                                                    >
                                                        {preset}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* ROW 3: Target Link (Left) + Active Toggle (Right) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-end">
                                        <Input
                                            label="Target Redirect Link"
                                            value={formData.link}
                                            onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                                            placeholder="e.g. /products or /products/ID"
                                        />

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                                Storefront Status
                                            </label>
                                            <div className="bg-gray-50/90 px-3.5 py-1.5 rounded-xl border border-gray-200 flex items-center justify-between gap-3 h-[42px]">
                                                <div>
                                                    <span className="text-xs font-bold text-gray-800 block leading-tight">
                                                        {formData.isActive ? 'Active on Storefront' : 'Hidden from Storefront'}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500 block">
                                                        {formData.isActive ? '● Live on storefront' : '○ Hidden from shoppers'}
                                                    </span>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.isActive}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF64B4]"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* TAB 2: COMBO IMAGE */}
                            {activeTab === 'media' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <label className="block text-xs font-bold text-gray-700">
                                            Combo Card Image <span className="text-rose-500">*</span>
                                        </label>
                                        <span className="text-[11px] text-gray-400">Recommended 4:3 Ratio</span>
                                    </div>

                                    {/* Modern Dropzone */}
                                    <div className="w-full aspect-[4/3] max-w-[280px] mx-auto rounded-2xl border-2 border-dashed border-gray-200 bg-[#FAF9FC] flex items-center justify-center overflow-hidden relative group hover:border-[#FF64B4]/60 transition-colors shadow-2xs">
                                        {formData.image ? (
                                            <div className="relative w-full h-full">
                                                <img
                                                    src={formData.image.startsWith('http') ? formData.image : `${API_URL}${formData.image}`}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80';
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                                        className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-rose-700 transition-colors flex items-center gap-1.5"
                                                    >
                                                        <FiX size={14} /> Remove Image
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer p-4 text-center">
                                                <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 mb-2 group-hover:text-[#FF64B4] group-hover:border-pink-200 transition-all shadow-2xs">
                                                    {uploadingImage ? (
                                                        <div className="w-5 h-5 border-2 border-[#FF64B4] border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <FiUpload size={22} />
                                                    )}
                                                </div>
                                                <p className="text-xs font-bold text-gray-700">
                                                    {uploadingImage ? 'Uploading Image...' : 'Click to Upload Combo Image'}
                                                </p>
                                                <p className="text-[11px] text-gray-400 mt-0.5">PNG, JPG or WebP (4:3)</p>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    disabled={uploadingImage}
                                                    className="hidden"
                                                />
                                            </label>
                                        )}
                                    </div>

                                    {/* Direct URL input fallback */}
                                    <div className="max-w-md mx-auto pt-0.5">
                                        <Input
                                            label="Or paste Image URL directly"
                                            value={formData.image}
                                            onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                                            placeholder="https://images.unsplash.com/..."
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Pinned Bottom Actions Bar */}
                        <div className="px-6 sm:px-7 py-3.5 border-t border-gray-100 bg-[#FAF9FC] flex items-center justify-between shrink-0">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                disabled={loading || uploadingImage}
                            >
                                Cancel
                            </Button>

                            <div className="flex items-center gap-2">
                                {activeTab === 'basic' ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('media')}
                                            className="px-4 py-2 text-xs font-bold text-gray-700 hover:text-[#FF64B4] transition-colors"
                                        >
                                            Next: Image →
                                        </button>
                                        <Button
                                            type="submit"
                                            isLoading={loading}
                                            disabled={uploadingImage}
                                            icon={<FiCheck />}
                                        >
                                            {combo ? 'Update Combo' : 'Add Combo'}
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('basic')}
                                            className="px-4 py-2 text-xs font-bold text-gray-700 hover:text-[#FF64B4] transition-colors"
                                        >
                                            ← Back to Details
                                        </button>
                                        <Button
                                            type="submit"
                                            isLoading={loading}
                                            disabled={uploadingImage}
                                            icon={<FiCheck />}
                                        >
                                            {combo ? 'Update Combo' : 'Add Combo'}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ComboModal;
