import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiX, FiPlus, FiMinus, FiTrash2, FiGift } from 'react-icons/fi';
import {
    selectCartItems,
    selectCartIsOpen,
    selectCartTotal,
    closeCart,
    removeItem,
    updateQuantity,
} from '../../store/slices/cartSlice';
import Button from '../common/Button';

const CartDrawer = () => {
    const dispatch = useDispatch();
    const isOpen = useSelector(selectCartIsOpen);
    const items = useSelector(selectCartItems);
    const total = useSelector(selectCartTotal);

    const handleClose = () => dispatch(closeCart());

    const handleUpdateQuantity = (productId, newQuantity) => {
        dispatch(updateQuantity({ productId, quantity: newQuantity }));
    };

    const handleRemove = (productId) => {
        dispatch(removeItem(productId));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 z-[70] bg-black/20 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed top-0 right-0 bottom-0 z-[80] w-full max-w-md bg-white border-l border-primary-100 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-primary-100 bg-gradient-to-r from-primary-50 to-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center shadow-gold">
                                    <FiGift size={20} className="text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Your Gifts</h2>
                                <span className="px-2 py-0.5 text-sm font-medium bg-primary-100 text-primary-700 rounded-full">
                                    {items.length}
                                </span>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleClose}
                                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-primary-50 transition-colors"
                            >
                                <FiX size={24} />
                            </motion.button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <div className="w-24 h-24 mb-6 rounded-full bg-primary-50 flex items-center justify-center">
                                        <FiGift size={40} className="text-primary-300" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        Your cart is empty
                                    </h3>
                                    <p className="text-gray-500 mb-6">
                                        Start adding beautiful gifts to your cart!
                                    </p>
                                    <Button onClick={handleClose}>
                                        <Link to="/products">Browse Gifts</Link>
                                    </Button>
                                </div>
                            ) : (
                                <AnimatePresence>
                                    {items.map((item) => (
                                        <motion.div
                                            key={item.product._id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: 100 }}
                                            className="flex gap-4 p-4 rounded-xl bg-gradient-to-br from-primary-50/50 to-white border border-primary-100"
                                        >
                                            {/* Product Image */}
                                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary-50 flex-shrink-0">
                                                <img
                                                    src={item.product.images?.[0] || '/placeholder.jpg'}
                                                    alt={item.product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-gray-900 font-medium truncate">
                                                    {item.product.name}
                                                </h3>
                                                <p className="text-primary-600 font-semibold mt-1">
                                                    ₹{item.product.price?.toFixed(2)}
                                                </p>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="flex items-center gap-2">
                                                        <motion.button
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                                                            className="p-1.5 rounded-lg bg-white border border-primary-200 hover:bg-primary-50 text-primary-500 hover:text-primary-600 transition-colors"
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <FiMinus size={14} />
                                                        </motion.button>
                                                        <span className="w-8 text-center text-gray-900 font-medium">
                                                            {item.quantity}
                                                        </span>
                                                        <motion.button
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                                                            className="p-1.5 rounded-lg bg-white border border-primary-200 hover:bg-primary-50 text-primary-500 hover:text-primary-600 transition-colors"
                                                        >
                                                            <FiPlus size={14} />
                                                        </motion.button>
                                                    </div>

                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleRemove(item.product._id)}
                                                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="p-6 border-t border-primary-100 space-y-4 bg-gradient-to-t from-primary-50/50 to-white">
                                {/* Subtotal */}
                                <div className="flex items-center justify-between text-lg">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="text-gray-900 font-bold gradient-text">₹{total.toFixed(2)}</span>
                                </div>

                                <p className="text-sm text-gray-500">
                                    ✨ Free gift wrapping included!
                                </p>

                                {/* Actions */}
                                <div className="space-y-3">
                                    <Button
                                        fullWidth
                                        onClick={handleClose}
                                    >
                                        <Link to="/checkout" className="w-full">
                                            Checkout
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        fullWidth
                                        onClick={handleClose}
                                    >
                                        <Link to="/cart" className="w-full">
                                            View Cart
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;
