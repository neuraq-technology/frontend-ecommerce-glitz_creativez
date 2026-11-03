import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    FiTrendingUp, FiPieChart, FiBox, FiTag, FiShoppingCart, FiChevronRight,
    FiCalendar, FiAward, FiActivity, FiBarChart2, FiChevronDown, FiCheck
} from 'react-icons/fi';

const COLORS = ['#FF64B4', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#06B6D4', '#EC4899'];

const TIME_RANGES = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: '7d', label: 'Last 7 Days' },
    { id: 'monthly', label: '📅 Month (30 Days)' },
    { id: 'yearly', label: '📊 All 12 Months' },
    { id: 'all', label: 'All Time' },
];

const DashboardCharts = ({
    orders = [],
    products = [],
    categories = [],
    summaryOnly = false,
    onNavigateToAnalytics,
    initialTimeRange = '7d'
}) => {
    const now = new Date();
    const [timeRange, setTimeRange] = useState(initialTimeRange);
    const [selectedYear, setSelectedYear] = useState(Math.max(now.getFullYear(), 2026));
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
    const [chartType, setChartType] = useState('area'); // 'area' | 'bar'
    const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
    const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
    const monthDropdownRef = useRef(null);
    const yearDropdownRef = useRef(null);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (monthDropdownRef.current && !monthDropdownRef.current.contains(e.target)) {
                setIsMonthDropdownOpen(false);
            }
            if (yearDropdownRef.current && !yearDropdownRef.current.contains(e.target)) {
                setIsYearDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Month selector options (Starting from 2026 onwards)
    const monthOptions = useMemo(() => {
        const START_YEAR = 2026;
        const options = [];
        const base = new Date();
        const currentYear = Math.max(base.getFullYear(), START_YEAR);
        const currentMonth = base.getMonth();

        for (let y = currentYear; y >= START_YEAR; y--) {
            const maxMonth = (y === currentYear) ? currentMonth : 11;
            for (let m = maxMonth; m >= 0; m--) {
                const targetDate = new Date(y, m, 1);
                const label = targetDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                options.push({ year: y, month: m, value: `${y}-${m}`, label });
            }
        }
        return options;
    }, []);

    // Year options starting from 2026 onwards
    const yearOptions = useMemo(() => {
        const START_YEAR = 2026;
        const currentYear = Math.max(new Date().getFullYear(), START_YEAR);
        const years = [];
        for (let y = currentYear; y >= START_YEAR; y--) {
            years.push(y);
        }
        return years;
    }, []);

    // --- Filter orders by selected timeRange ---
    const filteredOrders = useMemo(() => {
        if (!orders || orders.length === 0) return [];
        const currentDate = new Date();
        const startOfToday = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        const endOfToday = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59, 999);

        if (timeRange === 'today') {
            return orders.filter(o => {
                if (!o.createdAt) return false;
                const d = new Date(o.createdAt);
                return d >= startOfToday && d <= endOfToday;
            });
        }

        if (timeRange === 'yesterday') {
            const startOfYesterday = new Date(startOfToday);
            startOfYesterday.setDate(startOfYesterday.getDate() - 1);
            const endOfYesterday = new Date(startOfToday.getTime() - 1);
            return orders.filter(o => {
                if (!o.createdAt) return false;
                const d = new Date(o.createdAt);
                return d >= startOfYesterday && d <= endOfYesterday;
            });
        }

        if (timeRange === '7d') {
            const sevenDaysAgo = new Date(startOfToday);
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
            return orders.filter(o => {
                if (!o.createdAt) return false;
                const d = new Date(o.createdAt);
                return d >= sevenDaysAgo && d <= endOfToday;
            });
        }

        if (timeRange === 'monthly') {
            return orders.filter(o => {
                if (!o.createdAt) return false;
                const d = new Date(o.createdAt);
                return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
            });
        }

        if (timeRange === 'yearly') {
            return orders.filter(o => {
                if (!o.createdAt) return false;
                const d = new Date(o.createdAt);
                return d.getFullYear() === selectedYear;
            });
        }

        return orders;
    }, [orders, timeRange, selectedYear, selectedMonth]);

    // Period KPI Summary calculations
    const periodRevenue = useMemo(() => {
        return filteredOrders.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
    }, [filteredOrders]);

    const periodItemsSold = useMemo(() => {
        return filteredOrders.reduce((acc, order) => {
            const itemsCount = (order.orderItems || []).reduce((sum, item) => sum + (item.qty || item.quantity || 1), 0);
            return acc + itemsCount;
        }, 0);
    }, [filteredOrders]);

    const avgOrderValue = useMemo(() => {
        if (filteredOrders.length === 0) return 0;
        return periodRevenue / filteredOrders.length;
    }, [filteredOrders, periodRevenue]);

    // --- 1. Revenue Chart Data ---
    const revenueData = useMemo(() => {
        const currentDate = new Date();

        // Step 2: 30-Day Daily Graph with Day Identification
        if (timeRange === 'monthly') {
            const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
            return Array.from({ length: daysInMonth }, (_, i) => {
                const dayNum = i + 1;
                const dateObj = new Date(selectedYear, selectedMonth, dayNum);
                const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                const fullWeekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                const fullDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                const dayOrders = orders.filter(o => {
                    if (!o.createdAt) return false;
                    const od = new Date(o.createdAt);
                    return od.getFullYear() === selectedYear && od.getMonth() === selectedMonth && od.getDate() === dayNum;
                });

                const dayRevenue = dayOrders.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

                return {
                    day: dayNum,
                    date: `${dayNum}`, // X-axis label: 1, 2, 3...
                    fullDate,
                    weekday,
                    fullWeekday,
                    isWeekend: weekday === 'Sat' || weekday === 'Sun',
                    revenue: dayRevenue,
                    orderCount: dayOrders.length
                };
            });
        }

        // Step 1: All 12 Months Graph (Yearly View)
        if (timeRange === 'yearly') {
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const fullMonthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];

            return monthNames.map((name, index) => {
                const monthOrders = orders.filter(o => {
                    if (!o.createdAt) return false;
                    const od = new Date(o.createdAt);
                    return od.getFullYear() === selectedYear && od.getMonth() === index;
                });

                const monthTotal = monthOrders.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

                return {
                    monthIndex: index,
                    date: name,
                    fullMonth: fullMonthNames[index],
                    year: selectedYear,
                    revenue: monthTotal,
                    orderCount: monthOrders.length
                };
            });
        }

        // Hourly for Today / Yesterday
        if (timeRange === 'today' || timeRange === 'yesterday') {
            const hours = [0, 3, 6, 9, 12, 15, 18, 21];
            return hours.map(h => {
                const label = h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
                const bucketOrders = filteredOrders.filter(o => {
                    const hour = new Date(o.createdAt).getHours();
                    return hour >= h && hour < h + 3;
                });
                const bucketRevenue = bucketOrders.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

                return {
                    date: label,
                    revenue: bucketRevenue,
                    orderCount: bucketOrders.length
                };
            });
        }

        if (timeRange === 'all') {
            return [...Array(6)].map((_, i) => {
                const d = new Date();
                d.setMonth(d.getMonth() - (5 - i));
                const year = d.getFullYear();
                const month = d.getMonth();
                const monthOrders = filteredOrders.filter(o => {
                    if (!o.createdAt) return false;
                    const od = new Date(o.createdAt);
                    return od.getFullYear() === year && od.getMonth() === month;
                });
                const monthTotal = monthOrders.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
                return {
                    date: d.toLocaleDateString('en-US', { month: 'short' }),
                    revenue: monthTotal,
                    orderCount: monthOrders.length
                };
            });
        }

        // Default '7d'
        return [...Array(7)].map((_, i) => {
            const d = new Date(currentDate);
            d.setDate(d.getDate() - (6 - i));
            const y = d.getFullYear();
            const m = d.getMonth();
            const dateNum = d.getDate();

            const dayOrders = orders.filter(o => {
                if (!o.createdAt) return false;
                const od = new Date(o.createdAt);
                return od.getFullYear() === y && od.getMonth() === m && od.getDate() === dateNum;
            });
            const dailyTotal = dayOrders.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
            return {
                date: d.toLocaleDateString('en-US', { weekday: 'short' }),
                revenue: dailyTotal,
                orderCount: dayOrders.length
            };
        });
    }, [orders, filteredOrders, timeRange, selectedYear, selectedMonth]);

    // Statistics for 30-Day Month View (Day Identification)
    const monthStats = useMemo(() => {
        if (timeRange !== 'monthly') return null;
        let peak = { day: null, fullDate: '', weekday: '', revenue: 0, orderCount: 0 };
        let totalRev = 0;

        revenueData.forEach(item => {
            totalRev += (item.revenue || 0);
            if (item.revenue > peak.revenue) {
                peak = item;
            }
        });

        const daysCount = revenueData.length || 30;
        const dailyAvg = totalRev / daysCount;

        return {
            peakDay: peak.revenue > 0 ? peak : null,
            totalRevenue: totalRev,
            dailyAverage: dailyAvg
        };
    }, [timeRange, revenueData]);

    // Statistics for 12-Month Yearly View
    const yearStats = useMemo(() => {
        if (timeRange !== 'yearly') return null;
        let topMonth = { fullMonth: '', revenue: 0, orderCount: 0 };
        let totalRev = 0;

        revenueData.forEach(item => {
            totalRev += (item.revenue || 0);
            if (item.revenue > topMonth.revenue) {
                topMonth = item;
            }
        });

        return {
            topMonth: topMonth.revenue > 0 ? topMonth : null,
            totalRevenue: totalRev
        };
    }, [timeRange, revenueData]);

    // --- 2. Order Status Data ---
    const statusData = useMemo(() => {
        const statusCounts = filteredOrders.reduce((acc, order) => {
            const status = order.status || 'pending';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        return Object.keys(statusCounts).map(status => ({
            name: status.charAt(0).toUpperCase() + status.slice(1),
            value: statusCounts[status]
        }));
    }, [filteredOrders]);

    // --- 3. Top Selling Products ---
    const topProducts = useMemo(() => {
        const productStats = {};
        filteredOrders.forEach(order => {
            order.orderItems?.forEach(item => {
                const id = item.product || item._id;
                if (!productStats[id]) {
                    productStats[id] = {
                        name: item.name,
                        image: item.image,
                        price: item.price,
                        count: 0,
                        revenue: 0
                    };
                }
                const qty = item.qty || item.quantity || 1;
                productStats[id].count += qty;
                productStats[id].revenue += qty * (item.price || 0);
            });
        });
        return Object.values(productStats)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
    }, [filteredOrders]);

    // --- 4. Category Distribution ---
    const categoryData = useMemo(() => {
        const categoryMap = new Map();
        categories.forEach(c => {
            if (c._id && c.name) {
                categoryMap.set(String(c._id), c.name);
            }
        });

        const counts = products.reduce((acc, p) => {
            let catName = 'Uncategorized';
            if (p.category) {
                if (typeof p.category === 'object' && p.category !== null) {
                    if (p.category.name) {
                        catName = p.category.name;
                    } else if (p.category._id && categoryMap.has(String(p.category._id))) {
                        catName = categoryMap.get(String(p.category._id));
                    }
                } else if (categoryMap.has(String(p.category))) {
                    catName = categoryMap.get(String(p.category));
                } else if (typeof p.category === 'string' && !/^[0-9a-fA-F]{24}$/.test(p.category)) {
                    catName = p.category;
                }
            }
            acc[catName] = (acc[catName] || 0) + 1;
            return acc;
        }, {});

        const sorted = Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        if (sorted.length > 6) {
            const top5 = sorted.slice(0, 5);
            const otherCount = sorted.slice(5).reduce((sum, item) => sum + item.value, 0);
            if (otherCount > 0) {
                top5.push({ name: 'Other Categories', value: otherCount });
            }
            return top5;
        }

        return sorted;
    }, [products, categories]);

    // Descriptive range label
    const getDateRangeLabel = (range) => {
        const currentDate = new Date();
        if (range === 'today') {
            return `Today (${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})`;
        }
        if (range === 'yesterday') {
            const y = new Date();
            y.setDate(y.getDate() - 1);
            return `Yesterday (${y.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})`;
        }
        if (range === '7d') {
            const start = new Date();
            start.setDate(start.getDate() - 6);
            return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        }
        if (range === 'monthly') {
            const monthLabel = new Date(selectedYear, selectedMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            const daysCount = new Date(selectedYear, selectedMonth + 1, 0).getDate();
            return `${monthLabel} (Full ${daysCount}-Day Daily Breakdown)`;
        }
        if (range === 'yearly') {
            return `Calendar Year ${selectedYear} (All 12 Months: Jan – Dec)`;
        }
        return 'All Time (Full Store History)';
    };

    // Custom Tooltip for Daily / Monthly Views
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;

            // Monthly 30-day tooltip (identifies exact day & weekday)
            if (timeRange === 'monthly' && data.fullDate) {
                return (
                    <div className="bg-white p-3.5 border border-gray-100 shadow-xl rounded-2xl min-w-[200px]">
                        <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-gray-100">
                            <div>
                                <p className="text-xs font-bold text-gray-900 leading-tight">{data.fullDate}</p>
                                <p className="text-[10px] text-gray-400">{data.fullWeekday}</p>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${data.isWeekend ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-gray-100 text-gray-600'
                                }`}>
                                {data.weekday}
                            </span>
                        </div>
                        <div className="space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500 font-medium">Revenue:</span>
                                <span className="font-bold text-[#FF64B4]">
                                    ₹{data.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500 font-medium">Orders Placed:</span>
                                <span className="font-bold text-gray-800">{data.orderCount}</span>
                            </div>
                        </div>
                    </div>
                );
            }

            // 12-Month yearly tooltip
            if (timeRange === 'yearly' && data.fullMonth) {
                return (
                    <div className="bg-white p-3.5 border border-gray-100 shadow-xl rounded-2xl min-w-[200px]">
                        <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-gray-100">
                            <span className="text-xs font-bold text-gray-900">{data.fullMonth} {data.year}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-[#FF64B4] border border-pink-100">
                                Month Total
                            </span>
                        </div>
                        <div className="space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500 font-medium">Revenue:</span>
                                <span className="font-bold text-[#FF64B4]">
                                    ₹{data.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500 font-medium">Orders:</span>
                                <span className="font-bold text-gray-800">{data.orderCount}</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 pt-1 border-t border-gray-100 text-center font-medium">
                            💡 Click bar to zoom into daily breakdown
                        </p>
                    </div>
                );
            }

            // Default Tooltip
            return (
                <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-xl">
                    <p className="text-xs font-bold text-gray-900">{data.date}</p>
                    <p className="text-sm text-[#FF64B4] font-bold mt-1">
                        ₹{(payload[0].value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>
            );
        }
        return null;
    };

    // Summary mode used on the Overview tab
    if (summaryOnly) {
        const last7Total = revenueData.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
        return (
            <div className="w-full">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                            <FiTrendingUp size={18} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-gray-900">7-Day Revenue Trajectory</h4>
                            <p className="text-xs text-gray-500">
                                Total <strong className="text-gray-900">₹{last7Total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> earned over the last 7 days
                            </p>
                        </div>
                    </div>
                    {onNavigateToAnalytics && (
                        <button
                            type="button"
                            onClick={onNavigateToAnalytics}
                            className="text-xs font-bold text-[#FF64B4] hover:text-[#e04899] bg-pink-50 hover:bg-pink-100/70 border border-pink-200/80 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
                        >
                            <span>View Full Analytics Breakdown</span>
                            <FiChevronRight size={14} />
                        </button>
                    )}
                </div>

                <div className="h-[280px] w-full" style={{ minHeight: '280px' }}>
                    <ResponsiveContainer width="99%" height={280}>
                        <AreaChart data={revenueData}>
                            <defs>
                                <linearGradient id="colorRevenueSummary" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#D97706" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#D97706" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                tickFormatter={(value) => `₹${value}`}
                            />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#D97706"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorRevenueSummary)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    }

    const activeRangeLabel = TIME_RANGES.find(r => r.id === timeRange)?.label || 'Last 7 Days';

    // Full Analytics Mode
    return (
        <div className="space-y-6">
            {/* Global Date Range Filter Bar */}
            <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#FF64B4] shadow-xs shrink-0">
                        <FiCalendar size={18} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">Date Range Filter</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF64B4]/10 text-[#FF64B4]">
                                Live Sync
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">{getDateRangeLabel(timeRange)}</p>
                    </div>
                </div>

                {/* Controls Container */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Custom Month Picker dropdown when in 'monthly' mode */}
                    {timeRange === 'monthly' && (
                        <div className="relative" ref={monthDropdownRef}>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsMonthDropdownOpen(!isMonthDropdownOpen);
                                    setIsYearDropdownOpen(false);
                                }}
                                className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-[#FF64B4]/50 shadow-xs hover:border-[#FF64B4] transition-all"
                            >
                                <span className="text-[11px] font-bold text-[#FF64B4]">Select Month:</span>
                                <span className="text-xs font-bold text-gray-800">
                                    {monthOptions.find(opt => opt.value === `${selectedYear}-${selectedMonth}`)?.label || 'Select Month'}
                                </span>
                                <FiChevronDown size={14} className={`text-gray-400 transition-transform ${isMonthDropdownOpen ? 'rotate-180 text-[#FF64B4]' : ''}`} />
                            </button>

                            {isMonthDropdownOpen && (
                                <div className="absolute right-0 sm:left-0 mt-1.5 w-56 max-h-64 overflow-y-auto bg-white rounded-2xl border border-pink-100 shadow-2xl p-1.5 z-50 custom-scrollbar animate-in fade-in duration-150">
                                    {monthOptions.map(opt => {
                                        const isSelected = `${selectedYear}-${selectedMonth}` === opt.value;
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => {
                                                    const [y, m] = opt.value.split('-').map(Number);
                                                    setSelectedYear(y);
                                                    setSelectedMonth(m);
                                                    setIsMonthDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between mb-0.5 ${isSelected
                                                        ? 'bg-[#FF64B4] text-white shadow-xs'
                                                        : 'text-gray-700 hover:bg-pink-50 hover:text-[#FF64B4]'
                                                    }`}
                                            >
                                                <span>{opt.label}</span>
                                                {isSelected && <FiCheck size={14} className="text-white shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Custom Year Picker dropdown when in 'yearly' mode */}
                    {timeRange === 'yearly' && (
                        <div className="relative" ref={yearDropdownRef}>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsYearDropdownOpen(!isYearDropdownOpen);
                                    setIsMonthDropdownOpen(false);
                                }}
                                className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-[#FF64B4]/50 shadow-xs hover:border-[#FF64B4] transition-all"
                            >
                                <span className="text-[11px] font-bold text-[#FF64B4]">Select Year:</span>
                                <span className="text-xs font-bold text-gray-800">{selectedYear}</span>
                                <FiChevronDown size={14} className={`text-gray-400 transition-transform ${isYearDropdownOpen ? 'rotate-180 text-[#FF64B4]' : ''}`} />
                            </button>

                            {isYearDropdownOpen && (
                                <div className="absolute right-0 sm:left-0 mt-1.5 w-40 max-h-60 overflow-y-auto bg-white rounded-2xl border border-pink-100 shadow-2xl p-1.5 z-50 custom-scrollbar animate-in fade-in duration-150">
                                    {yearOptions.map(y => {
                                        const isSelected = selectedYear === y;
                                        return (
                                            <button
                                                key={y}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedYear(y);
                                                    setIsYearDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between mb-0.5 ${isSelected
                                                        ? 'bg-[#FF64B4] text-white shadow-xs'
                                                        : 'text-gray-700 hover:bg-pink-50 hover:text-[#FF64B4]'
                                                    }`}
                                            >
                                                <span>{y}</span>
                                                {isSelected && <FiCheck size={14} className="text-white shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Segmented Pill Selector */}
                    <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-x-auto">
                        {TIME_RANGES.map(range => (
                            <button
                                key={range.id}
                                type="button"
                                onClick={() => setTimeRange(range.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${timeRange === range.id
                                        ? 'bg-[#FF64B4] text-white shadow-xs'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick KPI Strip for Selected Period */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Period Revenue</p>
                    <p className="text-lg font-black text-gray-900 mt-1">₹{periodRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Orders Placed</p>
                    <p className="text-lg font-black text-gray-900 mt-1">{filteredOrders.length}</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Avg Order Value</p>
                    <p className="text-lg font-black text-gray-900 mt-1">₹{avgOrderValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Items Ordered</p>
                    <p className="text-lg font-black text-gray-900 mt-1">{periodItemsSold}</p>
                </div>
            </div>

            {/* 4 Responsive Visual Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Revenue Chart */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700">
                                <FiTrendingUp size={16} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Revenue Trajectory</h3>
                                <p className="text-[11px] text-gray-400">
                                    {timeRange === 'monthly' ? 'Daily breakdown of each day in the month' :
                                        timeRange === 'yearly' ? 'All 12 months annual comparison (Click any month to inspect)' :
                                            'Sales volume over time'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Chart style switch: Area vs Bar */}
                            <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg border border-gray-200/60">
                                <button
                                    type="button"
                                    onClick={() => setChartType('area')}
                                    className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all ${chartType === 'area' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                >
                                    Area
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setChartType('bar')}
                                    className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all ${chartType === 'bar' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                >
                                    Bar
                                </button>
                            </div>

                            <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-semibold">
                                {activeRangeLabel}
                            </div>
                        </div>
                    </div>

                    {/* Step 2 Identification Callouts: Peak Day, Weekdays & Daily Average */}
                    {timeRange === 'monthly' && monthStats && (
                        <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-pink-50/60 rounded-2xl border border-pink-100">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-xl border border-pink-200/80 shadow-2xs">
                                <FiAward className="text-[#FF64B4]" size={14} />
                                <span className="text-xs font-semibold text-gray-600">Peak Sales Day:</span>
                                <strong className="text-xs font-bold text-gray-900">
                                    {monthStats.peakDay
                                        ? `${monthStats.peakDay.fullDate} (${monthStats.peakDay.weekday}) — ₹${monthStats.peakDay.revenue.toLocaleString('en-IN')}`
                                        : 'No orders recorded yet'}
                                </strong>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-xl border border-gray-200/70 shadow-2xs">
                                <FiActivity className="text-emerald-600" size={14} />
                                <span className="text-xs font-semibold text-gray-600">Daily Average:</span>
                                <strong className="text-xs font-bold text-gray-900">
                                    ₹{monthStats.dailyAverage.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/day
                                </strong>
                            </div>
                        </div>
                    )}

                    {/* Step 1 Callouts: Top Month in Year */}
                    {timeRange === 'yearly' && yearStats && (
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 p-3 bg-pink-50/60 rounded-2xl border border-pink-100">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-xl border border-pink-200/80 shadow-2xs">
                                <FiAward className="text-[#FF64B4]" size={14} />
                                <span className="text-xs font-semibold text-gray-600">Top Month in {selectedYear}:</span>
                                <strong className="text-xs font-bold text-gray-900">
                                    {yearStats.topMonth
                                        ? `${yearStats.topMonth.fullMonth} — ₹${yearStats.topMonth.revenue.toLocaleString('en-IN')}`
                                        : 'No orders recorded yet'}
                                </strong>
                            </div>
                            <span className="text-[11px] text-[#FF64B4] font-semibold">
                                💡 Tip: Click any month to inspect its 30-day daily breakdown
                            </span>
                        </div>
                    )}

                    {/* Chart Container */}
                    <div className="h-[300px] w-full flex-1" style={{ minHeight: '300px' }}>
                        <ResponsiveContainer width="99%" height={300}>
                            {chartType === 'bar' ? (
                                <BarChart
                                    data={revenueData}
                                    onClick={(data) => {
                                        if (timeRange === 'yearly' && data && data.activePayload && data.activePayload[0]) {
                                            const item = data.activePayload[0].payload;
                                            if (item.monthIndex !== undefined) {
                                                setSelectedMonth(item.monthIndex);
                                                setTimeRange('monthly');
                                            }
                                        }
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 11 }}
                                        dy={8}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 11 }}
                                        tickFormatter={(value) => `₹${value}`}
                                    />
                                    <RechartsTooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="revenue"
                                        fill="#D97706"
                                        radius={[6, 6, 0, 0]}
                                        cursor={timeRange === 'yearly' ? 'pointer' : 'default'}
                                    />
                                </BarChart>
                            ) : (
                                <AreaChart
                                    data={revenueData}
                                    onClick={(data) => {
                                        if (timeRange === 'yearly' && data && data.activePayload && data.activePayload[0]) {
                                            const item = data.activePayload[0].payload;
                                            if (item.monthIndex !== undefined) {
                                                setSelectedMonth(item.monthIndex);
                                                setTimeRange('monthly');
                                            }
                                        }
                                    }}
                                >
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#D97706" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#D97706" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 11 }}
                                        dy={8}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 11 }}
                                        tickFormatter={(value) => `₹${value}`}
                                    />
                                    <RechartsTooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#D97706"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                        cursor={timeRange === 'yearly' ? 'pointer' : 'default'}
                                    />
                                </AreaChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Order Status Chart */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700">
                                <FiPieChart size={16} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Order Status</h3>
                                <p className="text-[11px] text-gray-400">Fulfillment lifecycle breakdown</p>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full font-medium">
                            {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
                        </div>
                    </div>

                    <div className="h-[300px] w-full flex-1">
                        {statusData.length > 0 ? (
                            <ResponsiveContainer width="99%" aspect={2}>
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        itemStyle={{ color: '#374151', fontWeight: 600 }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        formatter={(value) => <span className="text-gray-600 font-medium ml-1">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400">
                                <div className="flex flex-col items-center gap-2">
                                    <FiPieChart size={24} className="opacity-50" />
                                    <p className="text-sm">No orders in this period</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Category Distribution Chart */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700">
                                <FiTag size={16} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Category Distribution</h3>
                                <p className="text-[11px] text-gray-400">Active catalog item allocation</p>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full font-medium">
                            {products.length} {products.length === 1 ? 'product' : 'products'}
                        </div>
                    </div>

                    <div className="h-[300px] w-full flex-1" style={{ minHeight: '300px' }}>
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="99%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={95}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        formatter={(value, name) => [`${value} ${value === 1 ? 'Product' : 'Products'}`, name]}
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
                                        itemStyle={{ color: '#1f2937', fontWeight: 600, fontSize: '13px' }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        iconType="circle"
                                        wrapperStyle={{ paddingTop: '8px' }}
                                        formatter={(value) => <span className="text-gray-700 text-xs font-semibold ml-1">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400">
                                <div className="flex flex-col items-center gap-2">
                                    <FiTag size={24} className="opacity-50" />
                                    <p className="text-sm">No category data available</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Top Selling Products */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700">
                                <FiBox size={16} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Top Selling Products</h3>
                                <p className="text-[11px] text-gray-400">Best performing gifts in this timeframe</p>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full font-medium">
                            {activeRangeLabel}
                        </div>
                    </div>
                    <div className="overflow-y-auto max-h-[300px] pr-2 flex-1">
                        {topProducts.length > 0 ? (
                            <div className="space-y-4">
                                {topProducts.map((product, index) => (
                                    <div key={index} className="flex items-center gap-4 p-3 rounded-xl border border-gray-200 hover:border-yellow-300 transition-colors">
                                        <div className="w-12 h-12 rounded-lg bg-gray-50 shrink-0 overflow-hidden border border-gray-200">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.src = 'https://placehold.co/48'; }}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-gray-900 truncate" title={product.name}>{product.name}</h4>
                                            <p className="text-sm text-gray-500">{product.count} sold</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-[#FF64B4]">₹{product.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-400">
                                <div className="flex flex-col items-center gap-2">
                                    <FiShoppingCart size={24} className="opacity-50" />
                                    <p className="text-sm">No sales in this period</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardCharts;
