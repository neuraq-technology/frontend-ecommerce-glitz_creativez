import { motion } from 'framer-motion';

const ProductSkeleton = () => {
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            {/* Image Skeleton */}
            <div className="relative aspect-[4/5] bg-gray-200 overflow-hidden">
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"
                    animate={{ translateX: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
            </div>

            {/* Content Skeleton */}
            <div className="p-4 space-y-3">
                {/* Category & Rating */}
                <div className="flex justify-between items-center">
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-8 bg-gray-200 rounded animate-pulse" />
                </div>

                {/* Title */}
                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />

                {/* Price */}
                <div className="flex items-baseline gap-2 pt-1">
                    <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                </div>
            </div>
        </div>
    );
};

export default ProductSkeleton;
