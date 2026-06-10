import { useRef } from 'react';
import { FiChevronLeft, FiChevronRight, FiGift } from 'react-icons/fi';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import { ProductCardSkeleton } from '../common/Skeleton';

const ProductSlider = ({ products = [], wishlist = [], isLoading = false }) => {
    const sliderRef = useRef(null);

    const scroll = (direction) => {
        if (sliderRef.current) {
            const scrollAmount = direction === 'left' ? -sliderRef.current.offsetWidth : sliderRef.current.offsetWidth;
            sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (isLoading) {
        return (
            <div className="flex overflow-x-auto gap-4 sm:gap-6 scrollbar-hide pb-6 pt-2 px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {[...Array(5)].map((_, index) => (
                    <div key={index} className="min-w-[220px] max-w-[220px] sm:min-w-[260px] sm:max-w-[260px] flex-shrink-0">
                        <ProductCardSkeleton />
                    </div>
                ))}
            </div>
        );
    }

    if (!products || products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-gradient-to-b from-white to-pink-50/30 rounded-2xl border border-pink-100/50 my-4 shadow-sm">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-20 h-20 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mb-6 shadow-inner"
                >
                    <FiGift size={32} />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">New Gifts Arriving Soon!</h3>
                <p className="text-gray-500 text-center max-w-md">We're currently curating a special collection of popular gifts. Check back shortly for amazing new items.</p>
            </div>
        );
    }

    return (
        <div className="relative group max-w-full">
            {/* Left Navigation Arrow */}
            <button 
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 md:-translate-x-5 bg-white shadow-lg text-gray-800 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 hover:bg-gray-50 border border-gray-200"
            >
                <FiChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Scrollable Container */}
            <div 
                ref={sliderRef}
                className="flex overflow-x-auto gap-4 sm:gap-6 snap-x snap-mandatory scrollbar-hide pb-6 pt-2 px-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {products.map((product, index) => (
                    <div key={product._id} className="min-w-[220px] max-w-[220px] sm:min-w-[260px] sm:max-w-[260px] flex-shrink-0 snap-start">
                        <ProductCard
                            product={product}
                            index={index % 12}
                            wishlist={wishlist}
                        />
                    </div>
                ))}
            </div>

            {/* Right Navigation Arrow */}
            <button 
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 md:translate-x-5 bg-white shadow-lg text-gray-800 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 hover:bg-gray-50 border border-gray-200"
            >
                <FiChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default ProductSlider;
