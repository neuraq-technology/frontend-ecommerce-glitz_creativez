import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import {
    FiShoppingCart,
    FiHeart,
    FiUser,
    FiSearch,
    FiMenu,
    FiX,
    FiLogOut,
    FiGift,
    FiBell,
    FiPackage,
} from 'react-icons/fi';
import logoImg from '../../assets/images/PNG.png';
import { selectCartItemsCount, openCart } from '../../store/slices/cartSlice';
import { selectCurrentUser, logout } from '../../store/slices/authSlice';
import { useGetWishlistQuery } from '../../store/api/authApi';


const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Secret Admin Login State
    const [clickCount, setClickCount] = useState(0);
    const [clickTimer, setClickTimer] = useState(null);

    const handleLogoClick = (e) => {
        setClickCount(prev => prev + 1);

        if (clickTimer) {
            clearTimeout(clickTimer);
        }

        // Set a timer to reset count if not clicked again within 2 seconds
        const timer = setTimeout(() => {
            setClickCount(0);
        }, 2000);
        setClickTimer(timer);
    };

    // Check count effect
    useEffect(() => {
        if (clickCount >= 3) {
            setClickCount(0);
            if (clickTimer) clearTimeout(clickTimer);
            navigate('/admin/auth');
        }
    }, [clickCount, clickTimer, navigate]);



    const cartItemsCount = useSelector(selectCartItemsCount);
    const user = useSelector(selectCurrentUser);

    // Fetch wishlist data (skip if not logged in)
    const { data: wishlistData } = useGetWishlistQuery(undefined, {
        skip: !user,
    });

    const wishlistCount = wishlistData?.data?.length || 0;

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
            setIsSearchOpen(false); // Close desktop search modal if open
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Shop Gifts', path: '/products' },
        { name: 'Categories', path: '/products?view=categories' },
    ];

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-300
          border-b border-primary-100
          ${isScrolled
                        ? 'bg-white/95 backdrop-blur-xl shadow-gold'
                        : 'bg-white/80 backdrop-blur-sm'
                    }
        `}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Desktop Layout */}
                    <div className="hidden md:flex items-center justify-between h-20">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-2">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="flex items-center gap-2"
                                onClick={handleLogoClick}
                            >
                                <img src={logoImg} alt="Glitz Creativez" className="h-16 w-auto" />
                            </motion.div>
                        </Link>

                        {/* Search Bar */}
                        <div className="flex flex-1 justify-center px-8">
                            <form onSubmit={handleSearch} className="w-full max-w-md">
                                <div className="relative">
                                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search..."
                                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-white caret-primary-600 transition-all text-sm"
                                    />
                                </div>
                            </form>
                        </div>

                        {/* Right Icons */}
                        <div className="flex items-center space-x-4">
                            {user && (
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                    <Link to="/wishlist" className="p-2 text-gray-500 hover:text-primary-600 transition-colors">
                                        <div className="relative inline-block">
                                            <FiHeart size={22} />
                                            {wishlistCount > 0 && (
                                                <span className="absolute -top-3 -right-3 w-5 h-5 bg-pink-500 rounded-full text-xs font-bold flex items-center justify-center text-white shadow-sm border border-white z-10">
                                                    {wishlistCount}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                </motion.div>
                            )}

                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                <Link
                                    to="/cart"
                                    className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                                >
                                    <div className="relative inline-block">
                                        <FiShoppingCart size={22} />
                                        {cartItemsCount > 0 && (
                                            <span className="absolute -top-3 -right-3 w-5 h-5 bg-primary-500 rounded-full text-xs font-bold flex items-center justify-center text-white shadow-sm border border-white z-10">
                                                {cartItemsCount}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            </motion.div>

                            {/* User Menu consolidation */}
                            {user ? (
                                <div className="relative group">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                                    >
                                        <FiUser size={22} />
                                    </motion.button>

                                    {/* Dropdown */}
                                    <div className="absolute right-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60]">
                                        <div className="bg-white rounded-xl shadow-soft-lg border border-primary-100 p-2 mt-2">
                                            {user.isAdmin && (
                                                <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-primary-600 font-medium hover:bg-primary-50 rounded-lg transition-colors">
                                                    <FiGift size={16} /> Admin Dashboard
                                                </Link>
                                            )}
                                            <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                                <FiUser size={16} /> Profile
                                            </Link>
                                            <Link to="/orders" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                                <FiPackage size={16} /> My Orders
                                            </Link>
                                            <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <FiLogOut size={16} /> Logout
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Link to="/auth">
                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-primary text-sm">
                                        Sign In
                                    </motion.button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile Layout - Two Rows: Logo on top, Search + Icons below */}
                    <div className={`md:hidden flex flex-col ${location.pathname === '/profile' ? 'py-5' : 'py-3 space-y-3'}`}>
                        {/* Top Row: Centered Logo */}
                        <div className="flex items-center justify-center w-full">
                            <Link to="/" className="flex items-center gap-2">
                                <img src={logoImg} alt="Glitz Creativez" className="h-12 w-auto" />
                            </Link>
                        </div>

                        {/* Bottom Row: Search Bar + Action Icons - Hidden on Profile page */}
                        {location.pathname !== '/profile' && (
                            <div className="flex items-center gap-2">
                                {/* Search Bar - Full width on home/wishlist/cart/orders pages */}
                                <form onSubmit={handleSearch} className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search 'Products'"
                                        className="w-full pl-4 pr-10 py-2.5 bg-gray-100 border border-gray-200 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 caret-primary-600 transition-all text-sm"
                                    />
                                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors">
                                        <FiSearch size={18} />
                                    </button>
                                </form>

                                {/* Right Action Icons - Hide on home/wishlist/cart/orders pages */}
                                {!['/'].includes(location.pathname) &&
                                    !location.pathname.startsWith('/wishlist') &&
                                    !location.pathname.startsWith('/cart') &&
                                    !location.pathname.startsWith('/orders') && (
                                        <div className="flex items-center gap-1">
                                            {/* Cart Icon */}
                                            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors">
                                                <FiShoppingCart size={20} />
                                                {cartItemsCount > 0 && (
                                                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white shadow-sm">
                                                        {cartItemsCount > 9 ? '9+' : cartItemsCount}
                                                    </span>
                                                )}
                                            </Link>

                                            {/* Wishlist Icon */}
                                            <Link to={user ? "/wishlist" : "/auth"} className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors">
                                                <FiHeart size={20} />
                                                {user && wishlistCount > 0 && (
                                                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-pink-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white shadow-sm">
                                                        {wishlistCount > 9 ? '9+' : wishlistCount}
                                                    </span>
                                                )}
                                            </Link>

                                            {/* Profile Icon */}
                                            <Link to={user ? "/profile" : "/auth"} className="p-2 text-gray-600 hover:text-primary-600 transition-colors">
                                                <FiUser size={20} />
                                            </Link>
                                        </div>
                                    )}
                            </div>
                        )}
                    </div>
                </div>
            </motion.nav>

            {/* Desktop Search Modal */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-start justify-center pt-32"
                        onClick={() => setIsSearchOpen(false)}
                    >
                        <motion.form
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            onSubmit={handleSearch}
                            className="w-full max-w-2xl mx-4"
                        >
                            <div className="relative">
                                <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-400" size={24} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for the perfect gift..."
                                    autoFocus
                                    className="w-full pl-16 pr-6 py-5 text-xl bg-white border border-primary-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 shadow-gold-lg transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsSearchOpen(false)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <FiX size={24} />
                                </button>
                            </div>
                        </motion.form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
