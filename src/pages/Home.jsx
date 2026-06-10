import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiGift, FiPackage, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useGetFeaturedProductsQuery, useGetCategoriesQuery } from '../store/api/productsApi';
import ProductSlider from '../components/products/ProductSlider';
import CategoryCard from '../components/categories/CategoryCard';
import Button from '../components/common/Button';

const banners = [
    {
        id: 1,
        image: '/images/banner1.png',
        title: 'Curated Gifts for Every Occasion',
        subtitle: 'New Collection',
        description: 'Discover our premium selection of handcrafted and exclusive items designed to make every moment unforgettable.',
        link: '/products',
        buttonText: 'Shop Now',
        accentText: 'bg-gradient-to-r from-[#FF64B4] to-[#4cc9f0]'
    },
    {
        id: 2,
        image: '/images/banner2.png',
        title: 'Aesthetic Finds',
        subtitle: 'Minimalist Styles',
        description: 'Explore the modern aesthetic collection featuring clean lines and vibrant minimalist colors.',
        link: '/products',
        buttonText: 'Explore Collection',
        accentText: 'bg-gradient-to-r from-[#4cc9f0] to-[#FF64B4]'
    },
    {
        id: 3,
        image: '/images/banner3.png',
        title: 'Luxury Collection',
        subtitle: 'Premium Selection',
        description: 'Unveil the elegance with our luxury watches, jewelry, and exclusive gift boxes.',
        link: '/products',
        buttonText: 'Discover Luxury',
        accentText: 'bg-gradient-to-r from-yellow-400 to-yellow-600'
    }
];

const Home = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    };

    const { data: popularData, isLoading: popularLoading } = useGetFeaturedProductsQuery(8);
    const { data: categoriesData } = useGetCategoriesQuery();

    return (
        <div className="min-h-screen bg-white">

            {/* Hero Carousel Section */}
            <section className="pt-24 md:pt-28 pb-8">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[400px] md:h-[500px] lg:h-[600px] group">
                        <AnimatePresence>
                            <motion.div
                                key={currentSlide}
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.7 }}
                                className="absolute inset-0"
                            >
                                <img src={banners[currentSlide].image} alt={banners[currentSlide].title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent md:bg-gradient-to-r md:from-black/80 md:via-black/40 md:to-transparent"></div>
                                <div className="absolute inset-0 flex flex-col justify-end md:justify-center p-8 md:p-16 w-full md:w-2/3 lg:w-1/2 z-10">
                                    <motion.span 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className={`inline-block px-4 py-1.5 text-white text-xs md:text-sm font-bold rounded-full mb-4 uppercase tracking-wider shadow-md w-fit ${banners[currentSlide].accentText}`}
                                    >
                                        {banners[currentSlide].subtitle}
                                    </motion.span>
                                    <motion.h2 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 leading-tight drop-shadow-lg"
                                    >
                                        {banners[currentSlide].title}
                                    </motion.h2>
                                    <motion.p 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.7 }}
                                        className="text-gray-200 mb-8 text-base md:text-xl drop-shadow-md hidden sm:block"
                                    >
                                        {banners[currentSlide].description}
                                    </motion.p>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.9 }}
                                    >
                                        <Link to={banners[currentSlide].link}>
                                            <button className="bg-white text-black hover:bg-gray-100 hover:-translate-y-1 transition-transform shadow-2xl rounded-full px-8 py-3 md:px-10 md:py-4 font-bold text-lg flex items-center group/btn">
                                                {banners[currentSlide].buttonText}
                                                <FiArrowRight className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        </Link>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Arrows */}
                        <button 
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-3 md:p-4 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
                        >
                            <FiChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                        </button>
                        <button 
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-3 md:p-4 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
                        >
                            <FiChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                        </button>

                        {/* Pagination Dots */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
                            {banners.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`transition-all duration-300 rounded-full ${
                                        currentSlide === index ? 'w-8 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Gift Categories Section */}
            <section className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="grid grid-cols-2 min-[450px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
                        {categoriesData?.data
                            ?.filter(cat => cat.isActive !== false)
                            .map((category, index) => (
                                <CategoryCard
                                    key={category._id}
                                    category={category}
                                    index={index}
                                />
                            ))}
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">
                            <span className="text-[#FF64B4]">Popular</span> <span className="text-[#4cc9f0]">Gifts</span>
                        </h2>
                        <p className="text-gray-600 mb-6">Loved by thousands of happy customers</p>
                        <Link to="/products?sort=bestselling">
                            <Button variant="ghost" icon={<FiArrowRight />} iconPosition="right">
                                View All
                            </Button>
                        </Link>
                    </div>

                    <ProductSlider
                        products={popularData?.data}
                        isLoading={popularLoading}
                    />
                </div>
            </section>

        </div>
    );
};

export default Home;
