import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
    FiArrowRight,
    FiGift,
    FiPackage,
    FiChevronLeft,
    FiChevronRight,
    FiTruck,
    FiLock,
    FiCheckCircle,
    FiStar,
    FiHeart,
    FiSearch,
    FiBox,
    FiCheck,
    FiUser,
    FiCalendar,
    FiTag,
    FiChevronDown
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { useGetCategoriesQuery, useGetProductsQuery } from '../store/api/productsApi';
import ProductCard from '../components/products/ProductCard';
import Button from '../components/common/Button';

// High-fidelity luxury default banners
const defaultBanners = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1600&q=85',
        title: 'Thoughtfully Curated, Beautifully Wrapped',
        subtitle: 'Signature Keepsake Hampers',
        description: 'Discover handcrafted luxury gift boxes, artisanal delights, and personalized treasures designed to make every milestone unforgettable.',
        link: '/products',
        buttonText: 'Shop Gifts Now',
        accentText: 'bg-gradient-to-r from-[#FF64B4] to-[#4cc9f0]'
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1600&q=85',
        title: 'Bespoke Keepsakes & Custom Art',
        subtitle: 'Handcrafted With Love',
        description: 'Transform your cherished memories into custom photo caricatures, engraved wooden plaques, and embossed keepsakes.',
        link: '/products?search=personalised',
        buttonText: 'Explore Personalised',
        accentText: 'bg-gradient-to-r from-[#4cc9f0] to-[#FF64B4]'
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1600&q=85',
        title: 'Fresh Blooms & Sweet Sensations',
        subtitle: 'Express Same-Day Surprises',
        description: 'Premium farm-fresh floral bouquets and gourmet chocolates delivered right to their doorstep, on-time, every time.',
        link: '/products?search=flower',
        buttonText: 'Order Fresh Blooms',
        accentText: 'bg-gradient-to-r from-yellow-400 to-yellow-600'
    }
];

const defaultCombos = [
    {
        _id: 'default-1',
        title: 'Artisan LED Glow & Mug Pair',
        description: 'Wooden LED Photo Lamp + Custom Ceramic Mug',
        price: 1199,
        badge: 'Bestselling Pair',
        image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80',
        link: '/products?search=lamp'
    },
    {
        _id: 'default-2',
        title: 'Royal Birthday Celebration Hamper',
        description: 'Luxury Gift Hamper + Acrylic Keychain + Greeting Card',
        price: 1499,
        badge: 'Most Loved',
        image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
        link: '/products?search=hamper'
    },
    {
        _id: 'default-3',
        title: 'Bespoke Keepsake Duo',
        description: 'Name Engraved Bottle + Custom Photo Keychain',
        price: 799,
        badge: 'Popular Pick',
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
        link: '/products?search=bottle'
    },
    {
        _id: 'default-4',
        title: 'Blossom & Memory Keepsake',
        description: 'Farm-Fresh Floral Bouquet + Baby / Name Reveal Plaque',
        price: 999,
        badge: 'Everlasting Love',
        image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80',
        link: '/products?search=bouquet'
    }
];

const defaultPromos = [
    {
        slot: 1,
        title: 'Luxury Gift Hampers',
        subtitle: 'Thoughtfully Curated Keepsake Boxes',
        image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
        link: '/products?search=hamper',
        badge: 'Trending'
    },
    {
        slot: 2,
        title: 'Celebration Specials',
        subtitle: 'Handpicked Delights for Your Loved Ones',
        image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=800&q=80',
        link: '/products',
        badge: 'Spotlight'
    },
    {
        slot: 3,
        title: 'Anniversary Flowers',
        subtitle: 'Fresh Blooms for Everlasting Romance',
        image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80',
        link: '/products?search=flower',
        badge: 'Fresh'
    },
    {
        slot: 4,
        title: 'Personalised Journals',
        subtitle: 'Custom Embossed with Your Name',
        image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=600&q=80',
        link: '/products?search=journal',
        badge: 'Custom'
    },
    {
        slot: 5,
        title: 'Lucky Bamboo & Green Gifts',
        subtitle: 'Bring Positive Energy & Growth',
        image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80',
        link: '/products?search=plant',
        badge: 'Eco'
    },
    {
        slot: 6,
        title: 'Custom Caricatures',
        subtitle: 'Turning Memories into Delightful Art',
        image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80',
        link: '/products?search=caricature',
        badge: 'Bestseller'
    },
    {
        slot: 7,
        title: 'Artisan Gourmet Chocolates',
        subtitle: 'Crafted to Melt Hearts and Spread Joy',
        image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80',
        link: '/products?search=chocolate',
        badge: 'Delicious'
    },
    {
        slot: 8,
        title: 'Personalised Accessories',
        subtitle: 'Crafted to Reflect Your Personal Style',
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
        link: '/products?search=personalised',
        badge: 'Premium'
    }
];

const fallbackImages = {
    1: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
    2: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=800&q=80',
    3: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80',
    4: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=600&q=80',
    5: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80',
    6: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80',
    7: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80',
    8: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80'
};

const PromoCardItem = ({ card, isDouble = false }) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    if (!card) return null;

    const isSlot2 = card.slot === 2;
    const fallback = fallbackImages[card.slot] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80';

    const getSafeImgUrl = (img) => {
        if (!img) return fallback;
        if (img.startsWith('http')) return img;
        if (img.startsWith('/images/')) return img;
        return `${API_URL}${img}`;
    };

    const [imgSrc, setImgSrc] = useState(getSafeImgUrl(card.image));

    useEffect(() => {
        setImgSrc(getSafeImgUrl(card.image));
    }, [card.image]);

    let heightClass = 'h-[260px] md:h-[300px]';
    if (isSlot2) {
        heightClass = 'h-[260px] md:h-[380px]';
    } else if (card.slot === 5) {
        heightClass = 'min-h-[280px] md:h-[530px]';
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className={`group relative overflow-hidden rounded-3xl bg-white shadow-soft transition-all duration-300 hover:shadow-card-gold hover:border-[#FF64B4]/40 border border-gray-100 ${heightClass}`}
        >
            <Link to={card.link || '/products'} className="absolute inset-0 flex flex-col justify-between overflow-hidden">
                {isSlot2 ? (
                    <div className="absolute inset-0">
                        <img
                            src={imgSrc}
                            alt={card.title}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            onError={() => setImgSrc(fallback)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end p-6 md:p-8">
                            <div>
                                <span className="inline-block px-3 py-1 bg-white/95 backdrop-blur-md text-[#FF64B4] text-[10px] md:text-xs font-bold rounded-full mb-2 uppercase tracking-wider shadow-sm">
                                    ★ Featured Spotlight
                                </span>
                                <h3 className="text-xl md:text-3xl font-black text-white font-serif drop-shadow-md">
                                    {card.title}
                                </h3>
                                {card.subtitle && (
                                    <p className="text-xs md:text-sm text-gray-200 mt-1 font-medium drop-shadow-sm">
                                        {card.subtitle}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Card Header */}
                        <div className="p-5 pb-2 z-10 flex flex-col items-start bg-white">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF64B4] bg-primary-50 px-2.5 py-0.5 rounded-full mb-1">
                                {card.badge || 'Handpicked'}
                            </span>
                            <h3 className="text-base md:text-lg font-bold text-gray-900 tracking-tight group-hover:text-[#FF64B4] transition-colors">
                                {card.title}
                            </h3>
                            {card.subtitle && (
                                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                                    {card.subtitle}
                                </p>
                            )}
                        </div>

                        {/* Image */}
                        <div className="relative w-full flex-1 overflow-hidden">
                            <img
                                src={imgSrc}
                                alt={card.title}
                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                onError={() => setImgSrc(fallback)}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </>
                )}
            </Link>
        </motion.div>
    );
};

const Home = () => {
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const [currentSlide, setCurrentSlide] = useState(0);
    const [homeBanners, setHomeBanners] = useState([]);
    const [bannersLoading, setBannersLoading] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [promos, setPromos] = useState([]);
    const [combos, setCombos] = useState(defaultCombos);

    useEffect(() => {
        const fetchCombos = async () => {
            try {
                const res = await fetch(`${API_URL}/api/combos`);
                const json = await res.json();
                if (json.success && json.data && json.data.length > 0) {
                    setCombos(json.data);
                }
            } catch (err) {
                console.error('Error fetching combos:', err);
            }
        };
        fetchCombos();
    }, []);

    // Gift Finder Widget State
    const [finderRecipient, setFinderRecipient] = useState('');
    const [finderOccasion, setFinderOccasion] = useState('');
    const [finderBudget, setFinderBudget] = useState('');

    const handleGiftFinderSubmit = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (finderRecipient) params.append('search', finderRecipient);
        if (finderOccasion) params.append('occasion', finderOccasion);
        if (finderBudget) {
            if (finderBudget === 'under-499') params.append('maxPrice', '499');
            else if (finderBudget === 'under-999') params.append('maxPrice', '999');
            else if (finderBudget === '1000-2499') {
                params.append('minPrice', '1000');
                params.append('maxPrice', '2499');
            } else if (finderBudget === 'above-2500') {
                params.append('minPrice', '2500');
            }
        }
        navigate(`/products${params.toString() ? `?${params.toString()}` : ''}`);
    };

    const categoryScrollRef = useRef(null);
    const scrollCategories = (direction) => {
        if (categoryScrollRef.current) {
            const offset = direction === 'left' ? -340 : 340;
            categoryScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const fetchPromos = async () => {
            try {
                const res = await fetch(`${API_URL}/api/promos`);
                const json = await res.json();
                if (json.success && json.data && json.data.length > 0) {
                    setPromos(json.data);
                }
            } catch (err) {
                console.error('Error fetching promos:', err);
            }
        };
        fetchPromos();
    }, []);

    const getPromoForSlot = (slotNum) => {
        const dbPromo = promos.find(p => p.slot === slotNum);
        if (dbPromo && dbPromo.isActive) return dbPromo;
        return defaultPromos.find(p => p.slot === slotNum);
    };

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                setBannersLoading(true);
                const res = await fetch(`${API_URL}/api/banners`);
                const json = await res.json();
                if (json.success && json.data && json.data.length > 0) {
                    const defaultAccents = [
                        'bg-gradient-to-r from-[#FF64B4] to-[#4cc9f0]',
                        'bg-gradient-to-r from-[#4cc9f0] to-[#FF64B4]',
                        'bg-gradient-to-r from-yellow-400 to-yellow-600'
                    ];
                    const mapped = json.data.map((b, idx) => ({
                        ...b,
                        accentText: defaultAccents[idx % defaultAccents.length]
                    }));
                    setHomeBanners(mapped);
                }
            } catch (err) {
                console.error('Error fetching banners:', err);
            } finally {
                setBannersLoading(false);
            }
        };
        fetchBanners();
    }, []);

    useEffect(() => {
        if (homeBanners.length <= 1 || isPaused) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev === homeBanners.length - 1 ? 0 : prev + 1));
        }, 5500);
        return () => clearInterval(timer);
    }, [homeBanners.length, isPaused]);

    const handleTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;
        if (isLeftSwipe) {
            nextSlide();
        } else if (isRightSwipe) {
            prevSlide();
        }
    };

    const nextSlide = () => {
        if (homeBanners.length === 0) return;
        setCurrentSlide((prev) => (prev === homeBanners.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        if (homeBanners.length === 0) return;
        setCurrentSlide((prev) => (prev === 0 ? homeBanners.length - 1 : prev - 1));
    };

    const { data: categoriesData } = useGetCategoriesQuery();
    const [bestsellerTab, setBestsellerTab] = useState('all');

    const findCatIdByName = (searchTerms) => {
        if (!categoriesData?.data) return '';
        const found = categoriesData.data.find(c =>
            searchTerms.some(term => c.name.toLowerCase().includes(term.toLowerCase()))
        );
        return found ? found._id : '';
    };

    const activeCatId = bestsellerTab === 'all'
        ? undefined
        : bestsellerTab === 'lamps'
            ? (findCatIdByName(['LED', 'lamp']) || '6ab17148efcf18995dfcf04c')
            : bestsellerTab === 'mugs'
                ? (findCatIdByName(['Mug']) || '6ab16181efcf18995dfcee2c')
                : bestsellerTab === 'bouquets'
                    ? (findCatIdByName(['Bouquet']) || '6ab150aaefcf18995dfced78')
                    : bestsellerTab === 'hampers'
                        ? (findCatIdByName(['Hamper']) || '6ab1728aefcf18995dfcf0c8')
                        : undefined;

    const bestsellerQueryParams = { limit: 8 };
    if (activeCatId) {
        bestsellerQueryParams.category = activeCatId;
    }

    const { data: bestsellerProductsData, isLoading: bestsellerLoading } = useGetProductsQuery(bestsellerQueryParams);

    // Queries for Featured Category Rows (LED lamps & Mugs)
    const ledCatId = findCatIdByName(['LED', 'lamp']) || '6ab17148efcf18995dfcf04c';
    const mugCatId = findCatIdByName(['Mug']) || '6ab16181efcf18995dfcee2c';

    const { data: ledProductsData, isLoading: ledLoading } = useGetProductsQuery({ category: ledCatId, limit: 4 });
    const { data: mugProductsData, isLoading: mugLoading } = useGetProductsQuery({ category: mugCatId, limit: 4 });

    const resolveBannerImage = (img) => {
        if (!img) return 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1600&q=85';
        if (img.startsWith('http')) return img;
        if (img.startsWith('/images/')) return img;
        return `${API_URL}${img}`;
    };

    return (
        <div className="min-h-screen bg-white text-gray-800 pt-36">
            {/* Hero Carousel Section - Immersive Luxury Viewport (Zero Flickering) */}
            <section className="pt-1 md:pt-2 pb-2">
                <div className="w-full max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-6">
                    {bannersLoading && homeBanners.length === 0 ? (
                        <div className="relative overflow-hidden rounded-3xl h-[240px] sm:h-[340px] md:h-[400px] lg:h-[450px] bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer bg-[length:200%_100%] border border-gray-200/80 shadow-xs" />
                    ) : homeBanners.length > 0 ? (
                        <div
                            className="relative overflow-hidden rounded-3xl h-[240px] sm:h-[340px] md:h-[400px] lg:h-[450px] group shadow-card-gold bg-gray-900 border border-primary-100/50 select-none"
                            onMouseEnter={() => setIsPaused(true)}
                            onMouseLeave={() => setIsPaused(false)}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            {/* Layered Crossfade Slides - Zero Flickering */}
                            {homeBanners.map((banner, index) => {
                                const isActive = index === currentSlide;
                                return (
                                    <div
                                        key={banner._id || index}
                                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                                            isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                                        }`}
                                    >
                                        <Link
                                            to={banner.link || '/products'}
                                            className="block w-full h-full relative cursor-pointer group/slide"
                                        >
                                            <img
                                                src={resolveBannerImage(banner.image)}
                                                alt={banner.title || 'Glitz Creativez Banner'}
                                                loading={index === 0 ? 'eager' : 'lazy'}
                                                decoding="async"
                                                className={`w-full h-full object-cover transition-transform duration-700 ${
                                                    isActive ? 'scale-100 group-hover/slide:scale-105' : 'scale-105'
                                                }`}
                                                onError={(e) => {
                                                    e.target.src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1600&q=85';
                                                }}
                                            />

                                            {/* Conditionally render text overlay ONLY if subtitle, title, or description exists */}
                                            {Boolean(banner.subtitle || banner.title || banner.description) && (
                                                <>
                                                    {/* Gradient Scrim for crisp readability */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent md:bg-gradient-to-r md:from-black/85 md:via-black/40 md:to-transparent" />

                                                    {/* Text Overlay */}
                                                    <div className="absolute inset-0 flex flex-col justify-end md:justify-center p-6 sm:p-8 md:p-12 lg:p-14 w-full md:w-3/5 lg:w-1/2 z-10">
                                                        {banner.subtitle && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 text-white bg-gradient-to-r from-[#FF64B4] to-[#4cc9f0] text-[11px] md:text-xs font-bold rounded-full mb-2 uppercase tracking-wider shadow-sm w-fit">
                                                                <HiSparkles /> {banner.subtitle}
                                                            </span>
                                                        )}
                                                        {banner.title && (
                                                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-black text-white mb-2 leading-tight drop-shadow-md font-serif">
                                                                {banner.title}
                                                            </h1>
                                                        )}
                                                        {banner.description && (
                                                            <p className="text-gray-100 mb-4 sm:mb-5 text-xs sm:text-sm md:text-base leading-relaxed drop-shadow-sm line-clamp-2 md:line-clamp-3 max-w-lg font-medium">
                                                                {banner.description}
                                                            </p>
                                                        )}
                                                        {banner.buttonText && (
                                                            <div className="bg-gradient-to-r from-[#FF64B4] via-[#ff389a] to-[#4cc9f0] text-white hover:scale-105 active:scale-95 transition-all shadow-gold hover:shadow-gold-lg rounded-full px-6 py-3 font-bold text-xs md:text-sm flex items-center gap-2 w-fit">
                                                                <span>{banner.buttonText}</span>
                                                                <FiArrowRight />
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </Link>
                                    </div>
                                );
                            })}

                            {/* Navigation Arrows */}
                            {homeBanners.length > 1 && (
                                <>
                                    <button
                                        onClick={prevSlide}
                                        aria-label="Previous Slide"
                                        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 sm:p-2.5 rounded-full shadow-lg transition-all duration-300 z-20 flex items-center justify-center border border-white/80 hover:scale-110 cursor-pointer"
                                    >
                                        <FiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                    <button
                                        onClick={nextSlide}
                                        aria-label="Next Slide"
                                        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 sm:p-2.5 rounded-full shadow-lg transition-all duration-300 z-20 flex items-center justify-center border border-white/80 hover:scale-110 cursor-pointer"
                                    >
                                        <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>

                                    {/* Floating Pagination Indicators */}
                                    <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-white/20 shadow-md">
                                        {homeBanners.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentSlide(index)}
                                                aria-label={`Slide ${index + 1}`}
                                                className={`transition-all duration-300 rounded-full h-2 cursor-pointer ${
                                                    currentSlide === index ? 'w-6 sm:w-7 bg-gradient-to-r from-[#FF64B4] to-[#4cc9f0]' : 'w-2 bg-white/50 hover:bg-white/80'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : null}
                </div>
            </section>

            {/* 2. Categories Circle Navigation Row */}
            {/* 2. Categories Circle Navigation Row (Top 10 Categories) */}
            {(() => {
                const activeCategories = (categoriesData?.data || []).filter(cat => cat.isActive !== false);
                const tickedCategories = activeCategories.filter(cat => cat.showOnHome === true);
                const displayCategories = (tickedCategories.length > 0 ? tickedCategories : activeCategories).slice(0, 10);

                if (displayCategories.length === 0) return null;

                return (
                    <section className="py-6 sm:py-8 bg-white border-y border-gray-100 relative">
                        <div className="max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-6 relative">
                            <div
                                ref={categoryScrollRef}
                                className="flex items-center justify-start lg:justify-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 overflow-x-auto no-scrollbar scrollbar-none py-3 px-2 scroll-smooth"
                            >
                                {displayCategories.map((category) => {
                                    const imageUrl = category.image?.startsWith('http')
                                        ? category.image
                                        : `${API_URL}${category.image}`;

                                    return (
                                        <Link
                                            key={category._id}
                                            to={`/products?category=${category._id}`}
                                            className="flex flex-col items-center flex-shrink-0 group cursor-pointer"
                                            title={category.name}
                                        >
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border border-gray-200 group-hover:border-gray-400 bg-white shadow-sm group-hover:shadow-md flex items-center justify-center p-1 transition-all duration-300 group-hover:scale-105">
                                                <img
                                                    src={imageUrl}
                                                    alt={category.name}
                                                    className="w-full h-full object-cover rounded-full transition-transform duration-500 ease-out group-hover:scale-105"
                                                    onError={(e) => {
                                                        e.target.src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=150&q=80';
                                                    }}
                                                />
                                            </div>
                                            <span className="text-xs sm:text-sm font-semibold text-gray-800 mt-2 whitespace-nowrap text-center max-w-[105px] truncate">
                                                {category.name}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                );
            })()}

            {/* 3. Interactive Gift Finder Bar */}
            <section className="py-8 sm:py-12 bg-[#FAF9FC] border-b border-gray-100">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-gray-200/50 border border-gray-200/90 hover:border-pink-200/70 transition-all duration-300">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                            <div className="flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-2xl bg-pink-50 border border-pink-200/70 flex items-center justify-center text-[#FF64B4] shadow-xs flex-shrink-0">
                                    <HiSparkles size={20} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-black text-gray-900 text-base sm:text-lg font-serif">
                                            Find the Perfect Gift
                                        </h3>
                                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-pink-50 text-[#FF64B4] border border-pink-200/60">
                                            In Seconds
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Select recipient, occasion, and budget to view curated recommendations instantly
                                    </p>
                                </div>
                            </div>
                            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200">
                                ✨ 100% Curated Picks
                            </span>
                        </div>

                        {/* Finder Form */}
                        <form onSubmit={handleGiftFinderSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                            {/* Recipient */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                    <FiUser className="text-[#FF64B4]" size={13} /> Who is it for?
                                </label>
                                <div className="relative">
                                    <select
                                        value={finderRecipient}
                                        onChange={(e) => setFinderRecipient(e.target.value)}
                                        className="w-full appearance-none px-4 py-3 bg-gray-50/80 hover:bg-white border border-gray-200 hover:border-gray-300 focus:border-[#FF64B4] focus:bg-white rounded-2xl text-xs md:text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF64B4]/15 transition-all cursor-pointer pr-9"
                                    >
                                        <option value="">Select Recipient</option>
                                        <option value="women">For Her (Girlfriend, Wife, Mom)</option>
                                        <option value="men">For Him (Husband, Boyfriend, Dad)</option>
                                        <option value="couple">For Couples & Parents</option>
                                        <option value="kids">For Kids & Teens</option>
                                        <option value="friend">For Best Friend & Colleague</option>
                                    </select>
                                    <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
                                </div>
                            </div>

                            {/* Occasion */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                    <FiCalendar className="text-[#FF64B4]" size={13} /> Occasion
                                </label>
                                <div className="relative">
                                    <select
                                        value={finderOccasion}
                                        onChange={(e) => setFinderOccasion(e.target.value)}
                                        className="w-full appearance-none px-4 py-3 bg-gray-50/80 hover:bg-white border border-gray-200 hover:border-gray-300 focus:border-[#FF64B4] focus:bg-white rounded-2xl text-xs md:text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF64B4]/15 transition-all cursor-pointer pr-9"
                                    >
                                        <option value="">Select Occasion</option>
                                        <option value="birthday">Birthday Celebrations</option>
                                        <option value="anniversary">Anniversary & Love</option>
                                        <option value="congratulations">Congratulations & Job</option>
                                        <option value="housewarming">Housewarming & Milestones</option>
                                        <option value="festive">Festivals & Celebrations</option>
                                    </select>
                                    <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
                                </div>
                            </div>

                            {/* Budget */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                    <FiTag className="text-[#FF64B4]" size={13} /> Budget Range
                                </label>
                                <div className="relative">
                                    <select
                                        value={finderBudget}
                                        onChange={(e) => setFinderBudget(e.target.value)}
                                        className="w-full appearance-none px-4 py-3 bg-gray-50/80 hover:bg-white border border-gray-200 hover:border-gray-300 focus:border-[#FF64B4] focus:bg-white rounded-2xl text-xs md:text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF64B4]/15 transition-all cursor-pointer pr-9"
                                    >
                                        <option value="">Any Budget</option>
                                        <option value="under-499">Under ₹ 499 (Pocket Friendly)</option>
                                        <option value="under-999">Under ₹ 999 (Most Popular)</option>
                                        <option value="1000-2499">₹ 1,000 – ₹ 2,499 (Premium)</option>
                                        <option value="above-2500">₹ 2,500+ (Luxury Hampers)</option>
                                    </select>
                                    <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
                                </div>
                            </div>

                            {/* Submit Button (Single Solid Brand Pink Color) */}
                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    className="w-full h-[45px] px-5 rounded-2xl font-bold text-xs md:text-sm text-white bg-[#FF64B4] hover:bg-[#f04e9e] shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <FiSearch size={16} />
                                    <span>Find Gifts</span>
                                </button>
                            </div>
                        </form>

                        {/* Quick Popular Tags */}
                        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-100 flex-wrap">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Quick Pick:</span>
                            {[
                                { name: '🎂 Birthday Cakes', query: 'cake' },
                                { name: '💐 Fresh Flowers', query: 'flower' },
                                { name: '🎨 Caricatures', query: 'caricature' },
                                { name: '🎁 Gift Hampers', query: 'hamper' },
                                { name: '🍫 Chocolates', query: 'chocolate' }
                            ].map((tag, idx) => (
                                <Link
                                    key={idx}
                                    to={`/products?search=${tag.query}`}
                                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-pink-50 text-gray-700 hover:text-[#FF64B4] border border-gray-200 hover:border-pink-300 shadow-2xs hover:shadow-xs transition-all flex items-center gap-1"
                                >
                                    {tag.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Bestsellers & Trending Gifts */}
            <section className="py-14 sm:py-16 bg-white border-b border-gray-100">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-4 border-b border-gray-200/70 relative">
                        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight font-serif">
                                Bestsellers & Trending Gifts
                            </h2>
                            <div className="flex items-center bg-gray-50 p-1 rounded-2xl border border-gray-200 shadow-xs flex-wrap gap-1">
                                {[
                                    { id: 'all', label: 'All Trending' },
                                    { id: 'lamps', label: 'LED & Lamps' },
                                    { id: 'mugs', label: 'Personalised Mugs' },
                                    { id: 'bouquets', label: 'Fresh Bouquets' },
                                    { id: 'hampers', label: 'Gift Hampers' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setBestsellerTab(tab.id)}
                                        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                                            bestsellerTab === tab.id
                                                ? 'bg-[#FF64B4] text-white shadow-xs'
                                                : 'text-gray-600 hover:text-[#FF64B4] hover:bg-white'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Link
                            to={activeCatId ? `/products?category=${activeCatId}` : '/products'}
                            className="bg-[#FF64B4] hover:bg-[#f04e9e] text-white text-[10px] md:text-xs font-bold px-4 md:px-5 py-2.5 rounded-xl shadow-xs hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300 tracking-wider uppercase self-start sm:self-center"
                        >
                            View All Products
                        </Link>
                    </div>

                    {bestsellerLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {[...Array(4)].map((_, index) => (
                                <div key={index} className="w-full bg-gray-100 animate-pulse rounded-2xl h-[280px]" />
                            ))}
                        </div>
                    ) : bestsellerProductsData?.data && bestsellerProductsData.data.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {bestsellerProductsData.data.slice(0, 8).map((product, index) => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    index={index}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-[#FAF9FC] rounded-3xl border border-gray-200/80">
                            <p className="text-gray-500 text-sm">Gifts coming soon to this collection!</p>
                            <Link to="/products" className="mt-3 inline-block text-xs font-bold text-gray-800 hover:underline">
                                Browse All Available Gifts →
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* 5. Shop Gifts by Budget */}
            <section className="py-14 sm:py-16 bg-[#FAF9FC] border-b border-gray-100">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 pb-4 border-b border-gray-200/70">
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-serif">
                            Shop Gifts by Budget
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {[
                            {
                                tag: 'Pocket Friendly',
                                title: 'Under ₹ 299',
                                desc: 'Custom Mugs, Keychains & Badges',
                                link: '/products?maxPrice=299',
                                emoji: '🪙',
                                badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            },
                            {
                                tag: 'Sweet Delights',
                                title: 'Under ₹ 499',
                                desc: 'Caricatures, Green Plants & Mini Frames',
                                link: '/products?maxPrice=499',
                                emoji: '🎁',
                                badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
                            },
                            {
                                tag: 'Most Popular',
                                title: 'Under ₹ 999',
                                desc: 'Wooden Plaques, LED Frames & Hampers',
                                link: '/products?maxPrice=999',
                                emoji: '⭐',
                                badgeColor: 'bg-pink-50 text-[#FF64B4] border-pink-200'
                            },
                            {
                                tag: 'Royal Keepsakes',
                                title: 'Luxury ₹ 1,500+',
                                desc: 'Bespoke Hampers, Perfumes & Combos',
                                link: '/products?minPrice=1500',
                                emoji: '👑',
                                badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
                            }
                        ].map((b, idx) => (
                            <Link
                                key={idx}
                                to={b.link}
                                className="relative rounded-3xl p-5 sm:p-6 bg-white border border-gray-200/90 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl select-none">
                                            {b.emoji}
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${b.badgeColor}`}>
                                            {b.tag}
                                        </span>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                                        {b.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                                        {b.desc}
                                    </p>
                                </div>
                                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-800">
                                    <span>Explore Collection</span>
                                    <span className="w-7 h-7 rounded-full bg-gray-50 border border-gray-200/80 flex items-center justify-center text-gray-700">
                                        <FiArrowRight className="text-xs" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. Curated for Him & Adored by Her (2-Card Split Row) */}
            <section className="py-14 sm:py-16 bg-white border-b border-gray-100">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        {/* Card 1: Curated for Him */}
                        <Link
                            to="/products?recipient=him"
                            className="group relative h-[380px] sm:h-[440px] lg:h-[480px] rounded-3xl overflow-hidden block shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100"
                        >
                            {/* Background Image */}
                            <img
                                src="/images/curated_for_him_real.png"
                                alt="Curated for Him"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1200&q=85";
                                }}
                                className="w-full h-full object-cover object-top group-hover:scale-108 transition-transform duration-700 ease-out"
                            />

                            {/* Luxury Dark Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5 group-hover:from-black/90 group-hover:via-black/45 transition-colors duration-500" />

                            {/* Floating Top Badges */}
                            <div className="absolute top-5 left-5 right-5 flex items-center justify-between pointer-events-none">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-900 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-sm">
                                    For Him
                                </span>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-white bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
                                    Artisan Crafted
                                </span>
                            </div>

                            {/* Overlaid Bottom Content */}
                            <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 flex flex-col justify-end">
                                <p className="text-xs uppercase tracking-widest font-semibold text-pink-300 mb-1.5">
                                    Bespoke Keepsakes & Gifts
                                </p>
                                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-serif tracking-tight drop-shadow-sm">
                                    Curated for Him
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-200/90 mt-2 line-clamp-2 max-w-md">
                                    Personalized wooden plaques, executive combos & bespoke gifts tailored to his style.
                                </p>

                                <div className="mt-5 flex items-center gap-3">
                                    <span className="inline-flex items-center gap-2 bg-[#FF64B4] group-hover:bg-[#f04e9e] text-white px-5 py-2.5 rounded-full font-bold text-xs shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                                        <span>Explore for Him</span>
                                        <FiArrowRight size={14} className="transform transition-transform duration-300 group-hover:translate-x-1" />
                                    </span>
                                    <span className="text-[11px] font-medium text-white/80 hidden sm:inline-block">
                                        • 100% Gift-Ready Wrapped
                                    </span>
                                </div>
                            </div>
                        </Link>

                        {/* Card 2: Adored by Her */}
                        <Link
                            to="/products?recipient=her"
                            className="group relative h-[380px] sm:h-[440px] lg:h-[480px] rounded-3xl overflow-hidden block shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100"
                        >
                            {/* Background Image */}
                            <img
                                src="/images/adored_by_her_real.jpg"
                                alt="Adored by Her"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=85";
                                }}
                                className="w-full h-full object-cover object-top group-hover:scale-108 transition-transform duration-700 ease-out"
                            />

                            {/* Luxury Dark Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5 group-hover:from-black/90 group-hover:via-black/45 transition-colors duration-500" />

                            {/* Floating Top Badges */}
                            <div className="absolute top-5 left-5 right-5 flex items-center justify-between pointer-events-none">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-900 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-sm">
                                    For Her
                                </span>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-white bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
                                    Pure Emotion
                                </span>
                            </div>

                            {/* Overlaid Bottom Content */}
                            <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 flex flex-col justify-end">
                                <p className="text-xs uppercase tracking-widest font-semibold text-pink-300 mb-1.5">
                                    Everlasting Blooms & Hampers
                                </p>
                                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-serif tracking-tight drop-shadow-sm">
                                    Adored by Her
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-200/90 mt-2 line-clamp-2 max-w-md">
                                    Everlasting bouquets, custom caricatures & luxury keepsake hampers she'll cherish forever.
                                </p>

                                <div className="mt-5 flex items-center gap-3">
                                    <span className="inline-flex items-center gap-2 bg-[#FF64B4] group-hover:bg-[#f04e9e] text-white px-5 py-2.5 rounded-full font-bold text-xs shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                                        <span>Explore for Her</span>
                                        <FiArrowRight size={14} className="transform transition-transform duration-300 group-hover:translate-x-1" />
                                    </span>
                                    <span className="text-[11px] font-medium text-white/80 hidden sm:inline-block">
                                        • 100% Gift-Ready Wrapped
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* 7. Curated Celebration Combos */}
            <section className="py-14 sm:py-16 bg-[#FAF9FC] border-b border-gray-100">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 pb-4 border-b border-gray-200/70">
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-serif">
                            Bestselling Gift Combos
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {combos.slice(0, 8).map((combo, idx) => {
                            const rawPrice = typeof combo.price === 'number' ? combo.price : parseFloat(String(combo.price).replace(/[^0-9.]/g, '')) || 999;
                            const formattedPrice = `₹ ${rawPrice.toLocaleString('en-IN')}`;
                            return (
                                <Link
                                    key={combo._id || idx}
                                    to={combo.link || '/products'}
                                    className="group bg-white rounded-3xl overflow-hidden border border-gray-200/80 hover:border-gray-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                                >
                                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                                        <img
                                            src={combo.image}
                                            alt={combo.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80';
                                            }}
                                        />
                                        <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider text-gray-800 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-2xs">
                                            {combo.badge || 'Bestselling Pair'}
                                        </span>
                                    </div>
                                    <div className="p-5 flex flex-col flex-1 justify-between">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-base group-hover:text-gray-900 transition-colors">
                                                {combo.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                Includes: {combo.description || combo.pair}
                                            </p>
                                        </div>
                                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                                            <span className="text-sm font-black text-gray-900">
                                                Starts at {formattedPrice}
                                            </span>
                                            <span className="text-xs font-bold text-[#FF64B4] group-hover:underline flex items-center gap-1">
                                                View Set <FiArrowRight size={14} />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 8. Custom Personalized Keepsakes Spotlight (Full-Width Image Banner) */}
            <section className="py-10 sm:py-14 bg-white border-b border-gray-100">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <Link
                        to="/products?search=personalised"
                        className="group relative w-full h-[320px] sm:h-[400px] md:h-[460px] lg:h-[480px] rounded-3xl overflow-hidden block shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100"
                    >
                        {/* Full-Bleed Background Image */}
                        <img
                            src="/images/custom_gifting_banner_v2.jpg"
                            alt="Custom & Personalized Gifts"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1600&q=85";
                            }}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                        />

                        {/* Cinematic Multi-Stop Dark Gradient - Protects text on left while keeping couple on right luminous */}
                        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/90 via-black/50 md:via-black/45 to-transparent transition-colors duration-500 group-hover:from-black/95 group-hover:via-black/55" />

                        {/* Floating Top Badge */}
                        <div className="absolute top-5 left-5 sm:top-8 sm:left-8 flex items-center gap-2 pointer-events-none">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-900 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                                <HiSparkles className="text-[#FF64B4]" size={14} /> Bespoke & Handcrafted
                            </span>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-white bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 hidden sm:inline-block">
                                100% Personalized
                            </span>
                        </div>

                        {/* Content Overlay */}
                        <div className="absolute inset-0 p-6 sm:p-10 md:p-14 flex flex-col justify-end max-w-2xl">
                            <p className="text-xs sm:text-sm uppercase tracking-widest font-semibold text-pink-300 mb-2">
                                Turn Cherished Memories Into Timeless Art
                            </p>
                            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white font-serif tracking-tight drop-shadow-md leading-tight">
                                Custom Made Just For You
                            </h2>
                            <p className="text-xs sm:text-base text-gray-200 mt-2.5 sm:mt-3 leading-relaxed drop-shadow-sm max-w-xl font-medium line-clamp-2 sm:line-clamp-3">
                                Hand-engraved wooden photo plaques, custom glowing acrylic LED lamps, personalized caricatures & embossed keepsakes designed to capture life's most unforgettable moments.
                            </p>

                            <div className="mt-5 sm:mt-6 flex items-center gap-4 flex-wrap">
                                <span className="inline-flex items-center gap-2.5 bg-[#FF64B4] group-hover:bg-[#f04e9e] text-white px-6 sm:px-7 py-3 rounded-full font-bold text-xs sm:text-sm shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 active:scale-95">
                                    <span>Personalize Your Gift</span>
                                    <FiArrowRight size={16} className="transform transition-transform duration-300 group-hover:translate-x-1" />
                                </span>
                                <div className="hidden md:flex items-center gap-3 text-xs text-white/90 font-medium">
                                    <span>✦ Free Custom Preview</span>
                                    <span>✦ 100% Quality Guarantee</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            </section>

            {/* 9. Shop by Celebration Occasions */}
            <section className="py-14 sm:py-16 bg-[#FAF9FC] border-b border-gray-100">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-serif">
                            Shop Gifts by Celebration
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
                        {[
                            {
                                title: 'Birthday Splendors',
                                desc: 'Cakes, Hampers & Surprises',
                                link: '/products?search=birthday',
                                image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80',
                                color: 'from-[#FF64B4]/20'
                            },
                            {
                                title: 'Anniversary Romance',
                                desc: 'Red Roses & Luxury Boxes',
                                link: '/products?search=anniversary',
                                image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=400&q=80',
                                color: 'from-pink-500/20'
                            },
                            {
                                title: 'Personalised Art',
                                desc: 'Caricatures & Photo Plaques',
                                link: '/products?search=personalised',
                                image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80',
                                color: 'from-[#4cc9f0]/20'
                            },
                            {
                                title: 'Gourmet Hampers',
                                desc: 'Chocolates & Exotic Goodies',
                                link: '/products?search=hamper',
                                image: '/images/gourmet_hamper_real.png',
                                color: 'from-amber-400/20'
                            }
                        ].map((occ, idx) => (
                            <Link
                                key={idx}
                                to={occ.link}
                                className="group relative overflow-hidden rounded-3xl h-44 sm:h-52 shadow-soft hover:shadow-card-gold transition-all duration-300 hover:scale-[1.02]"
                            >
                                <img
                                    src={occ.image}
                                    alt={occ.title}
                                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-5">
                                    <h3 className="font-bold text-white text-base md:text-lg font-serif">
                                        {occ.title}
                                    </h3>
                                    <p className="text-xs text-gray-200 mt-0.5">
                                        {occ.desc}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 10. Featured Store Categories (LED frames and lamps & Personalised Mugs) */}
            <section className="py-14 sm:py-16 bg-white border-b border-gray-100">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
                    {/* Row 1: LED frames and lamps */}
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-200/70">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight font-serif">
                                    LED frames and lamps
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">
                                    Custom illuminated keepsake lamps & ambient glow photo frames
                                </p>
                            </div>
                            <Link
                                to={`/products?category=${ledCatId}`}
                                className="text-xs font-bold text-gray-700 hover:text-[#FF64B4] flex items-center gap-1.5 transition-colors self-start sm:self-center"
                            >
                                <span>View All LED Lamps</span>
                                <FiArrowRight size={14} />
                            </Link>
                        </div>

                        {ledLoading ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="w-full bg-gray-100 animate-pulse rounded-3xl h-[320px]" />
                                ))}
                            </div>
                        ) : ledProductsData?.data && ledProductsData.data.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                {ledProductsData.data.slice(0, 4).map((product, index) => (
                                    <ProductCard
                                        key={product._id}
                                        product={product}
                                        index={index}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-[#FAF9FC] rounded-3xl border border-gray-200/80">
                                <p className="text-gray-500 text-sm">Products coming soon to this collection!</p>
                            </div>
                        )}
                    </div>

                    {/* Row 2: Personalised Mugs */}
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-200/70">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight font-serif">
                                    Personalised Mugs
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">
                                    Custom photo mugs, magical heat-reveal designs & ceramic keepsakes
                                </p>
                            </div>
                            <Link
                                to={`/products?category=${mugCatId}`}
                                className="text-xs font-bold text-gray-700 hover:text-[#FF64B4] flex items-center gap-1.5 transition-colors self-start sm:self-center"
                            >
                                <span>View All Mugs</span>
                                <FiArrowRight size={14} />
                            </Link>
                        </div>

                        {mugLoading ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="w-full bg-gray-100 animate-pulse rounded-3xl h-[320px]" />
                                ))}
                            </div>
                        ) : mugProductsData?.data && mugProductsData.data.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                {mugProductsData.data.slice(0, 4).map((product, index) => (
                                    <ProductCard
                                        key={product._id}
                                        product={product}
                                        index={index}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-[#FAF9FC] rounded-3xl border border-gray-200/80">
                                <p className="text-gray-500 text-sm">Products coming soon to this collection!</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
