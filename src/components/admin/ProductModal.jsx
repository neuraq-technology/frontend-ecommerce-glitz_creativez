import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiImage, FiPackage, FiTag, FiUpload, FiPlus, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import Input from '../common/Input';
import axios from 'axios';

const ProductModal = ({ isOpen, onClose, onSubmit, product = null, categories = [] }) => {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        image: '',

        category: '',
        stock: '',
        isActive: true,
        featured: false,
        isCustomizable: null,
        recipient: '',
        sizes: [],
    });
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');

    useEffect(() => {
        if (isOpen) {
            if (!activeTab) setActiveTab('basic');

            if (product) {
                // Populate edit data
                setFormData({
                    name: product.name || '',
                    price: product.price || '',
                    description: product.description || '',
                    image: product.images?.[0] || '',
                    category: product.category?._id || product.category || '',
                    stock: product.stock || '',
                    isActive: product.isActive !== false,
                    featured: product.featured || false,
                    isCustomizable: product.isCustomizable !== undefined ? product.isCustomizable : null,
                    recipient: product.recipient || '',
                    sizes: product.sizes || [],
                });
            } else {
                // Fresh reset for Add Product
                setFormData({
                    name: '',
                    price: '',
                    description: '',
                    image: '',
                    category: '',
                    stock: '',
                    isActive: true,
                    featured: false,
                    isCustomizable: null,
                    recipient: '',
                    sizes: [],
                });
            }
        }
    }, [product?._id, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation mapping fields to their respective tabs
        if (!formData.name || !formData.price || !formData.stock || !formData.category) {
            setActiveTab('basic');
            toast.error('Please fill out all required fields in the Basic Information tab.');
            return;
        }

        if (!formData.recipient) {
            setActiveTab('basic');
            toast.error('Please select a Gifting Recipient (For Him, For Her, or Both / Unisex).');
            return;
        }

        if (formData.isCustomizable === null || formData.isCustomizable === undefined) {
            setActiveTab('basic');
            toast.error('Please choose whether customer photo upload is required (Yes or No).');
            return;
        }

        if (formData.sizes.length > 0) {
            const hasInvalidSize = formData.sizes.some(s => !s.name || !s.price);
            if (hasInvalidSize) {
                setActiveTab('sizes');
                toast.error('All configured sizes must have a Name and a Price.');
                return;
            }
        }

        if (!formData.image) {
            setActiveTab('media');
            toast.error('Please upload a Primary Product Image.');
            return;
        }

        if (!formData.description) {
            setActiveTab('description');
            toast.error('Please provide a Detailed Description.');
            return;
        }

        setLoading(true);
        try {
            const productData = {
                ...formData,
                isCustomizable: Boolean(formData.isCustomizable),
                price: Number(formData.price),
                stock: Number(formData.stock),
                sizes: formData.sizes.map(s => ({ ...s, price: Number(s.price) })),
                images: [formData.image],
                countInStock: Number(formData.stock)
            };
            await onSubmit(productData);
            setFormData({
                name: '', price: '', description: '', image: '',
                category: '', stock: '', isActive: true, featured: false, isCustomizable: null, recipient: '', sizes: []
            });
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        if (!product && (formData.name || formData.price || formData.sizes.length > 0)) {
            const confirmClose = window.confirm("You have unsaved changes. Are you sure you want to close? Your draft will be lost.");
            if (!confirmClose) return;
        }

        // Reset form data completely if closing explicitly
        setFormData({
            name: '', price: '', description: '', image: '',
            category: '', stock: '', isActive: true, featured: false, isCustomizable: null, recipient: '', sizes: []
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-5xl bg-white rounded-2xl shadow-gold overflow-hidden flex flex-col max-h-[96vh]"
                >
                    {/* Header */}
                    <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-white z-10 shrink-0">
                        <h2 className="text-xl font-bold text-gray-900">
                            {product ? 'Edit Product' : 'Add New Product'}
                        </h2>
                        <button
                            onClick={handleCloseModal}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
                        >
                            <FiX size={24} />
                        </button>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex border-b border-gray-100 px-6 gap-2 sm:gap-6 bg-gray-50/50 flex-wrap shrink-0">
                        <button
                            type="button"
                            onClick={() => setActiveTab('basic')}
                            className={`py-2.5 px-2 font-medium text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'basic'
                                ? 'border-[#FF64B4] text-[#FF64B4]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${activeTab === 'basic' ? 'bg-[#FF64B4]' : 'bg-gray-300'}`}></div>
                                Basic Information
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('media')}
                            className={`py-2.5 px-2 font-medium text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'media'
                                ? 'border-[#FF64B4] text-[#FF64B4]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${activeTab === 'media' ? 'bg-[#FF64B4]' : 'bg-gray-300'}`}></div>
                                Media
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('sizes')}
                            className={`py-2.5 px-2 font-medium text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'sizes'
                                ? 'border-[#FF64B4] text-[#FF64B4]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${activeTab === 'sizes' ? 'bg-[#FF64B4]' : 'bg-gray-300'}`}></div>
                                Sizes & Variants
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('description')}
                            className={`py-2.5 px-2 font-medium text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'description'
                                ? 'border-[#FF64B4] text-[#FF64B4]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${activeTab === 'description' ? 'bg-[#FF64B4]' : 'bg-gray-300'}`}></div>
                                Description
                            </div>
                        </button>
                    </div>

                    {/* Content */}
                    <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-hidden flex flex-col">

                        {/* Tab Content Wrapper */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-3 bg-white">

                            {/* Basic Info Tab */}
                            {activeTab === 'basic' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-3 max-w-4xl mx-auto"
                                >
                                    {/* ROW 1: Product Name (Left) & Gifting Recipient (Right) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                                        <Input
                                            label="Product Name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="e.g. Premium Gift Box"
                                            required
                                        />

                                        {/* Gifting Recipient Selector */}
                                        <div className={`p-2.5 rounded-xl border transition-all ${
                                            !formData.recipient ? 'bg-amber-50/40 border-amber-300' : 'bg-gray-50 border-gray-200'
                                        }`}>
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <span className="text-xs font-bold text-gray-900 flex items-center gap-1">
                                                    <span>🎁 Gifting Recipient</span>
                                                    <span className="text-rose-500 font-bold">*</span>
                                                </span>
                                                {formData.recipient && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, recipient: '' }))}
                                                        className="text-[11px] font-semibold text-gray-400 hover:text-rose-500 transition-colors"
                                                        title="Unselect"
                                                    >
                                                        ✕ Clear
                                                    </button>
                                                )}
                                            </div>
                                            <div className="inline-flex w-full rounded-xl bg-gray-200/80 p-1 gap-1">
                                                {[
                                                    { id: 'him', label: '👨 For Him' },
                                                    { id: 'her', label: '👩 For Her' },
                                                    { id: 'both', label: '✨ Both / Unisex' }
                                                ].map(tab => {
                                                    const isSelected = formData.recipient === tab.id;
                                                    return (
                                                        <button
                                                            key={tab.id}
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({
                                                                ...prev,
                                                                recipient: prev.recipient === tab.id ? '' : tab.id
                                                            }))}
                                                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
                                                                isSelected
                                                                    ? 'bg-[#FF64B4] text-white shadow-xs'
                                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                                                            }`}
                                                        >
                                                            {tab.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {!formData.recipient && (
                                                <p className="text-[10px] font-semibold text-amber-700 mt-1 flex items-center gap-1">
                                                    <span>⚠️</span> Selection required.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* ROW 2: Price & Stock */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <Input
                                            label="Price"
                                            type="number"
                                            name="price"
                                            icon={<span className="font-bold text-gray-500">₹</span>}
                                            value={formData.price}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            required
                                        />
                                        <Input
                                            label="Stock"
                                            type="number"
                                            name="stock"
                                            icon={<FiPackage />}
                                            value={formData.stock}
                                            onChange={handleChange}
                                            placeholder="0"
                                            required
                                        />
                                    </div>

                                    {/* ROW 3: Category & Best Seller Status */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                    <FiTag />
                                                </div>
                                                <select
                                                    name="category"
                                                    value={formData.category}
                                                    onChange={handleChange}
                                                    className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-white border-2 border-gray-200 focus:border-[#FF64B4] focus:ring-4 focus:ring-[#FF64B4]/10 transition-all outline-none appearance-none text-gray-900"
                                                    required
                                                >
                                                    <option value="">Select Category</option>
                                                    {categories.map(cat => (
                                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-0 rounded-xl border-2 border-[#FF64B4]/20 pointer-events-none opacity-0 transition-opacity peer-focus:opacity-100 mix-blend-multiply" />
                                            </div>
                                        </div>

                                        {/* Best Selling Toggle */}
                                        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 flex flex-col justify-center">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-bold text-gray-900">Best Seller Status</span>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={formData.featured}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF64B4]"></div>
                                                </label>
                                            </div>
                                            <p className="text-[11px] text-gray-500 leading-snug">
                                                {formData.featured
                                                    ? "Featured: Highlighted in the 'Popular Gifts' section."
                                                    : "Standard: Normal placement in the catalog."}
                                            </p>
                                        </div>
                                    </div>

                                    {/* ROW 4: Display Status & Photo Customisation Selector */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 flex flex-col justify-between">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-bold text-gray-900">Display Status</span>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={formData.isActive}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF64B4]"></div>
                                                </label>
                                            </div>
                                            <p className="text-[11px] text-gray-500 leading-snug">
                                                {formData.isActive
                                                    ? "Active: Product is visible and available for purchase in the store."
                                                    : "Draft: Product is hidden from customers."}
                                            </p>
                                        </div>

                                        {/* Photo Customisation Selector (Yes / No) */}
                                        <div className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                                            formData.isCustomizable === null ? 'bg-amber-50/40 border-amber-300' : 'bg-gray-50 border-gray-200'
                                        }`}>
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                                                        <span>🎨 Requires Photo Upload?</span>
                                                        <span className="text-rose-500 font-bold">*</span>
                                                    </span>
                                                    <div className="flex items-center gap-1.5">
                                                        {formData.isCustomizable !== null && (
                                                            <>
                                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                                    formData.isCustomizable
                                                                        ? 'bg-pink-100 text-[#FF64B4] border border-pink-200'
                                                                        : 'bg-sky-100 text-[#00aeeb] border border-sky-200'
                                                                }`}>
                                                                    {formData.isCustomizable ? '📸 Photo Needed' : '📦 Ready-Made'}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setFormData(prev => ({ ...prev, isCustomizable: null }))}
                                                                    className="text-[11px] font-semibold text-gray-400 hover:text-rose-500 transition-colors ml-1"
                                                                    title="Unselect"
                                                                >
                                                                    ✕ Clear
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 mt-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({
                                                            ...prev,
                                                            isCustomizable: prev.isCustomizable === true ? null : true
                                                        }))}
                                                        className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                                                            formData.isCustomizable === true
                                                                ? 'bg-[#FF64B4] text-white border-[#FF64B4] shadow-xs'
                                                                : 'bg-white text-gray-700 border-gray-200 hover:border-pink-300 hover:bg-pink-50/50'
                                                        }`}
                                                    >
                                                        <span>📸 Yes</span>
                                                        <span className="text-[10px] font-normal opacity-90">(Custom Photo)</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({
                                                            ...prev,
                                                            isCustomizable: prev.isCustomizable === false ? null : false
                                                        }))}
                                                        className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                                                            formData.isCustomizable === false
                                                                ? 'bg-[#00aeeb] text-white border-[#00aeeb] shadow-xs'
                                                                : 'bg-white text-gray-700 border-gray-200 hover:border-[#00aeeb]/50 hover:bg-sky-50/50'
                                                        }`}
                                                    >
                                                        <span>📦 No</span>
                                                        <span className="text-[10px] font-normal opacity-90">(Ready-Made)</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {formData.isCustomizable === null ? (
                                                <p className="text-[10px] font-semibold text-amber-700 mt-1 flex items-center gap-1">
                                                    <span>⚠️</span> Selection required: Choose Yes (Custom Photo) or No (Ready-Made).
                                                </p>
                                            ) : (
                                                <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                                                    {formData.isCustomizable
                                                        ? "Customer must upload their photo & message on the product page."
                                                        : "Ready-made gift with no customer photo upload required."}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                </motion.div>
                            )}

                            {/* Media Tab */}
                            {activeTab === 'media' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="max-w-4xl mx-auto flex flex-col gap-8 pt-2"
                                >
                                    {/* Image Upload Area */}
                                    <div className="space-y-4">
                                        <div className="flex flex-col items-center justify-center w-full max-w-[320px] mx-auto text-left gap-2">
                                            <label className="block text-sm font-medium text-gray-700 w-full">Primary Product Image</label>
                                            <div className="aspect-square w-full rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden relative group transition-colors">
                                                {formData.image ? (
                                                    <div className="relative w-full h-full flex items-center justify-center bg-white group">
                                                        <img
                                                            src={formData.image.startsWith('http') ? formData.image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${formData.image}`}
                                                            alt="Preview"
                                                            className="w-full h-full object-cover rounded-xl"
                                                            onError={(e) => e.target.style.display = 'none'}
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <button
                                                                 type="button"
                                                                 onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                                                 className="bg-white text-red-500 px-6 py-3 rounded-full font-medium shadow-md flex items-center gap-2 z-10"
                                                            >
                                                                <FiX size={18} /> Remove Image
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-gray-400 transition-colors">
                                                                <FiUpload size={24} />
                                                            </div>
                                                            <p className="mb-2 text-sm text-gray-700 font-medium">Click to upload image</p>
                                                            <p className="text-xs text-gray-500">PNG, JPG or WEBP (Max 5MB)</p>
                                                        </div>
                                                        <input
                                                            id="image-upload"
                                                            type="file"
                                                            className="hidden"
                                                            onChange={async (e) => {
                                                                const file = e.target.files[0];
                                                                if (file) {
                                                                    const formData = new FormData();
                                                                    formData.append('image', file);
                                                                    try {
                                                                        const config = {
                                                                            headers: {
                                                                                'Content-Type': 'multipart/form-data',
                                                                            },
                                                                        };
                                                                        const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload`, formData, config);
                                                                        setFormData(prev => ({ ...prev, image: data.image }));
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
                                    </div>

                                </motion.div>
                            )}

                            {/* Sizes & Variants Tab */}
                            {activeTab === 'sizes' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6 max-w-4xl mx-auto"
                                >
                                    {/* Product Sizes Builder */}
                                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">Product Sizes & Variants</h3>
                                                <p className="text-sm text-gray-500">Optional. Add sizes (like XL) with specific prices and images.</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        const bulkInput = window.prompt("Enter sizes (e.g., S, M, L) OR Size:Price (e.g., S:100, M:120):");
                                                        if (bulkInput) {
                                                            const newSizes = bulkInput.split(',').map(item => {
                                                                const [name, price] = item.split(':').map(s => s.trim());
                                                                return {
                                                                    name: name,
                                                                    price: price ? parseFloat(price) : formData.price,
                                                                };
                                                            }).filter(s => s.name);
                                                            setFormData(prev => ({ ...prev, sizes: [...prev.sizes, ...newSizes] }));
                                                        }
                                                    }}
                                                    icon={<FiPlus />}
                                                >
                                                    Bulk Add
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => setFormData(prev => ({ ...prev, sizes: [...prev.sizes, { name: '', price: '', image: '' }] }))}
                                                    icon={<FiPlus />}
                                                >
                                                    Add Size
                                                </Button>
                                            </div>
                                        </div>

                                        {formData.sizes.length > 0 ? (
                                            <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-2 overflow-x-hidden">
                                                {formData.sizes.map((size, index) => (
                                                    <div key={index} className="flex items-center gap-4 p-3 border border-gray-100 bg-gray-50 rounded-xl relative">
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({ ...prev, sizes: prev.sizes.filter((_, i) => i !== index) }))}
                                                            className="absolute -top-2 -right-2 bg-white text-red-500 p-1.5 rounded-full shadow border hover:bg-red-50"
                                                        >
                                                            <FiX size={14} />
                                                        </button>

                                                        {/* Size Info */}
                                                        <div className="flex-1 space-y-4">
                                                            <Input
                                                                label="Size Name (e.g. XL, Large)"
                                                                value={size.name}
                                                                onChange={(e) => {
                                                                    const newSizes = [...formData.sizes];
                                                                    newSizes[index].name = e.target.value;
                                                                    setFormData(prev => ({ ...prev, sizes: newSizes }));
                                                                }}
                                                                required
                                                            />
                                                            <Input
                                                                label="Variant Price"
                                                                type="number"
                                                                icon={<span className="font-bold text-gray-500">₹</span>}
                                                                value={size.price}
                                                                onChange={(e) => {
                                                                    const newSizes = [...formData.sizes];
                                                                    newSizes[index].price = e.target.value;
                                                                    setFormData(prev => ({ ...prev, sizes: newSizes }));
                                                                }}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                                <p className="text-gray-500 text-sm">No sizes added. The product will only use the global price and image.</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* Description Tab */}
                            {activeTab === 'description' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="max-w-4xl mx-auto flex flex-col h-full gap-4 pt-2"
                                >
                                    <div className="flex-1 flex flex-col">
                                        <div className="flex items-center justify-between mb-2 whitespace-nowrap">
                                            <label className="block text-sm font-medium text-gray-700">Detailed Description</label>
                                            <span className="text-xs text-gray-500">Supports multi-line formatting</span>
                                        </div>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            className="w-full flex-1 min-h-[300px] px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#FF64B4] focus:ring-4 focus:ring-[#FF64B4]/10 transition-all outline-none resize-y text-gray-700 leading-relaxed shadow-inner"
                                            placeholder="Enter comprehensive product details, features, specifications, and care instructions here...

Example:
- Premium Quality Materials
- 100% Organic Cotton
- Machine Washable

Perfect for gifting on special occasions."
                                            required
                                        />
                                    </div>
                                </motion.div>
                            )}

                        </div>
                        {/* Footer / Action Buttons */}
                        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/80 shrink-0 z-10">
                            <div className="flex gap-3 max-w-4xl mx-auto justify-end">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleCloseModal}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    isLoading={loading}
                                    icon={<FiCheck />}
                                >
                                    {product ? 'Update Product' : 'Add Product'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </motion.div >
            </div >
        </AnimatePresence >
    );
};

export default ProductModal;
