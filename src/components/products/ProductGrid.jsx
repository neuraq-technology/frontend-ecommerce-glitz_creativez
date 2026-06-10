import { motion } from 'framer-motion';
import ProductCard from './ProductCard';

const ProductGrid = ({ products = [], columns = 4, wishlist = [] }) => {
    // Mobile: 2 columns (Myntra-style), Desktop: responsive columns
    const gridCols = {
        2: 'grid-cols-2 sm:grid-cols-2',
        3: 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
        5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
    };

    // Safety check for undefined/null products
    if (!products || products.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        duration: 0.4
                    },
                },
            }}
            className={`grid ${gridCols[columns]} gap-2 sm:gap-6`}
        >
            {products.map((product, index) => (
                <ProductCard
                    key={product._id}
                    product={product}
                    index={index % 12}
                    wishlist={wishlist}
                />
            ))}
        </motion.div>
    );
};

export default ProductGrid;
