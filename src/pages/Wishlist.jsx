import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import placeholderImg from '../assets/images/PNG.png';
import { useGetWishlistQuery, useToggleWishlistMutation } from '../store/api/authApi';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { addItem, openCart } from '../store/slices/cartSlice';
import { addToast } from '../store/slices/uiSlice';
import Button from '../components/common/Button';
import { ProductGridSkeleton } from '../components/common/Skeleton';
import BackButton from '../components/common/BackButton';
import Breadcrumbs from '../components/common/Breadcrumbs';

const Wishlist = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const { data: wishlistData, isLoading } = useGetWishlistQuery(undefined, {
        skip: !isAuthenticated,
    });
    const [toggleWishlist] = useToggleWishlistMutation();

    const wishlistItems = wishlistData?.data || [];

    const handleAddToCart = (product) => {
        dispatch(addItem({
            product: {
                _id: product._id,
                name: product.name,
                price: product.price,
                images: product.images,
            },
            quantity: 1,
        }));
        dispatch(openCart());
        dispatch(addToast({
            type: 'success',
            message: `${product.name} added to cart!`,
        }));
    };

    const handleRemove = async (productId) => {
        try {
            await toggleWishlist(productId).unwrap();
            dispatch(addToast({
                type: 'success',
                message: 'Removed from wishlist',
            }));
        } catch {
            dispatch(addToast({
                type: 'error',
                message: 'Failed to remove item',
            }));
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-[calc(100vh-100px)] pt-20 flex items-center justify-center bg-white">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-pink-50 flex items-center justify-center">
                        <FiHeart size={48} className="text-pink-300" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Sign in to view your wishlist</h1>
                    <p className="text-gray-500 mb-8">Save your favorite items for later</p>
                    <Link to="/auth">
                        <Button size="lg">Sign In</Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-100px)] pt-20 pb-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>
                    <ProductGridSkeleton count={4} />
                </div>
            </div>
        );
    }

    if (wishlistItems.length === 0) {
        return (
            <div className="min-h-[calc(100vh-100px)] pt-20 flex items-center justify-center bg-white">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center px-4"
                >
                    <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 rounded-full bg-pink-50 flex items-center justify-center">
                        <FiHeart size={40} className="text-pink-300" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Your wishlist is empty</h1>
                    <p className="text-gray-500 mb-6 sm:mb-8">Start adding items you love!</p>
                    <Link to="/products">
                        <Button size="lg">Browse Products</Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-100px)] pt-20 sm:pt-24 pb-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <BackButton onClick={() => navigate('/products')} />
                        <Breadcrumbs items={[{ label: 'Wishlist' }]} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Wishlist</h1>
                    <p className="text-gray-500">{wishlistItems.length} items saved</p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {wishlistItems.map((product, index) => (
                        <motion.div
                            key={product._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden group hover:shadow-soft-lg hover:border-gray-200 transition-all duration-300"
                        >
                            <Link to={`/products/${product._id}`}>
                                <div className="relative aspect-square overflow-hidden">
                                    <img
                                        src={product.images?.[0]?.startsWith('http') ? product.images[0] : (product.images?.[0] ? `http://localhost:5000${product.images[0]}` : placeholderImg)}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </Link>

                            <div className="p-5">
                                <Link to={`/products/${product._id}`}>
                                    <h3 className="text-gray-900 font-semibold text-lg mb-2 hover:text-primary-600 transition-colors line-clamp-1">
                                        {product.name}
                                    </h3>
                                </Link>
                                <p className="text-xl font-bold text-primary-600 mb-4">
                                    ₹{product.price?.toFixed(2)}
                                </p>

                                <div className="flex gap-3">
                                    <Button
                                        fullWidth
                                        size="sm"
                                        onClick={() => handleAddToCart(product)}
                                        icon={<FiShoppingCart size={16} />}
                                    >
                                        Add to Cart
                                    </Button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleRemove(product._id)}
                                        className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                    >
                                        <FiTrash2 size={18} />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Wishlist;
