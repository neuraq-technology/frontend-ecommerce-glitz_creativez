import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';
import placeholderImg from '../../assets/images/PNG.png';

const ProductCard = ({ product, index = 0 }) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const discount = product.originalPrice && product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    const imageSrc = product.images?.[0]?.startsWith('http')
        ? product.images[0]
        : (product.images?.[0] ? `${API_URL}${product.images[0]}` : placeholderImg);

    const rawPrice = typeof product.price === 'number'
        ? product.price
        : parseFloat(String(product.price).replace(/[^0-9.]/g, '')) || 0;
    const formattedPrice = `₹ ${Math.round(rawPrice).toLocaleString('en-IN')}`;

    const rawOriginalPrice = product.originalPrice
        ? (typeof product.originalPrice === 'number'
            ? product.originalPrice
            : parseFloat(String(product.originalPrice).replace(/[^0-9.]/g, '')) || 0)
        : 0;
    const formattedOriginalPrice = rawOriginalPrice > rawPrice
        ? `₹ ${Math.round(rawOriginalPrice).toLocaleString('en-IN')}`
        : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
            className="group relative h-full flex flex-col"
        >
            <Link
                to={`/products/${product._id}`}
                className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-200/80 hover:border-gray-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full"
            >
                {/* 1. Image Container (Clean 4:3 Photographic Ratio) */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <img
                        src={imageSrc}
                        alt={product.name}
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out ${
                            product.stock <= 0 ? 'grayscale opacity-75' : ''
                        }`}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = placeholderImg;
                        }}
                    />

                    {/* Floating Badges (Top-Left) */}
                    <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex flex-col gap-1.5 z-10">
                        {product.stock <= 0 ? (
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-full shadow-2xs border border-rose-200">
                                Out of Stock
                            </span>
                        ) : discount > 0 ? (
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-900 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-full shadow-2xs">
                                {discount}% OFF
                            </span>
                        ) : product.featured ? (
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-900 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-full shadow-2xs">
                                Bestseller
                            </span>
                        ) : null}
                    </div>

                    {/* Rating Badge (Bottom-Left) */}
                    {product.rating > 0 && (
                        <div className="absolute bottom-2 left-2 sm:bottom-2.5 sm:left-3 flex items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-full shadow-2xs text-[9px] sm:text-[10px] font-bold text-gray-800">
                            <span>{Number(product.rating).toFixed(1)}</span>
                            <FiStar size={10} className="text-amber-400 fill-amber-400" />
                            {product.numReviews > 0 && (
                                <span className="text-gray-400 font-normal">({product.numReviews})</span>
                            )}
                        </div>
                    )}
                </div>

                {/* 2. Content Area */}
                <div className="p-3.5 sm:p-5 flex flex-col flex-1 justify-between">
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-1">
                            {product.name}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-gray-500 mt-1 line-clamp-2">
                            {product.shortDescription || product.description || (product.category?.name ? `Category: ${product.category.name}` : 'Handcrafted celebration gift')}
                        </p>
                    </div>

                    {/* 3. Bottom Row: Solid Black Price & Discounts (Uncluttered) */}
                    <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className="text-sm sm:text-lg font-black text-gray-900">
                                {formattedPrice}
                            </span>
                            {formattedOriginalPrice && (
                                <span className="text-[10px] sm:text-xs text-gray-400 line-through font-medium">
                                    {formattedOriginalPrice}
                                </span>
                            )}
                        </div>

                        {discount > 0 && (
                            <span className="text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                {discount}% OFF
                            </span>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default ProductCard;
