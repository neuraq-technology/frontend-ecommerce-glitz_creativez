import { motion } from 'framer-motion';

// Base Skeleton component
const Skeleton = ({
    variant = 'rect',
    width,
    height,
    className = '',
    ...props
}) => {
    const baseClasses = 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]';

    const variants = {
        rect: 'rounded-lg',
        circle: 'rounded-full',
        text: 'rounded h-4',
        card: 'rounded-2xl',
    };

    return (
        <div
            className={`${baseClasses} ${variants[variant]} ${className}`}
            style={{ width, height }}
            {...props}
        />
    );
};

// Product Card Skeleton
const ProductCardSkeleton = () => {
    return (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 overflow-hidden shadow-xs flex flex-col justify-between h-full">
            {/* Image */}
            <Skeleton variant="rect" className="w-full aspect-[4/3]" />

            {/* Content */}
            <div className="p-3 sm:p-5 space-y-2 sm:space-y-3 flex-1 flex flex-col justify-between">
                <div>
                    {/* Title */}
                    <Skeleton variant="text" className="w-4/5 h-4 sm:h-5" />

                    {/* Description */}
                    <Skeleton variant="text" className="w-full h-2.5 sm:h-3 mt-1.5 sm:mt-2" />
                    <Skeleton variant="text" className="w-2/3 h-2.5 sm:h-3 mt-1" />
                </div>

                {/* Bottom Row */}
                <div className="pt-2 sm:pt-3 border-t border-gray-100 flex items-center justify-between">
                    <Skeleton variant="text" className="w-16 sm:w-20 h-4 sm:h-5" />
                    <Skeleton variant="text" className="w-12 sm:w-16 h-3 sm:h-4" />
                </div>
            </div>
        </div>
    );
};

// Product Grid Skeleton
const ProductGridSkeleton = ({ count = 8, className = '' }) => {
    return (
        <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6 ${className}`}>
            {[...Array(count)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                >
                    <ProductCardSkeleton />
                </motion.div>
            ))}
        </div>
    );
};

// Product Detail Skeleton
const ProductDetailSkeleton = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
                <Skeleton variant="rect" className="w-full aspect-square rounded-2xl" />
                <div className="flex gap-3">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} variant="rect" className="w-20 h-20 rounded-xl" />
                    ))}
                </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
                <div className="flex gap-3">
                    <Skeleton variant="text" className="w-24 h-6 rounded-full" />
                    <Skeleton variant="text" className="w-20 h-6" />
                </div>
                <Skeleton variant="text" className="w-full h-10" />
                <div className="flex gap-2">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} variant="circle" className="w-5 h-5" />
                    ))}
                </div>
                <div className="flex gap-4 items-center">
                    <Skeleton variant="text" className="w-32 h-10" />
                    <Skeleton variant="text" className="w-20 h-6" />
                </div>
                <Skeleton variant="text" className="w-40 h-6" />
                <div className="flex gap-4 items-center">
                    <Skeleton variant="text" className="w-20 h-4" />
                    <Skeleton variant="rect" className="w-32 h-12 rounded-xl" />
                </div>
                <div className="flex gap-4">
                    <Skeleton variant="rect" className="flex-1 h-14 rounded-xl" />
                    <Skeleton variant="rect" className="w-40 h-14 rounded-xl" />
                </div>
                <div className="grid grid-cols-3 gap-4 pt-6">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} variant="rect" className="h-12 rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    );
};

export { Skeleton, ProductCardSkeleton, ProductGridSkeleton, ProductDetailSkeleton };
