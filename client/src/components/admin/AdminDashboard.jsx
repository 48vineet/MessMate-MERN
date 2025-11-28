// src/components/admin/AdminDashboard.jsx
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import api from "../../utils/api";
import Icons from "../common/Icons";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // Light mode enforced; dark mode state removed
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    recentActivity: [],
    alerts: [],
    charts: {},
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("today");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.documentElement.classList.remove("dark"); // Ensure light mode
  }, []);

  const fetchDashboardData = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const results = await Promise.allSettled([
          api.get(`/analytics/stats?range=${timeRange}`),
          api.get("/analytics/recent-activity"),
          api.get("/analytics/alerts"),
          api.get(`/analytics/charts?range=${timeRange}`),
          api.get("/wallet/details"),
          api.get("/payments/history?limit=5"),
        ]);

        const [
          statsResponse,
          activityResponse,
          alertsResponse,
          chartsResponse,
          walletResponse,
          paymentsResponse,
        ] = results;

        setDashboardData((prev) => ({
          stats:
            statsResponse.status === "fulfilled"
              ? statsResponse.value.data.stats || {}
              : {
                  totalUsers: 1247,
                  userGrowth: 12.5,
                  todayRevenue: 45230,
                  revenueGrowth: 8.2,
                  mealsServed: 2840,
                  mealGrowth: 15.3,
                  activeBookings: 156,
                  bookingGrowth: -2.1,
                },
          recentActivity:
            activityResponse.status === "fulfilled"
              ? activityResponse.value.data.activities || []
              : [
                  {
                    _id: "1",
                    message: "New user registered: John Doe",
                    timestamp: new Date().toISOString(),
                  },
                  {
                    _id: "2",
                    message: "Order #1234 completed successfully",
                    timestamp: new Date(Date.now() - 300000).toISOString(),
                  },
                  {
                    _id: "3",
                    message: "Menu updated: Added 3 new items",
                    timestamp: new Date(Date.now() - 600000).toISOString(),
                  },
                ],
          alerts:
            alertsResponse.status === "fulfilled"
              ? alertsResponse.value.data.alerts || []
              : [
                  {
                    _id: "1",
                    type: "warning",
                    title: "Low Stock Alert",
                    message:
                      "Rice quantity is running low in kitchen inventory",
                    createdAt: new Date().toISOString(),
                  },
                ],
          charts:
            chartsResponse.status === "fulfilled"
              ? chartsResponse.value.data.charts || {}
              : {
                  revenue: {
                    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                    data: [12000, 15000, 18000, 14000, 22000, 25000, 28000],
                  },
                  bookings: {
                    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                    data: [45, 52, 48, 61, 55, 67, 73],
                  },
                },
          wallet:
            walletResponse.status === "fulfilled"
              ? walletResponse.value.data.wallet || {}
              : prev.wallet || {},
          recentTransactions:
            paymentsResponse.status === "fulfilled"
              ? paymentsResponse.value.data.transactions || []
              : prev.recentTransactions || [],
        }));

        if (
          !isRefresh &&
          results.every((result) => result.status === "fulfilled")
        ) {
          console.log("Dashboard data loaded successfully");
        }
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [timeRange]
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh dashboard data every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Dark mode toggle intentionally unused; dashboard enforces light mode

  const quickStats = [
    {
      title: "Total Users",
      value: dashboardData.stats.totalUsers || 0,
      change: dashboardData.stats.userGrowth || 0,
      icon: Icons.users,
      bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50",
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
      textColor: "text-blue-600",
      prefix: "",
    },
    {
      title: "Available Balance",
      value: dashboardData.wallet?.balance ?? 0,
      change: dashboardData.wallet?.monthChangePercent ?? 0,
      icon: Icons.wallet,
      bgColor: "bg-gradient-to-br from-emerald-50 to-teal-50",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
      textColor: "text-emerald-600",
      prefix: "₹",
    },
    {
      title: "Meals Served",
      value: dashboardData.stats.mealsServed || 0,
      change: dashboardData.stats.mealGrowth || 0,
      icon: Icons.dining,
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
      iconBg: "bg-gradient-to-br from-purple-500 to-pink-600",
      textColor: "text-purple-600",
      prefix: "",
    },
    {
      title: "Active Bookings",
      value: dashboardData.stats.activeBookings || 0,
      change: dashboardData.stats.bookingGrowth || 0,
      icon: Icons.calendarCheck,
      bgColor: "bg-gradient-to-br from-orange-50 to-amber-50",
      iconBg: "bg-gradient-to-br from-orange-500 to-amber-600",
      textColor: "text-orange-600",
      prefix: "",
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  // Removed unused change/alert icon helpers to satisfy lint

  const getAlertColor = (type) => {
    switch (type) {
      case "warning":
        return "bg-yellow-100 border-yellow-300 text-yellow-600";
      case "error":
        return "bg-red-100 border-red-300 text-red-600";
      default:
        return "bg-gray-100 border-gray-300 text-gray-600";
    }
  };

  // Enhanced SVG Chart Component with Food Theme
  const SimpleChart = ({ data, labels, title, color = "#3B82F6" }) => {
    if (!data || data.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <Icons.barChart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No data available</p>
          </div>
        </div>
      );
    }

    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue || 1;

    const width = 600;
    const height = 200;
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    const points = data
      .map((value, index) => {
        const x = padding + (index / (data.length - 1)) * chartWidth;
        const y = height - padding - ((value - minValue) / range) * chartHeight;
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <div className="w-full">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
        >
          <defs>
            <linearGradient
              id={`gradient-${title}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop
                offset="0%"
                style={{ stopColor: color, stopOpacity: 0.3 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: color, stopOpacity: 0.1 }}
              />
            </linearGradient>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <line
              key={i}
              x1={padding}
              y1={height - padding - ratio * chartHeight}
              x2={width - padding}
              y2={height - padding - ratio * chartHeight}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          ))}

          <path
            d={`M ${points.split(" ").join(" L ")}`}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {data.map((value, index) => {
            const x = padding + (index / (data.length - 1)) * chartWidth;
            const y =
              height - padding - ((value - minValue) / range) * chartHeight;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="5"
                fill={color}
                stroke="white"
                strokeWidth="3"
                className="cursor-pointer drop-shadow-sm"
              />
            );
          })}

          {labels.map((label, index) => {
            const x = padding + (index / (labels.length - 1)) * chartWidth;
            return (
              <text
                key={index}
                x={x}
                textAnchor="middle"
                fontSize="12"
                fontWeight="500"
                fill="#6B7280"
              >
                {label}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 transition-all duration-700">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gradient-to-r from-orange-200 to-amber-200 dark:from-gray-700 dark:to-gray-600 rounded-xl w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="h-36 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl"
                />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl"></div>
              <div className="h-96 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 transition-all duration-700">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <motion.h1
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-bold text-gray-900 flex items-center gap-3"
                >
                  {getGreeting()}, {user?.name}!
                </motion.h1>
                <motion.p
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-600 text-lg mt-1"
                >
                  Welcome to your MessMate dashboard overview for {timeRange}
                </motion.p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200"
              >
                <Icons.sun className="h-5 w-5 text-yellow-500" />
              </motion.button>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchDashboardData(true)}
                disabled={refreshing}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2"
              >
                <motion.div
                  animate={refreshing ? { rotate: 360 } : {}}
                  transition={{
                    duration: 1,
                    repeat: refreshing ? Infinity : 0,
                    ease: "linear",
                  }}
                >
                  <Icons.refresh className="w-4 h-4" />
                </motion.div>
                <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.1,
              }}
              className={`rounded-2xl shadow-md p-6 ${stat.bgColor} border border-gray-100 hover:shadow-lg transition-shadow duration-200`}
            >
              <div className="flex items-center justify-between mb-5">
                <div
                  className={`w-12 h-12 rounded-xl ${stat.iconBg} shadow-sm flex items-center justify-center`}
                >
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                {stat.change !== 0 && (
                  <div
                    className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${
                      stat.change > 0 ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    <Icons.trendingUp
                      className={`h-4 w-4 ${
                        stat.change > 0
                          ? "text-green-600"
                          : "text-red-600 rotate-180"
                      }`}
                    />
                    <span
                      className={`text-xs font-bold ${
                        stat.change > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {Math.abs(stat.change)}%
                    </span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">
                  {stat.title}
                </p>
                <p className={`text-3xl font-bold ${stat.textColor}`}>
                  {stat.prefix}
                  {formatNumber(stat.value)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Alerts */}
        {dashboardData.alerts.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                System Alerts
              </h2>
              <div className="space-y-4">
                {dashboardData.alerts.map((alert) => (
                  <div
                    key={alert._id}
                    className={`p-4 rounded-lg border ${getAlertColor(
                      alert.type
                    )}`}
                  >
                    <h4 className="font-semibold">{alert.title}</h4>
                    <p className="text-sm">{alert.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 animate-pulse"></div>
                Recent Activity
              </h2>
            </div>
            <div className="p-6">
              {dashboardData.recentActivity.length > 0 ? (
                <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
                  {dashboardData.recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{
                        x: 4,
                        transition: { type: "spring", stiffness: 400 },
                      }}
                      className="flex items-start space-x-4 p-4 hover:bg-gray-100 rounded-xl transition-all duration-300 cursor-pointer group"
                    >
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        className="w-3 h-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mt-2 flex-shrink-0 group-hover:shadow-lg transition-all duration-300"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 font-medium leading-relaxed">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2 font-medium">
                          {new Date(activity.timestamp).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-12 text-gray-500"
                >
                  <Icons.clock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium">No recent activity</p>
                  <p className="text-sm mt-1">
                    Activity will appear here as it happens
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-md border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 animate-pulse"></div>
                Revenue Trends
              </h2>
            </div>
            <div className="p-6">
              {dashboardData.charts.revenue ? (
                <SimpleChart
                  data={dashboardData.charts.revenue.data}
                  labels={dashboardData.charts.revenue.labels}
                  title="Revenue Over Time"
                  color="#3B82F6"
                />
              ) : (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-16 text-gray-500"
                >
                  <ChartBarIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium">No chart data available</p>
                  <p className="text-sm mt-1">
                    Revenue data will be displayed here
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Wallet Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Icons.wallet className="h-6 w-6 text-emerald-600 mr-2" />
              MessMate Wallet
            </h2>
            <button
              onClick={() => navigate("/wallet")}
              className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1">
              <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                <p className="text-sm font-semibold text-emerald-700">
                  Available Balance
                </p>
                <p className="text-3xl font-bold text-emerald-700 mt-2">
                  ₹{formatNumber(dashboardData.wallet?.balance ?? 0)}
                </p>
                {dashboardData.wallet?.monthSpent != null && (
                  <p className="text-sm text-emerald-600 mt-2">
                    This Month: ₹{formatNumber(dashboardData.wallet.monthSpent)}{" "}
                    spent
                  </p>
                )}
                <div className="mt-4">
                  <button
                    onClick={() => navigate("/wallet")}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium"
                  >
                    Add Money
                  </button>
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Icons.clock className="h-4 w-4 text-gray-500 mr-2" />
                Recent Transactions
              </h3>
              {dashboardData.recentTransactions &&
              dashboardData.recentTransactions.length > 0 ? (
                <div className="space-y-3 max-h-56 overflow-y-auto custom-scrollbar">
                  {dashboardData.recentTransactions.map((tx) => (
                    <div
                      key={tx._id}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        {tx.type === "credit" ? (
                          <Icons.arrowDownRight className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <Icons.arrowUpRight className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {tx.description ||
                              (tx.type === "credit"
                                ? "Wallet recharge"
                                : "Debit")}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(
                              tx.createdAt || tx.timestamp
                            ).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`text-sm font-bold ${
                          tx.type === "credit"
                            ? "text-emerald-700"
                            : "text-red-700"
                        }`}
                      >
                        {tx.type === "credit" ? "+" : "-"}₹
                        {formatNumber(Math.abs(tx.amount ?? tx.total ?? 0))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  No recent transactions
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-md border border-gray-200 p-8"
        >
          <motion.h2
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl font-bold text-gray-800 mb-8 flex items-center"
          >
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 animate-pulse"></div>
            Quick Actions
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                title: "Manage Users",
                icon: Icons.users,
                path: "/admin/users",
                color: "from-blue-500 to-indigo-500",
                bgColor: "bg-blue-50",
                iconColor: "text-blue-600",
              },
              {
                title: "Menu Management",
                icon: Icons.menu,
                path: "/admin/menu",
                color: "from-emerald-500 to-teal-500",
                bgColor: "bg-emerald-50",
                iconColor: "text-emerald-600",
              },
              {
                title: "View Reports",
                icon: Icons.report,
                path: "/admin/reports",
                color: "from-purple-500 to-pink-500",
                bgColor: "bg-purple-50",
                iconColor: "text-purple-600",
              },
              {
                title: "System Settings",
                icon: Icons.settings,
                path: "/admin/settings",
                color: "from-orange-500 to-red-500",
                bgColor: "bg-orange-50",
                iconColor: "text-orange-600",
              },
            ].map((action, index) => (
              <motion.button
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(action.path)}
                className={`group p-6 rounded-2xl ${action.bgColor} hover:shadow-xl transition-all duration-300`}
              >
                <div
                  className={`w-14 h-14 mx-auto mb-4 bg-white rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300`}
                >
                  <action.icon className={`h-8 w-8 ${action.iconColor}`} />
                </div>
                <p className="font-semibold text-sm text-gray-900">
                  {action.title}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
