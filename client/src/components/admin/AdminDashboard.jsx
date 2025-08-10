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
      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
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
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return (
      saved === "dark" ||
      (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });
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
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

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
      color: "from-orange-400 to-amber-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      textColor: "text-orange-600 dark:text-orange-400",
      prefix: "",
    },
    {
      title: "Today's Revenue",
      value: dashboardData.stats.todayRevenue || 0,
      change: dashboardData.stats.revenueGrowth || 0,
      icon: CurrencyRupeeIcon,
      color: "from-emerald-400 to-green-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      textColor: "text-emerald-600 dark:text-emerald-400",
      prefix: "₹",
    },
    {
      title: "Meals Served",
      value: dashboardData.stats.mealsServed || 0,
      change: dashboardData.stats.mealGrowth || 0,
      icon: RestaurantIcon,
      color: "from-purple-400 to-violet-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
      prefix: "",
    },
    {
      title: "Active Bookings",
      value: dashboardData.stats.activeBookings || 0,
      change: dashboardData.stats.bookingGrowth || 0,
      icon: ChefHatIcon,
      color: "from-blue-400 to-cyan-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
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
        return "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800";
      case "error":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      default:
        return "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";
    }
  };

  // Enhanced SVG Chart Component with Food Theme
  const SimpleChart = ({ data, labels, title, color = "#FB923C" }) => {
    if (!data || data.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <ChartBarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">
              No data available
            </p>
          </motion.div>
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
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          {title}
        </h3>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
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
              <motion.line
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                x1={padding}
                y1={height - padding - ratio * chartHeight}
                x2={width - padding}
                y2={height - padding - ratio * chartHeight}
                stroke={darkMode ? "#374151" : "#E5E7EB"}
                strokeWidth="1"
              />
            ))}

            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              d={`M ${points.split(" ").join(" L ")}`}
              fill={`url(#gradient-${title})`}
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
                <motion.circle
                  key={index}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                  whileHover={{ scale: 1.2 }}
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
                <motion.text
                  key={index}
                  initial={{ y: height + 10, opacity: 0 }}
                  animate={{ y: height - 10, opacity: 1 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                  x={x}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="500"
                  fill={darkMode ? "#9CA3AF" : "#6B7280"}
                >
                  {label}
                </motion.text>
              );
            })}
          </svg>
        </motion.div>
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
    <div
      className={`min-h-screen bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 transition-all duration-700 ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.05 }}
                className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 dark:from-orange-500 dark:to-amber-600 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <ChefHatIcon className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <motion.h1
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent"
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
                  className="text-gray-600 dark:text-gray-300 text-lg mt-1"
                >
                  Welcome to your MessMate dashboard overview for {timeRange}
                </motion.p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleDarkMode}
                className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-200 dark:border-gray-700"
              >
                <AnimatePresence mode="wait">
                  {darkMode ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -180, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 180, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <SunIcon className="text-yellow-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 180, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -180, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MoonIcon className="text-gray-700" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-3 border-2 border-orange-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 dark:focus:border-orange-400 transition-all duration-300"
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
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2"
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

        {/* Enhanced Quick Stats */}
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
              whileHover={{
                y: -4,
                transition: { type: "spring", stiffness: 400, damping: 10 },
              }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl border border-orange-100 dark:border-gray-700 p-6 transition-all duration-500 group"
            >
              <div className="flex items-center justify-between mb-4">
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg group-hover:shadow-xl transition-all duration-300`}
                >
                  <stat.icon className="h-7 w-7 text-white" />
                </motion.div>
                {stat.change !== 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                    className="flex items-center space-x-1"
                  >
                    <motion.div
                      animate={{ y: stat.change > 0 ? [-2, 0, -2] : [2, 0, 2] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {getChangeIcon(stat.change)}
                    </motion.div>
                    <span
                      className={`text-sm font-bold ${getChangeColor(
                        stat.change
                      )}`}
                    >
                      {Math.abs(stat.change)}%
                    </span>
                  </motion.div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {stat.title}
                </p>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="text-3xl font-bold text-gray-900 dark:text-white"
                >
                  {stat.prefix}
                  {formatNumber(stat.value)}
                </motion.p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                  vs previous {timeRange}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Alerts */}
        <AnimatePresence>
          {dashboardData.alerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-orange-100 dark:border-gray-700 p-6">
                <motion.h2
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center"
                >
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 animate-pulse"></div>
                  System Alerts
                </motion.h2>
                <div className="space-y-4">
                  {dashboardData.alerts.map((alert, index) => (
                    <motion.div
                      key={alert._id}
                      initial={{ opacity: 0, x: -20, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className={`p-5 rounded-xl border-2 ${getAlertColor(
                        alert.type
                      )} transition-all duration-300 hover:shadow-lg`}
                    >
                      <div className="flex items-start">
                        <motion.div
                          whileHover={{ rotate: 15 }}
                          className="mr-4 mt-1"
                        >
                          {getAlertIcon(alert.type)}
                        </motion.div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {alert.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            {alert.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {new Date(alert.createdAt).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-orange-100 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-6 border-b border-orange-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
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
                      className="flex items-start space-x-4 p-4 hover:bg-orange-50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-300 cursor-pointer group"
                    >
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        className="w-3 h-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mt-2 flex-shrink-0 group-hover:shadow-lg transition-all duration-300"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white font-medium leading-relaxed">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
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
                  className="text-center py-12 text-gray-500 dark:text-gray-400"
                >
                  <ClockIcon className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
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
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-orange-100 dark:border-gray-700"
          >
            <div className="p-6 border-b border-orange-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
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
                  color="#FB923C"
                />
              ) : (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-16 text-gray-500 dark:text-gray-400"
                >
                  <ChartBarIcon className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="font-medium">No chart data available</p>
                  <p className="text-sm mt-1">
                    Revenue data will be displayed here
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Enhanced Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-orange-100 dark:border-gray-700 p-8"
        >
          <motion.h2
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl font-bold text-gray-900 dark:text-white mb-8 flex items-center"
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
              <motion.button
                key={action.title}
                initial={{ opacity: 0, scale: 0.8, rotateY: -180 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{
                  delay: 0.7 + index * 0.1,
                  type: "spring",
                  stiffness: 100,
                  damping: 12,
                }}
                whileHover={{
                  scale: 1.05,
                  y: -8,
                  transition: { type: "spring", stiffness: 400, damping: 10 },
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(action.path)}
                className={`group p-6 rounded-2xl bg-gradient-to-br ${action.color} text-white shadow-lg hover:shadow-2xl transition-all duration-500 transform perspective-1000`}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-12 h-12 mx-auto mb-4 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm"
                >
                  <action.icon className="h-7 w-7" />
                </motion.div>
                <p className="font-semibold text-sm group-hover:text-opacity-90 transition-all duration-300">
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
