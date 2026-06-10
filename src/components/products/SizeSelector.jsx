import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiCheck, FiSearch, FiInfo } from 'react-icons/fi';

const SizeSelector = ({ sizes, selectedSize, onSelectSize }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    if (!sizes || sizes.length === 0) return null;

    // Pattern: Use Pills for small sets (<= 8), Searchable Dropdown for large sets (> 8)
    const isLargeSet = sizes.length > 8;

    const filteredSizes = useMemo(() => {
        return sizes.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [sizes, searchTerm]);

    return (
        <div className="flex flex-col items-start w-full group/selector">
            {/* Label Section */}
            <div className="flex justify-between w-full items-center mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-gray-900 uppercase tracking-widest">
                        {isLargeSet ? 'Select Dimensions' : 'Available Sizes'}
                    </span>
                    {isLargeSet && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-600 text-[10px] font-bold rounded-full border border-primary-100">
                            {sizes.length} Options
                        </div>
                    )}
                </div>
                <button className="flex items-center gap-1.5 text-[11px] text-gray-400 font-bold uppercase tracking-widest hover:text-primary-600 transition-colors group">
                    <FiInfo size={12} className="group-hover:rotate-12 transition-transform" />
                    Size Guide
                </button>
            </div>

            {!isLargeSet ? (
                /* 
                   PILL LAYOUT (For Clothing/Small sets) 
                   - Uses a beautiful grid with hover lift effects
                */
                <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 w-full">
                    {sizes.map((size) => {
                        const isSelected = selectedSize?.name === size.name;
                        return (
                            <motion.button
                                key={size.name}
                                whileHover={{ y: -4, shadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onSelectSize(size)}
                                className={`relative flex items-center justify-center h-12 text-sm font-bold transition-all duration-300 rounded-xl border-2 ${isSelected
                                    ? 'text-white border-primary-500 bg-primary-500 shadow-glow shadow-primary-500/20'
                                    : 'text-gray-600 border-gray-100 hover:border-primary-200 bg-white hover:bg-primary-50/30'
                                    } outline-none`}
                            >
                                <span className="relative z-10">{size.name}</span>
                                {isSelected && (
                                    <motion.div
                                        layoutId="size-pill-active"
                                        className="absolute inset-0 bg-primary-500 rounded-[10px] -z-0"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                                    />
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            ) : (
                /* 
                   PREMIUM SEARCHABLE DROPDOWN (For Frames/Large sets) 
                   - Keeps page clean
                   - Allows user to find specific dimensions quickly
                */
                <div className="relative w-full">
                    <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`w-full flex items-center justify-between px-6 py-4.5 bg-white border-2 rounded-2xl transition-all duration-500 ${isDropdownOpen
                            ? 'border-primary-500 ring-8 ring-primary-500/5 shadow-xl'
                            : 'border-gray-100 hover:border-gray-300 shadow-sm'
                            }`}
                    >
                        <div className="flex flex-col items-start gap-0.5">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Selected Size</span>
                            <span className="text-gray-900 font-bold text-lg tracking-tight">
                                {selectedSize?.name || 'Choose dimensions...'}
                            </span>
                        </div>
                        <div className={`w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 transition-all duration-500 ${isDropdownOpen ? 'rotate-180 bg-primary-500 text-white shadow-glow' : ''}`}>
                            <FiChevronDown size={20} />
                        </div>
                    </button>

                    <AnimatePresence>
                        {isDropdownOpen && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[2px]"
                                    onClick={() => {
                                        setIsDropdownOpen(false);
                                        setSearchTerm('');
                                    }}
                                />

                                <motion.div
                                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 15, scale: 0.98 }}
                                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                    className="absolute left-0 right-0 top-[110%] bg-white border border-gray-100 rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col"
                                >
                                    {/* Search Input */}
                                    <div className="p-4 border-b border-gray-50">
                                        <div className="relative">
                                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                autoFocus
                                                placeholder="Search dimensions (e.g. 12x18)..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Size List */}
                                    <div className="max-h-[350px] overflow-y-auto scrollbar-hide py-2">
                                        {filteredSizes.length > 0 ? (
                                            filteredSizes.map((size) => {
                                                const isSelected = selectedSize?.name === size.name;
                                                return (
                                                    <button
                                                        key={size.name}
                                                        onClick={() => {
                                                            onSelectSize(size);
                                                            setIsDropdownOpen(false);
                                                            setSearchTerm('');
                                                        }}
                                                        className={`w-full flex items-center justify-between px-6 py-4 transition-all ${isSelected
                                                            ? 'bg-primary-50 text-primary-700'
                                                            : 'hover:bg-gray-50 text-gray-700'
                                                            }`}
                                                    >
                                                        <div className="flex flex-col items-start gap-1">
                                                            <span className={`text-base font-bold ${isSelected ? 'text-primary-700' : 'text-gray-900'}`}>
                                                                {size.name}
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-xs font-medium ${isSelected ? 'text-primary-500' : 'text-gray-400'}`}>
                                                                    ₹{size.price.toFixed(2)}
                                                                </span>
                                                                {isSelected && (
                                                                    <span className="text-[10px] bg-primary-500 text-white px-1.5 py-0.5 rounded font-bold uppercase">Active</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                                                            ? 'bg-primary-500 border-primary-500 shadow-glow'
                                                            : 'border-gray-100 group-hover:border-gray-300'
                                                            }`}>
                                                            {isSelected && <FiCheck size={14} className="text-white" />}
                                                        </div>
                                                    </button>
                                                );
                                            })
                                        ) : (
                                            <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-3">
                                                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
                                                    <FiSearch size={24} />
                                                </div>
                                                <p className="text-sm font-medium">No sizes matching "{searchTerm}"</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            )}
            

        </div>
    );
};

export default SizeSelector;
