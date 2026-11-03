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
    FiPackage,
} from 'react-icons/fi';
import logoImg from '../../assets/images/PNG.png';
import { selectCartItemsCount } from '../../store/slices/cartSlice';
import { selectCurrentUser, logout } from '../../store/slices/authSlice';
import { useGetWishlistQuery } from '../../store/api/authApi';

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const [isScrolled, setIsScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const user = useSelector(selectCurrentUser);
    const cartItemsCount = useSelector(selectCartItemsCount);
    const { data: wishlistData } = useGetWishlistQuery(undefined, {
        skip: !user,
    });
    const wishlistCount = wishlistData?.data?.length || 0;

    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    setIsScrolled(window.scrollY > 30);
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchOpen(false);
            setSearchQuery('');
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    const handleLogoClick = (e) => {
        if (location.pathname === '/') {
            e.preventDefault();
            try {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch {
                window.scrollTo(0, 0);
            }
        }
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Shop Gifts', path: '/products' },
        { name: 'Categories', path: '/products?view=categories' },
    ];

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50">
                <nav
                    className={`
                        w-full bg-white transition-shadow duration-200
                        ${isScrolled
                            ? 'shadow-md border-b border-gray-100'
                            : 'border-b border-gray-100/80'
                        }
                    `}
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* ================= DESKTOP LAYOUT (OPTION A) ================= */}
                        <div className="hidden md:flex flex-col">
                            {/* Row 1: ONLY the Brand Logo Centered on Top */}
                            <div className="flex items-center justify-center py-2.5">
                                <Link to="/" onClick={handleLogoClick} className="flex items-center justify-center group">
                                    <motion.div
                                        whileHover={{ scale: 1.04 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <img
                                            src={logoImg}
                                            alt="Glitz Creativez"
                                            className="h-16 lg:h-18 w-auto object-contain drop-shadow-xs"
                                        />
                                    </motion.div>
                                </Link>
                            </div>

                            {/* Row 2: All Other Elements on the Same Line:
                                [ Home • Shop Gifts • Categories ] (Left)
                                [ Search Bar ] (Center)
                                [ Wishlist • Cart • Profile ] (Right)
                            */}
                            <div className="flex items-center justify-between py-2 border-t border-gray-100/80 gap-4 lg:gap-6">
                                {/* Left: Navigation Links */}
                                <div className="flex items-center gap-5 lg:gap-7 flex-shrink-0">
                                    {navLinks.map((link) => {
                                        const isActive = location.pathname === link.path;
                                        return (
                                            <Link
                                                key={link.name}
                                                to={link.path}
                                                onClick={(e) => {
                                                    if (link.path === '/' && location.pathname === '/') {
                                                        handleLogoClick(e);
                                                    }
                                                }}
                                                className={`text-xs lg:text-sm font-semibold tracking-wide transition-all relative py-1 group ${
                                                    isActive ? 'text-[#FF64B4]' : 'text-gray-700 hover:text-[#FF64B4]'
                                                }`}
                                            >
                                                {link.name}
                                                <span className={`absolute -bottom-0.5 left-0 h-0.5 bg-[#FF64B4] transition-all duration-300 rounded-full ${
                                                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                                                }`}></span>
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* Center: Search Bar */}
                                <div className="flex-1 max-w-xs lg:max-w-md mx-2">
                                    <form onSubmit={handleSearch} className="relative group">
                                        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF64B4] transition-colors" size={17} />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search gifts, hampers..."
                                            className="w-full pl-10 pr-4 py-2 bg-gray-50/80 border border-gray-200 rounded-full text-xs lg:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#FF64B4] focus:bg-white focus:ring-2 focus:ring-[#FF64B4]/20 transition-all shadow-inner"
                                        />
                                    </form>
                                </div>

                                {/* Right Side: Actions (Wishlist, Cart, Profile) */}
                                <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
                                    {user && (
                                        <Link
                                            to="/wishlist"
                                            className="relative p-2.5 text-gray-600 hover:text-[#FF64B4] hover:bg-pink-50 rounded-full transition-all group"
                                            title="My Wishlist"
                                        >
                                            <FiHeart size={21} className="group-hover:scale-110 transition-transform" />
                                            {wishlistCount > 0 && (
                                                <span className="absolute top-0 right-0 w-4 h-4 bg-[#FF64B4] rounded-full text-[10px] font-bold flex items-center justify-center text-white shadow-xs">
                                                    {wishlistCount > 9 ? '9+' : wishlistCount}
                                                </span>
                                            )}
                                        </Link>
                                    )}

                                    <Link
                                        to="/cart"
                                        className="relative p-2.5 text-gray-600 hover:text-[#FF64B4] hover:bg-pink-50 rounded-full transition-all group"
                                        title="Shopping Cart"
                                    >
                                        <FiShoppingCart size={21} className="group-hover:scale-110 transition-transform" />
                                        {cartItemsCount > 0 && (
                                            <span className="absolute top-0 right-0 w-4 h-4 bg-[#FF64B4] rounded-full text-[10px] font-bold flex items-center justify-center text-white shadow-xs">
                                                {cartItemsCount > 9 ? '9+' : cartItemsCount}
                                            </span>
                                        )}
                                    </Link>

                                    {/* User Menu */}
                                    {user ? (
                                        <div className="relative group ml-1">
                                            <button className="p-2.5 text-gray-600 hover:text-[#FF64B4] hover:bg-pink-50 rounded-full transition-all">
                                                <FiUser size={21} className="group-hover:scale-110 transition-transform" />
                                            </button>

                                            <div className="absolute right-0 mt-1 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-[60]">
                                                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 overflow-hidden">
                                                    <div className="px-4 py-3 border-b border-gray-100 mb-2">
                                                        <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                                                        <p className="text-xs text-gray-500 truncate">{user.email || user.phone}</p>
                                                    </div>
                                                    {user.isAdmin && (
                                                        <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#FF64B4] font-medium hover:bg-pink-50 rounded-xl transition-colors">
                                                            <FiGift size={16} /> Admin Dashboard
                                                        </Link>
                                                    )}
                                                    <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:text-[#FF64B4] hover:bg-pink-50 rounded-xl transition-colors">
                                                        <FiUser size={16} /> My Profile
                                                    </Link>
                                                    <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:text-[#FF64B4] hover:bg-pink-50 rounded-xl transition-colors">
                                                        <FiPackage size={16} /> Order History
                                                    </Link>
                                                    <div className="h-px bg-gray-100 my-1"></div>
                                                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
                                                        <FiLogOut size={16} /> Sign Out
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <Link to="/auth" className="ml-1">
                                            <button className="bg-[#FF64B4] hover:bg-[#e0529f] text-white font-bold text-xs lg:text-sm px-4 lg:px-5 py-2 rounded-xl shadow-xs transition-all">
                                                Sign In
                                            </button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ================= MOBILE & TABLET LAYOUT ================= */}
                        <div className={`md:hidden flex flex-col ${location.pathname === '/profile' ? 'py-3' : 'py-2.5 space-y-2.5'}`}>
                            {/* Centered Large Brand Logo */}
                            <div className="flex items-center justify-center w-full">
                                <Link to="/" onClick={handleLogoClick} className="flex items-center justify-center">
                                    <img
                                        src={logoImg}
                                        alt="Glitz Creativez"
                                        className="h-16 sm:h-20 w-auto object-contain transition-all duration-300 drop-shadow-xs"
                                    />
                                </Link>
                            </div>

                            {/* Mobile Search Row + Action Icons */}
                            {location.pathname !== '/profile' && (
                                <div className="flex items-center gap-2">
                                    <form onSubmit={handleSearch} className="flex-1 relative group">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search for gifts, hampers, cakes..."
                                            className="w-full pl-4 pr-10 py-2 bg-gray-50/90 border border-gray-200 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#FF64B4] focus:bg-white focus:ring-2 focus:ring-[#FF64B4]/20 caret-[#FF64B4] transition-all text-xs sm:text-sm shadow-inner"
                                        />
                                        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF64B4] transition-colors">
                                            <FiSearch size={16} />
                                        </button>
                                    </form>

                                    {/* Mobile Quick Actions (Wishlist & Cart) */}
                                    <div className="flex items-center gap-1">
                                        <Link
                                            to={user ? "/wishlist" : "/auth"}
                                            className="relative p-2 text-gray-600 hover:text-[#FF64B4] transition-colors"
                                            title="Wishlist"
                                        >
                                            <FiHeart size={20} />
                                            {user && wishlistCount > 0 && (
                                                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#FF64B4] rounded-full text-[10px] font-bold flex items-center justify-center text-white shadow-xs">
                                                    {wishlistCount > 9 ? '9+' : wishlistCount}
                                                </span>
                                            )}
                                        </Link>

                                        <Link
                                            to="/cart"
                                            className="relative p-2 text-gray-600 hover:text-[#FF64B4] transition-colors"
                                            title="Cart"
                                        >
                                            <FiShoppingCart size={20} />
                                            {cartItemsCount > 0 && (
                                                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#FF64B4] rounded-full text-[10px] font-bold flex items-center justify-center text-white shadow-xs">
                                                    {cartItemsCount > 9 ? '9+' : cartItemsCount}
                                                </span>
                                            )}
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>
            </header>

            {/* Desktop Search Modal (fallback if triggered) */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/60 flex items-start justify-center pt-32"
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
                                <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-[#FF64B4]" size={22} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for the perfect gift..."
                                    autoFocus
                                    className="w-full pl-16 pr-6 py-4 text-lg bg-white border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#FF64B4] focus:ring-4 focus:ring-[#FF64B4]/10 shadow-xl transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsSearchOpen(false)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <FiX size={22} />
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
