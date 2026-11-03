import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiUpload } from 'react-icons/fi';
import Button from '../common/Button';
import Input from '../common/Input';
import axios from 'axios';

const PromoModal = ({ isOpen, onClose, onSubmit, slotNum = null, promo = null }) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        image: '',
        link: '/products',
        isActive: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const getSlotLabel = (num) => {
        const labels = {
            1: 'Slot 1: Top Left Card (e.g. Cakes)',
            2: 'Slot 2: Top Center Wide Banner (e.g. Sales / Discounts)',
            3: 'Slot 3: Top Right Card (e.g. Flowers)',
            4: 'Slot 4: Middle Left Card (e.g. New Arrivals)',
            5: 'Slot 5: Center Double Height Card (e.g. Lucky Bamboo Plants)',
            6: 'Slot 6: Middle Right Card (e.g. Caricatures)',
            7: 'Slot 7: Bottom Left Card (e.g. Chocolates)',
            8: 'Slot 8: Bottom Right Card (e.g. Personalised Accessories)'
        };
        return labels[num] || `Slot ${num}`;
    };

    useEffect(() => {
        if (promo) {
            setFormData({
                title: promo.title || '',
                subtitle: promo.subtitle || '',
                image: promo.image || '',
                link: promo.link || '/products',
                isActive: promo.isActive !== false
            });
        } else {
            setFormData({
                title: '',
                subtitle: '',
                image: '',
                link: '/products',
                isActive: true
            });
        }
        setError('');
    }, [promo?._id, slotNum, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (!formData.image) {
            setError('Promo card image is required');
            setLoading(false);
            return;
        }

        try {
            await onSubmit({
                ...formData,
                slot: slotNum
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-7 border border-gray-100 overflow-y-auto max-h-[90vh]"
                >
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                Edit Promotion Card
                            </h2>
                            <p className="text-xs text-[#FF64B4] font-semibold mt-0.5">
                                {getSlotLabel(slotNum)}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100 flex items-center gap-2">
                                <FiX size={14} /> {error}
                            </div>
                        )}

                        <Input
                            label="Title / Headline"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="e.g. Anniversary Flowers"
                            required
                        />

                        <Input
                            label="Subtitle / Caption"
                            value={formData.subtitle}
                            onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                            placeholder="e.g. Fresh Blooms for Lasting Love"
                        />

                        <Input
                            label="Redirect Link (URL path)"
                            value={formData.link}
                            onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                            placeholder="e.g. /products?category=flowers"
                            required
                        />

                        {/* Image Upload Area */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Promo Image <span className="text-red-500">*</span></label>
                            <div className="aspect-[4/3] w-full rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden relative group">
                                {formData.image ? (
                                    <div className="relative w-full h-full">
                                        <img
                                            src={formData.image?.startsWith('http') ? formData.image : `${API_URL}${formData.image}`}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => e.target.style.display = 'none'}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <FiX size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-gray-100 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <FiUpload className="w-8 h-8 mb-3 text-gray-400" />
                                            <p className="text-xs text-gray-500">Click to upload promotion card image</p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const data = new FormData();
                                                    data.append('image', file);
                                                    try {
                                                        const config = { headers: { 'Content-Type': 'multipart/form-data' } };
                                                        const res = await axios.post(`${API_URL}/api/upload`, data, config);
                                                        setFormData(prev => ({ ...prev, image: res.data.image }));
                                                    } catch (error) {
                                                        console.error(error);
                                                    }
                                                }
                                            }}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col justify-center">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-900">Active Status</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF64B4]"></div>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                isLoading={loading}
                                icon={<FiCheck />}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PromoModal;
