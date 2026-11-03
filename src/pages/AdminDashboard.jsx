import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    FiPackage, FiShoppingBag, FiUsers,
    FiTrendingUp, FiPlus, FiEdit2, FiTrash2, FiEye,
    FiGrid, FiGift, FiSettings, FiLogOut, FiHome,
    FiMenu, FiX, FiChevronLeft, FiChevronRight, FiTag, FiPieChart,
    FiBarChart2, FiActivity, FiCheck, FiImage, FiLock, FiInfo, FiStar,
    FiTruck, FiCheckCircle, FiLayout, FiSearch, FiFilter, FiRefreshCw,
    FiExternalLink, FiCopy, FiSend, FiAlertCircle, FiClock
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi2';
import { selectCurrentUser, selectIsAuthenticated, logout } from '../store/slices/authSlice';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { addToast } from '../store/slices/uiSlice';
import ProductModal from '../components/admin/ProductModal';
import CategoryModal from '../components/admin/CategoryModal';
import AdminSettingsTab from '../components/admin/AdminSettingsTab';
import DashboardCharts from '../components/admin/DashboardCharts';
import OrderDetailsModal from '../components/admin/OrderDetailsModal';
import UserDetailsModal from '../components/admin/UserDetailsModal';
import BannerModal from '../components/admin/BannerModal';
import PromoModal from '../components/admin/PromoModal';
import ComboModal from '../components/admin/ComboModal';
import logoImg from '../assets/images/PNG.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const ITEMS_PER_PAGE = 10;

const TablePagination = ({ currentPage, totalPages, totalItems, onPageChange, label = 'items' }) => {
    if (totalItems <= 0) return null;
    const effectiveTotalPages = Math.max(1, totalPages);
    const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

    return (
        <div className="px-5 py-3.5 border-t border-gray-200 bg-[#FAF9FC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-gray-500 font-medium text-center sm:flex-1 sm:text-left">
                Showing <strong className="text-gray-900">{startItem}-{endItem}</strong> of <strong className="text-gray-900">{totalItems}</strong> {label}
            </div>

            {/* Pagination Controls - ALWAYS shown so all tabs match Product page styling */}
            <div className="flex items-center justify-center gap-1.5 shrink-0">
                <button
                    type="button"
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1}
                    className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Previous Page"
                >
                    <FiChevronLeft size={16} />
                </button>

                {Array.from({ length: effectiveTotalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === effectiveTotalPages || Math.abs(p - currentPage) <= 1)
                    .reduce((acc, p, idx, arr) => {
                        if (idx > 0 && p - arr[idx - 1] > 1) {
                            acc.push('ellipsis-' + p);
                        }
                        acc.push(p);
                        return acc;
                    }, [])
                    .map((item) => {
                        if (typeof item === 'string') {
                            return <span key={item} className="px-1.5 text-gray-400 font-bold">...</span>;
                        }
                        const isCurrent = item === currentPage;
                        return (
                            <button
                                key={item}
                                type="button"
                                onClick={() => onPageChange(item)}
                                className={`min-w-8 h-8 px-2 rounded-lg font-bold text-xs transition-all ${
                                    isCurrent
                                        ? 'bg-[#FF64B4] text-white shadow-xs'
                                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {item}
                            </button>
                        );
                    })}

                <button
                    type="button"
                    onClick={() => onPageChange(Math.min(effectiveTotalPages, currentPage + 1))}
                    disabled={currentPage >= effectiveTotalPages}
                    className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Next Page"
                >
                    <FiChevronRight size={16} />
                </button>
            </div>

            <div className="text-gray-400 font-medium text-center sm:text-right hidden sm:block sm:flex-1">
                Page <strong className="text-gray-700">{currentPage}</strong> of <strong className="text-gray-700">{effectiveTotalPages}</strong>
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    // Navigation & Layout State
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isSidebarExpanded = !sidebarCollapsed || mobileMenuOpen;

    // Data State
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [banners, setBanners] = useState([]);
    const [promos, setPromos] = useState([]);
    const [combos, setCombos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filter & Search State
    const [orderSearch, setOrderSearch] = useState('');
    const [orderStatusFilter, setOrderStatusFilter] = useState('all');
    const [productSearch, setProductSearch] = useState('');
    const [productCategoryFilter, setProductCategoryFilter] = useState('all');
    const [categorySearch, setCategorySearch] = useState('');

    // Modal State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
    const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
    const [isComboModalOpen, setIsComboModalOpen] = useState(false);
    const [isAdminSettingsModalOpen, setIsAdminSettingsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingBanner, setEditingBanner] = useState(null);
    const [editingPromo, setEditingPromo] = useState(null);
    const [editingCombo, setEditingCombo] = useState(null);
    const [editingSlotNum, setEditingSlotNum] = useState(null);

    // Order & User Modal State
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [viewingOrder, setViewingOrder] = useState(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [viewingUser, setViewingUser] = useState(null);

    // Headers helper
    const getHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
        };
    };

    // Check if user is authenticated and is admin
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/admin/auth');
            return;
        }
        if (user && !user.isAdmin) {
            navigate('/');
            return;
        }
        fetchDashboardData();
    }, [isAuthenticated, user, navigate]);

    const fetchDashboardData = async (isManual = false) => {
        if (isManual) setRefreshing(true);
        else setLoading(true);

        const headers = getHeaders();
        const timestamp = Date.now();

        const promises = [
            fetch(`${API_URL}/api/products/all?t=${timestamp}`, { headers })
                .then(res => res.json())
                .then(data => setProducts(data.data || []))
                .catch(err => console.error('Error fetching products:', err)),

            fetch(`${API_URL}/api/categories?all=true&t=${timestamp}`, { headers })
                .then(res => res.json())
                .then(data => setCategories(data.data || []))
                .catch(err => console.error('Error fetching categories:', err)),

            fetch(`${API_URL}/api/orders/admin/all?t=${timestamp}`, { headers })
                .then(res => {
                    if (res.status === 401) { dispatch(logout()); navigate('/admin/auth'); return; }
                    return res.json();
                })
                .then(data => {
                    if (data) setOrders(data.data || []);
                })
                .catch(err => console.error('Error fetching orders:', err)),

            fetch(`${API_URL}/api/auth/admin/users?t=${timestamp}`, { headers })
                .then(res => {
                    if (res.status === 401) { dispatch(logout()); navigate('/admin/auth'); return; }
                    return res.json();
                })
                .then(data => {
                    if (data) setUsers(data.data || []);
                })
                .catch(err => console.error('Error fetching users:', err)),

            fetch(`${API_URL}/api/banners?all=true&t=${timestamp}`, { headers })
                .then(res => res.json())
                .then(data => setBanners(data.data || []))
                .catch(err => console.error('Error fetching banners:', err)),

            fetch(`${API_URL}/api/promos?all=true&t=${timestamp}`, { headers })
                .then(res => res.json())
                .then(data => setPromos(data.data || []))
                .catch(err => console.error('Error fetching promos:', err)),

            fetch(`${API_URL}/api/combos?all=true&t=${timestamp}`, { headers })
                .then(res => res.json())
                .then(data => setCombos(data.data || []))
                .catch(err => console.error('Error fetching combos:', err))
        ];

        try {
            await Promise.allSettled(promises);
            if (isManual) {
                dispatch(addToast({ type: 'success', message: 'Dashboard data refreshed!' }));
            }
        } catch (error) {
            console.error('Error in dashboard data fetch:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // --- Product Handlers ---
    const handleCreateProduct = async (productData) => {
        try {
            const res = await fetch(`${API_URL}/api/products`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(productData),
            });
            const data = await res.json();
            if (res.ok) {
                dispatch(addToast({ type: 'success', message: 'Product created successfully!' }));
                fetchDashboardData();
                setIsProductModalOpen(false);
            } else {
                dispatch(addToast({ type: 'error', message: data.message || 'Failed to create product' }));
            }
        } catch (error) {
            console.error('Error creating product:', error);
            dispatch(addToast({ type: 'error', message: 'An error occurred while creating product' }));
        }
    };

    const handleUpdateProduct = async (productData) => {
        try {
            const res = await fetch(`${API_URL}/api/products/${editingProduct._id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(productData),
            });
            const data = await res.json();
            if (res.ok) {
                dispatch(addToast({ type: 'success', message: 'Product updated successfully!' }));
                fetchDashboardData();
                setIsProductModalOpen(false);
                setEditingProduct(null);
            } else {
                dispatch(addToast({ type: 'error', message: data.message || 'Failed to update product' }));
            }
        } catch (error) {
            console.error('Error updating product:', error);
            dispatch(addToast({ type: 'error', message: 'An error occurred while updating product' }));
        }
    };

    const handleToggleProductActive = async (product) => {
        const nextVal = !product.isActive;
        setProducts(prev => prev.map(p => p._id === product._id ? { ...p, isActive: nextVal } : p));
        try {
            const res = await fetch(`${API_URL}/api/products/${product._id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ isActive: nextVal }),
            });
            const data = await res.json();
            if (res.ok) {
                dispatch(addToast({ 
                    type: 'success', 
                    message: nextVal ? `"${product.name}" is now Live` : `"${product.name}" moved to Draft` 
                }));
            } else {
                setProducts(prev => prev.map(p => p._id === product._id ? { ...p, isActive: !nextVal } : p));
                dispatch(addToast({ type: 'error', message: data.message || 'Failed to update status' }));
            }
        } catch (error) {
            setProducts(prev => prev.map(p => p._id === product._id ? { ...p, isActive: !nextVal } : p));
            console.error('Error toggling product isActive:', error);
            dispatch(addToast({ type: 'error', message: 'Failed to update status' }));
        }
    };

    const handleToggleProductCustomizable = async (product) => {
        const nextVal = !product.isCustomizable;
        setProducts(prev => prev.map(p => p._id === product._id ? { ...p, isCustomizable: nextVal } : p));
        try {
            const res = await fetch(`${API_URL}/api/products/${product._id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ isCustomizable: nextVal }),
            });
            const data = await res.json();
            if (res.ok) {
                dispatch(addToast({ 
                    type: 'success', 
                    message: nextVal 
                        ? `Photo upload enabled for "${product.name}"` 
                        : `Photo upload disabled (Ready-Made) for "${product.name}"` 
                }));
            } else {
                setProducts(prev => prev.map(p => p._id === product._id ? { ...p, isCustomizable: !nextVal } : p));
                dispatch(addToast({ type: 'error', message: data.message || 'Failed to update photo upload setting' }));
            }
        } catch (error) {
            setProducts(prev => prev.map(p => p._id === product._id ? { ...p, isCustomizable: !nextVal } : p));
            console.error('Error toggling product isCustomizable:', error);
            dispatch(addToast({ type: 'error', message: 'Failed to update photo upload setting' }));
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            const res = await fetch(`${API_URL}/api/products/${id}`, {
                method: 'DELETE',
                headers: getHeaders(),
            });
            const data = await res.json();
            if (res.ok) {
                dispatch(addToast({ type: 'success', message: 'Product deleted successfully!' }));
                fetchDashboardData();
            } else {
                dispatch(addToast({ type: 'error', message: data.message || 'Failed to delete product' }));
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            dispatch(addToast({ type: 'error', message: 'An error occurred while deleting product' }));
        }
    };

    const openProductModal = (product = null) => {
        setEditingProduct(product);
        setIsProductModalOpen(true);
    };

    const handleDeleteReview = async (productId, reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            const res = await fetch(`${API_URL}/api/products/${productId}/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: getHeaders(),
            });
            if (res.ok) {
                dispatch(addToast({ type: 'success', message: 'Review deleted successfully' }));
                fetchDashboardData();
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            dispatch(addToast({ type: 'error', message: 'Failed to delete review' }));
        }
    };

    // --- Category Handlers ---
    const handleCreateCategory = async (categoryData) => {
        try {
            const res = await fetch(`${API_URL}/api/categories`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(categoryData),
            });
            const data = await res.json();
            if (res.ok) {
                dispatch(addToast({ type: 'success', message: 'Category created successfully!' }));
                fetchDashboardData();
                setIsCategoryModalOpen(false);
            } else {
                throw new Error(data.message || 'Error creating category');
            }
        } catch (error) {
            console.error('Error creating category:', error);
            dispatch(addToast({ type: 'error', message: error.message || 'Failed to create category' }));
            throw error;
        }
    };

    const handleUpdateCategory = async (categoryData) => {
        try {
            const res = await fetch(`${API_URL}/api/categories/${editingCategory._id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(categoryData),
            });
            const data = await res.json();
            if (res.ok) {
                dispatch(addToast({ type: 'success', message: 'Category updated successfully!' }));
                fetchDashboardData();
                setIsCategoryModalOpen(false);
                setEditingCategory(null);
            } else {
                throw new Error(data.message || 'Error updating category');
            }
        } catch (error) {
            console.error('Error updating category:', error);
            dispatch(addToast({ type: 'error', message: error.message || 'Failed to update category' }));
            throw error;
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            const res = await fetch(`${API_URL}/api/categories/${id}`, {
                method: 'DELETE',
                headers: getHeaders(),
            });
            const data = await res.json();
            if (res.ok) {
                dispatch(addToast({ type: 'success', message: 'Category deleted successfully!' }));
                fetchDashboardData();
            } else {
                dispatch(addToast({ type: 'error', message: data.message || 'Failed to delete category' }));
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            dispatch(addToast({ type: 'error', message: 'An error occurred while deleting category' }));
        }
    };

    const openCategoryModal = (category = null) => {
        setEditingCategory(category);
        setIsCategoryModalOpen(true);
    };

    // --- Banner Handlers ---
    const handleCreateBanner = async (bannerData) => {
        try {
            const res = await fetch(`${API_URL}/api/banners`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(bannerData),
            });
            const data = await res.json();
            if (res.ok) {
                dispatch(addToast({ type: 'success', message: 'Banner created successfully!' }));
                fetchDashboardData();
                setIsBannerModalOpen(false);
            } else {
                dispatch(addToast({ type: 'error', message: data.message || 'Failed to create banner' }));
            }
        } catch (error) {
            console.error('Error creating banner:', error);
            dispatch(addToast({ type: 'error', message: 'An error occurred while creating banner' }));
        }
    };

    const handleUpdateBanner = async (bannerData) => {
        try {
            const res = await fetch(`${API_URL}/api/banners/${editingBanner._id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(bannerData),
            });
            const data = await res.json();
            if (res.ok) {
                dispatch(addToast({ type: 'success', message: 'Banner updated successfully!' }));
                fetchDashboardData();
                setIsBannerModalOpen(false);
                setEditingBanner(null);
            } else {
                dispatch(addToast({ type: 'error', message: data.message || 'Failed to update banner' }));
            }
        } catch (error) {
            console.error('Error updating banner:', error);
            dispatch(addToast({ type: 'error', message: 'An error occurred while updating banner' }));
        }
    };

    const handleDeleteBanner = async (id) => {
        if (!window.confirm('Are you sure you want to delete this banner?')) return;
        try {
            const res = await fetch(`${API_URL}/api/banners/${id}`, {
                method: 'DELETE',
                headers: getHeaders(),
            });
            const data = await res.json();
            if (res.ok) {
                dispatch(addToast({ type: 'success', message: 'Banner deleted successfully!' }));
                fetchDashboardData();
            } else {
                dispatch(addToast({ type: 'error', message: data.message || 'Failed to delete banner' }));
            }
        } catch (error) {
            console.error('Error deleting banner:', error);
            dispatch(addToast({ type: 'error', message: 'An error occurred while deleting banner' }));
        }
    };

    const openBannerModal = (banner = null) => {
        setEditingBanner(banner);
        setIsBannerModalOpen(true);
    };

    // --- Promotions Handlers ---
    const handleSavePromo = async (promoData) => {
        try {
            const res = await fetch(`${API_URL}/api/promos`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(promoData),
            });
            const data = await res.json();
            if (res.ok) {
                dispatch(addToast({ type: 'success', message: 'Promotion saved successfully!' }));
                fetchDashboardData();
                setIsPromoModalOpen(false);
                setEditingPromo(null);
                setEditingSlotNum(null);
            } else {
                dispatch(addToast({ type: 'error', message: data.message || 'Failed to save promotion' }));
            }
        } catch (error) {
            console.error('Error saving promo card:', error);
            dispatch(addToast({ type: 'error', message: 'An error occurred while saving promotion' }));
        }
    };

    const handleDeletePromo = async (id) => {
        if (!window.confirm('Are you sure you want to reset this promo slot to default?')) return;
        try {
            const res = await fetch(`${API_URL}/api/promos/${id}`, {
                method: 'DELETE',
                headers: getHeaders(),
            });
            const data = await res.json();
            if (res.ok) {
                dispatch(addToast({ type: 'success', message: 'Promotion reset successfully!' }));
                fetchDashboardData();
            } else {
                dispatch(addToast({ type: 'error', message: data.message || 'Failed to reset promotion' }));
            }
        } catch (error) {
            console.error('Error resetting promo card:', error);
            dispatch(addToast({ type: 'error', message: 'An error occurred while resetting promotion' }));
        }
    };

    const openPromoModal = (slotNum, promo = null) => {
        setEditingSlotNum(slotNum);
        setEditingPromo(promo);
        setIsPromoModalOpen(true);
    };

    // --- Celebration Combos Handlers ---
    const handleCreateCombo = async (comboData) => {
        if (combos.length >= 8) {
            const limitMsg = 'Maximum 8 combo cards allowed (2 rows of 4). Please edit or delete an existing combo.';
            dispatch(addToast({ type: 'warning', message: limitMsg }));
            alert(limitMsg);
            return;
        }
        try {
            const res = await fetch(`${API_URL}/api/combos`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(comboData),
            });
            const data = await res.json();
            if (res.ok) {
                dispatch(addToast({ type: 'success', message: 'Celebration combo created!' }));
                fetchDashboardData();
                setIsComboModalOpen(false);
            } else {
                dispatch(addToast({ type: 'error', message: data.message || 'Failed to create combo' }));
            }
        } catch (error) {
            console.error('Error creating combo:', error);
            dispatch(addToast({ type: 'error', message: 'Failed to create combo' }));
        }
    };

    const handleUpdateCombo = async (comboData) => {
        try {
            const res = await fetch(`${API_URL}/api/combos/${editingCombo._id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(comboData),
            });
            const data = await res.json();
            if (res.ok) {
                dispatch(addToast({ type: 'success', message: 'Celebration combo updated!' }));
                fetchDashboardData();
                setIsComboModalOpen(false);
                setEditingCombo(null);
            } else {
                dispatch(addToast({ type: 'error', message: data.message || 'Failed to update combo' }));
            }
        } catch (error) {
            console.error('Error updating combo:', error);
            dispatch(addToast({ type: 'error', message: 'Failed to update combo' }));
        }
    };

    const handleDeleteCombo = async (id) => {
        if (!window.confirm('Are you sure you want to delete this celebration combo?')) return;
        try {
            const res = await fetch(`${API_URL}/api/combos/${id}`, {
                method: 'DELETE',
                headers: getHeaders(),
            });
            const data = await res.json();
            if (res.ok) {
                dispatch(addToast({ type: 'success', message: 'Celebration combo deleted!' }));
                fetchDashboardData();
            } else {
                dispatch(addToast({ type: 'error', message: data.message || 'Failed to delete combo' }));
            }
        } catch (error) {
            console.error('Error deleting combo:', error);
            dispatch(addToast({ type: 'error', message: 'Failed to delete combo' }));
        }
    };

    const handleToggleComboActive = async (combo) => {
        try {
            const res = await fetch(`${API_URL}/api/combos/${combo._id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ isActive: !combo.isActive }),
            });
            if (res.ok) {
                dispatch(addToast({ type: 'success', message: `Combo marked as ${!combo.isActive ? 'Active' : 'Hidden'}` }));
                fetchDashboardData();
            }
        } catch (error) {
            console.error('Error toggling combo status:', error);
        }
    };

    const openComboModal = (combo = null) => {
        if (!combo && combos.length >= 8) {
            const limitMsg = 'Maximum 8 combo cards allowed (2 rows of 4). Please edit or delete an existing combo.';
            dispatch(addToast({ type: 'warning', message: limitMsg }));
            alert(limitMsg);
            return;
        }
        setEditingCombo(combo);
        setIsComboModalOpen(true);
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/admin/auth');
    };

    // Helper to calculate total products purchased by a user
    const getPurchasedCount = (userId) => {
        return orders
            .filter(order => (order.user?._id === userId || order.user === userId))
            .reduce((total, order) => {
                const items = order.orderItems || [];
                const orderTotal = items.reduce((acc, item) => acc + (item.quantity || item.qty || 1), 0);
                return total + orderTotal;
            }, 0);
    };

    // Refined WhatsApp message generation for gift store order milestones
    const getWhatsAppLink = (order, type) => {
        if (!order || !order.user?.phone) return null;

        const { phone, countryCode, name } = order.user;
        const cleanCountryCode = countryCode ? countryCode.replace('+', '') : '91';
        const cleanPhone = phone.replace(/\D/g, '');
        const fullPhone = `${cleanCountryCode}${cleanPhone}`;

        let message = '';
        const orderId = order._id.slice(-6).toUpperCase();

        switch (type) {
            case 'received':
                message = `Hello ${name}! ✨ Thank you for choosing Glitz Creativez! We have received your gift order #${orderId} and our artisan team is now preparing it.`;
                break;
            case 'packing':
                message = `Hello ${name}! 🎁 Your Glitz Creativez gift order #${orderId} is currently being handcrafted and luxuriously packed with care.`;
                break;
            case 'dispatched':
                message = `Hello ${name}! 🚚 Exciting news! Your Glitz Creativez gift order #${orderId} has been dispatched and is on its way to create memorable smiles.`;
                break;
            case 'delivered':
                message = `Hello ${name}! 🎉 Your Glitz Creativez gift order #${orderId} has been successfully delivered! We hope it brings endless joy. Thank you for celebrating with us!`;
                break;
            default:
                message = `Hello ${name}, this is regarding your Glitz Creativez gift order #${orderId}.`;
        }

        return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
    };

    // Computed Stats
    const totalRevenue = useMemo(() => {
        return orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);
    }, [orders]);

    const pendingOrdersCount = useMemo(() => {
        return orders.filter(o => !['delivered', 'cancelled'].includes(o.status?.toLowerCase())).length;
    }, [orders]);

    const lowStockCount = useMemo(() => {
        return products.filter(p => p.stock <= 5).length;
    }, [products]);

    // Filtered Orders
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesSearch =
                !orderSearch ||
                order._id?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                order.user?.name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                order.user?.phone?.includes(orderSearch);

            const status = order.status?.toLowerCase() || 'pending';
            const matchesStatus =
                orderStatusFilter === 'all' ||
                (orderStatusFilter === 'pending' && status === 'pending') ||
                (orderStatusFilter === 'processing' && (status === 'processing' || status === 'packing')) ||
                (orderStatusFilter === 'shipped' && (status === 'shipped' || status === 'dispatched')) ||
                (orderStatusFilter === 'delivered' && status === 'delivered') ||
                (orderStatusFilter === 'cancelled' && status === 'cancelled');

            return matchesSearch && matchesStatus;
        });
    }, [orders, orderSearch, orderStatusFilter]);

    // Filtered Products
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch =
                !productSearch ||
                product.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
                product.description?.toLowerCase().includes(productSearch.toLowerCase());

            const matchesCategory =
                productCategoryFilter === 'all' ||
                product.category === productCategoryFilter ||
                product.category?._id === productCategoryFilter;

            return matchesSearch && matchesCategory;
        });
    }, [products, productSearch, productCategoryFilter]);

    // Pagination States (10 items per page)
    const [productsPage, setProductsPage] = useState(1);
    const [ordersPage, setOrdersPage] = useState(1);
    const [categoriesPage, setCategoriesPage] = useState(1);
    const [usersPage, setUsersPage] = useState(1);
    const [reviewsPage, setReviewsPage] = useState(1);
    const [bannersPage, setBannersPage] = useState(1);

    // Paginated Slices
    const totalProductsPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
    const paginatedProducts = useMemo(() => {
        const start = (productsPage - 1) * ITEMS_PER_PAGE;
        return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredProducts, productsPage]);

    const totalOrdersPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;
    const paginatedOrders = useMemo(() => {
        const start = (ordersPage - 1) * ITEMS_PER_PAGE;
        return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredOrders, ordersPage]);

    // Filtered Categories
    const filteredCategories = useMemo(() => {
        return categories.filter(category => {
            if (!categorySearch.trim()) return true;
            const search = categorySearch.toLowerCase().trim();
            return (
                category.name?.toLowerCase().includes(search) ||
                category.slug?.toLowerCase().includes(search) ||
                category.description?.toLowerCase().includes(search)
            );
        });
    }, [categories, categorySearch]);

    const totalCategoriesPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE) || 1;
    const paginatedCategories = useMemo(() => {
        const start = (categoriesPage - 1) * ITEMS_PER_PAGE;
        return filteredCategories.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredCategories, categoriesPage]);

    const shopperUsers = useMemo(() => users.filter(u => !u.isAdmin), [users]);
    const totalUsersPages = Math.ceil(shopperUsers.length / ITEMS_PER_PAGE) || 1;
    const paginatedUsers = useMemo(() => {
        const start = (usersPage - 1) * ITEMS_PER_PAGE;
        return shopperUsers.slice(start, start + ITEMS_PER_PAGE);
    }, [shopperUsers, usersPage]);

    const allReviews = useMemo(() => {
        return products.flatMap(p => (p.reviews || []).map(r => ({
            ...r,
            productName: p.name,
            productId: p._id,
            reviewId: r._id,
            productImage: p.images?.[0]
        })));
    }, [products]);
    const totalReviewsPages = Math.ceil(allReviews.length / ITEMS_PER_PAGE) || 1;
    const paginatedReviews = useMemo(() => {
        const start = (reviewsPage - 1) * ITEMS_PER_PAGE;
        return allReviews.slice(start, start + ITEMS_PER_PAGE);
    }, [allReviews, reviewsPage]);

    const totalBannersPages = Math.ceil(banners.length / ITEMS_PER_PAGE) || 1;
    const paginatedBanners = useMemo(() => {
        const start = (bannersPage - 1) * ITEMS_PER_PAGE;
        return banners.slice(start, start + ITEMS_PER_PAGE);
    }, [banners, bannersPage]);

    const stats = [
        {
            title: 'Total Revenue',
            value: `₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            subtitle: 'Lifetime gross sales',
            icon: <span className="text-xl font-black">₹</span>,
            badge: '+18% MoM',
            badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        },
        {
            title: 'Total Orders',
            value: orders.length,
            subtitle: `${pendingOrdersCount} active / in fulfillment`,
            icon: <FiShoppingBag size={20} />,
            badge: `${pendingOrdersCount} Action Req.`,
            badgeColor: pendingOrdersCount > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-gray-50 text-gray-700 border border-gray-200'
        },
        {
            title: 'Gift Products',
            value: products.length,
            subtitle: `${lowStockCount} items low stock`,
            icon: <FiPackage size={20} />,
            badge: lowStockCount > 0 ? `${lowStockCount} Low Stock` : 'Healthy Stock',
            badgeColor: lowStockCount > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-gray-50 text-gray-700 border border-gray-200'
        },
        {
            title: 'Registered Users',
            value: users.filter(u => !u.isAdmin).length,
            subtitle: 'Verified shoppers & VIPs',
            icon: <FiUsers size={20} />,
            badge: 'Active Base',
            badgeColor: 'bg-gray-50 text-gray-700 border border-gray-200'
        },
    ];

    const sidebarItems = [
        { id: 'overview', label: 'Overview', icon: <FiGrid size={18} /> },
        { id: 'orders', label: 'Orders', icon: <FiShoppingBag size={18} />, count: orders.length, badge: pendingOrdersCount > 0 ? pendingOrdersCount : null },
        { id: 'products', label: 'Products', icon: <FiPackage size={18} />, count: products.length },
        { id: 'categories', label: 'Categories', icon: <FiTag size={18} />, count: categories.length },
        { id: 'combos', label: 'Celebration Combos', icon: <FiGift size={18} />, count: combos.length },
        { id: 'banners', label: 'Banners', icon: <FiImage size={18} />, count: banners.length },
        { id: 'reviews', label: 'Reviews', icon: <FiStar size={18} />, count: allReviews.length },
        { id: 'users', label: 'Customers', icon: <FiUsers size={18} />, count: users.filter(u => !u.isAdmin).length },
        { id: 'analytics', label: 'Analytics', icon: <FiPieChart size={18} /> },
        { id: 'settings', label: 'Admin Settings', icon: <FiSettings size={18} /> },
    ];

    // Access control fallback
    if (!isAuthenticated || (user && !user.isAdmin)) {
        return (
            <div className="min-h-screen bg-[#FAF9FC] flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-card border border-primary-100/70 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF64B4] to-[#4cc9f0] text-white flex items-center justify-center mx-auto mb-4 shadow-gold">
                        <FiLock size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Portal Protected</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        This area is reserved for Glitz Creativez store administrators. Please authenticate with your admin credentials to proceed.
                    </p>
                    <div className="space-y-3">
                        <Link
                            to="/admin/auth"
                            className="block w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-[#FF64B4] to-[#4cc9f0] text-white font-bold text-sm shadow-md hover:opacity-95 transition-all"
                        >
                            Log in as Administrator
                        </Link>
                        <Link
                            to="/"
                            className="block w-full py-2.5 px-6 rounded-2xl text-gray-600 hover:bg-gray-100 font-semibold text-xs transition-all"
                        >
                            Return to Storefront
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FC] flex text-gray-800 font-sans antialiased">

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div
                    onClick={() => setMobileMenuOpen(false)}
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                />
            )}

            {/* Sidebar (Desktop & Mobile) */}
            <aside
                className={`fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-gray-200 shadow-sm transition-all duration-300 flex flex-col ${
                    mobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
                } ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'}`}
            >
                {/* Brand Logo Header */}
                <div className={`border-b border-gray-200 transition-all relative ${
                    sidebarCollapsed && !mobileMenuOpen
                        ? 'h-20 px-2 flex items-center justify-between' 
                        : 'p-5 flex flex-col items-center justify-center text-center'
                }`}>
                    {/* Desktop Collapse Button when Expanded */}
                    {!sidebarCollapsed && (
                        <button
                            onClick={() => setSidebarCollapsed(true)}
                            className="hidden lg:flex absolute top-4 right-3 p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            title="Collapse Sidebar"
                        >
                            <FiChevronLeft size={18} />
                        </button>
                    )}

                    {/* Close button on Mobile */}
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="lg:hidden absolute top-4 right-3 p-1.5 text-gray-400 hover:text-gray-700"
                        title="Close Menu"
                    >
                        <FiX size={20} />
                    </button>

                    {sidebarCollapsed && !mobileMenuOpen ? (
                        <>
                            <Link to="/" className="flex items-center justify-center flex-1" title="Visit Storefront">
                                <img
                                    src={logoImg}
                                    alt="Glitz Creativez"
                                    className="h-9 w-9 object-contain mx-auto"
                                />
                            </Link>
                            <button
                                onClick={() => setSidebarCollapsed(false)}
                                className="hidden lg:flex p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                title="Expand Sidebar"
                            >
                                <FiChevronRight size={18} />
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center w-full">
                            <Link to="/" className="flex items-center justify-center" title="Visit Glitz Creativez Storefront">
                                <img
                                    src={logoImg}
                                    alt="Glitz Creativez"
                                    className="h-14 sm:h-16 w-auto object-contain max-w-[180px] mx-auto"
                                />
                            </Link>

                            <p className="text-xs text-gray-400 font-medium tracking-wide mt-2 text-center">
                                Store Management
                            </p>
                        </div>
                    )}
                </div>

                {/* Sidebar Navigation Links */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                    {sidebarItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setMobileMenuOpen(false);
                                }}
                                title={!isSidebarExpanded ? item.label : undefined}
                                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all ${
                                    isActive
                                        ? 'bg-gradient-to-r from-[#FF64B4] to-[#ff389a] text-white shadow-gold'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                } ${!isSidebarExpanded ? 'justify-center' : 'justify-between'}`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className={isActive ? 'text-white' : 'text-gray-500'}>
                                        {item.icon}
                                    </span>
                                    {isSidebarExpanded && (
                                        <span className="truncate">{item.label}</span>
                                    )}
                                </div>

                                {isSidebarExpanded && (
                                    <div className="flex items-center gap-1.5">
                                        {item.badge && (
                                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-amber-950 animate-pulse">
                                                {item.badge}
                                            </span>
                                        )}
                                        {item.count !== undefined && (
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                {item.count}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Sidebar Footer Info */}
                <div className="p-3 border-t border-gray-200 space-y-1">
                    <Link
                        to="/"
                        target="_blank"
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors ${
                            !isSidebarExpanded ? 'justify-center' : ''
                        }`}
                        title="View Storefront in new tab"
                    >
                        <FiExternalLink size={16} className="text-[#4cc9f0]" />
                        {isSidebarExpanded && <span>Live Storefront</span>}
                    </Link>

                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors ${
                            !isSidebarExpanded ? 'justify-center' : ''
                        }`}
                        title="Sign Out"
                    >
                        <FiLogOut size={16} />
                        {isSidebarExpanded && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main
                className={`flex-1 min-w-0 transition-all duration-300 flex flex-col ${
                    sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
                }`}
            >
                {/* Modern Header Bar */}
                <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        {/* Mobile Menu Hamburger */}
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 lg:hidden"
                        >
                            <FiMenu size={22} />
                        </button>

                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl sm:text-2xl font-black text-gray-900 capitalize tracking-tight">
                                    {activeTab === 'promos' ? 'Promotions Bento Grid' : activeTab === 'settings' ? 'Admin Settings' : activeTab}
                                </h1>
                            </div>
                            <p className="text-xs text-gray-400 hidden sm:block">
                                Luxury Gift Commerce Management System
                            </p>
                        </div>
                    </div>

                    {/* Topbar Right Actions */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Refresh Button */}
                        <button
                            onClick={() => fetchDashboardData(true)}
                            disabled={refreshing}
                            className={`p-2.5 rounded-2xl border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all flex items-center gap-2 text-xs font-semibold ${
                                refreshing ? 'opacity-60 cursor-not-allowed' : ''
                            }`}
                            title="Refresh Data"
                        >
                            <FiRefreshCw className={refreshing ? 'animate-spin text-[#FF64B4]' : ''} size={15} />
                            <span className="hidden md:inline">Refresh</span>
                        </button>


                        {/* Admin Profile Info */}
                        <div
                            onClick={() => setActiveTab('settings')}
                            className="hidden sm:block text-left pl-3 border-l border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                            title="Open Admin Settings"
                        >
                            <p className="text-xs font-bold text-gray-900 leading-tight">{user?.name || 'System Administrator'}</p>
                            <p className="text-[10px] text-gray-400">Super Administrator</p>
                        </div>
                    </div>
                </header>

                {/* Dashboard Main Content Body */}
                <div className="p-4 sm:p-6 lg:p-8 flex-1">

                    {/* ===================== TAB 1: OVERVIEW ===================== */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* Stats Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                {stats.map((stat, index) => (
                                    <motion.div
                                        key={stat.title}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.05 * index }}
                                        className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-200 hover:shadow-card transition-all relative overflow-hidden"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-800 shadow-xs">
                                                {stat.icon}
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${stat.badgeColor}`}>
                                                {stat.badge}
                                            </span>
                                        </div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{stat.title}</p>
                                        <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mt-0.5 tracking-tight">{stat.value}</h3>
                                        <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Quick Action Ribbon */}
                            <div className="bg-gradient-to-r from-primary-50 via-white to-secondary-50 border border-gray-200 rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-gray-900 text-white flex items-center justify-center shadow-sm">
                                        <HiSparkles size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">Glitz Gifting Action Bar</h4>
                                        <p className="text-xs text-gray-500">Quickly add inventory or manage seasonal gifting banners</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <Button size="sm" icon={<FiPlus />} onClick={() => openProductModal()}>
                                        New Product
                                    </Button>
                                    <button
                                        onClick={() => openBannerModal()}
                                        className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm flex items-center gap-1.5 transition-all"
                                    >
                                        <FiImage size={14} className="text-[#FF64B4]" />
                                        <span>Add Banner</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('orders')}
                                        className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm flex items-center gap-1.5 transition-all"
                                    >
                                        <FiShoppingBag size={14} className="text-[#4cc9f0]" />
                                        <span>View Orders ({orders.length})</span>
                                    </button>
                                </div>
                            </div>

                            {/* Revenue Summary Snapshot (Full Charts are on Analytics Tab) */}
                            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Revenue & Sales Performance</h3>
                                        <p className="text-xs text-gray-400">Weekly sales trajectory overview</p>
                                    </div>
                                    <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                                        Live Sync
                                    </span>
                                </div>
                                <DashboardCharts
                                    orders={orders}
                                    products={products}
                                    categories={categories}
                                    summaryOnly={true}
                                    onNavigateToAnalytics={() => setActiveTab('analytics')}
                                />
                            </div>

                            {/* Recent Orders Preview */}
                            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Recent Customer Orders</h3>
                                        <p className="text-xs text-gray-400">Latest gifting requests needing fulfillment</p>
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('orders')}
                                        className="text-xs font-bold text-[#FF64B4] hover:underline flex items-center gap-1"
                                    >
                                        <span>See All Orders</span>
                                        <FiChevronRight size={14} />
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                <th className="pb-3 px-3">Order ID</th>
                                                <th className="pb-3 px-3">Customer</th>
                                                <th className="pb-3 px-3">Status</th>
                                                <th className="pb-3 px-3 text-right">Total</th>
                                                <th className="pb-3 px-3 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 text-sm">
                                            {orders.slice(0, 6).map((order) => (
                                                <tr key={order._id} className="hover:bg-gray-50/70 transition-colors">
                                                    <td className="py-3 px-3 font-semibold text-gray-900">
                                                        #{order._id?.slice(-6).toUpperCase()}
                                                    </td>
                                                    <td className="py-3 px-3 text-gray-600">
                                                        <span className="font-medium text-gray-900">{order.user?.name || 'Gift Buyer'}</span>
                                                        {order.user?.phone && (
                                                            <span className="block text-xs text-gray-400">{order.user.phone}</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize ${
                                                            order.status === 'delivered'
                                                                ? 'bg-emerald-100 text-emerald-700'
                                                                : order.status === 'shipped'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-amber-100 text-amber-700'
                                                        }`}>
                                                            {order.status === 'delivered' ? <FiCheck size={12} /> : <FiClock size={12} />}
                                                            <span>{order.status || 'Pending'}</span>
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-3 text-right font-black text-gray-900">
                                                        ₹{order.totalPrice?.toFixed(2)}
                                                    </td>
                                                    <td className="py-3 px-3 text-right">
                                                        <button
                                                            onClick={() => {
                                                                setViewingOrder(order);
                                                                setIsOrderModalOpen(true);
                                                            }}
                                                            className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition-colors"
                                                        >
                                                            Inspect
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {orders.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="py-8 text-center text-gray-400 text-sm">
                                                        No orders received yet.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===================== TAB 2: ORDERS MANAGEMENT ===================== */}
                    {activeTab === 'orders' && (
                        <div className="space-y-6">
                            {/* Filter and Search Bar */}
                            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="relative flex-1 max-w-md">
                                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search Order ID, customer name, phone..."
                                        value={orderSearch}
                                        onChange={(e) => {
                                            setOrderSearch(e.target.value);
                                            setOrdersPage(1);
                                        }}
                                        className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-[#FF64B4] transition-all bg-[#FAF9FC]"
                                    />
                                    {orderSearch && (
                                        <button
                                            onClick={() => {
                                                setOrderSearch('');
                                                setOrdersPage(1);
                                            }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <FiX size={16} />
                                        </button>
                                    )}
                                </div>

                                {/* Status Filter Tabs */}
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                                    {[
                                        { id: 'all', label: 'All', count: orders.length },
                                        { id: 'pending', label: 'Pending', count: orders.filter(o => !o.status || o.status === 'pending').length },
                                        { id: 'processing', label: 'Packing', count: orders.filter(o => ['processing', 'packing'].includes(o.status?.toLowerCase())).length },
                                        { id: 'shipped', label: 'Dispatched', count: orders.filter(o => ['shipped', 'dispatched'].includes(o.status?.toLowerCase())).length },
                                        { id: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
                                    ].map((f) => (
                                        <button
                                            key={f.id}
                                            onClick={() => {
                                                setOrderStatusFilter(f.id);
                                                setOrdersPage(1);
                                            }}
                                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                                                orderStatusFilter === f.id
                                                    ? 'bg-gradient-to-r from-[#FF64B4] to-[#ff389a] text-white shadow-gold'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            <span>{f.label}</span>
                                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                                orderStatusFilter === f.id ? 'bg-white/25 text-white' : 'bg-white text-gray-600'
                                            }`}>
                                                {f.count}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Orders Table Container */}
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">
                                            Gifting Orders ({filteredOrders.length})
                                        </h3>
                                        <p className="text-xs text-gray-400">One-click WhatsApp customer dispatch notifications</p>
                                    </div>
                                    <span className="text-xs font-semibold px-3 py-1 bg-primary-50 text-[#FF64B4] rounded-full border border-primary-200/50">
                                        Live Fulfillment
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-[#FAF9FC] border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            <tr>
                                                <th className="py-4 px-5">Order #</th>
                                                <th className="py-4 px-5">Customer & Recipient</th>
                                                <th className="py-4 px-5">Items</th>
                                                <th className="py-4 px-5">Amount</th>
                                                <th className="py-4 px-5">Status</th>
                                                <th className="py-4 px-5 text-center">WhatsApp Gifting Updates</th>
                                                <th className="py-4 px-5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 text-sm">
                                            {filteredOrders.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" className="py-12 text-center text-gray-400">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <FiShoppingBag size={42} className="text-gray-300 mb-3" />
                                                            <p className="font-medium text-gray-600">No orders found matching filters</p>
                                                            <p className="text-xs text-gray-400 mt-1">Try clearing your search query or status filter</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedOrders.map((order) => (
                                                    <tr key={order._id} className="hover:bg-primary-50/20 transition-colors">
                                                        {/* Order Number */}
                                                        <td className="py-4 px-5">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono font-bold text-gray-900">
                                                                    #{order._id?.slice(-6).toUpperCase()}
                                                                </span>
                                                                <button
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(order._id);
                                                                        dispatch(addToast({ type: 'success', message: 'Order ID copied!' }));
                                                                    }}
                                                                    className="text-gray-400 hover:text-[#FF64B4] transition-colors"
                                                                    title="Copy Full ID"
                                                                >
                                                                    <FiCopy size={13} />
                                                                </button>
                                                            </div>
                                                            <span className="text-[11px] text-gray-400 block mt-0.5">
                                                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                        </td>

                                                        {/* Customer Details */}
                                                        <td className="py-4 px-5">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-gray-900">
                                                                    {order.user?.name || 'Guest Shopper'}
                                                                </span>
                                                                {order.user?.phone && (
                                                                    <span className="text-xs text-gray-500 font-mono">
                                                                        {order.user.countryCode || '+91'} {order.user.phone}
                                                                    </span>
                                                                )}
                                                                {order.shippingAddress?.city && (
                                                                    <span className="text-[11px] text-gray-400">
                                                                        To: {order.shippingAddress.city}, {order.shippingAddress.state}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>

                                                        {/* Items Preview */}
                                                        <td className="py-4 px-5">
                                                            <span className="font-semibold text-gray-800">
                                                                {order.orderItems?.reduce((acc, i) => acc + (i.quantity || i.qty || 1), 0) || 1} Gift(s)
                                                            </span>
                                                            <p className="text-xs text-gray-400 truncate max-w-[140px]">
                                                                {order.orderItems?.[0]?.name || 'Curated Gift'}
                                                            </p>
                                                        </td>

                                                        {/* Amount */}
                                                        <td className="py-4 px-5 font-black text-gray-900 text-base">
                                                            ₹{order.totalPrice?.toFixed(2)}
                                                        </td>

                                                        {/* Status */}
                                                        <td className="py-4 px-5">
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize ${
                                                                order.status === 'delivered'
                                                                    ? 'bg-emerald-100 text-emerald-700'
                                                                    : order.status === 'shipped'
                                                                    ? 'bg-blue-100 text-blue-700'
                                                                    : 'bg-amber-100 text-amber-700'
                                                            }`}>
                                                                {order.status === 'delivered' ? <FiCheck size={12} /> : <FiClock size={12} />}
                                                                <span>{order.status || 'Pending'}</span>
                                                            </span>
                                                        </td>

                                                        {/* WhatsApp Quick Prompts */}
                                                        <td className="py-4 px-5">
                                                            {order.user?.phone ? (
                                                                <div className="flex items-center justify-center gap-1.5">
                                                                    <a
                                                                        href={getWhatsAppLink(order, 'received')}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="px-2 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-[11px] font-bold flex items-center gap-1"
                                                                        title="WhatsApp: Send 'Order Received' message"
                                                                    >
                                                                        <FaWhatsapp className="text-emerald-500" />
                                                                        <span>Received</span>
                                                                    </a>
                                                                    <a
                                                                        href={getWhatsAppLink(order, 'packing')}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="px-2 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors text-[11px] font-bold flex items-center gap-1"
                                                                        title="WhatsApp: Send 'Packing Gift' message"
                                                                    >
                                                                        <FiPackage />
                                                                        <span>Packing</span>
                                                                    </a>
                                                                    <a
                                                                        href={getWhatsAppLink(order, 'dispatched')}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="px-2 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors text-[11px] font-bold flex items-center gap-1"
                                                                        title="WhatsApp: Send 'Dispatched' message"
                                                                    >
                                                                        <FiTruck />
                                                                        <span>Shipped</span>
                                                                    </a>
                                                                    <a
                                                                        href={getWhatsAppLink(order, 'delivered')}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="px-2 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors text-[11px] font-bold flex items-center gap-1"
                                                                        title="WhatsApp: Send 'Delivered' celebration message"
                                                                    >
                                                                        <FiCheckCircle />
                                                                        <span>Delivered</span>
                                                                    </a>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-gray-400 italic text-center block">
                                                                    No phone on file
                                                                </span>
                                                            )}
                                                        </td>

                                                        {/* Actions */}
                                                        <td className="py-4 px-5 text-right">
                                                            <button
                                                                onClick={() => {
                                                                    setViewingOrder(order);
                                                                    setIsOrderModalOpen(true);
                                                                }}
                                                                className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gradient-to-r hover:from-[#FF64B4] hover:to-[#4cc9f0] hover:text-white text-xs font-bold text-gray-700 transition-all flex items-center gap-1.5 ml-auto"
                                                            >
                                                                <FiEye size={14} />
                                                                <span>Details</span>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Orders Pagination */}
                                <TablePagination
                                    currentPage={ordersPage}
                                    totalPages={totalOrdersPages}
                                    totalItems={filteredOrders.length}
                                    onPageChange={setOrdersPage}
                                    label="orders"
                                />
                            </div>
                        </div>
                    )}

                    {/* ===================== TAB 3: PRODUCTS CATALOG ===================== */}
                    {activeTab === 'products' && (
                        <div className="space-y-6">
                            {/* Products Header, Search & Category Filter */}
                            <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-4">
                                <div>
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <h3 className="font-bold text-gray-900 text-lg">
                                            Catalog Inventory ({products.length})
                                        </h3>
                                        {(productSearch || productCategoryFilter !== 'all') && (
                                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-pink-50 text-[#FF64B4] border border-pink-200">
                                                Found {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Showing active & inactive store products
                                    </p>
                                </div>

                                {/* Product Search & Category Filter on Same Line */}
                                <div className="pt-3 border-t border-gray-100/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="relative flex-1 max-w-md">
                                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search product name, description..."
                                            value={productSearch}
                                            onChange={(e) => {
                                                setProductSearch(e.target.value);
                                                setProductsPage(1);
                                            }}
                                            className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-[#FF64B4] transition-all bg-[#FAF9FC]"
                                        />
                                        {productSearch && (
                                            <button
                                                onClick={() => {
                                                    setProductSearch('');
                                                    setProductsPage(1);
                                                }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                <FiX size={16} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <select
                                            value={productCategoryFilter}
                                            onChange={(e) => {
                                                setProductCategoryFilter(e.target.value);
                                                setProductsPage(1);
                                            }}
                                            className="px-4 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold text-gray-700 bg-[#FAF9FC] focus:outline-none focus:border-[#FF64B4]"
                                        >
                                            <option value="all">All Categories ({products.length})</option>
                                            {categories.map((c) => (
                                                <option key={c._id} value={c._id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                        {productCategoryFilter !== 'all' && (
                                            <button
                                                onClick={() => {
                                                    setProductCategoryFilter('all');
                                                    setProductsPage(1);
                                                }}
                                                className="text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-2xl transition-colors flex items-center gap-1 shrink-0"
                                                title="Clear category filter"
                                            >
                                                <FiX size={14} /> Clear Filter
                                            </button>
                                        )}

                                        <Button size="sm" icon={<FiPlus />} onClick={() => openProductModal()}>
                                            Add Product
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Products Table */}
                            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-[#FAF9FC] border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            <tr>
                                                <th className="py-4 px-5">Product</th>
                                                <th className="py-4 px-5">Price</th>
                                                <th className="py-4 px-5">Stock Status</th>
                                                <th className="py-4 px-5">Visibility</th>
                                                <th className="py-4 px-5">Recipient</th>
                                                <th className="py-4 px-5">Rating</th>
                                                <th className="py-4 px-5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 text-sm">
                                            {filteredProducts.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" className="py-12 text-center text-gray-400">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <FiPackage size={42} className="text-gray-300 mb-3" />
                                                            <p className="font-medium text-gray-600">No products found matching filters</p>
                                                            <p className="text-xs text-gray-400 mt-1">Try clearing your search query or category filter</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedProducts.map((product) => {
                                                    const imgSrc = product.images?.[0]?.startsWith('http')
                                                        ? product.images[0]
                                                        : product.images?.[0]
                                                        ? `${API_URL}${product.images[0]}`
                                                        : 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=300&q=80';

                                                    return (
                                                        <tr key={product._id} className="hover:bg-primary-50/20 transition-colors">
                                                            <td className="py-4 px-5">
                                                                <div className="flex items-center gap-3">
                                                                    <img
                                                                        src={imgSrc}
                                                                        alt={product.name}
                                                                        className="w-12 h-12 rounded-xl object-cover border border-gray-200 shadow-xs flex-shrink-0"
                                                                        onError={(e) => {
                                                                            e.target.src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=300&q=80';
                                                                        }}
                                                                    />
                                                                    <div className="min-w-0">
                                                                        <p className="font-bold text-gray-900 truncate max-w-xs">{product.name}</p>
                                                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                                            <span className="text-xs text-gray-400 truncate max-w-xs">
                                                                                {product.category?.name || 'Gift Item'}
                                                                            </span>
                                                                            {product.isCustomizable ? (
                                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-pink-50 text-[#FF64B4] border border-pink-200">
                                                                                    📸 Custom Gift
                                                                                </span>
                                                                            ) : (
                                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium text-gray-500 bg-gray-50 border border-gray-200">
                                                                                    📦 Standard Gift
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-5 whitespace-nowrap">
                                                                <div className="flex items-baseline gap-0.5">
                                                                    <span className="text-xs font-semibold text-gray-500">₹</span>
                                                                    <span className="text-sm font-bold text-gray-900 tracking-tight">
                                                                        {Number(product.price || 0).toLocaleString('en-IN', {
                                                                            minimumFractionDigits: (product.price % 1 !== 0) ? 2 : 0,
                                                                            maximumFractionDigits: 2
                                                                        })}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-5 whitespace-nowrap">
                                                                {product.stock > 50 ? (
                                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                                        {product.stock} in stock
                                                                    </span>
                                                                ) : product.stock > 25 ? (
                                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                                        {product.stock} in stock
                                                                    </span>
                                                                ) : product.stock > 0 ? (
                                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                                                        {product.stock} low stock
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-rose-600 border border-rose-200">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                                                                        Out of Stock
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="py-4 px-5 whitespace-nowrap">
                                                                <span
                                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                                                                        product.isActive
                                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                            : 'bg-rose-50 text-rose-700 border-rose-200'
                                                                    }`}
                                                                >
                                                                    <span className={`w-1.5 h-1.5 rounded-full ${product.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                                    {product.isActive ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </td>
                                                            <td className="py-4 px-5 whitespace-nowrap">
                                                                {product.recipient === 'him' && (
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                                        👨 For Him
                                                                    </span>
                                                                )}
                                                                {product.recipient === 'her' && (
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-pink-50 text-[#FF64B4] border border-pink-200">
                                                                        👩 For Her
                                                                    </span>
                                                                )}
                                                                {(!product.recipient || product.recipient === 'both') && (
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                                                        ✨ Unisex
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="py-4 px-5">
                                                                <span className="flex items-center gap-1 text-xs font-bold text-gray-700">
                                                                    <FiStar className="text-amber-400 fill-current" />
                                                                    <span>{product.rating || '5.0'}</span>
                                                                </span>
                                                            </td>
                                                            <td className="py-4 px-5 text-right">
                                                                <div className="flex items-center justify-end gap-1.5">
                                                                    <button
                                                                        onClick={() => openProductModal(product)}
                                                                        className="p-2 rounded-xl text-gray-500 hover:text-[#FF64B4] hover:bg-pink-50 transition-colors"
                                                                        title="Edit Product"
                                                                    >
                                                                        <FiEdit2 size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteProduct(product._id)}
                                                                        className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                                        title="Delete Product"
                                                                    >
                                                                        <FiTrash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Products Pagination */}
                                <TablePagination
                                    currentPage={productsPage}
                                    totalPages={totalProductsPages}
                                    totalItems={filteredProducts.length}
                                    onPageChange={setProductsPage}
                                    label="products"
                                />
                            </div>
                        </div>
                    )}

                    {/* ===================== TAB 4: HOMEPAGE BANNERS ===================== */}
                    {activeTab === 'banners' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">
                                        Homepage Carousel Banners ({banners.length})
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                        Customise luxury promotional slides on the storefront homepage
                                    </p>
                                </div>
                                <Button size="sm" icon={<FiPlus />} onClick={() => openBannerModal()}>
                                    Add Banner
                                </Button>
                            </div>

                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-[#FAF9FC] border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            <tr>
                                                <th className="py-4 px-5">Poster Preview</th>
                                                <th className="py-4 px-5">Slot Order</th>
                                                <th className="py-4 px-5">Target Redirect Link</th>
                                                <th className="py-4 px-5">Status</th>
                                                <th className="py-4 px-5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 text-sm">
                                            {banners.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="py-12 text-center text-gray-400">
                                                        <FiImage size={40} className="mx-auto text-gray-300 mb-3" />
                                                        <p className="font-bold text-gray-700">No custom banners currently uploaded</p>
                                                        <p className="text-xs text-gray-400 mt-1">The storefront is currently showing our curated high-res default gift banners.</p>
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedBanners.map((b) => (
                                                    <tr key={b._id} className="hover:bg-gray-50/70 transition-colors">
                                                        <td className="py-4 px-5">
                                                            <div className="h-16 w-36 rounded-xl bg-gray-100 overflow-hidden border border-gray-200 shadow-sm">
                                                                <img
                                                                    src={b.image?.startsWith('http') ? b.image : `${API_URL}${b.image}`}
                                                                    alt={`Slot ${b.sequence}`}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-5">
                                                            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg font-mono text-xs font-bold border border-gray-200/60">
                                                                Slot #{b.sequence || 0}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-5">
                                                            <span className="text-xs font-mono font-medium text-pink-600 bg-pink-50 px-2.5 py-1 rounded-lg border border-pink-100">
                                                                {b.link || '/products'}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-5">
                                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                                b.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                            }`}>
                                                                {b.isActive ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-5 text-right">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <button
                                                                    onClick={() => openBannerModal(b)}
                                                                    className="p-2 rounded-xl text-gray-500 hover:text-[#FF64B4] hover:bg-pink-50 transition-colors"
                                                                >
                                                                    <FiEdit2 size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteBanner(b._id)}
                                                                    className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                                >
                                                                    <FiTrash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Banners Pagination */}
                                <TablePagination
                                    currentPage={bannersPage}
                                    totalPages={totalBannersPages}
                                    totalItems={banners.length}
                                    onPageChange={setBannersPage}
                                    label="banners"
                                />
                            </div>
                        </div>
                    )}

                    {/* ===================== TAB: CELEBRATION COMBOS ===================== */}
                    {activeTab === 'combos' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-bold text-gray-900 text-lg">
                                            Bestselling Gift Combos & Hampers ({combos.length}/8)
                                        </h3>
                                        {combos.length >= 8 ? (
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                                Max 8 Reached (2 Rows of 4)
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-100 text-[#FF64B4]">
                                                {8 - combos.length} slots remaining
                                            </span>
                                        )}
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                                            Storefront Curated
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Curate paired gift sets and hampers shown on the homepage (maximum 8 cards, displayed across 2 rows of 4).
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    icon={<FiPlus />}
                                    onClick={() => openComboModal()}
                                    className={combos.length >= 8 ? 'opacity-80' : ''}
                                >
                                    Add New Combo {combos.length >= 8 ? '(Limit 8)' : ''}
                                </Button>
                            </div>

                            {/* Combos Visual Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {combos.map((combo) => (
                                    <div
                                        key={combo._id}
                                        className="bg-white rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
                                    >
                                        <div>
                                            <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                                                <img
                                                    src={combo.image?.startsWith('http') ? combo.image : `${API_URL}${combo.image}`}
                                                    alt={combo.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    onError={(e) => {
                                                        e.target.src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80';
                                                    }}
                                                />
                                                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-800 bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-full shadow-2xs">
                                                        {combo.badge || 'Bestselling Pair'}
                                                    </span>
                                                    {!combo.isActive && (
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                                                            Hidden
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-sm">
                                                    <button
                                                        onClick={() => openComboModal(combo)}
                                                        className="p-1.5 rounded-lg text-gray-600 hover:text-[#FF64B4] hover:bg-pink-50 transition-colors"
                                                        title="Edit Combo"
                                                    >
                                                        <FiEdit2 size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCombo(combo._id)}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                        title="Delete Combo"
                                                    >
                                                        <FiTrash2 size={15} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="p-4">
                                                <h4 className="font-bold text-gray-900 text-sm line-clamp-1">
                                                    {combo.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                    Includes: {combo.description}
                                                </p>
                                                <div className="mt-3 flex items-center justify-between text-xs">
                                                    <span className="font-black text-gray-900 text-sm">
                                                        ₹ {Number(combo.price).toLocaleString('en-IN')}
                                                    </span>
                                                    <span className="text-gray-400 font-mono text-[10px]">
                                                        Seq: {combo.sequence || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between text-xs">
                                            <button
                                                onClick={() => handleToggleComboActive(combo)}
                                                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                                                    combo.isActive
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                                        : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                                                }`}
                                            >
                                                {combo.isActive ? '● Live on Store' : '○ Hidden'}
                                            </button>
                                            <button
                                                onClick={() => openComboModal(combo)}
                                                className="text-[11px] font-bold text-gray-700 hover:text-[#FF64B4] transition-colors"
                                            >
                                                Edit →
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ===================== TAB 5: PROMOTIONS BENTO GRID ===================== */}
                    {activeTab === 'promos' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 text-lg">
                                    Homepage Promotional Bento Grid (8 Fixed Slots)
                                </h3>
                                <p className="text-xs text-gray-400 mt-1">
                                    Configure customized promotional blocks for your storefront. Unassigned slots automatically display curated default gift collections.
                                </p>
                            </div>

                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-[#FAF9FC] border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            <tr>
                                                <th className="py-4 px-5">Slot</th>
                                                <th className="py-4 px-5">Position Description</th>
                                                <th className="py-4 px-5">Visual Preview</th>
                                                <th className="py-4 px-5">Headline</th>
                                                <th className="py-4 px-5">Target Link</th>
                                                <th className="py-4 px-5">Status</th>
                                                <th className="py-4 px-5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 text-sm">
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map((slotNum) => {
                                                const promo = promos.find(p => p.slot === slotNum);
                                                const slotLabels = {
                                                    1: 'Slot 1: Top Left Card (Gift Hampers)',
                                                    2: 'Slot 2: Top Center Wide Banner (Celebrations)',
                                                    3: 'Slot 3: Top Right Card (Fresh Blooms)',
                                                    4: 'Slot 4: Middle Left Card (Custom Journals)',
                                                    5: 'Slot 5: Center Double Height Card (Green Plants)',
                                                    6: 'Slot 6: Middle Right Card (Custom Caricatures)',
                                                    7: 'Slot 7: Bottom Left Card (Artisan Chocolates)',
                                                    8: 'Slot 8: Bottom Right Card (Personalised Accessories)'
                                                };

                                                return (
                                                    <tr key={slotNum} className="hover:bg-gray-50/70 transition-colors">
                                                        <td className="py-4 px-5 font-mono font-bold text-gray-900">
                                                            Slot {slotNum}
                                                        </td>
                                                        <td className="py-4 px-5 text-xs font-bold text-gray-700">
                                                            {slotLabels[slotNum]}
                                                        </td>
                                                        <td className="py-4 px-5">
                                                            {promo?.image ? (
                                                                <div className="h-12 w-20 rounded-xl bg-gray-100 overflow-hidden border border-gray-200">
                                                                    <img
                                                                        src={promo.image.startsWith('http') ? promo.image : `${API_URL}${promo.image}`}
                                                                        alt={promo.title}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-gray-400 italic">Fallback Active</span>
                                                            )}
                                                        </td>
                                                        <td className="py-4 px-5">
                                                            <p className="font-bold text-gray-900">{promo?.title || 'Default Title'}</p>
                                                            {promo?.subtitle && (
                                                                <p className="text-xs text-gray-400">{promo.subtitle}</p>
                                                            )}
                                                        </td>
                                                        <td className="py-4 px-5 text-xs font-mono text-gray-500">
                                                            {promo?.link || '/products'}
                                                        </td>
                                                        <td className="py-4 px-5">
                                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                                promo?.isActive !== false
                                                                    ? 'bg-emerald-100 text-emerald-700'
                                                                    : 'bg-rose-100 text-rose-700'
                                                            }`}>
                                                                {promo?.isActive !== false ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-5 text-right">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <button
                                                                    onClick={() => openPromoModal(slotNum, promo)}
                                                                    className="p-2 rounded-xl text-gray-500 hover:text-[#FF64B4] hover:bg-pink-50 transition-colors"
                                                                    title="Edit Slot Content"
                                                                >
                                                                    <FiEdit2 size={16} />
                                                                </button>
                                                                {promo && (
                                                                    <button
                                                                        onClick={() => handleDeletePromo(promo._id)}
                                                                        className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                                        title="Reset to Default"
                                                                    >
                                                                        <FiTrash2 size={16} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===================== TAB 6: CATEGORIES ===================== */}
                    {activeTab === 'categories' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
                                <div>
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <h3 className="font-bold text-gray-900 text-lg">
                                            Gift Categories ({categories.length})
                                        </h3>
                                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-pink-50 text-[#FF64B4] border border-pink-200">
                                            ⭐ Top 10 Home Nav: {categories.filter(c => c.showOnHome).length}/10
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Organize gift collections and celebratory occasions
                                    </p>
                                </div>

                                {/* Category Search & Add Category on the Same Line */}
                                <div className="pt-3 border-t border-gray-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="relative w-full max-w-md">
                                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search categories by name, slug, description..."
                                            value={categorySearch}
                                            onChange={(e) => {
                                                setCategorySearch(e.target.value);
                                                setCategoriesPage(1);
                                            }}
                                            className="w-full pl-11 pr-9 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-[#FF64B4] transition-all bg-[#FAF9FC]"
                                        />
                                        {categorySearch && (
                                            <button
                                                onClick={() => {
                                                    setCategorySearch('');
                                                    setCategoriesPage(1);
                                                }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                title="Clear search"
                                            >
                                                <FiX size={15} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {categorySearch && (
                                            <span className="text-xs text-gray-400 font-medium hidden sm:inline">
                                                Found {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'}
                                            </span>
                                        )}
                                        <Button size="sm" icon={<FiPlus />} onClick={() => openCategoryModal()}>
                                            Add Category
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-[#FAF9FC] border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            <tr>
                                                <th className="py-4 px-5">Icon / Image</th>
                                                <th className="py-4 px-5">Display Order</th>
                                                <th className="py-4 px-5">Category Name</th>
                                                <th className="py-4 px-5">Status</th>
                                                <th className="py-4 px-5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 text-sm">
                                            {filteredCategories.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="py-12 text-center text-gray-400">
                                                        <FiGift size={40} className="mx-auto text-gray-300 mb-3" />
                                                        <p className="font-bold text-gray-700">
                                                            {categorySearch ? `No categories found matching "${categorySearch}"` : 'No categories found'}
                                                        </p>
                                                        {categorySearch && (
                                                            <button
                                                                onClick={() => {
                                                                    setCategorySearch('');
                                                                    setCategoriesPage(1);
                                                                }}
                                                                className="mt-2 text-xs font-semibold text-[#FF64B4] hover:underline"
                                                            >
                                                                Clear Search
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedCategories.map((cat) => {
                                                    const productCount = products.filter(
                                                        p => p.category === cat._id || p.category?._id === cat._id
                                                    ).length;

                                                    return (
                                                        <tr key={cat._id} className="hover:bg-gray-50/70 transition-colors">
                                                            <td className="py-4 px-5">
                                                                <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden border border-gray-200">
                                                                    {cat.image ? (
                                                                        <img
                                                                            src={cat.image?.startsWith('http') ? cat.image : `${API_URL}${cat.image}`}
                                                                            alt={cat.name}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                            <FiGift size={18} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-5 font-mono text-xs font-bold text-gray-600">
                                                                #{cat.sequence || 0}
                                                            </td>
                                                            <td className="py-4 px-5">
                                                                <span className="font-bold text-gray-900">{cat.name}</span>
                                                            </td>
                                                            <td className="py-4 px-5 whitespace-nowrap">
                                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                                                        cat.isActive !== false
                                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                                    }`}>
                                                                        <span className={`w-1.5 h-1.5 rounded-full ${cat.isActive !== false ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                                        {cat.isActive !== false ? 'Active' : 'Inactive'}
                                                                    </span>
                                                                    {cat.showOnHome && (
                                                                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-pink-50 text-[#FF64B4] border border-pink-200">
                                                                            ⭐ Home Nav
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-5 text-right">
                                                                <div className="flex items-center justify-end gap-1.5">
                                                                    {/* View in Admin Products catalog */}
                                                                    <button
                                                                        onClick={() => {
                                                                            setProductCategoryFilter(cat._id);
                                                                            setProductsPage(1);
                                                                            setActiveTab('products');
                                                                        }}
                                                                        className="px-2.5 py-1.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                                                                        title={`View ${productCount} products in Admin`}
                                                                    >
                                                                        <FiEye size={14} />
                                                                        <span>View ({productCount})</span>
                                                                    </button>

                                                                    {/* View on Live Storefront */}
                                                                    <a
                                                                        href={`/products?category=${cat._id}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-2 rounded-xl text-gray-400 hover:text-[#00aeeb] hover:bg-sky-50 transition-colors"
                                                                        title="Open category on live storefront"
                                                                    >
                                                                        <FiExternalLink size={16} />
                                                                    </a>

                                                                    {/* Edit Category */}
                                                                    <button
                                                                        onClick={() => openCategoryModal(cat)}
                                                                        className="p-2 rounded-xl text-gray-500 hover:text-[#FF64B4] hover:bg-pink-50 transition-colors"
                                                                        title="Edit Category"
                                                                    >
                                                                        <FiEdit2 size={16} />
                                                                    </button>

                                                                    {/* Delete Category */}
                                                                    <button
                                                                        onClick={() => handleDeleteCategory(cat._id)}
                                                                        className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                                        title="Delete Category"
                                                                    >
                                                                        <FiTrash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Categories Pagination */}
                                <TablePagination
                                    currentPage={categoriesPage}
                                    totalPages={totalCategoriesPages}
                                    totalItems={filteredCategories.length}
                                    onPageChange={setCategoriesPage}
                                    label="categories"
                                />
                            </div>
                        </div>
                    )}

                    {/* ===================== TAB 7: REVIEWS ===================== */}
                    {activeTab === 'reviews' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 text-lg">
                                    Customer Reviews & Feedback ({products.reduce((acc, p) => acc + (p.reviews?.length || 0), 0)})
                                </h3>
                                <p className="text-xs text-gray-400">Manage buyer testimonials and product ratings</p>
                            </div>

                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-[#FAF9FC] border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            <tr>
                                                <th className="py-4 px-5">Product</th>
                                                <th className="py-4 px-5">Customer</th>
                                                <th className="py-4 px-5">Rating</th>
                                                <th className="py-4 px-5">Review Note</th>
                                                <th className="py-4 px-5">Date</th>
                                                <th className="py-4 px-5 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 text-sm">
                                            {allReviews.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="py-12 text-center text-gray-400">
                                                        <FiStar size={40} className="mx-auto text-gray-300 mb-3" />
                                                        <p className="font-bold text-gray-700">No customer reviews yet</p>
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedReviews.map((review) => (
                                                    <tr key={review.reviewId} className="hover:bg-gray-50/70 transition-colors">
                                                        <td className="py-4 px-5">
                                                            <div className="flex items-center gap-3">
                                                                <img
                                                                    src={review.productImage?.startsWith('http') ? review.productImage : `${API_URL}${review.productImage}`}
                                                                    alt={review.productName}
                                                                    className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                                                                />
                                                                <span className="font-bold text-gray-900 truncate max-w-[160px]">
                                                                    {review.productName}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-5 font-semibold text-gray-700">{review.name}</td>
                                                        <td className="py-4 px-5">
                                                            <div className="flex items-center gap-1 font-black text-amber-500">
                                                                <FiStar className="fill-current" />
                                                                <span>{review.rating}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-5 text-gray-600 max-w-sm truncate" title={review.comment}>
                                                            {review.comment}
                                                        </td>
                                                        <td className="py-4 px-5 text-xs text-gray-400">
                                                            {new Date(review.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="py-4 px-5 text-right">
                                                            <button
                                                                onClick={() => handleDeleteReview(review.productId, review.reviewId)}
                                                                className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                                title="Delete Review"
                                                            >
                                                                <FiTrash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Reviews Pagination */}
                                <TablePagination
                                    currentPage={reviewsPage}
                                    totalPages={totalReviewsPages}
                                    totalItems={allReviews.length}
                                    onPageChange={setReviewsPage}
                                    label="reviews"
                                />
                            </div>
                        </div>
                    )}

                    {/* ===================== TAB 8: USERS & CUSTOMERS ===================== */}
                    {activeTab === 'users' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 text-lg">
                                    Customer Accounts ({users.filter(u => !u.isAdmin).length})
                                </h3>
                                <p className="text-xs text-gray-400">View customer gifting history and verified profiles</p>
                            </div>

                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-[#FAF9FC] border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            <tr>
                                                <th className="py-4 px-5">Customer</th>
                                                <th className="py-4 px-5">Email Address</th>
                                                <th className="py-4 px-5">Phone Contact</th>
                                                <th className="py-4 px-5">State</th>
                                                <th className="py-4 px-5">District</th>
                                                <th className="py-4 px-5">Gifts Purchased</th>
                                                <th className="py-4 px-5">Role</th>
                                                <th className="py-4 px-5">Member Since</th>
                                                <th className="py-4 px-5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 text-sm">
                                            {shopperUsers.length === 0 ? (
                                                <tr>
                                                    <td colSpan="9" className="py-12 text-center text-gray-400">
                                                        <FiUsers size={40} className="mx-auto text-gray-300 mb-3" />
                                                        <p className="font-bold text-gray-700">No customer accounts registered yet</p>
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedUsers.map((u) => {
                                                    const userOrder = orders.find(o => (o.user?._id || o.user) === u._id);
                                                    const userPhone = u.phone || u.address?.phone || userOrder?.shippingAddress?.phone || '';
                                                    const userState = u.address?.state || userOrder?.shippingAddress?.state || '—';
                                                    const userDistrict = u.address?.district || u.address?.city || userOrder?.shippingAddress?.district || userOrder?.shippingAddress?.city || '—';

                                                    return (
                                                        <tr key={u._id} className="hover:bg-gray-50/70 transition-colors">
                                                            <td className="py-4 px-5">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FF64B4] to-[#4cc9f0] p-0.5 shadow-sm">
                                                                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-xs text-[#FF64B4]">
                                                                            {u.name ? u.name.charAt(0).toUpperCase() : 'C'}
                                                                        </div>
                                                                    </div>
                                                                    <span className="font-bold text-gray-900">{u.name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-5 text-gray-600 text-xs font-mono">{u.email}</td>
                                                            <td className="py-4 px-5 text-gray-600 text-xs font-mono">
                                                                {userPhone ? (userPhone.startsWith('+') ? userPhone : `+91 ${userPhone}`) : '—'}
                                                            </td>
                                                            <td className="py-4 px-5 text-xs">
                                                                {userState !== '—' ? (
                                                                    <span className="font-semibold text-gray-800 bg-gray-100/90 px-2.5 py-1 rounded-lg border border-gray-200/50">
                                                                        {userState}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-400">—</span>
                                                                )}
                                                            </td>
                                                            <td className="py-4 px-5 text-xs font-medium text-gray-700">
                                                                {userDistrict}
                                                            </td>
                                                            <td className="py-4 px-5 font-black text-gray-900">
                                                                {getPurchasedCount(u._id)}
                                                            </td>
                                                            <td className="py-4 px-5">
                                                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary-50 text-[#FF64B4] border border-primary-200/50">
                                                                    Shopper
                                                                </span>
                                                            </td>
                                                            <td className="py-4 px-5 text-xs text-gray-400">
                                                                {new Date(u.createdAt).toLocaleDateString()}
                                                            </td>
                                                            <td className="py-4 px-5 text-right">
                                                                <button
                                                                    onClick={() => {
                                                                        setViewingUser(u);
                                                                        setIsUserModalOpen(true);
                                                                    }}
                                                                    className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-[#FF64B4] hover:text-white text-xs font-bold text-gray-700 transition-colors"
                                                                >
                                                                    Inspect Profile
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Customers Pagination */}
                                <TablePagination
                                    currentPage={usersPage}
                                    totalPages={totalUsersPages}
                                    totalItems={shopperUsers.length}
                                    onPageChange={setUsersPage}
                                    label="customer accounts"
                                />
                            </div>
                        </div>
                    )}

                    {/* ===================== TAB 9: ANALYTICS ===================== */}
                    {activeTab === 'analytics' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-sm">
                                <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                                            Store Performance Analytics
                                        </h2>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Full breakdown of revenue trajectory, order status, catalog category distribution, and top-selling gifts
                                        </p>
                                    </div>
                                    <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                                        Live Metrics
                                    </span>
                                </div>
                                <DashboardCharts
                                    orders={orders}
                                    products={products}
                                    categories={categories}
                                    summaryOnly={false}
                                />
                            </div>
                        </div>
                    )}

                    {/* ===================== TAB 10: SETTINGS ===================== */}
                    {activeTab === 'settings' && (
                        <AdminSettingsTab />
                    )}

                </div>
            </main>

            {/* Modals */}
            <ProductModal
                isOpen={isProductModalOpen}
                onClose={() => {
                    setIsProductModalOpen(false);
                    setEditingProduct(null);
                }}
                onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
                product={editingProduct}
                categories={categories}
            />

            <CategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => {
                    setIsCategoryModalOpen(false);
                    setEditingCategory(null);
                }}
                onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
                category={editingCategory}
                categories={categories}
            />

            <BannerModal
                isOpen={isBannerModalOpen}
                onClose={() => {
                    setIsBannerModalOpen(false);
                    setEditingBanner(null);
                }}
                onSubmit={editingBanner ? handleUpdateBanner : handleCreateBanner}
                banner={editingBanner}
                banners={banners}
            />

            <PromoModal
                isOpen={isPromoModalOpen}
                onClose={() => {
                    setIsPromoModalOpen(false);
                    setEditingPromo(null);
                    setEditingSlotNum(null);
                }}
                onSubmit={handleSavePromo}
                slotNum={editingSlotNum}
                promo={editingPromo}
            />

            <ComboModal
                isOpen={isComboModalOpen}
                onClose={() => {
                    setIsComboModalOpen(false);
                    setEditingCombo(null);
                }}
                onSubmit={editingCombo ? handleUpdateCombo : handleCreateCombo}
                combo={editingCombo}
                combos={combos}
            />

            <OrderDetailsModal
                isOpen={isOrderModalOpen}
                onClose={() => {
                    setIsOrderModalOpen(false);
                    setViewingOrder(null);
                }}
                order={viewingOrder}
            />

            <UserDetailsModal
                isOpen={isUserModalOpen}
                onClose={() => {
                    setIsUserModalOpen(false);
                    setViewingUser(null);
                }}
                user={viewingUser}
                orders={orders}
            />
        </div>
    );
};

export default AdminDashboard;
