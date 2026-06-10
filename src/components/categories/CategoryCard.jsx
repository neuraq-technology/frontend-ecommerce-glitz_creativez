import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiPackage } from 'react-icons/fi';
import { useState } from 'react';

const CategoryCard = ({ category, index = 0 }) => {
    const [imageError, setImageError] = useState(false);

    return (
        <div className="group">
            <Link to={`/products?category=${category._id}`} className="block">
                <div className="flex flex-col items-center gap-3">
                    {/* Circular Image Container */}
                    <div className="relative w-full aspect-square overflow-hidden rounded-full border-2 border-gray-200 group-hover:border-gray-300 transition-all duration-300 bg-gray-50 flex items-center justify-center">
                        {category.image && !imageError ? (
                            <motion.img
                                src={category.image.startsWith('http') ? category.image : `http://localhost:5000${category.image}`}
                                alt="" // Empty alt to prevent text showing on error
                                className="w-full h-full object-cover"
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full bg-gray-50 transition-colors duration-300 group-hover:bg-gray-100">
                                <FiPackage size={28} className="text-gray-300 group-hover:text-gray-400 transition-colors duration-300" />
                            </div>
                        )}
                    </div>

                    {/* Category Details */}
                    <div className="text-center w-full px-1">
                        <h3 className="text-[13px] font-[600] text-[#333333] leading-tight truncate group-hover:text-[#666666] transition-colors duration-300">
                            {category.name}
                        </h3>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default CategoryCard;
