import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { FiPlus, FiMinus, FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import placeholderImg from '../assets/images/PNG.png';
import {
    selectCartItems,
    selectCartTotal,
    removeItem,
    updateQuantity,
    clearCart,
} from '../store/slices/cartSlice';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import Button from '../components/common/Button';
import BackButton from '../components/common/BackButton';
import Breadcrumbs from '../components/common/Breadcrumbs';

const Cart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const items = useSelector(selectCartItems);
    const subtotal = useSelector(selectCartTotal);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const taxRate = 0.1;
    const shippingCost = subtotal > 100 ? 0 : 10;
    const tax = subtotal * taxRate;
    const total = subtotal + tax + shippingCost;

    const handleUpdateQuantity = (productId, newQuantity) => {
        dispatch(updateQuantity({ productId, quantity: newQuantity }));
    };

    const handleRemove = (productId) => {
        dispatch(removeItem(productId));
    };

    if (items.length === 0) {
        return (
            <div className="min-h-[calc(100vh-100px)] pt-20 flex items-center justify-center bg-white">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center px-4"
                >
                    <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <FiShoppingBag size={40} className="text-gray-400" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Your cart is empty</h1>
                    <p className="text-gray-500 mb-6 sm:mb-8 max-w-md mx-auto">
                        Looks like you haven't added any items to your cart yet.
                    </p>
                    <Link to="/products">
                        <Button size="lg" icon={<FiArrowRight />} iconPosition="right">
                            Start Shopping
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-100px)] pt-20 sm:pt-24 pb-8 sm:pb-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    width="full"
                    className="mb-4 sm:mb-8"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <BackButton onClick={() => navigate('/products')} />
                        <Breadcrumbs items={[{ label: 'Cart' }]} />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Shopping Cart</h1>
                            <p className="text-sm sm:text-base text-gray-500">{items.length} items in your cart</p>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={() => dispatch(clearCart())}
                            icon={<FiTrash2 />}
                        >
                            Clear Cart
                        </Button>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        <AnimatePresence>
                            {items.map((item, index) => {
                                const cartId = item.cartItemId || item.product._id;
                                return (
                                    <motion.div
                                        key={cartId}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 100 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white rounded-2xl border border-gray-100 shadow-card p-6"
                                    >
                                        <div className="flex flex-row gap-4 sm:gap-6">
                                            {/* Image */}
                                            <Link to={`/products/${item.product._id}`} className="flex-shrink-0">
                                                <motion.div
                                                    whileHover={{ scale: 1.05 }}
                                                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-gray-50"
                                                >
                                                    <img
                                                        src={item.product.images?.[0]?.startsWith('http') ? item.product.images[0] : (item.product.images?.[0] ? `http://localhost:5000${item.product.images[0]}` : placeholderImg)}
                                                        alt={item.product.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                                                    />
                                                </motion.div>
                                            </Link>

                                            {/* Info */}
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <Link to={`/products/${item.product._id}`}>
                                                        <h3 className="text-base sm:text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2">
                                                            {item.product.name}
                                                        </h3>
                                                    </Link>
                                                    {item.product.size && (
                                                        <p className="text-sm font-medium text-gray-500 mt-1">Size: {item.product.size}</p>
                                                    )}
                                                    <p className="text-lg sm:text-2xl font-bold text-primary-600 mt-1">
                                                        ₹{item.product.price?.toFixed(2)}
                                                    </p>
                                                </div>

                                                <div className="flex flex-wrap items-end justify-between gap-3 mt-2 sm:mt-4">
                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-xl bg-gray-50 border border-gray-200">
                                                        <motion.button
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleUpdateQuantity(cartId, item.quantity - 1)}
                                                            disabled={item.quantity <= 1}
                                                            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                                                        >
                                                            <FiMinus size={14} className="sm:w-4 sm:h-4" />
                                                        </motion.button>
                                                        <span className="w-8 sm:w-12 text-center text-gray-900 font-semibold text-sm sm:text-lg">
                                                            {item.quantity}
                                                        </span>
                                                        <motion.button
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleUpdateQuantity(cartId, item.quantity + 1)}
                                                            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                                                        >
                                                            <FiPlus size={14} className="sm:w-4 sm:h-4" />
                                                        </motion.button>
                                                    </div>

                                                    {/* Total & Remove */}
                                                    <div className="flex items-center gap-3 sm:gap-4 ml-auto sm:ml-0">
                                                        <span className="text-base sm:text-xl font-bold text-gray-900">
                                                            ₹{(item.product.price * item.quantity).toFixed(2)}
                                                        </span>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleRemove(cartId)}
                                                            className="p-2 sm:p-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                                                        >
                                                            <FiTrash2 size={18} className="sm:w-5 sm:h-5" />
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 sm:p-6 sticky top-28"
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span>
                                        {shippingCost === 0 ? (
                                            <span className="text-green-600">Free</span>
                                        ) : (
                                            `₹${shippingCost.toFixed(2)}`
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax (10%)</span>
                                    <span>₹{tax.toFixed(2)}</span>
                                </div>
                                <div className="pt-4 border-t border-gray-200">
                                    <div className="flex justify-between text-xl font-bold text-gray-900">
                                        <span>Total</span>
                                        <span>₹{total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {subtotal > 0 && subtotal < 100 && (
                                <div className="mb-6 p-4 rounded-xl bg-primary-50 border border-primary-100">
                                    <p className="text-sm text-primary-700">
                                        Add ₹{(100 - subtotal).toFixed(2)} more for free shipping!
                                    </p>
                                    <div className="mt-2 h-2 bg-primary-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(subtotal / 100) * 100}%` }}
                                            className="h-full bg-gradient-to-r from-primary-500 to-purple-500"
                                        />
                                    </div>
                                </div>
                            )}

                            <Button
                                fullWidth
                                size="lg"
                                icon={<FiArrowRight />}
                                iconPosition="right"
                                onClick={() => isAuthenticated ? navigate('/checkout') : navigate('/auth')}
                            >
                                Proceed to Checkout
                            </Button>

                            <Link to="/products" className="block mt-4">
                                <Button variant="ghost" fullWidth>
                                    Continue Shopping
                                </Button>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
