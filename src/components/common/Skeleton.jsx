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
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-card">
            {/* Image */}
            <Skeleton variant="rect" className="w-full aspect-square" />

            {/* Content */}
            <div className="p-5 space-y-3">
                {/* Category */}
                <Skeleton variant="text" className="w-20 h-3" />

                {/* Title */}
                <Skeleton variant="text" className="w-full h-5" />

                {/* Rating */}
                <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} variant="circle" className="w-4 h-4" />
                    ))}
                </div>

                {/* Price */}
                <Skeleton variant="text" className="w-24 h-6" />
            </div>
        </div>
    );
};

// Product Grid Skeleton
const ProductGridSkeleton = ({ count = 8 }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
