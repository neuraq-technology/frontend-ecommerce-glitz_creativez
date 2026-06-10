import React, { useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import { FiTrendingUp, FiPieChart, FiBox, FiTag, FiShoppingCart } from 'react-icons/fi';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

const DashboardCharts = ({ orders = [], products = [] }) => {

    // --- 1. Revenue Chart Data (Last 7 Days) ---
    const revenueData = useMemo(() => {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        return last7Days.map(date => {
            const dayOrders = orders.filter(o => o.createdAt.startsWith(date));
            const dailyTotal = dayOrders.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
            return {
                date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                revenue: dailyTotal
            };
        });
    }, [orders]);

    // --- 2. Order Status Data ---
    const statusData = useMemo(() => {
        const statusCounts = orders.reduce((acc, order) => {
            const status = order.status || 'pending';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        return Object.keys(statusCounts).map(status => ({
            name: status.charAt(0).toUpperCase() + status.slice(1),
            value: statusCounts[status]
        }));
    }, [orders]);

    // --- 3. Top Selling Products ---
    const topProducts = useMemo(() => {
        const productStats = {};
        orders.forEach(order => {
            order.orderItems?.forEach(item => {
                const id = item.product || item._id; // best effort id
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
                productStats[id].revenue += qty * item.price;
            });
        });
        return Object.values(productStats)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
    }, [orders]);

    // --- 4. Category Distribution ---
    const categoryData = useMemo(() => {
        const counts = products.reduce((acc, p) => {
            const cat = p.category || 'Uncategorized';
            acc[cat] = (acc[cat] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [products]);

    // Custom Tooltip for Area Chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-100 shadow-gold rounded-xl">
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    <p className="text-sm text-primary-600 font-bold">
                        ${payload[0].value.toFixed(2)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue Chart */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                            <FiTrendingUp />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Revenue Trend</h3>
                    </div>
                    <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full font-medium">
                        Last 7 Days
                    </div>
                </div>

                <div className="h-[300px] w-full" style={{ minHeight: '300px' }}>
                    <ResponsiveContainer width="99%" height={300}>
                        <AreaChart data={revenueData}>
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
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#D97706"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Order Status Chart */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <FiPieChart />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Order Status</h3>
                    </div>
                </div>

                <div className="h-[300px] w-full">
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
                                <p>No order data available</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Category Distribution Chart */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                            <FiTag />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Category Distribution</h3>
                    </div>
                </div>

                <div className="h-[300px] w-full" style={{ minHeight: '300px' }}>
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="99%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
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
                                <FiTag size={24} className="opacity-50" />
                                <p>No category data available</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Top Selling Products */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                            <FiBox />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Top Selling Products</h3>
                    </div>
                </div>
                <div className="overflow-y-auto max-h-[300px] pr-2">
                    {topProducts.length > 0 ? (
                        <div className="space-y-4">
                            {topProducts.map((product, index) => (
                                <div key={index} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-yellow-200 transition-colors">
                                    <div className="w-12 h-12 rounded-lg bg-gray-50 shrink-0 overflow-hidden border border-gray-100">
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
                                        <p className="font-bold text-primary-600">${product.revenue.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-400">
                            <div className="flex flex-col items-center gap-2">
                                <FiShoppingCart size={24} className="opacity-50" />
                                <p>No sales data available</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardCharts;
