import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { FiFilter, FiX, FiChevronDown, FiStar, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { useGetProductsQuery, useGetCategoriesQuery } from '../store/api/productsApi';
import { useGetWishlistQuery } from '../store/api/authApi';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import ProductGrid from '../components/products/ProductGrid';
import Button from '../components/common/Button';
import BackButton from '../components/common/BackButton';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { ProductGridSkeleton } from '../components/common/Skeleton';

const Products = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const isAuthenticated = useSelector(selectIsAuthenticated);

    // Fetch wishlist once for the whole page to avoid redundant calls in ProductCard
    const { data: wishlistData } = useGetWishlistQuery(undefined, {
        skip: !isAuthenticated,
    });

    const wishlist = wishlistData?.data || [];

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false); // Used for Price Range
    const [isSortByOpen, setIsSortByOpen] = useState(false);
    const [isMobileSortOpen, setIsMobileSortOpen] = useState(false);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Infinite Scroll State
    const [page, setPage] = useState(1);
    const [allProducts, setAllProducts] = useState([]);
    const observerRef = useRef();
    const loadMoreRef = useRef();


    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Get query params
    const category = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || 'newest';
    const search = searchParams.get('search') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const featured = searchParams.get('featured') || '';

    // Local filter state
    const [filters, setFilters] = useState({
        category,
        sort,
        minPrice,
        maxPrice,
        priceRange: '',
        featured,
    });

    // Reset page and products when filters change
    useEffect(() => {
        setPage(1);
        setAllProducts([]);
    }, [filters, search]);


    // Queries
    const { data: productsData, isLoading, isFetching } = useGetProductsQuery({
        page,
        limit: 12,
        category: filters.category,
        sort: filters.sort,
        search,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        featured: filters.featured,
    });

    const { data: categoriesData } = useGetCategoriesQuery();

    // Accumulate products
    useEffect(() => {
        if (productsData?.data) {
            if (page === 1) {
                setAllProducts(productsData.data);
            } else {
                setAllProducts(prev => {
                    // Filter out duplicates just in case
                    const newProducts = productsData.data.filter(p => !prev.find(existing => existing._id === p._id));
                    return [...prev, ...newProducts];
                });
            }
        }
    }, [productsData, page]);


    // Update URL when filters change (but NOT called on page change anymore)
    useEffect(() => {
        const params = new URLSearchParams();
        // Removed page param setting
        if (filters.category) params.set('category', filters.category);
        if (filters.sort !== 'newest') params.set('sort', filters.sort);
        if (search) params.set('search', search);
        if (filters.minPrice) params.set('minPrice', filters.minPrice);
        if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
        if (filters.featured) params.set('featured', filters.featured);

        setSearchParams(params);
    }, [filters, search, setSearchParams]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            category: '',
            sort: 'newest',
            minPrice: '',
            maxPrice: '',
            priceRange: '',
            featured: '',
        });
    };

    // Infinite Scroll Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !isFetching && productsData?.page < productsData?.pages) {
                    setPage(prev => prev + 1);
                }
            },
            { threshold: 0, rootMargin: '0px 0px 500px 0px' }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        observerRef.current = observer;

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [isFetching, productsData]);


    const hasActiveFiltersOnly = filters.category || filters.priceRange || filters.featured;
    const hasActiveSort = filters.sort !== 'newest';
    const hasActiveFilters = hasActiveFiltersOnly || hasActiveSort;

    const sortOptions = [
        { value: 'newest', label: 'Newest' },
        { value: 'bestselling', label: 'Best Selling' },
        { value: 'price-asc', label: 'Price: Low to High' },
        { value: 'price-desc', label: 'Price: High to Low' },
        { value: 'rating', label: 'Top Rated' },
        { value: 'name', label: 'Name: A-Z' },
    ];

    // Get selected category name
    const selectedCategory = categoriesData?.data?.find(cat => cat._id === filters.category);

    // Breadcrumbs
    const breadcrumbs = [];
    if (selectedCategory || search) {
        breadcrumbs.push({ label: 'Products', path: '/products' });
        if (selectedCategory) breadcrumbs.push({ label: selectedCategory.name });
        if (search) breadcrumbs.push({ label: `Search: ${search}` });
    } else {
        breadcrumbs.push({ label: 'Products' });
    }

    return (
        <div className="min-h-screen pt-24 pb-16 bg-white">
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">


                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    {/* Back button and breadcrumbs - hidden on mobile */}
                    <div className="hidden sm:flex items-center gap-4 mb-6">
                        <BackButton onClick={() => navigate('/')} />
                        <Breadcrumbs items={breadcrumbs} />
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mt-4 sm:mt-0 tracking-tight">
                        {search ? (
                            <span className="text-gray-900">Results for "{search}"</span>
                        ) : selectedCategory ? (
                            <span className="text-gray-900">{selectedCategory.name}</span>
                        ) : (
                            <><span className="text-[#FF64B4]">All</span> <span className="text-[#4cc9f0]">Products</span></>
                        )}
                    </h1>
                </motion.div>

                {/* New Top Filter Bar (Desktop & Mobile) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col md:flex-row items-center justify-start gap-4 md:gap-8 mb-8 p-3 sm:px-4 sm:py-3 rounded-xl bg-gray-50 border border-gray-100"
                >
                    {/* Left side: Category & Items Count */}
                    <div className="flex items-center gap-2 font-semibold whitespace-nowrap">
                        <span className="text-gray-900 text-lg sm:text-lg">
                            {filters.featured === 'true'
                                ? 'Best Selling'
                                : selectedCategory?.name || 'All Products'}
                        </span>
                        <span className="text-gray-500 font-normal text-sm sm:text-base">
                            ({productsData?.total || 0} items)
                        </span>
                    </div>

                    {/* Right side: Filters & Sort */}
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start">

                        {/* Filter By Price */}
                        <div className="relative">
                            <button
                                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                                className="flex flex-col items-center px-3 py-1.5 focus:outline-none"
                            >
                                <span className="text-[11px] font-bold text-gray-800 uppercase tracking-widest leading-tight">Filter By Price</span>
                                <div className="flex items-center gap-1 mt-0.5 text-sm font-bold text-primary-600">
                                    <span className="truncate">
                                        {filters.priceRange === 'below-500' ? 'Below ₹500' :
                                            filters.priceRange === '500-1000' ? '₹500 - ₹1,000' :
                                                filters.priceRange === '1000-2000' ? '₹1,000 - ₹2,000' :
                                                    filters.priceRange === 'above-2000' ? 'Above ₹2,000' : 'All Products'}
                                    </span>
                                    <FiChevronDown className={`transition-transform text-gray-500 ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
                                </div>
                            </button>
                            <AnimatePresence>
                                {isSortDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsSortDropdownOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 5 }}
                                            className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
                                        >
                                        {[
                                            { value: '', label: 'All Products', min: '', max: '' },
                                            { value: 'below-500', label: 'Below ₹500', min: '', max: '500' },
                                            { value: '500-1000', label: '₹500 - ₹1,000', min: '500', max: '1000' },
                                            { value: '1000-2000', label: '₹1,000 - ₹2,000', min: '1000', max: '2000' },
                                            { value: 'above-2000', label: 'Above ₹2,000', min: '2000', max: '' },
                                        ].map(option => (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    setFilters(prev => ({
                                                        ...prev,
                                                        priceRange: option.value,
                                                        minPrice: option.min,
                                                        maxPrice: option.max,
                                                    }));
                                                    setIsSortDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${filters.priceRange === option.value ? 'bg-[#FF64B4]/10 text-[#FF64B4] font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="w-px h-8 bg-gray-300 hidden sm:block"></div>

                        {/* Sort By */}
                        <div className="relative">
                            <button
                                onClick={() => setIsSortByOpen(!isSortByOpen)}
                                className="flex flex-col items-center px-3 py-1.5 focus:outline-none"
                            >
                                <span className="text-[11px] font-bold text-gray-800 uppercase tracking-widest leading-tight">Sort By</span>
                                <div className="flex items-center gap-1 mt-0.5 text-sm font-bold text-[#4cc9f0]">
                                    <span>
                                        {sortOptions.find(o => o.value === filters.sort)?.label || 'Popularity'}
                                    </span>
                                    <FiChevronDown className={`transition-transform text-gray-500 ${isSortByOpen ? 'rotate-180' : ''}`} />
                                </div>
                            </button>
                            <AnimatePresence>
                                {isSortByOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsSortByOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 5 }}
                                            className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
                                        >
                                        {[
                                            { value: 'bestselling', label: 'Popularity' },
                                            ...sortOptions.filter(o => o.value !== 'bestselling')
                                        ].map(option => (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    handleFilterChange('sort', option.value);
                                                    setIsSortByOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${filters.sort === option.value ? 'bg-[#4cc9f0]/10 text-[#4cc9f0] font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>

                {/* Products Grid Container */}
                <div className="w-full min-h-[800px]">
                    <ProductGrid
                        products={allProducts}
                        columns={4}
                        wishlist={wishlist}
                    />

                    {/* Infinite Scroll Sentinel / Skeleton */}
                    <div ref={loadMoreRef} className="pt-12">
                        {isFetching && page > 1 && (
                            <ProductGridSkeleton count={4} />
                        )}
                    </div>

                    {/* End of list message */}
                    {!isFetching && productsData?.page === productsData?.pages && allProducts.length > 0 && (
                        <div className="text-center text-gray-400 py-12 font-medium">
                            You&apos;ve viewed all available products
                        </div>
                    )}

                    {/* Empty State (when not loading) */}
                    {!isFetching && !isLoading && allProducts.length === 0 && (
                        <div className="text-center py-24">
                            <h3 className="text-xl font-semibold text-gray-900">No products match your criteria</h3>
                            <p className="text-gray-500 mt-2">Try clearing filters or using different keywords.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Fixed Bottom Bar - Sort & Filter - Rendered via Portal */}
            {
                typeof document !== 'undefined' && createPortal(
                    <>
                        {/* Bottom Bar */}
                        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[9999]">
                            <div className="flex">
                                <button
                                    onClick={() => {
                                        if (hasActiveSort) {
                                            handleFilterChange('sort', 'newest');
                                        } else {
                                            setIsMobileSortOpen(true);
                                        }
                                    }}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium border-r active:bg-gray-50 ${hasActiveSort
                                        ? 'text-rose-500 border-t-2 border-t-rose-400'
                                        : 'text-gray-700 border-gray-200'
                                        }`}
                                >
                                    <div className={`flex flex-col ${hasActiveSort ? 'text-rose-500' : ''}`}>
                                        <FiArrowDown className="w-3 h-3 -mb-0.5" />
                                        <FiArrowUp className="w-3 h-3" />
                                    </div>
                                    <span>{hasActiveSort ? 'CLEAR' : 'SORT'}</span>
                                </button>
                                <button
                                    onClick={() => hasActiveFiltersOnly ? clearFilters() : setIsMobileFilterOpen(true)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium active:bg-gray-50 ${hasActiveFiltersOnly
                                        ? 'text-rose-500 border-t-2 border-t-rose-400'
                                        : 'text-gray-700'
                                        }`}
                                >
                                    <FiFilter className={`w-4 h-4 ${hasActiveFiltersOnly ? 'text-rose-500' : ''}`} />
                                    <span>{hasActiveFiltersOnly ? 'CLEAR' : 'FILTER'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Mobile Sort Bottom Sheet */}
                        <AnimatePresence>
                            {isMobileSortOpen && (
                                <>
                                    <motion.div
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="md:hidden fixed inset-0 bg-black/50 z-[9999]"
                                        onClick={() => setIsMobileSortOpen(false)}
                                    />
                                    <motion.div
                                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                        className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[10000] max-h-[60vh] overflow-hidden shadow-2xl"
                                    >
                                        {/* Drag Handle */}
                                        <div className="flex justify-center pt-3 pb-1">
                                            <div className="w-10 h-1 bg-gray-300 rounded-full" />
                                        </div>

                                        {/* Header */}
                                        <div className="px-5 pb-4 pt-2 flex items-center justify-between border-b border-gray-100">
                                            <h3 className="text-xl font-bold text-gray-900">Sort By</h3>
                                            <button
                                                onClick={() => setIsMobileSortOpen(false)}
                                                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                                            >
                                                <FiX className="w-5 h-5 text-gray-600" />
                                            </button>
                                        </div>

                                        {/* Sort Options */}
                                        <div className="px-5 py-5">
                                            <div className="space-y-2">
                                                {sortOptions.map((option) => (
                                                    <button
                                                        key={option.value}
                                                        onClick={() => {
                                                            handleFilterChange('sort', option.value);
                                                            setIsMobileSortOpen(false);
                                                        }}
                                                        className={`w-full p-4 rounded-xl text-left text-sm font-medium transition-all flex items-center justify-between ${filters.sort === option.value
                                                            ? 'bg-primary-100 text-primary-700 border-2 border-primary-400 shadow-sm'
                                                            : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                                                            }`}
                                                    >
                                                        <span>{option.label}</span>
                                                        {filters.sort === option.value && (
                                                            <FiCheck className="w-5 h-5 text-primary-600" />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>

                        {/* Mobile Filter Bottom Sheet */}
                        <AnimatePresence>
                            {isMobileFilterOpen && (
                                <>
                                    <motion.div
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="md:hidden fixed inset-0 bg-black/50 z-[9999]"
                                        onClick={() => setIsMobileFilterOpen(false)}
                                    />
                                    <motion.div
                                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                        className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[10000] max-h-[85vh] overflow-hidden shadow-2xl"
                                    >
                                        {/* Drag Handle */}
                                        <div className="flex justify-center pt-3 pb-1">
                                            <div className="w-10 h-1 bg-gray-300 rounded-full" />
                                        </div>

                                        {/* Header */}
                                        <div className="px-5 pb-4 pt-2 flex items-center justify-between border-b border-gray-100">
                                            <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                                            <div className="flex items-center gap-4">
                                                {hasActiveFilters && (
                                                    <button onClick={clearFilters} className="text-sm text-rose-500 font-semibold hover:text-rose-600 transition-colors">
                                                        Clear All
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setIsMobileFilterOpen(false)}
                                                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                                                >
                                                    <FiX className="w-5 h-5 text-gray-600" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Scrollable Content */}
                                        <div className="overflow-y-auto max-h-[calc(85vh-140px)]">
                                            {/* Categories Section */}
                                            <div className="px-5 py-5">
                                                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">Categories</h4>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        onClick={() => handleFilterChange('category', '')}
                                                        className={`p-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${!filters.category
                                                            ? 'bg-primary-100 text-primary-700 border-2 border-primary-400 shadow-sm'
                                                            : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                                                            }`}
                                                    >
                                                        <span className="text-lg">🏷️</span>
                                                        <span>All Categories</span>
                                                    </button>
                                                    {categoriesData?.data?.map(cat => (
                                                        <button
                                                            key={cat._id}
                                                            onClick={() => handleFilterChange('category', cat._id)}
                                                            className={`p-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${filters.category === cat._id
                                                                ? 'bg-primary-100 text-primary-700 border-2 border-primary-400 shadow-sm'
                                                                : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                                                                }`}
                                                        >
                                                            <span className="text-lg">{cat.icon || '📦'}</span>
                                                            <span className="truncate">{cat.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                        </div>

                                        {/* Fixed Apply Button */}
                                        <div className="sticky bottom-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
                                            <button
                                                onClick={() => setIsMobileFilterOpen(false)}
                                                className="w-full py-4 bg-primary-600 text-white font-bold rounded-xl shadow-md hover:bg-primary-700 transition-all active:scale-[0.98]"
                                            >
                                                Apply Filters
                                            </button>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </>,
                    document.body
                )
            }

            <div className="md:hidden h-14" />
        </div >
    );
};

export default Products;
