// src/components/admin/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { toast } from "react-hot-toast";
import useAuth from "../../hooks/useAuth";

// Custom Food-Themed SVG Icons
const UsersIcon = ({ className = "h-6 w-6" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
    />
  </svg>
);

const CurrencyRupeeIcon = ({ className = "h-6 w-6" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
    />
  </svg>
);

const RestaurantIcon = ({ className = "h-6 w-6" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21L6 12l4 8 2.6-1.174a1 1 0 01.8-.019l2.86 1.338a1 1 0 01.516.888V21a1 1 0 01-1 1H5a2 2 0 01-2-2V5z"
    />
  </svg>
);

const ChefHatIcon = ({ className = "h-6 w-6" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 14V6a7 7 0 00-14 0v8M5 14v4a3 3 0 003 3h8a3 3 0 003-3v-4M9 7h6M8 11h8"
    />
  </svg>
);

const ArrowTrendingUpIcon = ({ className = "h-4 w-4" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
    />
  </svg>
);

const ExclamationTriangleIcon = ({ className = "h-5 w-5" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
    />
  </svg>
);

const ClockIcon = ({ className = "h-5 w-5" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const ChartBarIcon = ({ className = "h-6 w-6" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504-1.125-1.125-1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504-1.125-1.125-1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
    />
  </svg>
);

const SunIcon = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const MoonIcon = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
  </svg>
);

const RefreshIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false); // Force light mode
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

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("theme", newDarkMode ? "dark" : "light");
  };

  const fetchDashboardData = async (isRefresh = false) => {
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
      ]);

      const [statsResponse, activityResponse, alertsResponse, chartsResponse] =
        results;

      setDashboardData({
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
                  message: "Rice quantity is running low in kitchen inventory",
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
      });

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
  };

  const quickStats = [
    {
      title: "Total Users",
      value: dashboardData.stats.totalUsers || 0,
      change: dashboardData.stats.userGrowth || 0,
      icon: UsersIcon,
      color: "bg-blue-100 text-blue-600",
      textColor: "text-blue-600",
      prefix: "",
    },
    {
      title: "Today's Revenue",
      value: dashboardData.stats.todayRevenue || 0,
      change: dashboardData.stats.revenueGrowth || 0,
      icon: CurrencyRupeeIcon,
      color: "bg-green-100 text-green-600",
      textColor: "text-green-600",
      prefix: "₹",
    },
    {
      title: "Meals Served",
      value: dashboardData.stats.mealsServed || 0,
      change: dashboardData.stats.mealGrowth || 0,
      icon: RestaurantIcon,
      color: "bg-purple-100 text-purple-600",
      textColor: "text-purple-600",
      prefix: "",
    },
    {
      title: "Active Bookings",
      value: dashboardData.stats.activeBookings || 0,
      change: dashboardData.stats.bookingGrowth || 0,
      icon: ChefHatIcon,
      color: "bg-teal-100 text-teal-600",
      textColor: "text-teal-600",
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

  const getChangeIcon = (change) => {
    if (change > 0)
      return (
        <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      );
    if (change < 0)
      return (
        <ArrowTrendingUpIcon className="h-4 w-4 text-red-600 dark:text-red-400 rotate-180" />
      );
    return null;
  };

  const getChangeColor = (change) => {
    if (change > 0) return "text-emerald-600 dark:text-emerald-400";
    if (change < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case "warning":
        return (
          <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        );
      case "error":
        return (
          <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
        );
      default:
        return (
          <ClockIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        );
    }
  };

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
            <ChartBarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
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
              <motion.div
                whileHover={{ rotate: 10, scale: 1.05 }}
                className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg"
              >
                <ChefHatIcon className="w-8 h-8 text-orange-500" />
              </motion.div>
              <div>
                <motion.h1
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-bold text-gray-900"
                >
                  {getGreeting()}, {user?.name}!
                  <motion.span
                    animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                    className="inline-block ml-2"
                  >
                    👋
                  </motion.span>
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
                <SunIcon className="text-yellow-500" />
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
                  <RefreshIcon />
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
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: index * 0.1,
                type: "spring",
                stiffness: 100,
              }}
              className={`rounded-lg shadow-md p-6 ${stat.color}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-full bg-white shadow-md">
                  <stat.icon className="h-6 w-6" />
                </div>
                {stat.change !== 0 && (
                  <div className="flex items-center space-x-1">
                    <span className={`text-sm font-bold ${stat.textColor}`}>
                      {Math.abs(stat.change)}%
                    </span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
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
                  <ClockIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
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
                icon: UsersIcon,
                path: "/admin/users",
                color: "from-orange-500 to-amber-500",
              },
              {
                title: "Menu Management",
                icon: RestaurantIcon,
                path: "/admin/menu",
                color: "from-emerald-500 to-green-500",
              },
              {
                title: "View Reports",
                icon: ChartBarIcon,
                path: "/admin/reports",
                color: "from-purple-500 to-violet-500",
              },
              {
                title: "System Settings",
                icon: ChefHatIcon,
                path: "/admin/settings",
                color: "from-blue-500 to-cyan-500",
              },
            ].map((action, index) => (
              <button
                key={action.title}
                onClick={() => navigate(action.path)}
                className={`group p-6 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 shadow-md`}
              >
                <div className="w-12 h-12 mx-auto mb-4 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <action.icon className="h-7 w-7 text-gray-800" />
                </div>
                <p className="font-semibold text-sm text-gray-900">
                  {action.title}
                </p>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
