import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { FiHome, FiHeart, FiShoppingCart, FiUser, FiPackage } from 'react-icons/fi';
import { selectCartItemsCount, openCart } from '../../store/slices/cartSlice';
import { selectCurrentUser } from '../../store/slices/authSlice';

const BottomNav = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const cartItemsCount = useSelector(selectCartItemsCount);
    const user = useSelector(selectCurrentUser);

    const navItems = [
        { name: 'Home', path: '/', icon: FiHome },
        { name: 'Wishlist', path: '/wishlist', icon: FiHeart, requiresAuth: true },
        { name: 'Cart', path: '/cart', icon: FiShoppingCart },
        { name: 'Orders', path: '/orders', icon: FiPackage, requiresAuth: true },
        { name: 'Profile', path: user ? '/profile' : '/auth', icon: FiUser },
    ];

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return path && location.pathname.startsWith(path);
    };

    return (
        <motion.nav
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-primary-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
        >
            <div className="flex items-center justify-around h-16 px-2 safe-area-pb">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    // Skip wishlist if not authenticated
                    if (item.requiresAuth && !user) {
                        return (
                            <Link
                                key={item.name}
                                to="/auth"
                                className="flex flex-col items-center justify-center flex-1 py-2"
                            >
                                <motion.div
                                    whileTap={{ scale: 0.9 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="relative p-1.5">
                                        <Icon
                                            size={22}
                                            className="text-gray-400"
                                        />
                                    </div>
                                    <span className="text-[10px] font-medium mt-0.5 text-gray-400">
                                        {item.name}
                                    </span>
                                </motion.div>
                            </Link>
                        );
                    }

                    // Regular nav links (including Cart)
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className="flex flex-col items-center justify-center flex-1 py-2"
                        >
                            <motion.div
                                whileTap={{ scale: 0.9 }}
                                className="flex flex-col items-center"
                            >
                                <div className="relative inline-block">
                                    <Icon
                                        size={22}
                                        className={active ? 'text-primary-600' : 'text-gray-500'}
                                    />
                                    {item.name === 'Cart' && cartItemsCount > 0 && (
                                        <span className="absolute -top-2.5 -right-2.5 w-4 h-4 bg-primary-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white border border-white shadow-sm z-10">
                                            {cartItemsCount > 9 ? '9+' : cartItemsCount}
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[10px] font-medium mt-0.5 ${active ? 'text-primary-600' : 'text-gray-500'
                                    }`}>
                                    {item.name}
                                </span>
                            </motion.div>
                        </Link>
                    );
                })}
            </div>
        </motion.nav>
    );
};

export default BottomNav;
